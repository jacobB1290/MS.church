import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT = '/tmp/panel-shots'
mkdirSync(OUT, { recursive: true })

const viewports = [
  { name: 'iphone-393',     w: 393,  h: 852  },
  { name: 'iphone-pm-430',  w: 430,  h: 932  },
  { name: 'tablet-768',     w: 768,  h: 1024 },
  { name: 'laptop-1280',    w: 1280, h: 800  },
  { name: 'desktop-1920',   w: 1920, h: 1080 },
]

const browser = await chromium.launch()
const t0 = Date.now()

await Promise.all(viewports.map(async (vp) => {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()

  await page.addInitScript(() => {
    const css = document.createElement('style')
    css.textContent = `
      *,*::before,*::after { animation-duration:0s !important; transition-duration:0s !important; }
      html, body, main, .page { opacity: 1 !important; visibility: visible !important; }
      .js-reveal, .js-reveals, .reveal, .reveal-pop, .reveal-fill, [class*="reveal"] {
        opacity: 1 !important; transform: none !important; filter: none !important; visibility: visible !important;
      }
    `
    if (document.head) document.head.appendChild(css)
    else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(css))
  })

  await page.goto('http://localhost:5173/ministries#worship', { waitUntil: 'domcontentloaded' })

  await page.evaluate(() => document.fonts && document.fonts.ready)
  await page.waitForFunction(() => {
    const imgs = Array.from(document.images)
    return imgs.every(i => i.complete && (i.naturalWidth > 0 || !i.src))
  }, { timeout: 4000 }).catch(() => {})

  const worship = await page.$('#worship')
  if (worship) {
    await worship.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    await worship.screenshot({ path: `${OUT}/${vp.name}--worship-section.png` })
  }

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/${vp.name}--top.png`, fullPage: false })

  await page.evaluate(() => {
    const w = document.querySelector('#worship')
    if (!w) return
    const tips = w.querySelector('.ministry-tips, dl')
    const target = tips || w.querySelector('p')
    if (target) {
      const rect = target.getBoundingClientRect()
      window.scrollTo(0, window.scrollY + rect.top - 80)
    }
  })
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/${vp.name}--wall-of-text.png`, fullPage: false })

  await ctx.close()
  console.log(`[${vp.name}] done`)
}))

await browser.close()
console.log(`total ${((Date.now()-t0)/1000).toFixed(1)}s`)
