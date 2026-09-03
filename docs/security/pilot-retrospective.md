# Pilot Retrospective — Security Champions & Design Review

Real outcome from the private-messaging design review — no more pending sections.

## What we set out to test

Whether a lightweight, template-driven design review could catch a real design problem in a real proposed feature (private messaging) before any code was written, within a time budget small enough that a real team wouldn't route around it.

## What worked

**The template is genuinely fast.** Timed at real-world use: ~7 minutes to complete the proposal, well under the 15-minute target — and this was for the actual pilot feature, not a practice run.

**The SLA held under realistic conditions, not idealized ones.** Issue opened Sunday, August 30; review posted Tuesday, September 1 — roughly 1 business day once the weekend is excluded, comfortably within the 2-business-day target. This matters more than it might look: Chancelle reviewed this while also actively working Project 6, not as a dedicated task. A real team with competing priorities still hit the SLA.

**The escalation rule triggered on real content and produced a real decision, not a formality.** Question 3 was answered "yes," which per our own bright-line rule required escalation rather than a solo approval — and that's exactly what happened.

**The review caught something that materially changed the design, before any code existed.** Chancelle found that `assertOwner()` — our own pattern reference's flagship authorization chokepoint — doesn't fit a two-participant resource like a conversation, and identified a concrete IDOR risk that would have resulted if conversation access had relied on it. The design was changed from ownership-based to participant-membership-based authorization as a direct result. This is the single clearest piece of evidence that the process works: a real vulnerability class, caught at the design stage, by a lightweight process that took minutes to run — not hours, and not after code was written.

**Two open items got resolved with real technical substance, not hand-waving.** The per-user hide/leave question (left deliberately open in the proposal) was resolved into a concrete design (per-participant state), and Chancelle independently arrived at essentially the same structure reasoned through in an earlier draft — two people converging on the same answer separately is a good signal the design itself is sound, not just convenient.

## What did not work as designed (honest findings, not just successes)

**The issue template's file location was wrong on the first attempt.** `design-review.md` was initially committed to `docs/security/` instead of `.github/ISSUE_TEMPLATE/`, so GitHub's issue picker didn't recognize it when it came time to open the real pilot issue. Fixed before the pilot ran, but it's a real gap that only surfaced by actually trying to run the process for real — exactly the kind of thing that wouldn't have been caught by reviewing the documents alone.

**The first draft of the proposal smoothed over an unresolved design question instead of flagging it.** The per-user hide/leave question was initially answered as if settled, when it wasn't. This exposed a real weakness in the template itself — it didn't naturally elicit that gap; catching it required an external nudge. We've since added an explicit "Open questions / things you're unsure about" field to the template as a direct result, but the pilot review itself ran without that fix in place.

**The "second reviewer" for escalation was also the original proposer.** With a two-person team, escalating to "the other champion" meant escalating back to Peter — who wrote the proposal being escalated. This isn't a fully independent second opinion, and it's worth naming honestly rather than treating the escalation step as equivalent to what it would be with a third, uninvolved person. This is a real, structural limitation of running this program at two people, not a flaw in how this particular review was handled — and it's exactly the limitation the scaling plan already names as something that changes once a third champion exists.

## Would we actually keep doing this?

**Yes.** The evidence for that: the template's speed (7 minutes) means it genuinely doesn't create friction a team would route around under deadline pressure; the SLA held despite a reviewer splitting attention across two active projects, which is the realistic condition this program actually has to work under, not a best-case scenario; and most importantly, the one real review produced a genuine, non-obvious finding that changed the design before implementation — not a rubber-stamped approval. The two process gaps found (template location, the glossed-over-answer problem) were both cheap to fix and have already been addressed for future reviews. The one limitation that can't be fixed with a documentation change — the second-reviewer-is-the-proposer problem — is honestly scoped as a two-person-team constraint, not glossed over, and the scaling plan already addresses what changes once that's no longer true.

## What we'd change before the next real review

1. Confirm the template-location fix and the new open-questions field actually work as intended on the *next* real proposal — this pilot ran before both fixes landed.
2. If a genuinely independent second opinion is ever available (even informally, from someone outside the two-person team) for an escalated review, use it — this pilot's escalation was real in process but structurally limited in independence.
