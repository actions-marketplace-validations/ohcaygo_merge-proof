# MERGE-PROOF-7DAY-TRIAL-AUTO-ACTIVATION-001

FINAL: PASS — production acceptance and deployment completed September 12, 2026.

## Current production acceptance

Production source: `0a635a7f9035d027d97aad7b10287e7b925a0e4c`.
Release: `/opt/merge-proof/releases/trial-0a635a7`, service active.
Owner action is complete; no reinstall, permission change or further owner action
is needed. NEXT: STOP.

Fresh GitHub API confirmed production App 4901537 installation **161208536** for
`ohcaygo`, and a repository-scoped token authorized `ohcaygo/merge-proof`
(repository 1352881392). Isolated acceptance using this production App created a
CURRENT NOT_PROVEN proof and started a seven-day trial before promotion; that
probe never wrote production state or published checks.

Promotion used the already-tested immutable archive (SHA256
`3b3eaa9dc37e5f847d9ce6eaa29b67856224a49548edcc9dd0d581995172d3b3`), backed up
factory and Pro state with the service stopped, and switched the existing release
symlink. Exact authenticated backend asset health passed. Production configuration,
Stripe prices and Cloudflare Pages deployment were unchanged.

The real hosted browser journey completed GitHub OAuth, selected the `ohcaygo`
installation, automatically selected its repository, discovered PR #4 and produced
receipt **49dea0b1-e52b-48e5-906a-bb6ebea75b54** without clicking Prove it now.
The installation event was at 19:15:56 UTC; it did not start a trial. The first
successful receipt started it at **2026-09-12T19:25:43.870Z**, ending
**2026-09-19T19:25:43.870Z** (September 19, 2:25 p.m. Central).

Receipt verdict is correctly NOT_PROVEN / CURRENT at observation, for head
`4b6e8246f88a25b99ed307c1a062afbadf29c08f`. GitHub Check **103608101403** was
published by production App 4901537 on that same head, concluding neutral under
the unchanged report-only policy. This is not an enforcing or VERIFIED claim.

Authorized HTML receipt access and its trial notice/Continue link passed in the
browser. Anonymous JSON access returned 403 LOGIN_REQUIRED. Trial enforcement
options were visibly disabled. One observed active developer displayed $29/month.
The public JavaScript matched the exact release. Public HTML also matched after
verifying and normalizing only Cloudflare's support-email encoding and its email
decoding script; that CDN transformation was not a source mismatch.

A real GitHub redelivery of the installation event (GUID
`60dfd2d0-aede-11f1-8865-993a29cb2a14`) returned HTTP 202 OK. The original trial
start/end/receipt binding remained identical and exactly one trial_started event
was stored. Historical receipt bodies, billing ledger, policies and merge ledger
matched the pre-promotion backup. Live Stripe price was fetched again and verified
as active USD 2900, monthly, licensed. No live checkout, charge or subscription
activation was manufactured.

Durable events cover the actual owner acceptance journey, including connect,
repository authorization, first proof, trial start and automatic proof. The
supported aggregate export ran on production and is retained in
`trial-auto-activation-001/trial-production-funnel.json`. These are founder
acceptance events, not evidence of outside adoption or a paid customer.

Expiry, day 5/6/7 reminders, enforcing-expiry warnings and paid activation/resume
remain covered by the exact candidate's isolated Linux tests; no production clock,
payment or GitHub protection was altered to simulate those cases. The 248/248
Linux test results are reused because candidate code and validation conditions
did not change.

Rollback/state recovery: backups are retained at
`/var/lib/merge-proof/backups/pre-trial-0a635a7/{factory,pro}`, alongside the prior
release. Do not restore old state over new receipts/payments, or resume pre-trial
code over started trials. The accepted trial-0a635a7 release is now the compatible
rollback baseline for subsequent changes. The promotion script automatically
returns to the previous release on a failed boot only if no trial has started;
otherwise it stops processing and preserves state for a forward repair.

Evidence: `trial-production-app-preflight.json`, `trial-production-acceptance.json`,
`trial-production-final.json`, `trial-production-funnel.json`, the promotion script
and final verification script in `trial-auto-activation-001/`. Earlier BLOCKED
notes below are historical and superseded. Public marketing/campaign edits remain
in their separate lane.

## Pre-promotion record (historical)

Candidate source: `0a635a7f9035d027d97aad7b10287e7b925a0e4c`.
Branch: `codex/7day-trial-auto-activation`.
Production remains `671b6e9f2ea45f9265b47675ffdfdaa65e309a85`, verified from
`/opt/merge-proof/current/DEPLOYED_COMMIT` and release
`/opt/merge-proof/releases/ruleset-671b6e9` on September 12, 2026.

## Verified

- Exact candidate Linux acceptance, run as `mergeproof` in
  `/opt/merge-proof/acceptance/trial-0a635a7`: 176/176 GitHub, 37/37 factory,
  26/26 CLI, 9/9 report tests. Logs in `trial-auto-activation-001/`.
- Tests include atomic one-time clock, installation/empty repository without
  clock start, automatic discovery, signed event stale/re-proof, duplicate events,
  day 5/6/7 notices without new events, exact expiry and same-head pause, immutable
  receipt access, paid resume, trial gate refusal and inherited enforcing expiry.
- Existing billing tests verify fetched exact paid invoice quantity/period and
  webhook deduplication; redirect/unpaid/invalid events do not activate Pro.
  Live Stripe price was fetched read-only and verified as active USD 2900,
  monthly interval 1, licensed. No SKU changed; no charge or live checkout created.
- Real development-App acceptance: installation `160648161`, existing public
  `ohcaygo/merge-proof` PR #4, read-only token. Candidate discovered the PR and
  automatically produced receipt `b8d3d6ef-21ec-42f3-967e-2643fb8bed69`.
  CURRENT NOT_PROVEN, complete evidence collection, gaps
  NO_REQUIRED_VALIDATION_CONFIGURED / PROTECTED_BOUNDARY. The trial started at
  1789238995168 and ends at 1789843795168 (exactly seven days). This is actual
  GitHub evidence in disposable state, not a signed new-install webhook or a
  production customer conversion. No GitHub Check was published by this probe.
- Browser fixture journey: singleton account/repository selected automatically;
  receipt appeared without clicking Prove it now; enforcing trial options disabled
  and GitHub require instructions hidden; expired view explicitly paused with
  disabled proof/scan controls; retained receipt accessible with Continue link.
  Fixture identity and clock changes stayed in disposable local storage.
- Read-only aggregate export ran against the real development proof state. Output
  retained with the evidence; source is honestly unknown (no OAuth acquisition
  journey occurred in that read-only probe).

## Product behavior

TRIAL START CONDITION: first CURRENT, collection-complete VERIFIED/NOT_PROVEN
hosted receipt, one trial per immutable GitHub installation owner, no card.
INSTALL-AND-FORGET: signed install/repository-added events queue existing open PR
discovery; account reads also enroll open PRs; ordinary PR events handle the next
PR in an empty repo. Existing API/capacity/concurrency limits remain.
TRIAL EXPIRY: collection and new proofs/scans pause; historical receipt access
continues under existing authorization; verified payment resumes tracked work.
REQUIRED-GATE EXPIRY SAFETY: new trial enforcement prohibited. Existing enforcing
policies are preserved; expiry notices explicitly fail and say subscribe or remove
the GitHub required check. No rules edits or false passing checks. This does not
promise automatic unblocking of a rule an administrator independently requires.
REMINDERS: account, receipt page and GitHub Checks, with day 5/6/7 and expired
notices. No email transport was found or introduced.
FUNNEL EVENTS: versioned acquisition/journey/account/install/repo/trial/proof/
change/checkout/paid/expiry events, documented in `../TRIAL.md`.
EVENT STORAGE: existing durable single-writer snapshot `state.json.lifecycle`;
trial and first receipt saved atomically. No source-code telemetry.
LEARNING QUERY/EXPORT: `node github/funnel-export.js STATE_JSON [SINCE] [UNTIL] [SOURCE]`.
STRIPE/$29: current live recurring price verified; existing paid-invoice contract
preserved; proof caps removed; new top-up checkout retired, old fulfillment and
ledger retained. No real-money transaction.
ROLLBACK: production unchanged, so no rollback required. Trial migration rollback
limitations are documented in `../TRIAL.md`; do not run pre-trial automation over
new trial-bearing state or restore old state over new receipts/payments.

## Initial production blocker / requested owner action (resolved)

Production App `4901537` is installed on private `dupageinspect-beep/vera-mvp`
(installation `160741988`). Live read found two open PRs, #16 and #8, both targeting
`develop`. Both classic protection and applicable rules returned GITHUB_HTTP_403.
The existing production receipts are incomplete/UNAVAILABLE and cannot honestly
start this trial. Do not reinterpret that evidence as a successful first proof.
Production has one unpaid account, no enforcing policies, and no started trial.

OWNER DECISION NEEDED: install the existing **production** App on
`ohcaygo/merge-proof` with access to that repository:
https://github.com/apps/ohcaygo-merge-proof/installations/new

NEXT: Ryan completes that installation; then resume production acceptance and
promotion through the already-authorized immutable-release path. Site/campaign
claims and live customer/billing/funnel state were not changed by this task.

## Installation follow-up — 2026-09-12 19:13 UTC

Ryan reported the production App installed on `ohcaygo/merge-proof` and authorized
continued acceptance/deployment. Fresh authenticated GitHub `/app` verified App
4901537, slug `ohcaygo-merge-proof`, matching configured installation URL and OAuth
client. `/app/installations` still returned only installation 160741988 for
`dupageinspect-beep`; no `ohcaygo` installation was returned. Recent signed delivery
history likewise contained no new organization installation. The open in-app
GitHub installation page showed “Confirm access”, signed in as dupageinspect-beep,
with GitHub Mobile/authenticator/email authentication choices.

Owner action remains completion of GitHub confirmation and the selected-repository
installation. Do not treat the reported installation as provider-verified yet.
Production remains ruleset-671b6e9 and active. Candidate code still matches the
Linux-tested 0a635a7 source. Local and host candidate archives both SHA256
`3b3eaa9dc37e5f847d9ce6eaa29b67856224a49548edcc9dd0d581995172d3b3`.
Existing acceptance results remain applicable; no redundant tests, production
mutation or deployment was performed.
