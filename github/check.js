"use strict";
const { text } = require("./receipt");
const { evaluate } = require("./policy");
const { explain } = require("./wording");
// The context name a repository requires. It must never change: renaming it
// would silently detach every ruleset already configured to require it.
const NAME = "Merge Proof exact-state receipt";

// GitHub treats a required check concluding `neutral` or `skipped` as passing.
// An enforcing policy therefore reports only `success` or `failure`.
function conclusionFor(receipt, current, policyResult) {
  return (policyResult || evaluate(receipt, current, null)).conclusion;
}

// A check run is bound to one commit and that binding cannot be moved, so the
// result has to be reported against every commit a required check is evaluated
// on. A merge-queue group is a different commit from the pull request head: the
// head needs its own check or the pull request waits forever for a status that
// only ever landed on the queue commit.
function subjects(receipt) {
  const out = [{ sha: receipt.identity.headSha, kind: "PULL_REQUEST_HEAD" }];
  const target = receipt.summary?.target;
  if (
    target?.state === "AVAILABLE" &&
    target.value?.kind === "MERGE_GROUP" &&
    target.value.sha !== receipt.identity.headSha
  )
    out.push({ sha: target.value.sha, kind: "MERGE_GROUP" });
  return out;
}

function title(receipt, current, result) {
  if (!result.enforced)
    return `${receipt.verdict} · ${current?.state || "UNAVAILABLE"} at observation · reporting only`;
  return result.conclusion === "success"
    ? `${receipt.verdict} · merge requirement satisfied`
    : `${receipt.verdict} · merge blocked · ${result.blocking.length} item(s) to resolve`;
}

function summary(receipt, current, result) {
  const items = explain(receipt, result);
  const blocking = items.filter((x) => x.blocksMerge === true);
  const reported = items.filter((x) => x.blocksMerge !== true);
  const section = (heading, rows) =>
    rows.length
      ? `\n## ${heading}\n\n` +
        rows
          .map(
            (x) =>
              `**${x.plain}**\n\n- Why it matters: ${x.why || "—"}\n- What to do: ${x.doNext || "—"}\n- Re-proof: ${x.reproof === "AUTOMATIC" ? "automatic once that happens" : "run proof again from your account"}\n`,
          )
          .join("\n")
      : "";
  return (
    `${result.mergeConsequence}\n` +
    section("What must be resolved before this merge", blocking) +
    section(
      result.enforced
        ? "Reported, not required by your policy"
        : "What could not be established",
      reported,
    ) +
    `\n## Evidence\n\n\`\`\`\n${text(receipt, current)}\`\`\`\n`
  ).slice(0, 60000);
}

async function publish(client, receipt, current, origin, policyResult = null) {
  const url = new URL(origin);
  if (!["https:", "http:"].includes(url.protocol))
    throw Error("INVALID_ORIGIN");
  const result = policyResult || evaluate(receipt, current, null);
  const body = {
    name: NAME,
    status: "completed",
    conclusion: conclusionFor(receipt, current, result),
    details_url: `${url.origin}/proof/receipts/${receipt.receiptId}`,
    output: {
      title: title(receipt, current, result).slice(0, 255),
      summary: summary(receipt, current, result),
    },
  };
  const published = [];
  let primary = null;
  for (const on of subjects(receipt)) {
    const response = await client.request(
      `/repos/${receipt.identity.repository}/check-runs`,
      { method: "POST", body: { ...body, head_sha: on.sha } },
    );
    published.push({ ...on, id: response?.id ?? null });
    primary ||= response;
  }
  return Object.assign(primary || {}, {
    publishedOn: published[0],
    published,
    checkIds: published
      .map((x) => x.id)
      .filter((id) => Number.isSafeInteger(id)),
  });
}

module.exports = { publish, NAME, subjects, conclusionFor, title, summary };
