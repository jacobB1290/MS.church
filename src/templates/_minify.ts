// Minify the large inline CSS once per process (memoized by the caller).
//
// The home stylesheet ships inline in <head> on every page, so it sits in the
// render-blocking critical path. Stripping comments and whitespace trims CSS
// parse time on slow mobile CPUs (the PageSpeed "Minify CSS" diagnostic) and
// shaves a few KB off the document before brotli.
//
// Deliberately a pure-JS minifier (no native binary), so it runs anywhere the
// Node serverless function does, and deliberately level 1 only: whitespace and
// comment removal plus value-level tidying, never the structural rule-merging of
// level 2 (which can reorder the cascade and would break the scroll-driven
// nav-morph's pose determinism). Any failure falls back to the raw string, so a
// minifier hiccup can never take a page down.
import CleanCSS from 'clean-css'
import { transformSync } from 'esbuild'

const cleaner = new CleanCSS({ level: 1, returnPromise: false })

const cache = new Map<string, string>()

export function minifyCssOnce(raw: string): string {
  // Diagnostic escape hatch: MS_NO_MINIFY=1 serves the raw stylesheet, used to
  // pixel-diff minified vs unminified and prove the design is byte-identical.
  if (process.env.MS_NO_MINIFY === '1') return raw
  const hit = cache.get(raw)
  if (hit !== undefined) return hit
  let out = raw
  try {
    const res = cleaner.minify(raw)
    if (res.styles && res.errors.length === 0) out = res.styles
  } catch {
    /* keep the raw string on any failure */
  }
  cache.set(raw, out)
  return out
}

// ── Inline JS + JSON-LD minification ────────────────────────────────────────
// The home document ships everything inline; after the stylesheet, the largest
// reducible bytes are the unminified inline JS (~220 KiB, the PageSpeed "Minify
// JavaScript" item) and the pretty-printed JSON-LD (~40 KiB). Trimming both
// shrinks the document the browser must download AND parse, which is what gates
// LCP "render delay" on this page. This only REMOVES bytes/whitespace, so it can
// never make rendering slower; any failure falls back to the original block.

const jsCache = new Map<string, string>()
function minifyJsBlock(code: string): string {
  if (process.env.MS_NO_MINIFY === '1') return code
  const hit = jsCache.get(code)
  if (hit !== undefined) return hit
  let out = code
  try {
    out = transformSync(code, { loader: 'js', minify: true, legalComments: 'none' }).code
    // Belt-and-suspenders: never let a string literal close the inline <script>.
    out = out.replace(/<\/script/gi, '<\\/script')
  } catch {
    /* keep the raw script on any failure */
  }
  jsCache.set(code, out)
  return out
}

function compactJson(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json))
  } catch {
    return json
  }
}

/**
 * Minify a composed HTML document's inline JS and compact its JSON-LD, leaving
 * the (separately-minified) <style> blocks and any other typed <script> data
 * untouched. Matches only attribute-less <script> for JS (so typed data scripts
 * are skipped) and explicit application/ld+json blocks for JSON.
 */
export function minifyInlineAssets(html: string): string {
  return html
    .replace(
      /(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,
      (_m, open, body, close) => open + compactJson(body) + close,
    )
    .replace(
      /(<script>)([\s\S]*?)(<\/script>)/g,
      (_m, open, body, close) => open + minifyJsBlock(body) + close,
    )
}
