# MERGE-PROOF-NOT-PROVEN-REMEDIATION-UX-001

FINAL: PASS
Production source: `caf4d9d79724e77a69036fd8a01a91f580829b51`.
Deployed release: `/opt/merge-proof/releases/remediation-caf4d9d`.

## Delivered

One deterministic presentation layer (`github/remediation.js`) builds a version-1
view from existing receipt gaps, check/review evidence, policy results, currentness,
and tracked-PR context. No evidence, permission, policy or verdict changes.

Covered: required validation missing, pending, failed, another version, execution
unavailable; missing/stale approvals and changes requested; unavailable/unsupported
requirements, including code-owner/last-push limitations; protected boundaries and
configured additional approvals; remote/target mismatch; merge-queue validation
and membership gaps; base movement and collection changes; closed PR, historical
requirements, Git history, and honest unknown fallback.

Different-state checks are called “another version”: a different SHA alone cannot
establish chronological age. Status-only evidence is not mislabeled old. An
ineligible approval on the current version is not mislabeled stale. Boundary advice
never suggests weakening policy. Existing local verdict semantics are untouched.

Hosted HTML answers what happened, why it matters, what to do, automatic recheck,
and merge status before a collapsed Technical details disclosure. The authenticated
customer list includes the leading explanation/action/recheck/consequence and
links to the complete receipt. Historical receipt views derive the same layer
without rewriting stored bodies. GitHub Check summaries include at most three gaps,
actions, recheck and consequence, with a pointer to the full receipt. A Check title
says policy reports failure rather than asserting an unobserved GitHub block.

Hosted JSON run/read/account responses add `remediation`; receipt schema version 2
and immutable bodies remain unchanged. Structured fields are documented in
`github/remediation.schema.json`: version, summary, mergeConsequence, items;
items contain reasonCode, summary, whatHappened, whyItMatters, nextAction,
automaticRecheck {state, events, text}, mergeConsequence {state, text}, and
policyBlocksGap. Non-NOT_PROVEN and STALE views return null.

Automatic recheck requires an open tracked PR, configured App/webhook credentials,
and a known handled event for that reason. The wording says queueing occurs when
the relevant event is received; it does not promise provider delivery, successful
execution or available allowance. Unsupported gaps retain manual/unknown status.
Merge consequence uses the existing policy result plus observed required-check
configuration and currentness. Advisory remains advisory; unknown remains unknown.
A required failing policy is described as blocking at the observation, with GitHub
receipt of the reported result required for enforcement.

## Representative final examples

1. Missing check: “A required check has not reported on this version at all.”
   Why: required validation that never ran cannot establish anything about this
   commit. Action: trigger the required validation on the current version.
   Tracked PR: recheck queues when a relevant check/workflow event arrives.
   Advisory policy: this result does not block the merge.
2. Old approval: “The approval on this pull request belongs to an older version
   of it.” Why: an approval covers its version, not later commits. Action: ask
   the reviewer to approve the current version. Tracked PR: recheck queues when
   a relevant review event arrives. Current required failing policy: blocked at
   the observation, subject to GitHub receiving the reported check.
3. Unavailable rules: “Merge Proof could not confirm all project requirements.”
   Action: review the unavailable requirements before relying on the receipt;
   the evidence does not establish a specific fix. Why: absent requirements
   cannot be proved satisfied. No automatic trigger known for this gap.
   Unconfirmed gate/currentness: merge status unknown.

## Tests actually run

Local Node v24.12.0:

- `npm run test:github`: final 155/155 PASS.
- `npm test`: CLI 26/26 and pilot-report 9/9 PASS.
- `npm run test:factory`: 36/37; existing real PDF delivery returned RETRY.
  A direct `src/pdf.printPdf` probe established Chrome SIGABRT. A second factory
  run reproduced it; no product code or acceptance criterion was weakened.
- `git diff --check`: PASS.
- Browser: fixture receipt visually inspected; Technical details expanded and
  exposed underlying evidence; final collapsed view showed plain-language answers.

Exact committed source was archived with `git archive --format=tar`, uploaded to
the existing host, extracted at `/opt/merge-proof/acceptance/remediation-caf4d9d`,
and executed as the service user with isolated fixture state:

```
runuser -u mergeproof -- sh -c 'cd /opt/merge-proof/acceptance/remediation-caf4d9d && npm run test:github > /tmp/remediation-github-host.log 2>&1 && npm run test:factory > /tmp/remediation-factory-host.log 2>&1 && npm test > /tmp/remediation-cli-host.log 2>&1'
```

Linux Node v20.19.2: GitHub 155/155, factory 37/37 (including real Git/PDF HTTP
delivery), CLI 26/26, reports 9/9 PASS. Existing required-gate, queue, accounting,
pricing, OAuth and onboarding tests passed. No new real payment or external
check-publication event was manufactured for acceptance.

REVIEW: implementation diff inspected locally; no independent review required by
current repository procedure for this bounded presentation change. None claimed.

## Production verification and rollback

Archive SHA256 local/host match:
`5b51f8c48f8485b462a0d3f86dd0f07911f7734fc1db6a1585ff3331b5ca00dc`.
Promotion used the existing release symlink and systemd service. Initial health
probes failed because they omitted the required proxy headers (first authentication,
then client IP); the probes were corrected to use the existing authorized proxy
key privately and the actual loopback client IP. No security control changed.
Final restart and authenticated `/proof/app.js` probe passed. Service active.
Public `https://merge-proof.ohcaygo.com/proof/app.js` returned the new rendering.
Deployed remediation source matched the tested source. A saved production
NOT_PROVEN receipt rendered the new layer with UNAVAILABLE currentness honestly.

Compared against the stopped-service backup: all four immutable receipt bodies,
policy map, full metering ledger and merge ledger unchanged. Meter hash:
`523e7444055da17433cbd2c75bd303ffaf74acbc959557cf167fb53c58d212ac`.

Rollback: point `/opt/merge-proof/current` at the retained
`/opt/merge-proof/releases/assurance-a14a28b` and restart `merge-proof`.
That release retains enforcing gate semantics. Preserve live state; do not restore
an old accounting snapshot during routine code rollback. Stopped-state backup is
`/var/lib/merge-proof/backups/pre-remediation-caf4d9d/{factory,pro}`.
Pages deployment, production configuration, App permissions and subscriptions
were unchanged. Rollback does not require reverting Pages.

SEMANTICS: VERIFIED / NOT_PROVEN / FAIL / STALE unchanged.
PRICING / METERING / FUNNEL: UNCHANGED.
REAL-MONEY: NONE.
KNOWN LIMITATIONS: unsupported evidence remains unsupported; event receipt is not
guaranteed; saved currentness and actual GitHub merge decisions remain unconfirmed
where not observed. No fresh real customer approval/check/merge event was generated.
RYAN ACTION REQUIRED: NONE.
NEXT: STOP.
