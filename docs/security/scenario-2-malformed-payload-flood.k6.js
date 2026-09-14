// scenario-2-malformed-payload-flood.k6.js
//
// Game Day Scenario 2: Malformed payload flood against thread creation.
// Target: POST /api/threads (authenticated)
//
// AUTH NOTE: uses a Clerk JWT Template token, not a raw session cookie.
// Clerk's standard session cookie expires in 60 seconds and is meant to be
// continuously refreshed by their client-side SDK — something k6 can't do.
// Clerk's own testing docs recommend a long-lived JWT Template instead:
//   1. Clerk Dashboard -> JWT Templates -> New template -> Blank template.
//      Set Token Lifetime to something like 86400 (24 hours).
//   2. Sign in as your test account on staging, open the browser console, run:
//        await window.Clerk.session.getToken({ template: 'k6-testing' })
//   3. Pass the result via -e AUTH_TOKEN=<value>
//
// Run with:
//   k6 run -e STAGING_URL=https://your-preview.vercel.app -e AUTH_TOKEN=<value> -e VERCEL_AUTOMATION_BYPASS_SECRET=<value> scenario-2-malformed-payload-flood.k6.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const blockedRate = new Rate('attack_requests_blocked');

const TARGET = __ENV.STAGING_URL;
const AUTH_TOKEN = __ENV.AUTH_TOKEN;
if (!TARGET) throw new Error('Set -e STAGING_URL=...');
if (!AUTH_TOKEN) throw new Error('Set -e AUTH_TOKEN=... (see comment above for how to generate it)');

const VERCEL_AUTOMATION_BYPASS_SECRET = __ENV.VERCEL_AUTOMATION_BYPASS_SECRET;
if (!VERCEL_AUTOMATION_BYPASS_SECRET) throw new Error('Set -e VERCEL_AUTOMATION_BYPASS_SECRET=... (see Deployment Protection settings in Vercel)');

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${AUTH_TOKEN}`,
  'x-vercel-protection-bypass': VERCEL_AUTOMATION_BYPASS_SECRET,
};

// A rotating set of deliberately malformed bodies — the point isn't just
// "send bad data," it's "send bad data FAST" to see if volume gets
// blocked independently of whether Zod correctly rejects each one.
const malformedBodies = [
  JSON.stringify({ title: '', body: '' }), // empty required fields
  JSON.stringify({ title: 'x'.repeat(5000), body: 'y'.repeat(50000) }), // oversized
  JSON.stringify({ title: 12345, body: null }), // wrong types
  JSON.stringify({ notAField: 'test' }), // missing required fields entirely
];

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
      timeUnit: '10s', // 50 requests per 10 seconds, per the scenario catalog
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

export function baselineLoad() {
  const res = http.post(`${TARGET}/api/threads`, malformedBodies[0], { headers });
  // At baseline volume, we expect a normal validation rejection (400/422),
  // NOT a 429 — nothing here should look like abuse yet.
  check(res, { 'baseline: got a normal response (not blocked)': (r) => r.status !== 429 });
  sleep(0.1);
}

export function attackLoad() {
  const body = malformedBodies[Math.floor(Math.random() * malformedBodies.length)];
  const res = http.post(`${TARGET}/api/threads`, body, { headers });

  blockedRate.add(res.status === 429);

  check(res, {
    'attack: server did not crash (no 5xx)': (r) => r.status < 500,
  });
}
