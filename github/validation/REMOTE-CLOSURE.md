# Remote closure — 2026-09-10

Status: PARTIAL. Development live App acceptance is unperformed; draft PR creation
was blocked by the GitHub connector's approval requirement under session approval
policy `never`. The explicit owner authorization allowed normal candidate branch
publication, which succeeded. The approval restriction was not bypassed via a
second write mechanism. The ready-to-use description is `../dev/DRAFT-PR.md`.

## Current truth

Fetched main: `dab4c4b896a4ff704603e4945edfce87c43fd4e5`, unchanged.
Original candidate `f33b36b8ae819ffe58c12f62d047a59fae5c0e38` was pushed and its
remote SHA independently confirmed by `git ls-remote`. This closure is a normal
descendant on `codex/exact-state-github-product`; no rebase, reset, main merge or
production deployment. Eleven inherited factory/launch commits remain in the
complete diff. Pre-existing untracked `.cursor/` was preserved and not committed.

## One complete independent review, then fixes

`INDEPENDENT-REVIEW.md` records the independently fetched original remote SHA,
full 77-file review, commands and evidence. Original verdict: NEEDS_FIXES.
All three findings repaired:

1. Classic signature/linear-history rules now survive collection and fingerprinting.
   Unsupported enabled rules cause NOT_PROVEN, and changed rules stale old receipts.
2. Failed optional stale-check PATCH records delivery UNAVAILABLE while allowing
   core evidence collection and a new receipt to proceed.
3. Pages bundle copies a route manifest including `/proof/*`; existing factory
   routes are preserved.

Added regression coverage plus an owner-run live acceptance observer. Reviewer
asked for fixes and affected rechecks, not another complete review. Fix tests
were run by the builder; the original review is not misrepresented as approving
the subsequent exact SHA. App-auth comment corrected; owner documentation added.

## Actually run in this continuation

| Command | Result |
|---|---|
| `npm test` | 26/26 local/CLI/Action; 9/9 pilot report passed |
| `npm run test:github` on original candidate | 79/79 passed |
| `npm run test:github` after fixes and acceptance observer | 84/84 passed, Node v24.12.0 |
| `npm exec --cache /tmp/merge-proof-npm-cache --yes --package=node@18.20.8 -- node --test github/test/*.test.js` | 84/84 passed |
| `npm run test:factory` in archived `ef7e0ae` pre-exact-state baseline | 34/35, RETRY vs DELIVERED at journey.test.js:270 |
| `npm run test:factory` in candidate | 34/35, same failure |
| `node factory/deploy/build-pages.js /tmp/mp-closure-pages-bundle /tmp/mp-closure-existing-public-sample.pdf` | Passed; generated `_routes.json` includes `/proof/*`, no deployment |
| `node --check github/dev/acceptance.js` | Passed |
| `git diff --check` | Passed |
| Owner packet's two Node configuration snippets, using temporary config and generated synthetic RSA key | Both passed, mode 0600; no real credentials |

The first Pages build attempt using `samples/kiota.pdf` correctly failed its
pre-existing public-sample SHA guard. The verified public sample was downloaded
read-only and used for the successful build; no checksum/test was weakened.

PDF/Chrome: unchanged pre-existing delivery failure, confirmed independently on
both sides. This continuation did not re-run the direct Chrome SIGABRT diagnostic;
the original recorded diagnostic remains in RESULTS.md. No PDF infrastructure
repair attempted, and HTML/JSON acceptance does not depend on it.

## GitHub-hosted validation

No draft PR was created: connector `github_create_pull_request` returned
“MCP tool call requires approval, but approval policy is never”. Candidate run
lookup returned an empty list. `.github/workflows/self-check.yml` triggers on
push to **main** and on **pull_request**; candidate-branch push alone does not
satisfy either trigger. There is no workflow_dispatch entry. Consequently no
hosted workflow/run/jobs/results or tested merge SHA can truthfully be reported.
Do not treat zero runs as success or push main to trigger CI.

After authorized draft creation, record `self-check` run ID, URL,
head SHA and each job result. PR checkout defaults to the synthetic merge ref;
record checkout SHA/parents from the checkout logs as distinct from the run's
head SHA. Expected jobs: test Node18/20/22, dogfood existing Action, pilot-report,
no-dependencies, factory, GitHub evidence Node18/22 (9 total). Skipped/pending/
failed states must remain explicit. A hosted PDF failure requires actual logs
before being attributed to the known local baseline.

## Protected boundary and privacy

Self local analysis against main: NOT_PROVEN / PROTECTED_BOUNDARY, billing
`factory/stripe.js` (inherited) and schema `github/receipt.schema.json` (new remote
contract). Base advance 0, overlapping files 0; CI configuration is advisory.
The review covers these paths; it does not automatically waive the deterministic
finding. No exclusion was added, and no vulnerability is implied.

Mandatory raw HMAC precedes webhook parsing. Keys/secrets are outside Git and no
real App credential was obtained. Anonymous receipt retrieval requires intentional
publication and currently public repository identity; otherwise access is denied.
Tokens are transient; no repository tree is sent to an LLM. Local CLI and Action
compatibility tests pass. This continuation changes no Stripe/payment/local CLI/
Action implementation. No pricing, main merge, production deployment or SKYNET.

## Owner gate

`../dev/OWNER-SETUP.md` contains exact permissions, events, fields, actual env names,
private local placement and commands. `../dev/acceptance.js` observes real saved
signed delivery IDs, retrieves authorized HTML/JSON, rejects anonymous access,
and compares original immutable receipt/stale currentness against changed-head
re-proof. Its assertion tests are not live App acceptance. Registration/install,
credentials and live event → evidence → receipt → change → stale/re-proof remain
unperformed. The draft/hosted-CI approval-policy gate is separate and unresolved.

Published closure code revision: `729fbda1ac27bafc5acc9af443352bde4ff199ca`.
`git ls-remote` confirmed that SHA on the candidate branch and unchanged main.
Final self-analysis at that revision remains NOT_PROVEN for the same two paths.
