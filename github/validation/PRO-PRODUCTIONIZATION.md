# MERGE-PROOF-PRO-PRODUCTIONIZATION-001

Status: **PARTIAL — hosted production acceptance NOT_PROVEN.** Owner: this Codex coding task, assigned by Ryan on September 10, 2026. Commercial policy approved directly in this task. No real-money purchase or charge performed.

## Candidate and current truth

Remote development branch freshly read as `c750291ba7910c25b2435f8bba25c8afd632df17`; main as `dab4c4b896a4ff704603e4945edfce87c43fd4e5`. Implementation source is committed at `5ea42015cd1a810a586da81b283d9d31177614c9` on `codex/merge-proof-pro-productionization`. Later verification-only changes do not change this runtime source. The development App remains separate.

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
| Extra complete Checkout binding test | 6/6 billing tests PASS locally, including the added test |
| Local browser | Pro homepage inspected in Chrome; free local link, $29/50/$5-for-5 copy and prelaunch state visible |
| Pages package | Built using the original sample PDF with enforced known SHA256 |
| Source whitespace | `git diff --check` PASS |

The hosted fixture lifecycle covers signed install → five distinct heads → immutable old receipt stale → sixth new head paused → same-head refresh with zero extra debit → uninstall denial → reinstall with unchanged free taste. The HTTP fixture journey covers OAuth state, current repository authorization, proof, private receipt access, revocation and logout. Stripe fixtures cover unpaid/invalid payment, duplicate fulfillment, exact quantity, paid-period allowance, renewal dedup history, retained top-ups, and quantity confirmation. Browser redirects do not grant access.

## External state and remaining evidence

Production service was freshly observed active at `/opt/merge-proof/releases/launch-20260908-restricted-key`. No production symlink switch, Pages publication, Stripe configuration change, or live App installation occurred in the recorded verification above.

The production GitHub App form is prepared in Chrome at `https://github.com/settings/apps/new`: production identity, exact callback/setup/webhook URLs, six repository permissions plus mandatory Metadata, organization Members read for billing-owner verification, selected evidence event subscriptions, public installability, and TLS verification. It is **not submitted** and has no production credentials. The Dev App is not being reused as production.

Automatic approval review rejected an attempted Git push before execution, citing missing trusted authorization for publishing source to the exact remote/branch. A consolidated explicit publication/prelaunch-deployment approval request is pending in this task. Main and the development branch have not been modified.

Still required before hosted launch: production App creation/credentials and customer-installable URL; private host configuration; real signed production install/proof/head-change/stale/re-proof observations; actual GitHub user/repository revocation checks; Stripe sandbox products/key/webhooks/portal and test-clock renewal/cancellation verification; deactivation of the obsolete live Payment Link for new purchases; normal candidate publication/promotion and deployment; full no-charge customer acceptance. Do not replace these with fixture results or claim ready-to-market. No real-money transaction is necessary for the currently outstanding tests.

Configuration, permissions, accounting rules, support and rollback: [`../PRODUCTION.md`](../PRODUCTION.md). Current historical orders and private state must be preserved.
