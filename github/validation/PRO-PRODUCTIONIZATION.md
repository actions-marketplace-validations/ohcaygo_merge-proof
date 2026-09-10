# MERGE-PROOF-PRO-PRODUCTIONIZATION-001

Status: **PARTIAL — hosted production acceptance NOT_PROVEN.** Owner: this Codex coding task, assigned by Ryan on September 10, 2026. Commercial policy approved directly in this task. No real-money purchase or charge performed.

## Candidate and current truth

Published branch: `codex/merge-proof-pro-productionization`; draft [PR #5](https://github.com/ohcaygo/merge-proof/pull/5), based on the existing exact-state branch at `c750291ba7910c25b2435f8bba25c8afd632df17`. Runtime source deployed to the existing host: `d4aa1556493cbfbf6631e22fdabc740a67e0a1bc`. Ryan explicitly authorized publication and existing-host/Pages PRELAUNCH deployment. No main merge or public go-live claim is authorized by this evidence.

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

Remaining acceptance: real head change/stale/re-proof; same-head and delivery dedup; full free-limit boundary; sandbox Checkout/Pro entitlement/top-up; provider renewal/cancellation checks; uninstall/access revocation and recovery; final evidence decision. **Go-live remains NOT_PROVEN.** Main/development promotion follows the normal required process and is not performed here.

Configuration, permissions, accounting rules, support and rollback: [`../PRODUCTION.md`](../PRODUCTION.md). Preserve all historical orders and private state.
