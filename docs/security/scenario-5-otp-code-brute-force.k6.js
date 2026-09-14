// scenario-5-otp-code-brute-force.k6.js
//
// Game Day Scenario 5 (REVISED): brute-forcing the email verification
// code against sign-in, not password stuffing.
//
// WHY THIS CHANGED: DevTools capture of a real sign-in attempt revealed
// this Clerk instance has NO password strategy configured at all —
// supported_first_factors only lists oauth_google and email_code. This
// is a real, CommunityPulse-specific finding, not a generic assumption:
// this app is fully passwordless, so classic credential stuffing doesn't
// apply. The equivalent real risk is guessing the 6-digit email code.
//
// This reuses ONE already-created, still-valid sign-in attempt (the one
// captured from your own manual test) rather than scripting attempt
// creation — simpler, and a better fit for the safety doc's "one bounded
// burst against one disposable resource" design.
//
// CONFIG: paste the exact URL you captured in DevTools (including the
// sign-in attempt ID and all query params) below via -e CLERK_ATTEMPT_URL.
//
// Run with:
//   k6 run -e CLERK_ATTEMPT_URL="https://harmless-elephant-4536.clerk.accounts.dev/v1/client/sign_ins/sia_XXXX/attempt_first_factor?__clerk_api_version=2025-11-10&_clerk_js_version=5.127.2&__clerk_db_jwt=YOUR_DB_JWT" scenario-5-otp-code-brute-force.k6.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const blockedRate = new Rate('otp_attempts_blocked');

const ATTEMPT_URL = __ENV.CLERK_ATTEMPT_URL;
if (!ATTEMPT_URL) throw new Error('Set -e CLERK_ATTEMPT_URL=... — the exact URL captured from DevTools.');

export const options = {
  scenarios: {
    // Single bounded burst, run once — matches the safety doc's bound
    // for this scenario (30 attempts, not a sustained rate test).
    otpBruteForce: {
      executor: 'shared-iterations',
      vus: 1, // sequential, not parallel — mimics a real single attacker guessing
      iterations: 30,
      maxDuration: '60s',
    },
  },
  thresholds: {
    otp_attempts_blocked: ['rate>=0.95'],
  },
};

export default function () {
  // Random 6-digit wrong code each attempt — varied, like a real guesser,
  // not the same wrong code repeated (which some systems treat differently).
  const wrongCode = String(Math.floor(100000 + Math.random() * 900000));

  const res = http.post(ATTEMPT_URL, `strategy=email_code&code=${wrongCode}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  let errorCode = 'unknown';
  try {
    const body = JSON.parse(res.body);
    if (body.errors && body.errors.length > 0) {
      errorCode = body.errors[0].code;
    }
  } catch (e) {
    // non-JSON response — treat as its own signal, logged below
  }

  // The actual signal we're looking for: does errorCode ever change away
  // from "form_code_incorrect" toward something indicating a block/lockout
  // (e.g. "too_many_attempts", "verification_expired"), or does the HTTP
  // status itself become 429? Either counts as "blocked" for the SLO.
  const blocked = res.status === 429 || errorCode !== 'form_code_incorrect';
  blockedRate.add(blocked);

  console.log(`attempt ${__ITER + 1}: status=${res.status} error_code=${errorCode}`);

  check(res, {
    'otp brute force: did not return a server error': (r) => r.status < 500,
  });

  sleep(1); // roughly 1 attempt/second across the 30 iterations
}

