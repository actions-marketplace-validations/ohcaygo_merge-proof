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
| `GET /proof/gate` | Required-check status, merge policy, presets and guided setup |
| `POST /proof/gate` | Set this repository's merge policy; repository admin only |
| `GET /proof/merges` | Durable merge evidence ledger; `?record=<id>` for one full row |

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

The owner decides whether to require any check. **Merge Proof never changes
branch protection or rulesets**, and does not request the permission that would
let it. Its own check cannot serve as independent CI proof: it is recorded as an
explicit self-reference and excluded from the requirements the receipt must
establish, so requiring it does not deadlock the gate. Publication is a receipt
delivery surface bound to one commit, not an atomic merge authorization
mechanism; see "Merge assurance" below for what an enforcing policy changes.

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

## Merge assurance: the required gate, and the policy behind it

Merge Proof reports on every proof. Whether that report **blocks** a merge is two
separate decisions, and both have to agree.

**GitHub decides whether the check is required.** Merge Proof reads repository
rules (Administration read, the same two sources every proof already reads) and reports
whether its own context is currently required on the base branch, and whether the
rule binds it to this App. It never writes branch protection or a ruleset.
Writing one needs Administration: write, which also grants renaming,
transferring and deleting the repository, adding collaborators and deploy keys,
and removing the very rule that gates the merge. An App that can switch off its
own gate is not a gate, so this App does not request that permission. `setup.js`
returns the exact guided steps and deep links instead.

**Merge Proof decides what its check reports.** This matters because GitHub
treats a required check concluding `neutral` or `skipped` as a **pass**. A
report-only policy is therefore the only policy that may emit `neutral`; an
enforcing policy emits `success` or `failure` and nothing else. A superseded
published check is retracted to `failure` under an enforcing policy rather than
to `neutral`, and a check run cannot be re-pointed at a new commit, so a new head
always gets a new check run — an unreported required check leaves the pull
request blocked with "Waiting for status to be reported".

### Presets

| Preset | Blocks merge | What it enforces |
|---|---|---|
| `ADVISORY` | never | Default for every repository, existing and new. Behavior is unchanged from before this feature existed. |
| `REPOSITORY_REQUIREMENTS` | yes | The evidence for the requirements the repository already configures, established for the exact state being merged. A protected boundary is reported but does not block. |
| `REPOSITORY_REQUIREMENTS_AND_BOUNDARIES` | yes | As above, and a candidate touching a protected boundary additionally needs at least two current eligible human approvals. |

The policy is stored per repository ID, set only by a repository administrator,
and recorded with who set it and when. There is no policy language: the
requirements come from the repository's own rules.

`policy.evaluate()` never changes a verdict and never hides a gap. It partitions
the receipt's gaps into blocking and reported, and it **fails closed**: every gap
blocks under an enforcing preset unless it appears in an explicit
boundary-scoped set, so a gap code added later blocks by default rather than
silently becoming advisory. A FAIL verdict, a STALE receipt and an unconfirmed
currentness all block an enforcing gate.

### Gate readiness

Merge Proof will not recommend a blocking preset it cannot satisfy, and says so
before the gate is enabled rather than after merges stop:

- a branch that requires no validation has nothing to prove, so the gate would
  block permanently;
- a requirement outside what Merge Proof can establish (code owners, signatures,
  linear history, conversation resolution, ALLGREEN queue grouping) would block
  permanently. GitHub still enforces those itself; Merge Proof simply does not
  claim them.

### Merge Proof's own required check

When a repository requires Merge Proof's own context, that requirement is
satisfied by publishing the receipt, and the receipt cannot be independent
evidence about the change it describes. It is recorded as `selfReference` and
listed in `notChecked`, and excluded from the requirements the receipt must
establish. It is **not** emitted as a requirement no evidence could satisfy,
which would deadlock every gated pull request. Every other required check is
enforced exactly as before, and a same-named context bound to a different App is
somebody else's requirement and stays a real one.

## Who or what changed this

`summary.actors` records deterministic provenance from evidence already read:
pull request author, commit author and committer accounts, commit signature
verification, reviewers, check-publishing Apps, workflow actors, and the merging
account. Each carries the account type GitHub returned, classified as
`HUMAN_ACCOUNT`, `APP_OR_BOT` or `UNKNOWN`. The `[bot]` login suffix is recorded
as corroboration only; GitHub documents it by example, not as a guarantee.

`agentIdentity` is `OBSERVED_APP_OR_BOT`, `NONE_OBSERVED` or `UNAVAILABLE`, and
covers **authorship** only — check publishers are Apps on nearly every
repository and would otherwise make every change look agent-authored.

The limit is stated on every receipt rather than filled in: GitHub records the
account that acted, not the tool it was driven by. A coding agent run with a
person's own credentials is recorded as that person, and no API field on a pull
request, review or commit records the credential class. `NONE_OBSERVED`
therefore does not establish that a person wrote the code. Git header name and
email are unvalidated client strings and are never stored; only linked account
identity is.

## Durable merge evidence record

On a merged pull request the service writes one immutable ledger row before
staling receipts. It preserves repository, PR, landed commit, PR head, merge
actor, and a detached snapshot of the latest receipt issued no later than the
reported merge timestamp. The snapshot includes requirements, approvals,
checks, gaps, provenance and the recorded publication result when available
before merge. Later same-head receipts cannot become evidence for an earlier merge.

A webhook is not an atomic observation of GitHub's merge decision.
`currentnessAtMerge` therefore remains `UNAVAILABLE`; `currentnessAtDelivery`
records the separate delivery-time observation. A matching PR head alone is
`PROOF_BOUND_TO_PR_HEAD_ONLY`. Exact landed-state binding requires the receipt's
validated target SHA to equal the landed commit; other heads remain
`PROOF_BOUND_TO_OTHER_STATE`. No eligible pre-merge receipt means
`NO_PROOF_RECORDED`. Neither a published check nor its policy is represented as
proof of GitHub's actual decision at merge time.

The snapshot survives receipt retention. Duplicate deliveries and later evidence
never rewrite it. The ledger is bounded at 5,000 rows and explicitly reports
pruning; export records you need to retain beyond this bound.

Retrieval is scoped to the authorized installation and repository:
`GET /proof/merges` lists and filters (`pr`, `verdict`, `since`, `until`,
`limit`), and `?record=<id>` returns one full row as JSON for export or agent
consumption.

## Metering is unaffected

One billable unit remains `(installation ID, immutable repository ID, PR number,
head SHA)`, deduplicated permanently. A required gate causes re-proofs on the
same head — from check, workflow, status, review and ruleset events — and every
one of those is zero debit. No price, allowance or top-up changed.

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
