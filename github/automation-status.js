"use strict";
// A scoped, read-only presentation of existing worker state. Never infer health
// from entitlement, expose provider errors, or change discovery/retry behavior.
function status(data, installationId, repositoryId, pulls, usage) {
  const matches = x => x.installationId === installationId && x.repositoryId === repositoryId;
  const open = new Set(pulls.map(p => p.number));
  const activation = data.activation?.[`${installationId}:${repositoryId}`];
  const subscriptions = Object.values(data.subscriptions || {}).filter(x => matches(x) && open.has(x.pr));
  const jobs = (data.queue || []).filter(x => matches(x) && open.has(x.pr));
  const waiting = usage.plan === "AWAITING_FIRST_PROOF";
  const result = (state, message) => ({ state, message });
  if (!usage.automationAllowed) return result("PAUSED", "Hosted access ended — automation paused. New proofs, re-proofs and scans are paused; authorized existing receipts remain available within retention and capacity limits.");
  const attentionErrors = new Set(["SUBSCRIPTION_CAPACITY", "RECEIPT_CAPACITY", "INSTALLATION_INACTIVE", "REPOSITORY_ACCESS_DENIED", "REPOSITORY_NOT_AUTHORIZED", "APP_NOT_CONFIGURED", "ACCESS_DENIED", "DELIVERY_CAPACITY"]);
  if (activation && !activation.complete && attentionErrors.has(activation.error))
    return result("ATTENTION", "Automatic proof needs attention. Check repository access or the reported capacity limit; no successful activation is implied.");
  if (subscriptions.some(x => x.refreshState === "UNAVAILABLE" || x.refreshState === "ALLOWANCE_EXHAUSTED"))
    return result("ATTENTION", "Automatic proof needs attention. Evidence collection could not complete after retries. Check repository access and available evidence; contact support if it persists.");
  if ((activation && !activation.complete && activation.error) || jobs.some(x => x.retryAt || x.attempts))
    return result("RETRYING", "Automatic proof is waiting for GitHub or retrying collection. No new current receipt has been established.");
  if ((activation && !activation.complete) || jobs.length || (open.size && (subscriptions.length !== open.size || subscriptions.some(x => x.refreshState !== "CURRENT"))))
    return result("PENDING", "Finding open PRs and collecting evidence." + (waiting ? " Your trial starts after the first eligible proof." : " New current evidence has not yet been established."));
  if (!open.size) return result("EMPTY", "No open PRs yet. Merge Proof is watching for the next one." + (waiting ? " Your trial has not started." : ""));
  return result("WORKING", "Merge Proof is watching authorized PR activity. Relevant events can trigger re-proof.");
}
module.exports = { status };
