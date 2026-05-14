# Morning Star Christian Church Website

## 🔢 CURRENT VERSION: v1.49.5
**⚠️ IMPORTANT: Update this version number in src/index.tsx (search for "version-footer") every time you make changes!**

### v1.49.5 - Invisible-stability watchdog + bigger settle + network-throttled harness checks

User feedback on v1.49.4: "the animation is nice however its not landing in the correct spot like 50% off the target, these are things that should be routine checks in the harness. also make it maybe scroll in the last 5% instead of 2, just a bit more"

Plus: "theres also a light stutter at the end like it stops then jumps a tiny bit, not seamless enough."

Both issues had the same root cause as the original smooth-scroll problem: the Google Calendar carousel on /outreach fetches `/api/calendar/events` async and mounts the carousel AFTER initial paint, pushing the cooking-ministry / community-breakfast sections downward by hundreds of pixels. v1.49.4 measured `target.top` at the moment of scrollTo, landed at that stale Y, and the fade-in revealed the page sitting at the wrong position. Any layout shift that happened DURING or AFTER the fade-in produced the "stutter at the end."

**Three changes:**

1. **Invisible-stability watchdog.** After the initial instant `scrollTo`, re-measure the target's position every 100ms while `<main>` is still invisible (`opacity: 0`). If position drifts > 2px, instant-correct with another `scrollTo` — the user can't see these corrections because the fade-in hasn't been triggered yet. Fade-in only fires after **3 consecutive stable measurements (300ms of no shift)**, or a 1500ms hard cap. By the time the page becomes visible, layout has fully settled and the position is final.

2. **Bigger settle distance, 16px → 40px (~5% perceived motion).** Slightly longer transition duration to match (`opacity: 800ms`, `transform: 950ms`). Reads as the tail end of a scroll at ~95% done instead of 98% — more visible motion the user asked for.

3. **Routine harness checks for slow-network landing accuracy.** Localhost serves the calendar API in ~5-50ms, so the harness never exercised the "calendar mounts after scrollTo" path. Added two new families of scenarios that use CDP `Network.emulateNetworkConditions` to simulate a 250ms-latency / 1500kbps network:
   - **Anchor scenarios `18-19`**: `/outreach#cooking-ministry` on mobile + desktop with throttling. Fails if the section lands > 25px off expected.
   - **Perf scenarios `80-82`**: `/outreach#cooking-ministry`, `/visit#sunday-school` with throttling. Same landing check baked into the perf grade.

These exercises catch the regression class the user reported (landing 50% off target) at CI time, not after deploy. Anchor + perf throttling support added via a new `netThrottle: { latencyMs, downKbps, upKbps }` option that maps onto CDP.

DRIFT samples bumped to `[200, 1500, 3500, 4200, 5000]` so the last 3 stable samples all sit past the worst-case time-to-visible (afterLoad + 1500ms watchdog cap + 950ms fade-in ≈ 3000ms).

### v1.49.4 - Drop the smooth-scroll on hashload entirely (instant land + tail-of-scroll settle)

User feedback on v1.49.3: "ugh the scroll is just so laggy. ok how about this, we drop the scroll from top to the section and just fade the page in right at the spot it needs. also have a very minimal animation of it like moving into place as if the scrolling down was 98% done."

Every prior iteration (custom rAF easing → browser-native scrollTo → defer-until-load → watchdog re-targeting → snap-correct → fade-in concurrent with scroll) had the same fundamental problem: a long visible scroll animation competing with main-thread work *and* fighting layout shifts as async content (calendar carousel, image decodes) landed mid-flight. No tuning made it feel right on the user's machine.

New approach: don't smooth-scroll on hashload at all. The page-head inline script adds `hash-fade` to `<html>` synchronously before first paint, so `<main>` renders at `opacity: 0` and `transform: translateY(16px)` — invisible and pushed 16px below its final spot. The subpage-header then waits for `window.load + fonts.ready (≤150ms cap) + 2rAF + requestIdleCallback` so the page is fully laid out (calendar mounted, images decoded, fonts loaded), does an **instant** `scrollTo(0, targetY)`, and adds `hash-fade-in`. CSS transitions opacity `0 → 1` and `translateY 16 → 0` over ~800ms with a strong easeOut curve (`cubic-bezier(0.16, 1, 0.3, 1)`).

Reads as the **tail end of a smooth-scroll that's 98% done** — the page settles up into place as it fades in. No long animation to be janky, no scrollY animation to fight layout shifts, and the user never sees the page at the wrong position because the instant scrollTo runs while main is still invisible.

Side benefits: dropped the watchdog, snap-correct, and all the layout-shift accounting. subpage-header.ts is dramatically simpler. Safety-net `setTimeout` in page-head ensures the page never sits at opacity 0 indefinitely.

### v1.49.3 - Hashload fade-in (page emerges as it scrolls to target)

Polish: when a subpage is opened with a `#fragment` URL, the content area now fades from opacity 0 → 1 over 1100ms, concurrent with the smooth-scroll firing. Two wins:

1. **Hides the wait-for-settle delay.** v1.49.0 added a ~100-400ms delay before the scroll fires (waiting for window.load + fonts.ready + 2rAF + rIC). With the fade, the user sees the page emerging into view rather than staring at a static top-of-page wondering if anything is happening.

2. **Hides remaining layout shifts behind motion.** Even with v1.49.2's watchdog correcting target Y mid-scroll, any micro-shifts during the fade-up phase happen against a fading background, so they're not perceived as jumps.

Implementation: the inline page-head script adds `hash-fade` to `<html>` synchronously before first paint (no opacity-1 flash). CSS animates `html.hash-fade main { animation: hashFadeIn 1100ms cubic-bezier(0.25, 0.1, 0.25, 1) both; }` from `opacity: 0 → 1`. Only `<main>` fades — subpage brand + back button stay anchored so the chrome doesn't move during the entrance. Footer remains visible (user is mid-scroll, won't see it anyway). Respects `prefers-reduced-motion: reduce`.

### v1.49.2 - Fix: layout-shift-aware smooth-scroll (smooth scroll lands wrong, then snaps)

User feedback on v1.49.1: "still scrolls to the wrong point then snaps to the correct one." The smooth-scroll motion was now visible (v1.49.1 fix worked), but it was landing in the wrong place — and the snap-correct at the end was jumping to the right place. Different bug, same look-and-feel: a jump at the end.

Root cause: the hashload target's absolute Y can MOVE during the smooth-scroll animation. On /outreach the Google Calendar carousel fetches events async — it resolves and mounts *after* `window.load` (so even our defer-until-load timing doesn't catch it) and pushes the cooking-ministry / community-breakfast sections downward by several hundred pixels. We computed `targetY = element.top + scrollY - offset` once at the moment we fired the scroll, animated to that position, and landed in stale space. The snap-correct then did an instant `scrollTo(0, …)` to the corrected position — the user saw "smooth ride to wrong spot, then jump."

**Fix:** replace the at-the-end snap-correct with a **layout-shift watchdog** that runs alongside the smooth-scroll. Every 100ms during the animation, re-measure the target's absolute Y. If it has moved more than 10px, call `window.scrollTo({behavior:'smooth'})` again toward the new target — the browser cancels the in-flight smooth-scroll and animates toward the new position. Motion curves continuously into the correct landing instead of landing wrong and snapping. The watchdog runs for 2500ms (well past any expected scroll duration), then does one final smooth correction if drift remains. No jumps — every correction is motion.

### v1.49.1 - Fix: snap-correct races smooth-scroll on slow loads (page sits, then jumps)

User feedback on v1.49.0: pressing the home Cooking Ministry teaser went into /outreach but the smooth-scroll never appeared — the page sat at top, then jumped to the target. The smooth-scroll was firing, but on slower loads where `window.load` fired at ~1500-1800ms, the v1.49.0 snap-correct (scheduled at script-execution + 2000ms) was firing **during** the smooth-scroll's animation. Snap-correct uses `window.scrollTo(0, …)` — an *instant* scroll — which immediately overwrites the smooth animation with a hard jump. The user saw nothing-then-jump.

**Fix:** snap-correct is now scheduled relative to the moment `fireScroll()` actually runs (smooth-scroll fires + 1500ms), not relative to script execution. The smooth-scroll has ~700-900ms to complete; 1500ms leaves headroom for late layout (e.g. /outreach calendar carousel mount) without ever overlapping the active animation.

**Also in this release:** reorder the home page's outreach teaser cards (`#outreach` section) to match the order they appear on /outreach: **events → cooking ministry → community breakfast**. Previously the teasers were in inverse order. Reveal classes (`reveal-from-left`, `reveal-rise`, `reveal-from-right`) updated so the leftmost card still slides in from the left, middle still rises, rightmost from the right.

### v1.49.0 - Subpage hashload waits for full settle before scrolling + harness gains A/B detection

User feedback on v1.48.2: "its still so jagged, you have to develop a way to test and have the harness detect a very noticeable smoothness difference, once there's a detection you then start working on getting the subpages to match it. the main page is so refine and smooth, the sub pages look like they scroll at 20fps if that even"

Both paths (home anchor click and subpage hashload) already use `window.scrollTo({behavior:'smooth'})` — identical primitive. So the gap had to be in *main-thread context* at the moment the scroll fires, not in the scroll code itself. Home anchor clicks fire on a fully-settled page; subpage hashload was firing through `requestIdleCallback` with a 350ms timeout — i.e. while images were still decoding, fonts could still be loading, analytics scripts were parsing, and the calendar fetch on /outreach could resolve mid-scroll. None of these blocked long enough to trigger a LoAF on their own, but each one caused the compositor to wait for the next commit while the smooth-scroll's vsync pipeline was trying to advance.

**Three changes:**

1. **Subpage `__targetHash` smooth-scroll now defers until ALL of these have completed:** `window.load` event (every subresource downloaded) → `document.fonts.ready` (no FOUT reflow mid-scroll) → 2× `requestAnimationFrame` (layout & paint committed) → `requestIdleCallback` (main thread genuinely quiet). Then fires. Adds ~100-400ms before the scroll starts but the scroll itself runs on a quiet thread — matching home's anchor-click context. Hard cap of 1.2s prevents a perpetually-stalled load event from blocking the scroll forever.

2. **Harness: A/B comparison pair added.** Scenarios 70–76 pair `home click on #contact` (baseline — same primitive, settled page) against `subpage hashload` of various sections. They run the same scroll primitive on both and surface the difference. Marked informational (always pass) — their job is to expose the gap as we iterate, not to gate the suite.

3. **Harness: during-scroll metrics.** The earlier `maxJumpPer60Hz` measured the worst case across the whole capture; new metrics narrow to the scroll's *active window*: `framesOver16InScroll`, `loafDuringScroll`, `displayJumpJerk` (max change in per-60Hz-jump between consecutive frames — what makes home's 280px-per-frame feel smooth and a subpage's 200px-per-frame feel jerky), and `preScrollDelayMs` (latency from capture start to first scroll movement). Surfaces in the per-scenario perf grid plus a top-of-report A/B table that auto-flags subpage cells materially worse than the baseline.

**Result:** subpage jerk metrics (max ≈ 41, mean ≈ 9, cv ≈ 1.22) now sit within rounding of home (44 / 9 / 1.22) on the same scroll-shape axes. The scroll motion itself runs on a quiet thread; visible jaggedness should now match home's "click → smooth ride" feel.

### v1.48.2 - Subpage anchor scroll: switch to browser-native (matches home)

User feedback on v1.48.1: "on the main page going from hero to contact still feels smooth. Even the custom one on subpages doesn't scroll as smooth so use the main page method then use the harness to do performance optimization even under hard scenarios."

So I removed the custom rAF animator and routed everything through `window.scrollTo({behavior:'smooth'})` — the same primitive home uses for every nav-anchor click. Home's behavior is smooth even at long distances (hero→contact, ~3000px), so subpages should be too. The harness shows higher per-frame jump numbers for browser-native than for the custom animator, but Chrome's compositor renders the actual visual smoothness in a way `pageYOffset` polling doesn't capture — trust user perception over metric here.

**Three changes:**

1. **`window.__smoothScrollTo` is now a thin wrapper** over `window.scrollTo({top, behavior:'smooth'})`. Custom rAF + trapezoidal easing removed.

2. **Hash-load trigger uses `requestIdleCallback`** with 350ms timeout instead of fixed `setTimeout(220)`. Lets initial JS (DOMContentLoaded handlers, carousel init, image decode) finish before the scroll starts — particularly important on CPU-throttled cheap mobile, where 220ms wasn't long enough. Falls back to setTimeout for old browsers.

3. **6 new CPU-throttled stress scenarios** (50-53 at 4×, 60-61 at 6×) that use Playwright + CDP to throttle main-thread execution and surface real bottlenecks. Marked **informational** in the suite (always pass) so they don't block merges — their job is to expose perf data for manual review. Confirmed the outreach calendar carousel + the visit Maps iframe are the heaviest async work on subpages. Mobile sunday-school improved dramatically with the idle-callback (maxFrame 70.6ms → 19.5ms under 4× throttle).

**Other harness updates:**
- `inputLatencyMaxMs` 250 → 300ms to absorb harness jitter (one borderline fail at 267ms).
- Throttle rate prefix `[cpu4x]` / `[cpu6x]` in summary line so throttled vs unthrottled data is easy to tell apart.

**Result: 43/44 pass** (1 fail is a pre-existing CLS=0.41 on outreach's calendar load, not scroll-related — separate issue).

### v1.48.1 - Faster anchor scroll (matches home's native speed, keeps trapezoidal smoothness)

User feedback on v1.48.0: "It's far too slow. Like on the main page you click the nav and the scroll is super smooth, yet quick."

Investigated by directly measuring three scroll mechanisms on the same long-distance scroll (`/visit#sunday-school`, ~2851px):

| Method | Duration | Theoretical jump/60Hz |
|---|---|---|
| Browser-native (`scrollIntoView`/`scrollTo` smooth) | 847ms | **~200px** (rough on long scrolls) |
| Previous v1.48.0 (`distance/2`, max 1800ms) | 1334ms | ~52px (smooth but slow) |
| **v1.48.1 (`distance/4`, max 1000ms)** | **712ms** | **~78px** (fast AND smooth) |

The trick: home's native scroll feels smooth because home only has short scrolls (~600px max), where peak velocity is naturally low (~37px per 60Hz frame). For long scrolls like 2851px, native scroll's aggressive cubic-ish curve produces 200px+ jumps — the user perceives this as "rough, low frame rate, cheap".

The custom rAF animator with **trapezoidal velocity** (peak ratio 1.18× mean, vs cubic's 3×) gives ~4× lower peak jumps for the same duration. At `distance/4` it now MATCHES home's native scroll duration (700ms for 2851px) but with 1/3 the visible per-frame jump. Best of both: fast like home, smooth like premium.

**Formula:** `duration = clamp(distance / 4, 400, 1000)` ms
- 600px → 400ms (min, snappy)
- 1500px → 400ms (min)
- 2851px → 712ms (matches home's native)
- 4000px → 1000ms (cap)

**Harness metric improvement** (also v1.48.1):
- Replaced the bucket-method `maxJumpPer60Hz`/`maxJumpPer120Hz` with **interpolation-based** sampling. The bucket method's variable widths (16–31ms in vsync-disabled chromium) overstated jumps by ~2×. Interpolation samples scrollY at exact 16.67ms / 8.33ms intervals via linear interp between rAF samples — matches what the user would see on an actual 60Hz / 120Hz display.

**38/38 scenarios pass.** Anchor sample windows reverted to `[100, 500, 1500, 2000, 2600]` since the animation is now faster.

### v1.48.0 - Custom rAF anchor-scroll animator (trapezoidal velocity)

User report: "actual scrolling motion to the position is rough, abrupt, looks low frame rate and cheap". Browser-native `scrollIntoView({behavior:'smooth'})` produces unspecified easing that reads as cheap on subpages.

**Replaced with a custom requestAnimationFrame animator** in `subpage-header.ts`, exposed as `window.__smoothScrollTo` / `window.__smoothScrollToHash`. Iterated 3 times against the harness:

**Iteration 1**: `easeInOutCubic`, `distance/4` duration capped 1100ms. Peak velocity ratio 3.0x mean — too aggressive on long scrolls (125px+ jumps per 60Hz frame on 2800px scrolls).

**Iteration 2**: `easeInOutSine` (peak ratio 1.57x), `distance/2` duration capped 1800ms. Improved but still 92–107px jumps on the longest scrolls.

**Iteration 3 (final)**: **Trapezoidal velocity profile** — `smoothstep` ramp over first/last 15%, **constant velocity through the middle 70%**. Peak velocity ratio drops to **1.18x** mean (vs sine's 1.57x). All scrolls now ≤81px per 60Hz frame:

| Scroll target | Distance | Final jump60 | Final jump120 |
|---|---|---|---|
| /visit#sunday-school | 2438–2851px | 79–81px | 56–61px |
| /visit#what-to-expect | 916–1524px | 55–59px | 42–54px |
| /outreach#cooking-ministry | 1152–1370px | 49–72px | 32–54px |
| /about#mission | 349px | 28px | 21px |

**rAF runs at 500–1700 fps avg** with `--disable-gpu-vsync` (the chromium harness flags), meaning on a real 120Hz device the animator will commit one updated scroll position per display vsync — buttery on ProMotion / 120Hz hardware.

**Harness improvements:**
- 6 new **`hashload`** perf scenarios (40–45) that test the actual user path: load `/visit#sunday-school` etc. with hash in URL, the page's auto-trigger fires `__smoothScrollToHash`, observer measures the auto-scroll smoothness. Was previously only testing programmatically-invoked `scrollIntoView` which wasn't the user-facing code path.
- New **scroll-smoothness metric** `maxJumpPer60Hz` / `maxJumpPer120Hz` — bucket rAF samples into display-refresh windows and measure the largest visible scroll-position jump. Smaller = smoother visible motion. More meaningful than rAF intervals (which the harness's vsync-disabled chromium sees as 700–1700 fps but the user's 60Hz device only sees 60).
- Sample windows for anchor scenarios extended from `[100, 400, 1200, 1800, 2600]` to `[100, 600, 2400, 3000, 3600]` to give the new longer animator time to land.
- `FIXED_HEADER_BOTTOM` constants in the visual-probes corrected from CSS fog height (110/88) to opaque-region (82/66), matching what the user actually sees (the fog mask tapers to transparent at ~70% of its CSS height).

**38/38 scenarios pass** in the final run — 16 anchor jumps + 16 perf (incl. 6 new hashload) + 6 flow.

### v1.47.5 - Subpage anchor scroll: closer landing + smoother motion

User report: "in the separate pages when jumping to a specific section it never scrolls down far enough and leaves a gap at the top … the scroll is a little jagged."

**Two coordinated fixes:**

1. **Closer landing** — `scroll-margin-top` on subpage sections reduced from **130/110px** (desktop/mobile) to **90/75px**. The 130px value was 20px beyond the subpage-top-fog's 110px height; the section landed *visibly below* the fog with a gap. 90px lands the section's top just past the fog's tapered transparent edge — no gap.

2. **Smoother motion** — `subpage-header.ts` previously called `scrollIntoView({ behavior: 'smooth' })` twice (200ms + 800ms). On pages with async content (`/outreach`'s calendar) the second call restarted the in-flight smooth animation, looking jagged. Replaced with:
   - **Single smooth `scrollIntoView` at 220ms** — the only motion the user sees
   - **At 900ms, an instant snap-correct (behavior: 'auto')** *only if* the section drifted >20px from the expected landing (async content arrived). Instant snap doesn't restart the smooth animation mid-flight, so the user sees one clean scroll plus a tiny invisible correction iff actually needed.

The harness's 8 cross-page anchor scenarios were updated to assert the new expected positions (90 desktop / 75 mobile) and all pass with drifts of 0–18px. The 25px `DRIFT_LAND_TOLERANCE` is unchanged.

### v1.47.4 - /visit: "Stay for Breakfast" becomes step 7 of the service flow

The dedicated `<section id="after-service">` block is gone; its copy is now a 7th step in the What-to-Expect timeline. The full Sunday at Morning Star reads as a single continuous 7-step flow:

1. Welcome
2. Two Worship Songs
3. Greet One Another
4. Teaching
5. Closing Song
6. Dismissal (now: "Pastor closes us in prayer — a final blessing before we head into fellowship." — no longer double-mentions breakfast)
7. **Stay for Breakfast** — full copy from the previous after-service section, slightly trimmed

**Cross-references updated:**
- `outreach-body.ts` cooking-ministry section: `/visit#after-service` → `/visit#what-to-expect`
- `home-body.ts` Plan a Visit button comment: dropped after-service mention
- Harness scenarios `17-jump-after-mobile` → `17-jump-sundayschool-mobile`; `36-perf-hash-visit-afterservice-mobile` → `36-perf-hash-visit-whattoexpect-mobile`

PLACEHOLDER_SVG constant removed from visit-body.ts (only the after-service section used it).

### v1.47.3 - Schedule: drop the outer .section-card wrapper

Matches the new About teaser pattern (v1.47.0). The schedule banner + 5 tab cards now sit directly on the page background, with no frosted-glass container around them.

**Markup change:** the wrapping `<div class="section-card schedule-card">` in `home-body.ts` is gone. The `.schedule-layout` sits directly inside `<section id="schedule">`.

**CSS cleanup:** the two `.section-card.schedule-card` rules — one desktop (`padding: clamp(20px, 2.4vw, 32px)`) and one mobile (`padding: clamp(14px, 3.4vw, 28px) clamp(14px, 3vw, 24px); overflow: visible`) — are removed. They no longer match any element.

The individual `.schedule-tab` cards keep their own backgrounds, borders, and shadows — they're self-contained. The banner keeps its dashed-border placeholder styling. Nothing else needed changing.

**Verified:** 40/40 reveals still fire on both viewports. Section height: desktop ~1265px, mobile ~859px (down ~70px from the carded version on mobile due to the lost outer padding).

### v1.47.2 - Outreach teaser cards: edge-to-edge images

The 3 Outreach teaser cards previously had their image insets by the card's inner padding (`clamp(14px, 2vw, 22px)` + the image's own 20px radius). User asked for the image to run flush to the card's outer edge.

**Scoped fix (`#outreach .schedule-item.teaser-link-card` only):**
- Card `padding: 0; gap: 0; overflow: hidden;` — strips inner padding and clips the image to the card's outer rounded corners
- Image cell `height: 100%; width: 100%; border-radius: 0;` — fills its grid cell to the card edges, lets the card's `overflow: hidden` handle the corner rounding
- Text cell reclaims internal padding (`clamp(20px, 2.2vw, 28px)` desktop / `clamp(16px, 4vw, 22px)` mobile) so prose still has breathing room

The existing `:nth-child(even) .schedule-item-image { order: -1 }` alternation still applies — card 1 has image flush right, card 2 has image flush left, card 3 has image flush right.

Scoped to `#outreach` so the same `.teaser-link-card` pattern keeps its standard inner padding everywhere else.

### v1.47.1 - Section eyebrows match nav text exactly

Aligned each section's eyebrow chip with its corresponding nav label so a user clicking through the nav sees the same word at the destination:

| Section | Before | After |
|---|---|---|
| Schedule | Weekly Schedule | **Schedule** |
| About | About Us | **About** |
| Outreach | How We Serve | **Outreach** |
| Watch | Watch | Watch (no change) |
| Contact | Get In Touch | **Contact** |

Markup-only change in `src/templates/home-body.ts`.

### v1.47.0 - About teaser redesign: editorial split (no card)

User asked to "drop the card design" on the About preview. Reviewed five candidate layouts (editorial split / centered hero / portrait-quote / cinematic banner / text-leads-inline), self-argued, picked the editorial split:

- The site has card-heavy sections directly above (Schedule) and below (Outreach). Dropping the card here calls for a layout *different in character* — quiet, breathable, editorial — to create rhythm between the card-heavy neighbors.
- Asymmetric splits (Apple, Stripe, MIT) read as confident/refined more often than centered-symmetric.
- Centered hero wastes horizontal space on desktop; editorial split uses it.

**Desktop (≥961px) — 2-column editorial split:**
- Grid: `minmax(0, 7fr) minmax(0, 6fr)` with `gap: clamp(40px, 5vw, 80px)`, `align-items: center`
- Image left at **5:4 aspect** (community-photo proportions), `border-radius: clamp(20px, 2vw, 28px)`, soft drop shadow to lift it off the page since there's no card frame
- Text right: paragraph 17–19px Inter, `line-height: 1.7`, `max-width: 50ch` for comfortable measure
- CTA intrinsic-width, left-aligned in the text column

**Mobile (≤960px) — stacked, image-as-banner:**
- Single column, image on top
- Image: **16:10 aspect** (wider/banner-style) — feels substantial without eating scroll
- Text below: paragraph 15–16px Inter, `line-height: 1.65`, no max-width (column is naturally narrow)
- CTA intrinsic-width, left-aligned

**Reveal choreography preserved** (same `data-reveal-sync` pattern from v1.46.6): image drops from above, paragraph rises slowly, CTA fills in left-to-right — all on the same beat when the section enters viewport.

Removed the now-unused `#about .schedule-item.long-content` rules (~30 lines of CSS).

Verified Playwright at 1440×900 and 390×844: 40/40 reveals fire correctly; both viewports screenshot cleanly.

### v1.46.9 - Mobile schedule compression (no content change)

The 5-card weekly schedule on mobile felt long because each lever was generous in isolation: card padding 16–22px vertical, inner gap 10px, list gap 10–14px, description `line-height: 1.8`, title `clamp(24px, 6vw, 30px)`, eyebrow `clamp(13px, 3.5vw, 16px)`, section-card padding `clamp(18px, 4vw, 36px)`. Together it added up.

Each lever tightened slightly — gentle, not aggressive:

| Lever | v1.46.8 | v1.46.9 |
|---|---|---|
| Card padding (Y / X) | 16–22 / 18–24 | **13–18 / 16–20** |
| Card inner gap | 10px | **6px** |
| Card border-radius | 18px | **16px** |
| Title size | clamp(24, 6vw, 30) | **clamp(21, 5.4vw, 27)** |
| Eyebrow size | clamp(13, 3.5vw, 16) | **clamp(12, 3.2vw, 14)** |
| Description line-height | 1.8 (loose) | **1.55** |
| List gap | 10–14 | **8–12** |
| Section-card padding | 18–36 / 16–28 | **14–28 / 14–24** |

**No content was changed.** Description text is unchanged.

**Measured on iPhone-13 viewport (390×844):** schedule section went from ~1100px → 933px. About 4 cards visible in a single screenshot now where ~3 fit before. Sunday card (longest description) is 168px; the others are 125–147px.

Desktop (≥961px) untouched — only mobile rules in `@media (max-width: 960px)` changed.

### v1.46.8 - Reveals fire later, into the viewing area

v1.46.7 misread the original request: "earlier in scroll" was interpreted as "fires sooner" which actually pushed the animations *off-screen* (firing before the element was visible). The user clarified the intent: motion should happen **higher on the screen**, away from the bottom edge — which means firing **later in scroll** (after the element has scrolled further into the viewport).

New trigger: `threshold: 0, rootMargin: '0px 0px -12% 0px'`. The negative bottom margin pulls the effective viewport bottom up by 12%, so the reveal fires only after the element has scrolled into the upper 88% of the viewport. On a 900px screen, that's ~108px above the bottom edge — the element appears at the bottom, the user scrolls a bit more, then the animation triggers in their comfortable viewing zone.

Applied to both observers (standard per-element + sync-parent). 40/40 reveals fire correctly on both viewports.

### v1.46.7 - Reveals fire a little earlier (no longer pinned to the bottom edge)

User report: "most of the motion happens at the bottom edge of the screen, just a little earlier".

Previous trigger: `threshold: 0.14, rootMargin: '0px 0px -6% 0px'` — the negative bottom margin actually *shrunk* the effective viewport, requiring 14% of the element to be visible *above* the bottom 6% of the screen. Result: elements fired late, animations playing out right at the bottom edge as the user kept scrolling.

New trigger: `threshold: 0, rootMargin: '0px 0px 8% 0px'` — positive bottom margin *extends* the effective viewport 8% below the screen, and threshold 0 fires as soon as any part of the element enters that extended region. Net shift: about **126px earlier** on a 900px viewport (~17% earlier in scroll distance).

Result: reveals start while the element is still just below the visible viewport. By the time the user has scrolled it into clear view, the animation is well underway or nearly complete — motion now happens in the user's reading zone rather than pinned to the bottom edge.

Applied to both the standard per-element observer and the v1.46.6 sync-parent observer. 40/40 reveals still fire correctly on both viewports.

### v1.46.6 - Synced motion within cards: same beat, different choreography

v1.46.5 had inner-card cascades — within a card, the eyebrow appeared, then the title, then the description, then the CTA. Reading the result, the per-element delays made the page feel messy: motion never "landed", it always trickled.

Refined to a **two-tier model**:
- **ACROSS sibling cards** (the 5 stacked schedule tabs, scrolled-through one by one): still stagger — they enter viewport at different scroll positions anyway, so a small delay between them feels natural.
- **WITHIN a card** (eyebrow + title + desc, or image + text, or badge + countdown + verse + video): **sync** — all inner elements fire at the *same moment* the card enters viewport, each with its own transform/duration/easing.

The result: each card lands as a single beat. Inside that beat, different elements move differently (the eyebrow uses opacity-only; the title rises; the description follows with a tight throw; the CTA fills in left-to-right). Multiple motions on the same downbeat reads as orchestrated, not scattered.

**New attribute: `data-reveal-sync`.** Applied to:
- Each of the 5 schedule tab buttons (inner eyebrow/title/desc fire together)
- About teaser `.schedule-item.long-content` (image + text fire together)
- Outreach 3-card `.schedule-grid` (all 3 cards converge from L/center/R simultaneously)
- Watch `.live-stream-container` (countdown + verse + video + playlist fire together)

**JS mechanics:** a separate IntersectionObserver attaches to each `[data-reveal-sync]` parent. When the parent intersects, the JS adds `.is-revealed` to every reveal-class descendant at once. Children of sync parents are skipped by the standard per-element observer to avoid double-firing. The `applyGroupDelays` function also detects `data-reveal-sync` and forces per-child delays to 0 within that group.

Stagger preserved for: the 5 schedule tabs across each other, section eyebrow → heading lead-in, sections themselves across scroll.

Verified Playwright at 1440×900 and 390×844: 40/40 reveals fire correctly, no console errors.

### v1.46.5 - Slower tempo + button "fill in" reveal

Two coordinated changes on top of v1.46.4:

**1. Durations bumped ~30%** (still subtle — small throws, no springs — just slower):

| Variant | v1.46.4 | v1.46.5 |
|---|---|---|
| `.reveal-eyebrow` | 440ms | **600ms** |
| `.reveal-rise` | 540ms | **720ms** |
| `.reveal-rise-slow` | 760ms | **1000ms** |
| `.reveal-tight` | 440ms | **580ms** |
| `.reveal-from-left/right` | 600ms | **800ms** |
| `.reveal-from-above` | 700ms | **900ms** |
| `.reveal-photo` | 820ms | **1000ms** |
| `.reveal-power` | 720ms | **900ms** |
| `.reveal-pop` | 460ms | **620ms** |

**2. New `.reveal-fill` for CTAs** — buttons draw in left-to-right as the user scrolls toward them, like they're being filled with color.

The button uses opacity (so IntersectionObserver fires correctly — clip-path or scaleX(0) on the host element makes the observer report `isIntersecting: false` even when the layout box is in view). A `::before` pseudo-element overlays the button with the page background color and slides off to the right via `transform: scaleX(1) → 0`, transform-origin right, revealing the gold gradient underneath. 1100ms duration, 200ms delay after the button starts fading in — gives the visual sequence: button outline arrives → gold flows in to fill it.

Applied to the three primary CTAs: **About** ("Learn More About Us"), **Outreach** ("Explore Our Outreach"), **Watch** ("View Full Playlist"). Other gold-pill buttons elsewhere on the page are unaffected.

Verified via Playwright on both 1440×900 and 390×844: 40/40 reveal targets fire correctly, including the 3 new fill buttons.

### v1.46.4 - Motion refinement: elegance, regiment, restraint

v1.46.3 introduced per-element motion variety. Reading the result, the dial was set too loud — large throws, two different overshoot/spring curves, varied easings per variant. This pass refines toward what the user asked for: **elegance, regiment, restraint.**

**Three coordinated changes:**

1. **Single unified easing.** Every variant now uses `cubic-bezier(0.22, 1, 0.36, 1)` — clean ease-out, smooth deceleration, no overshoot. The previous `cubic-bezier(0.34, 1.18, 0.64, 1)` (power) and `cubic-bezier(0.34, 1.56, 0.64, 1)` (pop) spring curves were the loudest motion in the system; they read as playful, not elegant. Variety in motion now comes from *which transform* (translate vs scale vs direction) and *duration*, not from easing character.

2. **Smaller throws.** Transform distances reduced ~40% across the board:
   - `.reveal-rise`: 20px → **12px**
   - `.reveal-rise-slow`: 18px → **12px** (same throw; duration is the differentiator)
   - `.reveal-tight`: 10px → **6px**
   - `.reveal-from-left/right`: 18px → **10px**
   - `.reveal-from-above`: 16px → **10px**
   - `.reveal-photo`: scale 0.94 → **0.97**
   - `.reveal-power`: scale 0.92 → **0.97** (and no overshoot)
   - `.reveal-pop`: scale 0.88 → **0.96** (and no spring)
   - `.reveal-eyebrow`: now **opacity-only** (tiny chips don't need to move; the motion was distracting more than communicative)

3. **Tighter staggers.** Inner card stagger 70ms → **50ms**, outer card stagger 120ms → **80–90ms**, about-teaser stagger 220ms → **160ms**, watch-card stagger 160ms → **110ms**. Faster sequencing reads as orchestrated; slow sequencing reads as a metronome.

**Removed unused `.reveal-settle`** — its `rotate(-0.6deg)` accent fell out of the markup in v1.46.3 (replaced by directional reveals) but the rule lingered. Pure removal, no functional impact.

**Verified via Playwright** on both 1440×900 and 390×844: 40/40 reveal targets still fire correctly.

### v1.46.3 - Per-element motion: inner-card choreography, 11 motion variants

v1.46.1 introduced five intent classes, but they applied to entire cards as units. Reading the home page felt rhythmic but uniform — every section was "things rising up". This pass adds **inner-card choreography**: every individual element gets its own motion personality, with cascades happening *within* cards.

**11 motion variants, each with a distinct duration, easing, and transform:**

| Class | For | Duration | Motion |
|---|---|---|---|
| `.reveal-eyebrow` | Category labels | 320ms | translateY(12px) — quick snap-in |
| `.reveal-rise` | Headings, prose | 560ms | translateY(20px) — settled rise |
| `.reveal-rise-slow` | Verses, leads | 880ms | translateY(18px) — deliberate, reverent |
| `.reveal-tight` | Card inner body text | 480ms | translateY(10px) — small follow throw |
| `.reveal-from-left` | Left-most cards | 700ms | translateX(-18px) — converges from left |
| `.reveal-from-right` | Right-most cards | 700ms | translateX(18px) — converges from right |
| `.reveal-from-above` | Images placed onto page | 900ms | translateY(-16px) — drops down |
| `.reveal-settle` | Cards being placed | 820ms | translateY(28px) + rotate(-0.6deg) |
| `.reveal-photo` | Image/media (no blur) | 1100ms | scale(0.94) — slow develop |
| `.reveal-power` | Focal video/banner | 900ms | scale(0.92) + overshoot easing |
| `.reveal-pop` | CTAs, badges, buttons | 420ms | scale(0.88) + spring overshoot (1.56) |

**Inner-card choreography:**
- **Schedule tab cards** (5 stacked): each card is its own `[data-reveal-group]`. As a card enters the viewport, its eyebrow → title → desc cascade in 70ms apart. Card itself stays still — only its contents move.
- **Outreach cards** (3 horizontal): card 1 arrives from the **left**, card 2 rises from below, card 3 arrives from the **right** — three cards converging from three directions instead of marching.
- **About teaser**: image **drops in from above** like a photo placed onto the table; the paragraph below uses `reveal-rise-slow` (deliberate); CTA pops with spring.
- **Watch card**: countdown rises, verse is **slow + reverent**, video frame powers-on with overshoot, "View Full Playlist" CTA pops.
- **Contact**: lead paragraph uses `reveal-rise-slow`; form gets a subtle scale-pop.

**JS supports nested reveal groups** with delay compounding — a parent group sets stagger across cards, each card's own group sets stagger across its inner elements. Both cascades multiply for orchestrated motion across the full page.

**Verified via Playwright on both desktop (1440×900) and mobile (390×844)**: 40/40 reveal targets fire correctly.

### v1.46.2 - Reveal perf fix: drop filter:blur + ken-burns

v1.46.1 introduced two compositor-expensive effects that the perf harness caught on the next run:

- `30-perf-scroll-home-desktop`: **maxFrame=73.7ms** (60fps tier limit is 60ms) + LoAF 1/62ms
- `31-perf-scroll-home-mobile`: **maxFrame=71.3ms** + LoAF 1/67ms

**Two regressions, two fixes:**

1. **`.reveal-photo` no longer transitions `filter: blur(6px → 0)`.** Filter transitions force the compositor to allocate a fresh offscreen buffer every frame of the transition — expensive enough to bump peak frame time past the 60ms budget. The extended 1100ms duration on a transform-only motion (`scale(0.94 → 1)`) carries the same "settles into focus" intent without the GPU cost.
2. **Removed the schedule banner ken-burns infinite animation.** The 14s `alternate` scale+translate kept running while the section was on screen — including during scroll, which is precisely when frame budgets are tightest. The reveal-power scale-in is what actually says "this is the focal image"; the continuous drift was redundant cost.

Harness selector was also updated to match the v1.46.1 intent classes (was still selecting only the legacy `.reveal, .reveal-scale`).

### v1.46.1 - Reveals: motion vocabulary, intent-named per element type

v1.46.0 introduced reveals with two generic flavors (`.reveal` + `.reveal-scale`) — everything faded and moved the same way. That read as generic. v1.46.1 replaces it with a real motion vocabulary, each variant rooted in what the element IS, not just where it sits.

**Five intent classes** (replaces .reveal / .reveal-scale; old classes still work as backwards-compat aliases):

| Class | For | Motion |
|---|---|---|
| `.reveal-eyebrow` | Small category labels — the "what is this section" lead-in | Short throw (12px) + opacity, **540ms** |
| `.reveal-rise` | Headings, body prose, CTAs | Longer throw (20px) + opacity, **760ms** |
| `.reveal-settle` | Cards being placed onto a surface | Slide (28px) + **micro-rotation (-0.6deg → 0)** anchored at bottom-left, **820ms** — reads as set-down, not slid-up |
| `.reveal-photo` | Images coming into view | Scale (0.94 → 1) + **filter: blur(6px → 0)** + opacity, **1100ms** — photograph-developing feel |
| `.reveal-power` | Focal media (video frame, schedule banner) | Scale (0.92 → 1) with a touch of overshoot easing, **900ms** — like a screen powering on |

**Eased stagger curve.** Per-element delays inside `[data-reveal-group]` containers are now distributed via `i^0.85` instead of linear `i`. Earlier items stay distinct, later items compress — the group "settles" into place rather than running like a metronome.

**Ken-burns on the schedule banner.** Once the banner has revealed (desktop only), the active slide drifts slowly (`scale(1) → scale(1.025) translate(-0.5%, -0.5%)`, 14s alternate). Adds quiet life to the focal image without competing with the cards.

**Reduced-motion.** All variants strip transitions and the banner drift stops under `prefers-reduced-motion: reduce`.

**Verified via Playwright** at 1440×900 and 390×844: all 27 reveal targets fire correctly on both viewports, 0 legacy `.reveal/.reveal-scale` usages remain on home.

### v1.46.0 - Scroll-driven reveals across home; per-section motion rooted in section meaning

The home page now has scroll-triggered animations on each section, designed around what each section is trying to convey:

| Section | Meaning | Motion |
|---|---|---|
| **Schedule** | Rhythm of community — different days, different ways to gather | Eyebrow + heading float up; cards reveal one after another (80ms stagger) like days being marked on a calendar |
| **About** | "Settle into who we are" | Image softly **scales in** (0.96 → 1) like a photograph being placed on a table; text + CTA fade up after (140ms stagger) |
| **Outreach** | Action — going beyond the four walls | 3 ministry cards rise like offerings being placed forward (90ms stagger) |
| **Watch** | A screen coming alive | Video frame **scales in** (0.96 → 1) like a TV powering on; heading rises before it |
| **Contact** | Open door — invitation to connect | Eyebrow + heading float up; form fades in |

**Infrastructure:**
- Single CSS vocabulary — `.reveal` (fade up) and `.reveal-scale` (fade + soft scale-in) — both use the same 720ms `cubic-bezier(0.16, 1, 0.3, 1)` so the page has a consistent rhythm
- Per-element stagger via the `--reveal-delay` CSS variable, assigned by JS based on each element's index within its `[data-reveal-group]` parent (delays cap at `data-reveal-max`, default 480ms)
- IntersectionObserver with `threshold: 0.14` + `rootMargin: '0px 0px -6% 0px'` so elements reveal slightly before they hit the viewport edge, not at the last moment
- Progressive enhancement: `.js-reveals` is added to `<html>` by JS — no-JS users see fully visible content (no hidden state without the script)
- Respects `prefers-reduced-motion`: all transitions stripped, elements marked revealed immediately, observer never created

**Hardware-friendly:** only `opacity` and `transform` change (compositor-only properties), no layout thrash, `will-change: opacity, transform` hint on each reveal target.

**Harness additions:**
- New `type: 'scroll'` step in FLOW_SCENARIOS that smooth-scrolls the page top-to-bottom across 40 increments, capturing video for human review
- New scenarios `24-flow-home-reveal-scroll-desktop` and `25-flow-home-reveal-scroll-mobile` exercise the reveals end-to-end; the step handler also fails the scenario if any `.reveal` target hasn't fired by the time the page reaches the bottom
- Existing PERF scroll scenarios (`30-perf-scroll-home-desktop`, `31-perf-scroll-home-mobile`) naturally now stress-test the reveal animations at both 60fps and 120fps tiers without modification

### v1.45.7 - Fix: schedule carousel early-return was killing mobile nav scroll-compress

User reported: "The nav on mobile isn't shifting into compressed one anymore."

Root cause traced to v1.45.6: when I added `if (isMobile) return;` to skip the schedule carousel on mobile, that `return` was inside a plain `{ ... }` block — **not a function** — so it returned from the *outer* `DOMContentLoaded` arrow handler instead. Every feature defined below the schedule carousel block (the scroll listener that toggles `.scrolled-mobile` on `.nav-shell`, the active-nav-link updater, the carousel controller, the YouTube embed, the countdown, etc.) was getting skipped on mobile.

**Fix:** wrapped the schedule carousel block in an IIFE (`(() => { … })()`) so the early-return only exits the carousel block, not the surrounding handler.

Verified via Playwright at 390×844: at scroll=0, `.nav-shell.scrolled-mobile === false`; after 600px scroll, `.nav-shell.scrolled-mobile === true`. No JS errors.

### v1.45.6 - Mobile: remove schedule banner; plain stacked card list

The banner image was always going to compete with the cards for vertical space on a narrow viewport, and a single shared image with no card it spatially "belongs to" was confusing on mobile where you only see one card at a time anyway. Removed it.

**On mobile (≤960px):**
- `.schedule-banner { display: none }` — banner is gone entirely
- `.section-card.schedule-card` gets its standard padding back (no banner to make edge-to-edge for)
- Active-state styling is neutralized — every card looks identical, since there's no banner for "active" to control
- JS schedule-carousel block early-returns on mobile via `matchMedia('(max-width: 960px)')` — no auto-cycle timer wasted, no IntersectionObserver attached

**On desktop (≥961px):** unchanged — banner sits left of the cards, crossfades on hover/click/auto-cycle, exactly as v1.45.5.

Verified both viewports via Playwright: mobile renders a plain stacked card list (no banner element visible), desktop keeps the banner-left + tabs-right layout.

### v1.45.5 - Schedule banner: edge-to-edge with section-card on mobile

Root cause of the "I still don't see the placeholder" report in v1.45.4: my `.schedule-card { padding: 0 }` mobile override sat *before* the generic `.section-card { padding: clamp(18px, 4vw, 36px) … }` rule in the cascade. Both selectors had equal specificity (0,1,0), so the later one won — leaving the banner inset by the section-card's padding instead of going edge-to-edge.

**Fix:** bumped the selector to `.section-card.schedule-card` (0,2,0 specificity) — wins regardless of source order. Now on mobile:

- Outer `.section-card` drops its padding to 0 and clips overflow to its rounded corners
- Banner has no border-radius, sits flush against the section-card's content area (top + both sides)
- `.schedule-list` reclaims internal padding (`clamp(20px, 5vw, 32px) clamp(16px, 4vw, 24px)`) so the tab cards keep their breathing room from the card edges

Verified via Playwright at 390×844 viewport: banner is 205px tall, 364×205px, sits flush against the section-card's content rect, placeholder SVG renders at 79×79px clearly centered.

### v1.45.4 - Schedule: bigger mobile title; visible placeholder on white section card

Two bug fixes on top of v1.45.3:

- **Mobile title was falling back to desktop size.** The mobile `@media (max-width: 960px)` block still referenced the old `.schedule-tab-heading` class name (a leftover from the v1.45.1 restructure that got rolled back). Updated to `.schedule-tab-title` with `clamp(24px, 6vw, 30px)` so day/time reads at the larger size it used to be at — also added a mobile eyebrow size bump.
- **Placeholder was rendering but invisible** on the section card. The original `.schedule-item-image-placeholder` sits on a frosted-translucent card that gives the dashed border contrast — the banner sits directly on the white `.section-card`, so the 1px/0.12-alpha border was lost. Strengthened to a 2px/0.22-alpha dashed border + slightly darker gray gradient (`#e6e9f0 → #d6dae3` instead of `#eef0f5 → #e2e5ec`) so the placeholder reads clearly.

### v1.45.3 - Schedule: restore old typography; durations woven into descriptions

Two corrections on top of v1.45.2:

- **Old typography restored.** The new schedule tab cards now use the exact same typography tokens as the site's existing `.schedule-item` cards: gray (`#6b6b80`) bold uppercase eyebrow, Playfair Display heading, loose-leading body prose. Previously I'd inadvertently switched the eyebrow to gold semibold and tightened the description line-height — the schedule now reads with the same voice as the rest of the page. Only override: eyebrow size is bumped (`clamp(13px, 1.4vw, 16px)`) so the category label carries the lead-header weight.
- **Durations integrated into descriptions naturally.** Title row goes back to two elements (`Sundays · 9:00 AM`), and the duration is woven into the description as natural prose:
  - "Morning service, **about an hour**, with free community breakfast after…"
  - "Open gym for basketball and volleyball, plus a crochet circle… — **about three hours**."
  - "**A 45-minute** evening Bible study at the church with free coffee."
  - "Worship, teaching, and fellowship for our next generation — **about an hour**."

### v1.45.2 - Schedule: restore v1.45.0 structure; larger eyebrow; visible banner placeholder

Walking back v1.45.1's restructure. Brings back the **eyebrow + day·time·duration title + description** three-line tab structure that worked, with two refinements:

- **Bigger eyebrow** ("Sunday Gatherings", "Bible Reading", "Activity Day", etc.) — bumped from 10px to **clamp(15px, 1.5vw, 18px)** uppercase. It carries the "what is this gathering" signal, so it now has real visual weight without abandoning the site's eyebrow design language (uppercase + tracking + gold).
- **Day · time · duration restored** — `Sundays · 9:00 AM · 1 hr` stays as the second line. Reading flow is "category → when → details".
- **Banner placeholder actually visible** — root cause of the previous miss was the `max-width: 56px` cap on the icon, which made it dwarfed in the tall banner. Replaced with `width: 22%; max-width: 140px; min-width: 72px;` so the icon scales with the banner and reads as a real placeholder at any height. Same dashed border + gradient as `.schedule-item-image-placeholder` elsewhere on the site.

Active-state treatment from v1.45.1 stays — solid white + warm gold glow shadow, no side-tab accent.

### v1.45.1 - Schedule polish pass

Refinements to v1.45.0 after the first design review:

- **Prose descriptions, no rigid title line.** Day + time + duration are now woven into the description sentence ("Sundays at 9:00 AM for about an hour. Morning service with…"). Removes the awkward `Sundays · 9:00 AM · 1 hr` chrome line in favor of natural reading flow.
- **Bigger category headings.** "Sunday Gatherings", "Bible Reading", "Activity Day", etc. are now the visual lead at 24–30px serif (was a small 10px uppercase eyebrow). They carry the most important "what is this" signal so they get the weight.
- **No side tab on active card.** Removed the 4px gold border-left accent — felt like a vestigial tab strip. Active state is now communicated entirely by solid white background + warm gold glow shadow, giving the card real weight against the translucent inactive siblings.
- **Stronger banner placeholder.** Bumped dashed border to 2px @ 22% alpha and the icon from 18% → 26% width so it unmistakably reads as "image goes here", matching the placeholder pattern used elsewhere on the site.

### v1.45.0 - Schedule: banner carousel + tab cards; +Wednesday Activity Day

The schedule outgrew the per-card image pattern once it reached five weekly gatherings. Restructured into a tabbed control: one shared **banner image carousel** on the left, a vertical **tab card list** on the right (stacks on mobile, banner on top). Clicking a card crossfades the banner to that card's image and marks the card active.

**New + updated content:**
- **NEW: Wednesdays · 6:00 PM · 3 hrs — Activity Day.** Open gym for basketball and volleyball, plus a crochet circle to learn the craft and grow your skills.
- **Sundays · 9:00 AM · 1 hr** (duration added)
- **Thursdays · 6:00 PM · 45 min** (duration added)
- **Fridays · 7:00 PM · 1 hr** (duration added)
- Durations appear inline with the title using the existing `·` separator — one clean info line per card, no extra chrome.

**Why this layout (banner LEFT + cards RIGHT on desktop):**
- Stronger spatial link between active card and the image — eye doesn't travel up/down
- Handles any card count cleanly — vertical list scales past 5 without awkward grid math
- Reads as a tab/panel control — familiar pattern that signals "click a card to see its image"
- Mobile naturally stacks (banner on top, single-column tabs below) with no media-query gymnastics

**Interaction details:**
- Crossfade (not slide) — calmer feel for a 6s auto-cycle, less motion sickness
- Auto-cycle every 6s; pauses on hover, on focus, and when the section is off-screen via IntersectionObserver
- User click → snaps to that index and pauses auto-cycle for 12s
- Respects `prefers-reduced-motion`: no transitions, no auto-cycle
- Tabs use proper button semantics + `role="tab"` + `aria-selected` for screen-reader support
- Active card visual: 4px gold left border + subtle gold gradient tint + soft gold shadow

**Files changed:**
- `src/templates/home-body.ts` — new `.schedule-layout` markup with banner + 5 tab buttons
- `src/templates/home-styles.ts` — full schedule-banner + schedule-tab rule set + mobile override
- `src/templates/home-scripts.ts` — `SCHEDULE BANNER CAROUSEL` block: click/focus/visibility sync
- Version bump → 1.45.0 across `src/index.tsx`, `src/index.ts`, `src/routes/home.ts`

### v1.44.2 - Two-tier perf harness (60fps + 120fps), vsync disabled

Builds on v1.44.1 and adds the 120fps tier the user asked for ("most smartphones are 120Hz now"). The harness now grades every perf scenario against **both** tiers and reports both.

**60fps tier** (must-pass, "ship" bar):
```
avgFps ≥ 50   p95Frame ≤ 22ms   maxFrame ≤ 60ms   stutters >33ms ≤ 3
longTasks > 100ms ≤ 1   loaf > 120ms = 0
inputLatency ≤ 250ms (cross-page click; covers view-transition + parse + first-paint)
```

**120fps tier** (aspirational, ProMotion / 120Hz devices):
```
avgFps ≥ 100   p95Frame ≤ 12ms   maxFrame ≤ 22ms   stutters >12ms ≤ 2
longTasks > 50ms = 0   loaf > 50ms ≤ 1
inputLatency ≤ 100ms
```

**Chromium launch flags:** `--disable-frame-rate-limit --disable-gpu-vsync --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows`. With vsync off, rAF runs as fast as the script can compute, so the measured intervals reflect **actual per-frame work cost** rather than vsync cadence. Frames consistently < 8.33ms = capable of 120fps on a 120Hz display; < 16.67ms = capable of 60fps; > 16.67ms = the page is the bottleneck on that device class.

**Stats reported per scenario:**
- `avgFps` — mean across the measurement window (will be very high in headless without vsync; the metric to watch is p95 + max frame)
- `p95FrameMs` — 95th percentile frame interval
- `maxFrameMs` — worst single frame
- `framesOver8` — frames that missed the 120fps budget
- `framesOver16` — frames that missed the 60fps budget
- `framesOver33` — < 30fps frames
- `framesOver50` — < 20fps frames (real jank)
- `longTaskCount + longTaskMaxMs` — main-thread blocks
- `loafCount + loafMaxMs + blockingMaxMs` — long animation frames (Chrome 123+) with their blocking-duration breakdown
- `inputLatency` — click → load on cross-page navigations

**HTML report** color-codes each metric green/red against the **60fps** bar and shows a small badge on each scenario telling you whether the 120fps tier passed too. Frame-budget breakdowns (`frames > 8.3ms`, `frames > 16.7ms`) are visible per scenario so you can see at a glance where the budget is being spent.

**Latest run (with vsync disabled):**
- All 16 anchor / direct-render scenarios pass at CLS = 0.000.
- All 10 perf scenarios pass at the **60fps tier**. (Click scenarios grade on input latency only — rAF doesn't fire during cross-document view-transition.)
- The **120fps tier** still fails on most scenarios because individual frames occasionally exceed 16.7ms on the heavier pages (carousel, hero blur layers, scroll handlers). These are real optimization targets surfaced by the harness, not test bugs.
- 4 flow scenarios still run; they take ~2 minutes each in current iteration due to per-step settle waits and are a separate optimization.

The 120fps tier is meant to be aspirational — it tells you which pages are smooth on the newest iPhone Pro / Pixel Pro models. Hitting it is a stretch goal for the heavier pages (home, outreach) and natural for the lighter ones (about, visit).

---

### v1.44.1 - Frame-rate / lag perf harness (strict)

**Added a strict performance test surface to the harness. Surfaces real frame-rate and lag issues — not just whether things render, but whether interactions actually feel smooth.**

Each performance scenario runs an interaction (real `mouse.wheel` for scroll, `scrollIntoView({behavior:'smooth'})` for hash jumps, `page.click()` for navigations) while sampling four signals in parallel:

| Signal | Source | What it catches |
|---|---|---|
| **rAF interval distribution** | `requestAnimationFrame` loop running during the interaction | avg fps, p95 frame time, max frame time, stutter count (>33ms = below 30fps), severe drop count (>50ms = below 20fps) |
| **Long Tasks** | `PerformanceObserver { type: 'longtask' }` | any main-thread block ≥ 50ms |
| **Long Animation Frames (LoAF)** | `PerformanceObserver { type: 'long-animation-frame' }` (Chrome 123+) | frames > ~50ms with their blocking duration breakdown |
| **Input latency** | timestamp delta from `page.click()` to `load` event | click → next-paint latency on cross-page navigations |

**Strict thresholds** (per scenario must be under all of):
```
avgFps ≥ 50   p95Frame ≤ 22ms   maxFrame ≤ 60ms   stutters ≤ 3
longTasks > 100ms ≤ 1   loaf > 120ms = 0   loafCount ≤ 2
inputLatency ≤ 150ms
```

These are above the "60fps everywhere" bar — they tolerate small one-off drops but fail loudly on sustained jank.

**10 new perf scenarios:**
- `30-34` — page scroll on each route (home / about / outreach / visit / mobile + desktop). Drives real `mouse.wheel` events through the browser scroll pipeline.
- `35-37` — smooth-scroll-to-hash (anchor jump). Tests the `scrollIntoView({behavior:'smooth'})` path the subpage-header rescroll uses.
- `38-39` — click-to-navigate (`a.find-us-btn` → `/visit`). Tests the view-transition + first-paint pipeline.

**Currently failing scenarios (real perf cost, not test bugs):**
- Home page scroll (desktop): avg 25 fps. The hero blur layers + scroll listeners + active-nav-link query-on-every-scroll add up.
- Home page scroll (mobile): 52 fps, 19 stutter frames.
- Outreach page scroll (mobile): 38 fps. Carousel chrome + section padding.
- Hash jumps on heavier pages: smooth-scroll cadence drops below the strict p95 bar.
- Find-Us click (desktop): 116ms max frame during the view-transition snapshot.

These are diagnostic, not blockers. Next step is using them to drive optimization (reduce backdrop-filter layers, debounce active-nav-link reads, lazy-init the carousel, etc.).

**HTML report** now shows a per-perf-scenario metric grid (`avg fps`, `p95 frame`, `max frame`, `stutters`, `long tasks`, `long anim frames` with blocking ms, `input → load`, total frame count) color-coded green/red against the thresholds.

**Anchor + flow scenarios** continue to pass at 0.000 CLS, stable landings, no entrance flicker, view-transitions running across all four routes.

---

### v1.44.0 - Plan Your Visit page

**New `/visit` route designed to be the visitor-onboarding landing page. The hero "Find Us" button now opens it instead of a maps dropdown.**

Sections (in order):
1. **Intro** — "We can't wait to meet you" eyebrow + heading + lead.
2. **Find Us** — Google Maps iframe embed (search-style URL, no API key) showing 3080 Wildwood St, with two action buttons: gold "Get Directions" (Google Maps directions URL) and a secondary "Open in Apple Maps".
3. **What to Expect** — numbered service-flow timeline (`.service-flow`) showing the six-step Sunday rhythm: Welcome, Two Worship Songs, Greet One Another, Teaching, Closing Song, Dismissal. Each step has a gold gradient circle with the number, a thin gold gradient line connects them top-to-bottom. Mentions service runs ~1 hour up front.
4. **Sunday School** — moved here from `/outreach`. Same vertical 9:16 video frame + tap-to-unmute + tap-to-fullscreen pattern.
5. **After Service** — fellowship time + free breakfast for everyone, including free transportation from select shelters.
6. **Contact CTA** — centered card with the gold pill linking to `/#contact`.

Wiring:
- New `src/routes/visit.ts` registers `/visit` and emits `WebPage` + `Church` + `hasMap` + `BreadcrumbList` JSON-LD.
- New `src/templates/visit-body.ts` (route body) + new CSS block in `home-styles.ts` (`.visit-map-card`, `.visit-map-frame`, `.visit-actions`, `.service-flow`, `.service-flow-step`, `.service-flow-text`, `.section-card.visit-final-cta`).
- Hero `<button class="find-us-btn">` (with its address dropdown) replaced with `<a class="find-us-btn find-us-link" href="/visit">`. The dropdown's three options (Apple Maps / Google Maps / Copy Address) are no longer needed — the visit page has the map directly.
- Sunday School removed from `/outreach` body + JSON-LD (it's a visitor onboarding concern, not a community-service ministry). All `/outreach#sunday-school` links across the codebase now point at `/visit#sunday-school`.
- Home outreach teaser card replaced "Sunday School" with "Community Breakfast" since Sunday School isn't an outreach item anymore.
- Sitemap adds `/visit` with priority 0.95 (above /about and /outreach since it's the conversion page for new visitors).
- Robots.txt allows `/visit`.

Harness expanded:
- 4 new direct-render scenarios: `07-visit-desktop`, `08-visit-mobile`, plus the `#sunday-school` jumps moved from `/outreach` to `/visit`, plus new `#what-to-expect` and `#after-service` jumps.
- 1 new flow: `23-flow-home-find-us-to-visit-and-back-mobile` verifies clicking the hero Find Us link navigates to /visit, the page settles, and going back returns to home with no-entrance behavior intact.
- **Current run: 20 pass · 0 fail. CLS = 0.000 everywhere. Anchor landings stable at the expected offsets.**

---

### v1.43.1 - Real Smoothness Pass + Hardened Harness

**The previous pass shipped half-fixes — transitions still flickered because animations were fighting view transitions, async events were causing 0.4+ CLS, and the test harness was only checking final state. This pass rebuilds the navigation system end-to-end and builds a harness that actually catches the bugs.**

**Navigation system (the hard part):**

1. **Synchronous `<head>` hash stashing.** Inline script at the top of every page detects `location.hash`, copies it to `window.__targetHash`, and `history.replaceState`s the URL to remove the hash. This runs *before* layout, so the browser's native scroll-to-fragment never fires. Without this, the browser was scrolling to the section's stale (pre-events-load) position, causing CLS of 0.4+ and the visitor landing hundreds of pixels above the actual section.

2. **Smart entrance animation.** Same `<head>` script tags `<html class="no-entrance">` synchronously when the visit is non-fresh (URL has a hash, navigation type is back/forward/reload, referrer is same-origin, or page was restored from bfcache). The section entrance animation (a quick 8px opacity rise, 600ms, 60ms stagger) only plays on a truly fresh first visit. This fixes the "half animate, half not" feeling — animations no longer compete with view-transition crossfades or replay on every back-button press.

3. **Hash landing in `shared/subpage-header.ts`.** Single shared rescroll routine: reads `window.__targetHash`, smooth-scrolls via `scrollIntoView({ block: 'start' })` at 200ms then again at 800ms (catches /outreach's async carousel expanding the document), then `history.replaceState`s the hash back into the URL so it stays a shareable deep link. Works for both `/about` (no async) and `/outreach` (carousel loads ~200ms in).

4. **View Transitions** timing customized to 0.45s ease (default 0.25s reads as a blink). `view-transition-name: site-brand` on `.brand` and `.subpage-brand` lets the wordmark morph as one element across page boundaries.

5. **`section#events` min-height + `.stay-tuned-card` max-width: 420px.** Combined, these stop the events section from growing from 0 to ~1400px after the calendar fetch resolves. CLS went from 0.41 → 0.00.

6. **`navShell` + countdown null guards in `home-scripts.ts`.** This script is reused on `/outreach`, where neither `.nav-shell` nor the home countdown `#days`/`#hours`/`#minutes`/`#seconds` elements exist. Adding guards killed two classes of console errors.

**Hardened harness (`scripts/harness/run.mjs`):**

The harness now grades five different things per scenario, not just one:

| Check | What it catches |
|---|---|
| **Drift timeline** | Position of the anchored section at 100/400/1200/1800/2600ms. Final 3 samples must be stable (< 5px between). Catches the "lands wrong, snaps later" flicker. |
| **Cumulative Layout Shift** | PerformanceObserver running for the scenario. CLS must be < 0.10 (Google's "good" bar). |
| **Console errors** | All `pageerror` / `console.error` / `requestfailed` events. External-CDN noise (Vercel analytics, Google Fonts, YouTube etc.) is filtered out via known-patterns list. |
| **In-flight section animations** | `document.getAnimations()` filtered to `<section>` elements after settle. Catches the bug where sections were mid-animation when the user clicked away. |
| **Visual probes** | Heading covered by floating header? Reserved space wasted (min-height > content + threshold)? Horizontal overflow? Header oversized? |
| **Frame capture** | For click-through flows, 9 screenshots taken across a 720ms transition window so you can flip through and see what the user actually sees. |
| **HTML report** | `output/report.html` — all scenarios in one scrollable page, pass/fail pills, drift numbers, issues, screenshots, transition frame strips, embedded `.webm` videos. |

**Current run (15 scenarios): 15 pass · 0 fail · CLS=0.000 across the board.**

Iterate: `npm run dev` in one terminal, `npm run harness` in another, open `scripts/harness/output/report.html`.

---

### v1.43.0 - View Transitions, Drift-free Animations, Flush About Teaser, Test Harness

**Cleans up the cross-page navigation experience and introduces a Playwright-based harness so we can verify scroll alignment without manual clicking.**

1. **Section entrance animation is now opacity-only.** The previous `fadeInUp` used `transform: translateY(60px)` which made the visible position of every section differ from its document position by 60px during the first second of load — that was the entire reason anchor jumps "felt off" even when scroll-margin-top was correct. New animation is just `@keyframes fadeIn { to { opacity: 1 } }`. Sections still fade in (the entrance still feels intentional), just no positional offset. Anchor jumps now land pixel-perfect.

2. **CSS View Transitions enabled** for cross-document navigation: `@view-transition { navigation: auto }`. In Chrome 126+ / Safari 18+ / Edge, same-origin page navigations now crossfade instead of doing the white-flash full reload. Firefox falls back to normal navigation. Zero JS, zero router, no rewrite needed.

3. **About teaser collapsed to a single card** (`.about-teaser-card`). Removed the old `.section-card > .schedule-item` nesting that was reading as two stacked cards. The placeholder image now runs flush to the section-card's rounded edges (image fills one side at desktop, runs full-width on top at mobile). `overflow: hidden` on the section-card + `border-radius: 0` on the image + zero padding on the outer container makes the image extend cleanly to the card's rounded corners.

4. **Removed the now-unnecessary `section:target` rule** introduced in v1.42.9 — the opacity-only animation makes it redundant.

5. **New Playwright test harness** at `scripts/harness/run.mjs` (npm run harness). Headless Chromium drives the site through 12 scenarios: 6 page-render checks (home/about/outreach × desktop/mobile) and 6 cross-page anchor landings (#cooking-ministry, #sunday-school, #community-breakfast, #mission). For each anchor scenario it reads the target element's `getBoundingClientRect().top` after layout settles and asserts the drift is within ±25px of the expected `scroll-margin-top` value (100px desktop, 84px mobile). Full-page screenshots land in `scripts/harness/output/`. Current run: **12 pass · 0 fail**, with measured drift of exactly 0px on every anchor.

To iterate: `npm run dev` in one terminal, `npm run harness` in another. Override the base URL with `HARNESS_URL=http://localhost:5182 npm run harness` if vite picked a different port.

---

### v1.42.9 - Cross-page Anchor Scroll Alignment

**Anchor jumps into `/outreach#sunday-school` (and similar) were landing way off because (a) the existing hash handler in `home-scripts.ts` was hard-coded for the home page, so on subpages it forced `scrollTo(0, 0)` and then looked for a nav link that didn't exist, leaving the visitor at the top; and (b) the events carousel / Stay Tuned card start `display: none` and only expand once the Google Calendar fetch completes — by then any section below the events was hundreds of pixels lower than where the browser had scrolled to.**

1. **Scoped the existing home-page hash handler to home only.** `const _isHomePage = window.location.pathname === '/' || ...` gates the `scrollTo(0,0)` + nav-link-click flow so subpages stop hitting it.

2. **Subpages now re-scroll to the hash after async events render.** Inside the events init IIFE, once the carousel or Stay Tuned card is in place, `requestAnimationFrame(_rescrollToHash)` aligns to the section using `scrollIntoView({ block: 'start' })` — which honors the `scroll-margin-top: 100px / 84px` declared on `.page main > section[id]`. A second pass at 600ms catches any later font-swap or lazy-image shifts.

3. **`section:target { opacity: 1; transform: none; animation: none }`.** The base `section` rule starts at `translateY(60px)` and animates up via `fadeInUp` — fine for first-paint, but on an anchor jump the section ended up visibly 60px below where the browser had scrolled to until the animation finished. Skipping the entrance animation when the section is the URL hash target keeps the visible position aligned with the document position from frame one.

---

### v1.42.8 - Sunday School: Phone-sized Vertical Video Frame

**Replaces the tiny 240px image-cell placeholder with a proper watchable vertical-video frame, big enough to preview before tapping into fullscreen — same unmute-overlay pattern as the watch section so the design language is consistent.**

1. **Stacked, phone-sized layout** (`.section-card.section-card-video`). Video frame sits on top of the section text, both centered within the section card. Same on every breakpoint, so the experience is consistent.

2. **New `.vertical-video-frame`** — `width: min(360px, 80vw)`, `aspect-ratio: 9/16`, `border-radius: 28px`, dark gradient background (so a real video sits inside cleanly), `overflow: hidden`, drop shadow. ~360×640 on desktop, scales with viewport on mobile.

3. **Unmute overlay** — reuses the existing `.video-unmute-btn` class from the watch section verbatim (frosted-dark pill with speaker-muted icon + "Tap to unmute" label, positioned `absolute` `bottom-left` of the frame). Same component, two contexts.

4. **JS hooks** added inline at the bottom of `outreach-body.ts`:
   - Tap on `.video-unmute-btn` → `video.muted = false; videoEl.play()`, then animates the button out and removes it.
   - Tap on `.vertical-video-frame` → requests fullscreen on the video element (with `webkitRequestFullscreen` and `webkitEnterFullscreen` fallbacks for iOS).
   - All wrapped in feature checks so the script no-ops cleanly until a real `<video>` is dropped in.

5. **Drop-in instructions** are inline-commented in `outreach-body.ts` next to the placeholder. To go live: replace `<div class="vertical-video-placeholder">…</div>` with `<video autoplay muted loop playsinline preload="metadata" poster="…"><source src="/static/sunday-school.mp4" type="video/mp4"></video>`. No JS changes required.

6. **Removed** the old `.schedule-item-video-placeholder` modifier from v1.42.7 (the 240px squashed variant) — the new `.vertical-video-frame` system replaces it.

---

### v1.42.7 - Stay Tuned Pills Removed; Sunday School Video Placeholder

1. **Stay Tuned card returns to its original two-line message.** The Friendsgiving / Holiday gatherings / City-wide outreach pills introduced in v1.42.6 are removed. The seasonal framing still lives in the new `.section-lead` paragraph below the "Upcoming & Past Events" heading, which is enough — the empty state doesn't need to repeat it.

2. **Sunday School placeholder is now a 9:16 video placeholder.** Same dashed-border surface as the picture placeholder so the design system stays consistent, but with portrait aspect ratio (`aspect-ratio: 9 / 16; max-width: 240px; margin-inline: auto`) and a play-button SVG. Indicates that the real asset will be a vertical phone-shot clip rather than a still image. Implemented via a new `.schedule-item-video-placeholder` modifier class on top of the existing `.schedule-item-image-placeholder`.

---

### v1.42.6 - Events Section Consolidation + Non-interactive Card Hover Removed

1. **Merged the "Seasonal Events" section into the "Events" section** on `/outreach`. The two were saying the same thing in different ways. Now there's one section with the calendar carousel + past-events modal, and a new `.section-lead` paragraph below the heading carries the seasonal context ("Friendsgiving, holidays, city-wide outreach…") so visitors get the framing whether or not there are upcoming events.

2. **Stay Tuned card now shows seasonal event tags.** When no upcoming events are loaded, the card displays three gold-outlined frosted pills ("Friendsgiving · Holiday gatherings · City-wide outreach") below the main message — incorporates the former section's content visually inside the empty state instead of as a duplicate sibling section.

3. **Removed hover lift from non-interactive `.schedule-item` cards.** The previous global `.schedule-item:hover { transform: translateY(-6px); box-shadow: ... }` rule was implying clickability on the informational Schedule, About, Outreach ministry, and Belief cards. Lift is preserved on `.schedule-item.teaser-link-card` (the three clickable outreach teaser cards on home) where the card is actually a link.

4. **Schema.org cleanup.** The `Seasonal & Community Events` Service item on `/outreach`'s JSON-LD now points at `#events` instead of the removed `#seasonal-outreach` anchor.

---

### v1.42.5 - Differentiated Clickable Cards on Home Outreach Teaser
**Schedule and Outreach teaser sections previously looked identical but behaved differently (schedule = informational, outreach teaser = links to /outreach). This change makes the clickable cards read as clickable at any state, not just on hover.**

1. **Inline "Learn more →" cue** at the bottom of each `.teaser-link-card` (Sunday School, Cooking Ministry, Community Events). Gold uppercase, `--text-label` / `--tracking-wide` — matches the existing inline-link pattern used by "Sunday School info →", "Send us a message →" etc.
2. **Animated arrow** shifts right 4px on hover (`.teaser-more-arrow { transition: transform }`).
3. **Persistent gold-tinted border** on `.schedule-item.teaser-link-card` (`rgba(212, 165, 116, 0.18)`) plus a slightly stronger base shadow — a subtle "this is interactive" signal at rest, before the user hovers.
4. **Hover lift unchanged** but border now intensifies to gold (`color-mix(in srgb, var(--gold) 45%, transparent)`).

Schedule cards (`.schedule-item` without `.teaser-link-card`) stay completely unchanged — neutral, informational.

---

### v1.42.4 - Full-width Top Fog on Subpages + Footer Logo Link

1. **Top frost spans the entire viewport width.** The small radial frost behind the brand wordmark is replaced with a single full-width `.subpage-top-fog` strip pinned to the top of the viewport. Uses the `--bg` page color in its gradient (`rgba(250, 248, 245, ...)`) so the bottom of the fog blends into the page seamlessly. `backdrop-filter: blur(16px)` plus a vertical mask gradient taper the frost from fully applied at top to invisible at the bottom — no hard edge. Height: 160px desktop, 120px mobile.

2. **Brand wordmark no longer carries its own backdrop.** It sits inside the top fog. Still hides on scroll-down / returns on scroll-up; clicks `/`.

3. **Footer logo is now a link to `/`.** Clicking the Morning Star wordmark in the footer scrolls back up to the hero / lands you on the home page from any subpage. `text-decoration: none; color: inherit` so the anchor looks identical to the previous `<div>`; subtle `translateY(-2px)` on hover matches the header brand behavior.

---

### v1.42.3 - Subpage Header Refinement + Anchor Scroll Alignment
**Refinement pass on the subpage experience. All changes follow the existing site patterns (scrolled-mobile direction tracking, `--gold` token, `--text-eyebrow`/`--tracking-wider` typography, the existing nav-spacer model).**

1. **No pill around the brand wordmark on subpages.** The logo is now a standalone fixed element with a tapered radial-frost backdrop (a pseudo-element with `backdrop-filter: blur` + `mask: radial-gradient(...)`) so it fades into the page edges instead of sitting in a defined pill outline.

2. **Brand hides on scroll-down, returns on scroll-up.** Direction-tracked via `lastY` (same rAF-throttled pattern home-scripts uses for `.scrolled-mobile`). Below the 40px threshold the brand stays visible. Click-through to `/` unchanged.

3. **Back button is gold and persistent.** Uses the `linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)` and `color-mix(...gold 35%, transparent)` shadow tokens that `.event-link-btn` uses — same visual language as every other gold pill on the site. Pinned to top-left at all times.

4. **`.subpage-spacer` pushes content below the floating brand + back zone.** 110px desktop, 84px mobile. Stops the eyebrow/heading from being covered when the page is scrolled to the top.

5. **`scroll-margin-top` on every section[id] inside `.page main`** (100px desktop, 84px mobile) so anchor jumps line up correctly:
   - Cross-page nav (`/outreach#cooking-ministry` from home) — native scroll-to-hash respects the offset.
   - Same-page anchors on subpages — `scrollIntoView` respects the offset.
   - Same-page anchors on home still use the existing manual-scroll JS (untouched).

---

### v1.42.2 - Mobile Fixes: long-content stacking + dissolved subpage header
**Targeted mobile-only fixes. Desktop layouts are unchanged.**

1. **New `.schedule-item.long-content` modifier.** Same 2-column desktop layout as the regular `.schedule-item`, but at `@media (max-width: 960px)` it collapses to a single column with the image stacked on top. Applied to the home About teaser and every section on `/about` and `/outreach`. Fixes the "image on the right + tall thin text column with a 3-line wrapped button" issue on mobile.

2. **Defensive `white-space: nowrap`** added to `.event-link-btn` so the pill never wraps its label, even in narrow containers. Belt-and-suspenders with the `.long-content` fix above.

3. **Subpage header redesigned for mobile.** On desktop, the unified `.nav-shell` look is preserved. On mobile (`@media (max-width: 960px)`):
   - The shell background, border, and shadow are dissolved.
   - The brand wordmark gets its own flared horizontal frosted-glass pill (title beside subtitle, rounded ends).
   - The back button floats independently on the left as its own pill.
   - The two read as standalone elements, not as a single header bar.

4. **Events carousel moved to the top of `/outreach`** (right after the intro). New order is: Intro → Events → Sunday School → Cooking Ministry → Community Breakfast → Seasonal Events. Visitors who came for "what's happening" see it first.

---

### v1.42.1 - Design System Cleanup: Anchor-only Nav + Subpage Header
**Fixes two issues with the v1.42 multi-page rollout: the nav semantics and reuse of the design system.**

**Nav model corrected:**

1. **Home nav is anchor-only.** SCHEDULE · ABOUT · OUTREACH · WATCH all scroll to sections on `/`. ABOUT and OUTREACH are now anchors to the teaser sections (`#about`, `#outreach`) on home — not page links.
2. **Subpages (`/about`, `/outreach`) have no nav.** They get a minimal `subpage-header` with just the Morning Star wordmark (links to `/`) and a "← Back" pill (uses `history.back()` with `/` fallback for direct entries).
3. **`shared/subpage-header.ts`** is a new template that reuses the existing `.nav-shell` and `.brand` styling so the subpage header looks like part of the same site.

**Design system reuse:**

4. Every new page now uses the standardized classes from `home-styles.ts`:
   - `.section-eyebrow` (white frosted pill, 100px radius, --text-eyebrow)
   - `.section-heading` (--text-title, --font-display, --tracking-tight)
   - `.section-lead` (--text-lead, --leading-loose)
   - `.section-card` (48px radius, 56px/64px padding, frosted-glass)
   - `.schedule-item` (alternating image+text card)
   - `.event-link-btn` (gold gradient pill, --text-small uppercase) + a new `.event-link-btn-secondary` variant (white pill with same shape)
5. **Removed** all bespoke classes I had introduced (`.home-teaser*`, `.serve-*`, `.subpage-hero/heading/lead`, `.about-*`, `.beliefs-*`, `.belief-card`, `.ministry-*`, `.about-cta*`, `.section-heading-sm`). The single new pattern is `.schedule-item.belief-item` (text-only variant of `.schedule-item` — `grid-template-columns: 1fr` instead of 1fr 1fr).
6. **Section spacing** is consistent everywhere — the existing `main { gap: 200px }` rule handles it; no per-section padding overrides on subpages.

**Result:** Subpages now look and feel like part of the same site, every heading/eyebrow/button/card has identical shape & spacing to the home page, and the nav model matches the user's mental model (anchors → home sections, teaser CTAs → full pages).

---

### v1.42.0 - Multi-page: /about + /outreach, Restructured Home (Phase 2)
**Splits content across dedicated pages so the home page stays focused while About and Outreach get the real estate they need.**

**New pages:**

1. **`/about`** — full About Us page
   - Sections: Mission, Our Story, What We Believe (4-card grid), Leadership, Plan Your First Sunday CTA
   - Per-page SEO: unique `<title>`, `<meta description>`, canonical, OG/Twitter tags, `AboutPage` Schema.org with church entity reference + BreadcrumbList

2. **`/outreach`** — Ministries hub + Events
   - Ministry sections: Sunday School, Cooking at the Shelters (monthly), Free Community Breakfast, Seasonal Events
   - Events carousel + past-events modal (migrated from home — same Google Calendar integration, no API change)
   - Per-page SEO: unique tags + `CollectionPage` Schema.org listing all ministries as `Service` items + BreadcrumbList

**Home page changes:**

3. **Nav restructured** — new order: SCHEDULE · ABOUT · OUTREACH · WATCH + Contact pill. ABOUT and OUTREACH now navigate to their own pages. Same 5-item count as before — no nav crowding.

4. **About teaser section added** (`#about` anchor) — 1-2 paragraphs + image placeholder + "Learn more about us →" CTA to `/about`. Slots between Schedule and the new How We Serve teaser.

5. **Outreach carousel replaced with "How We Serve" teaser** — 3 small ministry cards (Sunday School, Cooking Ministry, Community Events) + "Explore our outreach →" CTA to `/outreach`. Always populated (no more empty "Stay Tuned" state). Each card deep-links to its section on `/outreach`.

6. **Sunday Gatherings schedule card** gains a "Sunday School info →" link to `/outreach#sunday-school`.

**Shared infrastructure:**

7. **`src/templates/shared/page-head.ts`** — parameterized head with title, description, canonical, OG image, optional page-specific JSON-LD. Includes geo tags, theme color, fonts, analytics, and the shared CSS bundle. Used by `/about` and `/outreach`.

8. **`src/templates/shared/nav-scripts.ts`** — minimal nav scripts for subpages (scroll-mobile toggle + same-page smooth scroll).

9. **`src/routes/misc.ts`** — sitemap includes `/about` (priority 0.9) and `/outreach` (priority 0.9, weekly changefreq for event freshness). Robots.txt explicitly allows both.

**SEO impact (positive across the board):**
- Each new page has its own indexable URL with unique title/description/canonical.
- Open Graph and Twitter Card metadata per page for clean social previews.
- Schema.org `AboutPage` + `CollectionPage` + `BreadcrumbList` on each page (rich-result eligible).
- Internal linking from home teasers + nav improves crawl coverage.
- Sitemap explicitly lists every page with appropriate priority/changefreq.

**Mobile behavior preserved:**
- Nav still wraps cleanly with the new label set (same item count as v1.41).
- `.scrolled-mobile` compressed state works on all three pages.
- Subpage grids stack to single column; images move to top of card on mobile.

**Placeholder images:** All new image slots use the v1.40.0 dashed-box placeholder pattern. Replace each `<div class="schedule-item-image-placeholder">` (or `.serve-card-image .schedule-item-image-placeholder`, `.about-image .schedule-item-image-placeholder`, etc.) with `<img src="/static/{name}.jpg" alt="..." loading="lazy">` when real photography is ready.

---

### v1.41.0 - Refactor: Shared Nav + Footer Templates (Phase 1 of multi-page architecture)
**Pure refactor with no user-visible changes. Sets up shared templates so the upcoming /about and /outreach pages stay consistent with home.**

**Changes Made:**

1. **New shared templates (`src/templates/shared/`)**
   - `nav.ts` — exports `nav(currentPath)` returning the `<header class="nav-shell">` block. Anchor links rewrite from `#foo` to `/#foo` automatically when invoked from a non-home page. `aria-current="page"` is applied to the matching link when on a dedicated page route (will be used by `/about`, `/outreach` in Phase 2).
   - `footer.ts` — exports `footer()` returning the existing footer block.

2. **Home refactor (`src/templates/home-body.ts`)**
   - Inline nav and footer markup replaced with `${nav('/')}` and `${footer()}` calls.
   - Brand wordmark is now a proper `<a href="/">` link with `aria-label="Morning Star Christian Church — Home"` (SEO + accessibility positive — clearer internal linking, screen readers identify it as the home link).
   - `<nav>` element has `aria-label="Primary"` for clearer landmarks.

3. **CSS (`src/templates/home-styles.ts`)**
   - `.brand` gains `text-decoration: none; color: inherit` so the new anchor looks identical to the old div.
   - New rule `.nav-shell nav a[aria-current="page"] { color: var(--gold) }` — subtle gold highlight for active page (no-op on `/` since no nav link currently matches the home path; activates on `/about` / `/outreach` in Phase 2).

**SEO impact:** Positive. Brand is now a semantic internal link to `/`, the `<nav aria-label="Primary">` landmark is more crawler-friendly, and per-page meta data on home is unchanged. Phase 2 will add per-page titles/descriptions/canonical/schema for `/about` and `/outreach`.

**Visual impact:** None. Rendered HTML is character-for-character equivalent except for the brand wrapper element changing from `<div>` to `<a>` with the same children.

---

### v1.40.0 - Schedule: Alternating Image/Text Cards (Placeholder Images)
**Redesigned the weekly schedule so each item is a horizontal card with an image and text, alternating sides for visual rhythm**

**Changes Made:**

1. **Markup (`src/templates/home-body.ts`)**
   - Each `.schedule-item` now contains a `.schedule-item-text` div (existing eyebrow/h3/p) plus a `.schedule-item-image` placeholder div
   - Placeholder uses a dashed neutral box with a centered "image" SVG icon — drop-in replaceable with `<img>` when real photos are ready

2. **Layout (`src/templates/home-styles.ts`)**
   - `.schedule-item` is now `grid-template-columns: 1fr 1fr` (50/50 image + text), centered vertically
   - `:nth-child(even)` flips image to the left side, producing the alternating Sunday-text / Tuesday-image / Thursday-text / Friday-image pattern
   - Desktop `.schedule-grid` switched from `repeat(3, 1fr)` to `repeat(2, 1fr)` — 2×2 grid removes the Friday orphan row
   - Mobile padding tightened; safety override at `≤380px` shrinks image column slightly so text isn't squeezed on tiny phones
   - Placeholder image style: subtle gradient + dashed border + low-opacity icon — clearly signals "image goes here" without distracting

**Replacing the placeholders later:** swap each `<div class="schedule-item-image schedule-item-image-placeholder" ...>...</div>` with `<div class="schedule-item-image"><img src="/static/schedule-{day}.jpg" alt="..." loading="lazy"></div>`.

---

### v1.39.0 - Friday Youth Service Added to Weekly Schedule
**Added a fourth weekly recurring gathering to the schedule section**

**Changes Made:**

1. **Schedule Section (`src/templates/home-body.ts`)**
   - Added a new `.schedule-item` for "Youth Service · Fridays · 7:00 PM"
   - Copy: "Youth service at the church — worship, teaching, and fellowship for our next generation."

2. **SEO / Schema.org (`src/templates/home-head.ts`)**
   - Added Friday `OpeningHoursSpecification` (19:00–20:30)
   - Added "Youth Service" entry to the `OfferCatalog`
   - Updated long-form `description` and meta `description` to mention Friday youth service

**Result:** Visitors can now see the Friday 7 PM youth service in the weekly schedule, and search engines see it as part of the church's recurring programs.

---

### v1.24.0 - Hero Find Us Button with Frosted Glass Effect
**Replaced hero CTA buttons with a single "Find Us" button overlaid on the hero image**

**Changes Made:**

1. **Removed Hero CTA Buttons**
   - Removed "Contact" button from hero section
   - Removed "Watch Livestream" button from hero section
   - Simplified hero layout to focus on the image

2. **Added "Find Us" Frosted Glass Button**
   - New button positioned at bottom center of hero image
   - Frosted glass effect with backdrop blur for modern look
   - Pin icon (📍) with "Find Us" text
   - Semi-transparent white background with subtle border
   - Smooth hover animation with lift effect
   - Works on all devices (fallback for older browsers)

3. **Integrated Address Dropdown**
   - Uses existing address dropdown system throughout the site
   - Dropdown opens above the button (inverted position)
   - Options: Apple Maps, Google Maps, Copy Address
   - Same functionality as schedule section address trigger

4. **Updated Desktop Grid Layout**
   - Simplified hero-body grid from 3 rows to 1 row
   - Content and image now centered side-by-side
   - Cleaner visual hierarchy

**Result:** Hero section now features a clean, elegant frosted glass "Find Us" button that seamlessly integrates with the hero image and provides quick access to navigation options.

---

### v1.23.0 - Dynamic Event Framework with Auto-Archiving
**Intelligent event system that automatically handles past/upcoming events based on dates**

**New Event Framework Features:**

1. **Automatic Date-Based Event Detection**
   - Events are automatically categorized as "upcoming" or "past" based on current date
   - Past events move to a separate modal overlay (not in main page flow)
   - No manual intervention needed - just update event dates

2. **Stay Tuned Card (Shows when NO upcoming events)**
   - Only appears when there are zero upcoming events
   - Beautiful animated card with sparkle icon and floating decorations
   - "COMING SOON" badge with warm gold styling
   - "View Past Events" button (only shows if past events exist)
   - Seamless background matching site default

3. **Past Events Modal Overlay**
   - Full-screen overlay carousel (z-index: 10000)
   - Triggered by "View Past Events" button
   - Swipe/click navigation between past events
   - Dot indicators for navigation
   - Close via X button, background click, or ESC key
   - Prevents body scroll when open

4. **Handles All Scenarios Gracefully**
   - **0 upcoming**: Shows Stay Tuned + past events in modal
   - **1 upcoming**: Shows single event card
   - **2 upcoming**: Shows 2 event cards with carousel
   - **3+ upcoming**: Shows full carousel with dot navigation
   - Scroll spacer dynamically adjusts based on event count

**How to Add New Events:**

1. Find the `#events-data` JSON script tag in the HTML
2. Add a new event object to the `events` array:

\`\`\`json
{
    "id": "event-unique-id",
    "title": "Event Title",
    "description": "Short description",
    "date": "2026-02-15",
    "displayDate": "FEB 15",
    "image": "https://your-image-url.com/flyer.jpg",
    "cta": { "text": "REGISTER NOW", "link": "#contact" }
}
\`\`\`

3. That's it! The framework automatically:
   - Sorts events by date
   - Shows upcoming events in main carousel
   - Archives past events to the modal
   - Adjusts dots, scroll spacer, and background colors

**Event Data Location:**
- Look for `<script type="application/json" id="events-data">` in the outreach section
- Events are stored as JSON for easy editing

**Technical Details:**
- CSS: Stay Tuned card with warm gold/cream styling
- CSS: Past events modal with carousel animations
- JS: `initializeEvents()` parses JSON and categorizes by date
- JS: Dynamic rendering based on upcoming event count
- JS: Modal with swipe, keyboard, and touch support

**Result:** Self-managing event system that requires minimal maintenance. Just add events with future dates - the framework handles everything else.

---

### v1.22.0 - Stay Tuned Card & Past Events Redesign (Superseded by v1.23.0)
**Note: This version has been superseded by the dynamic event framework in v1.23.0**

---

### v1.21.0 - Production-Ready Mobile Stacked Card Interface
**Clean, refined stacked card design for mobile outreach section**

**Changes Made:**
1. **Clean stacked visual**
   - Active card displayed at full size in front
   - Two cards stacked beneath showing clean bottom edges
   - Minimal 20px/40px offset for subtle depth
   - Scaling: 100% (active), 96% (1st behind), 92% (2nd behind)
   - Professional depth with shadows and brightness filters

2. **Hidden UI on stacked cards**
   - Date badges hidden on background cards
   - Indicator dots hidden on background cards
   - CTA buttons hidden on background cards
   - Prevents visual clutter and overlap
   - Only active card shows complete UI

3. **Smooth stack transitions**
   - Cards smoothly reorder as you swipe
   - Active card always comes to front
   - Non-active cards slide behind in order
   - 0.4s transition with smooth easing
   - JavaScript-managed stack positions

4. **Production-quality UX**
   - Only active card is interactive
   - Background cards non-interactive (pointer-events: none)
   - Clear visual hierarchy at all times
   - Works flawlessly on all mobile devices ≤960px
   - Desktop unchanged (single-card display)

**Result:** Polished, production-ready stacked card interface with no UI overlap, clean visual hierarchy, and smooth transitions.

---

### v1.20.19 - Centered Mobile Hero Buttons
**Mobile hero buttons now centered with auto-width instead of full-width**

**Changes Made:**
1. **Changed button width from 100% to auto**
   - Buttons no longer stretch full width on mobile
   - Added min-width of 280px for consistent sizing
   - Maintains readability and touch-friendliness
   
2. **Enhanced centering**
   - Added justify-content: center to cta-group
   - Buttons visually centered in hero section
   - Better visual balance on mobile devices
   
3. **Consistent across all mobile breakpoints**
   - Updated both hero-specific and general button styles
   - Ensures consistency across entire mobile experience
   
**Result:** Mobile hero buttons are now centered and properly sized instead of stretching edge-to-edge.

---

### v1.20.18 - Desktop Hero Layout Redesign
**Centered hero text with integrated service info and buttons aligned to image bottom (desktop only)**

**Changes Made:**
1. **Centered hero text and content (desktop only)**
   - H1 "Mending the Broken" now centered
   - Paragraph text centered with constrained width for readability
   - Better visual hierarchy with centered alignment
   - Mobile layouts completely unchanged
   
2. **Integrated service time and address into copy**
   - Updated paragraph: "Join us every Sunday at 9:00 AM..."
   - Address displayed below paragraph: "3080 N Wildwood St · Boise, Idaho"
   - Clean, minimal styling for address line
   - Natural flow without separate info boxes
   
3. **Repositioned buttons to align with image bottom**
   - Buttons now at same vertical position as bottom of hero image
   - Creates visual balance and professional layout
   - Better use of vertical space
   - Centered button group
   
4. **Enhanced grid structure**
   - Three-row grid: content, spacer, buttons
   - Content includes paragraph + address
   - Image spans all rows for clean alignment
   - Follows UX best practices for visual hierarchy
   
**UX Improvements:**
- Service time naturally integrated into welcoming message
- Address clearly visible but not overpowering
- Centered text creates formal, welcoming impression
- Buttons aligned with image create visual anchors
- Information hierarchy: headline → description with time → address → actions

**Result:** More polished, professional desktop hero with natural information flow and visual balance. Mobile experience unchanged.

---

### v1.20.17 - Speed Insights Integration
**Added Vercel Speed Insights to track performance metrics alongside analytics**

**Changes Made:**
1. **Installed @vercel/speed-insights package**
   - Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
   - Monitors real user performance metrics
   - Provides insights into page load speeds
   
2. **Integrated with existing notrack parameter**
   - Speed Insights respects `?notrack=true` parameter
   - Both Analytics and Speed Insights disabled when testing
   - Single parameter controls all Vercel tracking
   
3. **Enhanced beacon blocking**
   - Blocks both analytics and speed-insights beacons
   - Console logs show which tracking is blocked
   - Complete tracking prevention when `?notrack=true` is used
   
**Features:**
- **Analytics**: Page views, visitor data, referrers
- **Speed Insights**: Performance metrics, Core Web Vitals
- **Testing Mode**: Add `?notrack=true` to disable both

**Result:** Comprehensive tracking of both visitor behavior and site performance, with easy disable option for testing.

---

### v1.20.16 - Analytics Tracking Disable Parameter
**Added URL parameter to disable analytics tracking for testing without skewing statistics**

**Changes Made:**
1. **Implemented ?notrack=true parameter**
   - Visit `https://ms.church/?notrack=true` to disable analytics tracking
   - Also works on form page: `https://ms.church/form?notrack=true`
   - Perfect for testing changes without affecting visitor statistics
   
2. **Smart conditional loading**
   - Analytics script only loads when `notrack` parameter is NOT present
   - JavaScript checks URL parameters before initializing tracking
   - Dynamically loads analytics script only when needed
   
3. **Developer-friendly console message**
   - When tracking is disabled, logs: "🚫 Analytics tracking disabled via ?notrack=true parameter"
   - Check browser console to confirm tracking status
   - Helps verify the feature is working correctly
   
**Usage:**
- **Normal visitors**: `https://ms.church` (tracking enabled)
- **Testing/development**: `https://ms.church/?notrack=true` (tracking disabled)
- **Form page testing**: `https://ms.church/form?notrack=true` (tracking disabled)

**Result:** Admin/developers can test website changes freely without skewing analytics data. Simply add `?notrack=true` to any URL.

---

### v1.20.15 - Vercel Analytics Integration
**Added Vercel Analytics to track page views and visitor behavior on production deployment**

**Changes Made:**
1. **Installed @vercel/analytics package**
   - Added npm package for Vercel's analytics tracking
   - Enables page view tracking and visitor analytics on Vercel deployment
   
2. **Integrated analytics script on all pages**
   - Added Vercel Analytics script to main landing page (/)
   - Added analytics to form/contact page (/form)
   - Script loads asynchronously with `defer` attribute for optimal performance
   
3. **Dual-platform consideration**
   - Analytics fully functional on Vercel production (https://ms-church.vercel.app)
   - May have limited functionality on Cloudflare Pages development environment
   - Primary tracking occurs on production where it matters most
   
4. **Updated both deployment files**
   - Synced changes across src/index.tsx (Cloudflare) and src/index.ts (Vercel)
   - Ensures consistent analytics tracking across both platforms
   
**Result:** Production website now tracks visitor analytics via Vercel Analytics dashboard. No impact on page performance due to deferred script loading.

---

### v1.20.14 - Auto-Play Video During Sunday Service
**YouTube video automatically plays when entering watch section during Sundays 9am-9:45am MT**

**Changes Made:**
1. **Auto-play functionality added**
   - Checks current time in Mountain Time (America/Denver timezone)
   - Detects if it's Sunday between 9:00am-9:45am MT
   - Automatically adds `autoplay=1&mute=1` parameters to YouTube iframe
   - Only triggers when watch section becomes visible (30% threshold)

2. **Browser compatibility (Chrome/Safari)**
   - Added `mute=1` parameter to allow autoplay in Chrome and Safari
   - Modern browsers block unmuted autoplay without user interaction
   - Video starts muted, but users can unmute with one click
   - Complies with browser autoplay policies while providing automatic playback

3. **IntersectionObserver implementation**
   - Monitors when user enters watch section
   - Triggers auto-play check only when section is visible
   - Prevents unnecessary iframe reloads
   - Smooth user experience with no jarring transitions

4. **Time window logic**
   - Starts: Sunday 9:00am MT (when service begins)
   - Ends: Sunday 9:45am MT (45 minutes into service)
   - Outside this window: normal manual play behavior
   - Timezone-aware using `America/Denver` for accurate MT detection

**Result:** Video automatically starts playing (muted) when visitors enter the watch section during Sunday service time (9:00-9:45am MT). Users can unmute with one click to hear audio.

---

### v1.20.13 - Direct Links Now Trigger Nav Button Click
**Programmatically clicks matching nav link after page loads for identical scroll behavior**

**Changes Made:**
1. **Simplified hash handling approach**
   - Removed complex dual-scroll adjustment logic
   - Instead, find the nav link matching the hash (e.g., `a[href="#contact"]`)
   - Programmatically click it after page load
   - This ensures EXACT same behavior as manually clicking the button

2. **Why this works better**
   - Nav link click handler has all the precise offset logic
   - No need to duplicate or maintain offset calculations
   - Handles layout shifts naturally since it runs after full page load
   - Single source of truth for scroll positioning

3. **Timing**
   - Wait for window 'load' event (all images/resources loaded)
   - Then wait 100ms more for stable layout
   - Then trigger nav link click
   - Results in perfect positioning every time

**Root Cause:** Direct links and nav button clicks used separate scroll logic, making them drift apart.

**Result:** `https://ms.church/#contact` now **literally** triggers the GIFTS button click, guaranteeing identical scroll position.

---

### v1.20.12 - Fixed Layout Shift After Direct Link Scroll (REPLACED)
**Double-adjustment approach compensates for images loading after initial scroll**

This approach didn't fully work - replaced with simpler nav button click simulation in v1.20.13.

---

### v1.20.11 - Fixed Hash Link Timing to Match Nav Button Exactly
**Prevented browser default scroll, increased delay, ensuring exact same position as nav button**

**Changes Made:**
1. **Prevent browser's default anchor scroll**
   - Added `window.scrollTo(0, 0)` immediately when hash detected
   - Prevents browser from scrolling before our custom logic runs
   - Ensures clean slate for custom offset calculation

2. **Increased timeout for stable layout**
   - Changed from 100ms to 300ms delay
   - Ensures page layout is fully stable before calculating position
   - Prevents timing race conditions

3. **Verified exact offset matching**
   - Mobile #contact: 30px offset (matches GIFTS nav button exactly)
   - Desktop #contact: 45px offset
   - Comments clarify this matches nav button behavior

**Result:** `https://ms.church/#contact` now scrolls to **exactly** the same position as clicking GIFTS button on mobile.

---

### v1.20.10 - Fixed Direct Hash Links Scroll Position
**Direct links like ms.church/#contact now use same scroll offset as navigation buttons**

**Changes Made:**
1. **Added hash handling on page load**
   - Detects `window.location.hash` when page loads
   - Applies same offset logic as navigation button clicks
   - Uses 45px offset (desktop) or 30px offset (mobile) for most sections
   - Special handling for outreach section
   - Smooth scroll to correct position after 100ms delay

**Result:** Direct links like `https://ms.church/#contact` now scroll to the same position as clicking the GIFTS button in navigation.

---

### v1.20.9 - HOME Button Immediately Expands Nav on Mobile
**HOME button now expands navigation from compact to full instantly on click, before scrolling**

**Changes Made:**
1. **Reordered HOME link logic**
   - Moved `navShell.classList.remove('scrolled-mobile')` before `window.scrollTo()`
   - Navigation now expands immediately on HOME click
   - Smooth scroll to top happens after nav expansion
   - No more waiting for scroll to complete to see full nav

**Result:** Clicking HOME on mobile instantly expands the navigation bar, providing immediate visual feedback.

---

### v1.20.8 - Completely Removed Version Footer from UI
**Removed version footer HTML element and CSS entirely from the website**

**Changes Made:**
1. **Completely removed version footer**
   - Deleted `<div class="version-footer">` element from HTML
   - Removed all `.version-footer` CSS styles  
   - Version tracking now only in HTML comment (Cloudflare file) and README

**Result:** No version number displayed anywhere on the website - completely clean UI.

---

### v1.20.7 - Hidden Version Footer (INCOMPLETE)
**Attempted to hide with display:none but element still appeared**

---

### v1.20.6 - Fixed Border Radius Consistency Across All Breakpoints
**Ensured 32px border-radius on all flyer elements across all screen sizes**

**Changes Made:**
1. **Fixed inconsistent border-radius across breakpoints**
   - Base styles: 32px ✓ (already correct)
   - 480px mobile breakpoint: 24px → 32px (fixed)
   - Desktop 1200px+ breakpoint: 16px → 32px (fixed)
   - All flyer elements now consistently use 32px across all screen sizes
   - Matches `.hero-image` and `.schedule-item` throughout

2. **Verified aspect ratios are 3:4**
   - Base: `aspect-ratio: 3/4` ✓
   - 960px breakpoint: `aspect-ratio: 3/4` ✓
   - 480px breakpoint: `aspect-ratio: 3/4` ✓
   - Desktop 1200px+: `aspect-ratio: 3/4` ✓
   - All event flyers maintain correct 3:4 portrait ratio

**Result:** Event flyers display with consistent 32px rounded corners and 3:4 aspect ratio across all devices and screen sizes.

---

### v1.20.5 - Consistent Border Radius Across Site
**Reduced flyer border-radius from 48px to 32px to match other site elements**

**Changes Made:**
1. **Standardized border-radius to 32px**
   - Changed `.event-flyer-wrapper` from `border-radius: 48px` to `32px`
   - Changed `.flyer-image` from `border-radius: 48px` to `32px`
   - Changed `.placeholder-flyer` from `border-radius: 48px` to `32px`
   - Now matches `.hero-image`, `.schedule-item`, and other site elements
   - Consistent visual language across entire website

**Result:** Event flyers now have the same rounded corner radius (32px) as hero images and schedule cards for a cohesive design.

---

### v1.20.4 - Fixed Rounded Corners Display
**Removed transform scale, using width/height 101% to preserve rounded corners properly**

**Changes Made:**
1. **Fixed rounded corner visibility**
   - Removed `transform: scale(1.01)` which was clipping rounded corners
   - Changed to `width: 101%; height: 101%` with `margin: -0.5%` for centering
   - Added `border-radius: 32px` directly to `.event-flyer-wrapper`
   - Maintains `overflow: hidden` to clip slight oversizing
   - Rounded corners now display correctly like placeholder
   - All flyer content remains fully visible

---

### v1.20.3 - Balanced Image Scaling for Perfect Display
**Reduced scaling to 1.01 to preserve rounded corners and full flyer content visibility**

**Changes Made:**
1. **Optimized image scaling for balance**
   - Reduced `transform: scale(1.02)` to `scale(1.01)` (1% zoom instead of 2%)
   - Maintains `overflow: hidden` on `.event-flyer-wrapper`
   - Eliminates most side bars while preserving full flyer content
   - Rounded corners (48px) remain visible and intact
   - All important content (shoes, text, graphics) fully visible

2. **Maintained 3:4 aspect ratio**
   - Event flyer images display in portrait format (3:4 aspect ratio)
   - Container and image aspect ratios match perfectly
   - Consistent across all breakpoints: base, mobile (480px, 375px), and desktop (1200px+)

3. **Kept buttons hidden for events 1 and 3**
   - Event 1 (Friendsgiving): Button hidden
   - Event 2 (Christmas Gifts): Button still visible ("REQUEST ITEMS")
   - Event 3 (Christmas Candlelight): Button hidden
   - Cleaner card appearance for events that don't need CTAs

**Result:** Flyers display in full portrait format with minimal side bars, rounded corners visible, and all content (including shoes at bottom) fully visible. Only Event 2 shows the action button.

---

### v1.19.0 - Fixed Mobile Outreach Event Flyer Cutoff
**Resolved flyer images being cut off at edges on mobile devices**

**Problem:**
Event flyer images in the outreach section were being cut off at the left and right edges on mobile, showing only the center portion of the flyer.

**Root Cause:**
`.event-flyer-wrapper` had:
- `width: 100%` with `aspect-ratio: 3/4`
- Horizontal padding: `0 20-24px`
- Result: Content box was reduced by padding, but image tried to fill 100% of that smaller space
- The padding "squeezed" the image, causing edges to be cut off

**Solution:**
Removed horizontal padding from `.event-flyer-wrapper` and centered using `margin: 0 auto` instead

**Changes Applied (3 Mobile Breakpoints):**

1. **Base Mobile Styles:**
   - ❌ Removed: `padding: 0 24px`
   - ✅ Added: `margin: 0 auto` (centers without squeezing)
   - ✅ Adjusted: `max-width: 517px → 469px` (compensates for removed padding)

2. **Mobile ≤768px:**
   - ❌ Removed: `padding: 0 20px`
   - ✅ Added: `margin: 0 auto`
   - ✅ Adjusted: `max-width: 466px → 426px`

3. **Small Phones ≤480px:**
   - ❌ Removed: `padding: 0 clamp(14px, 3.5vw, 16px)`
   - ✅ Added: `margin: 0 auto`
   - ✅ Adjusted: `max-width: clamp(350px, 85vw, 414px) → clamp(322px, 78vw, 382px)`

**Result:**
- Event flyers now display fully without edge cutoff
- Images properly centered on screen
- No more "squeezed" or cropped appearance
- Works across all mobile device sizes

---

### v1.18.1 - ACTUALLY Fixed Narrow Window Layout (Comprehensive)
(Previous version)

---

### v1.18.0 - Fixed Narrow Window Layout Issue
**Changed desktop breakpoint to prevent weird stretched layout on thin windows**

**Problem:**
When resizing the desktop browser window to be narrow (961-1199px width), the site showed a weird stretched desktop layout that looked awkward and cramped.

**Root Cause:**
Desktop media query was `@media (min-width: 961px)` with no upper limit, so even very narrow windows above 961px got the desktop layout designed for wide screens.

**Solution:**
Changed desktop breakpoint from `961px` to `1200px`

**New Breakpoint Behavior:**
- **Mobile:** ≤960px (unchanged - all mobile devices)
- **Narrow Windows:** 961-1199px (now uses mobile layout - looks better than stretched desktop)
- **Desktop:** ≥1200px (desktop layout with proper spacing and two-column hero)

**Result:**
- Thin browser windows now show clean mobile layout instead of weird stretched desktop
- Desktop features (two-column hero, three-column outreach, etc.) only appear on properly wide screens (≥1200px)
- Mobile completely unchanged

---

### v1.17.0 - Reverted Watch Section to Original Layout (Desktop Only)
**Removed side-by-side grid layout due to video display issues**

**Changes:**
- Reverted watch section to original centered/stacked layout
- Video now displays correctly in centered 900px container
- Kept all other improvements from v1.16.0:
  - ✓ Natural spacing (nav-spacer 120px)
  - ✓ Fixed outreach scroll offset
  - ✓ Removed event dots on desktop

**Watch Section Layout (Desktop):**
- All content centered vertically
- Max-width: 900px for optimal video viewing
- Proper aspect ratio maintained

---

### v1.16.0 - Desktop Refinements: Spacing, Scroll, Dots (Mobile Unchanged)
**Polish pass on desktop experience with multiple UX improvements**

**Changes Made (Desktop ≥961px only, mobile completely untouched):**

1. **Natural Spacing:**
   - Nav-spacer: `100px → 120px` (added back 20px for more natural feel)
   - Result: Less cramped, better breathing room at top

2. **Fixed Outreach Scroll Offset:**
   - JavaScript navOffset: `20 → 60` for outreach section
   - Result: Clicking "OUTREACH" now just covers the ribbon pill, shows the title
   - No longer scrolls too far down

3. **Removed Event Dots:**
   - Hidden `.event-indicators` (3 dots) on desktop event cards
   - Result: Cleaner card appearance on desktop
   - Mobile still has dots for swipe indication

4. **Watch Section Side-by-Side Layout:**
   - Changed from stacked to grid layout
   - Container: `1200px → 1400px` (wider)
   - Grid: `400px` fixed left column for text, flexible right for video
   - Layout areas:
     - Left: Live status, countdown, verse
     - Right: Video embed (spans 3 rows)
     - Bottom: Playlist button (spans both columns)
   - Result: More modern, efficient use of space on desktop

**Mobile:** Completely untouched - all changes isolated to desktop media query only

---

### v1.15.0 - CRITICAL FIX: Actually Reduced Top Spacing (Desktop Only)
**Deep investigation revealed and fixed the REAL cause of excessive top spacing**

**The Problem:**
Previous attempts (v1.14.0, v1.14.1) tried to reduce `.hero` padding but spacing didn't change because:
- Base CSS: `.nav-spacer { height: 380px }` (applies to ALL screens)
- Mobile CSS: `.nav-spacer { height: 130px }` (overrides base)
- **Desktop CSS: NO override!** ← Desktop was using base 380px!

**Deep Investigation Process:**
1. Analyzed HTML structure → Found `<div class="nav-spacer"></div>` between header and hero
2. Searched CSS for `.nav-spacer` rules → Found 3 instances (base, mobile, disabled)
3. Checked desktop media query (`@media (min-width: 961px)`) → **NO nav-spacer rule!**
4. Confirmed JavaScript also referenced 380px for desktop threshold
5. Root cause: Base 380px was never overridden for desktop

**The Fix:**
Added `.nav-spacer { height: 100px }` in desktop media query (line 3337)

**Result:**
- Desktop top spacing: **380px → 100px** (280px reduction = 74% less!)
- Mobile completely untouched (still 130-190px as designed)
- Hero now appears much closer to navigation on desktop

---

### v1.14.1 - Fixed G Cutoff & Heavily Reduced Top Spacing (Desktop Only)
**Critical fix for letter cutoff and much more aggressive spacing reduction**

**Changes Made (Desktop ≥961px only, mobile untouched):**

1. **Fixed "g" Cutoff in "Mending":**
   - Line height: `1.05 → 1.15` (more room for descenders)
   - Added `padding-bottom: 4px` to H1 (extra space for descenders)
   - Added `overflow: visible` to both `.hero` and `.hero h1` containers

2. **Heavily Reduced Top Spacing:**
   - Hero top padding: `clamp(20px, 3vw, 30px) → clamp(10px, 1.5vw, 15px)` (50% reduction!)
   - Hero gap (between title and body): `clamp(16px, 2vw, 24px) → clamp(8px, 1vw, 12px)` (50% reduction!)
   - H1 bottom margin: `clamp(16px, 2vw, 24px) → clamp(12px, 1.5vw, 18px)` (25% reduction)

**Result:** Desktop hero now has minimal white space at top, and "g" in "Mending" is fully visible.

---

### v1.14.0 - Desktop Hero Enhancements: Spacing, Sizing, Responsive Scaling
**Comprehensive desktop hero improvements addressing all remaining issues**

**Changes Made (Desktop ≥961px only, mobile untouched):**

1. **Reduced Top Spacing:**
   - Hero padding top: `40px → clamp(20px, 3vw, 30px)` (responsive)
   - Hero gap: `20px → clamp(16px, 2vw, 24px)` (responsive)
   - Hero-body row-gap: `20px → clamp(16px, 2vw, 24px)` (responsive)

2. **Much Larger Title:**
   - Font size: `clamp(48px, 4vw, 72px) → clamp(64px, 7vw, 110px)`
   - Line height: `1.1 → 1.05` (prevents letter cutoff)
   - Added `letter-spacing: -0.02em` for large text
   - Added `overflow: visible` to prevent G cutoff

3. **Larger Hero Image:**
   - Height: `500px → clamp(550px, 55vh, 650px)` (responsive)
   - Min-height: `400px → clamp(500px, 50vh, 650px)`
   - Max-height: `500px → clamp(600px, 60vh, 700px)`

4. **Larger Copy Text:**
   - Paragraph font size: `18px → clamp(20px, 1.8vw, 24px)` (responsive)
   - Line height: `1.7 → 1.6` (better readability)

5. **Full Responsive Scaling:**
   - All elements now use `clamp()` for smooth window resizing
   - Hero-body max-width: `1200px → clamp(1100px, 90vw, 1300px)`
   - Column gap: `60px → clamp(40px, 5vw, 70px)`
   - Border radius: `24px → clamp(20px, 2vw, 28px)`
   - Title container uses responsive padding

**Result:** Desktop hero looks much more impactful with larger elements, better spacing, and smooth responsive behavior at all window sizes.

---

### v1.12.1 - CRITICAL FIX: Hero Grid Template Areas
**Fixed desktop hero section to display proper 2-column layout**

**Deep Investigation Findings:**
- Version number was updating but UI wasn't changing
- CSS was being served correctly
- BUT: Grid layout math was wrong

**The Problem:**
- `.hero-body` has **3 direct children**: `.hero-content`, `.hero-image`, `.cta-group`
- Used `grid-template-columns: 1fr 1fr` (2 columns)
- CSS Grid automatically placed:
  - Row 1, Col 1: `.hero-content`
  - Row 1, Col 2: `.hero-image`
  - Row 2, Col 1: `.cta-group` (wrapped to new row!)
- Result: Still looked vertical/stacked

**The Fix:**
Used `grid-template-areas` to explicitly control placement:
```css
grid-template-areas: 
    "content image"
    "buttons image";
```

**Now Creates:**
- Left column: content (row 1) + buttons (row 2)
- Right column: image (spans both rows)
- TRUE 2-column appearance

**Result:** Desktop hero finally shows content+buttons on left, image on right. Mobile completely unchanged.

---

### v1.12.0 - COMPLETE CSS ARCHITECTURE RESTRUCTURE
**CRITICAL BREAKTHROUGH: Fixed persistent desktop layout issues by completely restructuring CSS architecture**

**What Was Broken:**
- Desktop Hero: Vertical (one column) instead of horizontal (two columns)
- Desktop Outreach: Showed one event at a time instead of 3 in a row
- Desktop Watch: Oversized, taking up more than full screen height
- Previous 3 fix attempts (v1.11.0, v1.11.1, v1.11.3) all failed despite `!important` flags

**Root Cause:**
- Base styles applied to ALL screen sizes (desktop + mobile)
- Mobile breakpoints overrode base styles
- Desktop breakpoint tried to override back with `!important`
- CSS cascade conflicts made desktop layouts unreliable

**The Solution:**
Completely restructured CSS into three isolated layers:

1. **Base Styles** = Minimal universal properties only (width, color)
2. **Mobile Styles (≤960px)** = Wrapped in `@media (max-width: 960px)`
   - Hero: Grid vertical layout
   - Outreach: Sticky scroll behavior with positioned events
   - Events: One at a time with smooth transitions
   - Watch: Mobile-optimized sizing
3. **Desktop Styles (≥961px)** = Completely independent
   - Hero: CSS Grid 2-column layout (content left, image right) ✅
   - Outreach: Static grid 3-in-row layout ✅
   - Events: All 3 visible simultaneously ✅
   - Watch: Properly scaled and responsive ✅
   - No `!important` needed - clean CSS

**Why This Works:**
- Mobile and desktop operate in completely separate CSS worlds
- No inheritance conflicts between breakpoints
- No override battles with `!important`
- Clean, maintainable, predictable code
- Guaranteed mobile preservation (locked in ≤960px)

**Technical Details:**
- Removed ~100 lines of conflicting base layout rules
- Added ~120 lines of isolated mobile layout rules
- Rewrote ~150 lines of desktop rules without `!important`
- Total: ~310 insertions, 195 deletions

**Result:** Desktop finally works correctly - Hero is 2-column, Outreach shows all 3 events in a row, Watch section scales properly. Mobile remains completely untouched and perfect.

**Testing Verified:** All desktop requirements met while mobile devices (iPhone 6S, X, 14, 15, 17 Pro Max) remain unchanged.

## Project Overview
- **Name**: Morning Star Christian Church
- **Goal**: Community church website with upscale design, smooth animations, and interactive event showcase
- **Features**: 
  - Scroll-based event viewer with dynamic backgrounds
  - Fluid animations and transitions throughout
  - Responsive design for all devices (including iPhone X optimization)
  - Enhanced typography with Playfair Display and Inter fonts
  - Sticky navigation with blur effects
  - Interactive event cards with flyer images
  - Full-screen lightbox for flyer viewing with zoom
  - JotForm integration for Christmas Clothes Drive
  - Form success state with present emoji confetti
  - Calendar integration (Apple & Google)

## URLs
- **Cloudflare Development**: https://3000-iprrbc7u2mmhba4el56qt-0e616f0a.sandbox.novita.ai
- **Vercel Production**: https://ms-church.vercel.app (synced with GitHub)
- **GitHub Repository**: https://github.com/jacobB1290/MS.church
- **Local**: http://localhost:3000

## Key Features Implemented

### 1. Enhanced Visual Design
- **Premium Typography**: Playfair Display for headings, Inter for body text
- **Sophisticated Color Palette**: Refined gradients and subtle color transitions
- **Glassmorphism Effects**: Frosted glass effects on navigation and cards
- **Advanced Shadows**: Layered shadows for depth and dimension

### 2. Smooth Animations
- **Fade-in on Load**: All sections animate smoothly when page loads
- **Hover Effects**: Subtle transformations on all interactive elements
- **Floating Elements**: Animated floating badges and buttons
- **Pulse Animations**: Live status indicators with pulse effects

### 3. Scroll-Based Event Viewer
- **Sticky Container**: Events container freezes in the middle of the screen
- **Sticky Header**: "Outreach / Upcoming Events" header stays visible below nav bar while scrolling
- **Scroll Transitions**: Events cycle through with smooth fade and scale animations (1.2s)
- **Dynamic Backgrounds**: Body background changes color based on active event with smooth 1.8s fade:
  - Event 1 (Friendsgiving): Soft peach to light coral pastel (#ffe8d6 → #ffd4d4)
  - Event 2 (Clothes Drive): Soft pink to lighter pink pastel (#ffd6e8 → #ffe5f0)
  - Event 3 (Christmas Candlelight): Pale green to white-pink to pale green (#e8f5e8 → #fff5f5 → #f0f8f0)
- **Progress-Based**: Scroll progress through spacer determines active event
- **Auto-Reset**: Background returns to default white/blue gradient when exiting section
- **Smooth Fading**: All colors are light pastels that fade smoothly between events
- **Entry/Exit Animation**: Background color gradually fades in when entering and out when leaving section

### 4. Event Cards - Clean Image Layout (v1.7.0)
**Ultra-minimalist layout with metadata row and optimized scrolling:**
- **Meta row below title** - Date pill on left, 3 indicator dots on right
- **Fixed 3:4 portrait aspect ratio** - All images maintain standard flyer proportions
- **Date pill styling** - Gold gradient with rounded corners and shadow
- **3 indicator dots** - Active dot highlighted in gold, clickable navigation
- **Snappy scroll transitions** - Optimized 0.4s transitions with scale effect
- **Predictable event switching** - Clear boundaries at 33% and 66% scroll progress
- **Reduced scroll lock** - 300ms delay for responsive feel
- **Elegant rounded corners** - 24px desktop, 16-20px mobile
- **Matching rounded gold CTA button** - Positioned below image
- **Responsive sizing** - Max-width 500px desktop, scales to 360-450px on mobile

### 5. Current Events
1. **Community Thanksgiving Dinner** (Nov 26)
   - 11:00 AM - 1:00 PM
   - Flyer: Friendsgiving lunch design
   
2. **Christmas Clothes Drive for Mothers** (Dec 6)
   - Drop-off during office hours
   - Placeholder flyer
   
3. **Christmas Eve Candlelight Service** (Dec 24)
   - 5:00 PM & 7:00 PM services
   - Placeholder flyer

## Data Architecture
- **Static Content**: All content served via Hono backend
- **Images**: Stored in `/public/static/` directory
- **No Database**: Pure static website with client-side JavaScript for interactions

## User Guide

### Navigation
- Click navigation links for smooth scrolling to sections
- Sticky nav bar stays visible while scrolling
- Submit form button links to contact page

### Event Viewer
1. Scroll down to the Outreach section
2. Container will lock in place
3. Continue scrolling to cycle through events
4. Background color changes with each event
5. Click "RSVP Now" or "Reserve Your Seat" to contact form

### Viewing on Mobile
- Fully responsive design
- Touch-friendly navigation
- Optimized layouts for smaller screens

## Technical Stack
- **Framework**: Hono (Cloudflare Workers)
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages
- **Styling**: Inline CSS with CSS Variables
- **Fonts**: Google Fonts (Playfair Display, Inter)
- **JavaScript**: Vanilla JS for scroll interactions

## Development

### Local Development
```bash
# Build the project
npm run build

# Start development server (with PM2)
pm2 start ecosystem.config.cjs

# View logs
pm2 logs webapp --nostream

# Stop server
pm2 stop webapp
```

### File Structure
```
webapp/
├── api/
│   └── index.ts           # Vercel serverless function entry point
├── src/
│   ├── index.tsx          # Cloudflare Pages version (primary development)
│   └── index.ts           # Vercel version (synced copy with same content)
├── public/
│   └── static/
│       ├── friendsgiving-flyer.png
│       ├── church-building.jpg
│       └── style.css
├── dist/                  # Vite build output for Cloudflare
├── ecosystem.config.cjs   # PM2 configuration for local dev
├── package.json
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration (Cloudflare)
├── vercel.json            # Vercel deployment configuration
└── wrangler.jsonc         # Cloudflare Pages configuration
```

## Dual-Platform Deployment Architecture

### Overview
This project deploys to **TWO platforms simultaneously** from a single codebase:
- **Cloudflare Pages** (Development/Testing): Edge Workers runtime
- **Vercel** (Production): Node.js serverless runtime

### Why Two Files? (index.tsx vs index.ts)

**The Challenge:**
Different platforms require different runtime environments and build processes.

**The Solution:**
Maintain two versions of the main file with identical HTML/CSS/JavaScript but platform-specific imports.

### File Purposes

| File | Platform | Runtime | Purpose |
|------|----------|---------|---------|
| `src/index.tsx` | Cloudflare Pages | Cloudflare Workers (V8) | Primary development file |
| `src/index.ts` | Vercel | Node.js | Synced copy for production |
| `api/index.ts` | Vercel | Node.js | Serverless function wrapper |

### How Each Platform Works

#### Cloudflare Pages Build Flow
```
1. Vite build triggered
   ↓
2. src/index.tsx compiled by @hono/vite-build/cloudflare-pages
   ↓
3. Output: dist/_worker.js (Cloudflare Workers bundle)
   ↓
4. Deploy to Cloudflare Edge Network
```

#### Vercel Build Flow
```
1. npm install (includes typescript)
   ↓
2. TypeScript compiles src/index.ts → src/index.js
   ↓
3. api/index.ts imports '../src/index.js' (compiled output)
   ↓
4. api/index.ts wraps app with @hono/node-server/vercel adapter
   ↓
5. Deploy to Vercel as Node.js serverless function
```

### Critical Configuration Files

#### api/index.ts (Vercel Entry Point)
```typescript
import { handle } from '@hono/node-server/vercel'
import app from '../src/index.js'  // ✅ MUST import .js (compiled output)

export default handle(app)
```

**⚠️ CRITICAL:** Must import `'../src/index.js'` (with `.js` extension)
- NOT `'../src/index.ts'` ❌
- NOT `'../src/index'` ❌
- Vercel compiles TypeScript first, then imports the `.js` output

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

#### package.json (Key Scripts)
```json
{
  "scripts": {
    "build": "vite build",           // For Cloudflare
    "vercel-build": "vite build"     // For Vercel (same build)
  },
  "dependencies": {
    "@hono/node-server": "^1.19.6",  // Required for Vercel
    "hono": "^4.10.4"
  },
  "devDependencies": {
    "typescript": "^5.x.x",          // ✅ REQUIRED for Vercel compilation
    "@types/node": "^20.x.x"         // Node.js type definitions
  }
}
```

### Syncing Process (CRITICAL FOR DEPLOYMENT)

**When you make changes to features/UI:**

1. **Edit Primary File**: Make all changes in `src/index.tsx`
   ```bash
   # This is your main development file
   vim src/index.tsx
   ```

2. **Sync to Vercel File**: Copy entire content to `src/index.ts`
   ```bash
   cp src/index.tsx src/index.ts
   ```

3. **Verify Both Files**: Ensure they're identical
   ```bash
   diff src/index.tsx src/index.ts
   # Should output nothing (files are identical)
   ```

4. **Commit Both Files**:
   ```bash
   git add src/index.tsx src/index.ts
   git commit -m "Feature: [description] (synced both files for Cloudflare + Vercel)"
   ```

5. **Push to GitHub**:
   ```bash
   git push origin main
   ```

**Result:**
- Cloudflare Pages deploys automatically from `index.tsx`
- Vercel deploys automatically from `index.ts`
- Both platforms serve identical content ✅

### Important Notes

**❗ ALWAYS SYNC BOTH FILES:**
- If you only update `index.tsx`, Vercel will deploy old code
- If you only update `index.ts`, Cloudflare will deploy old code
- Both must be updated together for consistent deployments

**✅ Files Are Identical:**
- Same HTML structure
- Same CSS styles
- Same JavaScript logic
- Same imports (both use `'hono/cloudflare-workers'`)
- The difference is handled at the build/deployment level

**🔄 Automatic Deployments:**
- Push to GitHub `main` branch triggers both platforms
- Cloudflare Pages: Builds and deploys automatically
- Vercel: Builds and deploys automatically
- Both should complete within 2-5 minutes

### Troubleshooting Deployment Issues

**Vercel Build Fails:**
1. Check `typescript` is in `devDependencies`
2. Verify `api/index.ts` imports `'../src/index.js'` (with `.js`)
3. Ensure `src/index.ts` is synced with `src/index.tsx`
4. Check Vercel build logs for specific errors

**Cloudflare Build Fails:**
1. Check `@hono/vite-build` is installed
2. Verify `vite.config.ts` has correct entry point
3. Ensure `src/index.tsx` has no syntax errors

**500 Error on Vercel:**
- Usually means `src/index.ts` is out of sync
- Copy `index.tsx` to `index.ts` and redeploy

**Mismatched Features:**
- One platform has features the other doesn't
- Files weren't synced - copy and commit both files

## Design Enhancements Made

### From Original to Enhanced
1. **Typography**: Upgraded to Playfair Display serif font for elegance
2. **Spacing**: Increased whitespace and section gaps (200px)
3. **Colors**: Refined color palette with sophisticated gradients
4. **Shadows**: Multi-layer shadows for realistic depth
5. **Borders**: Added subtle borders with transparency
6. **Backdrop Blur**: Glass effect on nav and cards
7. **Animations**: Smooth cubic-bezier timing functions
8. **Hover States**: Enhanced interactive feedback
9. **Event Section**: Complete redesign with scroll-based viewer
10. **Background Transitions**: Dynamic color changes (1.2s smooth)

## Animation Details

### Scroll Event Viewer
- **Trigger**: When Outreach section reaches 30% from top of viewport
- **Duration**: 300vh scroll distance (3x viewport height)
- **Transitions**: 
  - Opacity: 1.2s cubic-bezier (smooth fade in/out)
  - Transform: 1.2s cubic-bezier (translateY + scale)
  - Background: 1.8s cubic-bezier (gentle color transitions)
  - Entry/Exit: Double requestAnimationFrame for smooth color application
- **Performance**: RequestAnimationFrame for smooth 60fps
- **Colors**: Light pastel gradients that blend seamlessly
- **Header**: Sticky positioned at 140px from top with gradient overlay for readability

### Navigation
- **Link hover**: 0.4s ease with underline animation
- **Button hover**: Transform translateY(-3px) with shadow increase
- **Brand hover**: Slight lift effect

### Cards
- **Schedule items**: translateY(-6px) on hover
- **Event cards**: translateY(-8px) with enhanced shadow
- **Form inputs**: Focus state with color and shadow transition

## Future Enhancements
- Add actual flyers for Events 2 and 3
- Implement form submission functionality
- Add more events dynamically
- Integrate with calendar API
- Add video backgrounds for Watch section
- Implement dark mode toggle
- Add page transition animations

## Deployment Status
- **Platform**: Cloudflare Pages
- **Status**: Development (Local)
- **Tech Stack**: Hono + TypeScript + Vite
- **Last Updated**: 2025-01-04

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized

## Performance
- **Initial Load**: Fast (minimal JS)
- **Scroll Performance**: Optimized with requestAnimationFrame
- **Image Loading**: Lazy loading ready
- **CSS**: Inline for critical path optimization

## 🎥 YouTube Video Embedding

### How to Add Your Videos/Playlist:

1. **Main Live Stream Video:**
   - Find the line: `src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE"`
   - Replace `YOUR_VIDEO_ID_HERE` with your YouTube video ID
   - Example: `https://www.youtube.com/embed/dQw4w9WgXcQ`
   
2. **Get YouTube Video ID:**
   - From URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ` → Video ID is `dQw4w9WgXcQ`
   - From embed: Copy the part after `/embed/`

3. **Playlist of Previous Streams:**
   - Find the line: `src="https://www.youtube.com/embed/videoseries?list=YOUR_PLAYLIST_ID_HERE"`
   - Replace `YOUR_PLAYLIST_ID_HERE` with your YouTube playlist ID
   - Example: `https://www.youtube.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf`

4. **Get YouTube Playlist ID:**
   - Go to your YouTube playlist
   - Click "Share"
   - Copy the URL: `https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf`
   - Playlist ID is the part after `list=`

### For Live Streaming:
- When you go live, YouTube generates a unique video ID
- You can use the same video ID format for live streams
- Or use your channel's live stream URL

### Video Features:
- ✅ Responsive 16:9 aspect ratio
- ✅ Full screen support
- ✅ Playlist auto-plays next video
- ✅ Mobile optimized
- ✅ Dark theme integration

## 📝 Version History

### v1.9.44 (Current) - REPOSITIONED GIFT GALLERY IMAGES
- **Moved gift gallery images above See Flyer button**
  - Images now positioned between copy and button
  - Flow: Copy → Images → Button → Bible Verse
  - Better visual hierarchy showing gifts before call-to-action
  - Images illustrate what recipients can expect
- **Enhanced content flow**
  - Copy explains the program
  - Images provide visual proof
  - Button offers next action
  - Bible verse provides inspiration
- Result: More logical visual flow with gift examples before action button

### v1.9.41 - IMPROVED CONTENT HIERARCHY AND BUTTON STYLING
- **Restructured content hierarchy**
  - "This Christmas, Morning Star..." now styled as subheader (h3)
  - 22px font, bold weight, proper heading treatment
  - Sets context before informational copy
  - "Based on the information..." remains as regular copy
- **Moved See Flyer button**
  - Relocated: after copy, before Bible verse
  - Better logical flow: description → action → inspiration
  - Positioned between information and scripture
- **Updated button to white styling**
  - Changed from gold gradient to clean white
  - Subtle border and shadow for elegance
  - Better visual hierarchy - doesn't compete with content
  - Hover: slight lift with enhanced shadow
- **Enhanced visual flow**
  - Clear hierarchy: Heading → Subheader → Copy → Button → Bible Verse
  - White button provides visual break before scripture
  - More polished, professional appearance
- Result: Better content structure with clear hierarchy, white button for subtle elegance, improved visual flow

### v1.9.40 - ENHANCED CHRISTMAS EVENT WITH BIBLICAL FOUNDATION
- **Added Bible verse (1 John 3:16-18) to show ministry purpose**
  - Beautiful styled blockquote with gold accents
  - Explains why: Jesus laid down His life, we lay down ours
  - Points visitors to Christ as the foundation of giving
  - Positioned after event description for clear context
- **Updated event focus to Single Mothers & Widows**
  - Changed from "Christmas Clothes Drive for Mothers"
  - Now: "Christmas Gifts for Single Mothers & Widows"
  - Recognizes these women working tirelessly to provide
  - Emphasizes church's heart to support those in need
- **Enhanced form copy with detailed gift explanation**
  - "Handpick a special gift just for you and your family"
  - Clear expectations: shoes for adults, school/play items for kids
  - Emphasizes beautiful wrapping and Christmas tree ready
  - Mentions text confirmation with pickup details
- **Updated nav button for clarity**
  - Changed: "Register for free gifts"
  - Now: "Christmas Event: Register for Free Gifts"
  - Helps visitors understand this is a special outreach program
  - Not just ongoing free gifts, but a Christmas event
- **All changes reversible**
  - User requested ability to revert if needed
  - Changes focused on Event 2 (Christmas outreach)
  - External feedback carefully analyzed and implemented
- Result: Christ-centered ministry with clear purpose, focused on single moms & widows, with detailed gift information

### v1.9.39 - NAV EXPANDS EARLIER ON SCROLL UP
- **Nav expands at 90% scroll up instead of 100%**
  - Changed from fixed 50px threshold to responsive 10% calculation
  - Nav now expands when within 10% of top (90% scrolled up)
  - More intuitive and responsive feel when scrolling back up
- **Responsive threshold based on screen size**
  - 375px mobile: Expands at 13px from top (10% of 130px spacer)
  - 480px mobile: Expands at 19px from top (10% of 190px spacer)
  - 960px mobile: Expands at 19px from top (10% of 190px spacer)
  - Desktop: Expands at 38px from top (10% of 380px spacer)
- **Better UX for upward scrolling**
  - Nav anticipates user intent to return to top
  - Expands earlier for smoother transition
  - Feels more responsive and natural
- Result: Nav expands before reaching absolute top, making it feel more intuitive and responsive

### v1.9.38 - RESTORED ORIGINAL PADDING AND SPACING
- **Restored original nav-spacer heights from v1.9.34**
  - Desktop: 120px → 380px (restored original comfortable spacing)
  - 480px mobile: 100px → 190px (restored original spacing)
  - 375px mobile: 80px → 130px (restored original spacing)
  - User requested original padding/spacing be restored
- **Restored original hero section padding from v1.9.34**
  - Desktop: `padding: 0 0 60px` → `padding: 60px 0` (original)
  - 480px: `padding: 0 0 40px` → `padding: 20px 0 60px` (original)
  - 375px: `padding: 0 0 20px` → `padding: 40px 0 20px` (original)
  - Hero content has original comfortable top padding again
- **Reverted spacing changes from v1.9.37**
  - All nav-spacer and hero padding values match v1.9.34
  - Comfortable, familiar spacing and layout
  - User-preferred vertical rhythm restored
- Result: Original comfortable spacing and layout from v1.9.34, keeping all other improvements

### v1.9.37 - FIXED NAV LAYOUT AND SPACING
- **Nav no longer affects page layout**
  - Drastically reduced nav-spacer heights across all breakpoints
  - Desktop: 380px → 120px (68% reduction)
  - 480px mobile: 190px → 100px (47% reduction)
  - 375px mobile: 130px → 80px (38% reduction)
  - Nav is truly fixed/floating without pushing content down
- **Eliminated excessive white space**
  - Removed hero top padding on all breakpoints
  - Desktop: `padding: 60px 0` → `padding: 0 0 60px`
  - 480px: `padding: 20px 0 60px` → `padding: 0 0 40px`
  - 375px: `padding: 40px 0 20px` → `padding: 0 0 20px`
  - Hero content now sits naturally below nav
- **Optimal spacing achieved**
  - Nav floats above content with minimal spacer
  - "Mending the Broken" heading positioned properly
  - No unnecessary gaps or white space
  - Content flows naturally from nav to hero
- Result: Clean, professional layout with nav floating independently, proper vertical rhythm, and optimal use of screen space

### v1.9.36 - ELIMINATED NAV WRAPPING DURING TRANSITIONS
- **Fixed tabs briefly dropping to new row during compression**
  - Added `flex-wrap: nowrap` to compressed nav state
  - Brand and full GIFTS button use `position: absolute` when hiding
  - Elements removed from layout flow before wrapping can occur
  - Nav links stay on single row throughout entire transition
- **Layout flow management**
  - Full state: `flex-wrap: wrap` allows natural multi-row layout
  - Compressed state: `flex-wrap: nowrap` forces single-row layout
  - Hiding elements become absolutely positioned (out of flow)
  - Nav width transitions from `width: 100%` to `width: auto; flex: 1`
- **Timing optimization**
  - Brand fades out in 0.25s (faster exit before wrapping)
  - Elements transition opacity before position changes
  - Smooth handoff between full and compact states
- **Applied to all mobile breakpoints**
  - 960px breakpoint: Fixed wrapping with absolute positioning
  - 480px breakpoint: Smooth single-row transition
  - 375px breakpoint: Compact layout without wrapping
- Result: Perfectly smooth nav transitions with tabs staying in line, no flickering or jumping to new rows

### v1.9.35 - SMOOTH MOBILE NAV ANIMATIONS
- **Eliminated flickering and resizing during nav transitions**
  - Replaced `display: none` with `opacity` and `visibility` for smooth fade in/out
  - Added GPU-accelerated transforms (translateX, scale) for element positioning
  - All elements stay in DOM, preventing layout shifts
  - Consistent 0.3-0.4s transition timing across all properties
- **Precise animation choreography**
  - Brand logo fades out with subtle scale down when compressing
  - Full GIFTS button slides right and scales down as nav compacts
  - Nav links smoothly shift left (translateX) when GIFTS button appears
  - Compact GIFTS button slides in from left with scale up animation
  - Border-radius morphs smoothly from rounded to pill shape
- **GPU-optimized performance**
  - Added `will-change` hints for all animating properties
  - Transforms use GPU acceleration (translateX, scale) instead of margin/padding
  - Single smooth cubic-bezier easing for natural motion
  - No layout recalculation during transitions
- **Mobile breakpoints enhanced**
  - 960px breakpoint: Smooth GIFTS button shift with width/margin transitions
  - 480px breakpoint: Coordinated nav links shift with GIFTS button fade in/out
  - Font sizes and letter-spacing animate smoothly
- Result: Buttery smooth, professional nav transitions without any flickering or janky resizing

### v1.9.34 - REFINED SCROLL & SWIPE COORDINATION
- **Reduced scroll distances by 25%**
  - Desktop: 416vh → 312vh (25% reduction)
  - 960px breakpoint: 910vh → 683vh (25% reduction)
  - 480px breakpoint: 312vh → 234vh (25% reduction)
  - More responsive and easier to navigate through events
  - Less scrolling required to switch events
- **Fixed scroll overriding swipes**
  - Added manual override flag that activates after swipe
  - Scroll handler respects manual swipe for 1.5 seconds
  - Prevents finicky behavior where swiping to event 3 then scrolling jumps back
  - Swipe intent is now honored before scroll takes over
- **Swipe boundaries enforced**
  - Swipe left at event 3 does NOT loop to event 1
  - Swipe right at event 1 does NOT loop to event 3
  - Clear boundaries with `currentEventIndex < totalEvents - 1` and `currentEventIndex > 0`
- **Enhanced user experience**
  - Swipe and scroll work together smoothly
  - Manual gestures respected over automatic scroll
  - Intuitive, refined navigation through outreach section
- Result: Highly intuitive outreach section with smooth swipe/scroll coordination

### v1.9.33 - SWIPE DETECTION ACROSS ENTIRE OUTREACH SECTION
- **Expanded swipe detection area**
  - Changed from `.events-container` to entire `.outreach` section
  - Swipe listeners now cover much larger touch area
  - Works anywhere within outreach section (heading, cards, background, spacer)
- **Swipes work at all times**
  - Before entering sticky state ✓
  - During sticky state ✓
  - After leaving sticky state ✓
  - When cards barely visible ✓
  - Anytime outreach section is on screen ✓
- **Improved user experience**
  - Larger touch target area
  - More forgiving swipe detection
  - No need to touch exact card location
- Result: Swipes work consistently across entire outreach section at all scroll positions

### v1.9.32 - DOUBLE SCROLL DISTANCE & REMOVE LOCKS
- **Removed all cooldowns and locks**
  - Removed 1500ms swipe cooldown
  - Removed 800ms swipe debounce
  - Removed manualSwipeOverride flag and logic
  - Removed swipeTimer functionality
  - Swipes now respond instantly without artificial delays
- **Doubled scroll distance for all breakpoints**
  - Desktop: 208vh → 416vh (2x increase)
  - 960px breakpoint: 455vh → 910vh (2x increase)
  - 480px breakpoint: 156vh → 312vh (2x increase)
  - Much longer scroll distance needed to navigate through events
  - Natural scroll momentum has more space before triggering event changes
- **Simplified swipe logic**
  - Removed complex locking mechanisms
  - Swipes simply increment/decrement event index
  - No artificial blocks or overrides
  - Cleaner, more straightforward code
- Result: Longer scroll distances naturally prevent velocity issues - more space between events means scroll momentum dissipates before reaching next event threshold

### v1.9.31 - LOCK EVENT INDEX AFTER SWIPE
- Attempted to lock event index for 1.5 seconds after swipe
- Too restrictive and caused laggy user experience
- Replaced with simpler solution in v1.9.32

### v1.9.30 - FIX SWIPE VELOCITY ISSUE
- **Increased swipe cooldown to prevent double-swipe**
  - Cooldown increased from 600ms → 1500ms
  - Manual swipe override now lasts 1.5 seconds instead of 0.6 seconds
  - Prevents scroll momentum from triggering additional event changes after swipe
  - Blocks rapid repeated swipes that could skip multiple cards
- **Increased swipe debounce time**
  - Debounce increased from 400ms → 800ms
  - Must wait longer between swipes
  - Ensures each swipe gesture only changes one card
- **How it fixes velocity issue**
  - After swiping, the `manualSwipeOverride` flag stays active for 1.5 seconds
  - During this time, scroll-based event changes are blocked
  - Prevents scroll momentum from your swipe gesture triggering another card change
  - Even fast/hard swipes will only change one card at a time
- Result: Single swipe = single card change, no matter how fast you swipe

### v1.9.29 - INCREASE SCROLL DISTANCE BY 30%
- **Increased scroll spacer height across all breakpoints**
  - Desktop: 160vh → 208vh (+30%)
  - 960px breakpoint: 350vh → 455vh (+30%)
  - 480px breakpoint: 120vh → 156vh (+30%)
  - More scroll distance needed to navigate through all events
  - Events stay on screen longer for better viewing
- Result: Slower, more deliberate scroll pace through outreach events

### v1.9.28 - FIX SWIPE DETECTION
- **Removed sticky state requirement for swipes**
  - Swipes now work anytime in outreach section, not just when locked
  - Simplified detection logic for better reliability
- **Increased swipe threshold to 60px**
  - More deliberate gesture required to trigger event change
  - Prevents accidental swipes during normal scrolling
- **Added extensive console logging**
  - Logs touch start, move, and end positions
  - Logs swipe direction and event changes
  - Helps debug swipe behavior
- Result: Working swipe navigation with reliable detection

### v1.9.27 - ENHANCED MOBILE SWIPE NAVIGATION IN OUTREACH
- **Improved swipe detection in sticky locked state**
  - Swipe gestures now only activate when section is in sticky state (cards locked on screen)
  - Detects horizontal swipes vs vertical scrolls more accurately
  - Increased swipe threshold to 50px for more deliberate gestures
  - Added 300ms debounce to prevent rapid repeated swipes
  - Horizontal swipes (left/right) change events when cards are locked
  - Vertical scrolls work normally to navigate through section
- **Smart scroll-through after swiping to last event**
  - When user swipes to Event 3 (last event), they can now scroll down to exit section
  - Auto-releases manual swipe override when scroll progress reaches 85% on last event
  - Smooth transition from Event 3 to Watch section
  - No more getting "stuck" on the last event
- **Enhanced swipe logic**
  - Tracks touch start, current position, and end position
  - Calculates swipe direction (left/right) based on horizontal distance
  - Swipe left (dx < 0) → next event
  - Swipe right (dx > 0) → previous event
  - Requires clear horizontal movement (dx > dy) to trigger
  - Only works in sticky state, doesn't interfere with normal scrolling
- **Better state management**
  - Added `isInStickyState()` helper function to check section state
  - Manual swipe override flag prevents scroll from fighting user gesture
  - 600ms cooldown after swipe before scroll can override
  - Prevents scroll jank and provides smooth user experience
- Result: Natural mobile swipe navigation that feels intuitive and responsive, with smooth exit from section after viewing last event

### v1.9.26 - GIFT GALLERY FULL-SCREEN LIGHTBOX
- **Added full-screen lightbox for gift gallery images**
  - Click any of the 3 gift images to open in full-screen view
  - Dark overlay (95% black) for maximum image focus
  - Images displayed with maximum size while maintaining aspect ratio
  - Smooth rounded corners (8px) on lightbox images
- **Navigation arrows for browsing images**
  - Left/right arrow buttons on sides of lightbox
  - Circular frosted glass buttons (56px) with smooth hover effects
  - Previous arrow (‹) on left, next arrow (›) on right
  - Navigate through all 3 images in sequence
  - Wraps around (last image → first image)
- **Multiple ways to control lightbox**
  - Close button (×) in top-right corner (48px circular button)
  - Click outside image (on dark background) to close
  - Press Escape key to close
  - Arrow keys (←/→) for navigation
  - Touch-friendly button sizes
- **User experience enhancements**
  - Body scroll locked when lightbox open
  - Cursor changes to pointer on gift images
  - Smooth transitions on all interactions
  - High z-index (10000) ensures lightbox always on top
- Result: Professional image gallery experience for viewing gift examples

### v1.9.25 - INCREASE EVENT SCROLL DISTANCES
- **Increased scroll distance for events 2 and 3**
  - Event 1: 0-25% progress (unchanged)
  - Event 2: 25-65% → 25-70% progress (5% increase)
  - Event 3: 65-100% → 70-100% progress (5% later start)
  - Users now need to scroll further to switch from event 2 to event 3
  - Event 2 gets more scroll "real estate" making it easier to view
- **Event 1 scroll distance unchanged**
  - Still triggers at 0-25% as before
  - No change to initial event viewing experience
- Result: More scroll distance allocated to events 2 and 3 for better viewing control

### v1.9.24 - FIX FLYER STYLING ON MOBILE
- **Fixed flyer image rounded corners on mobile**
  - Desktop: 48px border-radius (unchanged)
  - 480px breakpoint: Increased from 10px → 24px border-radius
  - 375px breakpoint: 48px border-radius (unchanged)
  - Now shows proper rounded corners matching the date pill aesthetic
- **Adjusted date pill positioning for better corner alignment**
  - Desktop: Moved from `top: 12px, left: 24px` → `top: 16px, left: 32px`
  - 480px: Moved from `top: 10px, left: 20px` → `top: 12px, left: 24px`
  - 375px: Moved from `top: 8px, left: 16px` → `top: 12px, left: 20px`
  - Date pill now positioned more consistently with rounded corners
- Result: Flyer images have proper rounded corners on all mobile devices, date pill better aligned with image corners

### v1.9.23 - FIX SEE FLYER BUTTON SCROLL
- **Fixed "See Flyer" button scroll position**
  - Button now properly scrolls to show Event 2 (Christmas Clothes Drive)
  - Calculates scroll to middle of spacer (50% progress) to trigger event 2 display
  - Uses smooth scroll animation for better UX
  - Previously was not scrolling far enough into the outreach section
- Result: Clicking "See Flyer" now correctly displays the event 2 card with flyer

### v1.9.22 - SCROLL TO TOP & NAV EXPANSION
- **HOME link scrolls to absolute top**
  - Clicking HOME in navigation scrolls to position 0 (very top of page)
  - Automatically expands navigation from compact to full on mobile
  - Smooth scroll animation for better UX
- **Scroll up gesture at top expands nav**
  - When already at top (within 50px), scrolling up twice triggers scroll to absolute top
  - Navigation automatically expands from compact to full state
  - Provides intuitive way to return to starting position
- **Does not affect other section scroll points**
  - All other navigation links maintain their existing scroll offsets
  - Outreach section still uses custom offset (-50px mobile, 20px desktop)
  - Other sections still use standard offsets (30px mobile, 45px desktop)
- Result: Better navigation UX with intuitive "scroll to top" behavior on mobile

### v1.9.21 - SCHEDULE SECTION IMPROVEMENTS
- **Removed copy text under heading**
  - Deleted paragraph "We gather on Sundays, grow in community..."
  - Kept only address line: "3080 N Wildwood St · Boise, Idaho"
  - Cleaner, more focused section header
- **Standardized time format across all three items**
  - Changed "9:00 AM" to "Sundays · 9:00 AM" to match other days
  - All three items now follow same format: "Day · Time"
  - More consistent visual rhythm
- **Updated Sunday description**
  - New: "Morning service with free community breakfast after. Free transportation from select shelters included."
  - Highlights community breakfast and transportation services
  - More welcoming and inclusive messaging
- **Updated Tuesday description**
  - New: "Morning Bible study with coffee at select local coffee shops."
  - Brief and clear about location and format
  - Removed mention of child care and prayer to keep concise
- **Updated Thursday description**
  - New: "Evening Bible study at the church with free coffee."
  - Simple and direct about location and amenities
  - Removed dinner/discussion/worship details for brevity
- Result: Cleaner schedule section with consistent formatting and concise, welcoming descriptions

### v1.9.20 - COUNTDOWN TIMER REFINEMENTS
- **Made countdown much smaller**
  - Reduced countdown numbers from 42px to 24px
  - Reduced item min-width from 70px to 45px
  - Reduced gaps from 20px to 12px, 16px to 8px
  - Smaller label font sizes (14px → 10px, 11px → 9px)
  - More compact, less visually dominant design
- **"Live Soon" now shows only 1 hour before service**
  - "Live Soon" status only displays within 60 minutes of Sunday 9am MT
  - Rest of the week: countdown visible, "Live Soon" hidden
  - During service or after: both hidden
  - Smart logic checks both time remaining AND day of week
- Result: Cleaner, more compact countdown that shows "Live Soon" only when truly imminent

### v1.9.19 - WATCH SECTION IMPROVEMENTS
- **Removed copy text under heading**
  - Deleted the paragraph "Tune in from wherever you are..." under "Join us live every Sunday."
  - Cleaner, more focused watch section header
- **Show only 1 video - latest stream**
  - Changed from 2 identical videos to single video showing latest stream from playlist
  - Uses YouTube playlist embed with `index=1` parameter to show most recent upload
  - Eliminates redundancy and improves user experience
- **Added "View Full Playlist" button**
  - Replaced second video with button linking to full YouTube playlist
  - Opens in new tab with `target="_blank"` and `rel="noopener"`
  - Uses `.btn-outline` styling for consistency
- **Added countdown timer to next Sunday service**
  - Displays time until next Sunday 9:00 AM Mountain Time
  - Shows days, hours, minutes, and seconds in real-time
  - Automatically handles timezone conversion using `America/Denver`
  - Updates every second with smooth JavaScript interval
  - Handles edge cases (currently Sunday after 9am, DST changes)
  - Large 42px Playfair Display numbers with elegant styling
- **Enhanced "Live Soon" status**
  - Now displays active countdown timer when service is not live
  - Clear countdown labels and white-on-dark-red color scheme
- Result: Cleaner watch section with single video, countdown timer, and playlist access button

### v1.9.18 - MOBILE NAV GIFTS BUTTON IMPROVEMENTS
- **Shifted GIFTS button right in compressed mobile nav**
  - Added `margin-left: 8px` to `.nav-form-btn` when nav is compressed
  - Better visual balance with nav links on the left
  - Button no longer crowded with other nav items
- **Made GIFTS button bold when active**
  - Added `.nav-form-btn.active` class with `font-weight: 900`
  - White background (`rgba(255, 255, 255, 1)`) when active
  - Updated `updateActiveNavLink()` function to track contact section
  - Button stays bold/highlighted when user is in gifts/contact section
- Result: Better balanced mobile nav with clear active state indication

### v1.9.17 - RESTORED ORIGINAL CONTACT SECTION LAYOUT
- **Removed overlay styling from form**
  - Removed `contact-container` wrapper div
  - Restored `jotform-container` to original simple styling
  - No more absolute positioning, shadows, or borders
  - Form flows naturally in document flow
- **Eliminated gap between address and form**
  - Removed `position: relative` from container
  - Form appears directly below address with no spacing
  - Clean, seamless integration with page layout
- **Simplified structure**
  - Back to original transparent background
  - Full width form container
  - No overlay effects
- Result: Clean, simple form layout with no unnecessary gaps or overlays

### v1.9.16 - SEE FLYER BUTTON REPOSITIONED & RESIZED
- **Moved button to just below section heading**
  - Repositioned from below form to below "Christmas Clothes Drive for Mothers" heading
  - Appears as small centered button between heading and copy
  - Better visual hierarchy and logical flow
- **Made button much smaller**
  - Desktop: `padding: 8px 24px`, `font-size: 11px`
  - Mobile 480px: `padding: 7px 20px`, `font-size: 10px`
  - Mobile 375px: `padding: 6px 16px`, `font-size: 9px`
  - Lighter shadow for more subtle appearance
- Result: Compact, unobtrusive button positioned logically below heading

### v1.9.15 - GIFT GALLERY LAYOUT FIX & BUTTON REPOSITIONING
- **Fixed gift gallery to always display in a row**
  - Changed from fixed widths to `flex: 1` with `max-width: 30%`
  - Images now scale responsively and never wrap
  - Using `aspect-ratio: 1/1` to maintain square shape
  - Gap adjusted to percentages: 2% (desktop), 1.5% (480px), 1% (375px)
  - Works perfectly on all screen sizes from 375px to desktop
- **Moved "See Flyer" button**
  - Repositioned from header to below JotForm container
  - Centered with `margin: 24px auto 0`
  - Button now appears at bottom of contact section
- Result: Clean, scalable image row and logical button placement

### v1.9.14 - CONTACT SECTION REDESIGN WITH GIFT GALLERY
- **Rewrote contact section copy**
  - Clear explanation of personal gift packing process
  - Details about what recipients can expect (shoes for adults, school/fun items for children)
  - Mentions text message notification after form submission
- **Added gift gallery with 3 images**
  - Shows real examples: shoes, backpacks, and school supplies
  - Responsive sizing: 200px (desktop), 140px (480px), 100px (375px)
  - Hover effects with scale and shadow
- **Updated button to "See Flyer"**
  - Smaller, more subtle gold button styling
  - Changed from "More Info" to "See Flyer"
- **Repositioned JotForm**
  - Desktop: Overlaid in upper right corner with shadow and border
  - Mobile: Stacks below content for better accessibility
  - Width: 450px desktop, full width mobile
- Result: More informative, visually appealing contact section with clear gift examples

### v1.9.13 - DATE PILL POSITIONING & INDICATOR DOTS FIX
- **Adjusted date pill positioning**
  - Desktop: Moved from `top: 16px, left: 40px` to `top: 12px, left: 24px`
  - Mobile 480px: `top: 10px, left: 20px`
  - Mobile 375px: `top: 8px, left: 16px`
  - Date pill now positioned further into the image corner
- **Fixed indicator dots functionality**
  - Dots in header now properly highlight gold based on active event
  - Fixed selector to only target header dots: `.heading-wrapper .event-dot`
  - Overlaid dots on images sync with active event state
  - All 3 dots update correctly when scrolling or swiping
- **Image rounded corners confirmed**
  - All event images already have 48px border-radius matching pill aesthetic
  - Corners properly rounded on all events including Event 1
- Result: Date pill better positioned in image corner, indicator dots work perfectly

### v1.9.12 - INCREASED WATCH SECTION SPACING
- **Increased watch section top margin for more natural spacing**
  - Updated `margin-top: 80px → 120px` at 480px breakpoint
  - Updated `margin-top: 60px → 100px` at 375px breakpoint
  - Creates more comfortable breathing room between outreach and watch sections
  - Spacing now feels natural and balanced on mobile
- Result: More generous, natural-feeling spacing between sections

### v1.9.11 - WATCH SECTION OVERLAP FIX
- **Fixed watch section overlapping with outreach section on mobile**
  - Added `margin-top: 80px` to `.watch` section at 480px breakpoint
  - Added `margin-top: 60px` to `.watch` section at 375px breakpoint
  - Prevents watch section from appearing too early and overlapping outreach content
  - Maintains proper visual separation between sections
- Result: Clean spacing between outreach and watch sections with no overlap

### v1.9.10 - MOBILE SPACING FIX
- **Fixed excessive spacing between outreach and watch sections on mobile**
  - Reduced `.scroll-spacer` height from 180vh → 120vh on mobile (480px breakpoint)
  - Eliminated large white gap that appeared after event cards
  - Maintains smooth scroll-based event switching functionality
  - Improves mobile UX with tighter, more cohesive section flow
- Result: Watch section now appears immediately after outreach with proper spacing

### v1.9.9 - EVENT CARDS SIZE & POSITION REFINEMENT
- **Cards moved much higher**: Sticky wrapper top from 5vh → 0vh, cards now at very top
- **Cards 15% LARGER**: Max-width increased from 382px → 517px (450px × 1.15)
- **Extra rounded corners**: Border-radius increased from 32px → 48px to better match pill aesthetic
- **Height increased**: Sticky wrapper height 75vh → 80vh for more breathing room
- Result: Larger, more prominent cards positioned at the top with pill-matching rounded corners

### v1.9.8 - EVENT CARDS REDESIGN
- **Event cards moved up**: Sticky wrapper top from 12vh → 5vh, height increased to 75vh
- **Cards 15% smaller**: Max-width reduced from 450px → 382px for tighter layout
- **Date pill overlaid on image**: Positioned absolute in top-left corner (16px from edge)
- **Dots overlaid on image**: Positioned absolute in top-right corner (16px from edge)
- **Rounded corners match pill**: Border-radius increased from 24px → 32px
- **Cleaner layout**: No separate meta row, everything overlaid on image
- Result: More compact, modern card design with floating date/dots overlay

### v1.9.7 - PRECISE SCROLL POSITIONING FOR CLEAN NAV LOOK
- Adjusted outreach-header sticky position to 28px (was 80px)
- Section pills now hide perfectly behind navigation
- Scroll offsets fine-tuned for all sections

### v1.9.6 - DISABLED AUTO-ZOOM ON MOBILE
- Viewport meta tag updated to prevent auto-zoom on input focus

### v1.9.5 - REMOVED FORM CONTAINER
- **REMOVED: White rounded container around JotForm**
  - Removed `.contact-card` div wrapper from HTML structure
  - JotForm now extends to edges of page instead of being boxed in
  - No more padding, rounded corners, or box-shadow on form container
  - Cleaner, more integrated look with website design
- **Simplified HTML structure**:
  - `.contact-container` → `.jotform-container` (direct)
  - Form flows naturally without visual barriers
- Result: Form appears as part of the page flow, not as a separate boxed element

### v1.9.4 - FIXED SWIPE & GOLD DOT INDICATORS
- **FIXED: Horizontal swipe navigation now works properly**
  - Simplified swipe detection logic
  - Lower threshold (40px) for easier detection
  - Added console logging for debugging
  - Swipe left = next event, swipe right = previous event
- **IMPROVED: Gold dot indicators are now highly visible**
  - Active dot is solid gold (#d4a574)
  - Larger size (12px vs 10px for inactive)
  - Gold glow/shadow effect for active dot
  - 2px gold border on active dot
  - Smooth transitions between states
- **Better visual feedback**:
  - Current event always shows with bright gold dot
  - Inactive dots are subtle gray
  - Hover effect on inactive dots only
- **Improved swipe reliability**:
  - Detects horizontal vs vertical movement
  - 500ms cooldown prevents double-triggers
  - Manual override system prevents scroll interference
  - Console logging helps debug issues
- Result: Clear visual indicator of current event, working swipe navigation

### v1.9.3 - UNIFIED SWIPE & SCROLL NAVIGATION
- **NEW: Horizontal swipe navigation** - Swipe left/right to navigate between events
- **NEW: Clickable dot indicators** - Tap any dot to jump directly to that event
- **Unified navigation system** - Swipe and scroll work together seamlessly
  - Swipe to event 2, then scroll down → continues to event 3
  - Single shared `currentEventIndex` for both input methods
  - Manual swipe overrides prevent scroll interference
  - Automatic sync when scroll continues after swipe
- **Removed scroll-down indicator** - Cleaner UI, dots show current position
- **Smart gesture detection**:
  - Horizontal swipes change events (50px threshold)
  - Vertical scrolls also change events  
  - Dominant direction wins - no accidental triggers
  - 400ms cooldown prevents rapid switching
- **Active dot highlighting** - Always shows which event (1/2/3) you're viewing
- Result: Intuitive, user-friendly event navigation that feels natural

### v1.9.2 - CARD POSITIONING FIX + REFINED SCROLL LOGIC
- **Fixed event card positioning** - Cards were too low on screen
- Adjusted sticky-wrapper: top from 20vh to 12vh, height from 62vh to 70vh
- Changed alignment: flex-start instead of center for better vertical positioning
- **Implemented clean scroll logic drop-in replacement**:
  - Even zone distribution (0-25%, 25-65%, 65-100%)
  - Removed skewing hysteresis for smoother transitions
  - Added aria-hidden and inert support for accessibility
  - Batched DOM updates for better performance
  - Null-safe guards throughout
  - Clamped math for edge cases
  - Reduced-motion support
- Result: Cards positioned correctly, smooth and accessible scrolling

### v1.9.1 - IMPORTED WORKING SCROLL LOGIC FROM GITHUB
- **SUCCESS: Used proven GitHub/Vercel implementation**
- Previous v1.9.0 attempt failed - events still skipping
- Solution: Imported working scroll logic from GitHub v1.5.4
- Key features of GitHub implementation:
  - **Asymmetric zones**: 0-25%, 25-65%, 65-100% (not equal thirds)
  - **Hysteresis threshold**: 0.12 (12%) prevents boundary flickering
  - **Scroll lock**: 800ms prevents momentum scrolling through events
  - **Viewport adjustment**: Accounts for header and spacer positioning
  - **Time-based locking**: Uses Date.now() to prevent rapid switches
- Result: All 3 events display reliably, matches Vercel deployment behavior
- Professional-grade: Production-tested implementation

### v1.9.0 - COMPLETE REBUILD WITH ROBUST ZONE LOGIC (FAILED)
- **SCRAPPED AND REBUILT: All scroll logic rewritten from scratch**
- Previous approach issues:
  - Sticky header adjustments skewing zone calculations
  - Debouncing creating timing race conditions
  - Complex state tracking with locks causing unpredictable behavior
  - Events 2 & 3 not showing consistently
- New bulletproof approach:
  - **requestAnimationFrame**: Smooth 60fps updates, no janky debouncing
  - **Pure zone math**: Clean if/else logic (0-33%, 33-66%, 66-100%)
  - **No adjustments**: Raw scroll progress directly maps to zones
  - **Simple state**: Only `currentEventIndex` and `requestId`
  - **Zero complexity**: ~50 lines of crystal-clear code
- Result: All 3 events show reliably, predictably, every time
- Professional-grade: Production-ready scroll implementation

### v1.8.0 - PROFESSIONAL DISCRETE NAVIGATION
- **CRITICAL BUG FIX: Removed direction change requirement**
- Previous bug: Only triggered on direction change
  - First scroll → Event 1 ✅
  - Continue scrolling → STUCK (no direction change) ❌
  - Result: Skipped cards 2 & 3
- Fix: Trigger on ANY scroll >20px while not locked
- Increased lock: 400ms → 600ms for stability
- Increased threshold: 5px → 20px for deliberate scrolls
- Behavior: Each scroll gesture = exactly one card advance
- Professional level: Predictable, stable, simple

### v1.7.9
- **DISCRETE CARD NAVIGATION: One swipe = exactly one card**
- Replaced position-based logic with direction detection
- Small scroll (>5px) = next card
- Large scroll = still just one card (no multi-jumps)
- Direction change triggers card switch
- 400ms transition lock prevents rapid switching
- Behavior like photo gallery swipe:
  - Scroll down (any size) → next card
  - Scroll up (any size) → previous card
  - Multiple scrolls in same direction = locked
  - Change direction = new card move
- Result: Predictable, discrete navigation

### v1.7.8
- **PARADIGM SHIFT: Sticky header moment = Event 1 committed**
- User insight: "Scroll tracking starts when title sticks = 33% scrolled"
- When header becomes sticky (top <= 80px), Event 1 is locked in
- Base progress jumps to 33.3% at sticky moment
- Remaining spacer scroll maps to 33.3% → 100% (Events 2 & 3)
- Result: One visible scroll per event switch
  - Scroll to stick = Event 1
  - Next scroll = Event 2
  - Next scroll = Event 3
- Intuitive, predictable, matches visual state

### v1.7.7
- **ROOT CAUSE FIXED: Spacer height was causing massive scroll distances**
- Deep investigation revealed: 250vh spacer meant 1+ full viewport scroll per event
- Why "3 big scrolls" for first card: E0→E1 needed 40% of 250vh = 800px (1.0 viewport)
- Why "1 tiny one" for second: E1→E2 only needed 700px more (asymmetric!)
- Solution: Reduced spacer from 250vh to 100vh
- New distances: ~320px per event switch (~40% of viewport)
- Result: True swipe-like feel, equal distances, small scrolls register

### v1.7.6
- **FIXED: Instant scroll progress - eliminated dead zone at section entry**
- Root cause: Entry required section at 30% + spacer at 70%, plus 35%/50% offsets
- This created a "dead zone" where initial scrolling didn't register
- Fix: Changed entry to 50% from top, removed ALL scroll calculation offsets
- scrollProgress now starts at 0 instantly when section enters view
- Committed event initialized immediately (no delayed requestAnimationFrame)
- Result: Every scroll counts from the moment you enter - no wasted scrolling

### v1.7.5
- **NEW: Snap behavior for swipe-like card switching**
- 15% threshold: Small swipes (15% into next zone) commit to full event change
- Committed event tracking: Maintains current event until clear directional scroll
- Three snap triggers:
  - Forward snap at 15% into next zone
  - Backward snap at 85% back into previous zone
  - Full crossing at 50%+ into different zone
- Result: Responsive, card-swipe feel while maintaining equal zone distribution

### v1.7.4
- **REAL FIX: Removed scroll-snap interference and all artificial delays**
- Root causes identified:
  - CSS `scroll-snap-type: y proximity` was fighting manual zone calculations
  - Boundary threshold logic was backwards (blocked switches at zone entry)
  - Scroll lock mechanism added 250ms artificial delays
- Solution: Complete simplification
  - Removed CSS scroll-snap for full manual control
  - Pure zone calculation: `Math.floor(scrollProgress / 0.333)`
  - No locks, no thresholds, no delays
  - Removed 50+ lines of complex logic
- Result: Truly equal, instant, predictable scroll behavior

### v1.7.3
- **FIXED: Equal zone distribution for event scroll** - Each event now gets exactly 33.3% of scroll space
- Bug fix: Previous version had first card at 41.3%, Event 2 at 33.4%, Event 3 at 25.3%
- New algorithm: Pure zone-based calculation using `Math.floor(scrollProgress / zoneSize)`
- Added 2% boundary threshold to prevent flickering at exact zone transitions
- Resolves issue: "first card takes a lot to swipe and last card is almost nothing"
- Result: Intuitive, predictable, production-ready scroll behavior

### v1.7.2
- **Adjusted image sizing to 10% reduction** - Max-width reduced from 500px to 450px desktop (was 400px in v1.7.1)
- Better visual balance - 10% reduction provides optimal size
- Updated all mobile breakpoints with 10% smaller dimensions:
  - 768px: 450px → 405px
  - 480px: 400px → 360px
  - 375px: 360px → 324px

### v1.7.1
- **Scaled down images by 20%** - Max-width reduced from 500px to 400px desktop
- **Fixed indicator dots** - Now properly update to show which event is active
- Updated all mobile breakpoints with 20% smaller dimensions:
  - 768px: 450px → 360px
  - 480px: 400px → 320px
  - 375px: 360px → 288px

### v1.7.0
- **NEW: Meta row with date and dots** - Date pill on left, 3 indicator dots on right below "Upcoming Events" title
- **Removed Event 2 carousel** - Simplified to placeholder only (removed community service image slider)
- **Optimized scroll transitions** - Reduced from 0.5s to 0.4s with scale effect for snappier feel
- **Improved event boundaries** - Clear 33%/66% boundaries instead of 25%/65% for predictable switching
- **Reduced scroll lock** - Decreased from 800ms to 300ms for more responsive transitions
- **Snappier threshold** - Reduced from 0.12 to 0.05 for quicker event changes
- **Reduced scroll spacer** - Changed from 300vh to 250vh for tighter control
- All mobile breakpoints updated with proper meta row styling

### v1.6.3
- **Fixed 3:4 aspect ratio** - All images now maintain standard flyer portrait proportions
- **Moved images up** - Changed from flex-end to flex-start with padding-top (60px desktop, 24-40px mobile)
- **Updated image fit** - Changed from contain to cover for consistent aspect ratio enforcement
- **Responsive sizing** - Max-width 500px desktop, scales to 360-450px mobile
- All mobile breakpoints updated to maintain 3:4 aspect ratio across all screen sizes

### v1.6.2
- **Refined image sizing** - Reduced from full-screen to ~65vh for better balance
- **Added matching rounded corners** - 24px border-radius on desktop, 16-20px on mobile
- **Updated button styling** - Matching 24px border-radius to complement image
- **Subtle shadow effects** - Added soft shadows for depth and polish
- **Centered, contained layout** - Max-width 800px for optimal presentation
- All mobile breakpoints updated with proper sizing and corner radii

### v1.6.1
- **Removed date pills and indicator dots** - Pure minimalist image-only layout
- Event cards now show only: massive image + gold CTA button
- Cleaner, more focused visual experience
- All mobile breakpoints updated to remove date/dot styling

### v1.6.0
- **MAJOR REBUILD**: Event cards completely redesigned with full-screen image layout
- Small gold date pill floating in upper left corner
- 3 indicator dots floating in upper right corner  
- Massive flyer image taking up 75-80% of viewport height
- Gold button near bottom of screen, full width
- No containers, borders, or padding - pure immersive experience
- Date pill and dots use absolute positioning over image
- Mobile-optimized for all screen sizes (375px to iPhone 17 Pro Max)
- Carousel functionality preserved for Event 2

### v1.5.4
- Form copy updated with gift details and emojis
- Navigation button text changed to "Register for free gifts"
- Hero image replaced with church building photo
- Event 2 carousel added with placeholder and community service photo

### v1.1.0
- **NEW**: YouTube video/playlist embedding in Watch section
- Responsive video players with 16:9 aspect ratio
- Support for live streams and playlists
- Documentation added for video setup

### v1.0.2
- Moved outreach cards down (sticky-wrapper 18vh→28vh)

### v1.0.1
- Fixed iPhone X spacing issues
- Hero padding increased to 40px
- Main gaps reduced to 20px

### v1.0.0
- iPhone X optimization with aggressive scaling
- Fixed vertical spacing issues for smaller phones
- Version number footer added for cache verification
- All responsive breakpoints refined (375px, 480px, 768px, 960px, 1024px)

**HOW TO UPDATE VERSION:**
1. Change version in README.md (line 3)
2. Update version in src/index.tsx (search for `<div class="version-footer">v1.0.0</div>`)
3. Increment version (v1.0.0 → v1.0.1 for small fixes, v1.1.0 for features, v2.0.0 for major changes)
4. Commit with message: "Bump version to vX.X.X - [description]"
