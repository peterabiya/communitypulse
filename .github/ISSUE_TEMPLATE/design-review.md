---
name: Design Review
about: Request a lightweight security design review before writing code for a new feature or API surface
title: "[Design Review] "
labels: design-review
assignees: ''
---

<!--
Fill this out BEFORE writing code. Aim to complete it in under 15 minutes —
if you're spending longer, the feature idea probably needs to be broken
into smaller pieces first, not the template made longer.
-->

**1. What are you proposing?**
(1–2 sentences — what does this feature let a user do that they can't do today?)

**2. What new data does this expose, and to whom?**
(Public to anyone / authenticated users only / owner only / something else — be specific)

**3. Does this touch authentication or session handling?**
- [ ] Yes
- [ ] No

**4. Does this create a new unauthenticated endpoint or route?**
- [ ] Yes
- [ ] No

**5. How is user input validated?**
(Name the Zod schema you'll add to `lib/validation.ts`, or explain why none is needed)

**6. Who can modify or delete this data, and how is that enforced?**
(Should route through `requireUser()` / `assertOwner()` in `lib/auth.ts` — if it doesn't, explain why)

**7. Any new external service, dependency, or secret involved?**


**8. Open questions / things you're not sure about yet.**
(If any part of this design isn't fully worked out, say so here instead of glossing over it in the answers above. An honest "I haven't figured this out" is more useful to the reviewer than a confident-sounding answer that hides an unresolved gap. Leave blank only if there genuinely are none.)

---

### For the reviewing champion — do not fill in above this line

**Decision:**
- [ ] Approved as-is
- [ ] Approved with changes (describe below)
- [ ] Escalated (see [escalation path](/docs/security/review-process-and-escalation.md) — name the specific trigger)

**Findings / changes requested:**


**Logged in [review log](/docs/security/review-log.md)?**
- [ ] Yes
