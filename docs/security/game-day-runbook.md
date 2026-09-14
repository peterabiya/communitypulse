# Game Day Runbook

How this becomes an ongoing practice, not a project that happened once.

## Cadence

**Baseline: monthly.** A full run of all five (or more, as the catalog grows) scenarios, once a month, against the staging environment.

**Triggered, out-of-cycle game days** run whenever either of these happens, regardless of the monthly schedule:
- A new API endpoint ships, especially one that's public or unauthenticated
- A Project 7 design review escalates on the grounds of "new unauthenticated endpoint" or "new way user data becomes visible" — if a proposal was serious enough to trigger that escalation path, the resulting feature is serious enough to earn its own game day once built, not wait for the next monthly cycle

This ties Project 7 and Project 8 together deliberately: design review catches risk before code exists; a triggered game day catches it again once the code is real, closing the loop rather than assuming the design review alone was sufficient.

## Ownership

Rotates between Peter and Chancelle, the same two-person structure as the Project 7 champion program. Whoever runs a given game day:
1. Confirms the staging environment is healthy before starting (same pre-flight check as Section 5.10 of the Project 7/8 walkthrough — sign in, post a thread, confirm normal behavior)
2. Runs all scenarios in the catalog
3. Logs results in `docs/security/game-day-results-N.md`, following the same format as runs 1 and 2
4. Brings any new finding to the other team member before deciding on a fix — same reasoning as Project 7's two-person escalation limitation: neither of us is a fully independent second opinion, so findings get discussed jointly, not decided solo

## The per-cycle process

1. **Plan** — confirm the scenario catalog still reflects real, current endpoints; add new scenarios if new attack surface has shipped since the last cycle
2. **Run** — execute every scenario, record raw results, do not modify anything mid-run to "improve" the outcome
3. **Analyze** — gap analysis against the current SLO, naming specific causes per scenario, same format as `docs/security/gap-analysis.md`
4. **Fix** — at least one genuine remediation for a real finding
5. **Re-verify** — same scripts, same target, results compared directly against the pre-fix run
6. **Log and carry forward** — anything not fully resolved (like Scenario 3's calibration gap from this cycle) becomes a named, prioritized item for the *next* cycle, not a closed or hidden issue

## SLO governance — when the bar itself can change

The SLO must not be changed to match a result that already exists. It **can** be revised, but only:
- At the start of a new cycle, before that cycle's game day has run
- With the reasoning for the change written down at the time (e.g., "raising the comment-creation threshold specifically because Run 2 revealed the generic threshold doesn't fit low-volume abuse patterns")
- Never retroactively, and never based on which scenarios passed or failed in the run being evaluated against the old bar

## Escalation — if a game day itself causes a real problem

(Adapted from `docs/security/game-day-safety.md`, generalized for ongoing use beyond the first game day)

1. Stop the running script immediately — do not let it finish "to get clean data"
2. Do not immediately re-run it to see if the problem repeats — diagnose first
3. Determine whether the issue is scoped to staging only, or has any observable effect on production, real user data, or third-party accounts (Clerk, Neon, Vercel, Upstash) — the latter requires both team members' attention before anything resumes
4. Document what happened in that cycle's results log regardless of severity — an incident during testing is itself a finding
5. Do not resume game day activity until both team members agree the cause is understood

## What "success" means going forward

Not "every scenario passes every time." A game day that finds nothing wrong is more likely evidence the scenarios have gone stale than evidence the product is fully secure — the catalog should evolve as the product does, and a clean run is a prompt to ask whether the tests are still hard enough, not a reason to stop running them.
