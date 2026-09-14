# Project 8 — Game Day Scenario Catalog

Five scenarios, each targeting a real, specific CommunityPulse endpoint — not a generic attack checklist. Grounded directly in the actual code (`middleware.ts`, `prisma/schema.prisma`, `app/api/*`), verified before writing this catalog.

---

## Scenario 1 — Bulk scraping of the public thread list

**Target:** `GET /api/v1/threads`
**Why this endpoint:** intentionally public, no authentication gate, no rate limiting implemented — the README names this exact endpoint as the one this project should verify, not assume.
**Attack pattern:** sustained high-volume GET requests (target: 50 requests/second for 60 seconds) from a single source, simulating full-catalog scraping.
**What "held" looks like:** requests beyond the 20-per-10-second baseline receive 429s per the SLO.

## Scenario 2 — Malformed payload flood against thread creation

**Target:** `POST /api/threads` (authenticated)
**Why this endpoint:** the only write path for new threads; validated via `createThreadSchema` in `lib/validation.ts`, but validation and rate limiting are separate concerns — a payload can be correctly rejected by Zod and still cost real server time if sent at volume.
**Attack pattern:** a valid authenticated test session sending a rapid burst of deliberately malformed payloads (oversized `body` fields, missing required fields, wrong types) — target: 50 requests/10 seconds.
**What "held" looks like:** the endpoint blocks/throttles the burst itself (429s), independent of whether each individual payload is correctly rejected by validation — validation working is not the same as abuse-resistance working.

## Scenario 3 — Comment spam flood against a single thread

**Target:** `POST /api/threads/[id]/comments` (authenticated)
**Why this endpoint:** no per-thread or per-user comment-rate control exists in the current code; a single authenticated user can post unlimited comments to one thread.
**Attack pattern:** one authenticated test session posting repeated valid comments to a single real thread at high frequency — target: 30 comments in 30 seconds.
**What "held" looks like:** the endpoint begins rejecting/throttling well before 30 comments land.

## Scenario 4 — High-volume lookup of known thread IDs

**Target:** `GET /api/v1/threads/[id]`
**Why this endpoint, and why not classic "IDOR probing":** thread and comment IDs are `cuid()` — non-sequential, non-guessable strings, confirmed directly in `prisma/schema.prisma`. Classic IDOR-by-incrementing-an-integer does not apply here. The real risk is volumetric: IDs are already returned in bulk by the public list endpoint (Scenario 1), so an attacker doesn't need to guess IDs — they scrape them, then hits each one individually. This scenario tests that second step.
**Attack pattern:** using a list of real IDs obtained from Scenario 1's response, fire high-volume individual lookups against each — target: 50 requests/10 seconds.
**What "held" looks like:** same 429-within-60-seconds bar as the other scenarios.

## Scenario 5 — Bounded credential-stuffing burst against sign-in

**Target:** Clerk's sign-in API (not the hosted UI), against one disposable test account created specifically for this scenario.
**Why bounded, and why this is safe:** this targets Clerk's own infrastructure, not application code — running a sustained or repeated stuffing attack risks triggering Clerk's real abuse detection and flagging the whole development instance, an avoidable, self-inflicted problem. Full safety reasoning: `docs/security/game-day-safety.md`.
**Attack pattern:** 30 deliberately incorrect password attempts against the single disposable account within a 60-second window, run **once** per game day.
**What "held" looks like:** attempts are throttled or the account is temporarily locked well before the 30th attempt — this scenario is really asking "does anything in front of this app stop a stuffing burst," regardless of whether that something is Clerk's or CommunityPulse's own.

---

## Explicitly out of scope for this catalog

- Attempting to actually compromise the disposable test account's real password (Scenario 5 uses only incorrect attempts)
- Any scenario targeting real user accounts or real production data
- DDoS-scale volume — every scenario above is bounded and time-boxed, consistent with the safety documentation
