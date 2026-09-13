# Gap Analysis — First Game Day

For each scenario that missed the SLO, a specific, named cause — not a general "needs more security" statement.

## Scenario 1 — Bulk thread scraping (FAIL)

**Predicted by SLO:** ≥95% of excess requests blocked within 60 seconds.
**Actual:** 0% blocked across 3,000+ requests, two independent runs.
**Specific cause:** `GET /api/v1/threads` has no rate limiting implemented in application code (confirmed by reading `app/api/v1/threads/route.ts`), and no edge-layer control exists either — the README's stated plan to defer this to "the Cloudflare edge layer" does not apply to this deployment, since it runs on Vercel's default domain with no Cloudflare in the path. **The documented mitigation strategy for this endpoint does not currently exist.**

## Scenario 2 — Malformed payload flood (FAIL)

**Predicted:** same bar as above.
**Actual:** 0% blocked across 300 requests; Zod validation correctly rejected every malformed payload, but rejection is not the same as rate limiting — the endpoint processed all 300 requests without ever refusing based on volume.
**Specific cause:** `POST /api/threads` validates input shape but has no request-volume control. Correct validation logic does not substitute for abuse-resistance; these are separate concerns the current code only addresses one of.

## Scenario 3 — Comment spam flood (FAIL)

**Predicted:** same bar.
**Actual:** 0% blocked; all 30 rapid comments to a single thread succeeded.
**Specific cause:** no per-thread or per-user comment-rate control exists in `app/api/threads/[id]/comments/route.ts`. A single authenticated user can post unlimited comments to one thread with no delay or cap.

## Scenario 4 — Known-ID lookup flood (FAIL)

**Predicted:** same bar.
**Actual:** 0% blocked across 300+ requests, two independent runs.
**Specific cause:** same root cause as Scenario 1 — `GET /api/v1/threads/[id]` has no rate limiting. Notably, this endpoint's IDs are `cuid()` (non-guessable), so the actual exploitable path isn't ID-guessing — it's using Scenario 1's own scraping output as a source of real IDs to then flood individually, which this scenario confirmed is equally unprotected.

## Scenario 5 — OTP code brute force (PASS — with a caveat)

**Predicted:** same bar.
**Actual:** 100% blocked from attempt 4 onward.
**Specific cause of the pass:** Clerk's own hosted authentication layer — verification-attempt invalidation after ~3 incorrect guesses, followed by account-level rate limiting. **This control is not attributable to any CommunityPulse code, configuration, or decision made in this project.** If CommunityPulse ever moved to a different auth provider, or implemented custom authentication, this protection would not automatically carry over — it is a property of the current vendor, not the product's own security posture.

## Pattern across all four failures

Every failing scenario shares the same root cause: **no rate limiting exists at any layer this project's code touches.** This isn't four separate problems requiring four separate fixes — it's one structural gap (the complete absence of a request-volume control layer) manifesting identically across every endpoint tested. This directly informs the fix: a single, shared rate-limiting mechanism applied at the `middleware.ts` chokepoint (the same chokepoint already used for authentication) would address Scenarios 1–4 simultaneously, rather than requiring four separate point fixes.
