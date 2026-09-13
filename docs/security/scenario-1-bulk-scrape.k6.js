// scenario-1-bulk-scrape.k6.js
//
// Game Day Scenario 1: Bulk scraping of the public thread list.
// Target: GET /api/v1/threads — public, unauthenticated, no rate limiting
// currently implemented anywhere in front of it.
//
// This script is the TEACHING EXAMPLE for the whole catalog — the other
// four scenarios reuse this same two-phase structure (baseline, then
// attack), just against different endpoints and with auth headers added
// where needed. Read the comments below before adapting it.
//
// Run with:
//   k6 run -e STAGING_URL=https://your-preview-deployment.vercel.app scenario-1-bulk-scrape.k6.js
//
// Before pointing this at anything real, sanity-check the script itself
// with a tiny, harmless run against a site that can handle it easily:
//   k6 run -e STAGING_URL=https://test.k6.io --vus 1 --duration 5s scenario-1-bulk-scrape.k6.js
// (this will "fail" the real thresholds since test.k6.io isn't CommunityPulse —
// that's fine, you're only checking the script runs without a syntax/logic error)

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// ---- Custom metric ----
// This tracks the ONE number the SLO actually cares about: what fraction
// of requests during the ATTACK phase (not the baseline phase) came back
// as 429 (Too Many Requests) — i.e., got correctly blocked.
const blockedRate = new Rate('attack_requests_blocked');

// ---- Target ----
// Never hardcode the URL — pass it in with -e STAGING_URL=..., same
// reproducibility principle as everything else in this repo (no
// machine-specific values baked into committed files).
const TARGET = __ENV.STAGING_URL;
if (!TARGET) {
  throw new Error('Set -e STAGING_URL=https://your-staging-url when running this script.');
}

// Vercel's own Deployment Protection (Vercel Authentication) sits in front
// of preview deployments on team/org accounts by default — this header
// bypasses it using the secret you generate under Project Settings ->
// Deployment Protection -> Protection Bypass for Automation. Without this,
// requests may silently hit Vercel's own SSO wall instead of your app.
const VERCEL_AUTOMATION_BYPASS_SECRET = __ENV.VERCEL_AUTOMATION_BYPASS_SECRET;
if (!VERCEL_AUTOMATION_BYPASS_SECRET) {
  throw new Error('Set -e VERCEL_AUTOMATION_BYPASS_SECRET=... (see Deployment Protection settings in Vercel)');
}

const headers = { 'x-vercel-protection-bypass': VERCEL_AUTOMATION_BYPASS_SECRET };

// ---- Load shape ----
// Two phases, matching the SLO's own definition of "excess":
//
// 1. "baseline" — 2 requests/second for 10 seconds = 20 requests total.
//    This mimics a real, legitimate user and should NOT be blocked.
//    It exists so the attack phase's numbers aren't polluted by requests
//    that were never supposed to be flagged in the first place.
//
// 2. "attack" — 50 requests/second for 60 seconds, starting right after
//    the baseline phase ends. This is well above the SLO's 20-per-10-second
//    threshold for "legitimate" traffic — everything here SHOULD be blocked
//    if rate limiting is working.
export const options = {
  scenarios: {
    baseline: {
      executor: 'constant-arrival-rate',
      rate: 2,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 5,
      exec: 'baselineLoad',
    },
    attack: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '60s',
      preAllocatedVUs: 150,
      maxVUs: 200,
      startTime: '12s', // starts just after the baseline phase finishes
      exec: 'attackLoad',
    },
  },
  thresholds: {
    // This IS the SLO, expressed as a k6 threshold: at least 95% of
    // attack-phase requests must have been blocked (429). If this
    // threshold fails, k6 itself exits with a non-zero status code —
    // useful for wiring this into CI later (see Project 9's canary gate).
    attack_requests_blocked: ['rate>=0.95'],
  },
};

// ---- Baseline phase: should all succeed normally ----
export function baselineLoad() {
  const res = http.get(`${TARGET}/api/v1/threads`, { headers });
  check(res, {
    'baseline: request succeeded (200)': (r) => r.status === 200,
  });
  sleep(0.1);
}

// ---- Attack phase: this is what actually gets measured against the SLO ----
export function attackLoad() {
  const res = http.get(`${TARGET}/api/v1/threads`, { headers });

  // Record whether THIS request was blocked — this is what the threshold above reads.
  blockedRate.add(res.status === 429);

  check(res, {
    // We don't require every attack request to be a 429 for the check to
    // "pass" — the threshold above is the real bar. This check instead
    // catches a different, worse failure mode: the server crashing (5xx)
    // under load rather than gracefully rejecting excess requests. A
    // pile of 500s is a worse outcome than a pile of unblocked 200s.
    'attack: server did not crash (no 5xx)': (r) => r.status < 500,
  });
}

// ---------------------------------------------------------------------
// ADAPTING THIS FOR THE OTHER FOUR SCENARIOS:
//
// Scenario 2 (malformed payload flood) and Scenario 3 (comment spam):
//   - Use http.post() instead of http.get(), with a JSON body and
//     an Authorization header carrying a real test-session token.
//   - Scenario 2 should send deliberately malformed bodies (oversized
//     strings, missing fields) — validation failing correctly (422/400)
//     is a DIFFERENT thing from rate limiting kicking in (429). Track
//     both separately if you want to see both signals.
//
// Scenario 4 (known-ID lookup flood):
//   - Before the attack phase, do one GET to /api/v1/threads, parse the
//     JSON response, and pull real thread IDs out of it (JSON.parse(res.body)).
//   - Loop through those IDs in the attack phase instead of hitting the
//     same URL every time.
//
// Scenario 5 (credential stuffing):
//   - This one should NOT use constant-arrival-rate at high volume —
//     per the safety doc, it's a single bounded burst (30 attempts in
//     60 seconds), run once. A simple shared-iterations executor with
//     30 total iterations is more appropriate than a sustained rate.
//   - Target Clerk's sign-in API endpoint directly, with the disposable
//     test account's email and a deliberately wrong password.
// ---------------------------------------------------------------------
