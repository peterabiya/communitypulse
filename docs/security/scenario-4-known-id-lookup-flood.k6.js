// scenario-4-known-id-lookup-flood.k6.js
//
// Game Day Scenario 4: High-volume lookup of known thread IDs.
// Target: GET /api/v1/threads/[id] — public, unauthenticated.
//
// This does NOT guess IDs (they're cuid(), non-sequential, non-guessable —
// see the scenario catalog for why classic IDOR-by-increment doesn't apply
// here). Instead, setup() scrapes real IDs from the public list endpoint
// first, exactly the way a real attacker would: use Scenario 1's endpoint
// to harvest IDs, then hit each one individually at volume.
//
// Run with:
//   k6 run -e STAGING_URL=https://your-preview.vercel.app scenario-4-known-id-lookup-flood.k6.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const blockedRate = new Rate('attack_requests_blocked');

const TARGET = __ENV.STAGING_URL;
if (!TARGET) throw new Error('Set -e STAGING_URL=...');

const VERCEL_AUTOMATION_BYPASS_SECRET = __ENV.VERCEL_AUTOMATION_BYPASS_SECRET;
if (!VERCEL_AUTOMATION_BYPASS_SECRET) throw new Error('Set -e VERCEL_AUTOMATION_BYPASS_SECRET=... (see Deployment Protection settings in Vercel)');
const headers = { 'x-vercel-protection-bypass': VERCEL_AUTOMATION_BYPASS_SECRET };

// Runs once. Scrapes real thread IDs the same way Scenario 1 showed is
// possible — this scenario picks up exactly where that one leaves off.
export function setup() {
  const res = http.get(`${TARGET}/api/v1/threads`, { headers });
  if (res.status !== 200) {
    throw new Error(`setup() failed to fetch thread list: ${res.status}`);
  }
  const threads = JSON.parse(res.body);
  const ids = threads.map((t) => t.id);
  if (ids.length === 0) {
    throw new Error('No threads found on staging — create at least one test thread before running this scenario.');
  }
  return { ids };
}

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
      timeUnit: '10s',
      duration: '60s',
      preAllocatedVUs: 30,
      startTime: '12s',
      exec: 'attackLoad',
    },
  },
  thresholds: {
    attack_requests_blocked: ['rate>=0.95'],
  },
};

export function baselineLoad(data) {
  const id = data.ids[Math.floor(Math.random() * data.ids.length)];
  const res = http.get(`${TARGET}/api/v1/threads/${id}`, { headers });
  check(res, { 'baseline: request succeeded (200)': (r) => r.status === 200 });
  sleep(0.1);
}

export function attackLoad(data) {
  const id = data.ids[Math.floor(Math.random() * data.ids.length)];
  const res = http.get(`${TARGET}/api/v1/threads/${id}`, { headers });

  blockedRate.add(res.status === 429);

  check(res, {
    'attack: server did not crash (no 5xx)': (r) => r.status < 500,
  });
}
