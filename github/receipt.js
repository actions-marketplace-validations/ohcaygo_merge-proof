"use strict";
const { describeGap } = require("./wording");
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function lines(
  r,
  current = {
    state: "UNAVAILABLE",
    reason: "Refresh required before treating this saved receipt as current.",
  },
) {
  const s = r.summary;
  return [
    ["Candidate", r.identity.headSha],
    ["Current base at proof", r.identity.baseSha],
    [
      "GitHub mergeability",
      `${r.identity.githubMergeable ?? "UNKNOWN"} (${r.identity.githubMergeState || "UNKNOWN"})`,
    ],
    [
      "Applicable validation state",
      s.target.value
        ? `${{ HEAD_CONTAINS_CURRENT_BASE: "Head includes current base", PR_TEST_MERGE: "Current test merge", MERGE_GROUP: "Merge group", LANDED_TWO_PARENT_MERGE: "Historical landed merge" }[s.target.value.kind] || s.target.value.kind}: ${s.target.value.sha}`
        : s.target.reason,
    ],
    [
      "Base movement",
      `${r.local.metrics.baseAdvanceCommits ?? "UNAVAILABLE"} commits`,
    ],
    [
      "Candidate/base overlap",
      `${r.local.metrics.overlapCount ?? "UNAVAILABLE"} files`,
    ],
    [
      "Required check conclusions satisfied",
      `${s.ci.acceptedCount} / ${s.rules.checks.length}`,
    ],
    ["Execution recorded on applicable state", s.ci.state],
    [
      "Human approval",
      s.approval.observed.length ? "OBSERVED" : "NOT OBSERVED",
    ],
    ["Current required approval", s.approval.state],
    [
      "Remote candidate",
      s.remote.state === "AVAILABLE" && s.remote.value.confirmed
        ? "CONFIRMED AT OBSERVATION"
        : "UNAVAILABLE / NOT CONFIRMED",
    ],
    ["Repository requirements", s.rules.state],
    ["Current receipt status", current.state],
    [
      "Protected boundary",
      r.local.verdict === "FAIL"
        ? "UNAVAILABLE"
        : r.local.findings.find((f) => f.id === "PROTECTED_BOUNDARY")
            ?.whatHappened ||
          "No designated boundary detected under available path evidence",
    ],
  ];
}
function text(r, current) {
  return (
    `MERGE PROOF\n${r.verdict}\n${r.identity.repository} #${r.identity.pr}\n\n` +
    lines(r, current)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n") +
    `\n\nMISSING EVIDENCE\n${r.gaps.map(describeGap).join("\n") || "None under the implemented policy."}\n\nNEXT\n${r.next}\n\nNothing in this receipt establishes that the code contains a bug.\nReceipt: ${r.receiptId}\nObserved: ${r.issuedAt}\n`
  );
}
function html(r, current) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Merge Proof receipt</title><style>
  body{font:15px/1.45 system-ui,sans-serif;color:#172a29;background:#f1f4ef;margin:0;padding:24px}main{max-width:760px;margin:auto;background:white;padding:32px;border:1px solid #cad5cd;border-radius:16px}button{display:block;margin:18px 0 0;padding:10px 16px;background:#174f43;color:white;border:0;border-radius:8px;cursor:pointer}h1{font-size:42px;margin:8px 0}header{border-bottom:2px solid #174f43;padding-bottom:18px}.brand{letter-spacing:.18em;font-size:13px}dl{display:grid;grid-template-columns:1fr 1.3fr;gap:8px}dt{color:#53655c}dd{margin:0;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}summary{cursor:pointer}small{color:#53655c}@media(max-width:520px){body{padding:8px}main{padding:18px}dl{grid-template-columns:1fr}dd{margin-bottom:10px}}@media print{body{background:white;padding:0}main{border:0}details{display:block}}</style><main><header><div class="brand">MERGE PROOF · PROVE THE MERGE</div><h1>${escape(r.verdict)}</h1><strong>Receipt currentness: ${escape(current?.state || "UNAVAILABLE")} ${current?.state === "STALE" ? "— RE-PROOF REQUIRED" : current?.state === "CURRENT" ? "AT OBSERVATION" : ""}</strong><p>${escape(r.identity.repository)} #${escape(r.identity.pr)}</p><small>Historical result issued ${escape(r.issuedAt)}. Currentness observed ${escape(current?.asOf || "not refreshed")}.</small></header>
  <dl>${lines(r, current)
    .map(
      ([k, v]) =>
        `<dt>${escape(k)}</dt><dd title="${escape(v)}">${escape(String(v).replace(/[a-f0-9]{40}/g, (x) => x.slice(0, 12)))}</dd>`,
    )
    .join("")}</dl>
  <h2>Missing evidence</h2><ul>${(r.gaps.length ? r.gaps : ["None under the implemented policy."]).map((x) => `<li>${escape(describeGap(x))}</li>`).join("")}</ul><h2>Next</h2><p>${escape(current?.state === "CURRENT" ? r.next : current?.next || r.next)}</p>
  <p>NOT_PROVEN means evidence is insufficient. It does not mean the change is broken. A protected boundary is a designated high-impact area, not a vulnerability finding.</p>
  <details><summary>What green actually meant</summary><pre>${escape(JSON.stringify(r.summary.ci, null, 2))}</pre></details>
  <details><summary>Inspect full receipt JSON</summary><pre>${escape(JSON.stringify({ receipt: r, current }, null, 2))}</pre></details>
  <small>${r.limitations.map(escape).join("<br>")}<br>Receipt ${escape(r.receiptId)}</small></main></html>`;
}
module.exports = { text, html, lines };
