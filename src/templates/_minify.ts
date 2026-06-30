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
