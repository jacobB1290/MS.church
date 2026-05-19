// Ad-hoc font downloader. Run when the typeface set changes:
//   node scripts/_download-fonts.mjs
//
// Self-hosts Inter + Playfair Display by fetching the Google Fonts CSS
// (with a Chrome UA so we get woff2 URLs), filtering to the Latin subset,
// downloading each weight, and emitting the @font-face block to paste into
// home-styles.ts. The reason for self-hosting: cross-origin Google Fonts
// causes a FOUT window during cross-document view transitions — the
// transition snapshot captures the fallback font state, then the real font
// appears after, producing a visible "font flash" on subpage navigation.
// Local fonts on the same origin eliminate the cross-origin race and load
// effectively-instantly from the Vercel edge cache (immutable, 1-year).

import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const outDir = resolve(repoRoot, 'public/static/fonts')
await mkdir(outDir, { recursive: true })

// Modern Chrome UA — Google Fonts serves woff2 only to this kind of client.
// Older UA strings get woff/eot fallback URLs.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

const CSS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap'

console.log('[fonts] fetching Google Fonts CSS...')
const cssRes = await fetch(CSS_URL, { headers: { 'User-Agent': UA } })
if (!cssRes.ok) throw new Error(`Google Fonts CSS fetch failed: ${cssRes.status}`)
const css = await cssRes.text()

// Parse @font-face blocks. Each block looks like:
//   /* latin */
//   @font-face {
//     font-family: 'Inter';
//     font-style: normal;
//     font-weight: 400;
//     font-display: swap;
//     src: url(https://fonts.gstatic.com/...) format('woff2');
//     unicode-range: U+0000-00FF, U+0131, ...;
//   }
// We want only the `latin` subset (English-only site) for each weight of each family.

const blocks = []
const blockRegex = /\/\* (\S+) \*\/\s*@font-face\s*\{([^}]+)\}/g
let m
while ((m = blockRegex.exec(css)) !== null) {
  const subset = m[1]
  const body = m[2]
  const family = body.match(/font-family:\s*'([^']+)'/)?.[1] ?? ''
  const weight = body.match(/font-weight:\s*(\d+)/)?.[1] ?? ''
  const url = body.match(/src:\s*url\(([^)]+)\)/)?.[1] ?? ''
  const unicodeRange = body.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim() ?? ''
  if (subset === 'latin' && family && weight && url) {
    blocks.push({ subset, family, weight, url, unicodeRange })
  }
}

console.log(`[fonts] found ${blocks.length} latin font faces to download`)

// Download each woff2 file.
const downloads = []
for (const block of blocks) {
  const slug = `${block.family.toLowerCase().replace(/\s+/g, '-')}-${block.weight}.woff2`
  const out = resolve(outDir, slug)
  console.log(`[fonts] -> ${slug}`)
  const res = await fetch(block.url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`font fetch failed: ${block.url} (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(out, buf)
  downloads.push({ ...block, slug, bytes: buf.length })
}

console.log(`\n[fonts] all downloaded into ${outDir}\n`)

// Emit @font-face CSS for paste into home-styles.ts.
const fontFaceCss = downloads
  .map(
    (d) => `@font-face {
  font-family: '${d.family}';
  font-style: normal;
  font-weight: ${d.weight};
  font-display: swap;
  src: url('/static/fonts/${d.slug}') format('woff2');
  unicode-range: ${d.unicodeRange};
}`
  )
  .join('\n')

console.log('=== PASTE THIS @font-face BLOCK NEAR THE TOP OF home-styles.ts ===\n')
console.log(fontFaceCss)
console.log('\n=== END ===\n')

console.log(`Total size: ${downloads.reduce((s, d) => s + d.bytes, 0)} bytes across ${downloads.length} files`)
