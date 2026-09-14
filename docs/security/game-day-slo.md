# Project 8 — Security SLO
**Written and committed before the first game day runs. This document is not to be edited retroactively to match results — if a scenario misses the bar below, that is a finding for the gap analysis, not a reason to redefine the bar.**

## Baseline assumption

CommunityPulse is a small pilot product. A real, legitimate user does not send more than ~20 requests in a 10-second window to any single endpoint. Anything sustained above that from one source is attack-shaped traffic, not normal use — this is the threshold "excess" is measured against below.

## Primary SLO

> **At least 95% of injected attack requests that exceed 20 requests per 10 seconds from a single source must receive an HTTP 429 response, or be otherwise observably blocked/dropped, within 60 seconds of sustained excess volume beginning — for every scenario in the catalog.**

A scenario **PASSES** if this bar is met. A scenario **FAILS** if fewer than 95% of excess requests are blocked within the 60-second window.

## Secondary SLO — availability protection

> **During every scenario, a control request (a normal, legitimate read against the live homepage) must maintain a response time under 2 seconds and a 0% error rate throughout the attack.**

This exists to catch a specific failure mode the primary SLO alone would miss: a "defense" that blocks attack traffic by taking the whole application down is not a defense. If the control request degrades, that is logged as a finding regardless of how the primary SLO scores.

## Per-scenario pass/fail is reported individually

The overall game day is not scored as a single pass/fail — each of the five scenarios in the catalog is scored independently against both SLOs above. The gap analysis addresses each one by name.

## What "unverified" currently means, stated honestly before testing begins

At the time this SLO is written, no rate limiting has been implemented or verified at any layer of this deployment — the README's stated plan to defer this to "the Cloudflare edge layer" does not currently apply, since this deployment has no custom domain routed through Cloudflare. The working assumption going into the first game day is that **most or all scenarios will fail** this SLO. That is an expected, honest starting hypothesis, not a target to avoid — see the evaluation criteria's own point that a first run with no failures is more likely evidence of too-easy scenarios than of a resilient system.
