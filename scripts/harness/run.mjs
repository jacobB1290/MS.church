// Iteration harness for the MS.church refinement work.
//
// What it does:
//   1. Assumes `npm run dev` is already running (default :5173). Pass
//      --url=http://localhost:<port> to override, or set HARNESS_URL.
//   2. Drives a headless Chromium across the routes/anchors we care about.
//   3. Reports the actual y-position of the targeted section + viewport
//      offset so we can verify scroll-margin-top + re-scroll logic landed
//      correctly. Within ±20px of the configured offset = PASS.
//   4. Captures one full-page screenshot per scenario into
//      scripts/harness/output/<scenario>.png for visual inspection.
//
// Run:
//   npm run dev   # in a separate terminal
//   node scripts/harness/run.mjs
//   # or, target a different port / paged-deploy preview:
//   HARNESS_URL=https://<preview>.vercel.app node scripts/harness/run.mjs
//
// CSS expectations (kept in sync with home-styles.ts):
//   scroll-margin-top  desktop=100px  mobile=84px
//   subpage floating header zone roughly first ~90px of viewport.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, 'output')
mkdirSync(OUT_DIR, { recursive: true })

const BASE = process.env.HARNESS_URL
  || process.argv.find((a) => a.startsWith('--url='))?.slice('--url='.length)
  || 'http://localhost:5173'

const TOLERANCE_PX = 25 // acceptable drift from expected scroll-margin-top

// Scenarios to drive.
// each {name, path, anchor?, viewport, expectedOffset}
const SCENARIOS = [
  { name: '01-home-desktop',           path: '/',                                  viewport: { width: 1280, height: 800 } },
  { name: '02-home-mobile',            path: '/',                                  viewport: { width: 390,  height: 844 } },
  { name: '03-about-desktop',          path: '/about',                             viewport: { width: 1280, height: 800 } },
  { name: '04-about-mobile',           path: '/about',                             viewport: { width: 390,  height: 844 } },
  { name: '05-outreach-desktop',       path: '/outreach',                          viewport: { width: 1280, height: 800 } },
  { name: '06-outreach-mobile',        path: '/outreach',                          viewport: { width: 390,  height: 844 } },

  // Cross-page anchor landings — the previous bug.
  { name: '10-jump-cooking-desktop',   path: '/outreach', anchor: '#cooking-ministry', viewport: { width: 1280, height: 800 }, expectedOffset: 100 },
  { name: '11-jump-cooking-mobile',    path: '/outreach', anchor: '#cooking-ministry', viewport: { width: 390,  height: 844 }, expectedOffset:  84 },
  { name: '12-jump-sunday-desktop',    path: '/outreach', anchor: '#sunday-school',    viewport: { width: 1280, height: 800 }, expectedOffset: 100 },
  { name: '13-jump-sunday-mobile',     path: '/outreach', anchor: '#sunday-school',    viewport: { width: 390,  height: 844 }, expectedOffset:  84 },
  { name: '14-jump-breakfast-mobile',  path: '/outreach', anchor: '#community-breakfast', viewport: { width: 390, height: 844 }, expectedOffset:  84 },
  { name: '15-jump-mission-mobile',    path: '/about',    anchor: '#mission',         viewport: { width: 390,  height: 844 }, expectedOffset:  84 },
]

// Wait for the page to fully settle: load event, idle network for events
// fetch, plus 1200ms for the rescroll passes to complete.
async function waitForSettled(page) {
  await page.waitForLoadState('load')
  try { await page.waitForLoadState('networkidle', { timeout: 4000 }) } catch {}
  await page.waitForTimeout(1300)
}

async function run() {
  console.log(`harness → base ${BASE}`)
  const browser = await chromium.launch({ headless: true })
  let pass = 0
  let fail = 0
  const results = []

  for (const s of SCENARIOS) {
    const context = await browser.newContext({ viewport: s.viewport })
    const page = await context.newPage()
    const url = BASE + s.path + (s.anchor || '')
    let line
    try {
      await page.goto(url, { waitUntil: 'commit' })
      await waitForSettled(page)

      // Snapshot
      const png = resolve(OUT_DIR, `${s.name}.png`)
      await page.screenshot({ path: png, fullPage: false })

      // For anchor scenarios, measure where the target landed in the viewport
      if (s.anchor) {
        const measurement = await page.evaluate((sel) => {
          const t = document.querySelector(sel)
          if (!t) return { found: false }
          const r = t.getBoundingClientRect()
          return { found: true, top: r.top, height: r.height, scrollY: window.scrollY }
        }, s.anchor)

        if (!measurement.found) {
          fail++
          line = `✗ ${s.name}  target ${s.anchor} not found in DOM`
        } else {
          const drift = Math.abs(measurement.top - s.expectedOffset)
          const ok = drift <= TOLERANCE_PX
          if (ok) pass++
          else fail++
          line = `${ok ? '✓' : '✗'} ${s.name}  ${s.anchor} top=${measurement.top.toFixed(0)}px (expected ~${s.expectedOffset}±${TOLERANCE_PX}, drift=${drift.toFixed(0)})  scrollY=${measurement.scrollY.toFixed(0)}`
        }
      } else {
        pass++
        line = `· ${s.name}  rendered  ${png.replace(OUT_DIR + '/', '')}`
      }
    } catch (err) {
      fail++
      line = `✗ ${s.name}  ${err.message}`
    }

    console.log(line)
    results.push(line)
    await context.close()
  }

  await browser.close()
  const summary = `\n${pass} pass · ${fail} fail · ${SCENARIOS.length} total`
  console.log(summary)
  writeFileSync(resolve(OUT_DIR, 'results.txt'), results.join('\n') + summary + '\n')
  if (fail > 0) process.exit(1)
}

run().catch((e) => { console.error(e); process.exit(1) })
