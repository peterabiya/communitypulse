# Security Champion — Role Definition & Onboarding

## What a champion does

- Reviews design proposals for **new CommunityPulse features** before code is written, using the [design review template](/.github/ISSUE_TEMPLATE/design-review.md).
- Reviews every proposal against the [pattern reference](./pattern-reference.md) — checking whether it reuses CommunityPulse's existing chokepoints (`requireUser()`, `assertOwner()`, Zod schemas) rather than inventing new, unreviewed logic.
- Applies the [escalation path](./review-process-and-escalation.md) — decides what they can sign off on alone versus what must go further.
- Logs every review in the [review log](./review-log.md), including proposals that got flagged or changed as a result.

## What a champion is not responsible for

- **Not** a full-time security engineer. This is a part-time, embedded role layered on top of normal engineering work.
- **Not** responsible for running or maintaining CI security tooling (SAST, secret scanning, dependency audits) — that's the CI pipeline's job (`.github/workflows/security.yml`), not a manual review task.
- **Not** responsible for fixing findings themselves — the champion identifies and documents the risk; the proposing engineer owns the fix.
- **Not** a blanket approver of every PR. The scope is specifically **new features, new API surface, or new data exposure** at the design stage — not routine bug fixes or refactors with no new surface area.

## Time commitment

**2–3 hours per week.** Reviews are turned around within **2 business days** of a proposal being opened (see the process doc for what happens if that SLA is missed). This is a realistic, sustainable load precisely because the review only requires answering the design-review template's short set of questions, not a deep code audit — thoroughness comes from checking against the pattern reference, not from spending hours per proposal.

## Onboarding checklist — before a new champion's first review

- [ ] Read `lib/auth.ts` and `lib/validation.ts` directly — these are the two files that define what "secure" means in this codebase (ownership checks, input validation)
- [ ] Read `middleware.ts` and understand what it does and does **not** protect (it only gates non-GET requests on a specific route list — the real enforcement is in each route handler)
- [ ] Read the [pattern reference](./pattern-reference.md) — the shared vocabulary for what to check on every review
- [ ] Read the [escalation path](./review-process-and-escalation.md) and know the exact conditions that require escalating rather than deciding alone
- [ ] Know who to escalate to: **whichever of Peter Abiya / Chancelle AHINON is not the one reviewing that proposal.** With a two-person team, there's no third, more senior resource yet — escalation currently means "the other champion looks at it together," not "hand it to someone with deeper expertise." This is a real, honest limit of the program at this size (see the scaling plan for what changes once there's a third person).
- [ ] Read the last 2–3 entries in the [review log](./review-log.md) to see what real findings have looked like so far
- [ ] Optional but recommended: shadow one review (read along, don't post findings) before running a review solo
