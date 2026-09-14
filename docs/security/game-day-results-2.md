# Re-Verification Game Day — Results

Run against: `chore/game-day-staging`, same five k6 scripts as the first game day, no modifications to the scripts themselves. Fix under test: Upstash-backed rate limiting in `middleware.ts` (20 requests/10 seconds per IP, sliding window), applied to all four routes identified in the gap analysis.

## Side-by-side comparison

| # | Scenario | Run 1 (before fix) | Run 2 (after fix) | Change |
|---|---|---|---|---|
| 1 | Bulk thread scraping | 0.00% blocked | **97.43% blocked** | ✅ PASS — SLO met |
| 2 | Malformed payload flood | 0.00% blocked | 72.09% blocked | ⬆️ Large improvement, SLO not met |
| 3 | Comment spam flood | 0.00% blocked | 0.00% blocked | ⏸️ No change — see analysis below |
| 4 | Known-ID lookup flood | 0.00% blocked | 74.41% blocked | ⬆️ Large improvement, SLO not met |
| 5 | OTP code brute force | 100.00% blocked (Clerk) | 100.00% blocked (Clerk) | No change (expected — unrelated to this fix) |

**1 of 4 previously-failing scenarios now fully meets the SLO. The other three show real, measured, non-trivial improvement, but two don't cross the 95% bar, and one shows no improvement at all.**

## Why the results differ so much between scenarios — this is the actual finding

The fix works. Every scenario's block rate is directly explainable by how far that scenario's own injection rate exceeds the 20-requests-per-10-seconds limit:

- **Scenario 1** injected roughly 25x the configured limit (50 requests/second) — overwhelmingly blocked, as expected.
- **Scenarios 2 and 4** injected roughly 2.5x the limit (50 requests/10 seconds) — meaningfully blocked, but a smaller fraction of requests still land within each rolling window before it resets. This is the sliding-window algorithm behaving correctly at a smaller margin, not a defect.
- **Scenario 3** injected only 1 request/second — **10 requests per 10 seconds, which is *below* the 20-per-10-second threshold.** The rate limiter never activates because the scenario's own designed pacing doesn't exceed the limit it's being measured against. This is not the fix failing; it's two independently-reasonable decisions (the scenario's original pacing, chosen on Day 1 based on realistic comment-spam behavior, and the fix's threshold, chosen on Day 4 based on the SLO's general definition of "excess") that don't align with each other.

## What we are deliberately NOT doing about this

We are not lowering the rate-limit threshold now to force Scenario 3 to pass. The 20-per-10-second threshold was committed in `docs/security/game-day-slo.md` before either game day ran. Adjusting it after seeing which scenarios failed would be exactly the SLO-gaming the original document explicitly guarded against — a threshold chosen to match results isn't a real bar. This limitation is documented honestly instead, below.

## Honest conclusion

The fix is real, verifiable, and produces a large, measurable improvement using the identical scripts from the first run — satisfying the actual requirement for this deliverable. It does not achieve a full 95% pass on every scenario, and one scenario shows no improvement due to a mismatch between the scenario's own designed attack volume and the chosen threshold, not a flaw in the rate limiter itself. A genuinely non-technical reader should take from this: **CommunityPulse went from having zero abuse protection to having real, working, measurably effective protection against high-volume attacks — but comment-spam-scale abuse (lower volume, still clearly not legitimate use) is not yet meaningfully deterred by this specific fix.**

## Recommended follow-up (not applied now, to avoid retroactively changing the test)

A **route-specific, stricter limit for comment creation** (e.g., 5 comments per 30 seconds, rather than sharing the generic 20-per-10-second bucket) would likely close this gap. This is deliberately proposed as future work rather than implemented and re-tested again within this sprint — doing so now would mean tuning the fix to the test after seeing the result, which undermines the honesty of this exact comparison. This recommendation carries forward into the chaos engineering report and the runbook's discussion of ongoing tuning.
