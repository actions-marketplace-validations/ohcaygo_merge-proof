# Hosted Pro operations

The September 10, 2026 productionization handoff and Ryan's subsequent billing-policy approval govern this candidate. Hosted launch is **not established** by this file or local fixture tests. See `validation/PRO-PRODUCTIONIZATION.md` for observed evidence.

Reuse the existing Cloudflare Pages front door and dedicated Node backend. No Smee, Mac worker, new service, or new data platform is required. `factory/store.js` persists the receipt, proof-key debit, account/installation mapping, and queue in one fsynced snapshot under the existing exclusive writer lock. Do not run multiple writers against this file. A lost process requires checking that its recorded PID is no longer alive before removing its stale `server.lock`; preserve `state.json`. Never delete the accounting ledger during recovery or monthly renewal. Roll back code with the prior release symlink while retaining state; older code must not be allowed to resume unmetered hosted processing.

## Private configuration

Set `MP_GITHUB_APP_CONFIG` to a private host file based on `production.example.json`. Use a distinct production App, private key, client ID/secret, and signed webhook secret. Never commit the populated file. Retain `FACTORY_CONFIG` for the existing live factory, proxy secret, and historical Stripe obligations. Set a separate absolute `stateDir` in the private App file (use `/var/lib/merge-proof/pro-sandbox` for acceptance). Hosted Pro refuses the legacy state directory. Put these fields inside that file's `billing` object; no legacy Stripe credentials are inherited:

- `proPriceId`: USD 2900, recurring monthly, licensed quantity.
- `topupPriceId`: USD 500, one-time.
- `mode`: `test` for no-charge acceptance.
- `stripeSecret`: the existing authorized Stripe test secret, set privately.
- `webhookSecret`: separate secret for `/proof/stripe-webhook`; do not replace the old factory webhook secret.
- `billingPortalConfiguration`: subscription updates disabled; cancellation at period end; payment-method management allowed. Quantity changes use the product's confirmation path, not default portal settings.

Use a Stripe key authorized for the required customer, Checkout, subscription, price and portal APIs. The old restricted read key is not assumed to authorize these writes. Keep test and live configurations/state separate. A ledger bound to test mode cannot be reopened with live billing. Use a new Pro live state directory when live activation is authorized, retaining sandbox evidence. `mode` and provider livemode are checked. Subscription access follows a fetched paid invoice with the exact subscription item, SKU, period and paid quantity, not a redirect or the mutable quantity for a future invoice. Top-ups require the fetched paid Checkout, exact SKU/quantity/amount/customer, and one payment-intent binding.

The public homepage stays prelaunch until the complete production journey passes. New legacy offer/eligibility/checkout HTTP entry points are retired by default; historical payment webhooks, access, fulfillment and downloads remain. `retireLegacyOffer:false` exists for historical integration tests and must not be enabled on the new public production path. Old saved `/#access=...` links redirect locally to `/legacy` without sending the token to another service. Separately deactivate the obsolete Stripe Payment Link for new purchases; preserve historical Stripe objects and obligations.

For provider renewal acceptance only, private sandbox billing configuration may set `testClockId` to an existing Stripe `clock_...` identifier before customer creation. It is rejected in live mode and is never selectable by a customer. The ordinary flow omits it. Advancing Stripe time does not change the host clock; future-period UI entitlement must not be represented as current wall-clock acceptance. Inspect future-period accounting separately at the simulated time.

## GitHub App

Homepage: `https://merge-proof.ohcaygo.com`. Callback: `/proof/callback`. Setup: `/proof/`. Webhook: `/proof/webhook`. Allow installation on any account and selected repositories. Keep TLS verification and expiring user tokens enabled. OAuth begins from `/proof/login` with a cookie-bound one-use state; do not require OAuth automatically during installation because that flow does not originate the application's state cookie.

Repository read permissions: Actions (execution evidence), Administration (protection/rules and reviewer permission), Commit statuses, Contents (Git identity/history), Pull requests, and mandatory Metadata. Checks is read/write solely for receipt Check publication. Organization Members read permits verifying that the signed-in billing user is an organization owner; it is not used to bill every member. No contents write, secrets, workflow write, or organization administration access.

Subscribe to pull_request, pull_request_review, check_run, check_suite, status, workflow_run, push, repository_ruleset, branch_protection_rule and repository. Installation lifecycle and selected-repository events are handled separately. Merge-group evidence support is retained; a production merge-queue acceptance is not claimed.

User tokens stay in process memory for at most one hour and expire on restart. Customers reconnect through GitHub; no pasted PAT or per-customer owner configuration is required. Each repository/receipt request rechecks the user/App/installation repository intersection. Uninstall, suspended installation, removed repository or revoked user access denies retrieval. Saved CURRENT observations display refresh-required until freshly checked. Historical receipt bodies remain immutable.

## Merge gate operations

Every repository defaults to the report-only policy, including every repository
already installed. A blocking policy is per repository, opt-in, and settable only
by a GitHub repository administrator; the account owner's billing authority is a
different question and is not reused here. No existing customer's merges change
because this shipped.

Requiring the check is the repository owner's action inside GitHub. Merge Proof
does not request Administration: write and will not edit a ruleset or branch
protection: that permission also grants repository deletion, transfer,
collaborator changes and deploy keys, and would let the App remove the rule that
gates it. `GET /proof/gate` reports whether the check is currently required,
whether the rule binds it to this App, whether the branch is ready for a blocking
gate, and the exact steps and deep links to set it up.

Operationally significant: GitHub treats a required check concluding `neutral`
or `skipped` as a pass. Under a blocking policy Merge Proof emits only `success`
or `failure`, and retracts a superseded check to `failure`. If a rollback ever
re-enables code that emits `neutral` while a customer ruleset requires this
check, that customer's gate silently stops blocking - treat a rollback across
this change as a gate-affecting change and tell affected repositories.

Merge records accumulate in the same fsynced snapshot, bounded at 5,000 rows with
an explicit pruning count. Include ledger size in capacity inspection alongside
receipts, queue depth and delivery IDs. Never delete merge records during
recovery: they are the evidence of what was known at past merge decisions.

Metering is unchanged. A blocking gate produces more re-proofs on the same head,
and those are zero debit under the existing permanent `(installation, repository,
PR, head SHA)` deduplication. No price, allowance, top-up or SKU changed.

## Billing rule

Paying account is the immutable GitHub installation-owner ID; installations belonging to that account share its ledger. Human GitHub IDs from covered PR-open or push events count once across those installations. Bots are excluded. Configured known service IDs are excluded; ambiguous bot-to-human attribution is never invented. Initial checkout displays observed human activity from the preceding 30 days. Subsequent counts use the subscription month. No inactive organization member is imported as a seat.

Monthly included balance is 50 × the paid period's quantity, expires at renewal and does not roll over. Top-ups remain until used and are consumed after included balance. Proof-key history is permanent across renewal. A new paid quantity takes effect on the next monthly invoice without proration; current paid allowance remains unchanged. Increases require the customer's count confirmation. The five-minute reconciler reduces next-renewal quantity to observed participants, never above the confirmed ceiling. A zero-activity month is scheduled to end in its final hour; billing reconciliation failure is an operational error, not passing evidence. Customer cancellation is respected. Test these timings with Stripe test clocks before opening live billing.

One billable unit is `(installation ID, immutable repository ID, PR number, head SHA)`, saved atomically with legitimate CURRENT-at-observation VERIFIED/NOT_PROVEN completion. FAIL, incomplete collection, stale completion, downloads, duplicate delivery and already-accounted same-head refresh are zero debit. The sixth new free key pauses; payment fulfillment resumes paused subscriptions. No automatic charge or top-up.

The free historical scan has a separate one-time reservation against the account, examines at most five merged PRs from the first 30 most recently updated closed PRs, and does not debit live proofs. Interrupted/infrastructure-failed scans retry the same reserved repository and allowance. Progress and cancellation are persisted. Unsupported squash/rebase or unavailable historical policy remains explicit; historical scans cannot manufacture VERIFIED.

Support: support@ohcaygo.com. Operational inspection should report queue depth, exhausted/failed refreshes, `billingHealth`, scan retry state, and disk capacity without copying receipts, tokens or private repository identities into public logs. Existing bounds still apply; capacity exhaustion must be resolved before onboarding additional customers. No production privacy certification, deletion SLA or real payment acceptance is asserted.

Primary implementation references: [GitHub App user authorization](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app), [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks), [Stripe subscription object](https://docs.stripe.com/api/subscriptions/object).
