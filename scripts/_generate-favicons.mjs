// Ad-hoc favicon generator. Run when the source mark changes:
//   node scripts/_generate-favicons.mjs <source-image>
// Outputs to public/ and public/static/ — commit those to git.
//
// Generates the full set Google + browsers + PWAs expect:
//   public/favicon.ico              multi-res (16/32/48) for legacy + tab
//   public/static/favicon-32.png    32x32 sharp PNG for modern <link rel="icon">
//   public/static/favicon-16.png    16x16 for high-DPI legacy
//   public/static/apple-touch-icon.png   180x180 for iOS home screen
//   public/static/icon-192.png      192x192 for Android / PWA
//   public/static/icon-512.png      512x512 for Google search + PWA splash
//   public/static/icon-maskable-512.png  512x512 with safe-zone padding (PWA)
//   public/site.webmanifest         PWA + icon manifest
//
// ICO assembly is done by hand — the format is just a 6-byte header,
// 16-byte directory entries per frame, and PNG payloads. No deps needed.

import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const src = process.argv[2] || resolve(repoRoot, '/tmp/logo-src/logo.jpeg')

const publicDir = resolve(repoRoot, 'public')
const staticDir = resolve(repoRoot, 'public/static')
await mkdir(publicDir, { recursive: true })
await mkdir(staticDir, { recursive: true })

console.log(`[favicons] source: ${src}`)

// Step 1: trim white margins around the mark.
// Then pad to a centered square — the source is 729×410 with the mark
// off-center, so a square crop without padding would clip artwork.
const trimmed = await sharp(src)
  .trim({ background: '#ffffff', threshold: 10 })
  .toBuffer({ resolveWithObject: true })

const { width: tw, height: th } = trimmed.info
const side = Math.max(tw, th)
// 6% padding on each side so the mark doesn't touch the icon edge —
// matches Google's recommendation that icons have built-in padding.
const padded = Math.round(side * 1.12)

console.log(`[favicons] trimmed: ${tw}×${th} -> padded to ${padded}×${padded}`)

const squareBuffer = await sharp({
  create: {
    width: padded,
    height: padded,
    channels: 4,
    background: '#ffffff',
  },
})
  .composite([
    {
      input: trimmed.data,
      gravity: 'center',
    },
  ])
  .png()
  .toBuffer()

// Maskable variant: the safe zone for maskable icons is the inner 80%,
// so we shrink the mark to ~64% of the canvas (extra margin) and fill the
// whole canvas with the brand cream so the platform can crop without
// hitting blank corners.
const maskableInner = Math.round(padded * 0.64)
const maskableSource = await sharp(trimmed.data)
  .resize(maskableInner, maskableInner, { fit: 'contain', background: '#ffffff' })
  .png()
  .toBuffer()
const maskableBuffer = await sharp({
  create: {
    width: padded,
    height: padded,
    channels: 4,
    background: '#faf8f5',
  },
})
  .composite([{ input: maskableSource, gravity: 'center' }])
  .png()
  .toBuffer()

// Step 2: write the per-size PNGs.
async function writePng(size, outPath, source = squareBuffer) {
  const out = await sharp(source).resize(size, size, { fit: 'contain' }).png({ compressionLevel: 9 }).toBuffer()
  await writeFile(outPath, out)
  console.log(`[favicons] wrote ${outPath} (${size}×${size}, ${out.length} bytes)`)
  return out
}

const png16 = await writePng(16, resolve(staticDir, 'favicon-16.png'))
const png32 = await writePng(32, resolve(staticDir, 'favicon-32.png'))
const png48 = await sharp(squareBuffer).resize(48, 48).png({ compressionLevel: 9 }).toBuffer()
await writePng(180, resolve(staticDir, 'apple-touch-icon.png'))
await writePng(192, resolve(staticDir, 'icon-192.png'))
await writePng(512, resolve(staticDir, 'icon-512.png'))
await writePng(512, resolve(staticDir, 'icon-maskable-512.png'), maskableBuffer)

// Step 3: hand-assemble the multi-resolution favicon.ico.
// Format reference: https://en.wikipedia.org/wiki/ICO_(file_format)
//   ICONDIR (6 bytes):
//     reserved (u16, =0)
//     type     (u16, =1 for icon)
//     count    (u16, number of images)
//   ICONDIRENTRY[count] (16 bytes each):
//     width    (u8, 0 means 256)
//     height   (u8, 0 means 256)
//     colors   (u8, =0 for true color)
//     reserved (u8, =0)
//     planes   (u16, =1)
//     bitCount (u16, =32)
//     size     (u32, payload bytes)
//     offset   (u32, from start of file)
//   ...followed by each PNG payload concatenated.
function buildIco(frames) {
  const headerSize = 6 + 16 * frames.length
  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(frames.length, 4)

  let offset = headerSize
  for (let i = 0; i < frames.length; i++) {
    const { size, data } = frames[i]
    const entryOff = 6 + 16 * i
    header.writeUInt8(size === 256 ? 0 : size, entryOff + 0)
    header.writeUInt8(size === 256 ? 0 : size, entryOff + 1)
    header.writeUInt8(0, entryOff + 2)
    header.writeUInt8(0, entryOff + 3)
    header.writeUInt16LE(1, entryOff + 4)
    header.writeUInt16LE(32, entryOff + 6)
    header.writeUInt32LE(data.length, entryOff + 8)
    header.writeUInt32LE(offset, entryOff + 12)
    offset += data.length
  }

  return Buffer.concat([header, ...frames.map((f) => f.data)])
}

const ico = buildIco([
  { size: 16, data: png16 },
  { size: 32, data: png32 },
  { size: 48, data: png48 },
])
const icoPath = resolve(publicDir, 'favicon.ico')
await writeFile(icoPath, ico)
console.log(`[favicons] wrote ${icoPath} (16+32+48 multi-res, ${ico.length} bytes)`)

// Step 4: write the web app manifest.
const manifest = {
  name: 'Morning Star Christian Church',
  short_name: 'Morning Star',
  description: 'Morning Star Christian Church in Boise, Idaho. Sunday worship, Bible study, and fellowship.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#faf8f5',
  theme_color: '#faf8f5',
  icons: [
    { src: '/static/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/static/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/static/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
const manifestPath = resolve(publicDir, 'site.webmanifest')
await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
console.log(`[favicons] wrote ${manifestPath}`)

console.log('[favicons] done')
