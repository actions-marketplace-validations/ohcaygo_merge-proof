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
