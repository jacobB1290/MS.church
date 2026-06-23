// Watch-library search harness.
//
// Pulls the LIVE search index off /watch and exercises the same ranking the
// browser runs, so search relevance can be tuned against real published
// content. Two modes:
//
//   node scripts/search-harness.mjs                 # data-derived test suite
//   node scripts/search-harness.mjs "joy" "love"    # ad-hoc: print rankings
//   HARNESS_URL=http://localhost:5173/watch node scripts/search-harness.mjs
//
// The suite derives its checks FROM the live catalog (every topic, every song
// title, every speaker), so it adapts as the library grows — no hardcoded
// dates. Exits non-zero if any check fails.
//
// IMPORTANT — keep the scoring block + cleanMessageTitle below byte-for-byte in
// sync with the search IIFE in src/templates/watch-body.ts. They are the same
// algorithm; this file is the offline, testable copy. If you tune one, tune both.

const URL = process.env.HARNESS_URL || 'https://ms.church/watch'

// ---- index-build cleaning (sync with watch-body.ts messageEntry) ----
const TITLE_NOISE = new Set(['live','sunday','morning','am','pm','service','star','church','of','boise','christian','morningstar','livestream','stream'])
function cleanMessageTitle(t) {
  return t.toLowerCase().split(/[^a-z0-9']+/).filter((w) => w && !TITLE_NOISE.has(w) && !/^\d/.test(w)).join(' ')
}

// ---- ranking (sync with watch-body.ts search IIFE) ----
const STOP = {a:1,an:1,the:1,of:1,on:1,at:1,about:1,for:1,to:1,and:1,or:1,with:1,that:1,this:1,is:1,was:1,are:1,be:1,our:1,us:1,me:1,my:1,we:1,what:1,who:1,when:1,where:1,how:1,do:1,does:1,did:1,you:1,it:1,from:1,please:1,find:1,show:1,want:1,one:1}
const FIELD_W = { ti: 10, wh: 8, to: 9, sc: 6, su: 4, tg: 7, ty: 5 }
function words(s) { return (s || '').toLowerCase().split(/[^a-z0-9']+/).filter(Boolean) }
function near(tok, w) {
  if (tok === w) return true
  let la = tok.length, lb = w.length; if (Math.abs(la - lb) > 1) return false
  let i = 0, j = 0, e = 0
  while (i < la && j < lb) { if (tok[i] === w[j]) { i++; j++ } else { if (++e > 1) return false; if (la > lb) i++; else if (lb > la) j++; else { i++; j++ } } }
  if (i < la || j < lb) e++
  return e <= 1
}
function fieldScore(tok, ws) {
  let best = 0
  for (const w of ws) {
    if (w === tok) return 1
    if (w.indexOf(tok) === 0) best = Math.max(best, 0.85)
    else if (w.indexOf(tok) > 0) best = Math.max(best, 0.6)
    else if (tok.length >= 5 && w.length >= 4 && near(tok, w)) best = Math.max(best, 0.5)
  }
  return best
}
function parse(q) {
  const raw = words(q), speaker = {}
  for (let i = 0; i < raw.length; i++) if ((raw[i] === 'by' || raw[i] === 'pastor' || raw[i] === 'with') && raw[i + 1]) speaker[raw[i + 1]] = 1
  return { toks: raw.filter((w) => w.length >= 2 && !STOP[w]), speaker }
}
function typeText(item) {
  if (item.t === 'song') return 'song songs worship music ' + (item.k || '')
  if (item.t === 'discussion') return 'discussion conversation talk'
  return 'sermon message teaching preaching'
}
function fieldsOf(item) {
  return {
    ti: words(item.ti), wh: words(item.wh), to: words((item.to || []).join(' ')),
    sc: words((item.sc || []).join(' ')), su: words(item.su), tg: words((item.tg || []).join(' ')),
    ty: words(typeText(item)),
  }
}
function score(item, p) {
  const fw = fieldsOf(item); let total = 0, matched = 0
  for (const tok of p.toks) {
    let best = 0
    for (const f in FIELD_W) {
      const q = fieldScore(tok, fw[f])
      if (q > 0) { let w = FIELD_W[f]; if (p.speaker[tok] && f === 'wh') w += 8; if (w * q > best) best = w * q }
    }
    if (best > 0) matched++
    total += best
  }
  return matched === 0 ? 0 : total * (matched / p.toks.length)
}

// ---- harness plumbing ----
function rank(idx, q) {
  const p = parse(q)
  return idx.map((e) => [e, score(e, p)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1])
}
const topicsOf = (e) => (e.to || []).join(' ').toLowerCase()
const desc = (e) => (e.t === 'song' ? `song:"${e.ti}"` : `${e.t}:${JSON.stringify(e.to)}`)

async function loadIndex() {
  const res = await fetch(URL, { headers: { Accept: 'text/html' } })
  if (!res.ok) throw new Error(`fetch ${URL} -> ${res.status}`)
  const html = await res.text()
  const m = html.match(/<script type="application\/json" id="watch-search-index">([\s\S]*?)<\/script>/)
  if (!m) throw new Error('search index not found on the page (is the library populated?)')
  const raw = JSON.parse(m[1])
  // Apply the same index-time cleaning, so results reflect the deployed algorithm
  // whether or not this exact build is live yet (cleaning is idempotent).
  return raw.map((e) => (e.t === 'song' ? e : { ...e, ti: cleanMessageTitle(e.ti) }))
}

function suite(idx) {
  const songs = idx.filter((e) => e.t === 'song')
  const msgs = idx.filter((e) => e.t !== 'song')
  const topics = [...new Set(idx.flatMap((e) => e.to || []))].filter(Boolean)
  const speakers = [...new Set(msgs.flatMap((e) => words(e.wh)))].filter((w) => w !== 'pastor' && w.length >= 3)

  let pass = 0, fail = 0
  const check = (name, q, ok, note) => {
    const r = rank(idx, q)
    const good = ok(r)
    good ? pass++ : fail++
    console.log(`${good ? 'pass' : 'FAIL'}  ${name.padEnd(34)} "${q}" -> ${r.length}  ${r.slice(0, 3).map(([e, s]) => `${desc(e)}(${s.toFixed(1)})`).join('  ')}`)
    if (!good && note) console.log('        ✗ ' + note)
  }

  console.log('— Topics: the matching item should rank in the top 3 —')
  for (const t of topics) check(`topic ${JSON.stringify(t)}`, t, (r) => r.slice(0, 3).some(([e]) => topicsOf(e).includes(t.toLowerCase())), 'no item with this topic in top 3')

  console.log('\n— Song titles: the song should rank in the top 2 (near-dupe titles allowed) —')
  for (const s of songs) check(`song ${JSON.stringify(s.ti.slice(0, 22))}`, s.ti, (r) => r.slice(0, 2).some(([e]) => e.i === s.i), 'song not in top 2 for its own title')

  console.log('\n— Speakers: a message by them should appear —')
  for (const sp of speakers) check(`speaker ${JSON.stringify(sp)}`, sp, (r) => r.some(([e]) => words(e.wh).includes(sp)), 'no message by this speaker matched')

  console.log('\n— Title boilerplate must stay quiet (no message should match) —')
  for (const w of ['sunday', 'boise', 'christian']) check(`quiet ${JSON.stringify(w)}`, w, (r) => !r.some(([e]) => e.t !== 'song'), 'a message matched a boilerplate word')

  console.log('\n— Collision guard: a topic query must not TOP an off-topic item —')
  check('collision "love"', 'love', (r) => {
    const top = r[0] && r[0][0]
    return top && (topicsOf(top).includes('love') || topicsOf(top).includes('salvation') || top.ti.toLowerCase().includes('love'))
  }, 'top result for "love" is unrelated (fuzzy "live" leak?)')

  console.log(`\n${pass} pass, ${fail} fail`)
  return fail
}

const args = process.argv.slice(2)
const idx = await loadIndex()
console.log(`index: ${idx.length} entries from ${URL}\n`)
if (args.length) {
  for (const q of args) {
    const r = rank(idx, q)
    console.log(`\n=== "${q}" -> ${r.length} ===`)
    r.forEach(([e, s]) => console.log(`  ${s.toFixed(2).padStart(6)}  ${desc(e)}`))
  }
} else {
  process.exit(suite(idx) > 0 ? 1 : 0)
}
