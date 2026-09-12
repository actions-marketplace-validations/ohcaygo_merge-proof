# MERGE-PROOF-RULESET-FIRST-CLASS-001

FINAL: BLOCKED — one owner-only GitHub ruleset action.

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

RYAN ACTION: In https://github.com/ohcaygo/merge-proof/settings/rules import
`ruleset-first-class-001/owner-ruleset.json` and save it Active. This creates one
new ruleset targeting only the new temporary base, with no bypass actors, the
two existing publisher-bound required checks and existing HEADGREEN queue
parameters. The JSON was derived from the actual existing acceptance ruleset.
Do not change the existing ruleset or any classic protection.

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

NEXT: Ryan imports and activates the prepared ruleset on the temporary base.
