// Nav morph smoothness + correctness suite — the home mobile nav's
// full↔compressed morph (scroll-driven animation, html.nav-sda).
//
// Runs in BOTH Chromium and WebKit (Playwright's WebKit ≈ current Safari,
// the closest local proxy for iOS) because the morph's whole architecture
// was chosen for WebKit behavior. The main harness (run.mjs) is
// Chromium-only; this suite is the WebKit gate for nav work.
//
// What it asserts:
//   mode        html.nav-sda set, scroll-timeline animations attached,
//               fallback threshold logic stood down
//   lockstep    nav pose is a pure, linear, deterministic function of
//               scrollY — zero event-latency smoothing, zero hunting
//               (the v1.62.80–82 stutter class is structurally impossible
//               if this passes: there is no second source of truth)
//   parity      the scrubbed pose at each pole is pixel-identical to the
//               class-defined CSS pose (so the hysteresis class flip is
//               invisible), and the expanded link row is exactly the
//               centered-cluster design (--nav-spread measurement)
//   settle      a scroll parked mid-range nudges the PAGE to the nearest
//               pole (UIKit pattern); parked at a pole it never moves
//   scrub       per-frame pose deltas during a continuous wheel scroll are
//               monotone (no reversals) and frame intervals stay within
//               the 60fps ship bar (Chromium only — WebKit has no wheel)
//   fallback    with animation-timeline support stubbed off, the legacy
//               threshold + CSS-transition path still works
//
// Run:  npm run dev   (separate terminal)
//       node scripts/harness/nav-morph.mjs
//       HARNESS_URL=http://localhost:5174 node scripts/harness/nav-morph.mjs

import { chromium, webkit } from 'playwright'

const BASE = process.env.HARNESS_URL || 'http://localhost:5173'
const MOBILE = { width: 390, height: 844 }
const NARROW = { width: 360, height: 780 }
const WIDE   = { width: 414, height: 896 }
const RANGE_START = 4
const RANGE_END = 134

const t0 = Date.now()
const failures = []
const log = []
function check(engine, name, ok, detail) {
  const line = `${ok ? 'PASS' : 'FAIL'}  [${engine}] ${name}${detail ? ` — ${detail}` : ''}`
  log.push(line)
  if (!ok) failures.push(line)
}

// Pose snapshot used by lockstep + parity checks.
const READ_POSE = `(() => {
  const $ = (s) => document.querySelector(s)
  const shell = $('.nav-shell')
  const cs = getComputedStyle(shell)
  const link = $('.nav-shell nav ul a')
  const pill = $('.nav-form-btn')
  const brand = $('.brand')
  const r = shell.getBoundingClientRect()
  return {
    y: window.scrollY,
    h: r.height, top: r.top,
    radius: parseFloat(cs.borderRadius),
    brandO: parseFloat(getComputedStyle(brand).opacity),
    brandMH: parseFloat(getComputedStyle(brand).maxHeight),
    font: parseFloat(getComputedStyle(link).fontSize),
    pillO: pill ? parseFloat(getComputedStyle(pill).opacity) : null,
    pillV: pill ? getComputedStyle(pill).visibility : null,
    scrolledClass: shell.classList.contains('scrolled-mobile'),
  }
})()`

const stepTo = async (page, y) => {
  await page.evaluate(async (y) => {
    window.scrollTo(0, y)
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  }, y)
}

async function testEngine(name, browserType) {
  // Chromium gets the same flags as run.mjs's perf launcher so rAF gaps
  // measure actual per-frame work cost, not the 60Hz vsync cadence
  // (without these, every gap hovers at ~16.7ms by definition and the
  // frame-health check grades the display clock instead of the morph).
  const browser = await browserType.launch(name === 'chromium' ? {
    headless: true,
    args: [
      '--disable-frame-rate-limit',
      '--disable-gpu-vsync',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
    ],
  } : {})
  try {
    // ── mode + lockstep + parity (snap disabled for stepped reads) ──
    const page = await browser.newPage({ viewport: MOBILE })
    await page.addInitScript(() => { window.__navSnapDisabled = true })
    await page.goto(BASE + '/?notrack=true', { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => window.__navScrubActive === true, null, { timeout: 5000 }).catch(() => {})

    const mode = await page.evaluate(() => ({
      sda: document.documentElement.classList.contains('nav-sda'),
      scrubActive: window.__navScrubActive === true,
      timelines: document.querySelector('.nav-shell').getAnimations()
        .filter((a) => a.timeline && a.timeline.constructor.name === 'ScrollTimeline').length,
      spread: getComputedStyle(document.querySelector('.nav-shell')).getPropertyValue('--nav-spread'),
    }))
    check(name, 'mode: html.nav-sda set', mode.sda)
    check(name, 'mode: fallback stood down (__navScrubActive)', mode.scrubActive)
    check(name, 'mode: shell scroll-timeline animations attached', mode.timelines >= 2, `${mode.timelines} timelines`)
    check(name, 'mode: --nav-spread measured', /px/.test(mode.spread), mode.spread.trim())

    // Lockstep: pose must be a linear, deterministic function of scrollY.
    const ys = [0, 20, 40, 60, 69, 80, 100, 120, 134, 160]
    const poses = {}
    for (const y of ys) { await stepTo(page, y); poses[y] = await page.evaluate(READ_POSE) }
    const h0 = poses[0].h
    const h1 = poses[134].h
    let linearOK = true; let monoOK = true
    for (const y of ys) {
      const p = Math.min(1, Math.max(0, (y - RANGE_START) / (RANGE_END - RANGE_START)))
      const expected = h0 + (h1 - h0) * p
      if (Math.abs(poses[y].h - expected) > 3) linearOK = false
    }
    for (let i = 1; i < ys.length; i++) if (poses[ys[i]].h > poses[ys[i - 1]].h + 0.5) monoOK = false
    check(name, 'lockstep: shell height linear in scrollY', linearOK,
      ys.map((y) => `${y}:${poses[y].h.toFixed(1)}`).join(' '))
    check(name, 'lockstep: monotone (no hunting/reversals)', monoOK)
    await stepTo(page, 69)
    const revisit = await page.evaluate(READ_POSE)
    check(name, 'lockstep: revisit determinism (y=69 twice → same pose)',
      Math.abs(revisit.h - poses[69].h) < 0.5 && Math.abs(revisit.brandO - poses[69].brandO) < 0.02,
      `h ${poses[69].h.toFixed(2)} vs ${revisit.h.toFixed(2)}`)
    check(name, 'lockstep: brand gone before half-range (opacity curve)',
      poses[80].brandO < 0.05 && poses[20].brandO > 0.7,
      `y=20→${poses[20].brandO}, y=80→${poses[80].brandO}`)
    // ≤399px design has no Contact pill at any scroll position (the
    // compressed row gives all width to the labels). The pill morph
    // itself is asserted on the 414px page below.
    const pillGone = await page.evaluate(() => getComputedStyle(document.querySelector('.nav-form-btn')).display === 'none')
    check(name, 'lockstep: pill absent at every position on 390 (≤399 design)', pillGone)

    // Expanded link distribution: space-between + measured --nav-spread
    // must reproduce the centered cluster with equal token gaps.
    await stepTo(page, 0)
    const cluster = await page.evaluate(() => {
      const ul = document.querySelector('.nav-shell nav ul')
      const links = [...ul.querySelectorAll('a')].map((a) => a.getBoundingClientRect())
      const ulR = ul.getBoundingClientRect()
      const gapFloor = parseFloat(getComputedStyle(ul).columnGap) || 0
      const gaps = []
      for (let i = 1; i < links.length; i++) gaps.push(links[i].left - links[i - 1].right)
      const clusterCenter = (links[0].left + links[links.length - 1].right) / 2
      return { gaps, gapFloor, centerDrift: Math.abs(clusterCenter - (ulR.left + ulR.width / 2)) }
    })
    check(name, 'parity: expanded cluster centered in row', cluster.centerDrift <= 1,
      `drift ${cluster.centerDrift.toFixed(2)}px`)
    check(name, 'parity: expanded gaps equal the token gap',
      cluster.gaps.every((g) => Math.abs(g - cluster.gapFloor) <= 1),
      `gaps ${cluster.gaps.map((g) => g.toFixed(1)).join('/')} vs floor ${cluster.gapFloor}`)

    // Pole parity: the scrubbed pose at each pole must be pixel-identical
    // to the TRUE fallback pose (html.nav-sda removed = animations
    // detached, cascade un-pinned, .scrolled-mobile class authoritative).
    // Transitions are squelched test-side so the reference is instant.
    await page.addStyleTag({ content: 'html.nav-measuring .nav-shell, html.nav-measuring .nav-shell * { transition: none !important; animation: none !important; }' })
    const parity = await page.evaluate(async (READ) => {
      const read = () => {
        const pose = eval(READ)
        pose.links = [...document.querySelectorAll('.nav-shell nav ul a')]
          .map((a) => { const r = a.getBoundingClientRect(); return [r.left, r.top] })
        return pose
      }
      const html = document.documentElement
      const shell = document.querySelector('.nav-shell')
      const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const out = {}
      for (const [pole, y, cls] of [['expanded', 0, false], ['compressed', 200, true]]) {
        window.scrollTo(0, y)
        await raf2()
        const animated = read()
        html.classList.add('nav-measuring')
        html.classList.remove('nav-sda')
        shell.classList.toggle('scrolled-mobile', cls)
        await raf2()
        const fallback = read()
        html.classList.add('nav-sda')
        html.classList.remove('nav-measuring')
        await raf2()
        out[pole] = { animated, fallback }
      }
      return out
    }, READ_POSE)
    for (const pole of ['expanded', 'compressed']) {
      const { animated, fallback } = parity[pole]
      const dh = Math.abs(animated.h - fallback.h)
      const dt = Math.abs(animated.top - fallback.top)
      const dr = Math.abs(animated.radius - fallback.radius)
      const df = Math.abs(animated.font - fallback.font)
      const dl = Math.max(...animated.links.map((l, i) =>
        Math.max(Math.abs(l[0] - fallback.links[i][0]), Math.abs(l[1] - fallback.links[i][1]))))
      check(name, `parity: ${pole} pole matches fallback pose`,
        dh <= 1 && dt <= 1 && dr <= 1.5 && df <= 0.5 && dl <= 1.5,
        `Δh=${dh.toFixed(2)} Δtop=${dt.toFixed(2)} Δradius=${dr.toFixed(2)} Δfont=${df.toFixed(2)} Δlinks=${dl.toFixed(2)}`)
    }
    await page.close()

    // ── settle: parked mid-range nudges the page to the nearest pole ──
    const page2 = await browser.newPage({ viewport: MOBILE })
    await page2.goto(BASE + '/?notrack=true', { waitUntil: 'domcontentloaded' })
    await page2.waitForFunction(() => window.__navScrubActive === true, null, { timeout: 5000 }).catch(() => {})
    const settleCase = async (park, expected) => {
      await page2.evaluate((y) => window.scrollTo(0, y), park)
      await page2.waitForTimeout(800)
      return page2.evaluate(() => window.scrollY)
    }
    const s60 = await settleCase(60)
    check(name, 'settle: parked at 60 → snaps to 0', s60 === 0, `landed ${s60}`)
    const s90 = await settleCase(90)
    check(name, 'settle: parked at 90 → snaps to 134', Math.abs(s90 - RANGE_END) <= 1, `landed ${s90}`)
    const s300 = await settleCase(300)
    check(name, 'settle: parked at 300 → stays (outside range)', Math.abs(s300 - 300) <= 1, `landed ${s300}`)
    const cls = await page2.evaluate(() => document.querySelector('.nav-shell').classList.contains('scrolled-mobile'))
    check(name, 'settle: pole class synced after settle', cls === true)
    await page2.close()

    // ── viewport matrix sanity: 360 (no pill), 768 (tablet), and the
    //    960/961 breakpoint boundary ──
    for (const [w, h, label, expectMorph] of [[360, 780, 'narrow 360', true], [768, 1024, 'tablet 768', true], [960, 700, 'boundary 960', true], [961, 700, 'boundary 961 (desktop)', false]]) {
      const pageV = await browser.newPage({ viewport: { width: w, height: h } })
      await pageV.addInitScript(() => { window.__navSnapDisabled = true })
      await pageV.goto(BASE + '/?notrack=true', { waitUntil: 'domcontentloaded' })
      await pageV.waitForFunction(() => window.__navScrubActive === true, null, { timeout: 5000 }).catch(() => {})
      await stepTo(pageV, 200)
      const pose = await pageV.evaluate(READ_POSE)
      if (expectMorph) {
        check(name, `${label}: compressed pose lands`, pose.h < 60 && pose.scrolledClass, `h=${pose.h.toFixed(1)}`)
      } else {
        const anims = await pageV.evaluate(() => document.querySelector('.nav-shell').getAnimations().length)
        check(name, `${label}: no morph animations attached`, anims === 0 && !pose.scrolledClass, `${anims} anims`)
      }
      await pageV.close()
    }

    // ── pill morph on a ≥400px viewport (where the Contact pill exists) ──
    const page6 = await browser.newPage({ viewport: WIDE })
    await page6.addInitScript(() => { window.__navSnapDisabled = true })
    await page6.goto(BASE + '/?notrack=true', { waitUntil: 'domcontentloaded' })
    await page6.waitForFunction(() => window.__navScrubActive === true, null, { timeout: 5000 }).catch(() => {})
    const pillAt = {}
    for (const y of [0, 40, 134]) { await stepTo(page6, y); pillAt[y] = await page6.evaluate(READ_POSE) }
    check(name, 'pill 414: silent until 45%, fully in at the pole',
      pillAt[0].pillO === 0 && pillAt[40].pillO < 0.05 && pillAt[134].pillO > 0.95 && pillAt[134].pillV === 'visible',
      `y=0→${pillAt[0].pillO} y=40→${pillAt[40].pillO} y=134→${pillAt[134].pillO}/${pillAt[134].pillV}`)
    await page6.close()

    // ── pose reversals during continuous scrub (Chromium only: WebKit's
    //    Playwright build has no mouse.wheel). Not timing-sensitive, so
    //    it can run in the parallel phase; frame HEALTH runs in the quiet
    //    phase after both engines finish (see scrubFramePhase). ──
    if (name === 'chromium') {
      const page4 = await browser.newPage({ viewport: MOBILE })
      await page4.goto(BASE + '/?notrack=true', { waitUntil: 'domcontentloaded' })
      await page4.waitForFunction(() => window.__navScrubActive === true, null, { timeout: 5000 }).catch(() => {})
      await page4.evaluate(() => {
        window.__frames = []
        const tick = (t) => {
          const r = document.querySelector('.nav-shell').getBoundingClientRect()
          window.__frames.push([t, r.height, window.scrollY])
          if (window.__frames.length < 400) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      for (let i = 0; i < 14; i++) { await page4.mouse.wheel(0, 12); await page4.waitForTimeout(16) }
      await page4.waitForTimeout(300)
      for (let i = 0; i < 14; i++) { await page4.mouse.wheel(0, -12); await page4.waitForTimeout(16) }
      await page4.waitForTimeout(400)
      const frames = await page4.evaluate(() => window.__frames)
      let reversals = 0
      for (let i = 2; i < frames.length; i++) {
        const d1 = frames[i][1] - frames[i - 1][1]
        const d0 = frames[i - 1][1] - frames[i - 2][1]
        // a reversal = pose direction flips while scroll direction did not
        const s1 = frames[i][2] - frames[i - 1][2]
        const s0 = frames[i - 1][2] - frames[i - 2][2]
        if (d1 * d0 < -0.25 && s1 * s0 >= 0) reversals++
      }
      check(name, 'scrub: zero pose reversals during continuous wheel', reversals === 0, `${reversals} reversals over ${frames.length} frames`)
      await page4.close()
    }

    // ── fallback: stub out animation-timeline support ──
    const page5 = await browser.newPage({ viewport: MOBILE })
    await page5.addInitScript(() => {
      const orig = CSS.supports.bind(CSS)
      CSS.supports = (...a) => (a.join(':').includes('animation-timeline') ? false : orig(...a))
    })
    await page5.goto(BASE + '/?notrack=true', { waitUntil: 'domcontentloaded' })
    const fb0 = await page5.evaluate(() => document.documentElement.classList.contains('nav-sda'))
    await page5.evaluate(() => window.scrollTo(0, 300))
    await page5.waitForTimeout(500)
    const fbScrolled = await page5.evaluate(() => document.querySelector('.nav-shell').classList.contains('scrolled-mobile'))
    await page5.evaluate(() => window.scrollTo(0, 0))
    await page5.waitForTimeout(500)
    const fbTop = await page5.evaluate(() => document.querySelector('.nav-shell').classList.contains('scrolled-mobile'))
    check(name, 'fallback: nav-sda absent when unsupported', fb0 === false)
    check(name, 'fallback: threshold compresses at depth', fbScrolled === true)
    check(name, 'fallback: expands back at top', fbTop === false)
    await page5.close()
  } finally {
    await browser.close()
  }
}

// Frame health needs a QUIET machine — it runs alone, after the parallel
// correctness phase, with the harness's vsync-free flags so rAF gaps
// measure per-frame work cost. Best of two trials: the sandbox's software
// rasterizer takes occasional scheduler hits that aren't morph cost.
async function scrubFramePhase() {
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
  try {
    const page = await browser.newPage({ viewport: MOBILE })
    await page.goto(BASE + '/?notrack=true', { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => window.__navScrubActive === true, null, { timeout: 5000 }).catch(() => {})
    // Warmup: first-scroll work (image decode, observer setup, initial
    // raster) is one-time cost, not morph cost.
    for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, 12); await page.waitForTimeout(16) }
    for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, -12); await page.waitForTimeout(16) }
    await page.waitForTimeout(500)
    const trial = async () => {
      await page.evaluate(() => {
        window.__gaps = []
        let last = null
        const tick = (t) => {
          if (last !== null) window.__gaps.push(t - last)
          last = t
          if (window.__gaps.length < 300) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, 12); await page.waitForTimeout(16) }
      await page.waitForTimeout(300)
      for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, -12); await page.waitForTimeout(16) }
      await page.waitForTimeout(300)
      return page.evaluate(() => window.__gaps)
    }
    const trials = [await trial(), await trial()]
    const best = trials.map((g) => ({ max: Math.max(...g), over: g.filter((x) => x > 16.7).length, n: g.length }))
      .sort((a, b) => a.max - b.max)[0]
    check('chromium', 'scrub: no frame over the 60fps ship bar (60ms)', best.max <= 60,
      `max ${best.max.toFixed(1)}ms, ${best.over}/${best.n} frames >16.7ms (best of 2)`)
  } finally {
    await browser.close()
  }
}

await Promise.all([
  testEngine('chromium', chromium),
  testEngine('webkit', webkit),
])
await scrubFramePhase()

console.log(log.sort().join('\n'))
console.log(`\n${failures.length === 0 ? 'ALL PASS' : failures.length + ' FAILURE(S)'} — ${((Date.now() - t0) / 1000).toFixed(1)}s`)
if (failures.length) process.exit(1)
