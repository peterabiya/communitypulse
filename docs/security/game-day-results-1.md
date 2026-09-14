# First Game Day — Results Log

Run against: `chore/game-day-staging` preview deployment
SLO reference: `docs/security/game-day-slo.md`

## Results summary

| # | Scenario | Target | Requests (attack phase) | % Blocked | SLO Result |
|---|---|---|---|---|---|
| 1 | Bulk thread scraping | `GET /api/v1/threads` | 3,000+ (two independent runs) | 0.00% | **FAIL** |
| 2 | Malformed payload flood | `POST /api/threads` | 300 | 0.00% | **FAIL** |
| 3 | Comment spam flood | `POST /api/threads/[id]/comments` | 30 | 0.00% | **FAIL** |
| 4 | Known-ID lookup flood | `GET /api/v1/threads/[id]` | 300+ (two independent runs) | 0.00% | **FAIL** |
| 5 | OTP code brute force | Clerk sign-in (`attempt_first_factor`) | 30 | 100.00% | **PASS** — but see note below |

**4 of 5 scenarios failed the primary SLO** (≥95% of excess requests blocked within 60 seconds). This matches the SLO document's own stated hypothesis, written before any scenario ran: that most or all scenarios would fail, since no rate limiting has been implemented or verified at any layer of this deployment.

## Secondary SLO (availability protection)

No scenario caused a 5xx server error or observable crash. Response times stayed in a normal range throughout every scenario (roughly 300ms–3s), with no degradation pattern that would indicate the application falling over under load. **The secondary SLO held in every scenario, including the four that failed the primary one** — the application degrades by doing nothing (accepting all traffic), not by breaking.

## Important caveat on Scenario 5's pass

Scenario 5 is not evidence that CommunityPulse's own code or infrastructure has working abuse protection. The block came entirely from Clerk's own hosted authentication layer — specifically, invalidating the OTP verification after ~3 incorrect attempts, then applying account-level rate limiting. **CommunityPulse itself has zero rate limiting anywhere in the stack it directly controls.** Scenario 5 passing is a statement about Clerk's product quality, not about any decision or implementation made in this project. This distinction is carried forward explicitly into the gap analysis and final report.

## Raw evidence

Full terminal output for all five scenarios, including two independent runs each for Scenarios 1 and 4 (for reproducibility confirmation), is preserved in the project's session records and available on request. Key figures:

- Scenario 1: two runs, `attack_requests_blocked` 0.00% both times, response times consistent (~340ms avg) across runs
- Scenario 4: two runs, 0.00% blocked both times, consistent response times (~650–700ms avg)
- Scenario 5: `verification_expired` → `too_many_requests` transition at attempt 4, held through attempt 30
