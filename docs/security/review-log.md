# Design Review Log

Real entries only — every row below should link to an actual GitHub issue, not a hypothetical.

| Date | Feature Proposed | Proposer | Reviewer | Turnaround | Decision | What the review caught (if anything) | Issue Link |
|------|-------------------|----------|----------|------------|----------|----------------------------------------|------------|
| September 1, 2026 | Private messaging | Peter Abiya | Chancelle AHINON | 2 calendar days (opened Sun Aug 30 → reviewed Tue Sept 1); only 1 business day actually elapsed — well within the 2-business-day SLA | Approved with changes (escalated → joint decision) | Found that `assertOwner()` doesn't fit a two-participant resource (real IDOR risk if conversation access relied on it); resolved the open per-user hide/leave question into a concrete design (per-participant state, not shared); required an explicit confidentiality boundary excluding message content from the public `/api/v1/*` API; confirmed sender-identity-from-session pattern holds; reframed rate-limiting as a pre-existing gap deferred to Project 8, not new risk. **Plan changed as a direct result:** conversation authorization redesigned from ownership-based to participant-membership-based before any code was written. | https://github.com/peterabiya/communitypulse/issues/1 |
