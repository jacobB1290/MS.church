// Editorial PDF builder for the mobile design review.
//
// Consumes the screenshots captured by capture.mjs (scripts/shots/output/png)
// and renders a portfolio-grade PDF: each page is a designed editorial spread
// in the site's own brand language — warm-cream full-bleed paper, Playfair
// Display + Inter, gold accents — with the phone screenshot in a soft rounded
// frame (so the raw capture edges disappear into the page).
//
// Pages are rendered in a real browser (authentic self-hosted fonts), saved as
// high-res masters, then assembled with pdf-lib at several quality tiers so the
// file size / sharpness tradeoff can be chosen. Over-tall pages (the /privacy
// legal page) are tiled so no PDF page exceeds the 14,400-unit format limit.
//
// Run:  npm run shots   (capture first)  then  npm run pdf

import { chromium } from 'playwright'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import { mkdirSync, rmSync, writeFileSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '..', '..')
const OUT = resolve(__dirname, 'output')
const PNG = join(OUT, 'png')
const PAGES = join(OUT, 'pages')
const FONTS = join(REPO, 'public', 'static', 'fonts')

// ── Brand tokens (mirrors src/design-tokens.ts + home-styles :root) ──
const GOLD = '#9d7853'
const GOLD_DARK = '#6e543a'
const CREAM = '#faf8f5'
const SURFACE = '#fdfcfa'
const INK = '#1a1a2e'

const PAPER_W = 680 // CSS px — the "paper" width
const SHOT_W = 462 // CSS px — on-paper screenshot width
// Master render scale. At 3x the on-paper phone screenshot (462 CSS px) renders
// at ~1386 px — at/above its native 1320 px capture width — so no detail is
// lost. The /privacy full page is ~24k CSS px tall; rendering THAT at 3x is
// ~590 MB of raw pixels and risks the capture, so it alone drops to 2x (it is
// just legal text, where 2x is plenty).
const SCALE_HI = 3
const SCALE_LO = 2

const ROUTES = [
  { slug: 'home', path: '/', title: 'Home', blurb: 'Hero, welcome, and the Sunday rhythm.' },
  { slug: 'about', path: '/about', title: 'About', blurb: 'Who we are and the story so far.' },
  { slug: 'ministries', path: '/ministries', title: 'Ministries', blurb: 'Ways to belong and to grow.' },
  { slug: 'outreach', path: '/outreach', title: 'Outreach & Events', blurb: 'How we serve the city of Boise.' },
  { slug: 'visit', path: '/visit', title: 'Plan a Visit', blurb: 'What a first Sunday looks like.' },
  { slug: 'beliefs', path: '/beliefs', title: 'Beliefs', blurb: 'What we hold to, with scripture.' },
  { slug: 'form', path: '/form', title: 'Contact', blurb: 'Reach the church directly.' },
  { slug: 'privacy', path: '/privacy', title: 'Privacy & Terms', blurb: 'Legal information.' },
]

const fontFace = (family, weight, file) => {
  const b64 = readFileSync(join(FONTS, file)).toString('base64')
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2');}`
}

const FONT_CSS = [
  fontFace('Inter', 400, 'inter-400.woff2'),
  fontFace('Inter', 500, 'inter-500.woff2'),
  fontFace('Inter', 600, 'inter-600.woff2'),
  fontFace('Inter', 700, 'inter-700.woff2'),
  fontFace('Playfair Display', 400, 'playfair-display-400.woff2'),
  fontFace('Playfair Display', 600, 'playfair-display-600.woff2'),
  fontFace('Playfair Display', 700, 'playfair-display-700.woff2'),
].join('')

const BASE_CSS = `
  *{margin:0;padding:0;box-sizing:border-box;}
  :root{
    --gold:${GOLD};--gold-dark:${GOLD_DARK};--cream:${CREAM};--surface:${SURFACE};
    --ink:${INK};--ink-soft:rgba(26,26,46,.85);--ink-muted:rgba(26,26,46,.60);
    --ink-faint:rgba(26,26,46,.40);--hairline:rgba(26,26,46,.12);
    --serif:'Playfair Display',Georgia,serif;--sans:'Inter',-apple-system,sans-serif;
  }
  html,body{background:var(--cream);}
  body{width:${PAPER_W}px;font-family:var(--sans);color:var(--ink);-webkit-font-smoothing:antialiased;}
  .sheet{width:${PAPER_W}px;background:var(--cream);padding:0 109px;position:relative;}
  .eyebrow{font-family:var(--sans);font-weight:600;font-size:10.5px;letter-spacing:.14em;
    text-transform:uppercase;color:var(--gold-dark);}
  .title{font-family:var(--serif);font-weight:700;color:var(--ink);letter-spacing:-.01em;line-height:1.04;}
  .sub{font-family:var(--sans);font-weight:400;font-size:12.5px;color:var(--ink-muted);letter-spacing:.01em;}
  .rule{height:1px;background:var(--hairline);width:100%;}
  .shot{width:${SHOT_W}px;border-radius:38px;overflow:hidden;background:var(--surface);
    box-shadow:0 22px 50px rgba(26,26,46,.10),0 6px 16px rgba(26,26,46,.06);
    outline:1px solid rgba(26,26,46,.08);outline-offset:-1px;}
  .shot img{display:block;width:100%;height:auto;}
  .pagefoot{display:flex;justify-content:space-between;align-items:center;
    font-family:var(--sans);font-weight:600;font-size:9.5px;letter-spacing:.14em;
    text-transform:uppercase;color:var(--ink-faint);}
`

function shell(inner, extra = '') {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <style>${FONT_CSS}${BASE_CSS}${extra}</style></head><body>${inner}</body></html>`
}

function coverHtml() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return shell(
    `<div class="sheet cover">
      <div class="topband"></div>
      <div class="coverwrap">
        <div class="eyebrow">Morning Star Christian Church &nbsp;·&nbsp; Boise, Idaho</div>
        <h1 class="title coverttl">Mobile<br>Design Review</h1>
        <div class="goldrule"></div>
        <div class="device">iPhone&nbsp;17&nbsp;Pro&nbsp;Max</div>
        <div class="spec">The complete website, captured screen by screen.</div>
      </div>
      <div class="covermeta">
        <span>Captured ${today}</span>
        <span>440 × 956 pt &nbsp;·&nbsp; 3× &nbsp;·&nbsp; ms.church</span>
      </div>
    </div>`,
    `.cover{height:944px;display:flex;flex-direction:column;justify-content:center;}
     .topband{position:absolute;top:0;left:0;width:100%;height:6px;background:var(--gold);}
     .coverttl{font-weight:600;font-size:57px;line-height:1.1;margin:24px 0 0;}
     .goldrule{width:64px;height:3px;background:var(--gold);margin:38px 0;}
     .device{font-family:var(--serif);font-weight:600;font-size:23px;color:var(--ink-soft);}
     .spec{font-family:var(--sans);font-size:13.5px;color:var(--ink-muted);margin-top:12px;letter-spacing:.01em;}
     .covermeta{position:absolute;bottom:60px;left:109px;right:109px;display:flex;justify-content:space-between;
       font-family:var(--sans);font-weight:600;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);}`,
  )
}

function contentsHtml() {
  const rows = ROUTES.map((r, i) => {
    const n = String(i + 1).padStart(2, '0')
    return `<div class="crow">
      <span class="cn">${n}</span>
      <span class="ct">${r.title}</span>
      <span class="cdot"></span>
      <span class="cp">${r.path}</span>
    </div>`
  }).join('')
  return shell(
    `<div class="sheet" style="min-height:944px;">
      <div style="height:128px"></div>
      <div class="eyebrow">Contents</div>
      <h1 class="title" style="font-size:40px;margin:18px 0 30px;">The pages</h1>
      <div class="rule"></div>
      <div class="clist">${rows}</div>
      <p class="sub" style="margin-top:34px;line-height:1.7;max-width:430px;">Each page shows the first screen
      (above the fold) followed by the full-length page, as rendered on an iPhone 17 Pro Max.</p>
      <div class="pagefoot" style="position:absolute;bottom:60px;left:109px;right:109px;">
        <span>Morning Star Christian Church</span><span>ms.church</span>
      </div>
    </div>`,
    `.clist{margin-top:2px;}
     .crow{display:flex;align-items:baseline;padding:15px 0;border-bottom:1px solid var(--hairline);}
     .cn{font-family:var(--serif);font-weight:600;font-size:14px;color:var(--gold-dark);flex:0 0 30px;}
     .ct{font-family:var(--serif);font-weight:600;font-size:19px;color:var(--ink);}
     .cdot{flex:1;border-bottom:1.5px dotted rgba(26,26,46,.22);margin:0 12px 5px;}
     .cp{font-family:var(--sans);font-size:13px;color:var(--ink-muted);letter-spacing:.02em;}`,
  )
}

function pageHtml(route, idx, variant, imgRel) {
  const n = String(idx + 1).padStart(2, '0')
  const total = String(ROUTES.length).padStart(2, '0')
  const vlabel = variant === 'above-fold' ? 'First screen' : 'Full page'
  return shell(
    `<div class="sheet pg">
      <div class="head">
        <div class="eyebrow">${n} &nbsp;·&nbsp; ${vlabel}</div>
        <h1 class="title pgttl">${route.title}</h1>
        <div class="sub">ms.church${route.path === '/' ? '' : route.path} &nbsp;·&nbsp; ${route.blurb}</div>
        <div class="rule" style="margin-top:22px;"></div>
      </div>
      <div class="stage"><div class="shot"><img src="${imgRel}"></div></div>
      <div class="foot">
        <div class="rule"></div>
        <div class="pagefoot" style="margin-top:14px;">
          <span>Morning Star Christian Church</span><span>${n} / ${total}</span>
        </div>
      </div>
    </div>`,
    `.pg{padding-top:64px;padding-bottom:54px;}
     .pgttl{font-size:38px;margin:14px 0 12px;}
     .stage{display:flex;justify-content:center;margin:40px 0 44px;}
     .foot{margin-top:8px;}`,
  )
}

async function render(page, html, outPath) {
  const file = join(OUT, '_render.html')
  writeFileSync(file, html)
  await page.goto('file://' + file, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  // ensure the screenshot <img> (if any) is decoded
  await page.evaluate(async () => {
    const im = document.querySelector('.shot img')
    if (im && !im.complete) await im.decode().catch(() => {})
  })
  await page.screenshot({ path: outPath, fullPage: true })
}

async function renderMasters() {
  rmSync(PAGES, { recursive: true, force: true })
  mkdirSync(PAGES, { recursive: true })
  const browser = await chromium.launch()
  const mkPage = async (scale) => {
    const ctx = await browser.newContext({ viewport: { width: PAPER_W, height: 1000 }, deviceScaleFactor: scale })
    return ctx.newPage()
  }
  const pageHi = await mkPage(SCALE_HI)
  const pageLo = await mkPage(SCALE_LO) // for the oversized /privacy full page only

  const masters = []
  await render(pageHi, coverHtml(), join(PAGES, '00-cover.png'))
  masters.push(join(PAGES, '00-cover.png'))
  await render(pageHi, contentsHtml(), join(PAGES, '00b-contents.png'))
  masters.push(join(PAGES, '00b-contents.png'))

  for (let i = 0; i < ROUTES.length; i++) {
    const r = ROUTES[i]
    const n = String(i + 1).padStart(2, '0')
    for (const v of ['above-fold', 'full']) {
      const rel = './png/' + `${n}-${r.slug}-${v}.png`
      const out = join(PAGES, `${n}-${r.slug}-${v}.png`)
      const useLo = r.slug === 'privacy' && v === 'full'
      await render(useLo ? pageLo : pageHi, pageHtml(r, i, v, rel), out)
      masters.push(out)
      process.stdout.write(`  rendered ${n}-${r.slug}-${v}${useLo ? ' (2x)' : ''}\n`)
    }
  }
  await browser.close()
  rmSync(join(OUT, '_render.html'), { force: true })
  return masters
}

// ── Assemble masters into a PDF at a given quality tier ──
const PDF_W_PT = 540 // PDF page width in points
const MAX_IMG_PT = 13800 // per-page image height cap (PDF max 14400)

async function buildTier(masters, { name, width, quality }) {
  const pdf = await PDFDocument.create()
  for (const m of masters) {
    const meta = await sharp(m).metadata()
    const targetW = Math.min(meta.width, width)
    const jpg = await sharp(m).resize({ width: targetW, withoutEnlargement: true }).jpeg({ quality }).toBuffer()
    const jm = await sharp(jpg).metadata()
    const scale = PDF_W_PT / jm.width
    const tiles = Math.max(1, Math.ceil((jm.height * scale) / MAX_IMG_PT))
    const tilePx = Math.ceil(jm.height / tiles)
    for (let t = 0; t < tiles; t++) {
      const top = t * tilePx
      const h = Math.min(tilePx, jm.height - top)
      if (h <= 0) break
      const tile = tiles === 1
        ? jpg
        : await sharp(jpg).extract({ left: 0, top, width: jm.width, height: h }).jpeg({ quality }).toBuffer()
      const img = await pdf.embedJpg(tile)
      const pw = PDF_W_PT
      const ph = img.height * scale
      const pg = pdf.addPage([pw, ph])
      pg.drawImage(img, { x: 0, y: 0, width: pw, height: ph })
    }
  }
  const out = join(OUT, `ms-church-mobile-design-review-${name}.pdf`)
  writeFileSync(out, await pdf.save())
  return { name, out, width, quality, mb: (statSync(out).size / 1024 / 1024).toFixed(1) }
}

async function main() {
  const t0 = Date.now()
  console.log('Rendering editorial page masters (brand fonts, cream, gold)...')
  const masters = await renderMasters()

  // A spread of sizes so the quality/size tradeoff can be chosen. Master pages
  // are ~2040 px wide (3x), so the top tiers preserve full screenshot detail.
  const tiers = [
    { name: '1-light', width: 900, quality: 78 },
    { name: '2-web', width: 1180, quality: 84 },
    { name: '3-studio', width: 1500, quality: 88 },
    { name: '4-print', width: 1900, quality: 92 },
    { name: '5-max', width: 2040, quality: 95 },
  ]
  console.log('Building PDF tiers...')
  const results = []
  for (const tier of tiers) results.push(await buildTier(masters, tier))

  console.log('\nDone in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's')
  console.log('  tier      embed-w  jpeg-q   size')
  for (const r of results) console.log(`  ${r.name.padEnd(9)} ${String(r.width).padStart(6)}  ${String(r.quality).padStart(5)}  ${r.mb.padStart(5)} MB`)
}

main().catch((e) => { console.error(e); process.exit(1) })
