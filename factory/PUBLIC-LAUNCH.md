# Public launch execution — September 8, 2026

## Latest checkpoint — September 8, 2026, 16:52 UTC

This checkpoint supersedes the historical checkpoints below.

- Dedicated restricted LIVE Stripe key `Merge-Proof production verification` created by Ryan and installed ONLY in backend `/etc/merge-proof/live.json` (root:mergeproof 0640). The configured permissions were inspected in the rendered Stripe form: Prices Read, Checkout Sessions Read, Payment Links Read; every other permission None. Key value never included in repository or chat. Temporary local transfer file removed after installation. No write, charge or refund authority granted.
- Backend compatibility change accepts restricted keys while preserving strict live/test separation. Deployed release `/opt/merge-proof/releases/launch-20260908-restricted-key`; existing service restarted successfully. Affected configuration/Stripe/proxy tests: 12/12 PASS. Earlier complete host fixture evidence remains below.
- Authenticated Stripe GET price and Payment Link: HTTP 200, active and livemode true. Price `price_1UDReIA4MpEXwdH48FgJ5E5K`: 500000 USD, one-time. Product `prod_VDtR6ryWQmho00`. Payment Link `plink_1UDRfUA4MpEXwdH4v2IP6WbF`, https://buy.stripe.com/6oUcN4deR69zbtgc7f9IQ00. Backend authenticated offer returns HTTP 200 and $5,000.00. Initial origin check omitted required client-IP header and was corrected; no security control changed.
- Live webhook `we_1UDRjDA4MpEXwdH4GrlSjpT1` active at https://merge-proof.ohcaygo.com/webhooks/stripe for ONLY checkout.session.completed and checkout.session.async_payment_succeeded. Signing secret installed privately. Public delivery is NOT yet connected.
- Stripe account review remains pending in dashboard (2–3 day estimate). Active API objects do not prove checkout acceptance. No real-money transaction or refund performed.
- Existing Cloudflare production variables verified after reload: FACTORY_PROXY_SECRET encrypted Secret; FACTORY_BACKEND https://161.35.59.206; Fail closed persisted.
- Production bundle deployment `982edd4f-e57e-4b89-ae42-24fa9d55b3de` succeeded, but public `/api/offer` returned Cloudflare 403 error 1003. This establishes that the previously proposed raw-IP fetch architecture is incompatible with Workers. Official documentation: https://developers.cloudflare.com/workers/platform/known-issues/#fetch-to-ip-addresses . Valid IP HTTPS alone does not overcome that platform restriction.
- Rolled public production back to preserved deployment `0fcf6857-0c8e-4ee0-a842-9744a1e0cb0b`; Cloudflare confirmed rollback. Public HTTPS original page title verified after propagation; original sample PDF SHA256 unchanged: 6250cbc8cc33bf7030339197c95ced5c36440c223a9b02c61c98fa2c5a323a80. Factory form is not public after rollback.
- Owner decision requested: allow backend-only DNS A name merge-proof-origin.ohcaygo.com for existing 161.35.59.206 Droplet, HTTPS certificate, and updating existing Pages backend variable. No customer-facing URL change, no additional website or compute, no incremental hosting cost. This is an exception to the explicit no-new-hostname constraint; no DNS name created without approval.
- PUBLIC_LAUNCH_FINISH_LINE: NOT_ACHIEVED. Backend is configured; public proxy and Stripe review remain blocking. Failed public integration is not reported as passing.
- No new purchases or add-ons. Existing public Pages hosting $0/month; approved backend $12/month. Untracked `.cursor/` belongs to other/user work and is left untouched.

## Backend provisioned and verified — September 8, 2026, 15:42 UTC

This is the latest checkpoint and supersedes earlier preparation-only statements.

- DigitalOcean Droplet **598775880**, `merge-proof-factory`, is Active at **161.35.59.206**. Debian 13 in NYC1; Basic Regular 1 vCPU / 2 GB / 50 GB / 2 TB transfer, **$12/month**. Owner-selected deployment key attached. No backups, metrics agent, managed database, inference, AI agents or other add-ons purchased.
- Existing **https://merge-proof.ohcaygo.com** Cloudflare Pages deployment is unchanged at $0/month. No new public hostname or website created. Cloudflare backend-connection secret confirmation remains pending; no Pages variables or deployment changed.
- Backend installed and enabled as non-root `mergeproof`: Node 20.19.2, Git 2.47.3, Chromium 152.0.7977.82, Nginx, Certbot 5.8.0. Firewall permits SSH and HTTP/HTTPS; Node binds loopback port 4327. No Chrome sandbox bypass flag.
- Verified public trusted IP-address HTTPS. Direct request without proxy authentication returns **403 PROXY_DENIED**, including after service restart. Certificate automatic renewal timer enabled; staging renewal rehearsal **PASS**. Initial rehearsal's optional random delay was interrupted and rehearsal rerun successfully without that delay; live HTTPS was not interrupted.
- Actual host factory suite under the production service's User/Group, PrivateTmp, ProtectSystem, ProtectHome and UMask restrictions: **34/34 PASS**. Runtime 14.298 seconds, peak memory 236.6 MB. Real Git/PDF fixture journey, secure delivery, unauthorized rejection, reassessment and mode separation passed. Initial unrestricted suite had one omitted public test fixture; copied that fixture and affected tests passed before the complete restricted run. This is fixture evidence, not a Stripe payment.
- Authenticated origin over verified HTTPS: live public GitHub `pallets/click` PR 3781 **ELIGIBLE**; unsupported non-GitHub URL rejected 400; unsigned webhook rejected 400. Unconfigured offer returns HTTP 200 with `available: false` as designed. The verification script initially expected HTTP 503, was corrected to the existing contract, and passed without product changes.
- One unpaid eligibility record persists after graceful service restart. State SHA256 before/after: `4f146fcd4d0e1fff5a8c60059340827710771421197a21defa364143558c8c7f`. State directory 0700, state file 0600, owned by mergeproof; private live configuration 0640 root:mergeproof. No payment credentials have been installed.
- Live Stripe activation remains at business verification; live product/price/link/webhook configuration remains incomplete. **No real-money Stripe transaction.** Backend readiness does not establish the public paid customer finish line.
- Pending owner steps: confirm storing the dedicated backend connection secret in the existing Cloudflare Pages project; complete Stripe business/identity verification. Continue existing-site deployment and remaining public acceptance after these steps.
- PUBLIC_LAUNCH_FINISH_LINE: **NOT_ACHIEVED**. Complete production candidate review is not claimed; no extra independent review was mandated by the inspected project instructions.


## Current execution checkpoint — September 8, 2026

This checkpoint supersedes the historical table and earlier hosting assumptions below.

- Public launch finish line: **NOT ACHIEVED**. Existing public site remains unchanged.
- Approved hostname: **https://merge-proof.ohcaygo.com** only. Cloudflare Pages project `merge-proof`, direct upload, deployment `0fcf6857-0c8e-4ee0-a842-9744a1e0cb0b`; public hosting $0/month. No new website or hostname.
- Approved incremental purchase: one DigitalOcean Basic Regular 1 vCPU / 2 GB / 50 GB SSD backend, $12/month, 2 TB transfer. No backups, inference, AI agents, managed databases or other add-ons.
- Verified payer: DigitalOcean `ryanwwilliams82@gmail.com`, `My Team` (`8c1f83b8-f03f-4235-a90a-d801c29abb7d`), primary Visa ending **0227**. User explicitly authorized this backend after adding payment method. No Droplet purchased at this checkpoint.
- DigitalOcean form: New York NYC1, quantity 1, `merge-proof-factory`, existing `first-project`, optional monitoring unchecked and paid add-ons off. Awaiting the pending browser-required confirmation to add the dedicated deployment public SSH key; private key remains on the owner's Mac.
- Minimum-change implementation prepared: Pages server-side proxy for `/api/*`, `/download/*`, `/webhooks/stripe`; authenticated origin requests, trusted per-client rate limiting, unchanged raw Stripe webhook body/signature, protected cookie/download responses and no caching. One non-root Node/Git/Chromium service with persistent private local state. No backend has been deployed.
- IP-address HTTPS certificates are supported by current Let's Encrypt/Certbot and can avoid introducing another hostname. Issuance, automatic renewal and proxy connectivity remain to be verified on the actual backend.
- Pages bundle builder preserves the existing public PDF (SHA256 `6250cbc8cc33bf7030339197c95ced5c36440c223a9b02c61c98fa2c5a323a80`) and adds the already prepared factory UI and study to the existing site. Bundle prepared locally; no Cloudflare deployment or settings change performed.
- Tests run: factory suite **34/34 PASS**, including real Git/PDF fixture journey and new proxy authentication, per-client limiting, webhook/cookie forwarding and preview-host rejection checks. Syntax and whitespace checks pass. Earlier analyzer/report tests remain 26 + 9 passing; they were not rerun at this checkpoint. Linux production and live Stripe integration remain unverified.
- Stripe account `acct_1UDDJ2A4MpEXwdH4` freshly verified: activation stops at business type; no selection submitted. Owner asked to complete business/identity verification. No live product, price, payment link or webhook created. **No real-money Stripe transaction.**
- Candidate remains uncommitted while deployment work continues. No complete production candidate review or public launch acceptance claimed.

Official deployment references:
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://letsencrypt.org/2026/03/11/shorter-certs-certbot.html

## Historical execution record (superseded where inconsistent above)


PUBLIC_LAUNCH_FINISH_LINE: NOT_ACHIEVED

| Return field | Current evidence |
|---|---|
| PRODUCT | Merge-Proof Standard Evidence Pack |
| PUBLIC_URL | None deployed |
| REPOSITORY_HEAD | Baseline b856624cfc6f344e808ea19b3c461c9551f3f6bd; this record and study copy form a subsequent local commit |
| DEPLOYMENT_TARGET | Not established; persistent non-root Linux Node/Git/Chrome runtime required |
| DOMAIN/HOSTNAME (CURRENT-TRUTH 2026-09-08: live public site is hyphenated merge-proof.ohcaygo.com on Cloudflare Pages; unhyphenated form SUPERSEDED) | Ryan-approved merge-proof.ohcaygo.com; no address returned by DNS. ohcaygo.com nameservers are phoenix.ns.cloudflare.com and chip.ns.cloudflare.com; Ryan confirmed domain control; Cloudflare dashboard currently requires sign-in |
| HTTPS | Production not established |
| PUBLIC_PAGE | Updated page verified in Chrome on isolated local port 4338; not public |
| STUDY_VISIBLE | Local PASS: existing findings, sampling/check limits, technical source/data links |
| KIOTA_SAMPLE | Local HTTP 200; original sample and no-endorsement disclaimer preserved |
| PUBLIC_REPO_V1 | Preserved; no private support or new feature |
| ELIGIBILITY | Existing fixture tests pass, including inaccessible/private and unsupported rejection; production unrun |
| STRIPE_LIVE_ACCOUNT | Ryan explicitly confirmed authorization after initial automatic-review rejection. CLI is sandbox-only. Live dashboard account acct_1UDDJ2A4MpEXwdH4 redirects to Activate Payments and requires legal business type; owner activation pending |
| STRIPE_LIVE_PRODUCT | Not inspected or configured |
| STRIPE_LIVE_PRICE | Not inspected or configured; requested USD 5000 launch direction not hardcoded |
| STRIPE_LIVE_PAYMENT_LINK | Not inspected or configured |
| REAL_MONEY_TRANSACTION | NO |
| WEBHOOK_PUBLIC | Not established |
| PRODUCTION_CONFIG_SEPARATED_FROM_TEST | No production config created; mode separation regressions pass locally |
| RUNTIME_ANALYSIS | Local real Git fixture journey PASS; Linux production unrun |
| PDF_GENERATION | Local real Chrome fixture journey PASS; production unrun |
| SECURE_DOWNLOAD | Local complete journey PASS; production unrun |
| UNAUTHORIZED_DOWNLOAD_REJECTION | Local regression PASS; unauthenticated preview request rejected; production unrun |
| REASSESSMENT | Local complete journey PASS; production unrun |
| SUPPORT_CONTACT | support@ohcaygo.com visible; mailbox delivery not tested |
| PRIVACY_SECRET_CHECK | Public copy adds no credentials; existing secret-scrub and protected-delivery tests pass; production not inspected |
| NON_CLAIMS | Existing limits/disclosures preserved; historical study is explicitly distinct from paid factory coverage |
| TESTS | npm test: 26 analyzer + 9 report PASS; npm run test:factory: 32 PASS, including real Git/PDF with synthetic Stripe fixture, not a new Stripe transaction; git diff --check PASS |
| INDEPENDENT_REVIEW | Existing factory review and fixes inspected. No complete production candidate exists to review; no new independent review claimed |
| FILES_CHANGED | factory/public/index.html; factory/PUBLIC-LAUNCH.md |
| COMMITS | 55c3e14 adds study and execution evidence; a subsequent documentation commit records owner clarification and hosting/activation findings; obtain current hash with git log -1 |
| WORKING_TREE | Checked clean after commit |
| EXTERNAL_ACTIONS | Read-only public GitHub HEAD and public DNS lookups; inspected Stripe sandbox and live activation UI after explicit owner confirmation; inspected Cloudflare login. No external mutation, push, deployment, purchase or refund |
| KNOWN_LIMITATIONS | Existing factory limits preserved; no compatible host/access identified in inspected repository or local SSH configuration |
| UNVERIFIED_WITHOUT_REAL_PAYMENT | Entire production environment remains unverified. Post-live-payment execution cannot be claimed; it is not the sole remaining gap |
| BLOCKER | Paid-host selection/approval; Cloudflare sign-in; Stripe business/account activation by Ryan |
| NEXT | STOP pending required owner input |

Fresh git ls-remote origin HEAD returned dab4c4b896a4ff704603e4945edfce87c43fd4e5.
Prior local acceptance is evidence of local completion only. The old localhost:4327
browser page was cached; reload refused connection. An isolated no-credentials
preview was used instead, with separate temporary state and unavailable checkout.
No existing payment state was changed.

## Hosting decision after owner clarification

Ryan confirmed ohcaygo.com control. Live public hostname VERIFIED 2026-09-08 as merge-proof.ohcaygo.com (hyphen). Earlier launch notes that used the unhyphenated form are SUPERSEDED. Requested
existing-infrastructure investigation plus lowest-cost compatible alternatives.
No purchase is authorized yet. No external resources have been provisioned.

Inspected current local OHCAYGO deployment records describe EAS Hosting, SKYNET
on Vercel, and local Mac workers. No reusable persistent Linux machine or SSH
configuration was found. This is a bounded inventory finding, not proof that
Ryan has no other hosting account. The existing factory needs a full Node process,
child processes, Git/Chrome, single-writer filesystem state and retained artifacts.
EAS worker runtime and the existing Vercel deployment do not supply this runtime
without an architecture change. Local Mac worker exposure is not the approved
persistent Linux production target.

Published monthly USD prices checked September 8, 2026, before tax, optional
backups and usage overages (not a quoted final account invoice):

| Option | CPU / RAM / disk | Monthly base including IPv4 | Assessment |
|---|---|---|---|
| Hetzner CX23, EU | 2 shared vCPU / 4 GB / 40 GB | $7.09 ($6.49 + $0.60 IPv4) | Lowest priced option checked; public page currently marks unavailable, so not an immediately assured purchase |
| DigitalOcean Basic | 1 vCPU / 2 GiB / 50 GiB | $12.00 | Recommended straightforward starting host for one bounded worker; target PDF/time-limit verification still required |
| AWS Lightsail Small Linux | 2 vCPU / 2 GB / 60 GB | $12.00 | Comparable alternative; 3 TB transfer bundle |

Sources:
- https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/
- https://docs.hetzner.com/cloud/servers/primary-ips/overview/
- https://www.hetzner.com/cloud/cost-optimized/
- https://www.digitalocean.com/pricing/droplets
- https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-bundles.html
- https://docs.expo.dev/eas/hosting/reference/worker-runtime/
- https://vercel.com/docs/functions

No claim is made that a proposed size has passed the production workload. Use a
single non-root service with the existing private persistent state, HTTPS proxy,
and normal Chrome sandbox, then run the specified production acceptance checks.

Stripe live activation page asks for business type: unregistered business,
registered business, nonprofit, or government entity. No choice was invented or
submitted. Live product/price/link configuration remains uncompleted behind this
owner activation requirement. Cloudflare login explicitly displays agreement to
terms on continuing; it was left for Ryan without accepting terms on his behalf.
