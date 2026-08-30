# Pilot Retrospective — Security Champions & Design Review

*Skeleton drafted while awaiting Chancelle's review of the private-messaging proposal. Sections marked `[PENDING]` need her findings before they can be written honestly — don't fill those in before then.*

## What we set out to test

Whether a lightweight, template-driven design review could catch a real design problem in a real proposed feature (private messaging) before any code was written, within a time budget small enough that a real team wouldn't route around it.

## What worked

**The template is genuinely fast.** Timed at real-world use: **~7 minutes** to complete, well under the 15-minute target. This wasn't a synthetic test — it was filled out for the actual private-messaging proposal, not a practice run.

**The escalation rule triggered on real content, not hypothetically.** The proposal answered "yes" to touching authentication/session handling, which — per our own bright-line rule in `review-process-and-escalation.md` — means this review can't just be solo-approved; it requires both of us to look at it together. `[PENDING: whether this actually happened smoothly in practice, or whether it needed reminding/enforcing]`

## What did not work as designed (at least one honest finding, per the evaluation criteria)

**The issue template's file location was wrong on the first attempt.** `design-review.md` was initially committed to `docs/security/`, not `.github/ISSUE_TEMPLATE/` — GitHub's issue picker only recognizes templates in that exact folder, so when it came time to actually open the real pilot issue, no template appeared. This was a real, concrete failure discovered only by trying to run the process for real, not by reviewing the docs on paper — exactly the kind of gap a "run it against a real repository" requirement is supposed to surface, and exactly the kind of thing that wouldn't have been caught if we'd stopped at just writing the documents.

**The first draft of the proposal smoothed over an unresolved design question instead of flagging it.** Question 6 (how per-user conversation hiding gets scoped) was initially answered as if the design were settled, when it actually wasn't fully thought through. This raises a real question about the template itself: **does the template do enough to force a proposer to surface open questions, or does it passively accept a confident-sounding but incomplete answer?** Right now, catching this required an external nudge rather than the template naturally eliciting it. `[Possible improvement to note: consider adding an explicit "Open questions / things you're unsure about" field to the template, rather than relying on the reviewer to notice a glossed-over answer.]`

## Did the turnaround time hold? `[PENDING]`

- SLA target: 2 business days
- Actual turnaround: `[fill in once Chancelle responds]`
- Context worth being honest about regardless of outcome: Chancelle was reviewing this while also actively working Project 6, not as her sole task. If the SLA held anyway, that's a genuinely stronger result than an idealized single-project test would show. If it didn't hold, that's realistic and worth stating plainly rather than treating as a process failure — a two-person team splitting across two active projects is the actual constraint this program has to work under, not a hypothetical dedicated team.

## Did the review actually catch something, and did it change the plan? `[PENDING]`

- What Chancelle found: `[fill in]`
- Whether it changed the proposal: `[fill in — this is the evaluation criterion that matters most: "at least one entry where the review changed the plan for the feature"]`
- Whether the escalation-together discussion surfaced anything neither of us would have caught reviewing alone: `[fill in]`

## Would we actually keep doing this?

`[PENDING — but the honest inputs to this answer so far: the template itself is fast and low-friction (good sign); the process required two real fixes to actually function correctly (template location, proposal honesty) which is normal for a first real run, not a reason to abandon it; the real test is whether the SLA held under genuine competing workload, not idealized conditions]`

## One thing to fix before this program's next real review, regardless of what Chancelle finds

Move template-location and setup verification into the onboarding checklist explicitly — a new champion (or a proposer, for that matter) shouldn't discover a broken template path only when trying to open a real issue. This is a concrete, low-cost fix worth making now rather than deferring to the scaling plan.
