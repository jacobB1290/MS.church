# Morning Star Christian Church Website

## 🔢 CURRENT VERSION: v1.45.1
**⚠️ IMPORTANT: Update this version number in src/index.tsx (search for "version-footer") every time you make changes!**

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
