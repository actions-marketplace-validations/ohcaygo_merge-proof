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
| Sandbox portal | Saved with cancellation at period end and plan/quantity changes disabled; API configuration ID still to be retrieved using the private test key |
| Obsolete live Payment Link | `plink_1UDRfUA4MpEXwdH4v2IP6WbF` visibly **Deactivated**; products, history and obligations retained |

Webhook event envelope version is the dashboard's `2026-08-26.dahlia`; fulfillment retrieves provider objects using the adapter's pinned Basil version. No sandbox checkout or entitlement cycle has run yet. No real-money charge occurred.

Production GitHub App form remains prepared at `https://github.com/settings/apps/new`, not submitted. Exact callback/setup/webhook URLs, minimal evidence permissions, selected subscriptions, public installability and TLS verification were prepared. The Dev App is separate.

Private `/etc/merge-proof/pro.json` is now prepared on the existing host, root-owned/group-readable by `mergeproof`, with sandbox state directory and the two real test price IDs. The owner must privately complete App ID/client ID/client secret/private key/GitHub webhook secret, Stripe test key and the sandbox webhook signing secret. Readiness was checked as booleans only; credentials are still absent. The App must remain disabled until these fields are valid. Do not paste credentials into chat.

Pages production deployment is still `9190aa0d-75a6-418c-a7d3-e61bf1c6022e`. New prelaunch upload bundle is prepared at `/private/tmp/merge-proof-pro-pages-b2826ca.zip` (frontend source unchanged by subsequent billing/meter fixes). The browser upload is blocked by missing extension file-URL access; official Wrangler reports no existing authentication. No new account, project, token or temporary deployment was created. Complete the existing-project upload after the owner enables browser file upload or manually uploads that bundle.

Remaining acceptance: complete private provider setup and Pages upload; actual customer installation/login; signed production proof/head change/stale/re-proof; correct debit/free limit; sandbox Checkout/Pro entitlement/top-up; provider renewal/cancellation test-clock checks; authorization revocation and recovery; review findings; final evidence decision. **Go-live remains NOT_PROVEN.** Main/development promotion follows the normal required process and is not performed here.

Configuration, permissions, accounting rules, support and rollback: [`../PRODUCTION.md`](../PRODUCTION.md). Preserve all historical orders and private state.
