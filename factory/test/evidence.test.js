"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const {
  ciEvidence,
  approvalEvidence,
  integrate,
  diff,
} = require("../evidence");
const H = "a".repeat(40),
  B = "b".repeat(40),
  req = [{ name: "tests", appId: 1 }];
const capture = () => ({
  headSha: H,
  ciSha: H,
  authorId: 1,
  checks: [
    {
      id: 1,
      name: "tests",
      appId: 1,
      headSha: H,
      status: "completed",
      conclusion: "success",
    },
  ],
  reviews: [
    {
      id: 1,
      userId: 2,
      userType: "User",
      association: "COLLABORATOR",
      state: "APPROVED",
      commitId: H,
      submittedAt: "2026-09-08T00:00:00Z",
    },
  ],
});
const base = () => ({
  verdict: "VERIFIED",
  findings: [],
  notChecked: [],
  refs: { head: { sha: H } },
});
test("exact SHA and expected App success can meet CI", () =>
  a.equal(ciEvidence(capture(), req).state, "CI_MATCHES_RELEVANT_SHA"));
test("wrong SHA never verifies, even when same check succeeds", () => {
  const c = capture();
  c.checks[0].headSha = B;
  a.equal(ciEvidence(c, req).state, "CI_STALE_OR_OTHER_SHA");
  a.equal(integrate(base(), c, req).verdict, "NOT_PROVEN");
});
test("wrong App, missing, failed, neutral, skipped, in-progress CI all block", () => {
  for (const change of [
    { appId: 2 },
    { conclusion: "failure" },
    { conclusion: "neutral" },
    { conclusion: "skipped" },
    { status: "in_progress" },
  ]) {
    const c = capture();
    Object.assign(c.checks[0], change);
    a.equal(integrate(base(), c, req).verdict, "NOT_PROVEN");
  }
});
test("latest failed attempt overrides old success", () => {
  const c = capture();
  c.checks.push({ ...c.checks[0], id: 2, conclusion: "failure" });
  a.equal(ciEvidence(c, req).state, "CI_MISSING");
});
test("unresolved or empty CI policy cannot infer not-applicable", () => {
  const c = capture();
  c.ciError = "API_LIMIT";
  a.equal(ciEvidence(c, req).state, "CI_UNRESOLVABLE");
  a.equal(ciEvidence(capture(), []).state, "CI_UNRESOLVABLE");
});
test("approval is exact candidate bound", () => {
  const c = capture();
  a.equal(approvalEvidence(c).state, "APPROVAL_MATCHES_CANDIDATE");
  c.reviews[0].commitId = B;
  a.equal(approvalEvidence(c).state, "APPROVAL_STALE_CANDIDATE");
  a.equal(integrate(base(), c, req).verdict, "NOT_PROVEN");
});
test("dismissed, changes-requested, bot, author and outsider cannot be current approval", () => {
  for (const change of [
    { state: "DISMISSED" },
    { state: "CHANGES_REQUESTED" },
    { userType: "Bot" },
    { userId: 1 },
    { association: "CONTRIBUTOR" },
  ]) {
    const c = capture();
    Object.assign(c.reviews[0], change);
    a.notEqual(approvalEvidence(c).state, "APPROVAL_MATCHES_CANDIDATE");
  }
});
test("later comment does not erase an approval but latest decision does", () => {
  const c = capture();
  c.reviews.push({ ...c.reviews[0], id: 2, state: "COMMENTED" });
  a.equal(approvalEvidence(c).state, "APPROVAL_MATCHES_CANDIDATE");
  c.reviews.push({ ...c.reviews[0], id: 3, state: "DISMISSED" });
  a.equal(approvalEvidence(c).state, "APPROVAL_INVALIDATED");
});
test("outstanding changes requested from another reviewer blocks", () => {
  const c = capture();
  c.reviews.push({
    ...c.reviews[0],
    id: 2,
    userId: 3,
    state: "CHANGES_REQUESTED",
  });
  a.equal(approvalEvidence(c).state, "APPROVAL_INVALIDATED");
});
test("unresolvable approval remains unknown", () => {
  const c = capture();
  c.reviewError = "API_ERROR";
  a.equal(approvalEvidence(c).state, "APPROVAL_UNRESOLVABLE");
});
test("existing FAIL or blocking local finding is never upgraded", () => {
  const b = base();
  b.verdict = "FAIL";
  a.equal(integrate(b, capture(), req).verdict, "FAIL");
  b.verdict = "NOT_PROVEN";
  b.findings.push({ id: "PROTECTED_BOUNDARY", severity: "blocking" });
  a.equal(integrate(b, capture(), req).verdict, "NOT_PROVEN");
});
test("reassessment preserves original, reports resolved remaining and new gaps", () => {
  const c = capture();
  c.checks = [];
  const before = integrate(base(), c, req);
  const saved = JSON.stringify(before);
  c.checks = capture().checks;
  c.reviews = [];
  const after = integrate(base(), c, req);
  const d = diff(before, after);
  a.deepEqual(d.resolved, ["CI_RAN_ON_FINAL_HEAD"]);
  a.deepEqual(d.newFindings, ["HUMAN_APPROVAL_PRESENT"]);
  a.equal(JSON.stringify(before), saved);
});
module.exports = { capture, base, req };
