import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request) && request.method !== "GET") {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
