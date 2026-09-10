"use strict";
const { test } = require("node:test"),
  a = require("node:assert/strict");
const { createServer } = require("../server");
test("new visitors see Pro, retired checkout fails closed, historical access still routes", async (t) => {
  let oldCalls = 0;
  const config = { origin: "http://127.0.0.1" };
  const factory = {
    config,
    stripe: {
      offer() {
        oldCalls++;
      },
    },
    eligible() {
      oldCalls++;
    },
    checkout() {
      oldCalls++;
    },
    auth() {
      return { id: "historical" };
    },
    public(o) {
      return o;
    },
  };
  const server = createServer(factory);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  config.origin = `http://127.0.0.1:${server.address().port}`;
  const root = await (await fetch(config.origin)).text();
  a.match(root, /\$29\/month/);
  a.doesNotMatch(root, /\$5,000|Loading Stripe/);
  const offer = await (await fetch(config.origin + "/api/offer")).json();
  a.equal(offer.available, false);
  a.equal(offer.freeProofs, 5);
  for (const path of ["eligibility", "checkout"]) {
    const r = await fetch(config.origin + "/api/" + path, {
      method: "POST",
      headers: { origin: config.origin, "Content-Type": "application/json" },
      body: "{}",
    });
    a.equal(r.status, 410);
  }
  a.equal(oldCalls, 0);
  a.equal((await fetch(config.origin + "/legacy")).status, 200);
  a.equal(
    (await (await fetch(config.origin + "/api/order")).json()).id,
    "historical",
  );
});
