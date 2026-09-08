# Merge-Proof Standard Evidence Pack

The skinny factory extends the existing Merge-Proof repository. The public CLI,
Action, historical collector, Kiota sample, and local verdict semantics remain
unchanged. No model provider is used. No new package dependency is introduced.

The [commercial launch checklist](LAUNCH-READINESS.md) records remaining owner
actions separately from the achieved [factory acceptance](ACCEPTANCE.md).

## Run locally

Requirements: Node 22+ (tested on Node 24), Git, a POSIX shell, and Chrome/Chromium
for the existing PDF renderer. macOS and Linux are supported. The factory runs
one isolated job at a time. It is a single-process service with a durable local
JSON store, not a multi-instance or serverless deployment.

```sh
PORT=4327 FACTORY_ORIGIN=http://127.0.0.1:4327 npm run factory:start
npm test
npm run test:factory
node factory/exceptions.js
```

Open `http://127.0.0.1:4327`. Without Stripe configuration the offer and free
eligibility work, while checkout is unavailable. There is no runtime fake-payment
endpoint or fixture switch. Test dependency injection exists only in test code.

Copy `factory/config.example.json` into a private file outside the source tree,
set file mode 0600, and set `FACTORY_CONFIG` to that file. Set its real **test**
values from your Stripe account. Do not commit credentials. The environment
variables STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PAYMENT_LINK_ID,
STRIPE_PRICE_ID, FACTORY_ORIGIN and FACTORY_STATE_DIR override that file.

Use one one-time Stripe price and Payment Link, quantity one with no adjustable
quantity or recurring price. Configure the Payment Link to redirect after payment
to the exact configured origin plus `/#paid`. Its API object supplies the displayed
price. The retrieved paid Checkout Session supplies the authoritative transaction
amount and currency, even when they differ from the display price. No commercial
price is encoded in the production logic.

For a real Stripe test acceptance run, use Stripe CLI forwarding:

```sh
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to http://127.0.0.1:4327/webhooks/stripe
```

Use that listener's test webhook signing secret in the private config. Restart
the service when config changes. In the customer browser complete eligibility,
save the private link, and follow the returned Payment Link with its generated
`client_reference_id`. Complete a Stripe test-mode payment, return to this page,
authorize the same repository/PR, confirm scope, and download. Use the same page
for the one reassessment. Do not use `stripe trigger` as evidence of a real
Payment Link purchase; it normally has no matching eligibility reference/SKU.

Webhook delivery is acknowledged only after durable persistence. Concurrent
retries and distinct events for the same transaction do not grant extra runs.
The server retrieves session details from Stripe rather than trusting redirect
parameters, customer-submitted amounts, or merely the webhook's amount field.

## Supported scope and evidence

One public GitHub PR, either open or an explicit two-parent merge whose second
parent is the PR head. Squash/rebase merges and closed-unmerged PRs are rejected
before payment; reconstructing them is outside this factory's supported history.
A merged PR uses the landed merge SHA for CI and original head for approval.
An open PR uses the captured head for CI and approval. The base/head/CI SHA and
required checks are displayed for scope confirmation. If refs change during
preparation or capture, the customer must confirm again. Reassessment permits
new commits in the same PR, but keeps the same required CI policy.

Eligibility runs real Git precondition checks but returns no verdict or findings.
`ELIGIBLE` means a missing-evidence report can be delivered, not that CI or review
will pass. The customer declares the required check names and their GitHub App
IDs; the factory does not claim to infer all branch protection or rulesets.
Find these fields with GitHub's read-only check-runs API, or use this example:

```sh
curl https://api.github.com/repos/OWNER/REPO/commits/HEAD_SHA/check-runs
```

- CI: every declared name/App pair must have its latest check run completed with
  `success` and `head_sha` exactly equal to the relevant SHA. Missing, failing,
  skipped, neutral, pending, wrong-SHA or unreadable checks are blocking evidence
  gaps. The states are CI_MATCHES_RELEVANT_SHA, CI_MISSING,
  CI_STALE_OR_OTHER_SHA and CI_UNRESOLVABLE. CI_NOT_APPLICABLE is never used because
  this SKU requires CI. Nearby historical CI may be captured to explain staleness;
  it can never satisfy the target SHA. Commit-status-only CI is unsupported.
- Human approval: at least one non-author `User` with association OWNER, MEMBER
  or COLLABORATOR must have a current standing APPROVED review with `commit_id`
  equal to the candidate. Decisions are ordered by submission time then ID;
  comments do not erase decisions. Dismissals and later changes-requested reviews
  invalidate that review. Any outstanding qualifying changes-requested review
  prevents proof. No timestamp or review body is used to guess commit binding.
  Missing, stale, dismissed or unreadable evidence is blocking. CODEOWNER coverage,
  every repository approval policy and approval-at-merge time are not certified.
- Integration: preserve local FAIL; otherwise retain existing blocking findings
  and add CI_RAN_ON_FINAL_HEAD / HUMAN_APPROVAL_PRESENT for unmet evidence. Only
  no blocking finding permits VERIFIED. NOT_PROVEN is not defective code;
  VERIFIED is not proof of correctness.
- Deferred and disclosed in offer/report/handoff: CANDIDATE_DURABLE_ON_REMOTE and
  SCOPE_CREEP_VS_DECLARED_SCOPE. This build does not close either.

Private repository access is not implemented. Private-repository adapter tests
verify rejection before payment. GitHub App permissions: NOT_REQUIRED. No PAT,
installation token, GitHub write scope, org access, or repository secrets access.

## Isolation, delivery, exceptions

Each eligibility/paid attempt fetches full Git objects into a new mode-0700 bare
repository. The worker inherits a scrubbed environment, an empty HOME, disabled
user/system Git config, credentials, hooks, redirects, submodules and non-HTTPS
protocols. No customer working tree, code, dependency, hook or ignore file is
executed or loaded. Only shipped Git/analyzer code runs. Public repository input
never enters a shell command. The POSIX worker gets CPU, file-size and descriptor
limits, a 128 MiB JS heap, a 120-second wall timeout and a monitored 192 MiB total
working-directory limit. The API preflight caps reported size at 128 MiB and Git
history at 100,000 reachable commits. These are bounded process controls, not a
VM/container security boundary. Only public inputs are supported. The full
process group is killed on timeout and the directory is removed in `finally`.

The service executes no customer code, Git credential helper, or config. GitHub
API JSON is projected to IDs, hashes and evidence states; review bodies and source
contents are discarded. Report filenames/metrics are intended evidence. Errors
are fixed codes and never include Git stderr, payment secrets or customer content.

A random 256-bit access capability is returned at eligibility. Its recovery link
uses a fragment, is redeemed into an HttpOnly SameSite=Lax cookie, and is never
sent to Stripe. Only its SHA-256 hash is stored. POSTs require exact Origin;
downloads require a matching, unexpired capability and a registered artifact for
that order/run. TLS cookies are Secure. No caching, referrer, third-party scripts,
portal or dashboard. The normal same-browser redirect requires no email or Ryan.
The customer must save their private link before leaving for Stripe; email-based
recovery/delivery is not implemented.

Reports are immutable per successful run. The reassessment compares original and
current verdicts, evidence, resolved/remaining/new finding IDs. The manifest binds
order/run/repository/SHAs, source and factory code hashes, artifact hashes, and
prior report hash. Only one successful reassessment is allowed. Failed attempts
do not consume it; three failed attempts for a slot escalate to REFUND_REQUIRED.

Retryable failures appear as RETRY with AUTH_FAILED, AMBIGUOUS_SHA, RUN_FAILED or
REPORT_FAILED. Unsupported post-payment history and repository-size changes route
to REFUND_REQUIRED (UNSUPPORTED_HISTORY / NOT_ELIGIBLE_AFTER_PAYMENT). Customers
can request MANUAL_EXCEPTION or REFUND_REQUIRED. Both record owner Ryan in the
local inbox. Unknown/duplicate paid references also create refund-required
exceptions with the Stripe transaction/contact. Nothing calls Stripe's refund API.
Ryan inspects `node factory/exceptions.js` locally and resolves any refund through
Stripe. Do not advertise immediate automatic refunds or guaranteed review timing.

Access and artifacts expire seven days after payment. Startup and hourly sweeps
remove expired artifacts. Payment and exception records remain for reconciliation.
Run one service per state directory. A lock rejects a second writer; a graceful
shutdown releases it. After a crash, verify the recorded PID is dead before
removing server.lock. Restart converts interrupted RUNNING records to RETRY.
Durable storage must remain mounted across restarts. Do not expose state files or
put the state directory under static web hosting.

## Deployment boundary

No production deployment, live Stripe transaction or public write is performed
by this build. To expose the service later, use a TLS reverse proxy forwarding to
this single Node process, preserve Origin, set FACTORY_ORIGIN to the exact HTTPS
origin, use a persistent private state directory and configure the matching
Stripe webhook endpoint. Keep the state inbox accessible only to Ryan. The
Node/Git/Chrome runner cannot run inside a Cloudflare Sites Worker; splitting it
into a new product or redesigning the runtime is outside this packet.

## Reproducible evidence

`npm test`: original analyzer/report regressions. `npm run test:factory`: evidence,
adapter and HTTP journey tests, including real isolated Git and real Chrome PDFs.
Stripe HTTP responses and signed webhook payloads in those tests are explicitly
synthetic; they are not evidence of a completed Stripe test-mode transaction.

`node factory/proof/public-proof.js`: read-only live methodology captures against
selected PRs in pallets/click and pallets/itsdangerous. They are not customers.
Results are purposive snapshots and do not establish general repository quality.
See `proof/public-results/summary.json` for captured states, SHAs and results.

Primary implementation references:
- https://docs.stripe.com/payment-links/url-parameters
- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/webhooks/signature
- https://docs.github.com/en/rest/checks/runs
- https://docs.github.com/en/rest/pulls/reviews

Expiry does not erase undelivered paid outcomes: an expired purchase with no
successful report, or an unresolved failed reassessment, escalates once to Ryan
as REFUND_REQUIRED before access/artifacts are removed. Delivered packs that
simply reach the disclosed seven-day window expire without inventing a refund.
Expired reconciliation records do not count toward the active eligibility cap.
The public wrong-SHA demonstration is an explicitly labeled withholding replay:
`node factory/proof/wrong-sha-replay.js` retains authentic candidate-SHA checks
while withholding landed-SHA checks. It is not a claim that the live PR lacked CI.
