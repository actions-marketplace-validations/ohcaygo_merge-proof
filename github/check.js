"use strict";
const { text } = require("./receipt");
const NAME = "Merge Proof exact-state receipt";
async function publish(client, receipt, current, origin) {
  const url = new URL(origin);
  if (!["https:", "http:"].includes(url.protocol))
    throw Error("INVALID_ORIGIN");
  return client.request(`/repos/${receipt.identity.repository}/check-runs`, {
    method: "POST",
    body: {
      name: NAME,
      head_sha: receipt.identity.headSha,
      status: "completed",
      conclusion:
        current.state === "CURRENT" && receipt.verdict === "VERIFIED"
          ? "success"
          : "neutral",
      details_url: `${url.origin}/proof/receipts/${receipt.receiptId}`,
      output: {
        title: `${receipt.verdict} · ${current.state} at observation`,
        summary: text(receipt, current).slice(0, 60000),
      },
    },
  });
}
module.exports = { publish, NAME };
