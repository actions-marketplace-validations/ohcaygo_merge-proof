# Independent complete-candidate review

## VERDICT
NEEDS_FIXES for reviewed remote candidate f33b36b8ae819ffe58c12f62d047a59fae5c0e38: three concrete findings below. This is the single full review for development live acceptance, not integration or production approval. Owner-controlled real GitHub App acceptance remains unperformed. Builder fixes observed subsequently are not retroactively attributed to this immutable review.

## AUTHORITATIVE ORIGIN/MAIN
[ran] `git fetch origin` succeeded. Independently resolved main: dab4c4b896a4ff704603e4945edfce87c43fd4e5. The repository's actual main replaces the OHCAYGO-specific skill's develop reference, as explicitly instructed.

## CANDIDATE REVIEWED
Remote origin/codex/exact-state-github-product independently resolved to f33b36b8ae819ffe58c12f62d047a59fae5c0e38. Diff: dab4c4b896a4ff704603e4945edfce87c43fd4e5..f33b36b8ae819ffe58c12f62d047a59fae5c0e38. Merge base equals current main.

## REPOSITORY / WORKTREE STATE
/Users/ryanwilliams/Documents/ChatGPT/OHCAYGO Foundry/merge-proof. Initially tracked tree clean; untracked .cursor/ preserved. Builder later began fixes concurrently; findings and initial test execution concern pinned f33b36b. I made no source edits, commits, pushes or external writes. Review artifact only in /tmp.

## WHAT CHANGED
Full candidate has 77 files, 10,602 additions / 3 deletions: 11 inherited factory/launch commits plus exact-state commit. Inspected the factory's server/store/payment/authorization/runner/report/proxy flow and new collector/evaluator/rules/App/queue/HTTP/receipt/CLI/scanner paths, changed workflow and validation/tests. Existing Action and local CLI are unchanged. The source analyzer adds an injected metadata reader; local Git remains the default. No source/model/network dependency added to the local CLI.

## VERIFICATION PERFORMED
All commands below were independently run under Node v24.12.0.
- [ran] `npm test`: 26/26 verifier tests and 9/9 pilot-report tests passed.
- [ran] `npm run test:github`: 79/79 passed, including real local-Git metadata parity, real Action shell, HTTP authorized receipt flow, signed fixture webhook, stale history, restart and event-during-proof cases.
- [ran] `npm run test:factory`: 34/35; journey.test.js:270 expected DELIVERED, actual RETRY.
- [ran] `git archive ef7e0ae | tar -x -C /tmp/merge-proof-review-baseline-ef7e0ae`, then `node --test /tmp/merge-proof-review-baseline-ef7e0ae/factory/test/*.test.js`: 34/35, identical journey.test.js:270 RETRY versus DELIVERED. Existing factory delivery failure is pre-existing relative to the exact-state addition. No PDF repair attempted. Direct Chrome SIGABRT itself was not independently rerun here.
- [ran] `git diff --check origin/main f33b36b`: clean.
- [ran] `git diff origin/main f33b36b -- action.yml bin/merge-proof.js`: empty.
- [ran] `node bin/merge-proof.js --base origin/main --head f33b36b --json`: NOT_PROVEN, solely PROTECTED_BOUNDARY; base advancement 0, overlap 0.
- [ran] Pattern scan of pinned tracked files for private-key PEM headers and plausible GitHub/webhook token literals: no matches. This is a targeted check, not a claim of exhaustive secret detection.
- [ran] Actual Client -> collect -> prove fixture reproduction enabling classic required_signatures and required_linear_history: baseline VERIFIED, changed VERIFIED, previous currentness CURRENT, changed fields empty. Finding 1.
- [ran] Actual ProofService plus fixture Client, existing stale checkId and only PATCH denied: after three drains receipt count stays 1, queue emptied, subscription refreshState UNAVAILABLE. Finding 2.
- [read] Generated Pages routes omit /proof/* despite worker handling it. Finding 3.
- [not run] Real installed App event, external private receipt authorization, real merge queue, GitHub-hosted candidate workflows; these are not established by this review's fixture tests.

## SECURITY / SCHEMA / PROTECTED-BOUNDARY REVIEW
Webhook HMAC-SHA256 validation is mandatory before payload processing; >=32-character secret and timing-safe comparison. Installation JWT uses server-only key, short expiry, scoped repository ID; required token scopes are read except optional checks write. No repository policy mutation path. HTTP errors discard provider details; shared server and Pages set no-store. Receipt reads reauthorize current repository identity; anonymous requires intentionally published plus currently public. Private publication is refused. Tokens are transient. Stored receipts preserve historical verdict independently from freshness, and default unrefreshed receipt retrieval does not claim CURRENT.

Collector bounds requests/pages/files/workflows/reviewers and discards patch/review/check bodies. The local verifier's original no-network/no-model tests passed. Historical scan uses the same evaluator and explicitly withholds full VERIFIED because historical policy/approval validity is unavailable. Existing CLI and Action contracts remain intact.

Self result is expected path classification, not a vulnerability claim: billing boundary factory/stripe.js is inherited factory implementation; schema boundary github/receipt.schema.json is the new version-2 receipt contract. The CI workflow change is advisory only. The boundaries were inspected and tests run, but the product does not consume reviewer signoff as an automatic waiver; its self result remains NOT_PROVEN. No ignore/exclusion was added.

## DRIFT ANALYSIS
No upstream drift: merge base equals fetched main. Candidate is not integrated. No reconciliation required. The 11 inherited commits were explicitly authorized to preserve in this continuation; do not silently omit them when describing the remote candidate. Stripe code exists in the complete diff versus main but the exact-state change does not change that inherited Stripe implementation.

## FINDINGS
1. P1 — github/collect.js:87-110 and github/rules.js:57 onward omit classic signature/linear-history requirements. The collector drops required_signatures.enabled and required_linear_history.enabled before fingerprinting. An otherwise VERIFIED receipt remains VERIFIED/CURRENT when either control is enabled, with no changed evidence. Equivalent active ruleset requirements are correctly unsupported. GitHub documents these fields in GET branch protection: https://docs.github.com/en/rest/branches/branch-protection#get-branch-protection . Preserve these controls and their freshness lineage; until deterministically supported, enabled requirements must be explicit NOT_PROVEN limitations. Add collector-level false-VERIFIED and old-receipt staleness regressions. The README's noncomprehensive-classic-policy caveat does not make silent loss of these directly applicable controls a coherent rules/currentness result.

2. P2 — github/service.js:302-325 couples optional stale-check PATCH success to core re-proof. A failed PATCH throws before run(); after three attempts the job disappears without a new receipt, even when evidence reads work. Keep optional delivery failure explicit, preserve old stale receipt, but continue core receipt generation and its normal queue completion. Add regression where PATCH fails while reads/new proof succeed.

3. P2 — factory/deploy/build-pages.js:17 excludes /proof/* from generated _routes.json. Pages bypasses the worker for that namespace, so the new worker branch alone cannot deliver receipt/webhook routes from a built bundle. Include /proof/* and verify route manifest selection as well as worker behavior. No production deployment is required to repair or test this.

## INTEGRATION SAFETY
No main/base conflict indicated. Do not merge or deploy under this review. Three bounded fixes plus affected tests are needed; no second full review is requested. Existing baseline PDF limitation remains explicit and outside exact-state closure. Real signed GitHub event through evidence/receipt/state-change/stale/re-proof remains the owner acceptance gate after engineering closure.

## NEXT ACTION
Builder: repair the three concrete findings, run affected tests, publish the fixed candidate, and retain precise separation between fixture/local evidence and the owner's pending live App acceptance.
