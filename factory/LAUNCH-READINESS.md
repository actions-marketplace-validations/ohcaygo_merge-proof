# Merge-Proof commercial launch readiness

Owner: Ryan Williams. Assessed September 7, 2026 (America/Chicago).
Product: **Merge-Proof Standard Evidence Pack**. No V2 or deployment performed.

**Factory finish line: ACHIEVED. Customer flow: ready locally. Ready for real
money: NO — public production hosting and live Stripe remain unconfigured.**
These are release actions, not regressions in the achieved factory acceptance.

## Repository and evidence truth

- Inspected starting HEAD: `3c92f33da2a8ecd2bab182d9ff4e5505555a9dac`, clean tree.
  This readiness change is a subsequent copy/documentation-only commit.
- Public `origin` HEAD and main, freshly queried with `git ls-remote`:
  `dab4c4b896a4ff704603e4945edfce87c43fd4e5`.
  Factory implementation `65151f2`, review fixes `5efae84`, acceptance `c054822`,
  and download closure `3c92f33` are local work beyond public main.
- Existing `src/`, `bin/`, Action and Kiota samples match public main exactly.
  The published CLI/Action remains local-only; its coverage is not the paid
  factory's CI/review coverage. Root README now makes that distinction up front.
- [Acceptance](ACCEPTANCE.md) and [browser closure](proof/browser-download-closure.md)
  inspected. The private actual Stripe TEST receipt remains byte-for-byte
  unchanged: SHA-256 `94d1f5a4e9de8183cb2ee134c8478c3ba310c8d202f99d6289302d6f459d2449`.
  Receipt payment exactly matches the persisted order; mode test, webhook 200,
  DELIVERED, two successful runs. Every original/reassessment artifact hash and
  manifest order/run binding rechecked. No new payment or report was requested.
- Existing browser closure proves authorized original PDF delivery and rejected
  unauthorized access. Original PDF SHA-256:
  `0f535467ad786cf1dc1308d8de6c59e164b27ca724c9256e994437702a64b3e3`.
- No compatible existing production host or factory public origin is established
  by repository configuration. Current service is `http://127.0.0.1:4327`, test
  mode. Public GitHub repository/sample availability is not hosted paid checkout.

## Customer journey

| Customer step | Readiness and evidence |
|---|---|
| Understand product | READY: bounded merge evidence; all three verdicts and what they do not mean; no call required. |
| Inspect sample | READY: existing `/sample` Kiota methodology report, Microsoft not a customer and no endorsement. Explicitly original Git-only coverage, not an example of upgraded CI/review sections. |
| Check eligibility | READY: free public GitHub checks before purchase, supported history/size bounds, CI name/App guidance; no paid findings exposed. |
| See price | READY: existing Stripe TEST offer API and browser displayed `$1.00 · TEST MODE`, matching Payment Link configuration. This is a test amount, not commercial pricing. |
| Pay | PROVEN in Stripe TEST; live setup remains an owner action. Payment Link receives the eligible order reference. |
| Bind payment to run | PROVEN: Stripe-retrieved completed paid session, configured SKU/link/mode, actual amount authoritative, durable webhook acknowledgement and idempotency. |
| Run analysis | PROVEN: customer returns, authorizes the same public repo/PR and confirms captured scope; analysis runs asynchronously. |
| Receive report | PROVEN: authenticated same-page downloads, PDF/HTML/JSON/capture/manifest, expiring private link. No automated email delivery. |
| Understand result | READY: VERIFIED is no implemented blocking gap, not correctness; NOT_PROVEN is missing evidence, not defective code; FAIL is unavailable verification, not bad code. |
| Rerun once | PROVEN: one successful reassessment of same repo/PR and CI policy within seven days of payment; customer reconfirms current scope. |
| Receive diff | PROVEN: reassessment diff, original immutable, changed/resolved/remaining findings. |
| Receive handoff | PROVEN: existing Action instructions and scope/coverage distinction; no automatic repository installation. |

Offer copy now identifies OHCAYGO/Ryan, describes the full asynchronous sequence,
provides CI input instructions, and links Ryan's supplied private support address
`support@ohcaygo.com`. Public GitHub issues remain for non-sensitive questions.
No support email was sent and mailbox deliverability was not independently tested.

## Minimum live Stripe owner actions — do not execute under this packet

1. Confirm the Stripe account can accept live payments; complete any outstanding
   Stripe business/account activation requirements as owner. Decide the one-time
   price/currency. `$5,000` remains an unvalidated hypothesis, not an implemented
   commercial charge or a readiness requirement.
2. Create or select the live product, one-time price and active Payment Link:
   exactly one line item, quantity one, no adjustable quantity or recurrence.
   Set redirect to the chosen factory HTTPS origin plus `/#paid`. Customers must
   enter through factory eligibility; do not advertise the bare Payment Link,
   which lacks the per-order reference.
3. Register a live snapshot webhook at that origin plus `/webhooks/stripe`, for
   `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
   Preserve the raw request body/signature header through the proxy; no login
   redirect or browser challenge on this endpoint. Use HTTPS and no redirect.
4. On the approved host, install a separate mode-0600 private live config with
   `mode: live`, exact HTTPS origin, persistent state path, live key, live
   webhook signing secret, live Payment Link ID and live price ID. All objects
   must belong to the intended live account. Do not copy sandbox object IDs or
   the Stripe CLI listener signing secret. Keep test config/state separate.
5. Ryan handles the existing private exception inbox and support mailbox. Run
   `FACTORY_CONFIG=/path/to/private-config.json node factory/exceptions.js`
   using the deployed state configuration. Reconcile the transaction in Stripe
   and make any refund decision manually. The service sends no automatic inbox
   alert or refund. No refund timing or call commitment is promised.

Stripe confirms that sandbox objects are separate from live objects and live
webhooks must be registered: [Stripe go-live checklist](https://docs.stripe.com/get-started/checklist/go-live).
Its public HTTPS and event endpoint requirements are documented in
[Stripe webhooks](https://docs.stripe.com/webhooks). No live account status,
live object existence or live key was inspected or inferred from sandbox evidence.

## Smallest deployment

**Recommended target:** one persistent Linux host with an HTTPS reverse proxy
and a single supervised, non-root Node process. Reuse an existing compatible
OHCAYGO host if Ryan identifies one; none is established in this repository.
No new provider, subscription or spend has been selected. This is the existing
factory runtime, not a new product or a serverless rewrite.

- Keep the factory at `/` on a dedicated Merge-Proof hostname under Ryan's
  existing controlled domain, for example `merge-proof.ohcaygo.com` **if Ryan
  confirms domain control and that hostname**. No DNS ownership or availability
  is claimed. A subpath mount would break current absolute routes and redirects.
- Use the full approved repository checkout, not the npm CLI tarball (which
  excludes `factory/` and samples). Install Node 22+ (Node 24 locally proven),
  Git, POSIX shell and Chrome/Chromium with its supported normal sandbox.
  Keep Chrome running non-root; do not add `--no-sandbox`.
- Reverse proxy HTTPS to the loopback Node port on the same host. Preserve
  incoming Origin and webhook body. No CDN cache on private routes. Do not
  expose state/artifact directories as a static file root.
- One writable private persistent `FACTORY_STATE_DIR` contains `state.json`,
  `server.lock`, artifacts and reconciliation/exception records. It must survive
  process restarts and deployments. One process/one writer; no replicas.
- A private writable OS temporary directory holds disposable bare Git attempts
  and Chrome profiles. Each Git attempt has a 192 MiB monitored limit and
  120-second timeout; leave additional room for PDF profiles, OS and retained
  reports. No paid capacity claim is made from these per-run limits.
- Git directories are removed on ordinary success/failure/timeout; abrupt host
  termination can leave temporary data. After verifying no worker is alive,
  remove abandoned temporary run/profile directories during restart recovery.
  Confirm the old process is dead before removing a stale store lock.
- Artifacts use the persistent store and existing authenticated download route,
  not a new object store. Access expires seven days after payment, artifact purge
  runs hourly/startup, paid reconciliation metadata has no automatic deletion.
  Preserve these disclosures in any host backup/log retention settings; avoid
  logging cookies, private links, signatures or payloads.
- Permit outbound HTTPS public GitHub/Git fetches and Stripe API reads. No GitHub
  credential, private repository access or customer code execution is needed.
- After deployment authorization, verify the chosen host's PDF renderer,
  persistence across restart, exact HTTPS Origin/cookies and public webhook
  delivery in test mode before activating live checkout. That target verification
  has not been executed locally on behalf of an unknown production host.

Required environment variable **names only**:

```text
FACTORY_CONFIG
FACTORY_ORIGIN
FACTORY_STATE_DIR
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PAYMENT_LINK_ID
STRIPE_PRICE_ID
PORT
FACTORY_HOST
CHROME_BIN
```

`FACTORY_CONFIG` selects the private JSON file. Stripe/origin/state variables
override corresponding config fields; they need not be duplicated if in that
file. `mode` is a JSON field, not an environment toggle. `PORT`/`FACTORY_HOST`
control binding, and `CHROME_BIN` is optional if Chrome is detected. No live
values are provided. The existing config example remains explicitly test-only.

## Trust and limitations

DATA_RETENTION_DISCLOSURE: READY. PRIVACY_DISCLOSURE: READY.
REFUND_EXCEPTION_DISCLOSURE: READY. METHODOLOGY_LIMITS: READY.
DEFERRED_GAPS_DISCLOSED: PASS. ASYNC_ZERO_CALL_CUSTOMER_FLOW: READY.

The offer explains public metadata/full Git access, no customer code execution,
report paths/IDs/evidence contents, deletion and continued paid metadata retention,
Stripe processing and private-link handling. It does not promise all data is
deleted after seven days. This describes implemented behavior, not a new legal
agreement or compliance certification.

Public GitHub only: one open PR or reconstructable two-parent merge within
published bounds. No private/squash/rebase/closed-unmerged coverage; no PAT/App
onboarding. Required CI is explicitly declared check-run name/App pairs, not
all branch protections or commit statuses; approval is current candidate-bound
human collaborator evidence, not complete CODEOWNER policy or approval-at-merge
reconstruction. Open-head CI does not prove eventual combined merge state.
`CANDIDATE_DURABLE_ON_REMOTE` and `SCOPE_CREEP_VS_DECLARED_SCOPE` remain unproven.
No bug, security, correctness, compliance, safe-code or safe-merge guarantee.

## Verification and finish

- `node --test factory/test/adapters.test.js`: **9 passed, 0 failed**.
- `node --test --test-name-pattern='complete HTTP journey' factory/test/journey.test.js`:
  **1 passed, 0 failed**. It uses synthetic Stripe fixtures, isolated Git, real
  PDF and protected delivery/reassessment;
  it does not replace the preserved actual Stripe TEST receipt.
- Read-only configured Stripe TEST offer comparison: PASS; local offer HTTP 200,
  price matches Stripe. Browser rendered test price and updated offer disclosures.
- Existing Kiota disclaimer/sample inspected; original/reassessment manifest and
  artifact checks PASS; `git diff --check` PASS. No broad review repeated.
- Changes: offer copy only; README scope distinction and operating-doc link;
  this launch checklist. No runtime, payment, analyzer or delivery code changed.
- EXTERNAL_ACTIONS: NONE that mutate external state. Read-only public GitHub refs,
  official documentation and configured Stripe TEST price inspected. No outreach,
  deployment, public push, publication, activation, refund or new purchase.

**Real customer blockers / smallest owner actions before the first real dollar:**

1. Select/authorize the compatible host and Merge-Proof HTTPS hostname; authorize
   deployment/public availability of the complete approved checkout and verify
   the existing flow on that target with persistent storage and public webhook.
2. Decide price/currency and authorize the matching live Stripe setup described
   above, including any Stripe account activation requirements; only then enable
   the public purchase path. Sandbox success is not live activation.
3. Operate the supplied support mailbox and existing private exception inbox,
   with Ryan owning reconciliation and manual refund decisions. No new support
   platform or mandatory call is required.

READY_FOR_REAL_MONEY: **NO** until those release actions are completed.
FACTORY_FINISH_LINE remains **ACHIEVED**. Readiness work stops here; no activation
or deployment is authorized by this report.
