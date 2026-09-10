#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const { Client } = require("./client");
const { collect } = require("./collect");
const { prove } = require("./proof");
const { assert, repoName } = require("./common");
async function scan(
  client,
  repo,
  { limit = 5, canceled = () => false, progress = () => {} } = {},
) {
  assert(
    repoName(repo) && Number.isInteger(limit) && limit >= 1 && limit <= 10,
    "INVALID_SCAN_SCOPE",
  );
  // One bounded page; no indefinite archaeology. The client's request budget
  // applies to the entire scan, including both observations of each candidate.
  const prs = await client.get(
    `/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=30&page=1`,
  );
  assert(Array.isArray(prs));
  const eligible = prs
    .filter((p) => p.merged_at && Number.isSafeInteger(p.number))
    .slice(0, limit);
  const rows = [];
  for (const p of eligible) {
    assert(!canceled(), "SCAN_CANCELED");
    try {
      const c = await collect(client, repo, p.number, { historical: true }),
        r = prove(c);
      rows.push({
        pr: p.number,
        url: `https://github.com/${repo}/pull/${p.number}`,
        state: "EXAMINED",
        receipt: r,
      });
    } catch (e) {
      rows.push({
        pr: p.number,
        url: `https://github.com/${repo}/pull/${p.number}`,
        state: "UNAVAILABLE",
        reason: e.code || "HISTORICAL_EVIDENCE_UNAVAILABLE",
      });
    }
    await progress(rows.length, eligible.length);
  }
  return {
    schemaVersion: 2,
    repository: repo,
    requestedLimit: limit,
    selected: rows.length,
    selection:
      "Up to 10 merged PRs from the first 30 most recently updated closed PRs.",
    observedAt: new Date().toISOString(),
    rows,
    limitations: [
      "Only explicit two-parent merges bind the historical base and candidate. Squash/rebase history is unavailable.",
      "Current repository rules and review records cannot establish policy or approval validity at merge time. Historical receipts therefore cannot establish a full VERIFIED result.",
      "Counts describe evidence conditions, not bugs, incidents prevented or money saved.",
    ],
  };
}
if (require.main === module) {
  const [repo, limit = "5", file] = process.argv.slice(2);
  scan(
    new Client({ token: process.env.MP_GITHUB_TOKEN, maxRequests: 800 }),
    repo,
    { limit: Number(limit) },
  )
    .then((result) => {
      const json = JSON.stringify(result, null, 2);
      if (file) fs.writeFileSync(file, json, { flag: "wx", mode: 0o600 });
      else console.log(json);
    })
    .catch(() => {
      console.error("Historical scan unavailable; no proof invented.");
      process.exitCode = 3;
    });
}
module.exports = { scan };
