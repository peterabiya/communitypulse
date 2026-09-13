# Chaos Engineering Report — CommunityPulse Security Resilience

**For:** anyone who needs an accurate picture of whether CommunityPulse's defenses actually work, without needing to read code or logs.
**Bottom line, upfront:** CommunityPulse had no real protection against abusive traffic anywhere in its own code before this project. It now has real, measured protection against high-volume abuse on most of its endpoints — but not yet against lower-volume abuse, and not against anything targeting a specific weak point we identified but haven't fixed. Both statements are true at the same time, and this report explains why.

---

## The question we set out to answer

Most teams find out whether their security defenses actually work during a real attack. We wanted to find out on purpose, first, by attacking our own product deliberately and measuring what happened — rather than assuming our defenses worked because we'd never had reason to doubt them.

## What we tested

Five realistic ways someone could abuse CommunityPulse, each targeting a real, specific part of the product:
1. Scraping every public discussion thread in bulk
2. Flooding the "create a new discussion" feature with junk data as fast as possible
3. Spamming dozens of comments onto one discussion in seconds
4. Rapidly looking up many discussions by ID, the way someone would after scraping the list
5. Repeatedly guessing the sign-in verification code

## What we found the first time: nothing was actually protected

Every single one of the first four tests succeeded completely — CommunityPulse accepted unlimited abusive traffic on all of them, with no slowdown, no blocking, no pushback of any kind. The only test that failed for the attacker was the sign-in code guessing — and that protection came entirely from our third-party sign-in provider (Clerk), not from anything we ourselves had built. In plain terms: **the one thing that worked, worked by accident of which vendor we picked, not by design.**

*(Full numbers: `game-day-results-1.md`)*

## What we did about it

We identified that all four failures traced back to one missing thing: there was no system anywhere in our own code checking "is this too much traffic from one source?" We built one — a shared rate-limiting check that runs before every request to the four affected features, blocking traffic that exceeds a limit we defined and committed to *before* seeing any results, so we couldn't quietly redefine "success" after the fact.

## What we found the second time: real improvement, honestly incomplete

We re-ran the exact same five tests against the fix, with no changes to the tests themselves. The results:

- **Bulk scraping:** now blocks 97% of abusive traffic. This one works well.
- **Junk-data flooding** and **rapid ID lookups:** both improved dramatically (from 0% blocked to roughly 72–74% blocked), but don't yet meet our own bar for "fully protected."
- **Comment spamming:** showed no improvement at all. Not because the fix is broken — because the volume of the comment-spam test itself (one comment per second) never actually reached the threshold our fix was designed to catch. This is a mismatch between two decisions made at different times, not a failure of the fix.
- **Sign-in code guessing:** unchanged, still protected — by the same third-party vendor as before, not by us.

*(Full numbers and the math behind why each scenario landed where it did: `game-day-results-2.md`)*

## What this means for CommunityPulse's security posture, right now, honestly

CommunityPulse went from **zero real protection against abusive traffic** to **real, working, measurable protection against high-volume abuse** on the majority of its exposed features. That is a genuine, meaningful improvement, and it happened because we tested for it rather than assumed it. At the same time, comment-spam-scale abuse — lower in volume, but still clearly not legitimate use — is not yet meaningfully deterred, and we know exactly why, which means it's a known, addressable gap rather than an unknown risk.

We are not claiming this is finished. We are claiming it is honestly measured.

## What happens next

This becomes an ongoing practice, not a one-time project — full details in `game-day-runbook.md`. In short: these tests run monthly, plus immediately whenever a new public-facing feature ships. The specific, known gap (comment-spam volume falling under our current threshold) is carried forward as a named priority for the next cycle, along with the recommendation to give comment creation its own, stricter limit rather than sharing the general one.

## Limitations of this report, stated plainly

- We tested against a staging copy of the product, not live production traffic — behavior under real, mixed traffic patterns may differ
- The one scenario that "passed" reflects a third-party vendor's security work, not our own, and should not be read as evidence of our own team's defenses
- This round covered five scenarios; it is not an exhaustive list of every way CommunityPulse could be abused, and the catalog is expected to grow as the product does
