# Known, Deliberately Deferred Risks

## next@14.2.35 — multiple unpatched high-severity advisories

**UPDATE (Project 8, Day 4):** severity has escalated from **high to critical**. Two new advisories now appear that weren't present during Project 7's original assessment: `GHSA-p293-qw3h-jr36` (unauthenticated RCE on Windows-hosted servers) and `GHSA-2xp9-vwfh-vxw4` (unauthenticated RCE via AVIF files in the Image Optimization API). These were newly disclosed after Project 7's initial audit — this is not something we missed originally, the underlying advisories didn't exist yet.

**Exploitability check performed before deciding how to treat this:**
- `GHSA-2xp9-vwfh-vxw4` (AVIF Image Optimization RCE) — **confirmed not exploitable in this deployment.** CommunityPulse's codebase contains zero usages of `next/image` or `<Image>` anywhere (verified by direct code search). There is no code path that invokes the Image Optimization API this advisory depends on.
- `GHSA-p293-qw3h-jr36` (Windows-hosted RCE) — **not applicable.** This deployment runs on Vercel's Linux-based serverless infrastructure, not a self-hosted Windows server.

**What: what a general CVSS/advisory severity label states is not the same as the actual exploitable risk to this specific deployment.** The label is accurate and should not be dismissed — but for *this* app, in *this* configuration, neither new critical finding currently has a viable attack path. The remaining (non-RCE) advisories from the original assessment still apply as before.

**What: not fixed now** — see original reasoning below; still holds.

**Decision:** the CI dependency-audit step remains `continue-on-error: true`, unchanged. **Priority for Project 9 is raised, not the timeline** — this should be the first item addressed in that project's supply-chain work, given the severity escalation, even though immediate exploitability is currently limited by the two conditions above. Those conditions (no `next/image` usage, Linux hosting) could change in future development without anyone revisiting this document, so the underlying dependency risk should still be resolved properly, not permanently relied upon as "safe because unused."

---

### Original assessment (Project 7)

**What:** `npm audit --audit-level=high` reports 20+ high-severity advisories against the `next` package (versions 9.3.4-canary.0 through 16.3.0-preview.10), including denial-of-service vectors, server-side request forgery, HTTP request smuggling, cache poisoning, and cross-site scripting in App Router applications using CSP nonces. A related high-severity `postcss` finding is a transitive dependency of `next`.

**Why not fixed now:**
- Next.js 13.x and 14.x are officially past Vercel's security-patch window — no patched 14.x release will ever address these.
- The suggested automated fix (`npm audit fix --force`) installs `next@16.3.2`, a breaking major-version change.
- This exact class of upgrade was tested locally during initial deployment (see `docs/security/day1-build-log.md`, Section 2) and broke Clerk's middleware handshake and Prisma's database connectivity, both tied to how Next 16 changed edge-runtime networking. There is no guarantee `16.3.2` specifically resolves those issues without further testing.
- Next.js also has a security release scheduled for August 26, 2026 for a separate critical vulnerability in the 15.5/16.3 lines — any upgrade taken today would likely need a follow-up shortly after.

**Decision:** the CI dependency-audit step is configured with `continue-on-error: true` so this finding remains **visible in every CI run** rather than silently suppressed, while not hard-blocking the pipeline on a risk that's been deliberately evaluated rather than ignored.

**Plan:** a proper upgrade evaluation (testing Next.js's current Active LTS release specifically, not a preview/canary line, against this app's Clerk + Prisma integration) is scoped to **Project 9 (Supply Chain and Release Security)** — the project this decision actually belongs to.

**Owner / last reviewed:** Peter Abiya & Chancelle AHINON — Day 1 of Project 7.
