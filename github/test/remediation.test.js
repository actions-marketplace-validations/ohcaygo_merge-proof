'use strict';
const { test } = require('node:test');
const a = require('node:assert/strict');
const { capture, OLD } = require('./fixtures');
const { prove } = require('../proof');
const policy = require('../policy');
const { build } = require('../remediation');
const { html } = require('../receipt');
const check = require('../check');
function receipt(code = 'CURRENT_STATE_EXECUTION_NOT_PROVEN') {
  const r = prove(capture()); r.verdict = 'NOT_PROVEN'; r.gaps = [code]; return r;
}
function view(r, options = {}) {
  const current = { state: options.state || 'CURRENT' };
  const gate = policy.evaluate(r, current, { preset: options.preset || 'ADVISORY' });
  return build(r, current, gate, { tracked: options.tracked });
}
test('required validation missing, old checks, and status-only evidence remain distinct', () => {
  const c = capture(); c.checks.value = []; c.statuses.value = [];
  a.match(view(prove(c)).summary, /required check has not reported/);
  c.checks.value = capture().checks.value; c.checks.value[0].sha = OLD;
  a.match(view(prove(c)).summary, /another version/);
  c.checks.value = []; c.statuses.value = [{ name: 'test', sha: c.target.value.sha, state: 'success', id: 1 }];
  a.doesNotMatch(view(prove(c)).summary, /older version/);
});
test('missing, stale, and ineligible current approval are distinguished', () => {
  const c = capture(); c.reviews.value = [];
  a.match(view(prove(c)).items.find(x => x.reasonCode === 'INSUFFICIENT_CURRENT_HUMAN_APPROVAL').nextAction, /current version approved/);
  c.reviews.value = capture().reviews.value; c.reviews.value[0].sha = OLD;
  a.match(view(prove(c)).summary, /older version/);
  c.reviews.value = capture().reviews.value; c.reviews.value[0].userId = c.identity.authorId;
  a.doesNotMatch(view(prove(c)).summary, /older version/);
});
test('unavailable rules and unknown codes never invent a fix', () => {
  for (const code of ['RULES_UNAVAILABLE', 'SOME_FUTURE_GAP']) {
    const x = view(receipt(code)).items[0];
    a.match(x.nextAction, /specific fix/); a.doesNotMatch(x.summary, /SOME_FUTURE/);
    a.equal(x.automaticRecheck.state, 'NO_KNOWN_TRIGGER');
  }
});
test('boundary remediation never weakens the policy', () => {
  const r = receipt('PROTECTED_BOUNDARY');
  const x = view(r).items[0]; a.match(x.nextAction, /additional evidence/);
  a.doesNotMatch(x.summary, /vulnerab/i);
  const s = view(receipt('PROTECTED_BOUNDARY_APPROVAL_REQUIRED')).items[0];
  a.doesNotMatch(s.nextAction, /standard preset|move|disable/);
});
test('queue validation and membership gaps have different actions', () => {
  const r = receipt(); r.summary.target.value.kind = 'MERGE_GROUP';
  a.match(view(r).summary, /current merge-queue version/);
  a.match(view(receipt('CURRENT_MERGE_GROUP_SELECTION_UNAVAILABLE')).items[0].nextAction, /cannot confirm queue membership/);
});
test('gate consequence requires policy, required check, and current observation', () => {
  const r = receipt(); r.summary.gate = { required: true };
  a.equal(view(r, { preset: 'REPOSITORY_REQUIREMENTS' }).mergeConsequence.state, 'BLOCKED');
  a.equal(view(r).mergeConsequence.state, 'ADVISORY');
  r.summary.gate.required = false;
  a.equal(view(r, { preset: 'REPOSITORY_REQUIREMENTS' }).mergeConsequence.state, 'ADVISORY');
  delete r.summary.gate;
  a.equal(view(r, { preset: 'REPOSITORY_REQUIREMENTS' }).mergeConsequence.state, 'UNKNOWN');
  a.equal(view(r, { preset: 'REPOSITORY_REQUIREMENTS', state: 'UNAVAILABLE' }).mergeConsequence.state, 'UNKNOWN');
});
test('automatic event path needs tracked open PR; manual and unknown gaps stay manual', () => {
  const r = receipt('INSUFFICIENT_CURRENT_HUMAN_APPROVAL');
  a.equal(view(r, { tracked: true }).items[0].automaticRecheck.state, 'EVENT_DRIVEN');
  a.deepEqual(view(r, { tracked: true }).items[0].automaticRecheck.events, ['pull_request_review']);
  a.equal(view(r).items[0].automaticRecheck.state, 'NO_KNOWN_TRIGGER');
  r.identity.prState = 'closed';
  a.equal(view(r, { tracked: true }).items[0].automaticRecheck.state, 'NO_KNOWN_TRIGGER');
  a.equal(view(receipt('RULES_UNAVAILABLE'), { tracked: true }).items[0].automaticRecheck.state, 'NO_KNOWN_TRIGGER');
});
test('VERIFIED FAIL and STALE never show NOT PROVEN remediation', () => {
  for (const verdict of ['VERIFIED', 'FAIL', 'STALE']) {
    const r = receipt(); r.verdict = verdict; a.equal(view(r), null);
    a.doesNotMatch(html(r, { state: 'CURRENT' }), /aria-label="NOT PROVEN remediation"/);
  }
  const r = receipt(); a.equal(view(r, { state: 'STALE' }), null);
  a.match(html(r, { state: 'STALE' }), /RE-PROOF REQUIRED/);
});
test('JSON addition and rendering preserve original receipt and policy; details are underneath', () => {
  const r = receipt(); const original = JSON.stringify(r); const current = { state: 'CURRENT' };
  const gate = policy.evaluate(r, current); const beforeGate = JSON.stringify(gate);
  const m = build(r, current, gate); const output = html(r, current, gate, m);
  a.equal(JSON.stringify(r), original); a.equal(JSON.stringify(gate), beforeGate);
  a.ok(output.indexOf('What to do:') < output.indexOf('<summary>Technical details</summary>'));
  a.ok(JSON.parse(JSON.stringify({ receipt: r, current, gate, remediation: m })).remediation.items[0].reasonCode);
  const summary = check.summary(r, current, gate, m);
  a.ok(summary.length < 6000); a.match(summary, /Action:/); a.match(summary, /Merge:/);
  a.doesNotMatch(summary, /```/); a.equal(check.conclusionFor(r, current, gate), 'neutral');
});
test('untrusted reason never becomes HTML', () => {
  const r = receipt('<script>alert(1)</script>');
  a.doesNotMatch(html(r, { state: 'CURRENT' }), /<script>alert/);
});
