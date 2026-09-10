"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const { compare } = require("../dev/acceptance");
const before = { receipt: { receiptId: "one", identity: { repositoryId: 1, pr: 1, headSha: "a" }, fingerprint: "a", verdict: "VERIFIED" } };
const after = { receipt: { receiptId: "two", identity: { repositoryId: 1, pr: 1, headSha: "b" }, fingerprint: "b", verdict: "NOT_PROVEN" } };
const old = () => ({ receipt: structuredClone(before.receipt), current: { state: "STALE" } });
test("live observer preserves old verdict and requires new head and stale history", () => {
  compare(before, after, old());
  a.throws(() => compare(before, before, old()));
  a.throws(() => compare(before, after, { ...old(), current: { state: "CURRENT" } }));
  a.throws(() => compare(before, after, { ...old(), receipt: { ...before.receipt, verdict: "FAIL" } }));
  a.throws(() => compare(before, { receipt: { ...after.receipt, fingerprint: "a" } }, old()));
  a.throws(() => compare(before, { receipt: { ...after.receipt, verdict: "FAIL" } }, old()));
});
