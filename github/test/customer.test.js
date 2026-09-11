"use strict";
const { test } = require("node:test"),
  a = require("node:assert/strict"),
  http = require("node:http"),
  fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path");
const { Store } = require("../../factory/store"),
  { ProofService } = require("../service"),
  { Customers } = require("../customer"),
  { Client } = require("../client"),
  { handle } = require("../http"),
  { fixtureFetch } = require("./fixtures");
test("customer OAuth login, authorized repository, receipt, free meter, private access and logout HTTP journey", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mp-customer-")),
    store = new Store(root);
  let removed = false,
    privateRepo = false;
  const service = new ProofService({
    store,
    config: {
      hosted: true,
      appId: 42,
      clientId: "test",
      clientSecret: "fixture",
    },
    clientFactory: ({ token } = {}) =>
      new Client({ ...fixtureFetch({ privateRepo }), token }),
    appClient: async () => new Client(fixtureFetch({ privateRepo })),
  });
  service.customers = new Customers(service, {
    fetchImpl: async (url) => {
      const p = new URL(url).pathname;
      let data =
        p === "/login/oauth/access_token"
          ? { access_token: "fixture-user-token", expires_in: 3600 }
          : p === "/user"
            ? { id: 9 }
            : p === "/user/installations"
              ? {
                  total_count: 1,
                  installations: removed
                    ? []
                    : [
                        {
                          id: 2,
                          app_id: 42,
                          account: { id: 9, type: "User", login: "owner" },
                        },
                      ],
                }
              : {
                  total_count: 1,
                  repositories: [{ id: 1, full_name: "fixture/public" }],
                };
      return new Response(JSON.stringify(data));
    },
  });
  const server = http.createServer((req, res) =>
    handle(service, req, res, new URL(req.url, service.config.origin)),
  );
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  service.config.origin = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise((r) => server.close(r));
    store.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const origin = service.config.origin;
  const login = await fetch(origin + "/proof/login?source=x", { redirect: "manual" });
  a.equal(login.status, 302);
  const state = new URL(login.headers.get("location")).searchParams.get(
    "state",
  );
  const callback = await fetch(
    origin + "/proof/callback?code=fixture&state=" + state,
    {
      redirect: "manual",
      headers: { cookie: login.headers.get("set-cookie").split(";")[0] },
    },
  );
  a.equal(callback.status, 303);
  const cookie = callback.headers.get("set-cookie").split(";")[0];
  const request = (p, body, withAuth = true) =>
    fetch(origin + p, {
      headers: {
        ...(withAuth ? { cookie } : {}),
        origin,
        "Content-Type": "application/json",
      },
      ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
    });
  a.equal((await request("/proof/installations")).status, 200);
  a.equal((await request("/proof/repositories?installation=999")).status, 403);
  const response = await request("/proof/run", {
    installation: 2,
    repository: 1,
    pr: 1,
  });
  a.equal(response.status, 201);
  const out = await response.json();
  a.equal(service.meter.usage(2).used, 1);
  a.deepEqual(store.data.acquisition, {x: {github_connected: 1, installation_available: 1, receipt_returned: 1}});
  await request("/proof/installations");
  a.equal(store.data.acquisition.x.installation_available, 1);
  a.equal((await request(out.url, false, false)).status, 403);
  a.equal((await request(out.url)).status, 200);
  a.equal((await request(out.url + "/refresh", {})).status, 200);
  privateRepo = true;
  a.equal((await request(out.url)).status, 200);
  a.equal((await request(out.url, false, false)).status, 403);
  removed = true;
  a.equal((await request(out.url)).status, 403);
  removed = false;
  service.scanBusy = true;
  a.equal((await (await request("/proof/scan", {installation: 2, repository: 1})).json()).error,
    "SCAN_BUSY");
  service.scanBusy = false;
  a.equal((await (await request("/proof/scan/cancel", {installation: 2, repository: 1})).json()).error,
    "SCAN_REPOSITORY_MISMATCH");
  a.equal((await request("/proof/logout", {})).status, 200);
  a.equal((await request(out.url)).status, 403);
});
test("OAuth state is cookie-bound, expires, and cannot be replayed", async () => {
  const service = {
      config: {
        origin: "https://example.test",
        clientId: "x",
        clientSecret: "y",
      },
    },
    c = new Customers(service, {
      fetchImpl: async () =>
        new Response(JSON.stringify({ access_token: "fixture", id: 1 })),
    });
  const start = c.start(),
    url = new URL(
      "https://example.test/proof/callback?code=x&state=" +
        new URL(start.url).searchParams.get("state"),
    );
  await a.rejects(c.callback({ headers: {} }, url), /LOGIN_STATE_INVALID/);
  const req = { headers: { cookie: start.cookie.split(";")[0] } };
  await c.callback(req, url);
  await a.rejects(c.callback(req, url), /LOGIN_STATE_INVALID/);
});
test('acquisition is coarse, bounded, deduplicated per session and excludes arbitrary input', () => {
  const service={config:{clientId:'x',clientSecret:'y',origin:'https://example.test'},store:{data:{}},save(){}};
  const c=new Customers(service);
  for(const source of ['x','other','direct','user@example.com?click_id=secret']) {
    const login=c.start(source);
    const state=new URL(login.url).searchParams.get('state');
    const stored=c.states.get(require('node:crypto').createHash('sha256').update(state).digest('hex'));
    a.equal(stored.source, ['x','other'].includes(source)?source:'direct');
    const session={acquisitionSource:stored.source};
    for(const stage of ['github_connected','installation_available','receipt_returned','invalid']) {
      c.acquisition(session,stage);c.acquisition(session,stage);
    }
  }
  a.deepEqual(service.store.data.acquisition,{x:{github_connected:1,installation_available:1,receipt_returned:1},other:{github_connected:1,installation_available:1,receipt_returned:1},direct:{github_connected:2,installation_available:2,receipt_returned:2}});
  a.doesNotMatch(JSON.stringify(service.store.data), /secret|example|click_id/);
});
