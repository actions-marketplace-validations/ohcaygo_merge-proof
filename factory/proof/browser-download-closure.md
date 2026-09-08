# Final browser delivery closure

Verified 2026-09-08 UTC (September 7, America/Chicago).
Factory implementation: `5efae84a255bb0984ea23be5a90167367ae3bc5a`.
Checkout during verification: `c05482223ee51f61acb78ca79bbe490bbc63db43`.
No implementation changes, new purchase, deployment or additional broad review.

## Finding and browser proof

The browser-tool-controlled Chrome context reproduced `ERR_BLOCKED_BY_CLIENT`.
Chrome's native download popover identified the failed entry as **Blocked by your
organization**. The normal Chrome page, using its existing authorized session,
successfully downloaded the same original report twice. No extensions, policies,
browser security settings, factory headers or authorization controls were changed.
This establishes a client/context download restriction, not a factory delivery
defect. The specific policy or extension responsible was not identified.

Native Chrome showed `report (1).pdf` and `report (2).pdf`, each **156 KB • Done**.
Both files were independently read from Ryan's Downloads directory and verified:

- Exact bytes: **159,499**, non-empty, `%PDF-` header and terminal `%%EOF`.
- SHA-256: `0f535467ad786cf1dc1308d8de6c59e164b27ca724c9256e994437702a64b3e3`.
- Exact match to the original paid run's report and manifest.
- Original run: `bee34dfe7ebf63372a9711197fb382744b5ee6c7054d7d8a006664087b6c8211`.
- Reassessment run: `7aefc9ad4ab0e24d6414a98a6f1f4d2b9e6a1717cd459ca8591cf7a52be3b80d`.
- Reassessment PDF: 160,629 bytes; SHA-256
  `1557287b556675547f96a33d26a8d2e88294486875ed3645c8f86dd2de50ff80`.

Both manifests bind to the receipt's paid order and correct run IDs. Every
registered artifact's manifest hash was checked against its bytes. Persisted
payment exactly matches the private Stripe receipt; the receipt records test
mode, succeeded payment, webhook HTTP 200 and DELIVERED state. Original and
reassessment artifacts remain preserved. No fresh Stripe transaction was needed.

## Actual authorized response

Native Chrome Network panel captured the successful request at
`Tue, 08 Sep 2026 01:34:38 GMT`:

```text
GET http://127.0.0.1:4327/download/bee34dfe7ebf63372a9711197fb382744b5ee6c7054d7d8a006664087b6c8211/report.pdf
HTTP 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="report.pdf"
Cache-Control: no-store
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Transfer-Encoding: chunked
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self' https://buy.stripe.com
```

The browser's attachment request row reports headers separately from downloaded
body bytes; the completed files, not that row's resource-size display, establish
the complete PDF body. No cookie or access token is included in this evidence.

## Affected verification

- Live original PDF endpoint without a cookie: **401**, PASS.
- Live original PDF endpoint with an incorrect token: **401**, PASS.
- Same server and Factory authorization code in a disposable in-memory HTTP
  fixture with a correctly hashed but expired token: PDF endpoint **401**, PASS.
  The real paid order was not expired or modified for this test.
- `node --test --test-name-pattern='expired access is denied' factory/test/journey.test.js`:
  **1 passed, 0 failed**. Tests expiry, purge and unknown-paid-reference escalation.
- Initial sandbox attempts were blocked by loopback `EPERM`; after approved
  local-socket execution, the checks above passed. No product failure was found.
- Both downloaded PDF hashes and full-file markers: PASS.
- Private Stripe test receipt SHA-256 unchanged:
  `94d1f5a4e9de8183cb2ee134c8478c3ba310c8d202f99d6289302d6f459d2449`.
- Private test configuration SHA-256 unchanged:
  `14e02ae4dc7a3ccd70fe8b27911c872308cec97a748f59f29d442460c4e31350`.

The private receipt remains untouched, including its historical browser-blocked
status. This record supplies the subsequent successful closure evidence.

## Disposition

REPORT_DELIVERY: PASS. BROWSER_DOWNLOAD: PASS. AUTHORIZED_ENDPOINT: PASS.
PDF_BYTES: PASS. PDF_RUN_IDENTITY: PASS. UNAUTHORIZED_ACCESS_REJECTED: PASS.
FACTORY_DEFECT: NO. CODE_CHANGE_REQUIRED: NO.
STRIPE_TEST_RECEIPT_PRESERVED: YES. REAL_MONEY_USED: NO.
PRODUCTION_CHANGED: NO. SECRETS_EXPOSED: NO. AUTOMATIC_REFUNDS: NO.
FACTORY_FINISH_LINE: ACHIEVED. BLOCKER: NONE.

`CANDIDATE_DURABLE_ON_REMOTE` and `SCOPE_CREEP_VS_DECLARED_SCOPE` remain
outside the implemented proof. Price remains Stripe-configured and the confirmed
transaction amount authoritative. REFUND_REQUIRED remains an escalation to Ryan.
This closes the authorized factory acceptance; no V2 work is implied.
