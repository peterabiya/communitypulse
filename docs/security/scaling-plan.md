# Scaling Plan — Security Champions Program

How this program grows past its current state: two people, one of whom reviews, escalation meaning "the other person looks too."

## Where this starts (be honest about it)

Right now, "the program" is two people. Escalation currently just means the other of the two of you looks at it together — there's no third, more experienced person to actually hand a hard case to. That's a real, named limitation, not something to gloss over (see `champion-role-and-onboarding.md`, which already states this plainly). Everything below is what changes as that stops being true.

## How new champions get selected

- **Not everyone should be a champion.** The role needs someone who already writes code in the repo regularly (so they recognize when a proposal deviates from existing patterns) and who can commit the stated 2–3 hrs/week reliably — not the most senior engineer by default, and not a rotating volunteer with no actual bandwidth.
- **Selection signal:** someone who's already been the *proposer* in a design review and asked good clarifying questions about their own design is a strong candidate — they've already demonstrated the kind of thinking the role needs.

## How new champions get onboarded

- Same onboarding checklist already in place (`champion-role-and-onboarding.md`) — read the auth/validation chokepoints, read the pattern reference, know the escalation rule.
- **New at this stage:** a new champion **shadows 2–3 real reviews** (reading along, not posting findings) before running one solo. This wasn't necessary to specify at 2 people because there was no one to shadow — it becomes necessary the moment there's a 3rd.

## What keeps two different champions applying the standard the same way (the consistency problem)

This is the part a program at this size hasn't had to solve yet, and it's the part most likely to quietly drift once it's needed:

1. **The escalation triggers stay bright-line, not judgment calls.** The three conditions in `review-process-and-escalation.md` (auth/session handling, cross-user data exposure, new unauthenticated endpoint) are yes/no checks specifically so two different people apply them the same way. If a future revision of this program ever softens these into "use your judgment," consistency breaks immediately — this is the single most important thing to protect as the team grows.
2. **Periodic calibration reviews.** Once there are 2+ active champions, they periodically (suggested: monthly) look back at 2–3 of each other's past review-log entries together and ask: would I have found the same thing? Would I have escalated this? Disagreements get discussed and, if they reveal a gap in the pattern reference or escalation rule, that gap gets written into those docs — the standard gets updated, not just the individual's judgment.
3. **The pattern reference is the shared source of truth, and it has an owner.** As the codebase grows past what's in `pattern-reference.md` today, someone needs to be responsible for updating it when a new pattern gets established (the same way `assertOwner()` and the Zod schemas became "the pattern" here) — otherwise each champion ends up working from a stale or personally-remembered version instead of the same shared document.

## What changes once a single person can no longer see every proposal

At two people, either of you can plausibly be aware of everything happening in the repo. That stops being true past a certain team size — the actual triggers to watch for:

- **More than ~5–6 proposals a week** — one champion's 2–3 hr/week budget genuinely can't keep up, and turnaround will silently slip past the SLA rather than someone explicitly deciding to change the process. This is the signal to add a second active champion, not a fixed headcount number.
- **More than one active feature area at once** (e.g., once Project 8's chaos-engineering work and ongoing feature work are both generating proposals) — champions should specialize by area rather than one person trying to hold full context on everything, so review quality doesn't quietly drop as scope widens.
- **When this happens:** proposals get routed to whichever champion owns that area, the review log gains a `reviewed_by` field split by area (it's currently implicit with two people), and the calibration-review habit above becomes the mechanism that keeps the two (or more) champions from silently diverging on standards once they're no longer reviewing the same small set of things.

## The honest limit of this plan

This is written from a two-person team's actual experience, not from having run a larger program. The calibration-review cadence and the "5–6 proposals a week" threshold are reasoned estimates, not measured data — worth treating as a starting hypothesis to revise once there's real data from a team that's actually grown past two people.
