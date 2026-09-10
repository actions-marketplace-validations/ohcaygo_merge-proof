"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const { createServer } = require("../server");

test("authenticated proxy preserves per-client eligibility limits and rejects direct forwarding", async (t) => {
  const config = {retireLegacyOffer:false, origin: "https://merge-proof.ohcaygo.com", proxySecret: "fixture-proxy-key"};
  const server = createServer({config, eligible: async () => ({eligible: true})});
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/eligibility`;
  const post = (key, ip) => fetch(url, {method: "POST", headers: {
    "content-type": "application/json", origin: config.origin,
    "x-mp-proxy-key": key, "x-mp-client-ip": ip,
  }, body: "{}"});
  a.equal((await post("wrong", "192.0.2.1")).status, 403);
  a.equal((await post(config.proxySecret, "invalid")).status, 400);
  for (let i = 0; i < 6; i++) a.equal((await post(config.proxySecret, "192.0.2.1")).status, 200);
  a.equal((await post(config.proxySecret, "192.0.2.1")).status, 429);
  a.equal((await post(config.proxySecret, "192.0.2.2")).status, 200);
});

test("Pages proxy preserves webhook bytes, origin, cookie and protected response without exposing its key", async (t) => {
  const { default: worker } = await import("../deploy/pages-worker.mjs");
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  let called = false;
  const raw = '{"id":"fixture", "spacing":true}';
  global.fetch = async (url, opts) => {
    called = true;
    a.equal(url, "https://192.0.2.10/webhooks/stripe");
    a.equal(opts.headers.get("x-mp-proxy-key"), "server-secret");
    a.equal(opts.headers.get("x-mp-client-ip"), "192.0.2.7");
    a.equal(opts.headers.get("stripe-signature"), "fixture-signature");
    a.equal(opts.headers.get("origin"), "https://merge-proof.ohcaygo.com");
    a.equal(opts.headers.get("cookie"), "mp_access=fixture");
    a.equal(await new Response(opts.body).text(), raw);
    a.equal(opts.redirect, "manual");
    return new Response("ok", {headers: {"set-cookie": "mp_access=fixture; Secure; HttpOnly"}});
  };
  const response = await worker.fetch(new Request("https://merge-proof.ohcaygo.com/webhooks/stripe", {
    method: "POST", body: raw, headers: {"CF-Connecting-IP": "192.0.2.7",
      "x-mp-client-ip": "192.0.2.99", "x-mp-proxy-key": "untrusted",
      "stripe-signature": "fixture-signature", "origin": "https://merge-proof.ohcaygo.com",
      "cookie": "mp_access=fixture"},
  }), {FACTORY_BACKEND: "https://192.0.2.10", FACTORY_PROXY_SECRET: "server-secret"});
  a.equal(called, true);
  a.equal(response.headers.get("cache-control"), "no-store");
  a.match(response.headers.get("set-cookie"), /HttpOnly/);
  a.equal(response.headers.has("x-mp-proxy-key"), false);
  a.equal((await worker.fetch(new Request("https://preview.pages.dev/api/offer"), {
    FACTORY_BACKEND: "https://192.0.2.10", FACTORY_PROXY_SECRET: "server-secret",
  })).status, 404);
  a.equal((await worker.fetch(new Request("https://merge-proof.ohcaygo.com/api/offer"), {})).status, 503);
});
