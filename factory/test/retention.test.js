"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Store } = require("../store");
const { Factory } = require("../service");
const { generate } = require("../report");
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mp-retention-"));
  const store = new Store(root);
  const service = new Factory({
    store,
    config: {},
    github: { scope: async () => ({ repo: "fixture/public", repoId: 1 }) },
    runner: { run: async () => ({ verdict: "VERIFIED" }) },
  });
  t.after(() => {
    store.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { root, store, service };
}
function expired(id, state = "RETRY", runs = []) {
  return {
    id,
    state,
    runs,
    expiresAt: 1,
    payment: {
      sessionId: "cs_test_retention",
      email: "fixture@example.invalid",
    },
    failure: state === "RETRY" ? "REPORT_FAILED" : null,
    tokenHash: "old",
    pendingScope: { repo: "fixture/public" },
  };
}
test("undelivered expired payment escalates once to Ryan instead of disappearing", (t) => {
  const h = fixture(t);
  const id = "a".repeat(64);
  h.store.data.orders[id] = expired(id);
  const dir = path.join(h.root, "artifacts", id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "partial"), "partial");
  h.service.purge();
  const o = h.store.data.orders[id];
  a.equal(o.state, "REFUND_REQUIRED");
  a.equal(o.exception.owner, "Ryan");
  a.equal(o.exception.reason, "REPORT_FAILED");
  a.equal(o.tokenHash, null);
  a.ok(o.expiredAt);
  a.equal(fs.existsSync(dir), false);
  h.service.purge();
  a.equal(h.store.data.exceptions.length, 1);
});
test("delivered expired pack retains reconciliation but does not invent a refund on later sweeps", (t) => {
  const h = fixture(t);
  const id = "b".repeat(64);
  h.store.data.orders[id] = expired(id, "DELIVERED", [{ id: "c".repeat(64) }]);
  h.service.purge();
  h.service.purge();
  a.equal(h.store.data.orders[id].state, "EXPIRED");
  a.equal(h.store.data.orders[id].deliveredCount, 1);
  a.equal(h.store.data.exceptions.length, 0);
});
test("expired failed reassessment also escalates while unused reassessment does not", (t) => {
  const h = fixture(t);
  const id = "d".repeat(64);
  h.store.data.orders[id] = expired(id, "RETRY", [{ id: "e".repeat(64) }]);
  h.service.purge();
  a.equal(h.store.data.orders[id].state, "REFUND_REQUIRED");
  a.equal(h.store.data.orders[id].deliveredCount, 1);
});
test("one thousand expired paid records do not permanently block new eligibility", async (t) => {
  const h = fixture(t);
  for (let i = 0; i < 1000; i++) {
    const id = i.toString(16).padStart(64, "0");
    h.store.data.orders[id] = { ...expired(id, "EXPIRED"), expiredAt: 2 };
  }
  const result = await h.service.eligible({
    url: "https://github.com/fixture/public",
    pr: 1,
    required: [{ name: "tests", appId: 1 }],
  });
  a.equal(result.eligibility, "ELIGIBLE");
  a.equal(Object.keys(h.store.data.orders).length, 1001);
});
test("factory merge report labels and shows the real landed state", async (t) => {
  const h = fixture(t);
  const item = require("../proof/public-results/pallets-click-3781.json");
  const directory = path.join(h.root, "report");
  await generate({
    directory,
    result: item.result,
    capture: item.capture,
    scope: { ...item.scope, required: item.required },
    runId: "r",
    orderId: "o",
    actionRef: "dab4c4b896a4ff704603e4945edfce87c43fd4e5",
    printer: async (_, out) =>
      fs.writeFileSync(out, "%PDF-1.4\n" + ".".repeat(120) + "\n%%EOF\n"),
  });
  const html = fs.readFileSync(path.join(directory, "report.html"), "utf8");
  a.match(html, /<th>Landed state<\/th>/);
  a.doesNotMatch(html, /Landed squash/);
  a.ok(html.includes(item.scope.ciSha.slice(0, 12)));
});
