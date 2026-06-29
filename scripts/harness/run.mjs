// Visual + behavioral test harness for MS.church refinement work.
//
// Catches what the user has been complaining about (mid-transition flicker,
// content covered by fixed header, layout shift, wasted reserved space)
// in addition to the basic correctness checks (anchor landing drift,
// no console errors, no in-flight animations after settle, CLS).
//
// Outputs:
//   scripts/harness/output/<scenario>.png                  final state
//   scripts/harness/output/<scenario>.webm                 video of flows
//   scripts/harness/output/<scenario>/frame-NN-NNms.png    transition frames
//   scripts/harness/output/report.html                     all-in-one review
//   scripts/harness/output/results.txt                     text summary
//
// Run:
//   npm run dev                              # in another terminal
//   HARNESS_URL=http://localhost:5173 npm run harness

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readdirSync, renameSync, existsSync, rmSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, relative } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Optional path to a pre-provisioned Chromium (set PW_EXECUTABLE_PATH when the
// machine's Playwright browser build differs from the npm package's expected
// build). Undefined falls back to Playwright's own download, so CI is unchanged.
const EXEC_PATH = process.env.PW_EXECUTABLE_PATH || undefined
const OUT_DIR = resolve(__dirname, 'output')
mkdirSync(OUT_DIR, { recursive: true })

const BASE = process.env.HARNESS_URL
  || process.argv.find((a) => a.startsWith('--url='))?.slice('--url='.length)
  || 'http://localhost:5173'

// ============================================================
// Strictness knobs
// ============================================================
const DRIFT_LAND_TOLERANCE = 25
const DRIFT_STABLE_TOLERANCE = 5
const CLS_THRESHOLD = 0.10

// Performance thresholds. Two tiers because modern phones run at 120Hz and
// most desktop monitors are 60Hz/120Hz/144Hz — we want to know which budget
// the page is hitting. Each scenario is graded against the 120fps "great"
// bar by default; the 60fps "ok" bar is the absolute minimum (any failure
// at the 60fps tier is a hard fail; failures at only the 120fps tier are
// "aspirational" — they tell us where to optimize for ProMotion devices).
//
// To measure actual per-frame work cost we disable Chromium's vsync + the
// 60fps rAF cap (see chromium.launch args below) so rAF intervals reflect
// what the browser ACTUALLY computes per frame, not what vsync hands back.
const PERF_120 = {
  label: '120fps tier',
  avgFpsMin: 100,         // 120fps = 8.33ms/frame; allow some slack
  p95FrameMaxMs: 12,      // 95% of frames within ~10ms
  maxFrameMs: 22,         // no single frame > 22ms (45fps budget)
  stutterFrameMax: 2,     // ≤2 frames > 16.67ms (the 60fps line)
  longTaskMaxMs: 50,      // any longtask = jank on 120Hz
  longTaskMaxCount: 0,
  loafMaxDurationMs: 50,
  loafMaxCount: 1,
  inputLatencyMaxMs: 100,
}
const PERF_60 = {
  label: '60fps tier',
  avgFpsMin: 50,
  p95FrameMaxMs: 22,
  maxFrameMs: 60,
  stutterFrameMax: 3,
  longTaskMaxMs: 100,
  longTaskMaxCount: 1,
  loafMaxDurationMs: 120,
  loafMaxCount: 2,
  // Cross-page navigation cost on mobile = view-transition (~450ms ease)
  // + HTML parse + first paint. 220ms locally is "fast"; users typically
  // perceive < 300ms as instant. The 120fps tier is stricter (100ms).
  // Allow 300ms for click-to-navigate — typical scenarios land 200-280ms
  // in headless chromium; tighter than that flakes on harness jitter.
  inputLatencyMaxMs: 300,
}
// Backwards-compat alias used by the HTML report. Default reporting uses the
// 60fps bar (so green/red coloring matches the "ship" bar); 120fps results
// are shown as extra metrics on each scenario card.
const PERF = PERF_60

// Smooth-scroll deep-link landing typically completes in ~700ms (the
// subpage-header script does its second rescroll pass at 800ms). Sample
// over a window that captures both the journey (for the report) and the
// final stable state. Stability is asserted across the last three samples.
// Sample windows tuned for browser-native scrollTo({behavior:'smooth'}).
// On a 2851px scroll (the longest on the site), Chrome's native smooth-
// scroll takes ~850ms. Add the 220ms initial delay and a buffer for
// the 1500ms snap-correct check:
//   100  — pre-scroll baseline
//   500  — mid-scroll snapshot (informational)
//   1500 — post-scroll (should match expected landing)
//   2000 — stable check
//   2600 — stable check
// Subpage hashload (v1.49.5): page-head paints main invisible
// (opacity 0 + translateY 40px). Subpage-header waits for
// window.load + fonts.ready (≤150ms cap) + 2rAF + rIC, does an
// INSTANT scrollTo, then a watchdog re-measures every 100ms until
// position is stable for 300ms (or a 1500ms hard cap) — corrections
// are invisible because fade-in hasn't fired. Fade-in then runs
// 950ms (opacity + transform). Worst-case time-to-visible-and-still:
//   afterLoad (~500ms) + watchdog stability (≤1500ms) + fade-in (950ms)
//   ≈ 3000ms.
// Stable DRIFT samples must therefore all sit past ~3.2s.
const DRIFT_SAMPLES_MS = [200, 1500, 3500, 4200, 5000]
const DRIFT_STABLE_SAMPLES = 3 // last N samples must be within DRIFT_STABLE_TOLERANCE

// Visual quality knobs
// FIXED_HEADER_BOTTOM = where the floating-header zone (.subpage-top-fog + brand + back)
// ends. Anchored sections must land BELOW this; eyebrow/heading must be visible BELOW this.
// "Visually opaque" bottom of the fixed-header fog — NOT the CSS height
// (which is 110/88). The .subpage-top-fog uses a linear-gradient mask
// that fades to ~40% opacity at 65% of its CSS height and to fully
// transparent at 100%. Below ~75% the fog is barely visible, so a
// heading underneath that zone still reads clearly. The harness should
// reflect what the user sees, not the CSS pixel boundary — so we use
// the opaque region (~75% of fog height = 82px desktop / 66px mobile)
// as the "header zone" baseline for heading-coverage checks.
const FIXED_HEADER_BOTTOM_DESKTOP = 82
const FIXED_HEADER_BOTTOM_MOBILE  = 66
const HEADING_MIN_VISIBLE_PX = 24
const RESERVED_WASTE_THRESHOLD = 120

const DESKTOP = { width: 1280, height: 800 }
const MOBILE  = { width: 390,  height: 844 }

// Suppress sandbox/offline-only third-party noise
const IGNORED_ERROR_PATTERNS = [
  /ERR_CERT_AUTHORITY_INVALID/, /ERR_NAME_NOT_RESOLVED/, /ERR_INTERNET_DISCONNECTED/,
  /vercel-insights/, /vercel\.com\/_vercel\/insights/, /Failed to load resource/,
  /fonts\.googleapis\.com/, /fonts\.gstatic\.com/,
  /youtube/i, /lh3\.googleusercontent/, /engagehub/, /jotform/i, /googleapis\.com/,
  /service\?service=/, /script\.js/, /cdn\.vercel-insights/,
  // The UA's own cross-document view-transition promise rejects with
  // this when rapid navigation skips the transition — browser-internal,
  // not initiated or catchable by site code.
  /Transition was skipped/,
]
const isIgnoredError = (text) => IGNORED_ERROR_PATTERNS.some((re) => re.test(text))

// ============================================================
// Scenarios
// ============================================================
const ANCHOR_SCENARIOS = [
  { name: '01-home-desktop',           path: '/',                                  viewport: DESKTOP, headingSelector: '.section-eyebrow' },
  { name: '02-home-mobile',            path: '/',                                  viewport: MOBILE,  headingSelector: '.section-eyebrow' },
  { name: '03-about-desktop',          path: '/about',                             viewport: DESKTOP, headingSelector: '.section-eyebrow' },
  { name: '04-about-mobile',           path: '/about',                             viewport: MOBILE,  headingSelector: '.section-eyebrow' },
  { name: '05-outreach-desktop',       path: '/outreach',                          viewport: DESKTOP, headingSelector: '.section-eyebrow' },
  { name: '06-outreach-mobile',        path: '/outreach',                          viewport: MOBILE,  headingSelector: '.section-eyebrow' },
  { name: '07-visit-desktop',          path: '/visit',                             viewport: DESKTOP, headingSelector: '.section-eyebrow' },
  { name: '08-visit-mobile',           path: '/visit',                             viewport: MOBILE,  headingSelector: '.section-eyebrow' },
  { name: '09-watch-desktop',          path: '/watch',                             viewport: DESKTOP, headingSelector: '.section-eyebrow' },
  { name: '09b-watch-mobile',          path: '/watch',                             viewport: MOBILE,  headingSelector: '.section-eyebrow' },

  { name: '10-jump-cooking-desktop',   path: '/outreach', anchor: '#cooking-ministry',    viewport: DESKTOP, expected: 90 },
  { name: '11-jump-cooking-mobile',    path: '/outreach', anchor: '#cooking-ministry',    viewport: MOBILE,  expected: 75 },
  { name: '12-jump-before-desktop',    path: '/visit',    anchor: '#before-you-come',     viewport: DESKTOP, expected: 90 },
  { name: '13-jump-before-mobile',     path: '/visit',    anchor: '#before-you-come',     viewport: MOBILE,  expected: 75 },
  { name: '14-jump-breakfast-mobile',  path: '/outreach', anchor: '#community-breakfast', viewport: MOBILE,  expected: 75 },
  { name: '15-jump-mission-mobile',    path: '/about',    anchor: '#mission',             viewport: MOBILE,  expected: 75 },
  { name: '16-jump-expect-desktop',    path: '/visit',    anchor: '#what-to-expect',      viewport: DESKTOP, expected: 90 },
  { name: '17-jump-location-mobile',   path: '/visit',    anchor: '#location',            viewport: MOBILE,  expected: 75 },

  // /privacy rebuilt onto the standard subpage chrome (subpageHeader +
  // subpage-jump) — verify its #terms anchor lands at the standard
  // subpage offsets like every other in-page jump.
  { name: '17b-jump-privacy-terms-desktop', path: '/privacy', anchor: '#terms', viewport: DESKTOP, expected: 90 },
  { name: '17c-jump-privacy-terms-mobile',  path: '/privacy', anchor: '#terms', viewport: MOBILE,  expected: 75 },

  // /watch — the service library. Same subpage hashload mechanism as /visit, so
  // its anchors must land at the standard subpage offsets (90 desktop, 75 mobile).
  // #latest sits right under the intro; #watch-cta is the last section (the
  // max-scrollY edge case) — both render in every mode (the library sections
  // need published content, so they're not in the default no-feed run).
  { name: '20-jump-watch-latest-desktop', path: '/watch', anchor: '#latest',    viewport: DESKTOP, expected: 90 },
  { name: '21-jump-watch-latest-mobile',  path: '/watch', anchor: '#latest',    viewport: MOBILE,  expected: 75 },
  { name: '22-jump-watch-cta-desktop',    path: '/watch', anchor: '#watch-cta', viewport: DESKTOP, expected: 90 },
  { name: '23-jump-watch-cta-mobile',     path: '/watch', anchor: '#watch-cta', viewport: MOBILE,  expected: 75 },

  // 18s — NETWORK-THROTTLED landing-accuracy. Routine check that
  // the hashload lands at the right offset even when the calendar
  // / image / font fetches finish AFTER the page first paints.
  // Localhost is so fast it never exercises the "calendar mounts
  // after scrollTo" path; this throttles latency to surface that
  // class of bug at CI time. If the section lands > 25px off
  // expected, the suite fails — same threshold as unthrottled
  // anchor scenarios.
  { name: '18-jump-cooking-net3g-mobile',  path: '/outreach', anchor: '#cooking-ministry',    viewport: MOBILE,  expected: 75, netThrottle: { latencyMs: 250, downKbps: 1500, upKbps: 750 } },
  { name: '19-jump-cooking-net3g-desktop', path: '/outreach', anchor: '#cooking-ministry',    viewport: DESKTOP, expected: 90, netThrottle: { latencyMs: 250, downKbps: 1500, upKbps: 750 } },

  // v1.62.50 — home-page hashload landing accuracy. Subpages used the
  // hash-fade + instant-scroll + watchdog flow for years; the home page
  // was still doing scrollTo(0,0) + nav-link.click() smooth-scroll, so
  // /#schedule navigation from a subpage visibly bounced through the
  // hero before settling. New home-scripts.ts ports the subpage flow
  // (hash-fade in head, instant scroll while invisible, watchdog,
  // fade-in).
  //
  // Landing math: getHomeAnchorTargetY scrolls so the section eyebrow
  // tucks behind the nav-shell (eyebrow.bottom <= navBottom - 2px).
  // The SECTION'S top therefore lands at:
  //   • mobile (no padding-top on any home section): top = 16
  //   • desktop most sections (no padding-top): top = 60
  //   • desktop schedule (padding-top: 100px to clear hero-bridge blur
  //     when scrolling through hero): top = -40 (scrolled past section
  //     start so eyebrow lands at 60 in viewport)
  { name: '83-jump-home-schedule-mobile',   path: '/', anchor: '#schedule', viewport: MOBILE,  expected: 16 },
  { name: '84-jump-home-schedule-desktop',  path: '/', anchor: '#schedule', viewport: DESKTOP, expected: -40 },
  { name: '85-jump-home-outreach-mobile',   path: '/', anchor: '#outreach', viewport: MOBILE,  expected: 16 },
  { name: '86-jump-home-outreach-desktop',  path: '/', anchor: '#outreach', viewport: DESKTOP, expected: 60 },
  { name: '87-jump-home-about-mobile',      path: '/', anchor: '#about',    viewport: MOBILE,  expected: 16 },
  { name: '88-jump-home-watch-desktop',     path: '/', anchor: '#watch',    viewport: DESKTOP, expected: 60 },

  // Per-CTA topic deep-links (e.g. "Join the next cook" → /?topic=…#contact)
  // reuse the home hashload. The injected "Regarding" banner sits BELOW the
  // section eyebrow, so it must NOT shift the landing — these assert the
  // contact section lands exactly where a plain /#contact does (desktop 80,
  // mobile 32, measured identical with and without ?topic).
  { name: '89-jump-home-contact-topic-desktop', path: '/?topic=cooking-ministry', anchor: '#contact', viewport: DESKTOP, expected: 80 },
  { name: '90-jump-home-contact-topic-mobile',  path: '/?topic=cooking-ministry', anchor: '#contact', viewport: MOBILE,  expected: 32 },
]

// Performance scenarios — each runs an interaction (scroll / hash / click)
// while sampling rAF intervals, long-tasks, and long-animation-frames.
const PERF_SCENARIOS = [
  // 30s — page scrolls: top → bottom while recording every frame interval.
  { name: '30-perf-scroll-home-desktop',     viewport: DESKTOP, path: '/',         action: 'scroll' },
  { name: '31-perf-scroll-home-mobile',      viewport: MOBILE,  path: '/',         action: 'scroll' },
  { name: '32-perf-scroll-visit-mobile',     viewport: MOBILE,  path: '/visit',    action: 'scroll' },
  { name: '33-perf-scroll-outreach-mobile',  viewport: MOBILE,  path: '/outreach', action: 'scroll' },
  { name: '34-perf-scroll-about-mobile',     viewport: MOBILE,  path: '/about',    action: 'scroll' },
  { name: '34c-perf-scroll-watch-mobile',    viewport: MOBILE,  path: '/watch',    action: 'scroll' },

  // 35s — smooth-scroll-to-hash (anchor jumps on the same page).
  { name: '35-perf-hash-visit-sundayschool-mobile', viewport: MOBILE, path: '/visit',    action: 'hash', hash: '#before-you-come' },
  { name: '36-perf-hash-visit-whattoexpect-mobile', viewport: MOBILE, path: '/visit',    action: 'hash', hash: '#what-to-expect' },
  { name: '37-perf-hash-outreach-cooking-mobile',   viewport: MOBILE, path: '/outreach', action: 'hash', hash: '#cooking-ministry' },

  // 34b — nav morph scrub: the scroll-driven full↔compressed nav
  // animation, scrubbed across its 0–134px range in both directions.
  // Catches per-frame cost regressions in the morph (keyframe bloat,
  // accidental layout invalidation outside the nav subtree). The
  // dedicated nav-morph.mjs suite covers correctness in Chromium AND
  // WebKit; this keeps the routine perf gate watching it too.
  { name: '34b-perf-navscrub-home-mobile',   viewport: MOBILE,  path: '/',         action: 'navscrub' },

  // 38s — cross-page click navigations (view-transition path).
  // The hero Find Us button became the Plan a Visit navigation link; selector retargeted, perf profile (click → navigate → observe) unchanged.
  { name: '38-perf-click-planavisit-mobile',  viewport: MOBILE,  path: '/', action: 'click', selector: 'a.find-us-link' },
  { name: '39-perf-click-planavisit-desktop', viewport: DESKTOP, path: '/', action: 'click', selector: 'a.find-us-link' },

  // 40s — hash-LOAD smooth-scroll. Tests the actual user path: load
  // a subpage URL with a hash; the subpage-header.ts inline script
  // auto-triggers window.__smoothScrollToHash. Measures rAF intervals,
  // scroll-position deltas (perceived smoothness), and CLS during the
  // auto-scroll. This is what users feel on first visit, not what a
  // programmatic scrollIntoView() call feels like.
  { name: '40-perf-hashload-visit-sunday-desktop',   viewport: DESKTOP, path: '/visit',    action: 'hashload', hash: '#before-you-come' },
  { name: '41-perf-hashload-visit-sunday-mobile',    viewport: MOBILE,  path: '/visit',    action: 'hashload', hash: '#before-you-come' },
  { name: '42-perf-hashload-visit-expect-desktop',   viewport: DESKTOP, path: '/visit',    action: 'hashload', hash: '#what-to-expect' },
  { name: '43-perf-hashload-outreach-cook-desktop',  viewport: DESKTOP, path: '/outreach', action: 'hashload', hash: '#cooking-ministry' },
  { name: '44-perf-hashload-outreach-cook-mobile',   viewport: MOBILE,  path: '/outreach', action: 'hashload', hash: '#cooking-ministry' },
  { name: '45-perf-hashload-about-mission-mobile',   viewport: MOBILE,  path: '/about',    action: 'hashload', hash: '#mission' },
  { name: '45b-perf-hashload-watch-cta-mobile', viewport: MOBILE, path: '/watch',  action: 'hashload', hash: '#watch-cta' },

  // 50s — HARD: CPU-throttled hashload scenarios. Simulates a slow
  // mid-range mobile (4× CPU slowdown). If our scroll path has any
  // main-thread work that's borderline on real devices, throttled
  // perf will surface it as long-tasks, LoAF spikes, or stutters.
  // Use the actual user path (URL with hash → subpage-header.ts
  // auto-trigger) so we test browser-native scrollTo under load.
  { name: '50-perf-cpu4x-hashload-visit-sunday-desktop',  viewport: DESKTOP, path: '/visit',    action: 'hashload', hash: '#before-you-come',    cpuThrottle: 4 },
  { name: '51-perf-cpu4x-hashload-visit-sunday-mobile',   viewport: MOBILE,  path: '/visit',    action: 'hashload', hash: '#before-you-come',    cpuThrottle: 4 },
  { name: '52-perf-cpu4x-hashload-outreach-cook-mobile',  viewport: MOBILE,  path: '/outreach', action: 'hashload', hash: '#cooking-ministry', cpuThrottle: 4 },
  { name: '53-perf-cpu4x-hashload-about-mission-mobile',  viewport: MOBILE,  path: '/about',    action: 'hashload', hash: '#mission',          cpuThrottle: 4 },

  // 60s — HARDER: 6× CPU throttle. Mimics an entry-level Android
  // device. Real users on cheap phones will hit this; if our scroll
  // perf collapses at 6× we need to find the bottleneck.
  { name: '60-perf-cpu6x-hashload-visit-sunday-mobile',   viewport: MOBILE,  path: '/visit',    action: 'hashload', hash: '#before-you-come',    cpuThrottle: 6 },
  { name: '61-perf-cpu6x-hashload-outreach-cook-mobile',  viewport: MOBILE,  path: '/outreach', action: 'hashload', hash: '#cooking-ministry', cpuThrottle: 6 },

  // 70s — A/B BASELINE PAIRS. The home page anchor-click scroll feels
  // smooth; the subpage hashload scroll feels jagged — even though both
  // use the IDENTICAL primitive (window.scrollTo({behavior:'smooth'})).
  // The variable is main-thread context: home click fires on a fully-
  // settled page, hashload fires during initial page work.
  //
  // These pairs run the same scroll distance on home (post-settle nav
  // click) and on subpage (URL hashload). The during-scroll metrics
  // (loafDuringScroll, rafGapsOver20ms, scrollStallMs) expose the gap.
  // Pair groups are tagged with `ab` so the report renders them
  // side-by-side. INFORMATIONAL — they always pass; the gap data is
  // what we iterate against.
  { name: '70-ab-home-click-contact-mobile',           viewport: MOBILE,  path: '/',         action: 'homeclick', anchor: '#contact', ab: 'mobile-long' },
  { name: '71-ab-hashload-visit-sunday-mobile',        viewport: MOBILE,  path: '/visit',    action: 'hashload',  hash: '#before-you-come',  ab: 'mobile-long' },
  { name: '72-ab-hashload-outreach-cooking-mobile',    viewport: MOBILE,  path: '/outreach', action: 'hashload',  hash: '#cooking-ministry', ab: 'mobile-long' },
  { name: '73-ab-hashload-about-mission-mobile',       viewport: MOBILE,  path: '/about',    action: 'hashload',  hash: '#mission',          ab: 'mobile-long' },
  { name: '74-ab-home-click-contact-desktop',          viewport: DESKTOP, path: '/',         action: 'homeclick', anchor: '#contact', ab: 'desktop-long' },
  { name: '75-ab-hashload-visit-sunday-desktop',       viewport: DESKTOP, path: '/visit',    action: 'hashload',  hash: '#before-you-come',  ab: 'desktop-long' },
  { name: '76-ab-hashload-outreach-cooking-desktop',   viewport: DESKTOP, path: '/outreach', action: 'hashload',  hash: '#cooking-ministry', ab: 'desktop-long' },

  // 80s — NETWORK-THROTTLED hashloads. Routine landing-accuracy
  // check under realistic conditions. Localhost serves /api/calendar
  // /events in ~5-50ms; the calendar carousel mounts before our
  // scrollTo fires, so a fast harness misses the case where the
  // carousel mounts AFTER scrollTo and pushes the target section
  // down. With ~250ms latency the mount lands later, exercising
  // the invisible-stability watchdog. The HARNESS LANDING CHECK
  // (sampling target.top at the end of the capture) verifies the
  // section lands at the expected offset even under this load —
  // catches "lands 50% off target" regressions before they ship.
  { name: '80-perf-net3g-hashload-outreach-cooking-mobile', viewport: MOBILE,  path: '/outreach', action: 'hashload', hash: '#cooking-ministry', netThrottle: { latencyMs: 250, downKbps: 1500, upKbps: 750 } },
  { name: '81-perf-net3g-hashload-outreach-cooking-desktop', viewport: DESKTOP, path: '/outreach', action: 'hashload', hash: '#cooking-ministry', netThrottle: { latencyMs: 250, downKbps: 1500, upKbps: 750 } },
  { name: '82-perf-net3g-hashload-visit-sunday-mobile',    viewport: MOBILE,  path: '/visit',    action: 'hashload', hash: '#before-you-come',    netThrottle: { latencyMs: 250, downKbps: 1500, upKbps: 750 } },
]

const FLOW_SCENARIOS = [
  {
    name: '20-flow-home-to-outreach-and-back-desktop',
    viewport: DESKTOP,
    steps: [
      { type: 'goto', url: '/' },
      { type: 'navigate', kind: 'click', selector: 'a[href="/outreach"]', captureFrames: true },
      { type: 'navigate', kind: 'goBack', captureFrames: true },
      { type: 'navigate', kind: 'goForward', captureFrames: true },
    ],
  },
  {
    name: '21-flow-home-to-outreach-anchor-and-back-mobile',
    viewport: MOBILE,
    steps: [
      { type: 'goto', url: '/' },
      // Retargeted from /outreach#cooking-ministry → /outreach#meals-hospitality (teaser anchor changed).
      { type: 'navigate', kind: 'click', selector: 'a[href="/outreach#meals-hospitality"]', captureFrames: true },
      { type: 'navigate', kind: 'goBack', captureFrames: true },
    ],
  },
  {
    name: '22-flow-home-to-about-and-back-mobile',
    viewport: MOBILE,
    steps: [
      { type: 'goto', url: '/' },
      { type: 'navigate', kind: 'click', selector: 'a[href="/about"]', captureFrames: true },
      { type: 'navigate', kind: 'goBack', captureFrames: true },
    ],
  },
  {
    name: '23-flow-home-planavisit-to-visit-and-back-mobile',
    viewport: MOBILE,
    steps: [
      { type: 'goto', url: '/' },
      { type: 'navigate', kind: 'click', selector: 'a.find-us-link', captureFrames: true },
      { type: 'navigate', kind: 'goBack', captureFrames: true },
    ],
  },
  // v1.62.50 — subpage → home-anchor flow. Verifies the user-visible
  // entrance when clicking a /#schedule (or similar) cross-page link
  // from a subpage. Before the fix: the home page rendered with the
  // hero visible at the top, then smooth-scrolled down to the target
  // section — a visible bounce-through-hero. After: same fade-in
  // entrance the subpages already use for hash-loads (main paints
  // invisible, instant scroll lands at target, then main fades +
  // slides in over ~900ms). Video review confirms the hero is never
  // visible during the entrance.
  {
    name: '26-flow-subpage-to-home-schedule-mobile',
    viewport: MOBILE,
    steps: [
      { type: 'goto', url: '/about' },
      { type: 'navigate', kind: 'directNav', url: '/#schedule', captureFrames: true },
    ],
  },
  {
    name: '27-flow-subpage-to-home-outreach-desktop',
    viewport: DESKTOP,
    steps: [
      { type: 'goto', url: '/about' },
      { type: 'navigate', kind: 'directNav', url: '/#outreach', captureFrames: true },
    ],
  },
  // Scroll-through scenarios — capture video of home page top-to-bottom so
  // a human can review the scroll-driven reveals (schedule tabs floating up,
  // about image scaling in, outreach cards offering forward, watch frame
  // powering on, contact form fading in). Reveal sanity-check is included in
  // the step handler: it fails the scenario if any .reveal target failed to
  // fire after the page reached the bottom.
  {
    name: '24-flow-home-reveal-scroll-desktop',
    viewport: DESKTOP,
    steps: [
      { type: 'goto', url: '/' },
      { type: 'scroll', to: 'bottom', durationMs: 5000, checkReveals: true },
    ],
  },
  {
    name: '25-flow-home-reveal-scroll-mobile',
    viewport: MOBILE,
    steps: [
      { type: 'goto', url: '/' },
      { type: 'scroll', to: 'bottom', durationMs: 5500, checkReveals: true },
    ],
  },
]

// ============================================================
// Navigation + entrance flicker scenarios. These are tuned for
// the bugs the user reports seeing on iPhone Safari (Safari iOS
// does not implement cross-document @view-transition, so the
// Chrome crossfade isn't the issue):
//
//   1) Reveal-class FOUC — the .reveal-* elements paint visible,
//      then JS adds .js-reveals on DOMContentLoaded which hides
//      them at opacity 0, then IntersectionObserver animates
//      them back in. That's a visible flash on every page load.
//   2) Logo movement on scroll-restore — Safari aggressively
//      restores scroll position from session. The nav-shell
//      paints in its unscrolled state (brand visible), then JS
//      detects scroll > 19px and triggers .scrolled-mobile
//      via a 600ms transition. Brand visibly slides/fades away.
//   3) .subpage-brand.hidden flicker — if user scrolled before
//      navigating back, the brand may be in its translateY(-150%)
//      state mid-transition.
//   4) Section entrance race — sections start at opacity 0 +
//      translateY(8px) with a gentleRise animation; if html
//      isn't synchronously tagged with no-entrance on
//      back/forward, sections briefly flash invisible.
//
// We sample DOM + pixel buffer at ~12 timestamps from action
// trigger to ~700ms post-action. Each sample collects: brand
// box + opacity, main opacity, in-flight CSS animation count,
// reveal-state counts (hidden vs revealed), small thumb
// screenshot for pixel-variance "blank frame" detection.
// ============================================================
const FLICKER_SCENARIOS = [
  // 90s — fresh-page load (no prior visit). Captures the
  // reveal-FOUC + section-entrance flash that hits every cold
  // open. Mobile-first per the user's iPhone Safari context.
  { name: '90-flicker-load-home-mobile',     viewport: MOBILE,  load: '/',         scrollY: 0 },
  { name: '91-flicker-load-outreach-mobile', viewport: MOBILE,  load: '/outreach', scrollY: 0 },
  { name: '92-flicker-load-visit-mobile',    viewport: MOBILE,  load: '/visit',    scrollY: 0 },
  { name: '93-flicker-load-about-mobile',    viewport: MOBILE,  load: '/about',    scrollY: 0 },
  // Cold-load with restored scroll position. Simulates Safari iOS
  // bfcache / session-restore: a returning user lands at a deep
  // scroll position. If .nav-shell paints unscrolled and JS adds
  // .scrolled-mobile via a 600ms transition, the brand visibly
  // slides away — that's the "logo movement animation flicker".
  { name: '94-flicker-load-home-scrollRestore-mobile', viewport: MOBILE, load: '/', scrollY: 800 },
  { name: '95-flicker-load-visit-scrollRestore-mobile', viewport: MOBILE, load: '/visit', scrollY: 1200 },
  // Cross-document navigation paths the user explicitly named —
  // "this flicker that happens when exiting subpages". These
  // sample DOM + pixels every ~30ms from click → land + 700ms.
  { name: '96-flicker-nav-home-to-outreach-mobile', viewport: MOBILE, from: '/',         action: { type: 'click', selector: 'a[href="/outreach"]' }, expectURL: '/outreach' },
  { name: '97-flicker-nav-outreach-back-mobile',    viewport: MOBILE, from: '/outreach', action: { type: 'click', selector: '.subpage-back' },       expectURL: '/' },
  { name: '98-flicker-nav-about-back-mobile',       viewport: MOBILE, from: '/about',    action: { type: 'click', selector: '.subpage-back' },       expectURL: '/' },
  { name: '99-flicker-nav-visit-back-mobile',       viewport: MOBILE, from: '/visit',    action: { type: 'click', selector: '.subpage-back' },       expectURL: '/' },
  // Worst-case logo flicker — user scrolled on subpage so
  // .subpage-brand is in its translateY(-150%) hidden state when
  // they tap back. Anything that morphs the brand cross-doc has
  // to deal with the brand starting off-screen.
  { name: '100-flicker-nav-outreach-scrolled-back-mobile', viewport: MOBILE, from: '/outreach', preScroll: 800,  action: { type: 'click', selector: '.subpage-back' }, expectURL: '/' },
  { name: '101-flicker-nav-visit-scrolled-back-mobile',    viewport: MOBILE, from: '/visit',    preScroll: 1500, action: { type: 'click', selector: '.subpage-back' }, expectURL: '/' },
  // Desktop sanity checks — same paths, different viewport.
  // Lower count because mobile is the user's environment.
  { name: '110-flicker-nav-home-to-outreach-desktop', viewport: DESKTOP, from: '/',         action: { type: 'click', selector: 'a[href="/outreach"]' }, expectURL: '/outreach' },
  { name: '111-flicker-nav-outreach-back-desktop',    viewport: DESKTOP, from: '/outreach', action: { type: 'click', selector: '.subpage-back' },       expectURL: '/' },
  // 115s — HASH-FADE ENTRANCE: subpage brand + back button should
  // NOT slide in with the rest of the page on a hash-load. Per the
  // user: chrome stays anchored while page content settles.
  // We sample the brand top + back top across the hash-fade entrance
  // window; if either moves by > 10px between samples, the chrome
  // was animated when it should have been static.
  {
    name: '115-hash-fade-brand-static-mobile',
    viewport: MOBILE,
    load: '/outreach',
    hash: '#cooking-ministry',
    expectBrandStatic: true,
  },
  {
    name: '116-hash-fade-brand-static-desktop',
    viewport: DESKTOP,
    load: '/visit',
    hash: '#before-you-come',
    expectBrandStatic: true,
  },
  // 120s — SCROLL-RESTORE-JUMP scenarios. User is on home scrolled
  // down to (e.g.) the Outreach teaser cards, clicks one of the
  // teaser CTAs, then taps BACK on the subpage. Without a fix, the
  // view-transition snapshot of home is captured at scrollY=0
  // before scroll restoration kicks in, so the user sees the hero
  // briefly during the fade, then the page "jumps" to their previous
  // scroll position when the live DOM takes over. Detection: between
  // pre + nav samples we expect the brand position (or main top
  // value) to stay consistent with the scrollY that was active
  // before navigation — never resetting to 0 mid-flight.
  {
    name: '120-flicker-back-scrollrestore-jump-mobile',
    viewport: MOBILE,
    chain: [
      { type: 'goto', url: '/' },
      { type: 'scroll', y: 1800 },
      { type: 'click', selector: 'a[href="/outreach"]' },
      { type: 'wait', ms: 600 },
    ],
    // Then trigger back. expectScrollY tells the test what scroll
    // position the destination (home) should be at when the fade
    // completes — any sample during nav at a substantially smaller
    // scrollY is a jump.
    backAction: true,
    expectScrollY: 1800,
    expectScrollTolerance: 200,
  },
  {
    name: '121-flicker-back-scrollrestore-jump-desktop',
    viewport: DESKTOP,
    chain: [
      { type: 'goto', url: '/' },
      { type: 'scroll', y: 2200 },
      { type: 'click', selector: 'a[href="/outreach"]' },
      { type: 'wait', ms: 600 },
    ],
    backAction: true,
    expectScrollY: 2200,
    expectScrollTolerance: 250,
  },
]

// ============================================================
// Helpers
// ============================================================

function attachPageMonitors(page) {
  const errors = []
  page.on('pageerror', (e) => {
    if (!isIgnoredError(e.message)) errors.push(`exception: ${e.message}`)
  })
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const text = m.text()
      if (!isIgnoredError(text)) errors.push(`console: ${text}`)
    }
  })
  page.on('requestfailed', (r) => {
    // ERR_ABORTED means the browser cancelled an in-flight request because navigation moved away — normal and never actionable.
    if (r.failure()?.errorText === 'net::ERR_ABORTED') return
    const url = r.url()
    if (url.startsWith(BASE) && !isIgnoredError(url)) {
      errors.push(`reqfailed: ${url} (${r.failure()?.errorText})`)
    }
  })
  return errors
}

async function installCLSObserver(context) {
  await context.addInitScript(() => {
    window.__cls = 0
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__cls += entry.value
        }
      })
      po.observe({ type: 'layout-shift', buffered: true })
    } catch (e) {}
  })
}

async function getCLS(page) {
  return await page.evaluate(() => window.__cls || 0)
}

// runScenariosWithPool — launch N independent browsers, each pulling
// scenarios from a shared queue. Used so anchor / perf / flow suites
// run in parallel rather than one-scenario-at-a-time. Each browser is
// a separate process, fully isolated from the others.
//
// Concurrency choices per suite:
//   ANCHOR_PARALLELISM = 6  — anchor scenarios mostly idle-wait
//                             (sampling element positions across 4.2s),
//                             so high parallelism saves the most time
//                             without affecting accuracy.
//   PERF_PARALLELISM   = 1  — perf scenarios MUST run sequentially.
//                             Chromium launches with
//                             --disable-frame-rate-limit + --disable-
//                             gpu-vsync, so each browser tries to
//                             render at unlimited FPS. With 2+ perf
//                             browsers running at once, they compete
//                             for CPU and each sees degraded rAF
//                             cadence (false maxFrame spikes, false
//                             inputLatency spikes). Sequential
//                             preserves measurement integrity.
//   FLOW_PARALLELISM   = 2  — video recording + view-transitions are
//                             heavy. 2-way works without contention;
//                             higher gets flaky on slower hosts.
//
// `launcher` is an async fn returning a Browser. `body(browser, scenario)`
// processes one scenario. Output is intentionally interleaved across
// workers — start/finish lines from different scenarios can appear
// back-to-back. The HTML report and final summary still aggregate
// everything in scenario-definition order.
const ANCHOR_PARALLELISM = 6
const PERF_PARALLELISM   = 1
const FLOW_PARALLELISM   = 2

async function runScenariosWithPool(launcher, scenarios, concurrency, body) {
  const N = Math.min(concurrency, scenarios.length)
  const browsers = await Promise.all(Array.from({ length: N }, () => launcher()))
  const queue = scenarios.slice()
  const workers = browsers.map((browser) => (async () => {
    while (queue.length > 0) {
      const s = queue.shift()
      if (!s) break
      try { await body(browser, s) } catch (e) { /* per-scenario errors handled in body */ }
    }
  })())
  await Promise.all(workers)
  await Promise.all(browsers.map((b) => b.close().catch(() => {})))
}

// withTimeout — race any promise against a deadline so a hung Playwright
// call (screenshot, waitForLoadState, etc.) can't stall the whole harness.
// Returns the promise's result on success, throws { timedOut: true } on
// expiry. Always pass a label so the error message names what stalled.
async function withTimeout(promise, ms, label) {
  let timer
  const sentinel = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`timeout(${ms}ms): ${label}`)
      err.timedOut = true
      reject(err)
    }, ms)
  })
  try {
    return await Promise.race([promise, sentinel])
  } finally {
    clearTimeout(timer)
  }
}

// Hard per-scenario budget. The harness uses this to bound any single
// anchor/perf/flow run — if a scenario blows past this, it's marked
// failed and the rest of the suite continues.
const SCENARIO_BUDGET_MS = 60_000

// Best-effort screenshot — never throws, never hangs. Returns true on
// success, false on any error (page closed, timeout, etc).
async function safeScreenshot(page, opts) {
  try {
    await withTimeout(page.screenshot(opts), 5000, `screenshot ${opts.path || ''}`)
    return true
  } catch {
    return false
  }
}

async function waitForSettled(page) {
  try { await withTimeout(page.waitForLoadState('load'), 5000, 'waitForLoadState load') } catch {}
  try { await page.waitForLoadState('networkidle', { timeout: 4000 }) } catch {}
  // Wait for every non-looping animation to finish. Infinite/looping
  // animations (.live-status pulse, .stay-tuned-card color swirl, etc.)
  // never reach a non-running state, so we explicitly exclude them.
  try {
    await page.waitForFunction(
      () => document.getAnimations().every((a) => {
        if (a.playState !== 'running') return true
        try {
          const t = a.effect && a.effect.getComputedTiming && a.effect.getComputedTiming()
          if (t && t.iterations === Infinity) return true
        } catch (e) {}
        return false
      }),
      null,
      { timeout: 2000 }
    )
  } catch {}
  await page.waitForTimeout(60)
}

async function captureTransitionFrames(page, dir, prefix, action, durationMs = 720, frameCount = 9) {
  mkdirSync(dir, { recursive: true })
  const interval = durationMs / frameCount
  // Don't await the action inside the loop — its job is to trigger the
  // transition. Catch the promise rejection on its own (so an unhandled
  // rejection doesn't kill the process) but never block on it.
  const actionPromise = action().catch(() => {})
  for (let i = 0; i < frameCount; i++) {
    const t = Math.round(i * interval)
    // safeScreenshot has its own 5s timeout — a crashed page can't hang us.
    await safeScreenshot(page, {
      path: resolve(dir, `${prefix}-${String(i).padStart(2, '0')}-${t}ms.png`),
    })
    await new Promise((r) => setTimeout(r, interval))
  }
  // Cap how long we wait for the action to settle so a stuck navigation
  // doesn't pin the whole scenario.
  await withTimeout(actionPromise, 10_000, 'transition action settle').catch(() => {})
}

// Visual quality probes — run in the page context after settle.
async function visualProbes(page) {
  return await page.evaluate((opts) => {
    const out = { issues: [], info: {} }
    const vw = window.innerWidth
    const vh = window.innerHeight
    out.info.viewport = `${vw}x${vh}`

    // 1. Heading visibility — every section currently intersecting the viewport
    //    must have its eyebrow OR heading at least HEADING_MIN_VISIBLE_PX
    //    uncovered (below the fixed-header zone).
    //
    //    Exception: on /home the section eyebrow is intentionally allowed
    //    to tuck behind the nav-shell when the matching nav link is in
    //    its .active state — the gold-highlighted nav link IS the
    //    "you are here" indicator for that section, so the eyebrow's job
    //    of labeling the section is already covered. Without this skip,
    //    home-page anchor hashloads (e.g. /#schedule) fail the probe even
    //    though the design is intentional.
    const fixedHeaderBottom = vw <= 960 ? opts.FIXED_HEADER_BOTTOM_MOBILE : opts.FIXED_HEADER_BOTTOM_DESKTOP
    const sections = Array.from(document.querySelectorAll('section'))
    for (const s of sections) {
      const sr = s.getBoundingClientRect()
      if (sr.bottom < 0 || sr.top > vh) continue
      const eyebrow = s.querySelector('.section-eyebrow')
      const heading = s.querySelector('.section-heading')
      const candidate = eyebrow || heading
      if (!candidate) continue
      const cr = candidate.getBoundingClientRect()
      if (cr.bottom < 0 || cr.top > vh) continue
      const visibleTop = Math.max(cr.top, fixedHeaderBottom)
      const visibleBottom = Math.min(cr.bottom, vh)
      const visiblePx = visibleBottom - visibleTop
      // The candidate may be SHORTER than HEADING_MIN_VISIBLE_PX — the
      // flattened .section-eyebrow is a ~16px box, so a fully visible
      // eyebrow could never reach the 24px bar and every subpage failed
      // the probe even though nothing was covered. Require the candidate
      // to be (nearly) fully visible when its own height is below the
      // threshold; the 1px slack absorbs sub-pixel rounding.
      const requiredPx = Math.min(opts.HEADING_MIN_VISIBLE_PX, cr.height - 1)
      if (visiblePx < requiredPx) {
        // Eyebrow tucked behind the header? The section is still LABELED if its
        // heading reads below the header zone. Home hashloads intentionally tuck
        // the eyebrow (getHomeAnchorTargetY) — e.g. /#contact lands with the
        // "Contact" eyebrow behind the nav-shell but "Get in touch." fully
        // visible. Checking the eyebrow alone wrongly flagged that as covered.
        if (heading && heading !== candidate) {
          const hr = heading.getBoundingClientRect()
          const hVisible = Math.min(hr.bottom, vh) - Math.max(hr.top, fixedHeaderBottom)
          const hRequired = Math.min(opts.HEADING_MIN_VISIBLE_PX, hr.height - 1)
          if (!(hr.bottom < 0 || hr.top > vh) && hVisible >= hRequired) continue
        }
        const sid = s.id
        const hasActiveNav = sid && !!document.querySelector(
          'nav .nav-shell a[href="#' + sid + '"].active, .nav-shell nav a[href="#' + sid + '"].active'
        )
        if (hasActiveNav) continue
        out.issues.push(`heading covered: ${sid || '<no-id>'} (${visiblePx.toFixed(0)}px visible below header-zone @${fixedHeaderBottom})`)
      }
    }

    // 2. Reserved-space waste — any section with explicit min-height that
    //    has < (minH - threshold) of actual content height is wasting room.
    for (const s of sections) {
      const cs = getComputedStyle(s)
      const minH = parseFloat(cs.minHeight) || 0
      if (minH < 200) continue
      // Find the rendered "content" extent: the bottom of the last visible
      // direct child within the section.
      let contentBottom = s.getBoundingClientRect().top
      let contentTop = s.getBoundingClientRect().top
      for (const child of s.children) {
        const cr = child.getBoundingClientRect()
        if (cr.height === 0) continue
        if (cr.bottom > contentBottom) contentBottom = cr.bottom
        if (cr.top < contentTop) contentTop = cr.top
      }
      const contentH = contentBottom - contentTop
      const waste = minH - contentH
      if (waste > opts.RESERVED_WASTE_THRESHOLD) {
        // #events reserves its settled height while the calendar fetch is
        // in flight (the anti-CLS reserve). If neither the stay-tuned card
        // nor the carousel has mounted yet the section is still loading —
        // the reserve is the fix working, not waste.
        if (s.id === 'events') {
          const st = s.querySelector('#stay-tuned-container')
          const cw = s.querySelector('#carousel-wrapper')
          const mounted = (el) => el && getComputedStyle(el).display !== 'none'
          if (!mounted(st) && !mounted(cw)) continue
        }
        out.issues.push(`wasted space: ${s.id || '<no-id>'} minH=${minH.toFixed(0)} content=${contentH.toFixed(0)} (${waste.toFixed(0)}px empty)`)
      }
    }

    // 3. Horizontal overflow — any element wider than the viewport scrolls
    //    the page horizontally; that's never wanted here.
    if (document.documentElement.scrollWidth > vw + 1) {
      out.issues.push(`horizontal scroll: documentScrollWidth=${document.documentElement.scrollWidth} viewportWidth=${vw}`)
    }

    // 4. Fixed header should be present and not weirdly stretched.
    const fixedBrand = document.querySelector('.subpage-brand, .nav-shell')
    if (fixedBrand) {
      const br = fixedBrand.getBoundingClientRect()
      if (br.height > 200) {
        out.issues.push(`fixed header oversized: height=${br.height.toFixed(0)}`)
      }
    }

    return out
  }, { FIXED_HEADER_BOTTOM_DESKTOP, FIXED_HEADER_BOTTOM_MOBILE, HEADING_MIN_VISIBLE_PX, RESERVED_WASTE_THRESHOLD })
}

async function getInflightSectionAnimations(page) {
  return await page.evaluate(() => {
    return document.getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => {
        const t = a.effect && a.effect.target
        return t && t.tagName ? `${t.tagName.toLowerCase()}${t.id ? '#' + t.id : ''}` : '?'
      })
      .filter((s) => s.startsWith('section'))
  })
}

// ============================================================
// Anchor scenarios
// ============================================================

async function runAnchorScenarios(launcher, report) {
  const lines = []
  let pass = 0, fail = 0

  const runOne = async (browser, s) => {
    const context = await browser.newContext({ viewport: s.viewport })
    await installCLSObserver(context)
    const page = await context.newPage()
    const errors = attachPageMonitors(page)
    let pageDead = false
    page.on('crash', () => { pageDead = true; errors.push('page crashed') })
    page.on('close', () => { pageDead = true })
    const issues = []
    const url = BASE + s.path + (s.anchor || '')
    const t0 = Date.now()
    console.log(`▶ ${s.name}`)

    const anchorBody = (async () => {
      // Optional network throttling so the anchor landing check exercises
      // the case where async resources (calendar fetch, font load) settle
      // AFTER the page first paints. Localhost is too fast to surface
      // those cases naturally.
      if (s.netThrottle) {
        try {
          const cdp = await context.newCDPSession(page)
          const n = s.netThrottle
          await cdp.send('Network.emulateNetworkConditions', {
            offline: false,
            latency: n.latencyMs || 200,
            downloadThroughput: (n.downKbps || 1500) * 1024 / 8,
            uploadThroughput: (n.upKbps || 750) * 1024 / 8,
          })
        } catch (e) {}
      }
      await withTimeout(page.goto(url, { waitUntil: 'commit' }), 15_000, `goto ${url}`)

      let driftMeasurements = null
      if (s.anchor) {
        driftMeasurements = []
        let prev = 0
        for (const t of DRIFT_SAMPLES_MS) {
          const wait = t - prev
          if (wait > 0) await page.waitForTimeout(wait)
          prev = t
          // The page may have stashed + cleared the hash to suppress native
          // fragment scroll, so we measure by the anchor selector directly
          // (not by location.hash).
          const m = await page.evaluate((sel) => {
            const el = document.querySelector(sel)
            if (!el) return null
            const r = el.getBoundingClientRect()
            const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
            const html = document.documentElement
            // Record WHEN the page became visible using the page's own
            // clock — under CDP network throttling the harness's sample
            // scheduling jitters by hundreds of ms, so comparing class
            // state at evaluate-time misattributes pre-fade corrections
            // as visible instability. A MutationObserver pins the real
            // fade-in moment.
            if (!window.__fadeWatch) {
              window.__fadeWatch = true
              if (html.classList.contains('hash-fade-in') || !html.classList.contains('hash-fade')) {
                window.__fadeInAt = performance.now()
              } else {
                new MutationObserver(() => {
                  if (window.__fadeInAt == null && html.classList.contains('hash-fade-in')) {
                    window.__fadeInAt = performance.now()
                  }
                }).observe(html, { attributes: true, attributeFilter: ['class'] })
              }
            }
            // Subtract main's live transform — the hash-fade entrance
            // animates main's translateY, which moves bounding rects while
            // the page glides into place. The site's own landing code
            // (subpage-header measureTargetY) subtracts this the same way;
            // without it the entrance motion itself reads as "drift".
            let ty = 0
            const mainEl = document.querySelector('main')
            if (mainEl) {
              const tr = getComputedStyle(mainEl).transform
              if (tr && tr !== 'none') {
                const m2 = tr.match(/matrix\(([^)]+)\)/)
                const m3 = tr.match(/matrix3d\(([^)]+)\)/)
                if (m2) ty = parseFloat(m2[1].split(',')[5]) || 0
                else if (m3) ty = parseFloat(m3[1].split(',')[13]) || 0
              }
            }
            return {
              top: Math.round(r.top - ty),
              scrollY: Math.round(window.scrollY),
              atMaxScroll: window.scrollY >= maxScrollY - 2,
              pageT: Math.round(performance.now()),
              fadeInAt: window.__fadeInAt == null ? null : Math.round(window.__fadeInAt),
            }
          }, s.anchor)
          driftMeasurements.push({ t, ...m })
        }
        const last = driftMeasurements[driftMeasurements.length - 1]
        if (!last || last.top == null) issues.push(`target not in DOM`)
        else {
          const landDrift = Math.abs(last.top - s.expected)
          // Targets in the page's LAST section can be clamp-limited: the page
          // runs out of scroll room before the target reaches the standard
          // offset (e.g. /outreach#community-breakfast on mobile). When the
          // final sample sits at maxScrollY and the residual is "target too
          // low" (top > expected), the landing code did the best the layout
          // allows — that is not a drift defect.
          const clampLimited = last.atMaxScroll && last.top > s.expected
          if (landDrift > DRIFT_LAND_TOLERANCE && !clampLimited) {
            issues.push(`landDrift=${landDrift} (expected ~${s.expected}±${DRIFT_LAND_TOLERANCE})`)
          }
          // Stability across the last DRIFT_STABLE_SAMPLES samples. Earlier
          // samples may still be mid-smooth-scroll, which is intentional.
          const tail = driftMeasurements.slice(-DRIFT_STABLE_SAMPLES)
          const fadeInAt = tail.map((x) => x.fadeInAt).find((v) => v != null) ?? null
          for (let i = 1; i < tail.length; i++) {
            // Movement is only user-visible instability if the page was
            // already visible at the EARLIER sample — under throttled
            // networks the hash-fade flow corrects position while main is
            // still invisible (the designed pattern), then fades in.
            // Compared on the page's own clock (see fadeInAt above).
            const earlierVisible = fadeInAt != null && tail[i - 1].pageT != null && tail[i - 1].pageT >= fadeInAt
            if (!earlierVisible) continue
            const move = Math.abs(tail[i].top - tail[i - 1].top)
            if (move > DRIFT_STABLE_TOLERANCE) {
              issues.push(`unstable after settle: moved ${move}px between ${tail[i - 1].t}ms→${tail[i].t}ms`)
              break
            }
          }
        }
      } else {
        await waitForSettled(page)
      }

      const cls = await getCLS(page)
      if (cls > CLS_THRESHOLD) issues.push(`CLS=${cls.toFixed(3)}>${CLS_THRESHOLD}`)
      const stillAnim = await getInflightSectionAnimations(page)
      if (stillAnim.length) issues.push(`still-animating=[${stillAnim.join(', ')}]`)
      const probes = await visualProbes(page)
      if (probes.issues.length) issues.push(...probes.issues)
      if (errors.length) issues.push(`errors=[${errors.slice(0, 2).join(' | ')}${errors.length > 2 ? ' …' : ''}]`)

      const screenshotPath = resolve(OUT_DIR, `${s.name}.png`)
      await safeScreenshot(page, { path: screenshotPath })

      const driftStr = driftMeasurements
        ? ` top@${driftMeasurements.map((m) => `${m.t}=${m.top}`).join(' ')}`
        : ''
      const elapsed = Date.now() - t0
      let line
      if (issues.length === 0) {
        pass++
        line = `✓ ${s.name}${driftStr}  cls=${cls.toFixed(3)}  (${elapsed}ms)`
      } else {
        fail++
        line = `✗ ${s.name}${driftStr}  ${issues.join(' / ')}  (${elapsed}ms)`
      }
      report.scenarios.push({
        name: s.name, kind: 'anchor', ok: issues.length === 0,
        url, viewport: `${s.viewport.width}x${s.viewport.height}`,
        screenshot: `${s.name}.png`, drift: driftMeasurements, cls, issues, elapsedMs: elapsed,
      })
      lines.push(line)
      console.log(`  ${issues.length === 0 ? '✓' : '✗'} ${s.name} ${elapsed}ms`)
    })()

    try {
      await withTimeout(anchorBody, 30_000, `anchor ${s.name}`)
    } catch (err) {
      fail++
      const elapsed = Date.now() - t0
      const msg = err.timedOut ? `BUDGET EXCEEDED (30s)` : err.message
      lines.push(`✗ ${s.name}  ${msg}  (${elapsed}ms)`)
      console.log(`  ✗ ${s.name} ${msg} ${elapsed}ms`)
      report.scenarios.push({ name: s.name, kind: 'anchor', ok: false, url, issues: [msg], elapsedMs: elapsed })
    }

    try { await withTimeout(context.close(), 3_000, 'context.close').catch(() => {}) } catch {}
  }

  await runScenariosWithPool(launcher, ANCHOR_SCENARIOS, ANCHOR_PARALLELISM, runOne)
  return { lines, pass, fail }
}

// ============================================================
// Performance scenarios — rAF FPS + long-tasks + LoAF + input latency
// ============================================================

async function installPerfObservers(page) {
  await page.evaluate(() => {
    window.__perf = { frames: [], scrollYs: [], longTasks: [], loaf: [], measuring: false }
    function tick(t) {
      if (window.__perf.measuring) {
        window.__perf.frames.push(t)
        // Per-frame scroll position lets us measure perceived smoothness:
        // a smooth animator has consistent scrollY deltas; a jerky one
        // doesn't. This is more meaningful than rAF interval timing when
        // the underlying compositor runs at display vsync (~60Hz) even
        // while rAF fires faster.
        window.__perf.scrollYs.push(window.pageYOffset || 0)
        requestAnimationFrame(tick)
      }
    }
    window.__perfStart = () => {
      window.__perf.frames = []
      window.__perf.scrollYs = []
      window.__perf.longTasks = []
      window.__perf.loaf = []
      window.__perf.measuring = true
      requestAnimationFrame(tick)
    }
    window.__perfStop = () => { window.__perf.measuring = false }

    // longtask: main-thread blocks ≥ 50ms.
    try {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (window.__perf.measuring) {
            window.__perf.longTasks.push({
              duration: Math.round(e.duration),
              startTime: Math.round(e.startTime),
            })
          }
        }
      })
      po.observe({ type: 'longtask', buffered: false })
    } catch (e) {}

    // long-animation-frame: any frame > ~50ms with its blocking duration.
    // Chrome 123+.
    try {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (window.__perf.measuring) {
            window.__perf.loaf.push({
              duration: Math.round(e.duration),
              blockingDuration: Math.round(e.blockingDuration || 0),
              startTime: Math.round(e.startTime),
            })
          }
        }
      })
      po.observe({ type: 'long-animation-frame', buffered: false })
    } catch (e) {}
  })
}

function computePerfStats(perf) {
  const intervals = []
  for (let i = 1; i < perf.frames.length; i++) {
    intervals.push(perf.frames[i] - perf.frames[i - 1])
  }
  const sorted = [...intervals].sort((a, b) => a - b)
  const total = intervals.reduce((a, b) => a + b, 0)
  const avgFps = intervals.length > 0 ? 1000 / (total / intervals.length) : 0
  const idx95 = Math.max(0, Math.floor(sorted.length * 0.95) - 1)
  const p95 = sorted[idx95] || 0
  const maxFrame = sorted[sorted.length - 1] || 0
  const longTaskMax = perf.longTasks.length ? Math.max(...perf.longTasks.map((t) => t.duration)) : 0
  const loafMax = perf.loaf.length ? Math.max(...perf.loaf.map((t) => t.duration)) : 0
  const blockingMax = perf.loaf.length ? Math.max(...perf.loaf.map((t) => t.blockingDuration)) : 0

  // ---- Perceived scroll-smoothness metric (v1.48) ----
  // A smooth animator changes scrollY consistently between rAF frames;
  // a jerky one shows wild variance in per-frame deltas. This catches
  // user-perceived jankiness even when rAF intervals look fine.
  //
  // We only consider frames where scroll position actually changed
  // (so static-page intervals don't dilute the signal). Coefficient of
  // variation (stdev / mean) gives a scale-free smoothness score:
  //   < 0.40 → very smooth
  //   < 0.70 → acceptable
  //   ≥ 1.00 → jerky
  let scrollDeltaCount = 0
  let scrollDeltaMean = 0
  let scrollDeltaStdDev = 0
  let scrollDeltaCV = 0          // stdev/mean across raw rAF deltas (easing inflates this)
  let scrollDeltaMax = 0
  let scrollTotalPx = 0
  // The metric the user cares about: peak per-DISPLAY-FRAME scroll jump.
  // Even if rAF fires at 1000fps, the display only commits at ~60Hz on most
  // devices, ~120Hz on ProMotion. Group rAF samples into 16.67ms (60Hz)
  // and 8.33ms (120Hz) buckets and find the LARGEST distance the user could
  // see the page jump between two visible frames. Smaller = smoother.
  let maxJumpPer60Hz = 0
  let maxJumpPer120Hz = 0
  // ---- During-scroll metrics (v1.49) ----
  // The previous metrics measured the FULL capture window (1.4-2s of mostly-
  // static page after the scroll lands). On a fast machine that dilutes the
  // signal: 5 dropped frames out of 200 total looks like "97% smooth" even
  // though the dropped frames all clustered in the 200ms scroll itself.
  //
  // These metrics narrow to the SCROLL ACTIVE WINDOW — first to last frame
  // where scrollY moved — and expose what blocks the compositor right when
  // it matters:
  //   scrollActiveMs          duration of the scroll itself
  //   loafDuringScrollCount   long-animation-frames overlapping that window
  //   loafDuringScrollMs      total LoAF duration overlapping that window
  //                           (main-thread work fighting compositor commits)
  //   rafGapsOver20ms         count of rAF gaps >20ms within the window
  //                           (each gap = at least one dropped 60Hz frame)
  //   rafGapMaxMs             worst rAF gap within the window
  //   scrollStallMs           total time the scroll position held still for
  //                           > 20ms during the active window (visible
  //                           stutters: the page froze mid-animation)
  //   scrollStallCount        number of distinct stall events ≥ 20ms
  let scrollActiveStart = 0
  let scrollActiveEnd = 0
  let scrollActiveMs = 0
  // Time from capture start (≈ page commit on hashload, click on homeclick)
  // to the moment scrollY first moved. On hashload this is the "scroll
  // firing latency" — how long the user stares at a static top-of-page
  // before motion begins. Too long = perceived broken. Too short = scroll
  // fires while main thread is busy → competes with compositor.
  let preScrollDelayMs = 0
  let loafDuringScrollCount = 0
  let loafDuringScrollMs = 0
  let rafGapsOver20ms = 0
  let rafGapMaxMs = 0
  let framesOver16InScroll = 0      // missed-60fps frames inside scroll window
  let framesOver12InScroll = 0      // missed-83fps frames (subtle micro-stutters)
  let scrollStallMs = 0
  let scrollStallCount = 0
  // Per-display-frame jerk: how much does the visible scroll JUMP magnitude
  // change between adjacent 60Hz frames? A smooth easing curve changes
  // gradually (small jerk); random jitter has high jerk even at the same
  // average velocity. This catches what avg-jump-size and CV miss: home
  // jumps 280px/frame smoothly, a subpage jumps 50/200/50/180px erratically
  // around the same average — same MAX, very different feel.
  let displayJumpJerkMax = 0        // max |jump[i] - jump[i-1]| across 60Hz samples
  let displayJumpJerkMean = 0       // mean of those deltas
  let displayJumpJerkCv = 0         // stdev/mean of the deltas (scale-free jitter)
  if (perf.scrollYs && perf.scrollYs.length > 2 && perf.frames && perf.frames.length === perf.scrollYs.length) {
    const deltas = []
    for (let i = 1; i < perf.scrollYs.length; i++) {
      const d = Math.abs(perf.scrollYs[i] - perf.scrollYs[i - 1])
      if (d > 0.01) deltas.push(d)
    }
    if (deltas.length > 0) {
      const sum = deltas.reduce((a, b) => a + b, 0)
      const mean = sum / deltas.length
      const variance = deltas.reduce((a, b) => a + (b - mean) ** 2, 0) / deltas.length
      const std = Math.sqrt(variance)
      scrollDeltaCount = deltas.length
      scrollDeltaMean = mean
      scrollDeltaStdDev = std
      scrollDeltaCV = mean > 0 ? std / mean : 0
      scrollDeltaMax = Math.max(...deltas)
      scrollTotalPx = sum
    }
    // INTERPOLATE scrollY at exact display-frame intervals (16.67ms for
    // 60Hz, 8.33ms for 120Hz). This is what the user would see on a
    // real display: the browser commits the latest scrollY at each
    // vsync, so per-frame jump = scrollY(t + frameMs) - scrollY(t).
    //
    // The previous bucket-end method overstated jumps by ~2x because
    // rAF intervals are irregular under --disable-gpu-vsync: a bucket
    // could span up to ~31ms (waiting for the next sample past 16.67ms),
    // capturing 2 display-frames worth of scroll instead of 1. The
    // interpolation method always uses an exact display-frame window.
    function interpolateY(t) {
      if (!perf.frames || perf.frames.length < 2) return perf.scrollYs[0] || 0
      if (t <= perf.frames[0]) return perf.scrollYs[0]
      if (t >= perf.frames[perf.frames.length - 1]) return perf.scrollYs[perf.scrollYs.length - 1]
      // Binary search for the bracketing samples
      let lo = 0, hi = perf.frames.length - 1
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1
        if (perf.frames[mid] <= t) lo = mid
        else hi = mid
      }
      const t0 = perf.frames[lo], y0 = perf.scrollYs[lo]
      const t1 = perf.frames[hi], y1 = perf.scrollYs[hi]
      return t1 === t0 ? y0 : y0 + (y1 - y0) * (t - t0) / (t1 - t0)
    }
    const startT = perf.frames[0]
    const endT = perf.frames[perf.frames.length - 1]
    for (const windowMs of [16.67, 8.33]) {
      let mj = 0
      for (let t = startT; t + windowMs < endT; t += windowMs) {
        mj = Math.max(mj, Math.abs(interpolateY(t + windowMs) - interpolateY(t)))
      }
      if (windowMs === 16.67) maxJumpPer60Hz = mj
      else maxJumpPer120Hz = mj
    }
    // ---- Scroll-active-window analysis ----
    // Find first and last frame where scrollY moved. The "active window" is
    // when the smooth-scroll is actually animating. Metrics outside that
    // window (static page before/after) are irrelevant to perceived
    // smoothness of the anchor jump itself.
    let firstChange = -1, lastChange = -1
    for (let i = 1; i < perf.scrollYs.length; i++) {
      if (Math.abs(perf.scrollYs[i] - perf.scrollYs[i - 1]) > 0.5) {
        if (firstChange < 0) firstChange = i - 1
        lastChange = i
      }
    }
    if (firstChange >= 0 && lastChange > firstChange) {
      scrollActiveStart = perf.frames[firstChange]
      scrollActiveEnd = perf.frames[lastChange]
      scrollActiveMs = scrollActiveEnd - scrollActiveStart
      preScrollDelayMs = scrollActiveStart - perf.frames[0]
      // LoAF entries that overlap [scrollActiveStart, scrollActiveEnd].
      // Each LoAF that lands here is main-thread work fighting the
      // compositor while the scroll is animating — the most likely
      // source of visible jank.
      for (const e of perf.loaf || []) {
        const start = e.startTime, end = e.startTime + e.duration
        if (end >= scrollActiveStart && start <= scrollActiveEnd) {
          const overlap = Math.min(end, scrollActiveEnd) - Math.max(start, scrollActiveStart)
          if (overlap > 0) {
            loafDuringScrollCount++
            loafDuringScrollMs += overlap
          }
        }
      }
      // rAF gaps + stalls + missed-frame counts within the active window.
      for (let i = firstChange + 1; i <= lastChange; i++) {
        const gap = perf.frames[i] - perf.frames[i - 1]
        if (gap > 16.7) framesOver16InScroll++
        if (gap > 12) framesOver12InScroll++
        if (gap > 20) {
          rafGapsOver20ms++
          if (gap > rafGapMaxMs) rafGapMaxMs = gap
        }
        // Scroll stall: scrollY held still for > 20ms during active window.
        // This is the "page froze mid-animation" perception: rAF kept
        // ticking but the displayed scrollY didn't advance.
        if (gap > 20 && Math.abs(perf.scrollYs[i] - perf.scrollYs[i - 1]) < 0.5) {
          scrollStallCount++
          scrollStallMs += gap
        }
      }
      // ---- Per-display-frame jerk analysis ----
      // Sample scrollY at 16.67ms intervals (60Hz vsync) across the active
      // window — same path interpolateY() uses for maxJumpPer60Hz, but here
      // we look at the SEQUENCE of jumps, not just the max.
      //
      // displayJumps[k] = |interp(t0 + (k+1)*16.67) - interp(t0 + k*16.67)|
      // Then we measure how much consecutive jumps differ from each other:
      // a smooth easing curve has gradually-changing jumps; random jitter
      // has highly-variable adjacent jumps even at the same mean velocity.
      const displayJumps = []
      for (let t = scrollActiveStart; t + 16.67 < scrollActiveEnd; t += 16.67) {
        displayJumps.push(Math.abs(interpolateY(t + 16.67) - interpolateY(t)))
      }
      if (displayJumps.length >= 3) {
        const adjacentDiffs = []
        for (let k = 1; k < displayJumps.length; k++) {
          adjacentDiffs.push(Math.abs(displayJumps[k] - displayJumps[k - 1]))
        }
        const meanDiff = adjacentDiffs.reduce((a, b) => a + b, 0) / adjacentDiffs.length
        const varDiff = adjacentDiffs.reduce((a, b) => a + (b - meanDiff) ** 2, 0) / adjacentDiffs.length
        const stdDiff = Math.sqrt(varDiff)
        displayJumpJerkMax = Math.max(...adjacentDiffs)
        displayJumpJerkMean = meanDiff
        displayJumpJerkCv = meanDiff > 0 ? stdDiff / meanDiff : 0
      }
    }
  }

  return {
    frameCount: perf.frames.length,
    intervalCount: intervals.length,
    intervals,
    avgFps,
    p95FrameMs: p95,
    maxFrameMs: maxFrame,
    framesOver8: intervals.filter((i) => i > 8.33).length,
    framesOver16: intervals.filter((i) => i > 16.67).length,
    framesOver33: intervals.filter((i) => i > 33).length,
    framesOver50: intervals.filter((i) => i > 50).length,
    longTasks: perf.longTasks,
    longTaskCount: perf.longTasks.length,
    longTaskMaxMs: longTaskMax,
    loaf: perf.loaf,
    loafCount: perf.loaf.length,
    loafMaxMs: loafMax,
    blockingMaxMs: blockingMax,
    scrollDeltaCount,
    scrollDeltaMean,
    scrollDeltaStdDev,
    scrollDeltaCV,
    scrollDeltaMax,
    scrollTotalPx,
    maxJumpPer60Hz,
    maxJumpPer120Hz,
    scrollActiveStart,
    scrollActiveEnd,
    scrollActiveMs,
    preScrollDelayMs,
    loafDuringScrollCount,
    loafDuringScrollMs,
    rafGapsOver20ms,
    rafGapMaxMs,
    framesOver16InScroll,
    framesOver12InScroll,
    scrollStallMs,
    scrollStallCount,
    displayJumpJerkMax,
    displayJumpJerkMean,
    displayJumpJerkCv,
  }
}

// Grade a scenario's stats against a threshold tier; return list of issues.
// If allowNoFrames is true (used for click scenarios where rAF often doesn't
// fire during view-transition), missing-frame data won't fail the run — only
// the input latency check matters.
function gradeTier(tier, stats, inputLatencyMs, allowNoFrames = false) {
  const issues = []
  if (stats.intervalCount < 5) {
    if (allowNoFrames) {
      // Only latency matters for this scenario.
      if (inputLatencyMs != null && inputLatencyMs > tier.inputLatencyMaxMs) {
        return [`inputLatency=${inputLatencyMs}ms > ${tier.inputLatencyMaxMs}`]
      }
      return []
    }
    return [`only ${stats.intervalCount} frames captured`]
  }
  if (stats.avgFps < tier.avgFpsMin) issues.push(`avgFps=${stats.avgFps.toFixed(1)} < ${tier.avgFpsMin}`)
  if (stats.p95FrameMs > tier.p95FrameMaxMs) issues.push(`p95Frame=${stats.p95FrameMs.toFixed(1)}ms > ${tier.p95FrameMaxMs}`)
  if (stats.maxFrameMs > tier.maxFrameMs) issues.push(`maxFrame=${stats.maxFrameMs.toFixed(1)}ms > ${tier.maxFrameMs}`)
  // Stutters relative to the tier's frame budget
  const stutterBudget = tier === PERF_120 ? 12 : 33
  const stutters = stats.intervals.filter((i) => i > stutterBudget).length
  if (stutters > tier.stutterFrameMax) issues.push(`stutters>${stutterBudget}ms count=${stutters} > ${tier.stutterFrameMax}`)
  const longTaskOver = stats.longTasks.filter((t) => t.duration > tier.longTaskMaxMs).length
  if (longTaskOver > tier.longTaskMaxCount) {
    issues.push(`longTasks>${tier.longTaskMaxMs}ms count=${longTaskOver} (max=${stats.longTaskMaxMs}ms)`)
  }
  if (stats.loafMaxMs > tier.loafMaxDurationMs) issues.push(`loaf=${stats.loafMaxMs}ms > ${tier.loafMaxDurationMs}`)
  const loafOver = stats.loaf.filter((t) => t.duration > tier.loafMaxDurationMs / 2).length
  if (loafOver > tier.loafMaxCount) issues.push(`loafCount>${(tier.loafMaxDurationMs/2)|0}ms = ${loafOver} > ${tier.loafMaxCount}`)
  if (inputLatencyMs != null && inputLatencyMs > tier.inputLatencyMaxMs) {
    issues.push(`inputLatency=${inputLatencyMs}ms > ${tier.inputLatencyMaxMs}`)
  }
  return issues
}


async function runPerfScenarios(launcher, report) {
  const lines = []
  let pass = 0, fail = 0

  const runOne = async (browser, s) => {
    const context = await browser.newContext({ viewport: s.viewport })
    const page = await context.newPage()
    const errors = attachPageMonitors(page)
    let pageDead = false
    page.on('crash', () => { pageDead = true; errors.push('page crashed') })
    page.on('close', () => { pageDead = true })

    let inputLatency = null
    const t0 = Date.now()
    console.log(`▶ ${s.name}`)
    const perfBody = (async () => {
      // Optional CPU + network throttling for stress scenarios.
      //   cpuThrottle:  simulates mid-range or entry-level mobile.
      //                 Surfaces main-thread bottlenecks that hide
      //                 on fast hardware. (50s/60s scenarios.)
      //   netThrottle:  simulates a real network (3G-ish). Crucial
      //                 for the hashload landing-accuracy check —
      //                 on localhost the calendar carousel mounts
      //                 within ~50ms, way before our scrollTo fires,
      //                 so a fast harness misses the case where
      //                 calendar mounts AFTER scrollTo and pushes
      //                 the target section downward. With latency,
      //                 the mount happens later, exercising the
      //                 invisible-stability watchdog in subpage-
      //                 header.ts. (80s scenarios.)
      let cdp = null
      if ((s.cpuThrottle && s.cpuThrottle > 1) || s.netThrottle) {
        try {
          cdp = await context.newCDPSession(page)
          if (s.cpuThrottle && s.cpuThrottle > 1) {
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: s.cpuThrottle })
          }
          if (s.netThrottle) {
            const n = s.netThrottle
            await cdp.send('Network.emulateNetworkConditions', {
              offline: false,
              latency: n.latencyMs || 200,
              downloadThroughput: (n.downKbps || 1500) * 1024 / 8,
              uploadThroughput: (n.upKbps || 750) * 1024 / 8,
            })
          }
        } catch (e) { cdp = null }
      }
      // For 'hashload', the page's own subpage-header.ts script auto-triggers
      // a smooth scroll at DOMContentLoaded + 220ms. We need the perf observer
      // installed BEFORE that — so we install + start measuring right after
      // 'commit' (DOM exists, scripts haven't run yet) and skip waitForSettled
      // which would wait until after the auto-scroll already happened.
      const isHashload = s.action === 'hashload'
      const url = BASE + s.path + (isHashload ? s.hash : '')
      await withTimeout(page.goto(url, { waitUntil: 'commit' }), 10_000, `goto ${url}`)

      if (isHashload) {
        await installPerfObservers(page)
        await page.evaluate(() => window.__perfStart())
        // v1.49 timing budget:
        //   ~500-1500ms wait for window.load + fonts.ready + 2rAF + rIC
        //     (subpage-header.ts defers until truly idle so the smooth-
        //      scroll fires on a quiet thread — matches home-click feel)
        //   ~850ms browser-native scroll
        //   2000ms snap-correct safety net
        // Under CPU throttling, every phase stretches. Budget 3500ms
        // baseline + 800ms per cpuThrottle multiplier.
        const baseWait = 3500
        const throttleBoost = (s.cpuThrottle || 1) > 1 ? (s.cpuThrottle - 1) * 800 : 0
        await page.waitForTimeout(baseWait + throttleBoost)
      } else {
        await waitForSettled(page)
        await installPerfObservers(page)
        await page.evaluate(() => window.__perfStart())
      }

      if (s.action === 'scroll') {
        // Real wheel events drive the browser's smooth-scroll pipeline the
        // same way a user does.
        const totalScroll = await page.evaluate(() =>
          document.documentElement.scrollHeight - window.innerHeight,
        )
        const steps = 30
        const stepPx = Math.max(50, Math.round(totalScroll / steps))
        for (let i = 0; i < steps; i++) {
          await page.mouse.wheel(0, stepPx)
          await page.waitForTimeout(40)
        }
        await page.waitForTimeout(400)
      } else if (s.action === 'hash') {
        // Drive a same-page smooth-scroll-to-anchor through the SAME
        // animator users hit (window.__smoothScrollToHash, defined in
        // subpage-header.ts). Falls back to scrollIntoView if the
        // animator isn't present on the page (e.g., home, which uses
        // its own scrollTo with navOffset — not a subpage).
        await page.evaluate((hash) => {
          if (typeof window.__smoothScrollToHash === 'function') {
            window.__smoothScrollToHash(hash)
          } else {
            const t = document.querySelector(hash)
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, s.hash)
        // Custom animator caps at 1100ms duration; give it 300ms buffer
        // so we capture the tail of the deceleration curve.
        await page.waitForTimeout(1400)
      } else if (s.action === 'click') {
        const clickStart = Date.now()
        await Promise.all([
          withTimeout(page.waitForLoadState('load'), 8_000, 'click waitForLoad').catch(() => {}),
          withTimeout(page.click(s.selector), 8_000, `click ${s.selector}`),
        ])
        inputLatency = Date.now() - clickStart
        if (pageDead) throw new Error('page closed/crashed after click')
        // Re-install observers on the destination page (the previous page's
        // window context is gone after navigation).
        await installPerfObservers(page)
        await page.evaluate(() => window.__perfStart())
        await page.waitForTimeout(1200)
      } else if (s.action === 'homeclick') {
        // A/B baseline path: home anchor click on a fully-settled page.
        // Triggers home's own click handler (src/templates/home-scripts.ts)
        // which calls window.scrollTo({top, behavior:'smooth'}). Same
        // primitive subpages use — but on a quiet main thread.
        //
        // observers are already installed and measuring (this branch only
        // runs after the waitForSettled + installPerfObservers + perfStart
        // path that handles all non-hashload scenarios). Just fire the
        // click and wait for the smooth-scroll to complete.
        await page.evaluate((sel) => {
          const a = document.querySelector(`a[href="${sel}"]`)
          if (a) a.click()
        }, s.anchor)
        // Browser-native smooth scroll on a long distance (~3000px) takes
        // ~700-900ms; pad to 1500ms to capture the deceleration tail.
        await page.waitForTimeout(1500)
      } else if (s.action === 'navscrub') {
        // Scrub the nav morph range (0–134px) down and back up, twice —
        // the scroll-driven full↔compressed nav animation is sampled
        // per frame across its whole range in both directions. Frame
        // intervals here ARE the morph's cost; the dedicated nav-morph
        // suite (nav-morph.mjs, Chromium + WebKit) covers correctness.
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < 13; i++) { await page.mouse.wheel(0, 14); await page.waitForTimeout(32) }
          await page.waitForTimeout(450)
          for (let i = 0; i < 13; i++) { await page.mouse.wheel(0, -14); await page.waitForTimeout(32) }
          await page.waitForTimeout(450)
        }
      }

      const perf = await page.evaluate(() => {
        window.__perfStop()
        return window.__perf
      })
      const stats = computePerfStats(perf)
      const isClick = s.action === 'click'
      const issues60 = gradeTier(PERF_60, stats, inputLatency, isClick)
      const issues120 = gradeTier(PERF_120, stats, inputLatency, isClick)
      if (errors.length) issues60.push(`errors=[${errors.slice(0, 2).join(' | ')}${errors.length > 2 ? ' …' : ''}]`)
      // Scenario passes the harness when it clears the 60fps bar (the "ship" bar).
      // The 120fps grade is an "aspirational" extra grade for ProMotion devices.
      // CPU-throttled scenarios are INFORMATIONAL — they exist to surface
      // bottlenecks on cheap mobile devices, not to enforce a passing
      // threshold (a 4× slower CPU is expected to produce 4× slower
      // frames). Their data is still recorded and shown in the report
      // for manual review, but they always pass the suite.
      // A/B pair scenarios + netThrottle scenarios are informational:
      // their job is to surface metrics under stress conditions, not
      // to gate the suite (the network latency itself shows up as a
      // 1+second LoAF which would always fail strict thresholds).
      const isInformational = (!!s.cpuThrottle && s.cpuThrottle > 1) || !!s.ab || !!s.netThrottle
      const passes60 = isInformational ? true : issues60.length === 0
      const passes120 = issues120.length === 0

      const tier120Tag = passes120 ? '120✓' : '120✗'
      // Surface scroll-smoothness coefficient-of-variation for scenarios
      // that actually move scrollY. CV < 0.5 = smooth, < 0.7 = OK,
      // ≥ 1.0 = jerky. Total px scrolled is shown so you can correlate
      // distance with smoothness expectation.
      // Per-display-frame max jump: the actual visible step a user
      // would see on a 60Hz / 120Hz display. Smaller = smoother. Target:
      // ≤80px @60Hz, ≤40px @120Hz for visually smooth motion.
      const scrollSmoothStr = stats.scrollDeltaCount > 4
        ? `  jump60=${stats.maxJumpPer60Hz.toFixed(0)}px jump120=${stats.maxJumpPer120Hz.toFixed(0)}px CV=${stats.scrollDeltaCV.toFixed(2)} dPx=${Math.round(stats.scrollTotalPx)}`
        : ''
      // During-scroll details — surface only when active window is meaningful.
      // These reveal what makes the home anchor click feel smooth and the
      // subpage hashload feel jerky even when the overall capture metrics
      // look similar.
      const duringScrollStr = stats.scrollActiveMs > 50
        ? `  [pre=${stats.preScrollDelayMs.toFixed(0)}ms scroll=${stats.scrollActiveMs.toFixed(0)}ms · over16In=${stats.framesOver16InScroll} · loafIn=${stats.loafDuringScrollCount}/${stats.loafDuringScrollMs.toFixed(0)}ms · jerk max=${stats.displayJumpJerkMax.toFixed(0)} mean=${stats.displayJumpJerkMean.toFixed(0)}]`
        : ''
      const throttleTag = s.cpuThrottle && s.cpuThrottle > 1 ? `[cpu${s.cpuThrottle}x] ` : ''
      const summary = `${throttleTag}fps=${stats.avgFps.toFixed(1)} p95=${stats.p95FrameMs.toFixed(1)}ms max=${stats.maxFrameMs.toFixed(1)}ms  over16=${stats.framesOver16} over33=${stats.framesOver33}  loaf=${stats.loafCount}/${stats.loafMaxMs}ms  longtasks=${stats.longTaskCount}/${stats.longTaskMaxMs}ms${scrollSmoothStr}${duringScrollStr}${inputLatency != null ? ` clk=${inputLatency}ms` : ''} ${tier120Tag}`
      const elapsed = Date.now() - t0
      let line
      if (passes60) {
        pass++
        line = `✓ ${s.name}  ${summary}  (${elapsed}ms)`
      } else {
        fail++
        line = `✗ ${s.name}  ${summary}  ${issues60.join(' / ')}  (${elapsed}ms)`
      }
      lines.push(line)
      console.log(`  ${passes60 ? '✓' : '✗'} ${s.name} ${elapsed}ms`)
      report.scenarios.push({
        name: s.name, kind: 'perf', ok: passes60,
        passes60, passes120, issues120,
        viewport: `${s.viewport.width}x${s.viewport.height}`,
        action: s.action + (s.hash ? ' ' + s.hash : '') + (s.selector ? ' ' + s.selector : '') + (s.anchor ? ' ' + s.anchor : ''),
        ab: s.ab || null,
        stats, inputLatency, issues: issues60, elapsedMs: elapsed,
      })
    })()

    try {
      await withTimeout(perfBody, 40_000, `perf ${s.name}`)
    } catch (err) {
      fail++
      const elapsed = Date.now() - t0
      const msg = err.timedOut ? `BUDGET EXCEEDED (40s)` : err.message
      lines.push(`✗ ${s.name}  ${msg}  (${elapsed}ms)`)
      console.log(`  ✗ ${s.name} ${msg} ${elapsed}ms`)
      report.scenarios.push({ name: s.name, kind: 'perf', ok: false, issues: [msg], elapsedMs: elapsed })
    }

    try { await withTimeout(context.close(), 3_000, 'context.close').catch(() => {}) } catch {}
  }

  await runScenariosWithPool(launcher, PERF_SCENARIOS, PERF_PARALLELISM, runOne)
  return { lines, pass, fail }
}

// ============================================================
// Flow scenarios (frame capture + post-nav assertions)
// ============================================================

async function runFlowScenarios(launcher, report) {
  const lines = []
  let pass = 0, fail = 0

  const runOne = async (browser, s) => {
    const sceneDir = resolve(OUT_DIR, s.name)
    if (existsSync(sceneDir)) rmSync(sceneDir, { recursive: true, force: true })
    const videoDir = resolve(OUT_DIR, `_video_${s.name}`)
    if (existsSync(videoDir)) rmSync(videoDir, { recursive: true, force: true })

    // Browser-level recovery — if a previous scenario's renderer crashed
    // hard enough to take down the whole browser, re-launch before
    // attempting newContext (otherwise the call throws and the suite
    // collapses for all subsequent scenarios on this worker).
    if (!browser.isConnected()) {
      console.log('  ⚠ browser disconnected, re-launching')
      browser = await chromium.launch({ headless: true, executablePath: EXEC_PATH })
    }

    const context = await browser.newContext({
      viewport: s.viewport,
      recordVideo: { dir: videoDir, size: s.viewport },
    })
    await installCLSObserver(context)
    const page = await context.newPage()
    const errors = attachPageMonitors(page)
    // Track page crashes / closures so we can detect them and abort the
    // scenario instead of hanging trying to interact with a dead page.
    let pageDead = false
    page.on('crash', () => { pageDead = true; errors.push('page crashed') })
    page.on('close', () => { pageDead = true })
    const issues = []
    const motionStates = []
    const framesPerNav = []
    const t0 = Date.now()
    console.log(`▶ ${s.name}`)

    let navIdx = 0
    const scenarioBody = (async () => {
      for (const step of s.steps) {
        if (pageDead) throw new Error('page closed/crashed mid-scenario')
        if (step.type === 'goto') {
          await withTimeout(
            page.goto(BASE + step.url, { waitUntil: 'commit' }),
            10_000, `goto ${step.url}`
          )
          await waitForSettled(page)
        } else if (step.type === 'scroll') {
          // Smooth incremental scroll so reveals are visible in the recorded
          // video. Step count keeps each delta below typical reveal threshold
          // so each .reveal element has time to fire and finish its 720ms
          // transition before the next chunk scrolls past it.
          const totalScroll = await page.evaluate(() => Math.max(0, document.body.scrollHeight - window.innerHeight))
          const stepCount = 40
          const stepPx = totalScroll / stepCount
          const delayMs = Math.max(60, Math.round((step.durationMs || 5000) / stepCount))
          for (let i = 0; i < stepCount; i++) {
            await page.evaluate((px) => window.scrollBy(0, px), stepPx)
            await page.waitForTimeout(delayMs)
          }
          await waitForSettled(page)
          // Linger so the final reveals (and their 720ms transitions) finish
          // before the video ends.
          await page.waitForTimeout(900)
          if (step.checkReveals) {
            const status = await page.evaluate(() => {
              // Covers both the v1.46.0 generic classes and the v1.46.1
              // intent vocabulary (eyebrow/rise/settle/photo/power).
              // Mirror the in-page REVEAL_SEL in home-scripts.ts. When adding
              // a new reveal variant, update both lists.
              const SEL = [
                '.reveal', '.reveal-scale',
                '.reveal-eyebrow', '.reveal-rise', '.reveal-rise-slow', '.reveal-tight',
                '.reveal-from-left', '.reveal-from-right', '.reveal-from-above',
                '.reveal-settle', '.reveal-photo', '.reveal-power', '.reveal-pop',
              ].join(', ')
              const FIRED_SEL = SEL.split(',').map(s => s.trim() + '.is-revealed').join(', ')
              const all = document.querySelectorAll(SEL)
              const fired = document.querySelectorAll(FIRED_SEL)
              const stillHidden = []
              all.forEach((el) => {
                if (!el.classList.contains('is-revealed')) {
                  stillHidden.push(el.className.split(' ').slice(0, 3).join(' '))
                }
              })
              return { total: all.length, fired: fired.length, stillHidden: stillHidden.slice(0, 5) }
            })
            if (status.total === 0) {
              issues.push(`reveals: scenario expected reveal targets but found 0 — selector drift?`)
            } else if (status.fired < status.total) {
              issues.push(`reveals: only ${status.fired}/${status.total} fired (e.g. ${status.stillHidden.join('; ')})`)
            }
            motionStates.push(`reveals=${status.fired}/${status.total}`)
          }
        } else if (step.type === 'navigate') {
          navIdx++
          const prefix = `nav${String(navIdx).padStart(2, '0')}-${step.kind}`
          const trigger = async () => {
            // Bound the load-state wait so a navigation that never fires
            // `load` (e.g. after a renderer crash) doesn't pin us forever.
            const loadWait = withTimeout(
              page.waitForLoadState('load'), 8_000, `${step.kind} waitForLoad`
            ).catch(() => {})
            if (step.kind === 'click') {
              await Promise.all([loadWait, withTimeout(page.click(step.selector), 8_000, `click ${step.selector}`)])
            } else if (step.kind === 'goBack') {
              await Promise.all([loadWait, withTimeout(page.goBack(), 8_000, 'goBack')])
            } else if (step.kind === 'goForward') {
              await Promise.all([loadWait, withTimeout(page.goForward(), 8_000, 'goForward')])
            } else if (step.kind === 'directNav') {
              const url = step.url.startsWith('http') ? step.url : BASE + step.url
              await Promise.all([loadWait, withTimeout(page.goto(url), 8_000, `goto ${url}`)])
            }
          }
          if (step.captureFrames) {
            await captureTransitionFrames(page, sceneDir, prefix, trigger)
            const frameFiles = readdirSync(sceneDir)
              .filter((f) => f.startsWith(prefix) && f.endsWith('.png'))
              .sort()
              .map((f) => `${s.name}/${f}`)
            framesPerNav.push({ prefix, frames: frameFiles })
          } else {
            await trigger()
          }
          if (pageDead) {
            issues.push(`step ${navIdx} (${step.kind}): page died after navigation`)
            break
          }
          await waitForSettled(page)

          const noEntrance = await withTimeout(
            page.evaluate(() => document.documentElement.classList.contains('no-entrance')),
            3_000, 'check no-entrance'
          ).catch(() => null)
          motionStates.push(`${step.kind}=${noEntrance === null ? 'unknown' : noEntrance ? 'noEntrance' : 'ANIMATED'}`)
          if (noEntrance === false) issues.push(`step ${navIdx} (${step.kind}): entrance animation NOT suppressed`)

          const stillAnim = await withTimeout(getInflightSectionAnimations(page), 3_000, 'inflight anims').catch(() => [])
          if (stillAnim.length) issues.push(`step ${navIdx}: sections still animating after settle`)
        }
      }

      const cls = pageDead ? 0 : await withTimeout(getCLS(page), 3_000, 'getCLS').catch(() => 0)
      if (cls > CLS_THRESHOLD) issues.push(`CLS=${cls.toFixed(3)}>${CLS_THRESHOLD}`)
      if (!pageDead) {
        const probes = await withTimeout(visualProbes(page), 5_000, 'visualProbes').catch(() => ({ issues: [] }))
        if (probes.issues.length) issues.push(...probes.issues)
      }
      if (errors.length) issues.push(`errors=[${errors.slice(0, 2).join(' | ')}${errors.length > 2 ? ' …' : ''}]`)

      const elapsed = Date.now() - t0
      let line
      if (issues.length === 0) {
        pass++
        line = `✓ ${s.name}  ${motionStates.join(', ')}  cls=${cls.toFixed(3)}  (${elapsed}ms)`
      } else {
        fail++
        line = `✗ ${s.name}  ${motionStates.join(', ')}  ${issues.join(' / ')}  (${elapsed}ms)`
      }
      report.scenarios.push({
        name: s.name, kind: 'flow', ok: issues.length === 0,
        viewport: `${s.viewport.width}x${s.viewport.height}`,
        motionStates, framesPerNav, cls, issues,
        video: `${s.name}.webm`, elapsedMs: elapsed,
      })
      lines.push(line)
      console.log('  ' + (issues.length === 0 ? '✓' : '✗') + ' ' + elapsed + 'ms')
    })()

    try {
      await withTimeout(scenarioBody, SCENARIO_BUDGET_MS, `scenario ${s.name}`)
    } catch (err) {
      fail++
      const elapsed = Date.now() - t0
      const msg = err.timedOut ? `BUDGET EXCEEDED (${SCENARIO_BUDGET_MS}ms)` : err.message
      lines.push(`✗ ${s.name}  ${msg}  (${elapsed}ms)`)
      console.log(`  ✗ ${s.name} ${msg} ${elapsed}ms`)
      report.scenarios.push({ name: s.name, kind: 'flow', ok: false, issues: [msg], elapsedMs: elapsed })
    }

    // Force-close the page even if scenario timed out. Wrapped in try/catch
    // because the page might already be closed from a crash.
    try { await withTimeout(page.close(), 3_000, 'page.close').catch(() => {}) } catch {}
    try { await withTimeout(context.close(), 5_000, 'context.close').catch(() => {}) } catch {}

    try {
      const files = readdirSync(videoDir)
      const webm = files.find((f) => f.endsWith('.webm'))
      if (webm) renameSync(resolve(videoDir, webm), resolve(OUT_DIR, `${s.name}.webm`))
      rmSync(videoDir, { recursive: true, force: true })
    } catch {}
  }

  await runScenariosWithPool(launcher, FLOW_SCENARIOS, FLOW_PARALLELISM, runOne)
  return { lines, pass, fail }
}

// ============================================================
// Flicker scenarios — sample DOM + pixels every ~30ms across
// a single navigation event (or fresh page load) and flag any
// transient state the user would perceive as "the page popped /
// blanked / jumped." Tuned for the iPhone Safari complaints
// (reveal-FOUC, logo movement, subpage-exit flash).
// ============================================================

// Tiny PNG decoder — enough to read pixel stats out of a Buffer
// returned by page.screenshot. We only need IHDR + the first
// IDAT to compute luminance variance + per-row deltas (a "blank
// frame" has near-zero variance because every pixel is the
// page background color).
function decodePngStats(buf) {
  try {
    // PNG sig: 89 50 4E 47 0D 0A 1A 0A
    if (buf.length < 24 || buf[0] !== 0x89 || buf[1] !== 0x50) return null
    // IHDR comes immediately after the sig at byte 8.
    // Layout: 4-byte length, 4-byte type, 13-byte data, 4-byte CRC.
    const ihdrType = buf.toString('ascii', 12, 16)
    if (ihdrType !== 'IHDR') return null
    const width = buf.readUInt32BE(16)
    const height = buf.readUInt32BE(20)
    const bitDepth = buf[24]
    const colorType = buf[25]
    // Walk chunks until we find IDAT(s), concat their data.
    let offset = 33 // IHDR ends here (8 sig + 4 len + 4 type + 13 data + 4 crc)
    const idatChunks = []
    while (offset + 8 < buf.length) {
      const len = buf.readUInt32BE(offset)
      const type = buf.toString('ascii', offset + 4, offset + 8)
      const dataStart = offset + 8
      if (type === 'IDAT') idatChunks.push(buf.subarray(dataStart, dataStart + len))
      offset = dataStart + len + 4 // skip data + CRC
      if (type === 'IEND') break
    }
    if (!idatChunks.length) return null
    // Inflate all IDAT data — node zlib handles concatenation fine.
    const zlib = require('node:zlib')
    const inflated = zlib.inflateSync(Buffer.concat(idatChunks))
    // PNG scanlines: 1 filter byte + width * bytesPerPixel data.
    const samplesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1
    const bytesPerPixel = (bitDepth / 8) * samplesPerPixel
    const rowBytes = 1 + width * bytesPerPixel
    if (inflated.length < rowBytes * height) {
      // Skip filtering — too costly + the filter byte already
      // gives us decent variance signal. Sample raw bytes by
      // skipping the filter byte each row.
    }
    // Sample center column of every Nth row, take luminance (avg R+G+B),
    // compute mean + variance. Skip filter bytes; defilter not required
    // for variance sniffing (filter "None" = 0 is common for our
    // screenshots; for "Sub/Up/Avg/Paeth" the predicted pixel still
    // tracks the surrounding pixel intensity so variance signal is
    // preserved). Good enough for "blank vs not blank" classification.
    const samples = []
    const sampleRows = Math.min(height, 32)
    const sampleCols = Math.min(width, 24)
    const rowStep = Math.max(1, Math.floor(height / sampleRows))
    const colStep = Math.max(1, Math.floor(width / sampleCols))
    for (let y = 0; y < height; y += rowStep) {
      const rowStart = y * rowBytes + 1 // skip filter byte
      if (rowStart + width * bytesPerPixel > inflated.length) break
      for (let x = 0; x < width; x += colStep) {
        const px = rowStart + x * bytesPerPixel
        if (samplesPerPixel >= 3) {
          // RGB(A): luminance approx (R + G + B) / 3, ignore A.
          samples.push((inflated[px] + inflated[px + 1] + inflated[px + 2]) / 3)
        } else if (samplesPerPixel === 2) {
          // grayscale + alpha
          samples.push(inflated[px])
        } else {
          // grayscale
          samples.push(inflated[px])
        }
      }
    }
    if (!samples.length) return null
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length
    const stddev = Math.sqrt(variance)
    // Background of /faf8f5 ≈ luminance 248.7. A blank frame at the
    // page background will have mean ≈ 248 and stddev ≈ 0 (uniform).
    // `samples` is the per-pixel luminance grid — used downstream
    // for inter-frame similarity ("did the rendered image change?")
    // and similarity-to-baseline checks ("did this frame look like
    // page A, page B, or a midway blend of both?").
    return { width, height, mean, stddev, sampleCount: samples.length, signature: samples }
  } catch (e) {
    return null
  }
}

// Diff two stats objects — returns a rough "structural similarity"
// (higher = more similar). Used to flag big inter-frame jumps.
function pngStatsDiff(a, b) {
  if (!a || !b) return null
  return { meanDiff: Math.abs(a.mean - b.mean), stddevDiff: Math.abs(a.stddev - b.stddev) }
}

// Compare two per-pixel luminance signatures. Returns the mean
// absolute difference normalized to 0-1 (0 = identical, 1 = max
// possible difference). Both signatures must have the same length
// (same source viewport + grid). The harness fixes the screenshot
// clip + sample grid so this always holds.
function signatureDistance(a, b) {
  if (!a || !b || a.length !== b.length || !a.length) return null
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i])
  return sum / (a.length * 255)
}

async function installFlickerProbe(page) {
  // Sampling function injected into the page. Each call returns a
  // small JSON snapshot of "what the user can see right now":
  //   - brand box + opacity + is-hidden flag
  //   - main opacity + transform
  //   - html classList (no-entrance / hash-fade / hash-fade-in / js-reveals)
  //   - count of reveal elements still hidden (opacity < 0.5)
  //   - count of section elements with computed opacity < 0.95
  //   - in-flight animation count
  //   - page URL
  await page.addInitScript(() => {
    window.__flickerProbe = () => {
      const out = {
        t: performance.now(),
        url: location.pathname + location.hash,
        scrollY: Math.round(window.scrollY),
        htmlClasses: document.documentElement.className,
        // Count only NON-LOOPING running animations. Infinite-loop
        // decorative animations (handshake-gesture, boise-comet,
        // stay-tuned-card swirl, .live-status pulse) are intentional
        // and should not flag as a "leak".
        inflightAnimations: document.getAnimations().filter((a) => {
          if (a.playState !== 'running') return false
          // Scroll-driven animations (the nav morph) are persistently
          // 'running' by design — they advance with the scroll offset
          // and consume nothing while it's idle. "Still running after
          // settle" is only meaningful for time-based animations.
          try {
            if (a.timeline && a.timeline.constructor && /Scroll|View/.test(a.timeline.constructor.name)) return false
          } catch (e) {}
          try {
            const t = a.effect && a.effect.getComputedTiming && a.effect.getComputedTiming()
            if (t && t.iterations === Infinity) return false
          } catch (e) {}
          // Ambient auto-rotators (schedule-banner crossfade, events
          // carousel auto-tick) run recurring finite transitions by
          // design — whether a settle sample coincides with a rotation
          // tick is timing luck, not a leak.
          try {
            const el = a.effect && a.effect.target
            if (el && el.closest && el.closest('.schedule-banner, .carousel-track, .carousel-card, #events')) return false
          } catch (e) {}
          return true
        }).length,
      }
      // Brand — either home (.brand) or subpage (.subpage-brand).
      // We look up both; whichever exists is "the brand" for this page.
      const homeBrand = document.querySelector('.nav-shell .brand')
      const subBrand = document.querySelector('.subpage-brand')
      const brand = homeBrand || subBrand
      if (brand) {
        const r = brand.getBoundingClientRect()
        const cs = getComputedStyle(brand)
        out.brand = {
          which: homeBrand ? 'home' : 'subpage',
          top: Math.round(r.top),
          left: Math.round(r.left),
          width: Math.round(r.width),
          height: Math.round(r.height),
          opacity: parseFloat(cs.opacity),
          display: cs.display,
          visibility: cs.visibility,
          transform: cs.transform,
          // Subpage-brand has a .hidden class that translates it
          // off-screen up. Track this so we can flag "logo flew
          // in from above" cases.
          isHiddenClass: brand.classList.contains('hidden'),
        }
      } else {
        out.brand = null
      }
      // Main + first section opacity — if either is < 0.95 the page
      // is mid-fade-in.
      const main = document.querySelector('main')
      if (main) {
        const cs = getComputedStyle(main)
        out.main = {
          opacity: parseFloat(cs.opacity),
          transform: cs.transform,
        }
      }
      // Count reveal elements still hidden (a real flicker shows
      // many reveal elements pop from visible → hidden after JS
      // runs, then animate back in).
      const revealSel = '.reveal, .reveal-scale, .reveal-eyebrow, .reveal-rise, .reveal-rise-slow, .reveal-tight, .reveal-from-left, .reveal-from-right, .reveal-from-above, .reveal-photo, .reveal-power, .reveal-pop, .reveal-fill'
      const revealEls = Array.from(document.querySelectorAll(revealSel))
      let revealHidden = 0
      let revealVisibleInViewport = 0
      let revealInViewport = 0
      const vh = window.innerHeight
      for (const el of revealEls) {
        const r = el.getBoundingClientRect()
        const inView = r.bottom > 0 && r.top < vh
        if (!inView) continue
        revealInViewport++
        const op = parseFloat(getComputedStyle(el).opacity)
        if (op < 0.5) revealHidden++
        else revealVisibleInViewport++
      }
      out.reveals = { total: revealEls.length, inView: revealInViewport, hiddenInView: revealHidden, visibleInView: revealVisibleInViewport }
      // Section opacity — sections start at opacity 0 on fresh load
      // unless no-entrance is set. If we catch any section at < 0.95
      // opacity it's mid-entrance animation.
      const sections = Array.from(document.querySelectorAll('section'))
      let sectionAt0 = 0
      let sectionMidFade = 0
      for (const s of sections) {
        const r = s.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) continue
        const op = parseFloat(getComputedStyle(s).opacity)
        if (op < 0.1) sectionAt0++
        else if (op < 0.95) sectionMidFade++
      }
      out.sectionsInViewMidFade = sectionMidFade
      out.sectionsInViewInvisible = sectionAt0
      // nav-shell mobile scroll-state — if .scrolled-mobile lands
      // late (after first paint) the brand visibly slides away.
      const navShell = document.querySelector('.nav-shell')
      if (navShell) {
        out.navShell = {
          scrolledMobile: navShell.classList.contains('scrolled-mobile'),
          inlineDisplay: getComputedStyle(navShell).display,
        }
      }
      try {
        const fp = performance.getEntriesByType('paint')[0]
        out.firstPaintT = fp ? Math.round(fp.startTime) : null
      } catch (e) { out.firstPaintT = null }
      return out
    }
  })
}

async function runFlickerScenarios(launcher, report) {
  const lines = []
  let pass = 0, fail = 0

  // Sample cadence — frequent over the first 250ms (where the
  // FOUC + entrance race lives) then sparser to capture the
  // settle phase.
  const FRESH_SAMPLE_TIMES_MS = [0, 16, 32, 50, 80, 120, 180, 260, 360, 500, 700, 1000, 1400, 1900]
  const NAV_SAMPLE_TIMES_MS   = [0, 16, 32, 50, 80, 120, 180, 260, 360, 500, 700, 1000]

  const runOne = async (browser, s) => {
    const sceneDir = resolve(OUT_DIR, s.name)
    if (existsSync(sceneDir)) rmSync(sceneDir, { recursive: true, force: true })
    mkdirSync(sceneDir, { recursive: true })

    const context = await browser.newContext({ viewport: s.viewport })
    await installFlickerProbe(context)
    await installCLSObserver(context)
    const page = await context.newPage()
    const errors = attachPageMonitors(page)
    let pageDead = false
    page.on('crash', () => { pageDead = true; errors.push('page crashed') })
    page.on('close', () => { pageDead = true })

    const t0 = Date.now()
    const issues = []
    const samples = []
    const pngStats = []
    console.log(`▶ ${s.name}`)

    // Set to Date.now() immediately before the navigation/action fires so that
    // wallRelativeMs on each sample is measured from the action trigger, not
    // from the page's absolute performance.now() clock. Samples collected
    // before the action (pre samples) get negative or ~0 values — correct.
    let actionStartMs = null

    const collectAt = async (label, t) => {
      let probe = null
      try { probe = await page.evaluate(() => window.__flickerProbe ? window.__flickerProbe() : null) } catch (e) {}
      const screenshotPath = resolve(sceneDir, `${label}-${String(t).padStart(4, '0')}ms.png`)
      let buf = null
      try {
        buf = await withTimeout(page.screenshot({
          // Just the top ~33% of viewport where the brand + first
          // section live. Smaller = faster, and that's the area
          // where the user sees the flicker.
          clip: { x: 0, y: 0, width: s.viewport.width, height: Math.min(s.viewport.height, 320) },
          type: 'png',
        }), 3000, `screenshot ${label}`)
      } catch (e) {}
      if (buf) {
        try { writeFileSync(screenshotPath, buf) } catch (e) {}
        const stats = decodePngStats(buf)
        pngStats.push({ label, t, stats })
      }
      if (probe) {
        const wallRelativeMs = actionStartMs !== null ? Date.now() - actionStartMs : null
        samples.push({ label, t, wallRelativeMs, ...probe })
      }
    }

    const body = (async () => {
      if (s.load) {
        // FRESH PAGE LOAD. Start sampling immediately after we
        // commit the navigation so we catch the first paint frame.
        const url = BASE + s.load + (s.hash || '')
        // If scrollY is specified, push session-storage scroll
        // restoration as a no-op — Playwright would otherwise
        // start at 0,0. We simulate "restored scroll" by adding
        // an init script that sets scroll right after the first
        // section renders, mimicking Safari's behavior.
        if (s.scrollY) {
          await page.addInitScript((y) => {
            // history.scrollRestoration is 'auto' by default,
            // but Playwright's fresh context starts at 0. We
            // imitate Safari iOS bfcache restore by scrolling
            // synchronously to `y` AS SOON AS the body parses.
            // This is the worst case — JS races CSS for who
            // gets to dictate the layout first.
            window.__simulateScrollRestore = y
            document.addEventListener('readystatechange', () => {
              if (document.readyState === 'interactive') {
                window.scrollTo(0, y)
              }
            })
          }, s.scrollY)
        }
        const gotoPromise = page.goto(url, { waitUntil: 'commit' })
        // Start sampling timer from when goto resolves (commit).
        await withTimeout(gotoPromise, 10_000, `goto ${url}`)
        const sampleStart = Date.now()
        let prev = 0
        for (const t of FRESH_SAMPLE_TIMES_MS) {
          const wait = t - prev
          if (wait > 0) await page.waitForTimeout(wait)
          prev = t
          await collectAt('load', t)
        }
      } else if (s.chain && s.backAction) {
        // SCROLL-RESTORE BACK NAVIGATION. Set up scroll position on
        // the source page, navigate forward to a subpage, then test
        // the back navigation for the "hero shown then jump to saved
        // scroll" flicker class.
        for (const step of s.chain) {
          if (step.type === 'goto') {
            await withTimeout(page.goto(BASE + step.url, { waitUntil: 'load' }), 10_000, `goto ${step.url}`)
            await waitForSettled(page)
          } else if (step.type === 'scroll') {
            await page.evaluate((y) => window.scrollTo(0, y), step.y)
            await page.waitForTimeout(200)
          } else if (step.type === 'click') {
            await page.click(step.selector)
            await waitForSettled(page)
          } else if (step.type === 'wait') {
            await page.waitForTimeout(step.ms)
          }
        }
        // Baseline sample on the subpage (pre-back).
        await collectAt('pre', 0)
        // Trigger goBack and sample.
        actionStartMs = Date.now()
        const fireP = page.goBack().catch(() => {})
        let prev = 0
        for (const t of NAV_SAMPLE_TIMES_MS) {
          const wait = t - prev
          if (wait > 0) await page.waitForTimeout(wait)
          prev = t
          await collectAt('back', t)
        }
        try { await withTimeout(fireP, 5000, 'goBack settle').catch(() => {}) } catch {}
        await page.waitForTimeout(200)
        await collectAt('settled', 0)
        // SCROLL-RESTORE JUMP DETECTION. The "hero shown then jump"
        // flicker shows up as: during the back navigation, an early
        // sample reads scrollY ≈ 0 (the new page snapshot was captured
        // before scroll restoration kicked in), then a later sample
        // reads scrollY at the restored position. We don't enforce
        // the absolute final scroll value — Chromium headless can
        // restore to a position different from what we set in the
        // chain (events / images / fonts loading after first scrollTo
        // can shift the page height). What matters is consistency:
        // every sample on the back-nav destination should be close to
        // the settled scrollY, not at scrollY ≈ 0 while the settled
        // value is several hundred pixels down.
        const settled = samples[samples.length - 1]
        const settledY = settled ? settled.scrollY : 0
        if (settledY > 400) {
          // Only run the check when the destination scroll is
          // meaningfully far from 0; otherwise an "early sample at 0"
          // is the actual destination state, not a flicker.
          let jumpFrames = 0
          const jumpTags = []
          for (const sample of samples) {
            if (sample.label !== 'back') continue
            // Only consider samples after the URL has committed to
            // the destination (back-nav target). On the source side
            // the URL is /outreach (etc.); after commit the URL is /.
            if (sample.url !== '/' && !sample.url.startsWith('/?') && !sample.url.startsWith('/#')) continue
            if (sample.scrollY < settledY - 400) {
              jumpFrames++
              if (jumpTags.length < 3) jumpTags.push(`${sample.t}ms:${sample.scrollY}`)
            }
          }
          if (jumpFrames > 0) {
            issues.push(`scroll-restore-jump: ${jumpFrames} sample(s) at scrollY << settled (${jumpTags.join(', ')}; settled=${settledY})`)
          }
        }
      } else if (s.from) {
        // CROSS-DOCUMENT NAVIGATION. Open `from`, optionally
        // pre-scroll, optionally wait for a settled state, then
        // trigger `action` and start sampling.
        await withTimeout(page.goto(BASE + s.from, { waitUntil: 'load' }), 10_000, `goto ${s.from}`)
        await waitForSettled(page)
        if (s.preScroll) {
          await page.evaluate((y) => window.scrollTo(0, y), s.preScroll)
          await page.waitForTimeout(200)
          // The subpage chrome (BACK pill, brand) hides on scroll-down.
          // A real user scrolls up a touch to bring it back before
          // tapping BACK — without this nudge the click lands on a
          // pointer-events:none pill and silently never navigates,
          // leaving the sampler measuring the source page forever.
          await page.evaluate(() => window.scrollBy(0, -40))
          await page.waitForTimeout(450)
        }
        // Baseline sample (pre-click). This is the "OLD page"
        // baseline used for see-through detection during the
        // navigation that follows.
        await collectAt('pre', 0)
        // Fire the action. Don't await its load — we want to sample
        // during the navigation.
        actionStartMs = Date.now()
        const action = s.action
        const fireP = action.type === 'click'
          ? page.click(action.selector).catch(() => {})
          : page.evaluate(action.script || '').catch(() => {})
        let prev = 0
        for (const t of NAV_SAMPLE_TIMES_MS) {
          const wait = t - prev
          if (wait > 0) await page.waitForTimeout(wait)
          prev = t
          await collectAt('nav', t)
        }
        // Make sure the action settled.
        try { await withTimeout(fireP, 5000, 'action settle').catch(() => {}) } catch {}
        // Final landing-state sample after 200ms more. This is the
        // "NEW page" baseline used for see-through detection.
        await page.waitForTimeout(200)
        await collectAt('settled', 0)
        // SEE-THROUGH FRAME DETECTION. We have two baselines:
        //   pngStats[0] = pre  (the OLD page fully visible)
        //   pngStats[N] = settled (the NEW page fully visible)
        // For each nav-N sample, compute distance to both. A
        // clean transition has frames very close to OLD then
        // very close to NEW. A see-through (crossfade) has frames
        // where distance-to-OLD AND distance-to-NEW are both
        // > 0.05 — the rendered image is a blend of both pages.
        if (pngStats.length >= 3) {
          const preIdx = 0
          const settledIdx = pngStats.length - 1
          const oldSig = pngStats[preIdx].stats && pngStats[preIdx].stats.signature
          const newSig = pngStats[settledIdx].stats && pngStats[settledIdx].stats.signature
          if (oldSig && newSig) {
            // Determine whether two pages look meaningfully different
            // to begin with. If not, we can't run the check.
            const oldVsNew = signatureDistance(oldSig, newSig)
            if (oldVsNew && oldVsNew > 0.04) {
              let seeThroughFrames = 0
              const seeThroughTags = []
              for (let i = 1; i < pngStats.length - 1; i++) {
                const sig = pngStats[i].stats && pngStats[i].stats.signature
                if (!sig) continue
                const dOld = signatureDistance(sig, oldSig)
                const dNew = signatureDistance(sig, newSig)
                if (dOld == null || dNew == null) continue
                // A see-through frame is far enough from BOTH
                // baselines that it represents a blend (rather
                // than a clean swap). Threshold tuned via observed
                // data: a clean nav stays within 0.025 of the
                // closer baseline; a 50/50 crossfade between
                // distinct pages lands ~0.04-0.10 from both.
                if (dOld > 0.030 && dNew > 0.030 && Math.min(dOld, dNew) / oldVsNew > 0.25) {
                  seeThroughFrames++
                  seeThroughTags.push(`${pngStats[i].label}@${pngStats[i].t}ms dOld=${dOld.toFixed(3)} dNew=${dNew.toFixed(3)}`)
                }
              }
              if (seeThroughFrames > 0) {
                issues.push(`see-through-flicker: ${seeThroughFrames} frame(s) showing both pages overlapping (${seeThroughTags.slice(0, 3).join('; ')}; OldVsNew=${oldVsNew.toFixed(3)})`)
              }
            }
          }
        }
      }

      // Analyze samples for flicker signals.
      // 1. Reveal-FOUC: any sample where reveals.inView is high but
      //    reveals.hiddenInView is also high. (Many reveal elements
      //    visible but at opacity 0 → flash incoming.) Fail if the
      //    state lasts > 1 sample.
      let revealsHiddenSamples = 0
      let maxRevealsHiddenInView = 0
      for (const sample of samples) {
        // 'pre' samples measure the SOURCE page's baseline before the
        // action fires — mid-scroll reveals there are normal choreography,
        // not destination FOUC.
        if (sample.label === 'pre') continue
        // Skip the first ~80ms after commit: the head script that sets
        // no-entrance/is-revealed runs synchronously during parse, but the
        // probe's earliest sample can race it before ANY paint occurred —
        // a state the user cannot see. Real FOUC persists past 80ms.
        if (sample.t != null && sample.t < 80) continue
        if (sample.reveals && sample.reveals.inView > 2 && sample.reveals.hiddenInView >= sample.reveals.inView * 0.5) {
          revealsHiddenSamples++
          maxRevealsHiddenInView = Math.max(maxRevealsHiddenInView, sample.reveals.hiddenInView)
        }
      }
      // Fresh load — even one sample with reveals hidden in viewport
      // counts as a FOUC flash (the elements were visible at parse
      // and JS hid them before observer fired).
      // Threshold tuned to mobile MOBILE viewport: typical /visit page
      // has 6-8 reveal items in viewport on mobile.
      if (revealsHiddenSamples > 0) {
        issues.push(`reveal-FOUC: ${revealsHiddenSamples} sample(s) with reveals hidden in view (max ${maxRevealsHiddenInView})`)
      }
      // 2. Section-entrance race: any sample with sections at opacity
      //    < 0.1 IN VIEW, when no-entrance should have been set
      //    (back/forward or same-origin nav). On fresh load this is
      //    expected; on return-to-home we should never see it.
      if (s.from || s.preScroll != null) {
        let sectionsInvSamples = 0
        for (const sample of samples) {
          if (sample.sectionsInViewInvisible > 0 && (sample.htmlClasses || '').includes('no-entrance')) {
            sectionsInvSamples++
          }
        }
        if (sectionsInvSamples > 1) issues.push(`section-flash: ${sectionsInvSamples} samples with invisible sections under no-entrance`)
      }
      // 3a. (hash-fade scenarios only) Brand + back static check:
      //     the subpage chrome should not move during the hash-fade
      //     entrance — chrome stays anchored while only the page
      //     content slides in. Any brand top movement > 10px across
      //     samples (after the first paint) is a regression.
      if (s.expectBrandStatic && samples.length >= 2) {
        let brandMoveMax = 0
        let backMoveMax = 0
        const brandPositions = []
        for (let i = 1; i < samples.length; i++) {
          const a = samples[i - 1].brand, b = samples[i].brand
          if (a && b && a.which === 'subpage' && b.which === 'subpage') {
            const d = Math.abs(a.top - b.top)
            if (d > brandMoveMax) brandMoveMax = d
          }
          brandPositions.push(b && b.top)
        }
        // Also sniff for an additional .subpage-back top movement via
        // a one-off page.evaluate. We can use the existing samples'
        // navShell / brand data instead — but back isn't in the
        // probe today, so we accept brandMoveMax as a proxy: if the
        // brand was animated, the back almost certainly was too
        // (they share the hash-fade rule).
        if (brandMoveMax > 10) {
          issues.push(`brand-not-static: subpage-brand top moved up to ${brandMoveMax.toFixed(0)}px during hash-fade entrance (expected static)`)
        }
      }
      // 3. Brand position jumps. If consecutive samples have the
      //    brand offset by > 60px we have a logo "fly-in" flicker.
      //    Skip samples where brand is null (between pages).
      let brandJumpMax = 0
      let brandHiddenSamples = 0
      let prevBrand = null
      for (const sample of samples) {
        if (sample.brand) {
          if (sample.brand.isHiddenClass) brandHiddenSamples++
          if (prevBrand && prevBrand.which === sample.brand.which) {
            const dy = Math.abs(prevBrand.top - sample.brand.top)
            if (dy > brandJumpMax) brandJumpMax = dy
          }
          prevBrand = sample.brand
        }
      }
      if (brandJumpMax > 60) issues.push(`brand-jump: brand top moved ${brandJumpMax}px between consecutive samples`)
      if (brandHiddenSamples > 1 && (s.from || s.load)) {
        // .subpage-brand.hidden during the navigation window is the
        // "logo went off-screen" symptom. It's expected if user
        // scrolled, but the flicker comes from when the brand
        // becomes UN-hidden during the navigation — we want to
        // detect "brand was hidden then visible mid-nav".
        let hiddenToVisibleTransitions = 0
        for (let i = 1; i < samples.length; i++) {
          const a = samples[i - 1].brand, b = samples[i].brand
          if (a && b && a.which === b.which && a.isHiddenClass && !b.isHiddenClass) {
            hiddenToVisibleTransitions++
          }
        }
        if (hiddenToVisibleTransitions > 0) {
          issues.push(`logo-flyin: brand toggled hidden→visible ${hiddenToVisibleTransitions} time(s) during nav`)
        }
      }
      // 4. .nav-shell.scrolled-mobile applied late — when the user
      //    has restored scroll position. The brand was visible on
      //    first paint, then suddenly hidden by scrolled-mobile.
      //    Track samples where scrolledMobile state flips between
      //    settled (not-mid-load) samples. A boolean flip that happens
      //    within the first ~100ms of page load is OK — it's the
      //    head-script's scroll listener catching scroll-restoration
      //    fired after parse-end, and the v1.49.24 CSS only transitions
      //    background + box-shadow + opacity so the visible state is
      //    consistent throughout. Only flag flips that happen LATE
      //    (after 200ms) since those would imply a visible animation.
      let navShellFlips = 0
      let prevScrolled = null
      let prevSampleT = -1
      let prevUrl = null
      for (const sample of samples) {
        // A class-state difference across two DIFFERENT documents
        // (source page pre-samples vs destination nav-samples) is not
        // a flip — reset the comparison at every URL boundary.
        if (sample.url !== prevUrl) {
          prevScrolled = null
          prevSampleT = -1
          prevUrl = sample.url
        }
        if (sample.navShell) {
          if (prevScrolled !== null && prevScrolled !== sample.navShell.scrolledMobile) {
            // Only count this as a flip if BOTH samples landed after the
            // page's actual first paint (plus an 80ms settle margin) —
            // the restoreScroll/pagereveal state sync happens pre-paint
            // but on slow loads sits later than any fixed clock guard.
            // Pre-paint mutations are invisible by definition; the morph
            // transitions are also gated off until ~350ms post-init.
            const fpGuard = Math.max(200, (sample.firstPaintT ?? 0) + 80)
            if (sample.t > fpGuard && prevSampleT > fpGuard) navShellFlips++
          }
          prevScrolled = sample.navShell.scrolledMobile
          prevSampleT = sample.t
        }
      }
      if (navShellFlips > 0 && (s.scrollY || s.preScroll)) {
        issues.push(`nav-shell-flip: scrolled-mobile class flipped ${navShellFlips} time(s) after first paint`)
      }
      // 5. Blank-frame detection. A PNG with stddev < 4 across the
      //    sampled grid means the captured area is uniform — the
      //    page area is showing only background color. On a real
      //    page with chrome (nav + first section) we expect
      //    stddev > 20.
      let blankFrames = 0
      let blankFrameSamples = []
      for (let i = 0; i < pngStats.length; i++) {
        const p = pngStats[i]
        if (p.stats && p.stats.stddev < 4 && p.stats.mean > 220) {
          // High mean + low stddev = uniform light color (page bg).
          blankFrames++
          blankFrameSamples.push(`${p.label}@${p.t}ms`)
        }
      }
      if (blankFrames > 0) {
        issues.push(`blank-frames: ${blankFrames} (${blankFrameSamples.slice(0, 3).join(', ')})`)
      }
      // 6. Inflight-animation count anomalies. A page that just
      //    landed should have all entrance animations completed by
      //    1500ms. Any sample past 1500ms with > 4 inflight is
      //    a long-running animation budget leak.
      //
      // Filter uses s.t = probe.t = the in-page performance.now() clock,
      // which starts near 0 when the destination page loads — so it
      // correctly measures "time since destination page loaded" for
      // nav/back/settled samples. The one exception is the 'pre' baseline
      // sample, which runs on the SOURCE page whose clock may already read
      // 2400ms+ (a long-lived pre-navigation page). Exclude 'pre' samples
      // explicitly: they measure source-page state, not destination-page
      // animation settle, and were the cause of false inflight-anim-leak
      // reports on scenarios where the source page was open for >1.5s.
      const lateSamples = samples.filter((s) => s.label !== 'pre' && s.t > 1500)
      const lateAnimMax = lateSamples.length ? Math.max(...lateSamples.map((s) => s.inflightAnimations)) : 0
      if (lateAnimMax > 6) {
        issues.push(`inflight-anim-leak: ${lateAnimMax} animations running at t > 1.5s (excl. expected loops)`)
      }

      const elapsed = Date.now() - t0
      let line
      if (issues.length === 0) {
        pass++
        line = `✓ ${s.name}  samples=${samples.length}  png=${pngStats.length}  (${elapsed}ms)`
      } else {
        fail++
        line = `✗ ${s.name}  ${issues.join(' / ')}  (${elapsed}ms)`
      }
      lines.push(line)
      console.log(`  ${issues.length === 0 ? '✓' : '✗'} ${s.name} ${elapsed}ms`)
      report.scenarios.push({
        name: s.name, kind: 'flicker', ok: issues.length === 0,
        viewport: `${s.viewport.width}x${s.viewport.height}`,
        samples, pngStats, issues, elapsedMs: elapsed,
        // Build relative paths to the captured PNGs for the report.
        frames: pngStats.map((p) => `${s.name}/${p.label}-${String(p.t).padStart(4, '0')}ms.png`),
      })
    })()

    try { await withTimeout(body, 30_000, `flicker ${s.name}`) } catch (err) {
      fail++
      const elapsed = Date.now() - t0
      const msg = err.timedOut ? `BUDGET EXCEEDED (30s)` : err.message
      lines.push(`✗ ${s.name}  ${msg}  (${elapsed}ms)`)
      console.log(`  ✗ ${s.name} ${msg} ${elapsed}ms`)
      report.scenarios.push({ name: s.name, kind: 'flicker', ok: false, issues: [msg], elapsedMs: elapsed })
    }

    try { await withTimeout(context.close(), 3_000, 'context.close').catch(() => {}) } catch {}
  }

  await runScenariosWithPool(launcher, FLICKER_SCENARIOS, 3, runOne)
  return { lines, pass, fail }
}

// ============================================================
// HTML report
// ============================================================

function writeHtmlReport(report) {
  const esc = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]))
  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;background:#0e0e12;color:#e8e8ee;padding:32px}
    h1{font-size:22px;margin-bottom:4px}
    .meta{color:#8a8a98;font-size:13px;margin-bottom:32px}
    .scenario{background:#16171c;border:1px solid #25262c;border-radius:14px;padding:20px;margin-bottom:24px}
    .scenario.ok{border-left:4px solid #4ade80}
    .scenario.fail{border-left:4px solid #ef4444}
    .scenario h2{font-size:16px;margin-bottom:8px;display:flex;align-items:center;gap:10px}
    .pill{font-size:11px;padding:2px 8px;border-radius:100px;background:#25262c;color:#a8a8b8;font-weight:600;letter-spacing:.5px;text-transform:uppercase}
    .pill.ok{background:#103820;color:#4ade80}
    .pill.fail{background:#3a1010;color:#ef4444}
    .row{display:flex;gap:12px;font-size:12px;color:#8a8a98;margin-bottom:12px;flex-wrap:wrap}
    .row b{color:#c8c8d0;font-weight:600}
    .issues{background:#2a1010;border:1px solid #5a2828;color:#fcc;padding:10px 12px;border-radius:8px;margin:8px 0;font-size:12px;line-height:1.6}
    .issues b{color:#ff9090}
    .shot{display:block;max-width:100%;border-radius:8px;border:1px solid #2a2b32;background:#222;margin-top:8px}
    .frames{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;margin-top:8px}
    .frames img{width:100%;border-radius:6px;border:1px solid #2a2b32}
    .frame-label{font-size:10px;color:#8a8a98;margin-bottom:14px}
    video{max-width:100%;border-radius:8px;border:1px solid #2a2b32;margin-top:8px;display:block}
    .perf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:10px}
    .perf-cell{background:#1d1e24;border:1px solid #2a2b32;border-radius:8px;padding:10px 12px}
    .perf-label{font-size:10px;color:#8a8a98;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
    .perf-val{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px;color:#e8e8ee;font-weight:600}
    .perf-val.good{color:#4ade80}
    .perf-val.bad{color:#ef4444}
    .perf-val small{font-size:11px;color:#8a8a98;font-weight:400;display:block;margin-top:2px}
    details{margin-top:8px}
    summary{cursor:pointer;color:#8a8a98;font-size:12px;padding:6px 0}
    .drift{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#8a8a98}
  `
  const sections = report.scenarios.map((sc) => {
    const cls = sc.ok ? 'ok' : 'fail'
    const issuesHtml = (sc.issues || []).length
      ? `<div class="issues"><b>Issues:</b> ${sc.issues.map(esc).join(' / ')}</div>`
      : ''
    const driftHtml = sc.drift
      ? `<div class="drift">drift: ${sc.drift.map((m) => `t=${m.t}ms top=${m.top}`).join(' · ')}</div>`
      : ''
    let body = ''
    if (sc.kind === 'anchor' && sc.screenshot) {
      body = `<img class="shot" src="${esc(sc.screenshot)}" alt="${esc(sc.name)}">`
    } else if (sc.kind === 'perf' && sc.stats) {
      const s = sc.stats
      const tier120Badge = sc.passes120
        ? `<span class="pill ok" style="margin-left:8px">120fps ✓</span>`
        : `<span class="pill" style="margin-left:8px;background:#3a2a10;color:#e8a868">120fps ${sc.issues120 && sc.issues120.length ? '✗' : '—'}</span>`
      const longTaskOver60 = s.longTasks.filter((t) => t.duration > PERF_60.longTaskMaxMs).length
      const loafOver60 = s.loaf.filter((t) => t.duration > PERF_60.loafMaxDurationMs / 2).length
      body = `
        <div style="margin-top:8px;">${tier120Badge}</div>
        <div class="perf-grid">
          <div class="perf-cell"><div class="perf-label">avg fps</div><div class="perf-val ${s.avgFps >= PERF_60.avgFpsMin ? 'good' : 'bad'}">${s.avgFps.toFixed(1)} <small>${s.avgFps >= PERF_120.avgFpsMin ? '120fps✓' : '120fps✗'}</small></div></div>
          <div class="perf-cell"><div class="perf-label">p95 frame</div><div class="perf-val ${s.p95FrameMs <= PERF_60.p95FrameMaxMs ? 'good' : 'bad'}">${s.p95FrameMs.toFixed(1)}ms <small>${s.p95FrameMs <= PERF_120.p95FrameMaxMs ? '120fps✓' : '120fps✗'}</small></div></div>
          <div class="perf-cell"><div class="perf-label">max frame</div><div class="perf-val ${s.maxFrameMs <= PERF_60.maxFrameMs ? 'good' : 'bad'}">${s.maxFrameMs.toFixed(1)}ms</div></div>
          <div class="perf-cell"><div class="perf-label">frames &gt;8.3ms <small>(missed 120fps)</small></div><div class="perf-val">${s.framesOver8}</div></div>
          <div class="perf-cell"><div class="perf-label">frames &gt;16.7ms <small>(missed 60fps)</small></div><div class="perf-val">${s.framesOver16}</div></div>
          <div class="perf-cell"><div class="perf-label">stutters &gt;33ms</div><div class="perf-val ${s.framesOver33 <= PERF_60.stutterFrameMax ? 'good' : 'bad'}">${s.framesOver33}</div></div>
          <div class="perf-cell"><div class="perf-label">drops &gt;50ms</div><div class="perf-val ${s.framesOver50 === 0 ? 'good' : 'bad'}">${s.framesOver50}</div></div>
          <div class="perf-cell"><div class="perf-label">long tasks</div><div class="perf-val ${longTaskOver60 <= PERF_60.longTaskMaxCount ? 'good' : 'bad'}">${s.longTaskCount} <small>(max ${s.longTaskMaxMs}ms)</small></div></div>
          <div class="perf-cell"><div class="perf-label">long anim frames</div><div class="perf-val ${loafOver60 <= PERF_60.loafMaxCount && s.loafMaxMs <= PERF_60.loafMaxDurationMs ? 'good' : 'bad'}">${s.loafCount} <small>(max ${s.loafMaxMs}ms · blk ${s.blockingMaxMs}ms)</small></div></div>
          <div class="perf-cell"><div class="perf-label">input → load</div><div class="perf-val ${sc.inputLatency == null ? '' : (sc.inputLatency <= PERF_60.inputLatencyMaxMs ? 'good' : 'bad')}">${sc.inputLatency == null ? '—' : sc.inputLatency + 'ms'}</div></div>
          <div class="perf-cell"><div class="perf-label">frames captured</div><div class="perf-val">${s.frameCount}</div></div>
          ${s.scrollActiveMs > 50 ? `
          <div class="perf-cell"><div class="perf-label">pre-scroll delay</div><div class="perf-val">${s.preScrollDelayMs.toFixed(0)}ms <small>capture→firstMove</small></div></div>
          <div class="perf-cell"><div class="perf-label">scroll active</div><div class="perf-val">${s.scrollActiveMs.toFixed(0)}ms <small>${Math.round(s.scrollTotalPx)}px</small></div></div>
          <div class="perf-cell"><div class="perf-label">frames &gt;16ms in scroll</div><div class="perf-val ${s.framesOver16InScroll <= 3 ? 'good' : 'bad'}">${s.framesOver16InScroll} <small>missed 60fps</small></div></div>
          <div class="perf-cell"><div class="perf-label">frames &gt;12ms in scroll</div><div class="perf-val ${s.framesOver12InScroll <= 5 ? 'good' : 'bad'}">${s.framesOver12InScroll} <small>micro-stutters</small></div></div>
          <div class="perf-cell"><div class="perf-label">loaf during scroll</div><div class="perf-val ${s.loafDuringScrollCount === 0 ? 'good' : 'bad'}">${s.loafDuringScrollCount} <small>${s.loafDuringScrollMs.toFixed(0)}ms inside</small></div></div>
          <div class="perf-cell"><div class="perf-label">jerk max <small>(consecutive 60Hz)</small></div><div class="perf-val ${s.displayJumpJerkMax <= 60 ? 'good' : 'bad'}">${s.displayJumpJerkMax.toFixed(0)}px</div></div>
          <div class="perf-cell"><div class="perf-label">jerk mean / cv</div><div class="perf-val">${s.displayJumpJerkMean.toFixed(0)}px <small>cv ${s.displayJumpJerkCv.toFixed(2)}</small></div></div>
          <div class="perf-cell"><div class="perf-label">scroll stalls</div><div class="perf-val ${s.scrollStallCount === 0 ? 'good' : 'bad'}">${s.scrollStallCount} <small>${s.scrollStallMs.toFixed(0)}ms total</small></div></div>
          <div class="perf-cell"><div class="perf-label">jump60 / jump120</div><div class="perf-val">${s.maxJumpPer60Hz.toFixed(0)} / ${s.maxJumpPer120Hz.toFixed(0)}px</div></div>
          ` : ''}
        </div>
        ${sc.issues120 && sc.issues120.length && sc.passes60 ? `<div class="issues" style="background:#2a2010;border-color:#6a4828;color:#fcd"><b>120fps tier (aspirational):</b> ${sc.issues120.map(esc).join(' / ')}</div>` : ''}`
    } else if (sc.kind === 'flow') {
      const videoBlock = sc.video ? `<video controls muted><source src="${esc(sc.video)}" type="video/webm"></video>` : ''
      const framesBlocks = (sc.framesPerNav || []).map((nav) => `
        <details open><summary>${esc(nav.prefix)}  (${nav.frames.length} frames)</summary>
          <div class="frames">
            ${nav.frames.map((f) => `<div><img src="${esc(f)}"><div class="frame-label">${esc(f.split('/').pop())}</div></div>`).join('')}
          </div>
        </details>`).join('')
      body = videoBlock + framesBlocks
    } else if (sc.kind === 'flicker') {
      // Flicker scenarios: render a thumbnail strip of every frame
      // (each captured at a known timestamp) so a human can scan
      // for the bug class the harness flagged.
      const framesBlock = (sc.frames || []).map((f, i) => {
        const stats = (sc.pngStats || [])[i]
        const px = stats && stats.stats ? `μ${stats.stats.mean.toFixed(0)} σ${stats.stats.stddev.toFixed(1)}` : ''
        const labelTime = f.split('/').pop().replace('.png', '')
        return `<div><img src="${esc(f)}"><div class="frame-label">${esc(labelTime)} ${esc(px)}</div></div>`
      }).join('')
      // Sample-state strip: brand opacity + section state at each sample.
      const sampleTable = (sc.samples || []).map((sample) => {
        const brand = sample.brand
        const navS = sample.navShell
        return `<tr>
          <td>${sample.label}@${sample.t}ms</td>
          <td>${esc(sample.url || '')}</td>
          <td>${brand ? `${brand.which} t=${brand.top}px op=${brand.opacity.toFixed(2)}${brand.isHiddenClass ? ' .hidden' : ''}` : '—'}</td>
          <td>${sample.main ? `op=${sample.main.opacity.toFixed(2)}` : '—'}</td>
          <td>r=${sample.reveals ? `${sample.reveals.visibleInView}/${sample.reveals.inView} (hid ${sample.reveals.hiddenInView})` : '—'}</td>
          <td>s=${sample.sectionsInViewInvisible}inv/${sample.sectionsInViewMidFade}mid</td>
          <td>${navS ? `sm=${navS.scrolledMobile}` : '—'}</td>
          <td>anim=${sample.inflightAnimations}</td>
          <td style="font-family:monospace;font-size:10px;color:#8a8a98">${esc((sample.htmlClasses || '').slice(0, 40))}</td>
        </tr>`
      }).join('')
      body = `
        <div class="frames">${framesBlock}</div>
        <details><summary>per-sample DOM state (${(sc.samples || []).length} samples)</summary>
          <table style="width:100%;border-collapse:collapse;font-family:ui-monospace,monospace;font-size:11px;margin-top:8px">
            <thead><tr style="color:#8a8a98;text-align:left;border-bottom:1px solid #2a2b32">
              <th style="padding:6px 8px">sample</th>
              <th style="padding:6px 8px">url</th>
              <th style="padding:6px 8px">brand</th>
              <th style="padding:6px 8px">main</th>
              <th style="padding:6px 8px">reveals</th>
              <th style="padding:6px 8px">sections</th>
              <th style="padding:6px 8px">nav</th>
              <th style="padding:6px 8px">anim</th>
              <th style="padding:6px 8px">html.classes</th>
            </tr></thead>
            <tbody>${sampleTable}</tbody>
          </table>
        </details>`
    }
    const subline = []
    if (sc.url) subline.push(`<b>url</b> ${esc(sc.url)}`)
    if (sc.viewport) subline.push(`<b>vp</b> ${esc(sc.viewport)}`)
    if (typeof sc.cls === 'number') subline.push(`<b>CLS</b> ${sc.cls.toFixed(3)}`)
    if (sc.motionStates) subline.push(`<b>motion</b> ${esc(sc.motionStates.join(', '))}`)
    return `
      <section class="scenario ${cls}">
        <h2>${esc(sc.name)} <span class="pill ${cls}">${cls.toUpperCase()}</span></h2>
        <div class="row">${subline.join('')}</div>
        ${driftHtml}
        ${issuesHtml}
        ${body}
      </section>`
  }).join('\n')

  const pass = report.scenarios.filter((s) => s.ok).length
  const fail = report.scenarios.length - pass

  // A/B comparison: group scenarios by their `ab` key and render the
  // gap as a side-by-side table. The first scenario in each group is
  // the BASELINE (home anchor click); subsequent rows are subpage
  // hashloads. Cells flag where the subpage is materially worse than
  // the baseline so the gap is immediately visible.
  const abGroups = {}
  for (const sc of report.scenarios) {
    if (sc.ab && sc.stats) {
      if (!abGroups[sc.ab]) abGroups[sc.ab] = []
      abGroups[sc.ab].push(sc)
    }
  }
  const abHtml = Object.keys(abGroups).length === 0 ? '' : `
    <section class="scenario" style="border-left:4px solid #e8a868">
      <h2>A/B smoothness gap — home anchor-click vs subpage hashload</h2>
      <div style="font-size:12px;color:#8a8a98;margin-bottom:12px;line-height:1.5">
        Same primitive (window.scrollTo behavior:smooth) on both. Difference is main-thread context: home click fires on a settled page; subpage hashload fires during page init. A clear gap in <b>loaf during scroll</b>, <b>rAF gaps &gt;20ms</b>, or <b>scroll stalls</b> is what the user perceives as ~20fps subpage scroll.
      </div>
      ${Object.entries(abGroups).map(([groupKey, group]) => {
        const baseline = group.find((g) => g.action && g.action.startsWith('homeclick')) || group[0]
        const others = group.filter((g) => g !== baseline)
        const cell = (sc, label, val, baselineVal, fmt, lowerIsBetter = true) => {
          const v = fmt(val)
          if (sc === baseline) return `<td>${v}</td>`
          const diff = lowerIsBetter ? (val > baselineVal * 1.5 && val > 5) : (val < baselineVal * 0.5)
          const color = diff ? '#ef4444' : '#4ade80'
          return `<td style="color:${color}">${v}</td>`
        }
        const fmt0 = (v) => Math.round(v).toString()
        const fmt1 = (v) => v.toFixed(1)
        const fmtInt = (v) => String(v)
        return `
          <div style="overflow-x:auto;margin-bottom:18px">
            <div style="font-size:12px;color:#c8c8d0;margin-bottom:6px"><b>group: ${esc(groupKey)}</b></div>
            <table style="width:100%;border-collapse:collapse;font-family:ui-monospace,monospace;font-size:11px">
              <thead>
                <tr style="color:#8a8a98;text-align:left;border-bottom:1px solid #2a2b32">
                  <th style="padding:6px 8px">scenario</th>
                  <th style="padding:6px 8px" title="time from capture start (~commit / click) to first visible scroll movement">pre-delay</th>
                  <th style="padding:6px 8px">px</th>
                  <th style="padding:6px 8px">ms</th>
                  <th style="padding:6px 8px" title="missed 60fps frames during scroll">&gt;16ms</th>
                  <th style="padding:6px 8px" title="micro-stutters during scroll">&gt;12ms</th>
                  <th style="padding:6px 8px">LoAFs</th>
                  <th style="padding:6px 8px" title="jerk: max change in per-60Hz-jump between consecutive frames. Lower = smoother feel.">jerk max</th>
                  <th style="padding:6px 8px">jerk mean</th>
                  <th style="padding:6px 8px">jerk CV</th>
                  <th style="padding:6px 8px">jump60</th>
                  <th style="padding:6px 8px">jump120</th>
                </tr>
              </thead>
              <tbody>
                ${[baseline, ...others].map((sc, i) => {
                  const st = sc.stats
                  const role = i === 0 ? 'BASE' : 'subpage'
                  const labelStyle = i === 0
                    ? 'background:#103820;color:#4ade80'
                    : 'background:#2a1010;color:#fbb'
                  return `
                    <tr style="border-bottom:1px solid #1f2027">
                      <td style="padding:6px 8px;color:#e8e8ee">
                        <span style="font-size:9px;padding:1px 6px;border-radius:100px;${labelStyle};margin-right:6px;letter-spacing:.5px">${role}</span>
                        ${esc(sc.name)}
                      </td>
                      ${cell(sc, 'pre',  st.preScrollDelayMs,     baseline.stats.preScrollDelayMs,     fmt0)}
                      ${cell(sc, 'px',   st.scrollTotalPx,        baseline.stats.scrollTotalPx,        fmt0, false)}
                      ${cell(sc, 'ms',   st.scrollActiveMs,       baseline.stats.scrollActiveMs,       fmt0)}
                      ${cell(sc, '16',   st.framesOver16InScroll, baseline.stats.framesOver16InScroll, fmtInt)}
                      ${cell(sc, '12',   st.framesOver12InScroll, baseline.stats.framesOver12InScroll, fmtInt)}
                      ${cell(sc, 'lN',   st.loafDuringScrollCount,baseline.stats.loafDuringScrollCount,fmtInt)}
                      ${cell(sc, 'jrkMx',st.displayJumpJerkMax,   baseline.stats.displayJumpJerkMax,   fmt0)}
                      ${cell(sc, 'jrkMe',st.displayJumpJerkMean,  baseline.stats.displayJumpJerkMean,  fmt0)}
                      ${cell(sc, 'jrkCv',st.displayJumpJerkCv,    baseline.stats.displayJumpJerkCv,    (v) => v.toFixed(2))}
                      ${cell(sc, 'j60',  st.maxJumpPer60Hz,       baseline.stats.maxJumpPer60Hz,       fmt0)}
                      ${cell(sc, 'j120', st.maxJumpPer120Hz,      baseline.stats.maxJumpPer120Hz,      fmt0)}
                    </tr>`
                }).join('')}
              </tbody>
            </table>
          </div>`
      }).join('\n')}
    </section>`

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>MS.church harness report</title><style>${css}</style></head><body>
    <h1>MS.church harness</h1>
    <div class="meta">base ${esc(BASE)} · ${pass} pass · ${fail} fail · ${report.scenarios.length} total · generated ${new Date().toLocaleString()}</div>
    ${abHtml}
    ${sections}
  </body></html>`
  writeFileSync(resolve(OUT_DIR, 'report.html'), html)
}

// ============================================================
// main
// ============================================================

async function run() {
  console.log(`harness → base ${BASE}`)
  console.log(`         drift land-tol=${DRIFT_LAND_TOLERANCE}px stable-tol=${DRIFT_STABLE_TOLERANCE}px  CLS<${CLS_THRESHOLD}`)
  console.log(`         heading-min-visible=${HEADING_MIN_VISIBLE_PX}px  fixed-header-bottom=${FIXED_HEADER_BOTTOM_DESKTOP}/${FIXED_HEADER_BOTTOM_MOBILE}px  reserved-waste>${RESERVED_WASTE_THRESHOLD}px`)
  console.log(`         perf 60fps tier: avgFps≥${PERF_60.avgFpsMin}  p95≤${PERF_60.p95FrameMaxMs}ms  max≤${PERF_60.maxFrameMs}ms  stutters≤${PERF_60.stutterFrameMax}`)
  console.log(`         perf 120fps tier: avgFps≥${PERF_120.avgFpsMin}  p95≤${PERF_120.p95FrameMaxMs}ms  max≤${PERF_120.maxFrameMs}ms  stutters≤${PERF_120.stutterFrameMax}`)
  console.log(`         (vsync + 60fps cap disabled in chromium so rAF reflects per-frame work cost)`)
  console.log('')
  // Disable Chromium's vsync + 60fps rAF cap so rAF intervals reflect actual
  // per-frame work cost. On a real 120Hz display the browser would render
  // each rAF at the display's frame budget; here we measure how much budget
  // each frame would consume on that hardware. Frames consistently under
  // ~8.33ms = capable of 120fps; under ~16.67ms = capable of 60fps.
  //
  // Two browsers are launched intentionally:
  //
  //   * perfBrowser — vsync + frame-rate cap disabled. Necessary for
  //     PERF scenarios so rAF intervals reflect per-frame work, not
  //     display refresh. NOT usable for view-transition flows: the
  //     uncapped rAF schedules new frames before the View Transition
  //     API's snapshot pipeline settles, which raises an uncaught
  //     "Transition was skipped" exception and kills the renderer.
  //
  //   * mainBrowser — default Chromium flags. Used for ANCHOR and
  //     FLOW scenarios so view-transitions, scroll-snap, and the
  //     site's actual rendering pipeline behave the same way they
  //     would in a real browser.
  //
  // Each suite gets a worker pool — N independent browser processes
  // pulling from a shared scenario queue. A renderer crash in one
  // scenario can never cascade into another (each scenario gets a
  // fresh context, and each worker has its own browser). With pool
  // parallelism a typical run completes in ~60-90s instead of ~225s.
  const perfLauncher = () => chromium.launch({
    headless: true,
    executablePath: EXEC_PATH,
    args: [
      '--disable-frame-rate-limit',
      '--disable-gpu-vsync',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
    ],
  })
  const mainLauncher = () => chromium.launch({ headless: true, executablePath: EXEC_PATH })
  const report = { scenarios: [] }

  console.log(`  pools: anchor=${ANCHOR_PARALLELISM} perf=${PERF_PARALLELISM} flow=${FLOW_PARALLELISM} flicker=3`)
  console.log('')

  // Allow running just the flicker suite for fast iteration:
  //   HARNESS_ONLY=flicker node scripts/harness/run.mjs
  const only = process.env.HARNESS_ONLY || ''
  const runAnchor  = !only || /\banchor\b/.test(only)
  const runPerf    = !only || /\bperf\b/.test(only)
  const runFlow    = !only || /\bflow\b/.test(only)
  const runFlicker = !only || /\bflicker\b/.test(only)

  const empty = { lines: [], pass: 0, fail: 0 }
  let a = empty, p = empty, f = empty, fl = empty
  if (runAnchor)  { a  = await runAnchorScenarios(mainLauncher, report);  console.log('') }
  if (runPerf)    { p  = await runPerfScenarios(perfLauncher, report);    console.log('') }
  if (runFlow)    { f  = await runFlowScenarios(mainLauncher, report);    console.log('') }
  if (runFlicker) { fl = await runFlickerScenarios(mainLauncher, report) }

  writeHtmlReport(report)

  const total =
    (runAnchor  ? ANCHOR_SCENARIOS.length  : 0) +
    (runPerf    ? PERF_SCENARIOS.length    : 0) +
    (runFlow    ? FLOW_SCENARIOS.length    : 0) +
    (runFlicker ? FLICKER_SCENARIOS.length : 0)
  const passTotal = a.pass + p.pass + f.pass + fl.pass
  const failTotal = a.fail + p.fail + f.fail + fl.fail
  const summary = `\n${passTotal} pass · ${failTotal} fail · ${total} total\nreport: ${relative(process.cwd(), resolve(OUT_DIR, 'report.html'))}`
  console.log(summary)
  writeFileSync(
    resolve(OUT_DIR, 'results.txt'),
    [...a.lines, '', ...p.lines, '', ...f.lines, '', ...fl.lines, summary].join('\n') + '\n',
  )
  if (failTotal > 0) process.exit(1)
}

run().catch((e) => { console.error(e); process.exit(1) })
