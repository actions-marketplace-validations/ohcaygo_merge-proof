"use strict";
const { sha } = require("./common");
const DEFERRED = [
  {
    id: "CANDIDATE_DURABLE_ON_REMOTE",
    reason: "Remote durability is outside the implemented proof.",
  },
  {
    id: "SCOPE_CREEP_VS_DECLARED_SCOPE",
    reason:
      "Comparison with declared intent or scope is outside the implemented proof.",
  },
];
// Factory scope requires explicitly named checks, each bound to its GitHub App.
// We make no claim to reconstruct all branch protection, rulesets or CODEOWNERS.
function ciEvidence(capture, required) {
  const targetSha = capture.ciSha;
  const out = {
    targetSha,
    policy:
      "All scope-confirmed check names and App IDs must succeed on the relevant SHA.",
    checks: [],
  };
  if (
    !sha(targetSha) ||
    capture.ciError ||
    !Array.isArray(capture.checks) ||
    capture.checks.some(
      (c) =>
        !Number.isSafeInteger(c.id) ||
        c.id <= 0 ||
        !sha(c.headSha) ||
        !Number.isSafeInteger(c.appId),
    ) ||
    !required?.length
  ) {
    return { ...out, state: "CI_UNRESOLVABLE" };
  }
  for (const rule of required) {
    const named = capture.checks.filter(
      (c) => c.name === rule.name && c.appId === rule.appId,
    );
    const exact = named
      .filter((c) => c.headSha === targetSha)
      .sort((a, b) => b.id - a.id);
    let state = "CI_MISSING";
    if (!exact.length && named.length) state = "CI_STALE_OR_OTHER_SHA";
    if (exact.length)
      state =
        exact[0].status === "completed" && exact[0].conclusion === "success"
          ? "CI_MATCHES_RELEVANT_SHA"
          : "CI_MISSING";
    out.checks.push({ ...rule, state, evidence: exact[0] || named[0] || null });
  }
  out.state = out.checks.every((c) => c.state === "CI_MATCHES_RELEVANT_SHA")
    ? "CI_MATCHES_RELEVANT_SHA"
    : out.checks.some((c) => c.state === "CI_STALE_OR_OTHER_SHA")
      ? "CI_STALE_OR_OTHER_SHA"
      : "CI_MISSING";
  return out;
}
function approvalEvidence(capture) {
  const out = {
    targetSha: capture.headSha,
    policy:
      "At least one non-author human collaborator approval on this exact candidate; no outstanding changes-requested review.",
    reviews: capture.reviews || [],
  };
  if (
    !sha(capture.headSha) ||
    capture.reviewError ||
    !Array.isArray(capture.reviews) ||
    capture.reviews.some(
      (r) =>
        !Number.isSafeInteger(r.id) ||
        !Number.isSafeInteger(r.userId) ||
        !sha(r.commitId) ||
        (r.state !== "PENDING" && !Number.isFinite(Date.parse(r.submittedAt))),
    )
  )
    return { ...out, state: "APPROVAL_UNRESOLVABLE" };
  const humans = capture.reviews.filter(
    (r) =>
      r.userType === "User" &&
      r.userId !== capture.authorId &&
      ["OWNER", "MEMBER", "COLLABORATOR"].includes(r.association),
  );
  const latest = new Map();
  for (const r of [...humans].sort(
    (a, b) =>
      Date.parse(a.submittedAt) - Date.parse(b.submittedAt) || a.id - b.id,
  )) {
    if (["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(r.state))
      latest.set(r.userId, r);
  }
  const decisions = [...latest.values()];
  if (decisions.some((r) => r.state === "CHANGES_REQUESTED"))
    return { ...out, state: "APPROVAL_INVALIDATED" };
  if (
    decisions.some(
      (r) =>
        r.state === "APPROVED" &&
        r.commitId === capture.headSha &&
        r.submittedAt,
    )
  )
    return { ...out, state: "APPROVAL_MATCHES_CANDIDATE" };
  if (decisions.some((r) => r.state === "DISMISSED"))
    return { ...out, state: "APPROVAL_INVALIDATED" };
  if (decisions.some((r) => r.state === "APPROVED"))
    return { ...out, state: "APPROVAL_STALE_CANDIDATE" };
  return { ...out, state: "APPROVAL_MISSING" };
}
function integrate(base, capture, required) {
  const result = structuredClone(base);
  result.notChecked = DEFERRED;
  result.evidence = {
    ci: ciEvidence(capture, required),
    approval: approvalEvidence(capture),
  };
  for (const [id, item, good] of [
    ["CI_RAN_ON_FINAL_HEAD", result.evidence.ci, "CI_MATCHES_RELEVANT_SHA"],
    [
      "HUMAN_APPROVAL_PRESENT",
      result.evidence.approval,
      "APPROVAL_MATCHES_CANDIDATE",
    ],
  ]) {
    if (item.state !== good)
      result.findings.push({
        id,
        severity: "blocking",
        title: id,
        whatHappened: item.state,
        missingEvidence: `Exact SHA-bound evidence for ${item.targetSha}.`,
        doNext:
          "Supply current evidence for the confirmed scope and use the included reassessment.",
      });
  }
  if (result.verdict !== "FAIL")
    result.verdict = result.findings.some((f) => f.severity === "blocking")
      ? "NOT_PROVEN"
      : "VERIFIED";
  return result;
}
function diff(prior, current) {
  const a = new Set(prior.findings.map((f) => f.id));
  const b = new Set(current.findings.map((f) => f.id));
  return {
    priorVerdict: prior.verdict,
    currentVerdict: current.verdict,
    priorCandidate: prior.refs.head.sha,
    currentCandidate: current.refs.head.sha,
    evidenceChanged: ["ci", "approval"]
      .filter(
        (k) =>
          JSON.stringify(prior.evidence[k]) !==
          JSON.stringify(current.evidence[k]),
      )
      .map((k) => ({
        check: k,
        prior: prior.evidence[k],
        current: current.evidence[k],
      })),
    resolved: [...a].filter((id) => !b.has(id)),
    remaining: [...a].filter((id) => b.has(id)),
    newFindings: [...b].filter((id) => !a.has(id)),
  };
}
module.exports = { DEFERRED, ciEvidence, approvalEvidence, integrate, diff };
