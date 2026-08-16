# CommunityPulse

A small public community forum. Built as Product C for the Expadox
Portfolio Product Security track, covering Projects 7 to 10: Security
Champions and Design Review at Scale, Security Chaos Engineering, Supply
Chain and Release Security, and Living Asset Inventory and Attack Surface
Management.

Full product spec and the zero overhead deploy walkthrough live in the
companion doc `communitypulse-spec-and-deploy-readme.md`. This README
covers the code.

## What it is
Threads, comments, public profiles, and a public read only API. No admin
role, no invite flow. Anyone can sign up, and almost everything is
publicly readable, on purpose. That shift, from private data (LedgerLite)
or internal privilege (OpsConsole) to a genuinely public surface, is the
whole point of this product.

## Where the security work lives
- `lib/auth.ts` and `assertOwner()`: the only access control question in
  this product is ownership, not roles. Simpler than the first two
  products, and deliberately so.
- `app/api/v1/*`: the public, unauthenticated integration API. Comments
  in the route explain why it is intentionally open and what that means
  for Projects 8 and 10.
- `.github/workflows/security.yml`: carries forward the same SAST, secret
  scanning, and SBOM pipeline as the first two products, and adds two new
  jobs: a canary placeholder for Project 9 and a scheduled recon
  placeholder for Project 10.
- `lib/validation.ts`: includes `escapeForNonJsxOutput()`, a deliberate
  backstop for any future rendering path outside JSX, since this app's
  entire dataset is user generated content shown to the public.

## Local setup
```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and Clerk keys
npx prisma migrate dev --name init
npm run dev
```
Sign up, then visit `/settings` to set a username before posting.

## Known simplifications
- No rate limiting on `/api/v1/*` or the comment/thread creation routes in
  this repo. Deferred to Cloudflare's edge layer, same pattern as
  LedgerLite and OpsConsole, but the exposure here is higher since this
  product has no auth gate at all on reads. Project 8's chaos testing
  should treat this as the first thing to actually verify, not assume.
- The canary and recon jobs in the CI workflow are placeholders. Wiring
  them up for real is Project 9 and Project 10's own deliverable, not
  something this scaffold should do for them.
- No content moderation beyond input length limits. A real deployment
  would need one; this demo scopes it out deliberately to keep the
  feature surface small.
