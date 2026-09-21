# Candidate validation — September 10, 2026

Canonical remote: `https://github.com/ohcaygo/merge-proof.git`.
Default branch: `main`, fetched before implementation.
Fetched base: `dab4c4b896a4ff704603e4945edfce87c43fd4e5`.
Starting checkout: `ef7e0aec3a94ab4cecec9f2945dedd737dc7011c`, containing 11 existing
factory/launch commits beyond origin/main. Those commits were preserved.
Candidate branch: `codex/exact-state-github-product`.

## Actually run

| Command | Result |
|---|---|
| `npm test` (baseline and final, Node v24.12.0) | 26/26 local/CLI/Action tests; 9/9 report tests passed |
| `npm run test:factory` (baseline and final) | 34/35 passed; the same Git/PDF delivery journey failed at both points |
| `npm run test:github` (final, Node v24.12.0) | 79/79 passed |
| `npm exec --cache /tmp/merge-proof-npm-cache --yes --package=node@18.20.8 -- node --test github/test/*.test.js` | 79/79 passed on Node 18.20.8 |
| `npm exec --cache /tmp/merge-proof-npm-cache --yes --package=ajv-cli@5.0.0 --package=ajv-formats@2.1.1 -- ajv validate --spec=draft2020 -c ajv-formats -s github/receipt.schema.json -d github/examples/receipt.json` | Receipt validates |
| `ruby -e 'require "yaml"; YAML.load_file("action.yml"); YAML.load_file(".github/workflows/self-check.yml"); puts "valid YAML"'` | Both YAML files parsed |
| `git diff --check` | Passed |
| `node github/cli.js ohcaygo/merge-proof 3 --out /tmp/merge-proof-live-exact-state-3` | Live anonymous public read, NOT_PROVEN, exit 2; closed PR/current rules unavailable |
| `node github/scan.js ohcaygo/merge-proof 1 /tmp/merge-proof-live-history.json` | One historical PR selected; UNAVAILABLE / UNSUPPORTED_HISTORICAL_SHAPE, exit 0; no invented historical proof |

Temporary formatter/schema-validator/Node-18 packages used an external temporary
npm cache. No runtime/dev dependency was added to package.json or the shipped CLI.

The 79 new tests include real Action shell execution with CLI JSON/Markdown and
fail-on behavior, real-Git versus remote-metadata analyzer parity, streamed REST
fixtures, exact target binding, stale CI, permissions/rules failures, approval
rules, merge-group/live queue-entry matching, false-VERIFIED cases, HTTP delivery,
private receipt denial, public-to-private closure, HMAC rejection/idempotency,
App JWT/token scoping, optional check publication/staling, actual state-store
close/reopen and webhook arrival during an active capture.

Browser check: local fixture public form → create intentionally shared receipt →
HTML receipt → explicit refresh showed CURRENT while retaining historical
VERIFIED. Desktop screenshot inspected. Responsive CSS is implemented; physical
mobile-device rendering was not tested. The browser run used synthetic GitHub
responses, not a live installation. No production data was written.

## Existing PDF failure

The baseline and final factory failures are at `factory/test/journey.test.js:270`:
expected DELIVERED, observed RETRY. Direct diagnosis:

```sh
node bin/merge-proof-report.js --input study-data.json --repo microsoft/kiota --scope 'Baseline PDF diagnosis' --out /tmp/merge-proof-baseline-diagnosis
```

HTML was written. Chrome aborted with `SIGABRT`; command exited 1. No security
controls were disabled and the test was not skipped or changed to manufacture a
pass. The legacy PDF delivery acceptance still needs a supported Chrome runtime.
The new receipt path is HTML/JSON and does not depend on PDF generation.

## Not established

No live GitHub App registration, installation, token exchange, signed GitHub
webhook delivery, private customer repository acceptance or check publication.
No live open-PR VERIFIED result. No GitHub-hosted CI run of this candidate.
No independent review of this candidate; the existing historical factory review
is not represented as reviewing these changes.
No browser OAuth for private receipts. No historical policy reconstruction.
No production deployment, pricing/Stripe change, paid transaction, required-check
configuration change or SKYNET interaction.
