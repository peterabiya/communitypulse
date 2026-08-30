# Async Design Review Process

## How a review happens, day to day

1. **Propose:** any engineer with a new feature idea opens a GitHub issue using the [Design Review template](/.github/ISSUE_TEMPLATE/design-review.md) *before* writing code.
2. **Review:** the on-duty security champion reviews the issue asynchronously — no meeting required. Findings are posted as comments directly on the issue.
3. **Turnaround:** the champion responds within **2 business days** of the issue being opened.
4. **Resolve:** the proposer addresses any findings (or the champion approves as-is), and the champion marks a decision in the template's "For the reviewing champion" section.
5. **Log:** the champion adds one line to the [review log](./review-log.md) — what was reviewed, when, and what (if anything) it caught.

## What happens if nobody responds in time

If the 2-business-day SLA lapses with no champion response:

- The proposal **auto-escalates** to **the other of the two team members (Peter Abiya / Chancelle AHINON) not currently reviewing**.
- The proposer may proceed **only if they explicitly flag it** in the review log as *"shipped without review sign-off — SLA lapsed on [date]."* This keeps the process honest under real deadline pressure (a review process that silently gets skipped isn't actually catching anything) without letting an unresponsive reviewer block all shipping indefinitely.

## Escalation path

**A champion decides alone** on anything that doesn't meet the conditions below — most proposals fall here.

**A proposal escalates automatically to whichever of Peter Abiya / Chancelle AHINON is not the reviewing champion when it meets any one of these conditions:**

1. **It touches authentication or session handling** (anything interacting with Clerk, `middleware.ts`, or `lib/auth.ts`'s session logic beyond calling `requireUser()`/`assertOwner()` as already used elsewhere)
2. **It creates a new way for one user's data to become visible to another user** (any change to what a query returns, who can see it, or how ownership is scoped)
3. **It introduces a new unauthenticated endpoint** (anything reachable without a session, joining the existing public surface like `/api/v1/*`)

These three map directly to what actually matters in this codebase: CommunityPulse's data model is intentionally mostly public, so the review isn't asking "is this secret" — it's asking "can only the real owner change it, and does this open new unauthenticated surface." A champion doesn't need deep security expertise to apply this list; they need to recognize these three specific shapes and know to hand off rather than guess.

**Why a named condition, not "if it seems serious":** a vague severity scale is exactly what a champion program stops enforcing under sprint pressure — a concrete yes/no check on three questions survives contact with a deadline in a way "use your judgment" does not.
