# MERGE-PROOF-MERGE-ASSURANCE-WEEKEND-001 — continuation handoff

Date: 2026-09-11 · Agent: Claude Code · Status: **PARTIAL, stopped deliberately at session limit**

## OUTCOME (original finish line)

Advance the live Merge Proof product into the strongest coherent MERGE ASSURANCE
control shippable from existing architecture: (1) required merge gate,
(2) low-config policy derived from the repository's own rules, (3) durable merge
evidence record, (4) agent/human accountability, (5) NOT_PROVEN as a high-value
result. Pricing locked. No enterprise theater, no dashboard project.

## CURRENT BRANCH

`claude/merge-assurance-weekend-001`

Base commit: `615308b7933504dfc450c22bb3c9534db7eb83cf`
(`codex/merge-proof-brand-polish`, which is 31 commits ahead of `origin/main`
and is the real development tip — `origin/main` is `dab4c4b` and does **not**
contain the exact-state, Pro-productionization, funnel or brand work.)

## CURRENT COMMIT

`5d08fdc6158657e1f4b5f133e42f2febed2c97a6`

- `1ddda8c` Make Merge Proof usable as a required merge gate
- `5d08fdc` Publish on the head as well as the queue commit; name check collisions

Not pushed. No PR opened.

## WORKING TREE

Clean except `?? .cursor/`, which was already untracked before this work began
and was not created, modified or staged here. Nothing of this campaign is
uncommitted.

## IMPLEMENTED (working, tested)

**Three defects that made a required gate unshippable — all fixed.**

1. *Fail-open conclusion.* `check.js` published `neutral` for everything that was
   not CURRENT+VERIFIED. GitHub treats a required check concluding `neutral` or
   `skipped` as a **pass**, so a repository that required Merge Proof would have
   merged on NOT_PROVEN and on stale proofs. An enforcing policy now emits only
   `success` or `failure`, and a superseded check is retracted to `failure`.
2. *Self-check deadlock.* Requiring Merge Proof's own context put it into
   `requirements().checks`, where `ciEvidence` marked it unsatisfiable —
   permanent NOT_PROVEN, so a blocking gate would have frozen every gated PR
   forever. It is now recorded as `summary.ci.selfReference`, listed in
   `notChecked`, and excluded from the requirements the receipt must establish.
   A same-named context bound to a **different** App stays a real requirement.
3. *Unconditional protected boundary.* `PROTECTED_BOUNDARY` blocks whenever a
   candidate touches migration/schema/auth/secrets/billing/policy paths, and the
   hosted path deliberately loads no `.mergeproofignore`, so there is no way to
   clear it. A single blocking mode would have frozen every migration and auth
   PR. Verdict and policy are now separate: the receipt still reports the gap;
   the preset decides whether it blocks.

**New modules**

- `github/policy.js` — three presets. `ADVISORY` (default everywhere, existing
  behavior, never blocks), `REPOSITORY_REQUIREMENTS`, and
  `REPOSITORY_REQUIREMENTS_AND_BOUNDARIES` (adds: a boundary-touching candidate
  needs ≥2 current eligible human approvals). `evaluate()` never changes a
  verdict and never hides a gap; it partitions gaps into blocking/reported and
  **fails closed** — an unrecognised gap code blocks rather than going advisory.
  FAIL, STALE and unavailable currentness all block an enforcing gate.
- `github/setup.js` — read-only required-check detection from the two rule
  sources every proof already reads (Metadata read, zero new permissions, zero
  new API calls in the proof path), plus gate-readiness and guided steps.
  **Merge Proof does not request Administration: write and never writes a
  ruleset or branch protection** — that permission also grants repo delete,
  transfer, collaborators and deploy keys, and would let the App remove the rule
  gating it. Readiness refuses a blocking preset the branch cannot satisfy
  (nothing required to prove; or code owners / signatures / linear history /
  conversation resolution / ALLGREEN present) *before* merges stop.
- `github/ledger.js` — immutable merge records, written **before** the merge
  event stales anything, so they hold what was known at the decision point.
  Self-contained snapshots (survive receipt retention), repeated deliveries
  ignored, bounded at 5,000 with an explicit pruning count so a listing never
  implies completeness it lacks. Records `PROOF_BOUND_TO_OTHER_STATE` when the
  latest receipt covers a different commit than the one that landed, and
  `NO_PROOF_RECORDED` when there is none.
- `github/actors.js` — deterministic provenance: PR author, commit author and
  committer accounts, signature verification counts, reviewers, check-publishing
  Apps, workflow actors, merging account. `HUMAN_ACCOUNT` / `APP_OR_BOT` /
  `UNKNOWN`; the `[bot]` suffix is corroboration only, never the determinant.
  `agentIdentity` covers **authorship only** — check publishers are Apps on
  nearly every repo and would otherwise make every change look agent-authored.
  The limit is stated on every receipt: GitHub records the account, not the tool
  it was driven by, so an agent run with a person's credentials is that person,
  and `NONE_OBSERVED` does not establish that a human wrote the code.

**Changed** — `proof.js` (`prove(capture, {appId})`, self-reference, new summary
sections), `check.js` (policy conclusions, publishes on PR head **and** merge
group commit, plain-English body), `collect.js` (`collectRules` extracted and
shared; `actors` observation; `appSlug`; workflow `actor`/`triggeringActor`),
`service.js` (per-repo policy, gate-aware publication, ledger write, policy-aware
stale retraction across all published checks), `http.js` (`GET|POST /proof/gate`,
`GET /proof/merges`), `receipt.js` (WHO/WHAT CHANGED THIS, layered NOT_PROVEN,
policy consequence), `wording.js` (every gap now answers what is missing, why,
what to do, whether re-proof is automatic, whether policy blocks),
`customer-public.js` (gate status + policy selector + merge records, admin-gated),
`receipt.schema.json` (additive), README/PRODUCTION docs.

**Pricing, allowances, metering: unchanged.** A blocking gate causes more
re-proofs on the same head; all are zero debit under the existing permanent
`(installation, repository, PR, head SHA)` dedup. Verified by test.
**Published npm package: unchanged** — `npm pack --dry-run` still 14 files, no
`github/` content; CLI exit codes, schema v1 and Action metadata untouched.

## PARTIAL / NOT DONE

- **Independent review incomplete.** An 8-dimension adversarial review workflow
  (false-pass, self-reference, ledger immutability, actor honesty, authz/privacy,
  regression, permission overreach, policy semantics) was running when the
  session was stopped. Its verdict is **not available**. Treat this candidate as
  **NOT INDEPENDENTLY REVIEWED**.
- **No live GitHub acceptance.** Everything is fixture-driven. Nothing in this
  campaign contacted GitHub, Stripe or any external service. The dev acceptance
  packet (`github/dev/OWNER-SETUP.md`) needs Ryan: Smee channel, App webhook
  config, and a PR on `ohcaygo/merge-proof`.
- **Landing page untouched.** The category distinction is explained in-product
  (gate section) but not on `factory/public/index.html`. Deliberate: the
  acquisition funnel was just tuned and was not worth disturbing unreviewed.
- **No merge-queue live test.** Merge-group check publication is unit-tested
  against fixtures only.

## KNOWN FINDINGS

| # | Finding | Status |
|---|---|---|
| 1 | Enforcing gate could emit `neutral`, which GitHub passes | **FIXED** + test |
| 2 | Requiring our own check deadlocked the proof permanently | **FIXED** + test |
| 3 | Protected boundary would freeze every migration/auth PR under a single blocking mode | **FIXED** by separating policy from verdict + test |
| 4 | Merge-group proof published only on the queue commit, leaving the PR head with no check ("Waiting for status to be reported" forever) | **FIXED** in `5d08fdc` + test |
| 5 | A required check named like ours but owned by another App reported as merely "missing", with useless advice | **FIXED** in `5d08fdc` — now `NAME_COLLIDES_WITH_MERGE_PROOF_CHECK` with the real remedy |
| 6 | Adding `appSlug`/`actor` to collected checks/execution changes those field hashes, so **every pre-existing receipt goes STALE on its first refresh after deploy** | **OPEN, accepted.** Conservative (stale → re-proof), never a false pass; zero debit; invisible under the default ADVISORY policy. Not yet documented in PRODUCTION.md. |
| 7 | On the CLI and historical-scan paths `prove()` has no `appId`, so a required context named exactly like ours is treated as self-reference regardless of publisher | **OPEN, accepted and declared.** Hosted always passes `appId`. Pre-existing behavior was worse (silent permanent NOT_PROVEN, since `collect.js` already drops all checks with that name). Now recorded in `selfReference` + `notChecked`. |

## TESTS ACTUALLY RUN (exact, at `5d08fdc`)

```
npm run test:github    136 tests, 136 pass, 0 fail   (was 106 at base; +30 new)
npm run test:factory    37 tests,  37 pass, 0 fail
npm test                26/26 tests passed; 9/9 pilot report tests passed
git diff --check        clean
npm pack --dry-run      14 files, unchanged from base
node github/examples/generate.js   regenerated
ajv validate --spec=draft2020 -c ajv-formats \
  -s github/receipt.schema.json -d github/examples/receipt.json
                        github/examples/receipt.json valid
node bin/merge-proof.js --repo . --base HEAD~2 --head HEAD --json
                        VERIFIED, exit 0
API budget for one full proof (collect runs collectOnce twice): 38 of 240
```

New coverage lives in `github/test/gate.test.js` (30 tests) and additions to
`github/test/customer.test.js` and `github/test/delivery.test.js`.

## NOT TESTED

- Anything against real GitHub: real rulesets, a real required check actually
  blocking a real merge, real merge queue, real webhook deliveries.
- The customer UI in a browser. The script is syntax-checked and every element
  it references exists in the page, but it has not been rendered.
- Ledger behavior at the 5,000-row capacity boundary (logic is unit-covered;
  the boundary itself is not).
- Stripe, billing, renewal — untouched and unexercised by this work.

## DEPLOYMENT

**Not deployed. Nothing was deployed and nothing external was contacted.**
Production remains whatever is currently live at
<https://merge-proof.ohcaygo.com/> from the previously accepted checkpoint.
Do not deploy this candidate until the independent review completes and live
acceptance runs.

Rollback is trivial: the branch is unmerged and unpushed; `origin/main` and the
deployed artifact are unaffected.

**Deployment caution to carry forward:** under a blocking policy Merge Proof
emits only `success`/`failure`. If code that emits `neutral` is ever rolled back
into place while a customer ruleset requires this check, that customer's gate
silently stops blocking. Treat a rollback across this change as a gate-affecting
change. (Recorded in `github/PRODUCTION.md`.)

## NEXT IMPLEMENTATION STEPS (ordered)

1. **Re-run the independent review** on `5d08fdc` against base `615308b`, with
   the dimensions listed above. Highest-value targets: false-pass paths in
   `policy.evaluate`, the self-reference exclusion in `proof.js` `ciEvidence`,
   webhook ordering for the ledger write, and authorization on the two new HTTP
   routes. Resolve findings before anything else.
2. **Document finding 6** (post-deploy staleness of pre-existing receipts) in
   `github/PRODUCTION.md` as expected first-refresh behavior, so it is not read
   as an incident.
3. **Live dev acceptance** via `github/dev/OWNER-SETUP.md` — Ryan-gated. Prove,
   on a real PR: check published on the head; ruleset requires the context;
   NOT_PROVEN under a blocking preset actually prevents merge in GitHub's UI;
   new head supersedes; merge writes a ledger row.
4. **Merge-queue acceptance** — the one path where the two-commit publication is
   only fixture-tested.
5. **Landing-page line** for the category distinction (required gate + durable
   receipt), written so it does not disturb the tuned funnel.
6. **Retention policy** for the ledger before onboarding more customers — 5,000
   rows is a technical bound, not a customer promise.

## DO NOT RESTART FROM SCRATCH

The next agent must **inspect and continue this candidate**, not rebuild it.
Start with `git diff 615308b..5d08fdc -- github/`, then read
`github/policy.js`, `github/setup.js`, `github/ledger.js`, `github/actors.js`
and the "Merge assurance" section of `github/README.md`. The three fail-open /
deadlock / boundary-freeze defects above are the reason the design looks the way
it does; re-deriving them costs a day.
