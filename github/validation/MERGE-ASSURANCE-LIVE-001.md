# Merge assurance live acceptance — owner-confirmation checkpoint

Candidate: 3551c9c00a631816ec2d76c5cdba380f773a1619. No candidate code changes.

## Linux: PASS

Uploaded only the authorized source archive to 161.35.59.206, extracted under
/opt/merge-proof/acceptance/3551c9c. Archive SHA-256 on both ends:
1c54dfd760b7041f40a05246aa3f4173b985dbf852406213bce3ce7044400471.

Ran a transient systemd unit as mergeproof with ProtectSystem=full,
ProtectHome=true, PrivateTmp=true and CHROME_PATH=/usr/bin/chromium:
`node --version && npm test && npm run test:github && npm run test:factory`.
Node v20.19.2; CLI 26/26; reports 9/9; GitHub 143/143; factory 37/37.
Exit 0, 46.429 seconds, peak 268M. Full output: merge-assurance-live-001/linux-tests.log.
Production remains active at /opt/merge-proof/releases/brand-615308b.

## GitHub surface prepared

Repository: ohcaygo/merge-proof (public). Default branch main untouched.
Temporary base: codex/merge-assurance-acceptance-base, fcd71a87abd8db0b49541579db882db002c0a278.
Temporary head: codex/merge-assurance-acceptance-pr, 515fff8628c9c01e524d6f5332c73be583d3ea5a.
PR: https://github.com/ohcaygo/merge-proof/pull/6 (open, non-draft, unmerged).

A dedicated real GitHub workflow tests acceptance/state.txt equals ready and
subscribes to both pull_request on the temporary base and merge_group.
The PR intentionally starts with pending. Its required-evidence candidate job
103485879394 in run 34668735721 actually failed. Existing CI ran independently.

Using the existing development App 4899448, installation 160648161 on ohcaygo,
not the production App. The exact archived candidate runs locally with a new
isolated ledger and the existing signed public Smee relay. A bounded acceptance
runner ignores PR events outside the temporary acceptance head. It uses actual
API-confirmed installation/account identity, not a fabricated install webhook.
The enforcing policy was selected under Ryan's explicit admin authorization.
No real billing provider or production state is attached.

Signed pull_request opened delivery a4bea740-ae54-11f1-800c-b42292029ec8 reached
candidate ProofService.webhook. Subsequent real check/workflow events queued
re-proofs. Check 103486001857 published failure on exact PR head. Receipt
87216960-56a7-41c0-b27f-34703368c13f is CURRENT-at-observation / NOT_PROVEN,
with NO_REQUIRED_VALIDATION_CONFIGURED before the new rule is saved.
This is NOT proof of required-gate blocking. Actual rules endpoint was empty;
GitHub reported unstable, not blocked. See pre-rule-observation.json.

## Owner confirmation prevents saving the prepared rule

Prepared new Active ruleset "Merge assurance temporary acceptance", with:
- exact target codex/merge-assurance-acceptance-base only;
- empty bypass list;
- required assurance acceptance validation, bound to GitHub Actions;
- required Merge Proof exact-state receipt, bound to OHCAYGO Merge Proof Dev;
- default block-force-push/restrict-deletion protections retained.

Clicking Create opened GitHub Confirm access. The rule has NOT been saved.
The open browser tab preserves the form. Ryan must complete his normal GitHub
Mobile/authenticator confirmation. No credential, bypass, or alternate identity
was used. Connector PR creation was unavailable (403); normal owner UI created
PR #6 instead. No existing rule was modified.

## Merge group: NOT_PROVEN

The development App event list also lacks merge_group. Current GitHub docs say
Merge queues repository permission at read level is required for that event:
https://docs.github.com/en/webhooks/webhook-events-and-payloads#merge_group
Exact settings page:
https://github.com/settings/apps/ohcaygo-merge-proof-dev/permissions
Required controls after owner authentication: Merge queues = Read-only;
Subscribe to events = Merge group. No write-level queue permission is needed.
No permission or event changes have been made. The settings page itself requests
Confirm access, so its available controls have not yet been visually verified.

## Resume

1. Complete the open Confirm access prompt and verify the ruleset save succeeds.
2. Observe real required failure/blocking. Correct only acceptance/state.txt to
ready; observe new-head stale/re-proof, real execution and satisfying required check.
3. At the exact App owner action, enable only the necessary read permission and
Merge group subscription, obtain installation approval if GitHub requires it.
4. Add queue requirement only to this temporary target, then observe a real group
and its commit/check identities. Do not merge unless necessary for this harmless
acceptance. Preserve receipts/debits and check idempotence.
5. No public deployment; return readiness only when both live tests pass.

Local temporary runner: /private/tmp/merge-assurance-live-runner.js.
Exact local source: /private/tmp/merge-assurance-runtime-3551c9c.
Isolated state: /private/tmp/merge-assurance-live-state-3551c9c.
Observer: /private/tmp/merge-assurance-observe.js.
Receiver session 76850; Smee session 84319 (may need status verification on resume).
Git worktree for temporary branches: /private/tmp/merge-assurance-live-acceptance.
Production ledgers, pricing, Pro funnel, rollback and advisory defaults untouched.

## September 12 continuation — required gate observed

This section supersedes the owner-authentication checkpoint above. Ryan completed
GitHub confirmation. Ruleset 23000277 is Active, matches only the temporary base,
has no bypass actors, and binds both required checks to their actual publishers.

REQUIRED GATE LIVE: PASS for the supported combined classic/ruleset configuration.
At 2026-09-12T03:01:20.169Z, GitHub returned mergeable_state=blocked for old head
515fff8628c9c01e524d6f5332c73be583d3ea5a. Required Merge Proof check 103487149968
was failure, and the actual acceptance validation also failed. Receipt fe7cba62-
5957-4fc2-b407-ca512d7d2020 remained NOT_PROVEN. No false VERIFIED was emitted.

Concrete limitation found: when the branch has only a ruleset, GitHub returns 404
for classic protection, even with the authorized App. Candidate 3551c9c records
RULES_UNAVAILABLE for that ambiguity. This is fail-closed but prevents satisfied
proof for ruleset-only installations. No code or acceptance criterion was weakened.
For continued testing, added a classic protection rule with the exact same two
checks and no admin bypass, only on the temporary base. The ruleset stayed intact;
GitHub itself labels the new classic rule as fully covered by the ruleset. This
proves the supported configuration, not ruleset-only readiness. The limitation
must remain part of the production decision.

Changed only acceptance/state.txt from pending to ready in temporary PR commit
40c96df39ec4ce22df6e8ac2ee7a85c84d7e3633. Actual workflow run 34669282147,
job 103487422721 succeeded. Signed events automatically staled old-head receipts
and re-proved the new head. Receipt 6f9c03e8-4486-409a-8e35-8a523ca9ee0c is
VERIFIED with no gaps and CURRENT at observation; Merge Proof check 103487580759
concluded success on that exact head. At 2026-09-12T03:04:38.279Z GitHub reported
mergeable_state=clean and both required contexts success. PR #6 remains unmerged.

The isolated meter holds exactly two proof keys, one for each head, and freeUsed=2.
Repeated current-head receipts have ALREADY_ACCOUNTED, zero further debit. Original
old-head verdicts remain NOT_PROVEN and currentness is STALE. Pre-queue receipt
hashes are preserved for later immutability comparison. See required-blocking.json,
required-satisfied.json and pre-queue-integrity.json.

## Exact remaining owner action

App page: https://github.com/settings/apps/ohcaygo-merge-proof-dev/permissions
Confirmed visually: Merge queues currently had No access, and Merge group was
unavailable until selecting Read-only. Prepared the unsaved form with ONLY
Merge queues = Read-only and Merge group event checked, plus an explanatory note.
No App update has been submitted. Owner must click Save changes and, if prompted,
approve that permission update for the existing ohcaygo installation (160648161).
This is required to receive a real signed merge_group event. No queue-write access
or production App change is requested.

After that update, verify the App API and installation grant, enable queue only
for the temporary acceptance target, enqueue the harmless PR and observe exact
queue/head checks, stale/current behavior, partial publication/retry and debit
idempotence. MERGE_GROUP LIVE remains NOT_PROVEN; no public deployment is ready.
