# Add exact-state GitHub evidence and immutable receipts

Merge Proof binds GitHub CI execution, approval observations, branch/ruleset
requirements, remote candidate refs and merge-group evidence to the exact
candidate/base state. Immutable receipts retain their historical verdict while
currentness changes separately to CURRENT, STALE or UNAVAILABLE. HTML/JSON
retrieval enforces current repository authorization. Public publication is
intentional; a bounded historical scan uses the same evidence semantics.

The free offline CLI and existing GitHub Action are preserved, with no LLM
or network dependency added locally. No new pricing/Stripe change, repository
policy mutation, production deployment or main merge occurred in the exact-state
work. The full branch preserves 11 earlier factory/launch commits that were
already present in the starting checkout; that inherited factory includes Stripe
code and is explicitly included in the complete-candidate review.

**PARTIAL — LIVE GITHUB APP ACCEPTANCE NOT YET PERFORMED.**

**KNOWN EXISTING FACTORY PDF/CHROME TEST FAILURE REMAINS OUTSIDE THIS CANDIDATE’S CORE EXACT-STATE ACCEPTANCE.**

One independent full review found three issues: omitted classic requirements,
optional check delivery blocking re-proof, and missing Pages proof routes. All
three are repaired with regression coverage. See
`github/validation/INDEPENDENT-REVIEW.md` and `github/validation/REMOTE-CLOSURE.md`
for exact test and review scope; the review was of the original immutable commit,
followed by builder fixes and affected rechecks, not a second broad review.

The development owner packet and two-state acceptance observer are in
`github/dev/OWNER-SETUP.md`. Registration/install/credentials and real signed
GitHub event → evidence → receipt → head change → stale/re-proof remain pending.
This draft is not approval to merge or deploy. GitHub-hosted CI must be observed
on the actual PR; local tests do not substitute for a hosted run.
