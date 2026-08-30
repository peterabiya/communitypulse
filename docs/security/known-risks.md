# Known, Deliberately Deferred Risks

## next@14.2.35 — multiple unpatched high-severity advisories

**What:** `npm audit --audit-level=high` reports 20+ high-severity advisories against the `next` package (versions 9.3.4-canary.0 through 16.3.0-preview.10), including denial-of-service vectors, server-side request forgery, HTTP request smuggling, cache poisoning, and cross-site scripting in App Router applications using CSP nonces. A related high-severity `postcss` finding is a transitive dependency of `next`.

**Why not fixed now:**
- Next.js 13.x and 14.x are officially past Vercel's security-patch window — no patched 14.x release will ever address these.
- The suggested automated fix (`npm audit fix --force`) installs `next@16.3.2`, a breaking major-version change.
- This exact class of upgrade was tested locally during initial deployment (see `docs/security/day1-build-log.md`, Section 2) and broke Clerk's middleware handshake and Prisma's database connectivity, both tied to how Next 16 changed edge-runtime networking. There is no guarantee `16.3.2` specifically resolves those issues without further testing.
- Next.js also has a security release scheduled for August 26, 2026 for a separate critical vulnerability in the 15.5/16.3 lines — any upgrade taken today would likely need a follow-up shortly after.

**Decision:** the CI dependency-audit step is configured with `continue-on-error: true` so this finding remains **visible in every CI run** rather than silently suppressed, while not hard-blocking the pipeline on a risk that's been deliberately evaluated rather than ignored.

**Plan:** a proper upgrade evaluation (testing Next.js's current Active LTS release specifically, not a preview/canary line, against this app's Clerk + Prisma integration) is scoped to **Project 9 (Supply Chain and Release Security)** — the project this decision actually belongs to.

**Owner / last reviewed:** Peter Abiya — Day 1 of Project 7.
