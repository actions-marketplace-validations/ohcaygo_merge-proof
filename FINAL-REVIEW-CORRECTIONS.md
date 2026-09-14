# Authoritative final review corrections

Source: Ryan's final review instructions, September 7, 2026.

Apply these corrections to the existing build packet before implementation.
They supersede conflicting packet language only on these four points; they
do not authorize a redesign or expand scope. The referenced packet was not
present in this workspace when this addendum was recorded.

1. **Location is locked.** Build as an extension of the existing Merge-Proof
   product/repository. Do not create a third unrelated product home. If factory
   code needs an isolated sibling development workspace, it must remain clearly
   part of the Merge-Proof product family.

2. **Deferred gaps remain visible.** The customer-facing offer must explicitly
   disclose that `CANDIDATE_DURABLE_ON_REMOTE` and
   `SCOPE_CREEP_VS_DECLARED_SCOPE` remain outside the implemented proof. Do not
   imply this build closes either gap.

   Required offer disclosure:

   > This offer does not prove that the candidate is durable on the remote
   > (`CANDIDATE_DURABLE_ON_REMOTE`) or that changes stay within declared scope
   > (`SCOPE_CREEP_VS_DECLARED_SCOPE`). Both checks remain outside the
   > implemented proof.

3. **Price comes from configuration and Stripe.** Do not hardcode $5,000 or
   any other commercial price into product logic. Price/amount comes from the
   Stripe Payment Link, configuration, or environment. The Stripe-confirmed
   transaction amount is authoritative for a purchase.

4. **Refunds escalate to Ryan.** `REFUND_REQUIRED` must escalate to Ryan.
   Do not automatically issue refunds in this version.

This addendum records requirements only; it is not evidence of implementation,
testing, deployment, or closure of the deferred checks.
