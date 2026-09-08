# Public launch execution — September 8, 2026

PUBLIC_LAUNCH_FINISH_LINE: NOT_ACHIEVED

| Return field | Current evidence |
|---|---|
| PRODUCT | Merge-Proof Standard Evidence Pack |
| PUBLIC_URL | None deployed |
| REPOSITORY_HEAD | Baseline b856624cfc6f344e808ea19b3c461c9551f3f6bd; this record and study copy form a subsequent local commit |
| DEPLOYMENT_TARGET | Not established; persistent non-root Linux Node/Git/Chrome runtime required |
| DOMAIN/HOSTNAME | Ryan-approved mergeproof.ohcaygo.com; no address returned by DNS. ohcaygo.com nameservers are phoenix.ns.cloudflare.com and chip.ns.cloudflare.com; Ryan confirmed domain control; Cloudflare dashboard currently requires sign-in |
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
| COMMITS | One local study/launch-evidence commit; obtain exact hash with git log -1 |
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

Ryan confirmed ohcaygo.com control, approved mergeproof.ohcaygo.com, and requested
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
