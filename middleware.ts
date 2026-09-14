import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Almost everything here is public by design: threads, comments, profiles,
// and the read-only v1 API. Only the routes that create or modify content
// require a session, enforced both here (coarse) and in each route
// handler via requireUser()/assertOwner() (fine-grained, the real check).
const isProtectedRoute = createRouteMatcher([
  "/threads/new",
  "/settings(.*)",
  "/api/threads(.*)",
  "/api/comments(.*)",
]);

// Project 8 fix: covers all four routes the first game day found had no
// rate limiting anywhere in the stack —
//   /api/v1/threads        (Scenario 1 — bulk scraping)
//   /api/threads            (Scenario 2 — malformed payload flood, POST)
//   /api/threads/[id]/comments (Scenario 3 — comment spam flood, POST)
//   /api/v1/threads/[id]    (Scenario 4 — known-ID lookup flood)
// One shared matcher covers all four since /api/threads(.*) already
// includes the nested comments route, and /api/v1/threads(.*) covers
// both the list and single-item lookup.
const isRateLimitedRoute = createRouteMatcher([
  "/api/v1/threads(.*)",
  "/api/threads(.*)",
]);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Matches the SLO's own definition of "excess" traffic (docs/security/game-day-slo.md):
// a real user does not send more than ~20 requests in a 10-second window
// to any single endpoint. Sliding window is a smoother, more accurate
// limiter than fixed window for exactly this kind of burst detection.
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
  prefix: "communitypulse-ratelimit",
});

export default clerkMiddleware(async (auth, request) => {
  if (isRateLimitedRoute(request)) {
    // NOTE: one shared limit bucket per IP across all four routes, not
    // per-route. This is deliberately simple for the re-verification
    // test — each game day scenario is run one at a time, not
    // concurrently, so a shared bucket still measures each scenario's
    // blocking behavior correctly. Per-route buckets would be a
    // reasonable future refinement, not required for this fix.
    const ip =
      request.ip ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "127.0.0.1";

    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }
  }

  if (isProtectedRoute(request) && request.method !== "GET") {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
