"use strict";
// Presentation only. Never changes receipts, evidence, verdicts or policy results.
const { specialize } = require('./wording');
const EVENTS = {
  CURRENT_STATE_EXECUTION_NOT_PROVEN: ['check_run', 'check_suite', 'status', 'workflow_run'],
  INSUFFICIENT_CURRENT_HUMAN_APPROVAL: ['pull_request_review'],
  CHANGES_REQUESTED_OBSERVED: ['pull_request_review'],
  PROTECTED_BOUNDARY_APPROVAL_REQUIRED: ['pull_request_review'],
  NO_REQUIRED_VALIDATION_CONFIGURED: ['branch_protection_rule', 'repository_ruleset'],
  BASE_DRIFT_UNVERIFIED: ['push', 'pull_request'],
  REMOTE_CANDIDATE_NOT_CONFIRMED: ['push', 'pull_request'],
  TARGET_BINDING_MISMATCH: ['push', 'pull_request'],
  APPLICABLE_MERGE_STATE_UNAVAILABLE: ['pull_request', 'push'],
  CURRENT_MERGE_GROUP_SELECTION_UNAVAILABLE: ['merge_group'],
  EVIDENCE_CHANGED_DURING_COLLECTION: ['pull_request', 'push', 'check_run', 'pull_request_review'],
};
const FALLBACK = {
  plain: 'Merge Proof could not establish all required evidence.',
  why: 'Missing evidence cannot establish that the project requirements were met.',
  doNext: 'Review the missing evidence in Technical details before relying on this receipt. No specific fix is known.',
};
const OVERRIDES = {
  RULES_UNAVAILABLE: { plain: 'Merge Proof could not confirm all project requirements.', doNext: 'Review the unavailable requirements in Technical details before relying on this receipt. The evidence does not establish a specific fix.' },
  CHECK_EVIDENCE_UNAVAILABLE: { doNext: 'Review the unavailable check evidence, then check again. The evidence does not establish why access failed.' },
  REVIEWS_UNAVAILABLE: { doNext: 'Review the unavailable approval evidence, then check again. The evidence does not establish why access failed.' },
  APPLICABLE_MERGE_STATE_UNAVAILABLE: { doNext: 'Review the missing current-merge evidence below, then check again after the current merge state is available.' },
  EVIDENCE_CHANGED_DURING_COLLECTION: { doNext: 'Check again after the change settles.' },
  BASE_DRIFT_UNVERIFIED: { why: 'Earlier evidence does not establish the current combined result under the implemented policy.', doNext: 'Update this branch with the current base, run validation again, and check the current merge again.' },
  CURRENT_MERGE_GROUP_SELECTION_UNAVAILABLE: { doNext: 'Wait for the current queue entry to be available, then check again. Rerunning checks alone cannot confirm queue membership.' },
  PROTECTED_BOUNDARY: { plain: 'This change touches a designated high-impact area.', why: 'The receipt reports a protected-area evidence gap. Its effect on merging depends on your policy.', doNext: 'Review the protected-area evidence and complete any additional evidence required by your configured policy.' },
  GIT_HISTORY_UNAVAILABLE: { doNext: 'Review the missing history evidence, or use the offline verifier with full history.' },
};
function consequence(receipt, current, policy) {
  const required = receipt.summary?.gate?.required;
  if (!policy) return { state: 'UNKNOWN', text: 'Merge status unknown — the Merge Proof policy was not established.' };
  if (!policy.enforced) return { state: 'ADVISORY', text: 'Advisory only. Your Merge Proof policy does not block this merge.' };
  if (current?.state !== 'CURRENT') return { state: 'UNKNOWN', text: 'Current merge status is unconfirmed. This policy blocks an unconfirmed receipt if GitHub requires the check.' };
  if (required === false) return { state: 'ADVISORY', text: 'Advisory only. Merge Proof is not configured as a required check for this branch.' };
  if (required !== true) return { state: 'UNKNOWN', text: 'Merge Proof reports ' + policy.conclusion + ', but whether GitHub requires this check is unknown.' };
  return policy.conclusion === 'failure'
    ? { state: 'BLOCKED', text: 'Blocked by your Merge Proof policy at this observation. GitHub must receive the reported check result to enforce it.' }
    : { state: 'SATISFIED', text: 'This result satisfies your Merge Proof policy. The reported evidence gaps do not block under this policy.' };
}
function build(receipt, current, policy = null, context = {}) {
  if (receipt.verdict !== 'NOT_PROVEN' || current?.state === 'STALE') return null;
  const codes = [...new Set([...(receipt.gaps || []), ...(policy?.blocking || []).filter(x => x === 'PROTECTED_BOUNDARY_APPROVAL_REQUIRED')])];
  if (!codes.length) codes.push('UNKNOWN_EVIDENCE_GAP');
  const mergeConsequence = consequence(receipt, current, policy);
  const items = codes.map(reasonCode => {
    const known = specialize(reasonCode, receipt);
    const wording = known?.why ? known : FALLBACK;
    const g = { ...wording, ...OVERRIDES[reasonCode] };
    if (reasonCode === 'CURRENT_STATE_EXECUTION_NOT_PROVEN' && receipt.summary?.target?.value?.kind === 'MERGE_GROUP') {
      g.plain = 'The required validation has not been established for the current merge-queue version.';
      g.doNext = 'Wait for or rerun the required checks on the current merge-queue version.';
    }
    if (reasonCode === 'PROTECTED_BOUNDARY_APPROVAL_REQUIRED' && policy?.boundaryEscalation) {
      g.doNext = `Obtain ${policy.boundaryEscalation.required} eligible approvals on the current version; ${policy.boundaryEscalation.observed} are currently established.`;
    }
    if (reasonCode === 'PROTECTED_BOUNDARY' && policy?.boundaryEscalation?.satisfied) {
      g.doNext = 'The additional approvals required by your boundary policy are established. Review the reported boundary evidence; this gap remains in the receipt but does not block under this policy.';
    }
    const events = EVENTS[reasonCode] || [];
    const automatic = context.tracked === true && events.length > 0 && receipt.identity?.prState === 'open';
    const trigger = events.includes('pull_request_review') ? 'a relevant approval or review event' : events.includes('merge_group') ? 'a current merge-queue event' : events.includes('check_run') ? 'a relevant check or workflow event' : events.includes('branch_protection_rule') ? 'a project-requirements change event' : 'a relevant branch or pull-request change event';
    return {
      reasonCode, summary: g.plain, whatHappened: g.plain, whyItMatters: g.why,
      nextAction: g.doNext,
      automaticRecheck: { state: automatic ? 'EVENT_DRIVEN' : 'NO_KNOWN_TRIGGER', events: automatic ? events : [], text: automatic ? `Yes — Merge Proof queues a recheck when it receives ${trigger} for this tracked pull request. Completion depends on available access, evidence and allowance.` : 'No automatic trigger known for this gap in this view — refresh or rerun after resolving the evidence gap.' },
      mergeConsequence,
      policyBlocksGap: policy ? policy.blocking.includes(reasonCode) : null,
    };
  }).sort((a,b) => Number(b.policyBlocksGap === true) - Number(a.policyBlocksGap === true));
  return { version: 1, summary: items[0].summary, mergeConsequence, items };
}
function html(remediation, escape) {
  if (!remediation) return '';
  return `<section aria-label="NOT PROVEN remediation"><h2>NOT PROVEN</h2>${remediation.items.map(x => `<article><h3>${escape(x.summary)}</h3><p><strong>What happened:</strong> ${escape(x.whatHappened)}</p><p><strong>Why it matters:</strong> ${escape(x.whyItMatters)}</p><p><strong>What to do:</strong> ${escape(x.nextAction)}</p><p><strong>What happens next / Automatic recheck:</strong> ${escape(x.automaticRecheck.text)}</p></article>`).join('')}<p class="policy"><strong>Merge status:</strong> ${escape(remediation.mergeConsequence.text)}</p></section>`;
}
module.exports = { build, consequence, html, EVENTS };
