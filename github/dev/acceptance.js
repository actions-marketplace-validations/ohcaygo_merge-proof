"use strict";
// Owner-run development acceptance observer. Never generates webhook events or writes state.
const fs = require("node:fs");
const path = require("node:path");
const a = require("node:assert/strict");
const { installationClient } = require("../app");

function compare(before, after, oldRow) {
  a.deepEqual(oldRow.receipt, before.receipt, "Historical receipt was altered");
  a.equal(oldRow.current.state, "STALE", "Old receipt must be stale after the head change");
  a.notEqual(after.receipt.receiptId, before.receipt.receiptId, "No new receipt");
  a.equal(after.receipt.identity.repositoryId, before.receipt.identity.repositoryId);
  a.equal(after.receipt.identity.pr, before.receipt.identity.pr);
  a.notEqual(after.receipt.identity.headSha, before.receipt.identity.headSha, "Head did not change");
  a.notEqual(after.receipt.fingerprint, before.receipt.fingerprint, "Old evidence was reused");
  a.notEqual(after.receipt.verdict, "FAIL", "Collection failed; live acceptance is incomplete");
}
async function main() {
  const [mode, repo, prText, deliveryId, outputDir] = process.argv.slice(2);
  a.ok(["before", "after"].includes(mode) && repo && /^\d+$/.test(prText) && deliveryId && outputDir,
    "Usage: node github/dev/acceptance.js before|after OWNER/REPO PR GITHUB_DELIVERY_ID NEW_OUTPUT_DIRECTORY");
  const config = JSON.parse(fs.readFileSync(process.env.MP_GITHUB_APP_CONFIG, "utf8"));
  const state = JSON.parse(fs.readFileSync(path.join(process.env.FACTORY_STATE_DIR, "state.json"), "utf8")).github;
  a.ok(state.events.includes(deliveryId), "This signed delivery was not accepted; inspect GitHub Recent deliveries");
  const sub = Object.values(state.subscriptions).find(s => s.repo === repo && s.pr === Number(prText));
  a.ok(sub?.latestReceiptId, "No App-produced receipt yet; wait for the bounded queue");
  const row = state.receipts[sub.latestReceiptId];
  a.ok(row.installationId, "Receipt did not come from the App queue");
  a.notEqual(row.receipt.verdict, "FAIL", "Collection failed; inspect receipt gaps");
  const origin = process.env.FACTORY_ORIGIN || "http://127.0.0.1:4318";
  a.ok(["http://127.0.0.1:4318", "http://localhost:4318"].includes(origin), "Development observer only sends credentials to local port 4318");
  const client = await installationClient(config, sub.installationId, sub.repositoryId);
  const remote = await client.authorize(repo, sub.repositoryId);
  a.equal(remote.private, false, "Use only the designated owner-controlled public development PR");
  const receiptUrl = `${origin}/proof/receipts/${sub.latestReceiptId}`;
  const headers = { Authorization: `Bearer ${client.token}` };
  const json = await fetch(`${receiptUrl}?format=json`, { headers, redirect: "error" });
  a.equal(json.status, 200, "Authorized receipt retrieval failed");
  const delivered = await json.json();
  a.deepEqual(delivered.receipt, row.receipt);
  const html = await fetch(receiptUrl, { headers, redirect: "error" });
  a.equal(html.status, 200);
  const htmlText = await html.text();
  a.ok(htmlText.includes(row.receipt.verdict));
  // App receipts are intentionally unshared, including when the repository is public.
  a.equal((await fetch(receiptUrl, { redirect: "error" })).status, 403);
  const unsigned = await fetch(`${origin}/proof/webhook`, { method: "POST", body: "{}" });
  a.equal(unsigned.status, 403, "Unsigned webhook was accepted");
  let check = null;
  if (config.publishChecks) {
    a.ok(row.checkId, "Optional check was not published");
    const c = await client.get(`/repos/${repo}/check-runs/${row.checkId}`);
    a.equal(c.head_sha, row.receipt.identity.headSha);
    a.equal(String(c.app.id), String(config.appId));
    check = { id: c.id, sha: c.head_sha, conclusion: c.conclusion, url: c.html_url };
  }
  const snapshot = { receipt: row.receipt, storedCurrent: row.current,
    deliveredCurrent: delivered.current, deliveryId, check };
  if (mode === "after") {
    const before = JSON.parse(fs.readFileSync(path.join(outputDir, "before.json"), "utf8"));
    a.notEqual(deliveryId, before.deliveryId, "Supply the new synchronize delivery ID");
    compare(before, snapshot, state.receipts[before.receipt.receiptId]);
    snapshot.historicalCurrent = state.receipts[before.receipt.receiptId].current;
  } else fs.mkdirSync(outputDir, { mode: 0o700 }); // Never overwrite a previous acceptance.
  fs.writeFileSync(path.join(outputDir, `${mode}.json`), JSON.stringify(snapshot, null, 2), { flag: "wx", mode: 0o600 });
  fs.writeFileSync(path.join(outputDir, `${mode}.html`), htmlText, { flag: "wx", mode: 0o600 });
  console.log(`${mode}: ${row.receipt.verdict}; head ${row.receipt.identity.headSha}; receipt ${sub.latestReceiptId}; current ${row.current.state}`);
  console.log(mode === "after" ? "State-change assertions passed. Retain GitHub delivery evidence alongside these observations." : "Snapshot saved. Push one legitimate change to this PR, then run after with its synchronize delivery ID.");
}
if (require.main === module) main().catch(() => {
  console.error("Acceptance incomplete. Check arguments, App configuration, GitHub delivery, queue and receipt gaps. No credentials are printed.");
  process.exitCode = 1;
});
module.exports = { compare };
