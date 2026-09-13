// scenario-3-comment-spam-flood.k6.js
//
// Game Day Scenario 3: Comment spam flood against a single thread.
// Target: POST /api/threads/[id]/comments (authenticated)
//
// Uses k6's setup() lifecycle hook — code in setup() runs ONCE, before
// any VUs start, and its return value is passed into every test-function
// call. Here it creates one disposable test thread to spam comments
// against, so we're not spamming a real thread from Project 7's pilot.
//
// Run with:
//   k6 run -e STAGING_URL=https://your-preview.vercel.app -e SESSION_COOKIE=<value> scenario-3-comment-spam-flood.k6.js

// AUTH NOTE: uses a Clerk JWT Template token, not a raw session cookie —
// see scenario-2-malformed-payload-flood.k6.js for the full explanation
// of why (60-second cookie lifetime vs. a 24-hour JWT Template token).
//
// Run with:
//   k6 run -e STAGING_URL=https://your-preview.vercel.app -e AUTH_TOKEN=<value> -e VERCEL_AUTOMATION_BYPASS_SECRET=<value> scenario-3-comment-spam-flood.k6.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const blockedRate = new Rate('attack_requests_blocked');

const TARGET = __ENV.STAGING_URL;
const AUTH_TOKEN = __ENV.AUTH_TOKEN;
if (!TARGET) throw new Error('Set -e STAGING_URL=...');
if (!AUTH_TOKEN) throw new Error('Set -e AUTH_TOKEN=...');

const VERCEL_AUTOMATION_BYPASS_SECRET = __ENV.VERCEL_AUTOMATION_BYPASS_SECRET;
if (!VERCEL_AUTOMATION_BYPASS_SECRET) throw new Error('Set -e VERCEL_AUTOMATION_BYPASS_SECRET=... (see Deployment Protection settings in Vercel)');

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${AUTH_TOKEN}`,
  'x-vercel-protection-bypass': VERCEL_AUTOMATION_BYPASS_SECRET,
};

// Runs once before the load starts. Creates the one disposable thread
// every VU will spam comments onto.
export function setup() {
  const res = http.post(
    `${TARGET}/api/threads`,
    JSON.stringify({
      title: '[gameday] Scenario 3 target thread',
      body: 'Created for Project 8 comment-flood testing.',
      topic: 'general', // required by createThreadSchema — missing before, caused the 400
    }),
    { headers }
  );
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`setup() failed to create test thread: ${res.status} ${res.body}`);
  }
  const thread = JSON.parse(res.body);
  return { threadId: thread.id };
}

export const options = {
  scenarios: {
    // No separate baseline phase here — the scenario catalog defines this
    // one as a single bounded burst (30 comments/30s), not a sustained
    // rate test, since realistically no legitimate user posts 30 comments
    // to one thread inside 30 seconds regardless of volume framing.
    attack: {
      executor: 'constant-arrival-rate',
      rate: 1,
      timeUnit: '1s',
      duration: '30s', // 1/sec for 30s = 30 total comments
      preAllocatedVUs: 10,
      exec: 'attackLoad',
    },
  },
  thresholds: {
    attack_requests_blocked: ['rate>=0.95'],
  },
};

// setup()'s return value is passed in as the `data` argument here.
export function attackLoad(data) {
  const res = http.post(
    `${TARGET}/api/threads/${data.threadId}/comments`,
    JSON.stringify({ body: `Spam comment ${Date.now()}` }),
    { headers }
  );

  blockedRate.add(res.status === 429);

  check(res, {
    'attack: server did not crash (no 5xx)': (r) => r.status < 500,
  });
}
