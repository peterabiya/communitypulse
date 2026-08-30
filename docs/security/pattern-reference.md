# Champion Pattern Reference

What to check for on every review, tied to real, existing code in this repo — not generic AppSec advice. If a new proposal doesn't reuse these patterns, that's the finding.

## 1. Authorization runs through one chokepoint, not scattered checks

`lib/auth.ts` defines exactly two functions that matter:
- `requireUser()` — the only session gate. Throws `UnauthenticatedError` if there's no session or no username set yet.
- `assertOwner(user, resourceAuthorId)` — the only ownership check. Throws `ForbiddenError` if the session doesn't own the resource.

**Check:** does the new feature's write/delete logic call these two functions, or does it write a new inline `if (session.userId !== thing.ownerId)` check somewhere else? A second, independently-written ownership check is itself a finding — even if it's currently correct, it's a second place that can drift out of sync with the first.

Real example already in the codebase (`app/api/threads/[id]/route.ts`):
```ts
const user = await requireUser();
const thread = await prisma.thread.findUnique({ where: { id: params.id } });
assertOwner(user, thread.authorId);
```

## 2. `authorId` always comes from the session, never from the request body

`app/api/threads/route.ts`'s `POST` handler is explicit about this in its own comment: *"authorId always comes from the session, never the request body."* The author ID for anything created is `user.id` from `requireUser()`, never a field trusted from client input.

**Check:** does the new feature ever accept an ID, owner field, or user reference directly from the request payload instead of deriving it from the authenticated session? That's a spoofing vector.

## 3. Input validation goes through a Zod schema in `lib/validation.ts`

Every existing write path validates through a named schema — `setUsernameSchema`, `createThreadSchema`, `createCommentSchema` — before touching the database, with explicit length/format limits (e.g. usernames are `^[a-z0-9_]{3,24}$`, thread bodies capped at 10,000 characters).

**Check:** does the new feature add a corresponding schema, or does it write ad hoc `if` checks inline in the route handler? Ad hoc validation is the finding, even if it happens to check the right things today.

## 4. Output has one deliberate backstop outside JSX

`escapeForNonJsxOutput()` in `lib/validation.ts` exists specifically because React's JSX escaping only protects the main render path — anything rendered outside JSX (an RSS export, an email digest, a future HTML-rendering integration) needs this explicit escaping. The current public JSON API (`/api/v1/*`) is safe by construction since JSON isn't executed as markup.

**Check:** does the new feature add any output path that isn't JSX and isn't JSON (an email, a webhook payload, a server-rendered non-React template)? If so, does it call `escapeForNonJsxOutput()`?

## 5. This app's threat model is integrity and availability, not secrecy

Per the schema comment in `prisma/schema.prisma`: unlike LedgerLite (private financial data) or OpsConsole (internal privilege), almost everything in CommunityPulse is intentionally public. The question a champion asks is never "could this leak something private" — it's:
- **Integrity:** can only the real author edit or delete their own content?
- **Availability:** could this be spammed, scraped, or flooded? (Note: rate limiting is deliberately deferred to the Cloudflare edge layer across all three products — a proposal that seems to need its own rate-limiting logic is a signal to check whether that assumption still holds, not to build a one-off limiter.)

**Check:** frame every review question through these two lenses first, before reaching for generic "does this leak data" AppSec instincts that don't fit this specific app's model.
