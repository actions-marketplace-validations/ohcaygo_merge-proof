"use strict";
const descriptions = {
  RULES_UNAVAILABLE: "The applicable repository rules could not be read.",
  LIVE_PR_NOT_OPEN:
    "This is not an open PR; a live merge-state receipt cannot be established.",
  APPLICABLE_MERGE_STATE_UNAVAILABLE:
    "The current combined candidate/base state could not be confirmed.",
  CURRENT_STATE_EXECUTION_NOT_PROVEN:
    "Required validation execution is not proven for the applicable current state.",
  CHECK_EVIDENCE_UNAVAILABLE:
    "Required check or status evidence could not be retrieved.",
  NO_REQUIRED_VALIDATION_CONFIGURED:
    "No required validation was configured in the observed rules.",
  INSUFFICIENT_CURRENT_HUMAN_APPROVAL:
    "There are not enough eligible human approvals on this exact candidate.",
  REVIEWS_UNAVAILABLE: "Review evidence could not be read.",
  LAST_PUSH_ACTOR_APPROVAL_UNAVAILABLE:
    "Approval by someone other than the latest pusher has not been established.",
  CODE_OWNER_APPROVAL_UNAVAILABLE:
    "Required code-owner approval has not been established.",
  CHANGES_REQUESTED_OBSERVED: "A latest review decision requests changes.",
  REMOTE_CANDIDATE_NOT_CONFIRMED:
    "The remote branch could not be confirmed at the candidate SHA.",
  EVIDENCE_CHANGED_DURING_COLLECTION:
    "Relevant evidence changed while it was being collected.",
  TARGET_BINDING_MISMATCH:
    "The validation target does not match this candidate and base.",
  CURRENT_MERGE_GROUP_SELECTION_UNAVAILABLE:
    "GitHub did not confirm this exact group as the current queue entry.",
  UNSUPPORTED_REPOSITORY_REQUIREMENTS:
    "Some applicable repository requirements cannot be established by this implementation.",
  HISTORICAL_RULES_AND_APPROVAL_VALIDITY_UNAVAILABLE:
    "Rules and approval validity at the historical merge time are unavailable.",
  BASE_DRIFT_UNVERIFIED:
    "The base moved in files changed by the candidate; the existing base-drift evidence gap remains.",
  PROTECTED_BOUNDARY:
    "This change touches a designated high-impact boundary requiring explicit review and validation.",
  GIT_HISTORY_UNAVAILABLE:
    "Required Git history or complete path evidence was unavailable.",
};
const describeGap = (code) => descriptions[code] || code;
function next(gaps) {
  if (gaps.includes("RULES_UNAVAILABLE"))
    return "Connect repository access that can read the applicable rules, then re-run proof.";
  if (gaps.includes("GIT_HISTORY_UNAVAILABLE"))
    return "Obtain complete supported Git metadata, or run the offline verifier with full history.";
  if (gaps.includes("LIVE_PR_NOT_OPEN"))
    return "Select an open PR for live proof, or use the bounded historical scan.";
  if (gaps.includes("BASE_DRIFT_UNVERIFIED"))
    return "Update the candidate with the current base, run validation again, and re-run proof.";
  if (gaps.includes("CURRENT_STATE_EXECUTION_NOT_PROVEN"))
    return "Run the required validation against the applicable current state, then re-run proof.";
  return gaps.length
    ? "Resolve the listed evidence gaps and run proof again against the current state."
    : "Evidence established for the recorded state and policy. Recheck before merging.";
}
module.exports = { describeGap, next };
