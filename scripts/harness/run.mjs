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
  try {
    await page.waitForFunction(
      () => document.getAnimations().every((a) => a.playState !== 'running'),
      null,
      { timeout: 3000 }
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
  console.log('')
  const browser = await chromium.launch({ headless: true })
  const report = { scenarios: [] }

  const a = await runAnchorScenarios(browser, report)
  console.log('')
  const f = await runFlowScenarios(browser, report)

  await browser.close()

  writeHtmlReport(report)

  const total = ANCHOR_SCENARIOS.length + FLOW_SCENARIOS.length
  const passTotal = a.pass + f.pass
  const failTotal = a.fail + f.fail
  const summary = `\n${passTotal} pass · ${failTotal} fail · ${total} total\nreport: ${relative(process.cwd(), resolve(OUT_DIR, 'report.html'))}`
  console.log(summary)
  writeFileSync(resolve(OUT_DIR, 'results.txt'), [...a.lines, '', ...f.lines, summary].join('\n') + '\n')
  if (failTotal > 0) process.exit(1)
}

run().catch((e) => { console.error(e); process.exit(1) })
