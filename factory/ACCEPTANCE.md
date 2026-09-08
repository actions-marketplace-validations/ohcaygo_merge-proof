# Merge-Proof skinny factory — implementation return

Recorded September 7, 2026 (America/Chicago).

The factory is implemented and locally tested. The single independent review's
two concrete defects are fixed and affected behavior has been rechecked.
**FACTORY_FINISH_LINE: NOT_ACHIEVED** because no actual Stripe TEST Payment Link
transaction has been completed. Stripe test configuration was absent from the
workspace/environment and its private configuration-file path was requested from
Ryan. Synthetic Stripe fixtures are not presented as a real test transaction.

| Required return field | Result |
|---|---|
| PRODUCT | Merge-Proof Standard Evidence Pack |
| LOCATION | `/Users/ryanwilliams/Documents/ChatGPT/OHCAYGO Foundry/merge-proof` |
| SOURCE_COMMIT | `dab4c4b896a4ff704603e4945edfce87c43fd4e5` — fetched current public origin/main |
| FACTORY_COMMIT | `5efae84a255bb0984ea23be5a90167367ae3bc5a` — implementation plus review fixes; this acceptance record is a subsequent documentation-only commit |
| CURRENT_PUBLIC_MERGEPROOF_PRESERVED | YES. Existing src/, bin/, Action, historical collector and Kiota sample unchanged; no push or integration performed. |
| OFFER_PAGE | PASS locally: offer, verdict definitions, limitations, deliverables, eligibility, configured-price adapter, failed-run principle and both deferred gaps. Browser rendered; checkout honestly unavailable without config. |
| KIOTA_SAMPLE_LINK | PASS — existing sample served at `/sample`; explicit public-methodology / not-a-customer disclaimer and original coverage caveat. |
| ELIGIBILITY | PASS — real Git preconditions, bounded scope, public access checks, no verdict/findings in free output; actual browser reached ELIGIBLE for pallets/click #3781. |
| PAYMENT | Stripe Payment Link; client_reference_id bound to eligible order; timestamped raw-body HMAC verification; Stripe session retrieval verifies paid status, mode, link, SKU, quantity, contact, transaction and authoritative amount. Idempotent persistence precedes acknowledgement. |
| TEST_PAYMENT | FAIL / NOT EXECUTED — no actual Stripe TEST transaction. Signed synthetic fixture webhook tests pass. |
| REPOSITORY_INPUT | Public GitHub repository URL plus one PR. Open PR or explicit two-parent merge supported. Private, squash/rebase and ambiguous/oversized history rejected before payment. |
| GITHUB_APP_PERMISSIONS | NOT_REQUIRED — public-only input. No GitHub App or PAT workflow. Private adapter tests verify rejection; successful private-repo analysis is not implemented or claimed. |
| LEAST_PRIVILEGE | PASS for supported public path: unauthenticated public GitHub reads; no GitHub write, organization, repository-secret or customer-token access. |
| ISOLATED_RUNNER | New mode-0700 bare repository per attempt; shipped analyzer only; no customer checkout/code/config/hooks/submodules executed. Scrubbed environment, restricted Git protocols, one job, POSIX CPU/file/descriptor limits, JS heap limit, wall timeout and disk monitor. Process isolation, not a VM/container. |
| EPHEMERAL_CLEANUP | PASS — disposable Git dirs absent after success, report failure and timeout; public proof cleanup true. |
| FINAL_HEAD_CI | PASS — latest declared name/App check must complete successfully on exact relevant SHA: open candidate head or supported landed merge SHA. Unresolved/missing/non-success cannot pass. CI_NOT_APPLICABLE never inferred for this SKU. |
| WRONG_SHA_CI_TEST | PASS — unit cases, full fixture journey and controlled withholding replay of authentic public wrong-SHA checks all remain NOT_PROVEN. |
| CANDIDATE_BOUND_APPROVAL | PASS — standing non-author human OWNER/MEMBER/COLLABORATOR approval must bind to exact candidate commit. Latest submitted decision, dismissal and outstanding qualifying changes requests handled; unknown binding blocks. |
| STALE_APPROVAL_TEST | PASS — unit cases and authentic pallets/itsdangerous #133 approval mismatch remain NOT_PROVEN. |
| VERDICT_SEMANTICS_PRESERVED | PASS — local FAIL preserved; existing blocking findings plus missing CI/review evidence prevent VERIFIED. NOT_PROVEN does not mean defective code; VERIFIED does not prove correctness. |
| DEFERRED_GAPS_DISCLOSED | PASS — CANDIDATE_DURABLE_ON_REMOTE and SCOPE_CREEP_VS_DECLARED_SCOPE visible in offer, report and handoff. |
| REASSESSMENT | PASS — exactly one successful reassessment, original immutable, same repo/PR and CI policy; current candidate reconfirmed. Diff includes prior/current verdict, evidence changes, resolved/remaining/new finding IDs. |
| REPORT | PASS — existing report system/styling reused; PDF, HTML, JSON, CI/review sections, diff, method/limits, landed-state SHA and manifest. Real PDFs generated and visually inspected. |
| SECURE_DELIVERY | PASS locally — 256-bit capability, stored hash, expiring HttpOnly cookie, same-Origin POSTs, registered order/run artifact whitelist. No cross-order or unauthenticated file route; no caching/referrer. |
| ACTION_HANDOFF | PASS — Markdown with existing Action, relevant refs/config, rerun instructions and coverage distinction; no installation wizard. |
| EXCEPTION_STATES | AUTH_FAILED, NOT_ELIGIBLE_AFTER_PAYMENT, UNSUPPORTED_HISTORY, AMBIGUOUS_SHA, RUN_FAILED, REPORT_FAILED, REFUND_REQUIRED; RETRY and MANUAL_EXCEPTION customer choices; unbound/duplicate purchase and expired-undelivered cases retained for Ryan. |
| REFUND_REQUIRED_PATH | PASS — Ryan-owned durable local exception inbox. Expired undelivered purchases/failed reassessments escalate idempotently before access removal. |
| AUTO_REFUNDS | NO |
| ASYNC_ZERO_RYAN_HAPPY_PATH | FAIL / NOT FULLY PROVEN with real Stripe. Local fixture HTTP journey completes with zero manual intervention; actual browser eligibility passed. |
| PUBLIC_PROOF_REPOS | pallets/click and pallets/itsdangerous — four authentic PR captures plus one explicitly labeled wrong-SHA withholding replay; details below. No customer claim. |
| REGRESSION_TESTS | `npm test`: 26/26 analyzer + 9/9 report tests pass. Independently reproduced by reviewer. |
| NEW_TESTS | `npm run test:factory`: 27/27 candidate tests pass, independently reproduced. Added five retention/report regressions pass. Post-fix `node --test factory/test/journey.test.js factory/test/retention.test.js`: 11/11 pass. 32 unique factory tests covered across these runs. |
| END_TO_END_FACTORY_TEST | FAIL for required actual Stripe TEST checkout; PASS for clearly labeled synthetic-Stripe HTTP journey with real Git/PDF/download/reassessment. |
| PRIVACY_SECRET_CHECK | PASS within supported local/public scope: credential-pattern scan, secret-scrub tests, no local paths in delivered JSON, no review bodies/source contents in captures, protected download routes, ephemeral cleanup. Not a claim of deployed security certification. |
| INDEPENDENT_REVIEW | One independent non-Claude Codex reviewer, `/root/independent_factory_review`; [saved review](review/independent-review.md). Reviewed immutable 65151f2012ec36d698df526e85ff0249f7b88370; two P2 lifecycle findings repaired. External Stripe acceptance blocker remains. |
| FIXES_AFTER_REVIEW | Paid expiry refund escalation; active-only eligibility capacity; focused tests. Also corrected factory report “Landed state” label and recorded merge SHA. No second broad review. |
| KNOWN_LIMITATIONS | Missing real Stripe test acceptance; public-only; one PR; two-parent/open history only; declared check-run policy rather than every branch rule/status/CODEOWNER requirement; no approval-at-merge reconstruction; process isolation; single Node service/private persistent JSON store; seven-day delivery/reassessment; customer saves private link; no email recovery; unauthenticated GitHub API limits fail closed. |
| FILES_CHANGED | factory/ service, adapters, runner, offer, reports, tests, public proof, configuration example, operating and review docs; package scripts, README, ignore rules and a factory CI job. |
| EXTERNAL_ACTIONS | Read-only origin fetches and public GitHub API/Git reads; official Stripe/GitHub documentation reads; pinned Prettier fetched to a temporary cache. Local loopback service and Chrome PDF generation. No outreach, posts, purchases, API writes, customer repo publication, push, integration or deployment. |
| FULL_PLATFORM_FEATURES_ADDED | NONE |
| CLAUDE_USED | NO |
| FACTORY_FINISH_LINE | NOT_ACHIEVED |
| BLOCKER | Provide the existing private Stripe TEST configuration path containing test secret key, webhook secret, one-time Payment Link ID and price ID, with a matching test webhook/return URL. Then complete and verify the real disposable-customer Payment Link transaction through report delivery and reassessment. No real purchase is required or authorized. |
| NEXT | STOP. No continuous monitoring, multi-repo, subscriptions or V2. |

## Public methodology evidence

Preserved captures are in [proof/public-results](proof/public-results/summary.json).
They reflect capture-time evidence, not a claim of correctness or a customer relationship.

| Public PR | CI | Approval | Result |
|---|---|---|---|
| [pallets/click #3827](https://github.com/pallets/click/pull/3827) | Exact candidate SHA | Missing | NOT_PROVEN |
| [pallets/itsdangerous #428](https://github.com/pallets/itsdangerous/pull/428) | Exact candidate SHA | Missing | NOT_PROVEN |
| [pallets/click #3781](https://github.com/pallets/click/pull/3781) | Exact landed merge SHA | Exact candidate approval | VERIFIED under the recorded selected checks only |
| [pallets/itsdangerous #133](https://github.com/pallets/itsdangerous/pull/133) | Missing | Stale candidate approval | NOT_PROVEN |
| click #3781 controlled withholding replay | Genuine candidate-SHA checks retained; landed-SHA checks intentionally withheld | Original authentic approval retained | CI_STALE_OR_OTHER_SHA / NOT_PROVEN |

The withholding experiment changes the available evidence subset and selects a
captured check name; it does not fabricate SHAs, approvals or outcomes, modify
GitHub, or claim that the live PR was missing its real landed-SHA CI.

## Local execution

From this repository:

```sh
PORT=4327 FACTORY_ORIGIN=http://127.0.0.1:4327 npm run factory:start
```

See [factory operation and Stripe test setup](README.md). The factory is a source
checkout extension; it is not bundled into the existing lean npm CLI tarball.
No external deployment is part of this acceptance result.
