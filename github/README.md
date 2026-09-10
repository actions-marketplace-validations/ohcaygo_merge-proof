# Prove the merge: exact-state receipts

This is an additive, **local/dev candidate**, not an installed production GitHub
App. The canonical repository is `ohcaygo/merge-proof`. It extends the existing
single-process factory and its private JSON store. It does not replace the CLI,
composite Action, paid pack flow, public collector, or report generator.

The September 10 engineering assignment explicitly authorizes this candidate
beyond the older Command Center freeze/public-only scope. It does not authorize
production deployment, pricing changes, repository policy changes or SKYNET work.

## Run it

```sh
npm test
npm run test:factory
npm run test:github
node github/cli.js OWNER/REPO PR --out /tmp/a-new-receipt-directory
node github/cli.js OWNER/REPO PR --previous /path/to/prior/receipt.json --out /tmp/a-new-refresh-directory
node github/scan.js OWNER/REPO 5 /tmp/a-new-history.json
```

The separate GitHub CLI uses optional `MP_GITHUB_TOKEN` from the environment.
Use an authorized local credential mechanism; never put tokens in command-line
arguments, repository files, receipt URLs or chat. Errors do not print tokens or
provider response bodies. This is **not** a new option on `npx merge-proof`.
The published local CLI remains offline, schema version 1, zero dependencies,
and unchanged exit codes. GitHub receipts use schema version 2 and a separate
entry point. The npm package's existing shipped file boundary is unchanged.

GitHub CLI exit codes: 0 VERIFIED, 2 NOT_PROVEN, 3 analysis/collection failure.
It creates a new output directory and refuses to overwrite existing artifacts.
A failed refresh cannot overwrite a prior receipt. The previous receipt's
currentness is a separate JSON file. Saved HTML starts UNAVAILABLE until fresh
observations establish currentness; it cannot silently become an evergreen badge.

## Hosted development flow

Set `MP_GITHUB_APP_CONFIG` to a private JSON configuration file outside the repo,
then start the **existing** factory normally. `{}` enables public proof routes
for local development without enabling App operations. App credentials are only
needed for installation events and authenticated collection. Existing factory
configuration, Stripe configuration and routes retain their meanings.

Configuration fields: `appId`, `privateKey` (PEM), `webhookSecret` (at least 32
characters), and optional `publishChecks: true`. Store configuration mode 0600.
Do not expose the factory state directory through static hosting.

New routes:

| Route | Behavior |
|---|---|
| `GET /proof/` | Public/cold PR form; no purchase required |
| `POST /proof/run` | JSON `{repo, pr, publish}`; collect and return a receipt |
| `GET /proof/receipts/:id` | Authorized HTML receipt; currentness requires refresh |
| `GET /proof/receipts/:id?format=json` | Same evidence as the human receipt |
| `POST /proof/receipts/:id/refresh` | Re-observe evidence; preserve original verdict |
| `POST /proof/webhook` | Verify GitHub HMAC, deduplicate delivery, stale and queue proof |

API clients can supply `Authorization: Bearer <GitHub user token>` to access
private repositories. Tokens are transient and never persisted. Each read checks
the current repository identity and authorization at GitHub. Anonymous reads
require intentional publication **and** a currently public repository. A public
repository becoming private closes anonymous receipt access. API failure denies
access; it never publishes private evidence as a fallback.

Browser GitHub sign-in/OAuth is **not implemented**. Private receipt JSON/HTML is
available to authenticated API clients; a bare private permalink does not log in
the browser. Public shared receipts support the browser journey and refresh.
Without publication, the form offers a one-time JSON download; later retrieval
requires an authorized repository API client.

The existing Pages proxy now recognizes `/proof/` and preserves its existing
origin/proxy-secret boundary. No live Pages or backend deployment occurred.

## GitHub App connection

Register/install the App through the owner's normal GitHub flow. Registration,
credentials, installation and production endpoint activation have not occurred
in this candidate. No token or new authority was obtained during development.

Repository permissions requested by the installation-token exchange:

- Metadata: read (implicit).
- Contents: read for Git metadata and refs.
- Pull requests: read for candidate and review observations.
- Commit statuses: read.
- Checks: read; **write only if `publishChecks` is enabled** to report this App's check.
- Actions: read for workflow run/job/step records.
- Administration: read for classic branch protection; never write.

Subscribe to pull request, pull request review, check run, check suite, status,
workflow run, push, merge group, repository ruleset, branch protection rule and
repository events. Ping is supported. An open PR event starts tracking that PR;
existing PRs require a new event or an explicit run. This is not an installation
backfill. There is no organization-wide discovery or organization webhook route.

Signed events conservatively invalidate tracked receipts for that repository
before work begins. A persisted queue processes one proof at a time. Queue jobs
survive restart; three failed attempts stop that job with explicit unavailability.
Later events can retry. Events arriving during collection prevent CURRENT. Own
check events are ignored and own receipt checks are excluded from proof inputs.
Optional check publication contains the exact same receipt verdict and link.
Stale published checks are changed to neutral when the queued refresh can reach
GitHub. A failed GitHub write cannot guarantee immediate check-UI invalidation;
the receipt remains historical and the endpoint never infers currentness.

The owner decides whether to require any check. **This candidate never changes
branch protection or rulesets.** Its own check cannot serve as independent CI
proof; making it part of the collected CI requirements produces an explicit
self-reference gap. Treat optional publication as a receipt delivery surface,
not as an atomic merge authorization mechanism.

## What the proof means

The collector projects REST responses to Git metadata, rule parameters, paths,
SHA/ref identities, IDs, states and timestamps. GitHub compare responses may
include patch text in transit; patches are discarded immediately and are not
stored, rendered, logged or sent to a model. Review bodies, commit messages and
check output text are discarded. No repository tree is cloned or customer code
executed by this layer. The local verifier still uses only local Git reads.

Two complete bounded observations must match. This detects observed races; the
GitHub API is not an atomic snapshot and cannot guarantee future merge state.
The result explicitly states that limitation. Every field is tied to the
repository ID, PR, head, base and observation that produced it.

Applicable CI target:

1. Head if it contains the exact current base.
2. Otherwise the current GitHub test-merge ref, with exactly matching base/head parents.
3. For merge queue, a live group ref, candidate/base ancestor evidence, and a
   matching live GraphQL queue entry are required. The queue entry must expose
   the same group/base/candidate identities. If GitHub does not expose that
   relationship, current selection is UNAVAILABLE. ALLGREEN requirements for
   other entries are explicitly unsupported; the receipt cannot waive them.
4. Historical scan uses only an explicit two-parent landed merge.

CI distinguishes observed accepted conclusions from execution records. The
implementation observes required contexts and App IDs, current/head/other SHA,
latest check attempt, statuses, success/neutral/skipped/failure/pending, workflow
run/attempt/job/check IDs and steps. Execution requires a successful current-SHA
check with a matching successful workflow run/job and successful recorded steps;
a skipped step prevents full execution proof. Status-only and external-provider
success assertions do not become workflow execution proof. A customer's workflow
can check out arbitrary code: **the receipt does not prove checkout contents or
semantic test coverage.** “GitHub accepted” is a computation from observed
conclusions, not a claim that all GitHub merge controls permit merging.

Rulesets and classic protection are intersected, not treated as alternatives.
403/404 on protected-branch policy reads remain unavailable. Classic signature and linear-history requirements are preserved in the evidence
and block proof as unsupported; they cannot silently disappear from freshness.
Other classic controls outside CI/review policy are not comprehensively evaluated. Unknown active
ruleset requirements remain blocking limitations. No required validation
configured means no required-validation proof, not automatic VERIFIED.

Approval requires current-head human review by a non-author with independently
observed write permission, the required count, and no observed outstanding
changes-requested decision. Comments do not erase approval. Old-head approvals
are conservatively insufficient even when the repository permits them. Dismissed
reviews do not count. CODEOWNERS, required teams, review-thread resolution and
last-push actor approval remain explicit unsupported requirements, not guesses.

Remote durability means the exact head repository's branch ref equals the
candidate SHA **at observation**. It is not a future retention guarantee.

The existing analyzer evaluates collected path metadata through a supplied Git
reader. Its local findings are preserved, including BASE_DRIFT_UNVERIFIED and
PROTECTED_BOUNDARY. Remote CI never silently waives these findings. STALE_BASE
remains advisory; base movement without overlap can still produce VERIFIED when
the other exact-state evidence is sufficient. Existing protected categories and
ignore behavior remain unchanged locally. Hosted metadata does not load customer
ignore files. Additional repository-specific boundary configuration is not added.

## Receipt, freshness and history

`receiptId` identifies an immutable version-2 receipt. `policy` names the
implemented evidence policy; `fingerprint` hashes canonical evidence for change
detection, not cryptographic certification. `evidence` is inspectable underneath
`summary`. No confidence score, AI decision or signing system is involved.

Historical `verdict` stays VERIFIED / NOT_PROVEN / FAIL. Currentness is stored and
returned separately: CURRENT at an observation, STALE when evidence differs, or
UNAVAILABLE when refresh cannot establish currentness. Timestamp passage alone
does not expire proof. A later failed refresh retains a known STALE state and
marks refresh unavailable. Unrefreshed permalink views never show saved CURRENT
as live current. HTML is responsive and printable; no new PDF requirement is
introduced. Existing PDF delivery still depends on Chrome.

The scan examines at most 10 merged PRs selected from one page of 30 recently
updated closed PRs. It uses the same collector, proof evaluator and local analyzer.
Squash/rebase shapes remain UNAVAILABLE. Current rules cannot reconstruct rules
and approval validity at merge time, so a historical full VERIFIED result is
withheld. Findings describe exact evidence conditions, never bugs or money saved.

## Persistence and future metering

Records live in `store.data.github`, separate from existing orders/payments:
receipts, subscriptions, queue, delivery IDs, repository revisions and completed
proof events. The existing single-writer lock, atomic rename, fsync and private
file modes apply. No new database/provider is required.

`proof.completed` is a future counting seam, not billing. It is emitted only for
a stable, non-FAIL result with available required collection sources. Source
failures and partial observations retain diagnostic receipts but emit no completed
event. There are no prices, top-ups, credits, charges or user billing quotas.
Technical bounds (request/page/file limits, 1,000 stored receipts, 100 tracked PRs,
10,000 delivery IDs) stop with an error; they are not a commercial offer. A real
production rollout needs an owner-selected retention/capacity policy. This build
does not delete historical receipts to free space.

## Primary API references

- [Active branch rules](https://docs.github.com/en/rest/repos/rules)
- [Classic branch protection](https://docs.github.com/en/rest/branches/branch-protection)
- [Required check conclusions](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Merge queue entry fields](https://docs.github.com/en/graphql/reference/pulls)
- [GitHub webhook payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads)

`examples/receipt.*` is explicitly synthetic fixture output, not a customer proof.

## Development owner acceptance

Follow [the exact setup and live acceptance packet](dev/OWNER-SETUP.md).
The packet uses a public owner-controlled development PR, a development-only relay,
and the existing server. `dev/acceptance.js` observes actual saved signed delivery
IDs and checks immutable history versus a changed head; it does not manufacture
webhooks or mark live acceptance complete from fixtures.
