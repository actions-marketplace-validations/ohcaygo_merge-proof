# MERGE-PROOF-PRO-PRODUCTIONIZATION-001

Status: **Core no-charge PRELAUNCH journey PASS; public go-live NOT_PROVEN.** Owner: this Codex coding task, assigned by Ryan on September 10, 2026. Commercial policy approved directly in this task. No real-money purchase or charge performed.

## Candidate and current truth

Published branch: `codex/merge-proof-pro-productionization`; draft [PR #5](https://github.com/ohcaygo/merge-proof/pull/5), based on the existing exact-state branch at `c750291ba7910c25b2435f8bba25c8afd632df17`. Current runtime source deployed to the existing host: `7cc2cba20c10e87dd063ecfebac08133d45368ce`. Earlier checkpoint results below retain their original source identifiers. Ryan explicitly authorized publication and existing-host/Pages PRELAUNCH deployment. No main merge or public go-live claim is authorized by this evidence.

Continuation fixes: separate Pro provider configuration and durable state preserve legacy live payment obligations; the ledger rejects switching test/live modes; monthly entitlement is bound to the paid invoice line's SKU, subscription item, period and quantity; quantity updates cannot undo a provider-side cancellation; only human pushes containing commits count as activity, and distinct delivery evidence survives repeat pushes in later months.

Implemented within the existing backend: cookie-bound GitHub user login; authorized installation/repository selection; hosted receipts and latest-history links; free five-proof ledger; repository-qualified proof deduplication; account mapping across reinstall; separate bounded scan reservation/progress/retry/cancel; Stripe Checkout/subscription/top-up verification; account-pooled monthly allowance; explicit next-invoice quantity confirmation without proration; renewal reductions; constrained billing portal; prelaunch Pro copy; default retirement of new legacy checkout/eligibility requests; preserved historical-order access and fulfillment. Source receipt/verdict semantics remain deterministic. The public hosted signup claim stays disabled.

## Ran

On the existing DigitalOcean host, staged source at `/opt/merge-proof/releases/pro-5ea42015cd1a`. Used a transient systemd unit as `mergeproof`, with `ProtectSystem=full`, `ProtectHome=true`, `PrivateTmp=true`, and `/usr/bin/chromium`. All provider/payment data in these tests is isolated fixture data; this is actual host/runtime evidence, not actual customer/payment evidence.

| Check | Result |
|---|---|
| CLI | 26/26 PASS |
| Report | 9/9 PASS |
| GitHub | 96/96 PASS |
| Factory, including real Git/Chromium/PDF | 36/36 PASS |
| Host unit | exit 0; 46.728 seconds; peak memory 266.6 MB |
| Latest affected scan/meter/billing checks | 14/14 PASS locally, including full Checkout binding and scan reservation retry |
| Local browser | Pro homepage inspected in Chrome; free local link, $29/50/$5-for-5 copy and prelaunch state visible |
| Pages package | Built using the original sample PDF with enforced known SHA256 |
| Source whitespace | `git diff --check` PASS |

The hosted fixture lifecycle covers signed install → five distinct heads → immutable old receipt stale → sixth new head paused → same-head refresh with zero extra debit → uninstall denial → reinstall with unchanged free taste. The HTTP fixture journey covers OAuth state, current repository authorization, proof, private receipt access, revocation and logout. Stripe fixtures cover unpaid/invalid payment, duplicate fulfillment, exact quantity, paid-period allowance, renewal dedup history, retained top-ups, and quantity confirmation. Browser redirects do not grant access.

## Published and hosted continuation evidence

- Hosted GitHub Actions passed all nine jobs for `b2826ca` ([run 34513882173](https://github.com/ohcaygo/merge-proof/actions/runs/34513882173)), `f4a647e` ([run 34514582113](https://github.com/ohcaygo/merge-proof/actions/runs/34514582113)), and `d4aa155` ([run 34515148453](https://github.com/ohcaygo/merge-proof/actions/runs/34515148453)). These include Node 18/20/22 CLI, Node 18/22 GitHub fixtures, report/PDF, factory acceptance, dependency surface and dogfood.
- Local continuation checks: GitHub 101/101 before the final push-identity correction; final affected metering suite 7/7; affected factory offer/runtime isolation 2/2. No fixture result is called a real App or payment acceptance.
- Existing service `merge-proof` is active at `/opt/merge-proof/releases/pro-d4aa155`. Previous original release retained at `/opt/merge-proof/releases/launch-20260908-restricted-key`; stopped-state backup retained at `/var/lib/merge-proof/state-before-pro-b2826ca`. No App config is enabled yet.
- Canonical `/api/offer` returned HTTP 200 with Pro pricing, free five, included 50, $5/5 top-up, `available:false`, and `hostedReady:false`. An unauthenticated old checkout request returned HTTP 401 and created no purchase.
- Actual host collector ran against the real authorized PR #5 at head `d4aa155` and base `c750291`. Receipt `90f7d7cc-7e99-45ae-be4c-82202f4d0479`, observed `2026-09-10T18:36:24.720Z`, is **NOT_PROVEN / UNAVAILABLE** because unauthenticated GitHub access cannot read applicable repository rules. This is provider collection evidence, not a production App proof or metered customer acceptance.
- One Copilot review of PR #5 was requested at runtime candidate `d4aa155`; result pending when this checkpoint was written. No independent approval or integration approval is claimed.

## Provider setup and owner-only dependencies

Stripe's existing Ohcaygo test environment now contains:

| Object | Verified provider identifier / state |
|---|---|
| Pro | `prod_VEg2mF2KBp7izk`; `price_1UECg9A4MpEXwdH4gszhvshT`; USD 29 monthly |
| Top-up | `prod_VEg3DGls0IgqdZ`; `price_1UEChaA4MpEXwdH4qxGZCF2R`; USD 5 one-time |
| Sandbox webhook | `we_1UECoEA4MpEXwdH4Ork50xYg`; active; canonical `/proof/stripe-webhook`; Checkout completed/async succeeded, subscription updated/deleted, invoice paid |
| Sandbox portal | `bpc_1UECj2A4MpEXwdH4eUhOXo7S`; API verified cancellation at period end and subscription updates disabled |
| Obsolete live Payment Link | `plink_1UDRfUA4MpEXwdH4v2IP6WbF` visibly **Deactivated**; products, history and obligations retained |

Webhook event envelope version is the dashboard's `2026-08-26.dahlia`; fulfillment retrieves provider objects using the adapter's pinned Basil version. No sandbox checkout or entitlement cycle has run yet. No real-money charge occurred.

Production App `ohcaygo-merge-proof` (App ID `4901537`) is created and its private key authenticated against GitHub. Owner credential entry is complete. Configuration remains private in `/etc/merge-proof/pro.json` (root:mergeproof, mode 640), with isolated sandbox state at `/var/lib/merge-proof/pro-sandbox`. Stripe sandbox account, both prices, and the existing portal configuration were verified with the private test key. No credential is recorded in this document.

Runtime `cab0da5c23670d04a629ef5302aad55c35d66c36` is deployed with `MP_GITHUB_APP_CONFIG` enabled. It fixes all four concrete Copilot findings: checkout installation validation, clearing stale results on scan retry, validating lifecycle scopes, and specific scan HTTP errors. All 20 affected tests passed, as did hosted workflow run `34519495917`. Copilot review is not human merge approval.

The authorized Pages upload succeeded. Deployment prefix `c051d49d` serves the canonical prelaunch homepage and `/proof/` customer screen. The homepage explicitly says customer launch is not open. The actual Chrome customer journey authenticated the owner, installed on **ohcaygo/merge-proof only**, reconnected, and selected the organization and repository. Installation ID: `160699403`; paying account: `github:323341515`.

The first actual hosted PR #5 receipt is `55685182-3d85-4be3-b571-dfff8dc2aed1`, observed `2026-09-10T19:39:45.732Z`, with verdict **NOT_PROVEN** on source `cab0da5`. The customer account displayed **FREE — 1 used, 4 remaining**. This is a legitimate evidence-gap result, not a VERIFIED claim. Automatic event acceptance was initially blocked because the App webhook was absent. The owner saved the complete configuration; GitHub's API now confirms the canonical `/proof/webhook`, JSON payloads and TLS verification, and its signed ping received HTTP 202.

## Actual hosted acceptance continuation

- Real push to `a66df64eb3106550182977f81e7f8b1f168058ed` made receipt `55685182-3d85-4be3-b571-dfff8dc2aed1` stale. After CI webhook activity settled, new receipt `769edf24-d000-4ee3-9f28-31ebf37e0d9f` was NOT_PROVEN/CURRENT at observation; free usage increased from one to two. Manual same-head reproof did not increase usage.
- Proving existing PR #4 increased lifetime free usage to three. Actual GitHub uninstall made installation `160699403` inactive in the signed-event ledger. Reinstall on the same paying account created installation `160709728` and preserved free usage at three. Proofs for PR #5 and PR #4 under the new installation brought usage to five, consistent with the installation-qualified proof key. The distinct human count remained one across reinstall.
- The next necessary source push (`7c32b20`) paused the new PR #5 key with `ALLOWANCE_EXHAUSTED`. The customer screen displayed: “Your allowance is used. Existing receipts and the free local CLI remain available. Upgrade or buy a top-up; no automatic charge.” Existing PR #4 same-key refreshes did not consume a sixth proof.
- Historical scan `469b9fd3-d5fc-49e5-8796-78b252c8a59e` completed after free exhaustion without a live-proof debit. Its only eligible merged PR (#3) remained `UNAVAILABLE / UNSUPPORTED_HISTORICAL_SHAPE`. The result-label correction uses the actual requested bound; the enforced hosted limit was already five.
- GitHub redelivered GUID `6bf50696-ad57-11f1-9401-330565d36ffe` through its normal delivery API (request accepted HTTP 202). Before and after: 52 recorded events, five proof keys, five free proofs used. No duplicate debit or processing record was added.
- All nine hosted jobs passed for `7c32b208d7f500e9db4499ed1bf41f0c5774b0fa`, [run 34527390927](https://github.com/ohcaygo/merge-proof/actions/runs/34527390927). The runtime is active at `/opt/merge-proof/releases/pro-7c32b20`. The sandbox-only optional provider clock passed 11 billing tests; scan label correction passed the two existing scan tests.
- Sandbox clock `clock_1UEEiCA4MpEXwdH43cunMnpE` is configured for first customer creation, with provider `livemode:false`. No Checkout was created at this checkpoint: Chrome confirmation controls stalled and the owner was asked to dismiss/confirm the visible sandbox quantity dialog. No real card or real charge is involved.

Remaining acceptance: sandbox Checkout/Pro entitlement/top-up; provider renewal/cancellation checks; direct HTTP denial evidence for receipt retrieval while uninstalled (provider/ledger revocation was observed, but the browser reported a client-side block); scan cancellation; final evidence decision. **Go-live remains NOT_PROVEN.** Main/development promotion follows the normal required process and is not performed here.

Configuration, permissions, accounting rules, support and rollback: [`../PRODUCTION.md`](../PRODUCTION.md). Preserve all historical orders and private state.

## Paid sandbox and cancellation evidence

Owner completed actual sandbox subscription and top-up Checkout in Chrome. Subscription `sub_1UEEzCA4MpEXwdH4bTC8YHMp` was verified active, `livemode:false`, quantity one, correct monthly SKU, paid invoice `in_1UEEzBA4MpEXwdH4Ap3oqdsw`. Signed provider events granted 50 included proofs and resumed the paused PR #5. Receipt `fdf16eaa-f5ed-4333-98a5-21e8b1b40888` consumed exactly one included proof for head `7cc2cba20c10e87dd063ecfebac08133d45368ce`; customer UI showed PRO/49 remaining.

The actual $5 top-up was PAID and bound once to payment intent `pi_3UEF7wA4MpEXwdH406WjvuvJ`. Customer UI and ledger agreed: 49 included + 5 top-up = 54 remaining.

Normal Stripe API cancellation set cancel-at-period-end. The signed update preserved current Pro access, and the customer opened the real test-mode portal, which displayed the October 10 cancellation and paid $29 invoice. Cancellation scheduling itself was exercised through the provider API, not by clicking the portal cancellation control.

Advanced only existing sandbox clock `clock_1UEEiCA4MpEXwdH43cunMnpE` to `1791664667`. Provider status became canceled, ended_at `1791664607`; signed subscription-deleted processing set the ledger canceled/unpaid. Included balance became zero; lifetime free usage stayed five; purchased top-ups stayed five. This is provider-clock cancellation-expiry evidence; no host clock or real payment was changed. Paid renewal of an uncanceled subscription remains fixture-tested, not provider-clock proven.

All four concrete Copilot conversations are resolved after their fixes and affected checks. Latest published source `7cc2cba` passed all nine CI jobs in run `34527978690`. Runtime remains `7c32b20`: automatic approval review rejected deploying the scan-label correction, including a retry citing earlier task authorization. Owner confirmation for that exact prelaunch deployment is pending.

Current remaining work: prove purchased-credit consumption on a necessary new head, affected deployment/recheck, stronger receipt-denial and scan-cancel acceptance where available, final evidence decision. Public go-live remains NOT_PROVEN.

## Final observed checkpoint

The owner reconfirmed deployment of 7cc2cba. That tested runtime is now active; earlier deployment-blocker text is historical and resolved. The prior release and accounting ledger remain intact.

The next necessary evidence commit b84ef7b passed hosted CI run 34530261793 and generated receipt 9aed1215-7f63-40b1-83ae-37d740f6d3d6 at 2026-09-10T21:07:26.137Z. It consumed exactly one purchased proof after cancellation: free usage remained five, included balance zero, purchased balance four, and queue empty. This proves purchased credits remain usable after subscription expiry.

An isolated real Stripe sandbox subscription renewed with a paid USD 58 invoice for two developers. The deployed Billing adapter processed that invoice against an in-memory ledger copy, with an explicitly synthetic prior-period usage of 17. At simulated period time, it granted 100 fresh included proofs, zero new-period usage, retained the four copied purchased proofs, and preserved ALREADY_ACCOUNTED for an existing proof key. No actual customer-ledger write or host-clock change occurred. The isolated test subscription was canceled afterward. This is real-provider renewal plus isolated accounting evidence, not a second customer browser journey.

The completed historical scan remained COMPLETE when Cancel scan was pressed. Cancellation of a RUNNING scan remains fixture-tested; the one-time scan reservation was not reset to manufacture acceptance.

Actual uninstall and reinstall were observed in GitHub and the ledger. A direct authenticated browser request for an old-installation receipt returned a client-side block with no matching host access-log entry. Exact HTTP denial for that request remains NOT_PROVEN; fixture denial tests do not substitute for that missing observation.

The core install, proof, stale/re-proof, metering, free limit, sandbox Checkout, Pro entitlement, five-proof top-up, cancellation expiry and purchased-credit consumption journey passed. Same-head and GitHub-delivery deduplication passed. All four independent Copilot findings were fixed/rechecked and their conversations resolved; this is not human merge approval.

Keep PRELAUNCH. No live billing activation, public go-live claim, real-money charge or main merge was performed. Direct HTTP denial evidence and normal human integration approval remain release boundaries, explicitly not represented as passes. Ryan explicitly authorized documentation-only publication of this final checkpoint to the existing candidate branch/PR. That authorization does not waive the HTTP-denial evidence gap or the required human merge decision. Earlier pending-publication and deployment statements are historical; this final checkpoint governs current status.
