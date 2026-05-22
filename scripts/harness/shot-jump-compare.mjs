import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT = '/tmp/jump-compare'
mkdirSync(OUT, { recursive: true })

const viewports = [
  { name: 'iphone-360',   w: 360, h: 800 },
  { name: 'iphone-393',   w: 393, h: 852 },
  { name: 'iphone-430',   w: 430, h: 932 },
]

const pages = [
  { name: 'visit',      url: '/visit',      chips: 4 },
  { name: 'ministries', url: '/ministries', chips: 5 },
  { name: 'about',      url: '/about',      chips: 4 },
]

const forceReveal = `
  *,*::before,*::after { animation-duration:0s !important; transition-duration:0s !important; }
  html, body, main, .page { opacity: 1 !important; visibility: visible !important; }
  .js-reveal, .js-reveals, .reveal, .reveal-pop, .reveal-fill, [class*="reveal"] {
    opacity: 1 !important; transform: none !important; filter: none !important; visibility: visible !important;
  }
`

// Override that flips mobile to left-aligned
const leftAlignOverride = `
  @media (max-width: 960px) {
    .subpage-jump { justify-content: flex-start !important; }
  }
`

const browser = await chromium.launch()
const t0 = Date.now()

const tasks = []
for (const vp of viewports) {
  for (const pg of pages) {
    for (const variant of ['current', 'leftalign']) {
      tasks.push({ vp, pg, variant })
    }
  }
}

await Promise.all(tasks.map(async ({ vp, pg, variant }) => {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  await page.addInitScript((force) => {
    const css = document.createElement('style')
    css.id = 'forceReveal'
    css.textContent = force
    if (document.head) document.head.appendChild(css)
    else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(css))
  }, forceReveal)
  await page.goto('http://localhost:5173' + pg.url, { waitUntil: 'domcontentloaded' })
  if (variant === 'leftalign') {
    await page.addStyleTag({ content: leftAlignOverride })
  }
  await page.evaluate(() => document.fonts && document.fonts.ready)
  await page.waitForFunction(() => {
    const j = document.querySelector('.subpage-jump')
    return j && j.getBoundingClientRect().bottom > 0
  }, { timeout: 4000 }).catch(() => {})
  await page.waitForTimeout(200)
  const jump = await page.$('.subpage-jump')
  if (jump) {
    // Capture the jump + a bit of context above (lede tail) and below
    const box = await jump.boundingBox()
    if (box) {
      await page.screenshot({
        path: `${OUT}/${pg.name}--${vp.name}--${variant}.png`,
        clip: {
          x: 0,
          y: Math.max(0, box.y - 60),
          width: vp.w,
          height: Math.min(vp.h, box.height + 160),
        },
      })
    }
  }
  await ctx.close()
}))

console.log(`captured ${tasks.length} shots in ${((Date.now()-t0)/1000).toFixed(1)}s`)
await browser.close()
