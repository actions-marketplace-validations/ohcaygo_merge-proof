"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Store } = require("../../factory/store");
const { Meter } = require("../meter");
const { ProofService } = require("../service");
const { Client } = require("../client");
const { fixtureFetch } = require("./fixtures");
const { createHmac, randomUUID } = require("node:crypto");
function setup(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mp-meter-"));
  let store = new Store(root);
  t.after(() => {
    store.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return {
    get store() {
      return store;
    },
    reopen() {
      store.close();
      store = new Store(root);
      return new Meter(store);
    },
  };
}
function receipt(n, repo = 1, verdict = "NOT_PROVEN") {
  return {
    receiptId: `receipt-${repo}-${n}`,
    verdict,
    issuedAt: new Date().toISOString(),
    identity: {
      repositoryId: repo,
      pr: 1,
      headSha: n.toString(16).padStart(40, "0"),
    },
  };
}
test("five unique heads exhaust free taste, old keys refresh after restart, repositories do not collide", (t) => {
  const h = setup(t);
  let m = new Meter(h.store);
  m.connect(2, 9);
  for (let i = 1; i <= 4; i++) {
    a.equal(
      m.complete(2, receipt(i), { state: "CURRENT" }, true).charged,
      true,
    );
    a.equal(
      m.complete(2, receipt(i), { state: "CURRENT" }, true).charged,
      false,
    );
  }
  a.equal(
    m.complete(2, receipt(1, 2), { state: "CURRENT" }, true).charged,
    true,
  );
  h.store.save();
  m = h.reopen();
  a.equal(m.usage(2).remaining, 0);
  a.throws(() => m.check(2, receipt(6).identity), /ALLOWANCE_EXHAUSTED/);
  a.equal(m.complete(2, receipt(1), { state: "CURRENT" }, true).charged, false);
  m.disconnect(2);
  m.connect(3, 9);
  a.equal(m.usage(3).remaining, 0);
  a.throws(() => m.usage(2), /INSTALLATION_INACTIVE/);
});
test("FAIL, failed collection and stale completion debit zero", (t) => {
  const h = setup(t),
    m = new Meter(h.store);
  m.connect(2, 9);
  for (const [verdict, state, complete] of [
    ["FAIL", "CURRENT", true],
    ["NOT_PROVEN", "STALE", true],
    ["NOT_PROVEN", "CURRENT", false],
  ])
    a.equal(
      m.complete(2, receipt(1, 1, verdict), { state }, complete).charged,
      false,
    );
  a.equal(m.usage(2).used, 0);
  a.equal(m.complete(2, receipt(1), { state: "CURRENT" }, true).charged, true);
});
test("real proof service snapshot commits receipt and debit together; same head reruns once", async (t) => {
  const h = setup(t);
  const s = new ProofService({
    store: h.store,
    config: { hosted: true },
    clientFactory: () => new Client(fixtureFetch()),
  });
  s.meter.connect(2, 9);
  await a.rejects(s.run("fixture/public", 1), /INSTALLATION_INACTIVE/);
  const first = await s.run("fixture/public", 1, { installationId: 2 });
  const saved = JSON.parse(fs.readFileSync(h.store.file));
  a.equal(saved.meter.accounts["github:9"].freeUsed, 1);
  a.ok(saved.github.receipts[first.receipt.receiptId]);
  const second = await s.run("fixture/public", 1, { installationId: 2 });
  a.notEqual(first.receipt.receiptId, second.receipt.receiptId);
  a.equal(s.meter.usage(2).used, 1);
});
test("overlapping workers cannot double-debit; second writer cannot open durable store", async (t) => {
  const h = setup(t);
  a.throws(() => new Store(h.store.root), /EEXIST/);
  const s = new ProofService({
    store: h.store,
    config: { hosted: true },
    clientFactory: () => new Client(fixtureFetch()),
  });
  s.meter.connect(2, 9);
  const results = await Promise.allSettled([
    s.run("fixture/public", 1, { installationId: 2 }),
    s.run("fixture/public", 1, { installationId: 2 }),
  ]);
  a.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  a.equal(s.meter.usage(2).used, 1);
});
test("signed hosted lifecycle: install, five heads, stale immutable history, sixth pauses and same-head refresh stays free", async (t) => {
  const h = setup(t);
  let head = "1".repeat(40);
  const s = new ProofService({
    store: h.store,
    config: { hosted: true, webhookSecret: "s".repeat(40) },
    clientFactory: () => new Client(fixtureFetch({ head })),
    appClient: async () => new Client(fixtureFetch({ head })),
  });
  const hook = async (event, p) => {
    const raw = Buffer.from(JSON.stringify(p));
    await s.webhook(raw, {
      "x-github-event": event,
      "x-github-delivery": randomUUID(),
      "x-hub-signature-256":
        "sha256=" +
        createHmac("sha256", "s".repeat(40)).update(raw).digest("hex"),
    });
  };
  await hook("installation", {
    action: "created",
    installation: { id: 2, account: { id: 9 } },
  });
  let first;
  for (let i = 1; i <= 5; i++) {
    head = String(i).repeat(40);
    await hook("pull_request", {
      action: "synchronize",
      installation: { id: 2 },
      repository: { id: 1, full_name: "fixture/public" },
      pull_request: { number: 1, state: "open" },
    });
    await s.drain();
    if (i === 1) first = Object.values(s.data.receipts)[0];
  }
  a.equal(s.meter.usage(2).used, 5);
  a.equal(first.current.state, "STALE");
  a.equal(first.receipt.identity.headSha, "1".repeat(40));
  head = "6".repeat(40);
  await hook("push", {
    installation: { id: 2 },
    repository: { id: 1, full_name: "fixture/public" },
  });
  await s.drain();
  a.equal(s.data.subscriptions["1:1"].refreshState, "ALLOWANCE_EXHAUSTED");
  a.equal(Object.keys(s.data.receipts).length, 5);
  head = "5".repeat(40);
  await s.run("fixture/public", 1, { installationId: 2 });
  a.equal(s.meter.usage(2).used, 5);
  await hook("installation", { action: "deleted", installation: { id: 2 } });
  await a.rejects(
    s.access(first.receipt.receiptId, "fixture"),
    /INSTALLATION_INACTIVE/,
  );
  await hook("installation", {
    action: "created",
    installation: { id: 3, account: { id: 9 } },
  });
  a.equal(s.meter.usage(3).remaining, 0);
});
