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
  inputLatencyMaxMs: 250,
}
// Backwards-compat alias used by the HTML report. Default reporting uses the
// 60fps bar (so green/red coloring matches the "ship" bar); 120fps results
// are shown as extra metrics on each scenario card.
const PERF = PERF_60

// Smooth-scroll deep-link landing typically completes in ~700ms (the
// subpage-header script does its second rescroll pass at 800ms). Sample
// over a window that captures both the journey (for the report) and the
// final stable state. Stability is asserted across the last three samples.
const DRIFT_SAMPLES_MS = [100, 400, 1200, 1800, 2600]
const DRIFT_STABLE_SAMPLES = 3 // last N samples must be within DRIFT_STABLE_TOLERANCE

// Visual quality knobs
// FIXED_HEADER_BOTTOM = where the floating-header zone (.subpage-top-fog + brand + back)
// ends. Anchored sections must land BELOW this; eyebrow/heading must be visible BELOW this.
const FIXED_HEADER_BOTTOM_DESKTOP = 110
const FIXED_HEADER_BOTTOM_MOBILE  = 88
const HEADING_MIN_VISIBLE_PX = 24
const RESERVED_WASTE_THRESHOLD = 120

const DESKTOP = { width: 1280, height: 800 }
const MOBILE  = { width: 390,  height: 844 }

// Suppress sandbox/offline-only third-party noise
const IGNORED_ERROR_PATTERNS = [
  /ERR_CERT_AUTHORITY_INVALID/, /ERR_NAME_NOT_RESOLVED/, /ERR_INTERNET_DISCONNECTED/,
  /vercel-insights/, /vercel\.com\/_vercel\/insights/, /Failed to load resource/,
  /fonts\.googleapis\.com/, /fonts\.gstatic\.com/, /page\.gensparksite\.com/,
  /youtube/i, /lh3\.googleusercontent/, /engagehub/, /jotform/i, /googleapis\.com/,
  /service\?service=/, /script\.js/, /cdn\.vercel-insights/,
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

  { name: '10-jump-cooking-desktop',   path: '/outreach', anchor: '#cooking-ministry',    viewport: DESKTOP, expected: 130 },
  { name: '11-jump-cooking-mobile',    path: '/outreach', anchor: '#cooking-ministry',    viewport: MOBILE,  expected: 110 },
  { name: '12-jump-sunday-desktop',    path: '/visit',    anchor: '#sunday-school',       viewport: DESKTOP, expected: 130 },
  { name: '13-jump-sunday-mobile',     path: '/visit',    anchor: '#sunday-school',       viewport: MOBILE,  expected: 110 },
  { name: '14-jump-breakfast-mobile',  path: '/outreach', anchor: '#community-breakfast', viewport: MOBILE,  expected: 110 },
  { name: '15-jump-mission-mobile',    path: '/about',    anchor: '#mission',             viewport: MOBILE,  expected: 110 },
  { name: '16-jump-expect-desktop',    path: '/visit',    anchor: '#what-to-expect',      viewport: DESKTOP, expected: 130 },
  { name: '17-jump-after-mobile',      path: '/visit',    anchor: '#after-service',       viewport: MOBILE,  expected: 110 },
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

  // 35s — smooth-scroll-to-hash (anchor jumps on the same page).
  { name: '35-perf-hash-visit-sundayschool-mobile', viewport: MOBILE, path: '/visit',    action: 'hash', hash: '#sunday-school' },
  { name: '36-perf-hash-visit-afterservice-mobile', viewport: MOBILE, path: '/visit',    action: 'hash', hash: '#after-service' },
  { name: '37-perf-hash-outreach-cooking-mobile',   viewport: MOBILE, path: '/outreach', action: 'hash', hash: '#cooking-ministry' },

  // 38s — cross-page click navigations (view-transition path).
  { name: '38-perf-click-findus-mobile',  viewport: MOBILE,  path: '/', action: 'click', selector: 'a.find-us-btn' },
  { name: '39-perf-click-findus-desktop', viewport: DESKTOP, path: '/', action: 'click', selector: 'a.find-us-btn' },
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
      { type: 'navigate', kind: 'click', selector: 'a[href="/outreach#cooking-ministry"]', captureFrames: true },
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
    name: '23-flow-home-find-us-to-visit-and-back-mobile',
    viewport: MOBILE,
    steps: [
      { type: 'goto', url: '/' },
      { type: 'navigate', kind: 'click', selector: 'a.find-us-btn', captureFrames: true },
      { type: 'navigate', kind: 'goBack', captureFrames: true },
    ],
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

async function waitForSettled(page) {
  await page.waitForLoadState('load').catch(() => {})
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
  const actionPromise = action()
  for (let i = 0; i < frameCount; i++) {
    const t = Math.round(i * interval)
    try {
      await page.screenshot({
        path: resolve(dir, `${prefix}-${String(i).padStart(2, '0')}-${t}ms.png`),
      })
    } catch (e) {}
    await new Promise((r) => setTimeout(r, interval))
  }
  await actionPromise.catch(() => {})
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
      if (visiblePx < opts.HEADING_MIN_VISIBLE_PX) {
        out.issues.push(`heading covered: ${s.id || '<no-id>'} (${visiblePx.toFixed(0)}px visible below header-zone @${fixedHeaderBottom})`)
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

async function runAnchorScenarios(browser, report) {
  const lines = []
  let pass = 0, fail = 0

  for (const s of ANCHOR_SCENARIOS) {
    const context = await browser.newContext({ viewport: s.viewport })
    await installCLSObserver(context)
    const page = await context.newPage()
    const errors = attachPageMonitors(page)
    const issues = []
    const url = BASE + s.path + (s.anchor || '')

    try {
      await page.goto(url, { waitUntil: 'commit' })

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
            return { top: Math.round(r.top), scrollY: Math.round(window.scrollY) }
          }, s.anchor)
          driftMeasurements.push({ t, ...m })
        }
        const last = driftMeasurements[driftMeasurements.length - 1]
        if (!last || last.top == null) issues.push(`target not in DOM`)
        else {
          const landDrift = Math.abs(last.top - s.expected)
          if (landDrift > DRIFT_LAND_TOLERANCE) {
            issues.push(`landDrift=${landDrift} (expected ~${s.expected}±${DRIFT_LAND_TOLERANCE})`)
          }
          // Stability across the last DRIFT_STABLE_SAMPLES samples. Earlier
          // samples may still be mid-smooth-scroll, which is intentional.
          const tail = driftMeasurements.slice(-DRIFT_STABLE_SAMPLES)
          for (let i = 1; i < tail.length; i++) {
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
      await page.screenshot({ path: screenshotPath })

      const driftStr = driftMeasurements
        ? ` top@${driftMeasurements.map((m) => `${m.t}=${m.top}`).join(' ')}`
        : ''
      let line
      if (issues.length === 0) {
        pass++
        line = `✓ ${s.name}${driftStr}  cls=${cls.toFixed(3)}`
      } else {
        fail++
        line = `✗ ${s.name}${driftStr}  ${issues.join(' / ')}`
      }
      report.scenarios.push({
        name: s.name, kind: 'anchor', ok: issues.length === 0,
        url, viewport: `${s.viewport.width}x${s.viewport.height}`,
        screenshot: `${s.name}.png`, drift: driftMeasurements, cls, issues,
      })
      lines.push(line)
    } catch (err) {
      fail++
      lines.push(`✗ ${s.name}  ${err.message}`)
      report.scenarios.push({ name: s.name, kind: 'anchor', ok: false, url, issues: [err.message] })
    }

    console.log(lines[lines.length - 1])
    await context.close()
  }

  return { lines, pass, fail }
}

// ============================================================
// Performance scenarios — rAF FPS + long-tasks + LoAF + input latency
// ============================================================

async function installPerfObservers(page) {
  await page.evaluate(() => {
    window.__perf = { frames: [], longTasks: [], loaf: [], measuring: false }
    function tick(t) {
      if (window.__perf.measuring) {
        window.__perf.frames.push(t)
        requestAnimationFrame(tick)
      }
    }
    window.__perfStart = () => {
      window.__perf.frames = []
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
  return {
    frameCount: perf.frames.length,
    intervalCount: intervals.length,
    intervals,
    avgFps,
    p95FrameMs: p95,
    maxFrameMs: maxFrame,
    // 120fps + 60fps thresholds for color-coded display
    framesOver8: intervals.filter((i) => i > 8.33).length,  // missed 120fps
    framesOver16: intervals.filter((i) => i > 16.67).length, // missed 60fps
    framesOver33: intervals.filter((i) => i > 33).length,   // < 30fps
    framesOver50: intervals.filter((i) => i > 50).length,   // < 20fps
    longTasks: perf.longTasks,
    longTaskCount: perf.longTasks.length,
    longTaskMaxMs: longTaskMax,
    loaf: perf.loaf,
    loafCount: perf.loaf.length,
    loafMaxMs: loafMax,
    blockingMaxMs: blockingMax,
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


async function runPerfScenarios(browser, report) {
  const lines = []
  let pass = 0, fail = 0

  for (const s of PERF_SCENARIOS) {
    const context = await browser.newContext({ viewport: s.viewport })
    const page = await context.newPage()
    const errors = attachPageMonitors(page)

    let inputLatency = null
    try {
      await page.goto(BASE + s.path, { waitUntil: 'commit' })
      await waitForSettled(page)
      await installPerfObservers(page)
      await page.evaluate(() => window.__perfStart())

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
        // Drive a same-page smooth-scroll-to-anchor.
        await page.evaluate((hash) => {
          const t = document.querySelector(hash)
          if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, s.hash)
        await page.waitForTimeout(1400)
      } else if (s.action === 'click') {
        const t0 = Date.now()
        await Promise.all([
          page.waitForLoadState('load').catch(() => {}),
          page.click(s.selector),
        ])
        inputLatency = Date.now() - t0
        // Re-install observers on the destination page (the previous page's
        // window context is gone after navigation).
        await installPerfObservers(page)
        await page.evaluate(() => window.__perfStart())
        await page.waitForTimeout(1200)
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
      const passes60 = issues60.length === 0
      const passes120 = issues120.length === 0

      const tier120Tag = passes120 ? '120✓' : '120✗'
      const summary = `fps=${stats.avgFps.toFixed(1)} p95=${stats.p95FrameMs.toFixed(1)}ms max=${stats.maxFrameMs.toFixed(1)}ms  over16=${stats.framesOver16} over33=${stats.framesOver33}  loaf=${stats.loafCount}/${stats.loafMaxMs}ms  longtasks=${stats.longTaskCount}/${stats.longTaskMaxMs}ms${inputLatency != null ? ` clk=${inputLatency}ms` : ''} ${tier120Tag}`
      let line
      if (passes60) {
        pass++
        line = `✓ ${s.name}  ${summary}`
      } else {
        fail++
        line = `✗ ${s.name}  ${summary}  ${issues60.join(' / ')}`
      }
      lines.push(line)
      console.log(line)
      report.scenarios.push({
        name: s.name, kind: 'perf', ok: passes60,
        passes60, passes120, issues120,
        viewport: `${s.viewport.width}x${s.viewport.height}`,
        action: s.action + (s.hash ? ' ' + s.hash : '') + (s.selector ? ' ' + s.selector : ''),
        stats, inputLatency, issues: issues60,
      })
    } catch (err) {
      fail++
      const line = `✗ ${s.name}  ${err.message}`
      lines.push(line)
      console.log(line)
      report.scenarios.push({ name: s.name, kind: 'perf', ok: false, issues: [err.message] })
    }

    await context.close()
  }

  return { lines, pass, fail }
}

// ============================================================
// Flow scenarios (frame capture + post-nav assertions)
// ============================================================

async function runFlowScenarios(browser, report) {
  const lines = []
  let pass = 0, fail = 0

  for (const s of FLOW_SCENARIOS) {
    const sceneDir = resolve(OUT_DIR, s.name)
    if (existsSync(sceneDir)) rmSync(sceneDir, { recursive: true, force: true })
    const videoDir = resolve(OUT_DIR, `_video_${s.name}`)
    if (existsSync(videoDir)) rmSync(videoDir, { recursive: true, force: true })

    const context = await browser.newContext({
      viewport: s.viewport,
      recordVideo: { dir: videoDir, size: s.viewport },
    })
    await installCLSObserver(context)
    const page = await context.newPage()
    const errors = attachPageMonitors(page)
    const issues = []
    const motionStates = []
    const framesPerNav = []

    let navIdx = 0
    try {
      for (const step of s.steps) {
        if (step.type === 'goto') {
          await page.goto(BASE + step.url, { waitUntil: 'commit' })
          await waitForSettled(page)
        } else if (step.type === 'navigate') {
          navIdx++
          const prefix = `nav${String(navIdx).padStart(2, '0')}-${step.kind}`
          const trigger = async () => {
            if (step.kind === 'click') {
              await Promise.all([page.waitForLoadState('load').catch(() => {}), page.click(step.selector)])
            } else if (step.kind === 'goBack') {
              await Promise.all([page.waitForLoadState('load').catch(() => {}), page.goBack()])
            } else if (step.kind === 'goForward') {
              await Promise.all([page.waitForLoadState('load').catch(() => {}), page.goForward()])
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
          await waitForSettled(page)

          const noEntrance = await page.evaluate(() => document.documentElement.classList.contains('no-entrance'))
          motionStates.push(`${step.kind}=${noEntrance ? 'noEntrance' : 'ANIMATED'}`)
          if (!noEntrance) issues.push(`step ${navIdx} (${step.kind}): entrance animation NOT suppressed`)

          const stillAnim = await getInflightSectionAnimations(page)
          if (stillAnim.length) issues.push(`step ${navIdx}: sections still animating after settle`)
        }
      }

      const cls = await getCLS(page)
      if (cls > CLS_THRESHOLD) issues.push(`CLS=${cls.toFixed(3)}>${CLS_THRESHOLD}`)
      const probes = await visualProbes(page)
      if (probes.issues.length) issues.push(...probes.issues)
      if (errors.length) issues.push(`errors=[${errors.slice(0, 2).join(' | ')}${errors.length > 2 ? ' …' : ''}]`)

      let line
      if (issues.length === 0) {
        pass++
        line = `✓ ${s.name}  ${motionStates.join(', ')}  cls=${cls.toFixed(3)}`
      } else {
        fail++
        line = `✗ ${s.name}  ${motionStates.join(', ')}  ${issues.join(' / ')}`
      }
      report.scenarios.push({
        name: s.name, kind: 'flow', ok: issues.length === 0,
        viewport: `${s.viewport.width}x${s.viewport.height}`,
        motionStates, framesPerNav, cls, issues,
        video: `${s.name}.webm`,
      })
      lines.push(line)
    } catch (err) {
      fail++
      lines.push(`✗ ${s.name}  ${err.message}`)
      report.scenarios.push({ name: s.name, kind: 'flow', ok: false, issues: [err.message] })
    }

    await page.close()
    await context.close()

    try {
      const files = readdirSync(videoDir)
      const webm = files.find((f) => f.endsWith('.webm'))
      if (webm) renameSync(resolve(videoDir, webm), resolve(OUT_DIR, `${s.name}.webm`))
      rmSync(videoDir, { recursive: true, force: true })
    } catch {}

    console.log(lines[lines.length - 1])
  }

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
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>MS.church harness report</title><style>${css}</style></head><body>
    <h1>MS.church harness</h1>
    <div class="meta">base ${esc(BASE)} · ${pass} pass · ${fail} fail · ${report.scenarios.length} total · generated ${new Date().toLocaleString()}</div>
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
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-frame-rate-limit',
      '--disable-gpu-vsync',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
    ],
  })
  const report = { scenarios: [] }

  const a = await runAnchorScenarios(browser, report)
  console.log('')
  const p = await runPerfScenarios(browser, report)
  console.log('')
  const f = await runFlowScenarios(browser, report)

  await browser.close()

  writeHtmlReport(report)

  const total = ANCHOR_SCENARIOS.length + PERF_SCENARIOS.length + FLOW_SCENARIOS.length
  const passTotal = a.pass + p.pass + f.pass
  const failTotal = a.fail + p.fail + f.fail
  const summary = `\n${passTotal} pass · ${failTotal} fail · ${total} total\nreport: ${relative(process.cwd(), resolve(OUT_DIR, 'report.html'))}`
  console.log(summary)
  writeFileSync(
    resolve(OUT_DIR, 'results.txt'),
    [...a.lines, '', ...p.lines, '', ...f.lines, summary].join('\n') + '\n',
  )
  if (failTotal > 0) process.exit(1)
}

run().catch((e) => { console.error(e); process.exit(1) })
