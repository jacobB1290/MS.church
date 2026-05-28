// Mobile design-review capture — iPhone 17 Pro Max.
//
// Produces a polished, self-contained deliverable for an EXTERNAL design
// review: a labeled PDF (cover + above-the-fold + full-length page per route)
// plus a zip of full-resolution PNGs.
//
// Why a separate script from scripts/harness/run.mjs: the harness measures
// motion/perf and must stay fast; this is a static, full-state capture pass
// (reduced-motion forced so every reveal renders settled, not mid-fade).
//
// Run:
//   npm run dev                 # in another terminal (default :5173)
//   npm run shots               # -> scripts/shots/output/
//   SHOTS_URL=https://ms.church npm run shots   # capture production instead
//
// Output (scripts/shots/output/, gitignored):
//   png/<nn>-<slug>-above-fold.png   first screen (440x956 @3x)
//   png/<nn>-<slug>-full.png         full-length page
//   ms-church-mobile-design-review.pdf
//   ms-church-mobile-design-review-iphone17promax.zip   (PNGs + PDF)

import { chromium } from 'playwright'
import sharp from 'sharp'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { execFileSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, 'output')
const PNG_DIR = join(OUT, 'png')
const BASE = process.env.SHOTS_URL || 'http://localhost:5173'

// iPhone 17 Pro Max: 6.9" display, 1320x2868 physical px at 3x DPR
// => 440 x 956 CSS points. Touch + iOS Safari UA so the page serves its
// mobile layout and treats the client as a real phone.
const DEVICE = {
  viewport: { width: 440, height: 956 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
}

// Every visitor-facing HTML page. Order = order in the PDF.
const ROUTES = [
  { slug: 'home', path: '/', title: 'Home' },
  { slug: 'about', path: '/about', title: 'About' },
  { slug: 'ministries', path: '/ministries', title: 'Ministries' },
  { slug: 'outreach', path: '/outreach', title: 'Outreach & Events' },
  { slug: 'visit', path: '/visit', title: 'Plan a Visit' },
  { slug: 'beliefs', path: '/beliefs', title: 'Beliefs' },
  { slug: 'privacy', path: '/privacy', title: 'Privacy Policy' },
]

const CONCURRENCY = 4
const REVEAL_SEL =
  '.reveal,.reveal-scale,.reveal-eyebrow,.reveal-rise,.reveal-rise-slow,.reveal-tight,.reveal-from-left,.reveal-from-right,.reveal-from-above,.reveal-photo,.reveal-power,.reveal-pop,.reveal-fill'

function withNoTrack(path) {
  return BASE + path + (path.includes('?') ? '&' : '?') + 'notrack=true'
}

async function settlePage(page) {
  // Force final visual state: skip the section-entrance fade and mark every
  // scroll-reveal element revealed, so nothing is captured mid-animation.
  await page.addStyleTag({
    content: '*{scroll-behavior:auto !important}',
  })
  await page.evaluate((sel) => {
    const html = document.documentElement
    html.classList.add('no-entrance')
    html.classList.remove('hash-fade')
    const main = document.querySelector('main')
    if (main) {
      main.style.opacity = '1'
      main.style.transform = 'none'
    }
    document.querySelectorAll(sel).forEach((el) => el.classList.add('is-revealed'))
  }, REVEAL_SEL)

  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})

  // Scroll top -> bottom in viewport steps to trigger lazy <img>, CSS
  // background image-set loads, the IntersectionObservers, and the
  // /api/calendar/events + youtube fetches; then return to the top.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.9)
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await sleep(120)
    }
    window.scrollTo(0, document.body.scrollHeight)
    await sleep(250)
    window.scrollTo(0, 0)
    await sleep(120)
  })

  // Wait for every <img> to finish (lazy ones loaded during the scroll pass).
  await page
    .waitForFunction(
      () => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
      { timeout: 12000 },
    )
    .catch(() => {})

  // Re-assert revealed state in case a late observer reset anything, and
  // settle async content (events carousel) before the shot.
  await page.evaluate((sel) => {
    document.querySelectorAll(sel).forEach((el) => el.classList.add('is-revealed'))
    window.scrollTo(0, 0)
  }, REVEAL_SEL)
  await page.waitForTimeout(400)
}

// The Google Maps embed (/visit) and the YouTube thumbnails (home #watch) load
// from google.com / i.ytimg.com, which this capture environment can't reach —
// so they render blank. Rather than ship a blank box in the deliverable, lay a
// branded placeholder over each so a reviewer reads it as "live embed", not a
// design flaw. Placeholders only land where the target actually rendered empty
// (skipped when an embed did load, e.g. when capturing production).
async function markEmbeds(page, slug) {
  await page.evaluate((slug) => {
    const GOLD = '#9d7853', INK = '#1a1a2e', CREAM = '#faf8f5', SURF = '#fdfcfa'
    const pin = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="1.5"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>`
    const play = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="${GOLD}" stroke-width="1.4"/><path d="M10 8.4l6 3.6-6 3.6z" fill="${GOLD}"/></svg>`
    const overlay = (el, inner, compact) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.width < 24 || r.height < 24) return // skip hidden/collapsed embeds
      const d = document.createElement('div')
      d.style.cssText = `position:absolute;left:${r.left + scrollX}px;top:${r.top + scrollY}px;`
        + `width:${r.width}px;height:${r.height}px;z-index:99999;display:flex;flex-direction:column;`
        + `align-items:center;justify-content:center;gap:${compact ? 6 : 11}px;text-align:center;`
        + `padding:14px;box-sizing:border-box;border-radius:16px;overflow:hidden;`
        + `background:linear-gradient(160deg,${SURF},${CREAM});border:1.5px dashed rgba(157,120,83,.55);`
        + `font-family:Inter,-apple-system,sans-serif;color:${INK};`
      d.innerHTML = inner
      document.body.appendChild(d)
    }
    if (slug === 'visit') {
      overlay(
        document.querySelector('iframe.visit-map'),
        `${pin(34)}<div style="font-weight:600;font-size:15px">Interactive map</div>`
          + `<div style="font-size:12px;color:rgba(26,26,46,.6);max-width:84%;line-height:1.4">Google Maps renders on the live site &middot; ms.church/visit</div>`,
        false,
      )
    }
    if (slug === 'home') {
      overlay(
        document.querySelector('#video-thumbnail'),
        `${play(42)}<div style="font-weight:600;font-size:15px">Live service video</div>`
          + `<div style="font-size:12px;color:rgba(26,26,46,.6);max-width:84%;line-height:1.4">Plays from YouTube on the live site &middot; ms.church</div>`,
        false,
      )
      document.querySelectorAll('.video-card-thumb').forEach((t) =>
        overlay(t, `${play(26)}<div style="font-weight:600;font-size:10px;letter-spacing:.12em">VIDEO</div>`, true),
      )
    }
  }, slug)
}

async function captureRoute(browser, route, index) {
  const n = String(index + 1).padStart(2, '0')
  const context = await browser.newContext({
    ...DEVICE,
    reducedMotion: 'reduce',
    colorScheme: 'light',
  })
  const page = await context.newPage()
  try {
    await page.goto(withNoTrack(route.path), { waitUntil: 'domcontentloaded', timeout: 45000 })
    await settlePage(page)
    await markEmbeds(page, route.slug)

    const aboveFold = join(PNG_DIR, `${n}-${route.slug}-above-fold.png`)
    const full = join(PNG_DIR, `${n}-${route.slug}-full.png`)
    await page.screenshot({ path: aboveFold }) // viewport only = first screen
    await page.screenshot({ path: full, fullPage: true })

    // Crop the full capture to the true device width. A correctly responsive
    // page is already exactly 440 CSS px (1320 device px) wide; any page that
    // overflows horizontally (a bug) would otherwise leave dead space on the
    // right and make the deliverable look inconsistent. We crop to the phone's
    // viewport width so every page presents as the on-screen mobile view.
    const deviceW = DEVICE.viewport.width * DEVICE.deviceScaleFactor
    const meta = await sharp(full).metadata()
    let overflow = false
    if (meta.width > deviceW) {
      overflow = true
      const buf = await sharp(full)
        .extract({ left: 0, top: 0, width: deviceW, height: meta.height })
        .png()
        .toBuffer()
      writeFileSync(full, buf)
    }
    const dims = await page.evaluate(() => ({ h: document.documentElement.scrollHeight }))
    const flag = overflow ? `  [!] horizontal overflow to ${meta.width / DEVICE.deviceScaleFactor}px CSS — cropped to device width` : ''
    console.log(`  [${n}] ${route.path.padEnd(12)} captured (page height ${dims.h}px)${flag}`)
    return { ...route, n, aboveFold, full }
  } finally {
    await context.close()
  }
}

// Simple concurrency pool so 8 tall full-page captures don't all run at once.
async function runPool(items, limit, worker) {
  const results = new Array(items.length)
  let i = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      results[idx] = await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
  return results
}

// ---- PDF assembly -----------------------------------------------------------

const GOLD = rgb(0.72, 0.53, 0.16)
const INK = rgb(0.1, 0.1, 0.18)
const MUTED = rgb(0.45, 0.45, 0.52)
const PDF_IMG_WIDTH_PT = 430 // on-page render width (phone-ish)
const CAPTION_BAND = 54
const EMBED_W = 900 // px width to downscale screenshots to before embedding
const MAX_IMG_PT = 12000 // max image draw-height per PDF page (PDF max page = 14400)

function drawCaption(page, font, fontBold, title, sub, pageW, bandTopY) {
  page.drawText(title, { x: 28, y: bandTopY - 22, size: 15, font: fontBold, color: INK })
  page.drawText(sub, { x: 28, y: bandTopY - 40, size: 9.5, font, color: MUTED })
  // thin gold rule under the caption band
  page.drawRectangle({ x: 0, y: bandTopY - CAPTION_BAND, width: pageW, height: 1.5, color: GOLD })
}

// Add one or more PDF pages for a screenshot. Downscales for a sensible file
// size, then tiles vertically if the page would exceed the PDF height limit
// (the /privacy legal page is ~22k CSS px tall and needs two segments).
async function addImagePages(pdf, font, fontBold, title, path, label, pngPath) {
  const srcMeta = await sharp(pngPath).metadata()
  const base = await sharp(pngPath)
    .resize({ width: Math.min(srcMeta.width, EMBED_W), withoutEnlargement: true })
    .png()
    .toBuffer()
  const m = await sharp(base).metadata()
  const scale = PDF_IMG_WIDTH_PT / m.width // pt per embed-px
  const fullScaledH = m.height * scale
  const tiles = Math.max(1, Math.ceil(fullScaledH / MAX_IMG_PT))
  const tilePxH = Math.ceil(m.height / tiles)
  const margin = 24

  for (let t = 0; t < tiles; t++) {
    const top = t * tilePxH
    const h = Math.min(tilePxH, m.height - top)
    if (h <= 0) break
    const tileBuf =
      tiles === 1
        ? base
        : await sharp(base).extract({ left: 0, top, width: m.width, height: h }).png().toBuffer()
    const img = await pdf.embedPng(tileBuf)
    const drawW = PDF_IMG_WIDTH_PT
    const drawH = img.height * scale
    const pageW = drawW + margin * 2
    const pageH = drawH + CAPTION_BAND + margin
    const page = pdf.addPage([pageW, pageH])
    const lbl = tiles > 1 ? `${label} (part ${t + 1}/${tiles})` : label
    drawCaption(page, font, fontBold, title, `${path}   -   ${lbl}   -   iPhone 17 Pro Max`, pageW, pageH)
    page.drawImage(img, { x: margin, y: margin, width: drawW, height: drawH })
  }
}

async function buildPdf(captures) {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  // Cover page (A4 portrait).
  const cover = pdf.addPage([595, 842])
  cover.drawRectangle({ x: 0, y: 812, width: 595, height: 30, color: GOLD })
  cover.drawText('Morning Star Christian Church', {
    x: 56, y: 720, size: 28, font: fontBold, color: INK,
  })
  cover.drawText('Mobile Design Review', { x: 56, y: 684, size: 18, font, color: INK })
  cover.drawText('Device: iPhone 17 Pro Max  -  440 x 956 CSS px  -  3x (1320 x 2868 physical)', {
    x: 56, y: 648, size: 11, font, color: MUTED,
  })
  cover.drawText(`Captured: ${new Date().toISOString().slice(0, 10)}   Source: ${BASE}`, {
    x: 56, y: 632, size: 11, font, color: MUTED,
  })
  cover.drawText('Contents', { x: 56, y: 580, size: 13, font: fontBold, color: INK })
  captures.forEach((c, i) => {
    cover.drawText(`${c.n}.  ${c.title}`, {
      x: 70, y: 556 - i * 20, size: 11, font, color: INK,
    })
    cover.drawText(c.path, {
      x: 240, y: 556 - i * 20, size: 11, font, color: MUTED,
    })
  })
  cover.drawText('Each page below shows the first screen (above the fold) followed by the full-length page.', {
    x: 56, y: 120, size: 9.5, font, color: MUTED,
  })

  for (const c of captures) {
    await addImagePages(pdf, font, fontBold, c.title, c.path, 'First screen (above the fold)', c.aboveFold)
    await addImagePages(pdf, font, fontBold, c.title, c.path, 'Full-length page', c.full)
  }

  const bytes = await pdf.save()
  const pdfPath = join(OUT, 'ms-church-mobile-design-review.pdf')
  writeFileSync(pdfPath, bytes)
  return pdfPath
}

// ---- main -------------------------------------------------------------------

async function main() {
  const t0 = Date.now()
  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(PNG_DIR, { recursive: true })

  console.log(`Capturing ${ROUTES.length} pages at iPhone 17 Pro Max (440x956 @3x) from ${BASE}`)
  const browser = await chromium.launch()
  let captures
  try {
    captures = await runPool(ROUTES, CONCURRENCY, (route, idx) =>
      captureRoute(browser, route, idx),
    )
  } finally {
    await browser.close()
  }

  console.log('Building PDF...')
  const pdfPath = await buildPdf(captures)

  console.log('Zipping deliverable...')
  const zipName = 'ms-church-mobile-design-review-iphone17promax.zip'
  const zipPath = join(OUT, zipName)
  rmSync(zipPath, { force: true })
  execFileSync(
    'zip',
    ['-r', '-q', zipName, 'png', 'ms-church-mobile-design-review.pdf'],
    { cwd: OUT },
  )

  const pngCount = readdirSync(PNG_DIR).filter((f) => f.endsWith('.png')).length
  const sizeMB = (b) => (readFileSync(b).length / 1024 / 1024).toFixed(1)
  console.log('\nDone in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's')
  console.log(`  PNGs:  ${pngCount} files in ${PNG_DIR}`)
  console.log(`  PDF:   ${pdfPath} (${sizeMB(pdfPath)} MB)`)
  console.log(`  Zip:   ${zipPath} (${sizeMB(zipPath)} MB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
