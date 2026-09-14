# Project 8 — Game Day Environment & Safety Documentation

Written so a future reader can understand why every scenario in the catalog was safe to run where it ran, without having to trust that it just "seemed fine at the time."

## Target environment

**All scenarios run against a dedicated staging deployment** (a long-lived Vercel preview deployment created from a pull request, e.g. `chore/game-day-staging`), never against the production `main` deployment. This isolates any risk — a script bug, an unexpectedly large payload, a runaway loop — to a disposable environment rather than the live product.

## Test data

- All threads, comments, and accounts touched by game day scripts are created specifically for this purpose and clearly identifiable as test data (e.g., thread titles prefixed `[gameday]`).
- No real user account, real thread, or real comment is targeted by any scenario.
- The one exception — Scenario 5's credential-stuffing burst — uses a single disposable account created solely for that scenario, never a real user's.

## Volume and time bounds (per scenario)

Every scenario in the catalog is deliberately bounded, not open-ended:

| Scenario | Bound |
|---|---|
| 1 — Bulk thread scraping | 50 req/s, 60 seconds |
| 2 — Malformed payload flood | 50 req/10s |
| 3 — Comment spam flood | 30 comments/30s, against one disposable test thread |
| 4 — Known-ID lookup flood | 50 req/10s |
| 5 — Credential stuffing | 30 attempts/60s, **run once per game day**, never repeated in the same session |

No scenario is DDoS-scale, and none runs unattended — a team member watches the run and can stop it (`Ctrl+C` in the terminal running k6) at any time; in-flight requests complete, but no new ones are issued.

## Why Scenario 5 specifically is bounded the way it is

Credential stuffing targets Clerk's real, hosted infrastructure, not application code CommunityPulse controls. A sustained or repeated stuffing attempt risks tripping Clerk's own abuse detection and flagging the development instance itself — a self-inflicted problem with no security value. Running it once, against one disposable account, at a bounded volume, answers the real question ("does anything stop a stuffing burst") without that risk.

## Free-tier usage bounds

Neon and Vercel free tiers have real usage ceilings (function invocations, bandwidth, compute hours). Before each game day:
- Check current usage against plan limits on both dashboards
- If a scenario's projected request volume would meaningfully approach a plan limit, scale the scenario down rather than risk an unexpected service suspension mid-project

## Monitoring during a run

A team member keeps the Vercel deployment dashboard and Neon dashboard open during every game day run, watching for anything outside the expected pattern (unexpected error spikes unrelated to the scenario being tested, unexpected cost/usage jumps, the staging deployment becoming fully unresponsive rather than gracefully rate-limiting).

## Escalation — if a game day itself causes a real problem

1. **Stop the script immediately** (`Ctrl+C`) — do not let it finish "to get clean data" if something looks wrong.
2. **Do not immediately re-run it** to see if the problem repeats — diagnose first.
3. Check whether the issue is scoped to staging only (expected, low-severity) or has any observable effect on the production deployment or real Clerk/Neon account status (higher severity, requires both team members' attention before continuing).
4. Document what happened in the game day results log regardless of severity — an incident during testing is itself a finding, not something to omit because it wasn't the intended result.
5. Do not resume game day activity until both team members agree the cause is understood.

## Timing

Game days are run during a deliberately chosen working session, not scheduled against any real user traffic window — CommunityPulse currently has no real end users beyond the project team, so collateral impact risk is minimal by default, but this reasoning is documented here as the practice to carry forward if that ever changes.
