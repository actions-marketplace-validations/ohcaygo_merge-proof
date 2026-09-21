# MERGE-PROOF-RULESET-FIRST-CLASS-001

FINAL: PASS — deployed and verified after real ruleset-only acceptance.

The closure below supersedes the historical owner-action checkpoint in this file.

Candidate: `671b6e9f2ea45f9265b47675ffdfdaa65e309a85`, branch
`codex/ruleset-first-class-001`. No production promotion or main-branch push.

## Root cause and implementation

The applicable branch-rules REST API was already collected and normalized, but
classic protection's 404 was unconditionally unavailable when branch.protected
was true. GitHub sets that flag for ruleset-only protection too.

On that 404, the candidate asks GraphQL for the exact ref's classic rule. Only
an error-free response with matching repository/ref identity and an explicit
null confirms classic absence. Errors, missing fields and existing classic
rules remain unavailable. Classic 200 behavior remains unchanged. Active rules
still must be independently available; the existing two-pass consistency and
freshness model includes both sources. Ruleset provenance retains its source.

Checks retain App bindings; approval counts take the maximum across sources.
Strict/stale-review flags accumulate. Unsupported rules stay explicit. Restricted
updates now fail closed because the collector cannot prove bypass entitlement.
No GitHub protection, App permission, pricing, billing or ledger was changed.

Official behavior checked before editing:
- https://docs.github.com/en/rest/repos/rules#get-rules-for-a-branch
- https://docs.github.com/en/graphql/reference/git#ref
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets

The applicable branch endpoint handles GitHub targeting and active enforcement
at repository/organization levels; no local approximation of GitHub patterns.

## Verification actually run

Exact candidate archive SHA256:
`83a905c670b91941a3481bf0d48eb9152e3d3e4723f30107e4c9ede7c17426c5`.
Local and isolated host hashes matched. Extracted to
`/opt/merge-proof/acceptance/ruleset-671b6e9`, tests run as `mergeproof`.

Linux Node v20.19.2:
- `npm run test:github`: 170/170 PASS.
- `npm run test:factory`: 37/37 PASS, including real PDF/HTTP delivery.
- `npm test`: CLI 26/26, reports 9/9 PASS.
- `git diff --check`: PASS locally.

Local Node v24.12.0: initial GitHub run 167/169, two sandbox loopback EPERM
failures; authorized unsandboxed run 169/169 PASS. Added the final gate test,
then focused ruleset suite 15/15 PASS and all 170 passed on the host.
Local CLI 26/26 and reports 9/9 PASS. No failed test was labeled passing.
Logs are in `ruleset-first-class-001/`.

Ruleset-specific tests prove supported satisfied checks/reviews, failures and
missing approvals, required gate failure/success, denied/partial/mismatched
classic absence evidence, coexistence, unsupported/malformed rules, exact ref
encoding, pagination failure, rule-change STALE and re-proof. Existing classic,
merge_group, remediation, gate and service regressions passed in the full suite.
These are fixture regressions, not new live queue/ruleset-only acceptance.

## Live status and one owner action

Existing real ruleset 23000277 targets `codex/merge-assurance-acceptance-base`,
which also has classic protection. It cannot establish ruleset-only acceptance.
Published a separate temporary base `codex/ruleset-only-acceptance-base` at
`fac0f4ef30c6ca3477793ddda5296c1c22e9722d`, using the existing acceptance workflow
with its pull_request target updated. Read-only live evidence confirms this new
branch has no classic protection and no applicable rules yet. No acceptance PR
or enforcing check has been published for this mission yet.

RYAN ACTION (updated after live reinspection): Edit the existing Active ruleset
"Merge assurance temporary acceptance" (23000277) at
https://github.com/ohcaygo/merge-proof/settings/rules/23000277 and add
`refs/heads/codex/ruleset-only-acceptance-base` to its included branch targets.
Keep the existing target and all requirements. Do not create another ruleset.

The earlier owner-ruleset.json import proposal is superseded and must not be
executed. Ryan explicitly instructed reuse of the existing ruleset.

Live reinspection confirmed the existing ruleset still targets only
`refs/heads/codex/merge-assurance-acceptance-base`; its updated_at remains
2026-09-12T03:17:19.008Z. That branch still has classic protection rule
`BPR_kwDOUKNU8M4E86W-`, requiring assurance acceptance validation from App 15368.
The prepared ruleset-only branch remains unprotected with no applicable rules
and explicit GraphQL branchProtectionRule:null. Active status by itself does
not establish ruleset-only configuration. No new live acceptance was claimed.

Ruleset administration is explicitly outside this mission's delegated scope.
The App retains Administration: read; no additional authority is requested.

After that action: create the bounded failing acceptance PR, observe required
failure, fix only its acceptance state, observe success and stale/re-proof,
verify the real merge group, then promote through the existing path if accepted.
No live ruleset-only verdict or production fix is claimed now.

## Production and rollback

Current production source remains `caf4d9d79724e77a69036fd8a01a91f580829b51` at
`/opt/merge-proof/releases/remediation-caf4d9d`; systemd is active. Deployed
collector and rules source hashes match that commit. No symlink restart,
configuration, Pages, ledger or runtime-state mutation occurred.

For a future accepted promotion retain remediation-caf4d9d as rollback. Restore
that symlink and restart the existing service without restoring old accounting
state. Existing older rollback releases remain preserved.

Known unsupported: required signatures, linear history, deployments, workflows,
code scanning, review threads/teams, code-owner and last-push evidence, restricted
updates, ALLGREEN other-entry evidence, unknown rules, and unavailable/partial
provider evidence. These do not become VERIFIED merely because checks pass.

NEXT: Ryan adds the prepared temporary base to the existing ruleset targets.


## Final closure — 2026-09-12 15:45 UTC

Ryan added the prepared base as a second target on existing ruleset 23000277.
No new ruleset was created. The original target and requirements remain intact.
Live collection confirmed protected:true, explicit classic absence, and the
applicable ruleset checks/HEADGREEN queue with no unsupported requirements.

Real acceptance: https://github.com/ohcaygo/merge-proof/pull/8
- Failing head: `3a8d888db9de75fe9530c79bdbe68a872ae0eb9c`.
  Validation check 103577389292 failed. Receipt
  `2276d87d-d1fb-46b1-9f3c-2c6c670a8720` was NOT_PROVEN/CURRENT solely for
  CURRENT_STATE_EXECUTION_NOT_PROVEN; no RULES_UNAVAILABLE. Merge Proof check
  103577518352 failed; GitHub mergeable_state was blocked.
- Changed only acceptance/state.txt from pending to ready. Satisfied head:
  `90bfb0edf7d26f932c22a3ac4bd139f2496dd65d`. Validation check 103577604536 passed.
  Receipt `322d1fd2-a7ae-4dc3-b993-cfd383de81dc` was VERIFIED/CURRENT with no
  gaps; Merge Proof check 103577692815 passed; GitHub reported clean.
  Signed synchronize/check/workflow events automatically staled old receipts
  and re-proved the new head. Remediation described the failed check and the
  event-driven rerun accurately.
- First queue attempt was safely removed after an event invalidated currentness
  during publication. No protections or conclusions were weakened. After the
  ordinary PR re-proved, normal queue admission was retried.
- Final group `cc273b4759383a6c72873e74552a5ee1b31f7cb0` had successful actual
  validation check 103578108204 (workflow run 34703059496). Receipt
  `56b3ff3e-4e1b-4851-afa8-db635c858ad3` was VERIFIED/CURRENT with matching live
  queue selection and no gaps. Head check 103578173319 and group check
  103578174151 both published success. GitHub merged through its queue into
  only the temporary base at that exact group SHA, 2026-09-12T15:43:28Z.
- Signed merge events preserved durable merge record
  `60a25a46-0655-4da5-874c-29d0c191a96e`, PROOF_BOUND_TO_MERGED_STATE. Historical
  verdict is retained; decision-time currentness remains honestly unavailable
  because no atomic GitHub merge decision was observed. Receipts became STALE
  after the merge event. Same-head/group retries added no second debit.

No source changes followed candidate 671b6e9. Its previously recorded Linux
170 GitHub, 37 factory, 26 CLI and 9 report tests remain applicable. No additional
review was required or claimed. The GitHub connector could not create the PR
(403); the authorized owner browser session created it without expanding App
permissions. Queue admission used GitHub's ordinary UI with no bypass.

Production is now `/opt/merge-proof/releases/ruleset-671b6e9`, exact SHA
`671b6e9f2ea45f9265b47675ffdfdaa65e309a85`. Existing immutable archive and release
symlink/systemd path used; authenticated backend asset and public application
asset both passed, service active. Deployed collector/rules hashes matched the
Linux-tested source. Production configuration and Pages were unchanged.

Deployed-code verification made fresh real ruleset-only and classic reads and
replayed the captured real failed/satisfied/group evidence with matching
verdicts. Identity boundary: production App 4901537 is installed on vera-mvp;
it is not installed on this acceptance repo. The first verification probe used
the wrong installation and failed; it was corrected by running the deployed
code with the existing acceptance App 4899448's short-lived read-only scoped
token, transported through process stdin and never written to disk. No App
installation or permission changed. This is deployed-code verification plus
public HTTP health, not a production-App customer acceptance event.

Backup `/var/lib/merge-proof/backups/pre-ruleset-671b6e9/{factory,pro}` was taken
with the service stopped. All immutable production receipt bodies, policies,
meter and merge ledger matched the backup after promotion. Meter hash remains
`523e7444055da17433cbd2c75bd303ffaf74acbc959557cf167fb53c58d212ac`.
Rollback: point `/opt/merge-proof/current` to retained
`/opt/merge-proof/releases/remediation-caf4d9d` and restart merge-proof, preserving
live state. No money transaction or billing/pricing/funnel change occurred.

Evidence: `ruleset-first-class-001/live/`. Earlier pending-owner instructions are
historical and superseded. No remaining owner action. NEXT: STOP.
