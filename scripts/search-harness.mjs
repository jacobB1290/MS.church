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
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december']

// ---- ranking (sync with watch-body.ts search IIFE) ----
const STOP = {a:1,an:1,the:1,of:1,on:1,at:1,about:1,for:1,to:1,and:1,or:1,with:1,that:1,this:1,is:1,was:1,are:1,be:1,our:1,us:1,me:1,my:1,we:1,what:1,who:1,when:1,where:1,how:1,do:1,does:1,did:1,you:1,it:1,from:1,please:1,find:1,show:1,want:1,one:1}
const FIELD_W = { ti: 10, wh: 8, to: 9, sc: 6, su: 4, tg: 7, ty: 5, dt: 7, ch: 5 }
const EXACT_TITLE_BONUS = 100 // exact full-title query (2+ words) pins to the top
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
  const hasDigit = /\d/.test(tok)
  for (const w of ws) {
    if (w === tok) return 1
    if (w.indexOf(tok) === 0) best = Math.max(best, 0.85)
    else if (w.indexOf(tok) > 0) best = Math.max(best, 0.6)
    else if (tok.length >= 5 && w.length >= 4 && !hasDigit && near(tok, w)) best = Math.max(best, 0.5)
  }
  return best
}
function parse(q) {
  const raw = words(q), speaker = {}
  for (let i = 0; i < raw.length; i++) if ((raw[i] === 'by' || raw[i] === 'pastor' || raw[i] === 'with') && raw[i + 1]) speaker[raw[i + 1]] = 1
  const toks = raw.filter((w) => w.length >= 2 && !STOP[w])
  // Scripture gluing — mirrors watch-body.ts parse(): a book next to a number
  // ("john 3", "1 john", "matthew 6") also emits a glued token so single-digit
  // chapters/ordinals survive the >=2 filter and hit the glued scripture tokens.
  for (let j = 0; j < raw.length - 1; j++) {
    const a = raw[j], b = raw[j + 1]
    if (/^[a-z']+$/.test(a) && /^\d+$/.test(b)) toks.push(a + b)
    else if (/^\d+$/.test(a) && /^[a-z']+$/.test(b)) toks.push(a + b)
  }
  return { toks, speaker, qnorm: raw.join(' ') }
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
    ty: words(typeText(item)), dt: words(item.dt), ch: words((item.ch || []).join(' ')),
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
  let base = matched === 0 ? 0 : total * (matched / p.toks.length)
  if (base > 0 && p.qnorm && fw.ti.length >= 2 && fw.ti.join(' ') === p.qnorm) base += EXACT_TITLE_BONUS
  return base
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
  // A topic query is satisfied by an item carrying that topic OR an item whose
  // title is the phrase (a title match for "christ in me" is as relevant as the tag).
  for (const t of topics) { const tl = t.toLowerCase(); check(`topic ${JSON.stringify(t)}`, t, (r) => r.slice(0, 3).some(([e]) => topicsOf(e).includes(tl) || (e.ti || '').toLowerCase().includes(tl)), 'no item matching this topic in top 3') }

  console.log('\n— Song titles: the song (or a same-title twin) ranks in the top 3 —')
  // The catalog has genuine title twins (spelling variants of the same hymn across
  // weeks). Searching a title must surface that song or one of its twins near the top.
  const songNorm = (t) => words(t).join(' ')
  for (const s of songs) { const tw = songNorm(s.ti); check(`song ${JSON.stringify(s.ti.slice(0, 22))}`, s.ti, (r) => r.slice(0, 3).some(([e]) => e.i === s.i || (e.t === 'song' && songNorm(e.ti) === tw)), 'song (or its title twin) not in top 3') }

  console.log('\n— Speakers: a message by them should appear —')
  for (const sp of speakers) check(`speaker ${JSON.stringify(sp)}`, sp, (r) => r.some(([e]) => words(e.wh).includes(sp)), 'no message by this speaker matched')

  console.log('\n— Title boilerplate must not flood (a leak into the title would match most messages) —')
  // Boilerplate words can legitimately appear in a curated tag (e.g. "Palm Sunday"),
  // so the guard is that they don't match a FLOOD of messages — which is what a leak
  // of livestream-title boilerplate into the indexed title/summary would look like.
  // When the summary is boilerplate-filtered (deployed index), test the strong set;
  // an unfiltered (older) index only gets the core words, which hold either way.
  const FLOOD = Math.max(3, Math.floor(0.2 * msgs.length))
  const suClean = !idx.some((e) => words(e.su).some((w) => TITLE_NOISE.has(w)))
  const quietWords = suClean ? ['sunday', 'boise', 'christian', 'morning', 'service', 'church', 'star'] : ['sunday', 'boise', 'christian']
  for (const w of quietWords) check(`quiet ${JSON.stringify(w)}`, w, (r) => r.filter(([e]) => e.t !== 'song').length < FLOOD, `boilerplate "${w}" matched ${FLOOD}+ messages`)

  console.log('\n— Precision: an incidental word mention must NOT outrank a topical match —')
  // The owner's bar: a service that merely mentions "love" once in a chapter but is
  // about a different topic must not rank above genuinely love-themed messages. An
  // item is "incidental" when the word hits ONLY the weak summary/chapter text; it's
  // "topical" when it hits a strong field (title/topic/tag/scripture/speaker). Every
  // topical message must rank above every incidental one.
  const TOPICAL_WORDS = ['love', 'prayer', 'faith', 'forgiveness', 'rest', 'joy']
  const STRONG_F = ['ti', 'to', 'tg', 'sc', 'wh']
  const isIncidental = (e, w) => {
    const fw = fieldsOf(e)
    const strong = STRONG_F.some((f) => fieldScore(w, fw[f]) > 0)
    const weak = fieldScore(w, fw.su) > 0 || fieldScore(w, fw.ch) > 0
    return !strong && weak
  }
  for (const w of TOPICAL_WORDS) {
    if (!idx.some((e) => e.t !== 'song' && !isIncidental(e, w) && fieldScore(w, fieldsOf(e).to) + fieldScore(w, fieldsOf(e).tg) + fieldScore(w, fieldsOf(e).ti) > 0)) continue
    check(`incidental "${w}"`, w, (r) => {
      let seenIncidental = false
      for (const [e] of r.filter(([e]) => e.t !== 'song')) {
        if (isIncidental(e, w)) seenIncidental = true
        else if (seenIncidental) return false // a topical message ranked below an incidental one
      }
      return true
    }, 'an incidental (summary/chapter-only) mention outranked a topical message')
  }

  console.log('\n— Collision guard: a topic query must not TOP an off-topic item —')
  check('collision "love"', 'love', (r) => {
    const top = r[0] && r[0][0]
    return top && (topicsOf(top).includes('love') || topicsOf(top).includes('salvation') || top.ti.toLowerCase().includes('love'))
  }, 'top result for "love" is unrelated (fuzzy "live" leak?)')

  // ---------------------------------------------------------------------------
  // New searchable dimensions: scripture enrichment, dates, distinctive chapter
  // content. Each block is DATA-AWARE — it derives checks from what's in the live
  // index and SKIPS cleanly when a dimension isn't present yet (e.g. the enriched
  // index hasn't deployed), so the suite never red-fails against a stale page. The
  // book-name checks pass on the raw OR enriched index (a book name tokenizes out
  // of a raw "Romans 8:9" ref either way); precision checks need the enriched form.
  const scWordsOf = (e) => words((e.sc || []).join(' '))
  const dtWordsOf = (e) => words(e.dt || '')
  const chWordsOf = (e) => words((e.ch || []).join(' '))
  const scAll = new Set(idx.flatMap(scWordsOf))
  const enriched = [...scAll].some((w) => /[a-z]\d/.test(w)) // "matthew6" present -> enriched index is live
  const monthsLive = [...new Set(idx.flatMap(dtWordsOf))].filter((w) => MONTHS.includes(w))
  const yearsLive = [...new Set(idx.flatMap(dtWordsOf))].filter((w) => /^(19|20)\d\d$/.test(w))
  const chLive = new Set(idx.flatMap(chWordsOf))

  const BOOKS = ['genesis','exodus','leviticus','numbers','deuteronomy','joshua','psalm','proverbs','isaiah','jeremiah','ezekiel','daniel','matthew','mark','luke','john','acts','romans','corinthians','galatians','ephesians','philippians','colossians','hebrews','james','revelation']
  const names = new Set(idx.flatMap((e) => words(e.wh))) // speakers + song leaders -> person-name collisions (Daniel/Mark)
  console.log('\n— Scripture recall: every cited book is findable —')
  for (const b of BOOKS) { if (!scAll.has(b)) continue; check(`recall ${JSON.stringify(b)}`, b, (r) => r.some(([e]) => scWordsOf(e).includes(b)), 'cited book not findable at all') }
  console.log('\n— Scripture precision: a clean book name ranks its message top 3 (person-name books exempt) —')
  for (const b of BOOKS) { if (!scAll.has(b) || names.has(b)) continue; check(`book ${JSON.stringify(b)}`, b, (r) => r.slice(0, 3).some(([e]) => scWordsOf(e).includes(b)), 'book not cited by any top-3 result') }

  if (enriched) {
    console.log('\n— Scripture precision: abbreviations, book+chapter, numbered books —')
    // Non-prefix abbreviations (mt/mk/lk/jn/dt) + clean prefix ones. Short 3-letter
    // prefixes that collide with common words (gen->"gentle") are intentionally skipped.
    for (const [q, book] of [['mt','matthew'],['mk','mark'],['lk','luke'],['jn','john'],['rom','romans'],['eph','ephesians'],['dt','deuteronomy'],['rev','revelation']]) {
      if (!scAll.has(book) || names.has(book)) continue
      check(`abbr ${JSON.stringify(q)} -> ${book}`, q, (r) => r.slice(0, 3).some(([e]) => scWordsOf(e).includes(book)), `abbreviation did not surface ${book}`)
    }
    // book + chapter: a real glued "book+chapter" token, queried as "book chapter"
    const bc = [...scAll].find((w) => /^[a-z]{4,}\d{1,3}$/.test(w))
    if (bc) {
      const mm = bc.match(/^([a-z]+?)(\d+)$/)
      const q = mm[1] + ' ' + mm[2]
      check(`chapter ${JSON.stringify(q)}`, q, (r) => r.length > 0 && scWordsOf(r[0][0]).includes(bc), `"${q}" top result is not actually ${bc}`)
    }
    // numbered book: "1 john" must top an actual 1-John item, not plain John
    for (const nb of ['1john','1corinthians','2corinthians','2timothy','1peter']) {
      if (!scAll.has(nb)) continue
      const mm = nb.match(/^(\d)([a-z]+)$/)
      const q = mm[1] + ' ' + mm[2]
      check(`numbered ${JSON.stringify(q)}`, q, (r) => r.length > 0 && scWordsOf(r[0][0]).includes(nb), `"${q}" did not rank a ${nb} item first`)
      break // one representative is enough
    }
  }

  if (monthsLive.length) {
    console.log('\n— Dates: a month or year ranks that period on top —')
    for (const mo of monthsLive) check(`month ${JSON.stringify(mo)}`, mo, (r) => r.slice(0, 3).some(([e]) => dtWordsOf(e).includes(mo)), 'no service from this month in top 3')
    for (const y of yearsLive) check(`year ${JSON.stringify(y)}`, y, (r) => r.length > 0 && r.slice(0, 6).some(([e]) => dtWordsOf(e).includes(y)), 'no service from this year ranked')
  }

  if (chLive.size) {
    console.log('\n— Chapters: a distinctive segment type finds a service that has it —')
    for (const lbl of ['testimony','poem','benediction','communion','baptism']) {
      if (!chLive.has(lbl)) continue
      check(`chapter ${JSON.stringify(lbl)}`, lbl, (r) => r.slice(0, 3).some(([e]) => chWordsOf(e).includes(lbl)), 'no service with this segment in top 3')
    }
  }

  console.log('\n— Hard / ambiguous queries —')
  // "prayer": a topic AND it appears in many summaries — a topic item must lead.
  if (idx.some((e) => topicsOf(e).includes('prayer')))
    check('ambiguous "prayer"', 'prayer', (r) => r.slice(0, 3).some(([e]) => topicsOf(e).includes('prayer')), 'prayer-topic item not in top 3')
  // apostrophe + occasion: "father's day" -> the Father's Day service.
  if (idx.some((e) => (e.tg || []).some((t) => /father/i.test(t))))
    check('ambiguous "father\'s day"', "father's day", (r) => r.length > 0 && ((r[0][0].tg || []).some((t) => /father/i.test(t)) || /father/i.test(r[0][0].ti || '')), 'Father\'s Day service not on top')
  // natural "book chapter" phrasing.
  if (scAll.has('romans'))
    check('phrase "romans 8"', 'romans 8', (r) => r.slice(0, 3).some(([e]) => scWordsOf(e).includes('romans')), 'no Romans message for "romans 8"')
  // "holy spirit": the topic must lead, not a stray summary mention.
  if (idx.some((e) => topicsOf(e).includes('holy spirit')))
    check('ambiguous "holy spirit"', 'holy spirit', (r) => r.slice(0, 3).some(([e]) => topicsOf(e).includes('holy spirit')), 'holy-spirit topic not in top 3')

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
