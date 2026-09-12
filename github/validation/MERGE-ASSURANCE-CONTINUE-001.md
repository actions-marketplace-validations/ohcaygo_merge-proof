# MERGE-PROOF-MERGE-ASSURANCE-CONTINUE-001

FINAL: PARTIAL — implementation and local acceptance complete; live required-gate/queue and Linux-host acceptance not established. Not deployed.

## Recovered truth

Canonical checkout: `/Users/ryanwilliams/Documents/ChatGPT/OHCAYGO Foundry/merge-proof`.
Branch: `claude/merge-assurance-weekend-001`.
Pre-task base: `615308b7933504dfc450c22bb3c9534db7eb83cf`.
Recovered commits: `1ddda8cb1b251388d8ca289f919f09b7789a7487`,
`5d08fdc6158657e1f4b5f133e42f2febed2c97a6`,
`3a37a21ee2f84c29b58d8ddded2aacbc8b244a45`.
Continuation code/review commit: `3551c9c00a631816ec2d76c5cdba380f773a1619`.

Git log/reflog confirm branch creation at the pre-task tip and all three commits.
Initial worktree was clean except pre-existing `.cursor/`; it was untouched.
Live `git ls-remote origin` showed base brand branch at 615308b, main at dab4c4b,
and no assurance branch. No push, PR, merge or deployment occurred in this continuation.

Claude implemented policy presets, admin-only gate setup, collision/self-reference
handling, dual check publication, immutable merge ledger, actor provenance and
plain-English gaps. Recovered change: 23 files, 3,246 additions, 170 deletions.

Exact recovered files:

```
github/PRODUCTION.md
github/README.md
github/actors.js
github/check.js
github/collect.js
github/customer-public.js
github/examples/receipt.html
github/examples/receipt.json
github/examples/receipt.txt
github/http.js
github/ledger.js
github/policy.js
github/proof.js
github/receipt.js
github/receipt.schema.json
github/service.js
github/setup.js
github/test/customer.test.js
github/test/delivery.test.js
github/test/fixtures.js
github/test/gate.test.js
github/validation/MERGE-ASSURANCE-WEEKEND-001.md
github/wording.js

```

## Handoff discrepancies

A durable Claude handoff did exist in the third commit. Both named fixes were
committed, not merely started. Its statement that the independent review was
incomplete is supported; no completed review artifact was found. Its local test
claims were reproduced at the recovered candidate (136 GitHub, 37 factory,
26 CLI, 9 reports). The historical pre-implementation 106-test baseline was not
independently rerun. Its gate-readiness refusal claim was overstated: the HTTP
route saved policy without enforcing readiness; this is now corrected. Strict
boundary approval completion was also contradicted by code and fixed.

## Independent review and repairs

One independent review of 3a37a21 against 615308b returned CHANGES_REQUIRED.
See MERGE-ASSURANCE-INDEPENDENT-REVIEW.md. No review-of-review was run.
All four P1 findings and the P2 ledger finding were addressed in 3551c9c:

- Policy changes invalidate receipts, queue re-proof, retract existing checks,
  enforce readiness and expose failed reconciliation rather than claiming activation.
- Two eligible current approvals satisfy the optional boundary policy while the
  original NOT_PROVEN boundary gap remains visible in the receipt.
- Each successful check ID is saved before another commit publication begins.
- Invalidation during publication immediately retracts the returned check;
  enforcing failures remain queued with a 30-second retry delay.
- Delayed merge events cannot borrow later receipts or today's policy as historical
  evidence. Full receipt snapshots are detached; delivery observations are separate
  from unavailable decision-time currentness. PR-head-only binding is explicit.

Additional correction: unknown App identity cannot waive a publisher-bound
same-name required check. Code-owner and last-push evidence limitations prevent
activation rather than encouraging removal of existing protections.

## Behavior

CATEGORY DISTINCTION NOW: reconciles evidence produced elsewhere against the
current merge state, publishes the owner's selected policy result, and preserves
historical evidence without inventing knowledge of GitHub's atomic merge decision.

REQUIRED MERGE PROOF GATE: owner/admin separately requires
`Merge Proof exact-state receipt` in GitHub (prefer binding to this App) and selects
an enforcing preset. Enforcing conclusions are success/failure; ADVISORY remains
the default. Merge Proof never edits repository protections. Pending external
updates mean the gate is not yet established.

AUTOMATIC OPERATION: signed relevant events stale old receipts, queue re-proof and
publish new checks. Own App check events are ignored to prevent loops. Policy
changes also queue reconciliation. Limits, exhausted new-head allowance, unavailable
provider evidence or App configuration can prevent completion.

DEFAULT POLICY: existing checks, approvals, rules and applicable exact-state
execution are collected. Unreadable or unsupported requirements remain gaps.
Protected boundaries are reported; an optional preset adds two eligible approvals.

OPTIONAL CONFIGURATION: repository admin selects policy and GitHub required-check
rule. Queue usage needs merge_group App subscription and compatible queue/CI setup.

NOT_PROVEN: what is missing, why, next action, automatic re-proof and policy
consequence are displayed; no claim that code is unsafe or defective.

DURABLE MERGE RECORD: repository/PR/head/target/landed identities, pre-merge receipt,
verdict/fingerprint, requirements, checks, approvals, gaps, actors and available
publication observations. `/proof/merges` lists/filters; `?record=<id>` exports JSON.
Scoped installation/repository authorization applies. 5,000-row bound and pruning
are explicit. Exact decision-time currentness is UNAVAILABLE.

ACTOR / AGENT ACCOUNTABILITY: observed PR/commit accounts, reviewers, check Apps,
workflow actors and merge account. UNKNOWN remains unknown. App/bot evidence does
not identify Claude/Codex/Cursor or prove how a human account created code.

CHECK-COLLISION: PASS in executed tests, including unknown App and foreign publisher.
MERGE-GROUP: PASS in fixture publication/identity tests; LIVE ACCEPTANCE NOT_PROVEN.
No claim of actual required-gate blocking or satisfied-gate merge acceptance.

PRO EXPERIENCE: acquisition flow preserved. Browser fixture rendered account and
repository selection, PR selection, gate settings, records and unchanged Pro prices.
This was a fixture UI inspection, not real OAuth or customer acceptance.

## Tests actually run

Node v24.12.0 locally:

- `npm test`: CLI 26/26 and reports 9/9 PASS.
- `npm run test:github`: final complete run 143/143 PASS.
- `npm run test:factory`: final complete run 37/37 PASS, including real Git/PDF fixture.
- `node --test github/test/gate.test.js`: final focused run 37/37 PASS.
- `node --test github/test/customer.test.js`: final focused run 3/3 PASS after
  adding HTTP readiness rejection coverage.
- `npm pack --dry-run`: 14-file local CLI/Action package remains unchanged.
- `git diff --check`: PASS.

The first sandboxed GitHub run was 134/136 due to two `listen EPERM` failures.
Rerunning with local-server permission passed; the environment failures are not
hidden. Regression coverage includes actual composite Action shell execution,
OAuth/receipt HTTP fixtures, unauthorized access, metering, same-head dedup,
publication races, retry, immutable snapshots and the 5,000-row capacity boundary.
No current-candidate live GitHub merge, queue, payment or production acceptance ran.

## Production truth and remaining boundary

Read-only SSH inspection found active `/opt/merge-proof/releases/brand-615308b`.
Deployed service.js and homepage SHA-256 values matched `git show 615308b` exactly:
`4e74b3f67090c3bd205a2b18e99c404e49899b7bc361e029ab91a0d0daaab15f`
and `f4b73a9f09ec6f18c7bcb95ff6c462c716dc95bf5aa69d072fca1c26f2b04693`.
App 4901537 has Checks write plus existing read scopes. Its live event list lacks
merge_group. It is installed on the private existing vera-mvp repository; no
repository protection, App subscription or PR was changed.

PRODUCTION: NOT DEPLOYED (assurance candidate).
DEPLOYED SHA: existing brand source `615308b7933504dfc450c22bb3c9534db7eb83cf`.
ROLLBACK: existing prior release symlinks remain intact; state preserved. After any
future enforcing rollout, rollback to code emitting neutral is gate-affecting and
must not silently weaken customers' required checks.
PRICING: UNCHANGED — free five + scan; $29/month/developer, 50 proofs; $5/5.
REAL-MONEY CHANGES: NONE.

A committed source archive was prepared locally for isolated host tests at
`/private/tmp/merge-assurance-3551c9c.tar`. Automatic approval review rejected its
upload to 161.35.59.206 because it found no trusted authorization to export that
payload to that destination. The upload/test command did not execute. No alternate
transport was used. Host-runtime acceptance therefore remains NOT_PROVEN.

RYAN ACTION REQUIRED: authorize the prepared source archive's upload to the existing
host for isolated fixture tests, and identify/authorize the repository+branch for
real required-check and merge-queue acceptance (including the App event setting).
These steps can affect the chosen repository's merge rules, so no target was assumed.
NEXT: execute that bounded acceptance; deploy only if the original criteria pass.

CORE PRINCIPLE: other tools create the evidence. Merge Proof reconciles it at the
merge point, applies the owner's requirement, and preserves what was established.
