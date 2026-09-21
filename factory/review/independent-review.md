# Single independent review — Merge-Proof skinny factory

Reviewer: independent Codex subagent `/root/independent_factory_review` (non-Claude).
Review completed September 7, 2026 (America/Chicago). This file preserves the
reviewer's findings; the builder's repairs are separately recorded below.

Candidate reviewed: `65151f2012ec36d698df526e85ff0249f7b88370`.
Authoritative base, fetched independently: `dab4c4b896a4ff704603e4945edfce87c43fd4e5`
(`origin/main`; no drift). No source changes, commits, deployment, purchases or
external writes by the reviewer. Candidate working tree was clean during review.

## Reviewer verdict

**BLOCKED** on the required real Stripe TEST transaction and complete real-payment
acceptance journey. **NEEDS_FIXES** for the two independently reproduced P2
lifecycle defects below. No broader review loop requested.

The reviewer inspected verdict integrity, wrong-SHA handling, approval binding,
payment/run/customer binding, repo/run/report identity, process isolation, privacy,
async customer journey and scope creep against the attached specification and
FINAL-REVIEW-CORRECTIONS.md.

## Independently executed evidence

- `npm run test:factory`: 27/27 passed, including local HTTP, real disposable Git,
  real Chrome PDFs, reassessment and cleanup. The first attempt hit sandbox
  loopback EPERM; the authorized loopback rerun passed.
- `npm test`: 26/26 analyzer and 9/9 report tests passed.
- Exact candidate-range `git diff --check`: passed.
- All four public capture hashes and evidence decisions recomputed and matched.
- Wrong-SHA replay source hash, withholding and NOT_PROVEN result verified.
- Both lifecycle issues reproduced using disposable order state.
- Original live public collection was builder-executed, not independently rerun;
  the reviewer inspected and checked the preserved artifacts.
- Real Stripe TEST transaction and external browser checkout journey: NOT PROVEN.
  Synthetic Stripe test responses are not a real test purchase.

## Findings on the reviewed candidate

### P2 — Failed paid purchase expires without required refund escalation

Reviewed candidate location: `factory/service.js:380-385`.

`purge()` clears access and run records and sets EXPIRED for every paid order.
A paid RETRY / REPORT_FAILED order with no successful report therefore loses
retry/escalation access while the inbox still only records RETRY.

Reviewer reproduction: state EXPIRED, failure REPORT_FAILED, access false,
exception states [RETRY]. Required repair: idempotently persist Ryan-owned
REFUND_REQUIRED and enough reconciliation history before removing access.
Distinguish delivered packs from undelivered failures. No automatic refund.

### P2 — Expired reconciliation records permanently exhaust capacity

Reviewed candidate locations: `factory/service.js:92-96` and `:380-385`.

Eligibility counts all order records against 1,000, while purge retains paid
records forever for reconciliation. After 1,000 paid purchases, new eligibility
returns BUSY_RETRY indefinitely even with no active order or execution.

Reviewer reproduced this with 1,000 EXPIRED paid records. Required repair:
apply the limit to active/unexpired orders and retain reconciliation records
without permanently consuming operational capacity.

## Remaining review observations

The reviewer established no additional defect in reviewed evidence/payment/download
boundaries. CI requires exact SHA plus name/App identity; candidate reviews cannot
be satisfied by stale approvals. Local FAIL and blocking findings are preserved.
Signed webhook plus Stripe session retrieval establishes purchase data; downloads
require the order capability and registered run artifact. Public-only bare-repo
workers do not execute customer code. Process/directory isolation is not a VM,
which the documentation discloses. Both deferred gaps remain visible. No automatic
refunds, models, subscriptions, multi-repo dashboard, PATs, GitHub App or unrelated
product home was introduced. The original public product implementation remains
unchanged and the candidate is not integrated.

## Builder follow-up — not a second independent review

Both concrete defects were repaired. Expired undelivered purchases and unresolved
failed reassessments now get an idempotent Ryan-owned REFUND_REQUIRED exception;
delivery counts, failure and payment metadata remain. Successful delivered packs
expire without inventing a refund on subsequent sweeps. Only active/unexpired
orders count against eligibility capacity.

Five focused tests in `factory/test/retention.test.js` exercise these repairs and
the factory's corrected “Landed state” report label/actual merge SHA. The affected
local journey and real PDF generation were rerun after the fixes. See
`factory/ACCEPTANCE.md` for final executed results and the remaining Stripe blocker.
No second review or review loop was performed.
