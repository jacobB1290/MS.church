import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import {
  messageCard,
  sermonSegmentCard,
  cleanSegmentTitle,
  songCard,
  type SongOccurrence,
  escapeHtml,
  watchPlayerScript,
  vplayer,
  posterFor,
  longDate,
  shortDate,
  lengthLabel,
  speakerLine,
} from './watch-shared.js'
import { tallyTopics, type PublishedSermon } from '../sermons-feed.js'

// /watch — the on-site service library hub.
//
//   Top  — a full-service browser: the selected service (default the latest),
//          with Older/Newer steppers and a "by date" list. Click through to its
//          permalink to watch the whole thing.
//   Tabs — one message type at a time (Sermons first, then Discussions; Songs
//          later). Each card IS an inline segment player: tap it and the sermon
//          plays right there, just the message; "Full service" is the small jump.
//          One topic tag per item; a topic filter narrows the active tab.
//
// Everything is in the HTML (crawlable). Client JS = the shared segment player +
// the service selector + tab/topic filtering. Falls back to the live YouTube
// latest video when nothing is published yet.

export type WatchFeature = {
  videoId: string
  posterUrl: string
  title: string
  dateLabel: string | null
  metaLine: string | null
  summary: string
  scriptureRefs: string[]
  href: string | null
  // True when the hero is the latest service shown whole because it has no
  // chapters yet (live now, or aired-but-not-segmented). It plays inline like
  // every other service, so it shows no permalink link until an archived service
  // is selected from the list.
  isLive: boolean
  // Raw publish ISO of the featured service — used for the short dateline on its
  // row in the "Recent services" list (the live service appears there too).
  publishedAt: string | null
}

export type WatchHubView = {
  mode: 'library' | 'fallback'
  feature: WatchFeature
  items: PublishedSermon[]
  ytWatchUrl: string
  playlistUrl: string
}

const PLAY_TRIANGLE = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`
const PLAY_TRIANGLE_SM = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`

function metaLineFor(s: PublishedSermon): string {
  const speaker = speakerLine(s.speakers)
  return [longDate(s.publishedAt), speaker ? `with ${speaker}` : null, lengthLabel(s.durationSec)]
    .filter(Boolean)
    .join(' · ')
}

/**
 * The raw YouTube livestream title ("LIVE - Sunday Morning 9:00am | 6/07/2026 |
 * Morning Star Church of Boise") is machine boilerplate, identical every week and
 * carrying a second copy of the date. Until a service is segmented and earns a
 * real generated title, show a clean human label instead so the archive reads as
 * authored content, not a data dump. A real (generated) title passes through.
 */
function cleanServiceTitle(raw: string): string {
  const t = (raw || '').trim()
  if (!t) return 'Sunday service'
  if (/^live\b/i.test(t) || /morning star church/i.test(t) || /\|\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*\|/.test(t)) {
    return 'Sunday service'
  }
  return t
}

/**
 * Light smart-quotes for displayed titles + summaries (curly apostrophes and
 * paired quotes) so editorial text reads correctly even though it arrives as
 * plain ASCII from the CRM/YouTube. Conservative: only the unambiguous cases.
 * Runs BEFORE escapeHtml (which leaves the curly glyphs untouched).
 */
function typo(s: string): string {
  return (s || '')
    .replace(/(\w)'(\w)/g, '$1’$2') // possessive / contraction: Lord's -> Lord’s
    .replace(/(^|[\s([{“"])'/g, '$1‘') // opening single quote
    .replace(/'/g, '’') // any remaining single -> closing
    .replace(/(^|[\s([{])"/g, '$1“') // opening double quote
    .replace(/"/g, '”') // any remaining double -> closing
}

/* ---- Fallback feature (no published items yet): live YouTube latest ---- */
function renderFallbackFeature(view: WatchHubView): string {
  const f = view.feature
  return `<section id="latest" aria-label="Latest service">
                    <span class="section-eyebrow">Latest service</span>
                    <div class="watch-feature">
                        <button class="watch-feature-thumb" id="watch-feature-play" type="button" data-video="${escapeHtml(f.videoId)}" aria-label="Play the latest Sunday service">
                            <img src="${escapeHtml(f.posterUrl)}" alt="Latest Sunday service from Morning Star Christian Church in Boise, Idaho." width="1280" height="720" loading="eager" fetchpriority="high"
                                 onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${escapeHtml(f.videoId)}/hqdefault.jpg';">
                            <span class="watch-feature-play">${PLAY_TRIANGLE}</span>
                        </button>
                        <div class="watch-feature-meta">
                            <h2 class="watch-feature-title">${escapeHtml(typo(cleanServiceTitle(f.title)))}</h2>
                            ${f.dateLabel ? `<span class="watch-feature-meta-line">${escapeHtml(f.dateLabel)}</span>` : ''}
                            <p class="watch-feature-blurb">${escapeHtml(typo(f.summary))}</p>
                        </div>
                    </div>
                </section>`
}

/** A synthetic sermon-shaped record so the feature player can play the live /
 *  unsegmented latest video (no chapters, whole video) through the same vplayer
 *  as every segmented service. */
function liveHeroSermon(f: WatchFeature): PublishedSermon {
  return {
    slug: '',
    youtubeVideoId: f.videoId,
    title: f.title,
    format: 'sermon',
    speakers: [],
    topics: [],
    publishedAt: null,
    thumbnailUrl: f.posterUrl,
    durationSec: null,
    summary: f.summary,
    seo: null,
    segments: [],
    songs: [],
    transcript: null,
  }
}

/* ---- Service selector (library): pick which full service to watch ---- */
type SvcEntry = {
  slug: string
  title: string
  date: string
  poster: string
  videoId: string
  dur: number
  meta: string
  blurb: string
  live: boolean
  // Chapter starts for THIS service, so the hero scrubber can show markers + a
  // chapter label as you pick different services from the Recent list.
  chapters: { seek: number; title: string }[]
}

/** A service's segments as scrubber chapters ({seek, title}), in order. */
function svcChapters(s: PublishedSermon): { seek: number; title: string }[] {
  return s.segments.map((seg) => ({ seek: Math.floor(seg.startSec), title: typo(seg.title || '') }))
}

function renderServiceSelector(view: WatchHubView): string {
  const f = view.feature
  const live = f.isLive
  // The index is a quick-access list of recent full services; the deep archive
  // is the library tabs below (every older service is reachable via its card's
  // "Full service" permalink). Cap it so it stays a list, not a ledger — leaving
  // room for the live service at the top when it's present.
  const segItems = view.items.slice(0, live ? 7 : 8)
  const segEntries: SvcEntry[] = segItems.map((s) => ({
    slug: s.slug,
    title: typo(cleanServiceTitle(s.title)),
    date: shortDate(s.publishedAt) ?? '',
    poster: posterFor(s.youtubeVideoId, s.thumbnailUrl),
    videoId: s.youtubeVideoId,
    dur: Math.floor(s.durationSec ?? 0),
    meta: metaLineFor(s),
    blurb: typo(s.summary ?? ''),
    live: false,
    chapters: svcChapters(s),
  }))
  // The live/unsegmented service leads both the hero AND the list — until it's
  // chaptered it has no permalink (slug ''), so its row + hero play it inline.
  const liveEntry: SvcEntry = {
    slug: '',
    title: typo(cleanServiceTitle(f.title)),
    date: shortDate(f.publishedAt) ?? f.dateLabel ?? '',
    poster: f.posterUrl,
    videoId: f.videoId,
    dur: 0,
    meta: f.metaLine ?? '',
    blurb: typo(f.summary),
    live: true,
    chapters: [],   // the live/unsegmented service has no chapters yet
  }
  // One ordered list drives the hero (entry 0) and every row, so the live
  // service can never be the hero but missing from the list.
  const entries: SvcEntry[] = live ? [liveEntry, ...segEntries] : segEntries
  const hero = entries[0]

  // A quiet editorial index of recent services: date + clean title, hairline
  // rules. Selecting a row swaps the featured player above (and scrolls to it).
  // Entry 0 (the hero) starts current.
  const rows = entries
    .map(
      (e, i) =>
        `<button class="watch-svc-row${i === 0 ? ' is-current' : ''}" type="button" data-i="${i}" aria-label="Watch ${escapeHtml(e.title)}">
                            <span class="watch-svc-row-date">${escapeHtml(e.date)}</span>
                            <span class="watch-svc-row-title">${escapeHtml(e.title)}</span>
                            <span class="watch-svc-row-go" aria-hidden="true">${PLAY_TRIANGLE_SM}</span>
                        </button>`,
    )
    .join('\n                        ')

  // Hero: the live/unsegmented latest service when newer than anything chaptered,
  // otherwise the newest segmented service. Same inline feature player either way.
  const heroSermon = live ? liveHeroSermon(f) : view.items[0]
  const heroTitle = hero.title
  const heroMeta = hero.meta
  const heroBlurb = hero.blurb
  // A live hero plays inline (like every other service), so it needs no link; the
  // empty #feature-fulllink stays hidden until the swap JS reveals it as the
  // chaptered permalink of a selected archived service. A segmented hero shows its
  // "Chapters & transcript" permalink up front.
  const heroLink = hero.live
    ? `<a class="watch-feature-fulllink" id="feature-fulllink" hidden></a>`
    : `<a class="watch-feature-fulllink" id="feature-fulllink" href="/watch/${escapeHtml(hero.slug)}">Chapters &amp; transcript<span aria-hidden="true"> &rarr;</span></a>`
  const showList = entries.length > 1
  const data = entries

  // The featured plays the WHOLE service inline (no segment). The index below
  // swaps which video it points at (the player reads its data attrs live).
  return `<section id="latest" aria-label="Watch a full service">
                    <span class="section-eyebrow">Watch a full service</span>
                    <div class="watch-feature" id="service-feature">
                        <div class="watch-feature-player">${vplayer(heroSermon, null, 'feature', 'Sunday service from Morning Star Christian Church in Boise, Idaho.')}</div>
                        <div class="watch-feature-meta">
                            <h2 class="watch-feature-title" id="feature-title">${escapeHtml(heroTitle)}</h2>
                            <span class="watch-feature-meta-line" id="feature-meta">${escapeHtml(heroMeta)}</span>
                            <p class="watch-feature-blurb" id="feature-blurb">${escapeHtml(heroBlurb)}</p>
                            ${heroLink}
                        </div>
                    </div>
                    ${
                      showList
                        ? `<div class="watch-svc">
                        <h3 class="watch-svc-label">Recent services</h3>
                        <div class="watch-svc-list" id="feature-list">
                        ${rows}
                        </div>
                    </div>`
                        : ''
                    }
                    <script type="application/json" id="services-data">${JSON.stringify(data)}</script>
                </section>`
}

/* ---- Library tabs (message types) ---- */

/**
 * A chip row (one per tab) that filters its panel's grid by a data attribute
 * (key = topic | kind). All tab filters live together in the shared rail below
 * the tabs; only the active tab's is shown. ALWAYS returns a wrapper — even when
 * a tab has no chips to offer — so switching to that tab can collapse the rail
 * smoothly instead of leaving the previous tab's chips behind.
 */
function filterRow(
  panelId: string,
  active: boolean,
  key: string,
  label: string,
  chips: { val: string; label: string; count: number }[],
  defaultVal = 'all',
): string {
  // The toggle that opens/closes the overflow set. Both labels are rendered and
  // crossfaded in place (grid-stacked, so the button width never jumps); JS shows
  // it only when the chips actually overflow the collapsed row budget.
  const toggle = `<button class="watch-chip watch-chip--toggle" type="button" data-chip-toggle aria-expanded="false" hidden>
                            <span class="watch-chip-toggle-label" data-toggle-more>+<span class="watch-chip-toggle-n"></span> more</span>
                            <span class="watch-chip-toggle-label" data-toggle-less aria-hidden="true">Show less</span>
                          </button>`
  // Every chip is in the HTML (crawlers + the no-JS path see the full taxonomy);
  // JS collapses the overflow to three rows and reveals the rest inline on expand,
  // keeping the count order throughout (most-preached first).
  const inner =
    chips.length <= 1
      ? ''
      : `<button class="watch-chip" type="button" data-val="all" aria-pressed="${defaultVal === 'all' ? 'true' : 'false'}">All</button>
                            <span class="watch-chip-sep" aria-hidden="true"></span>
                            ${chips
                              .map(
                                (c) =>
                                  `<button class="watch-chip" type="button" data-val="${escapeHtml(c.val)}" aria-pressed="${defaultVal === c.val ? 'true' : 'false'}">${escapeHtml(c.label)}<span class="watch-chip-count">${c.count}</span></button>`,
                              )
                              .join('\n                            ')}
                            ${toggle}`
  return `<div class="watch-filter${active ? ' is-active' : ''}" role="group" aria-label="${escapeHtml(label)}" data-panel="${escapeHtml(panelId)}" data-key="${escapeHtml(key)}" data-default="${escapeHtml(defaultVal)}"${active ? '' : ' hidden'}>${inner}</div>`
}

function topicFilter(panelId: string, active: boolean, items: PublishedSermon[]): string {
  const topics = tallyTopics(items)
  return filterRow(panelId, active, 'topic', 'Filter by topic', topics.map((t) => ({ val: t.slug, label: t.topic, count: t.count })))
}

type SongItem = {
  sermon: PublishedSermon
  song: PublishedSermon['songs'][number]
  count: number
  // Every time this song was sung, newest first (occurrences[0] is the card's
  // default). Powers the "sung N times" dropdown.
  occurrences: SongOccurrence[]
}

function songFilter(panelId: string, active: boolean, songItems: SongItem[]): string {
  const worship = songItems.filter((it) => it.song.kind !== 'program').length
  const program = songItems.filter((it) => it.song.kind === 'program').length
  const chips =
    worship > 0 && program > 0
      ? [
          { val: 'worship', label: 'Worship', count: worship },
          { val: 'program', label: 'Program', count: program },
        ]
      : []
  return filterRow(panelId, active, 'kind', 'Filter songs', chips, 'program')
}

// Progressive disclosure: a tab shows the first PAGE_INITIAL cards and reveals
// PAGE_BATCH more on each "Show more" press. Every card is still in the HTML (so
// crawlers + the client search see the whole library); the rest are just visually
// collapsed until asked for, so a large archive stays a light first paint.
const PAGE_INITIAL = 6
const PAGE_BATCH = 12

/** The "Show more" control for a tab — only when a tab has more than the initial set. */
function moreButton(total: number): string {
  if (total <= PAGE_INITIAL) return ''
  return `<div class="watch-more-wrap" data-more-wrap>
                            <button class="watch-more" type="button" data-more>Show more<span class="watch-more-count" aria-hidden="true"></span></button>
                        </div>`
}

/**
 * A tab's panel: the group label (shown only in search results) + the card grid +
 * the "Show more" control. The chips moved out to the shared rail above so they can
 * animate on tab switch.
 */
function messageGrid(id: string, items: PublishedSermon[], active: boolean, groupLabel: string): string {
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'} data-shown="${PAGE_INITIAL}">
                        <h3 class="watch-group-label" aria-hidden="true">${groupLabel}<span class="watch-group-count" data-group-count></span></h3>
                        <div class="watch-grid">
                        ${items.map((s) => messageCard(s, s.slug)).join('\n                        ')}
                        </div>
                        ${moreButton(items.length)}
                    </div>`
}

// A single card slot in the Sermons tab. `seg: null` is a whole-service card
// (the normal case); a set `seg` is one sermon of a multi-sermon service, split
// out so each preacher's sermon is its own library entry. `sid` keys the card to
// its search-index entry.
type SermonUnit = { sermon: PublishedSermon; seg: PublishedSermon['segments'][number] | null; sid: string }

/**
 * Expand the sermon services into card slots. A service with two or more sermon
 * chapters (two preachers) becomes one card PER sermon; every other service stays
 * a single whole-service card. Discussions are never split (handled in their own
 * tab). Order is preserved: newest service first, sermons within a service in play
 * order.
 */
function expandSermonUnits(services: PublishedSermon[]): SermonUnit[] {
  const out: SermonUnit[] = []
  for (const s of services) {
    const sermonSegs = s.segments.filter((seg) => seg.type === 'sermon')
    if (sermonSegs.length >= 2) {
      sermonSegs.forEach((seg, i) => out.push({ sermon: s, seg, sid: `${s.slug}--s${i + 1}` }))
    } else {
      out.push({ sermon: s, seg: null, sid: s.slug })
    }
  }
  return out
}

function sermonUnitGrid(id: string, units: SermonUnit[], active: boolean, groupLabel: string): string {
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'} data-shown="${PAGE_INITIAL}">
                        <h3 class="watch-group-label" aria-hidden="true">${groupLabel}<span class="watch-group-count" data-group-count></span></h3>
                        <div class="watch-grid">
                        ${units
                          .map((u) => (u.seg ? sermonSegmentCard(u.sermon, u.seg, u.sid) : messageCard(u.sermon, u.sid)))
                          .join('\n                        ')}
                        </div>
                        ${moreButton(units.length)}
                    </div>`
}

function songGrid(id: string, songItems: SongItem[], active: boolean, groupLabel: string): string {
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'} data-shown="${PAGE_INITIAL}">
                        <h3 class="watch-group-label" aria-hidden="true">${groupLabel}<span class="watch-group-count" data-group-count></span></h3>
                        <div class="watch-grid">
                        ${songItems.map((it, i) => songCard(it.sermon, it.song, it.count, 'song-' + i, it.occurrences)).join('\n                        ')}
                        </div>
                        ${moreButton(songItems.length)}
                    </div>`
}

/**
 * One searchable item, all fields matched lowercased. Beyond title/speaker/topic/
 * summary/tags, the index carries the dimensions a visitor actually reaches for:
 *   sc — scripture, ENRICHED (book + standard abbreviations + numbered-book and
 *        book+chapter glued tokens) so "Romans 8", "1 John", "matt", "ps 23" all hit.
 *   dt — the service date as words ("june 2026 22") so a month/year/day finds it.
 *   ch — distinctive chapter content (segment-type labels like "testimony" /
 *        "benediction", plus filtered chapter titles + message-chapter notes) so a
 *        thing published in a chapter but not the top summary is still findable.
 */
type SearchEntry = { i: string; t: string; ti: string; wh: string; to: string[]; su: string; sc: string[]; tg: string[]; dt: string; ch: string[]; k?: string }

// Boilerplate in the raw YouTube livestream titles ("LIVE - Sunday Morning
// 9:00am | 5/3/2026 | Morning Star Church of Boise") is identical week to week,
// so indexing it makes every message match generic words AND fuzzy-match
// near-words (the classic: "love" matching "live" in every title). Strip it
// from the SEARCH title only — the visible card title is untouched, and a real
// remainder (if a service ever gets a meaningful title) still indexes. Songs
// keep their real titles, which ARE the searchable content.
const TITLE_NOISE = new Set([
  'live', 'sunday', 'morning', 'am', 'pm', 'service', 'star', 'church', 'of',
  'boise', 'christian', 'morningstar', 'livestream', 'stream',
])
function cleanMessageTitle(t: string): string {
  return t
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter((w) => w && !TITLE_NOISE.has(w) && !/^\d/.test(w))
    .join(' ')
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

/**
 * The service date as searchable words, in the church's timezone so it matches the
 * date shown on the card. Month name + year + day ("june 2026 22"); "jun"/"june
 * 2026"/"june 22" all hit via the prefix matcher. Month names don't collide with
 * scripture or topics, so this stays high-precision.
 */
function dateSearchText(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Boise', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const month = MONTHS[(parseInt(get('month'), 10) || 0) - 1] ?? ''
  return [month, get('year'), get('day')].filter(Boolean).join(' ')
}

// Standard non-obvious Bible abbreviations a visitor might type. Prefix-style
// abbreviations ("gen", "rom", "rev", "matt", "ps") already work through the
// prefix matcher, so this map carries the SHORT / non-prefix ones that wouldn't
// ("mt", "mk", "lk", "jn", "dt", "rm") plus the singular/plural Psalm pair.
const BOOK_ALIASES: Record<string, string[]> = {
  genesis: ['gen', 'gn'], exodus: ['exod', 'exo'], leviticus: ['lev', 'lv'],
  numbers: ['num', 'nm'], deuteronomy: ['deut', 'dt'], joshua: ['josh', 'jos'],
  psalm: ['ps', 'psa', 'psalms'], psalms: ['ps', 'psa', 'psalm'], proverbs: ['prov', 'prv'],
  ecclesiastes: ['eccl', 'ecc'], isaiah: ['isa'], jeremiah: ['jer'],
  ezekiel: ['ezek', 'eze'], daniel: ['dan', 'dn'], matthew: ['matt', 'mt'],
  mark: ['mk', 'mrk'], luke: ['lk', 'luk'], john: ['jn', 'jhn'], acts: ['ac'],
  romans: ['rom', 'rm'], corinthians: ['cor', 'co'], galatians: ['gal'],
  ephesians: ['eph'], philippians: ['phil', 'php'], colossians: ['col'],
  thessalonians: ['thess', 'thes'], timothy: ['tim'], titus: ['tit'],
  philemon: ['philem', 'phm'], hebrews: ['heb'], james: ['jas'],
  peter: ['pet', 'pt'], revelation: ['rev', 'rv', 'apocalypse'],
  zechariah: ['zech'], malachi: ['mal'], nehemiah: ['neh'], habakkuk: ['hab'], haggai: ['hag'],
}

/**
 * A scripture reference expanded into every token a visitor might search it by.
 * "1 Corinthians 12:4-11" -> corinthians, cor, co, 1corinthians, 1cor, 1co,
 * corinthians12, 1corinthians12, 12, 4, 11. "Matthew 6:9-13" -> matthew, matt,
 * mt, matthew6, 6, 9, 13. The glued book+chapter / ordinal+book tokens are how
 * single-digit chapters ("Matthew 6", "1 John") survive the query's >=2-length
 * filter once the query parser glues the same way (see parse() / search-harness).
 */
function scriptureSearchText(refs: string[]): string[] {
  const out = new Set<string>()
  for (const raw of refs) {
    const ref = (raw || '').toLowerCase().trim()
    if (!ref) continue
    const m = ref.match(/^(?:([123])\s+)?([a-z]+)\s*(\d+)?/)
    if (m) {
      const ord = m[1]
      const book = m[2]
      const chap = m[3]
      const aliases = BOOK_ALIASES[book] ?? []
      out.add(book)
      for (const a of aliases) out.add(a)
      if (ord) {
        out.add(ord + book)
        for (const a of aliases) out.add(ord + a)
      }
      if (chap) {
        out.add(book + chap)
        if (ord) out.add(ord + book + chap)
      }
    }
    for (const n of ref.match(/\d+/g) ?? []) out.add(n)
  }
  return [...out]
}

// Chapter text is recall, not the headline — so index only what's distinctive.
// Distinctive segment TYPES become searchable structure ("testimony", "poem",
// "benediction"); the ubiquitous structure of every service (welcome, worship,
// prayer, the offering) is dropped so it can't match everything. SUBSTANTIVE
// chapters also contribute their note words. Everything is filtered against the
// title boilerplate + these ubiquitous words so generic terms never leak in
// (and the "boilerplate stays quiet" guarantee holds).
const DISTINCTIVE_SEG = new Set(['testimony', 'poem', 'benediction', 'communion', 'baptism'])
const SUBSTANTIVE_SEG = new Set(['sermon', 'discussion', 'testimony', 'poem', 'scripture'])
const UBIQUITOUS = new Set([
  'worship', 'welcome', 'opening', 'closing', 'offering', 'announcement', 'announcements',
  'prayer', 'scripture', 'sermon', 'discussion', 'message', 'teaching', 'teaches', 'preaches',
  'preached', 'reading', 'reads', 'read', 'song', 'songs', 'sing', 'sings', 'sung', 'singing',
  'special', 'music', 'meet', 'greet', 'greets', 'greeting', 'congregation', 'brother', 'sister',
  'pastor', 'god', 'jesus', 'christ', 'lord', 'today', 'week', 'weeks', 'services', 'members',
  'member', 'share', 'shares', 'sharing', 'gather', 'gathers', 'opens', 'closes', 'begins',
])
// Common function words — they can never be searched for (the query parser drops
// them as stop words) so indexing them in chapter text is pure dead weight.
const CH_STOP = new Set([
  'and', 'the', 'with', 'for', 'from', 'that', 'this', 'then', 'his', 'her', 'our', 'you', 'are',
  'was', 'has', 'had', 'have', 'will', 'not', 'but', 'all', 'any', 'out', 'who', 'how', 'into',
  'over', 'about', 'they', 'them', 'their', 'been', 'were', 'than', 'also', 'such', 'only', 'very',
  'just', 'like', 'some', 'more', 'most', 'each', 'both', 'upon', 'onto', 'off', 'yet', 'its',
])
function chapterSearchText(segments: PublishedSermon['segments']): string[] {
  const out = new Set<string>()
  const add = (text: string) => {
    for (const w of (text || '').toLowerCase().split(/[^a-z0-9']+/)) {
      if (w.length < 3 || /^\d+$/.test(w) || TITLE_NOISE.has(w) || UBIQUITOUS.has(w) || CH_STOP.has(w)) continue
      out.add(w)
    }
  }
  for (const seg of segments) {
    if (DISTINCTIVE_SEG.has(seg.type)) out.add(seg.type)
    add(seg.title)
    if (SUBSTANTIVE_SEG.has(seg.type)) add(seg.summary)
    // Sub-chapter titles are real, distinctive content (a topic the message worked
    // through), so a search for that part finds the service.
    for (const c of seg.children || []) add(c.title)
  }
  return [...out]
}

// The summary is a recall field, but indexing the livestream boilerplate it
// inevitably contains ("...the Sunday service in Boise...", "...a Christian
// home...") lets generic words match real messages. Strip the same title noise
// from the indexed summary; the visible card summary (sermon.summary) is untouched.
function summarySearchText(s: PublishedSermon): string {
  const raw = s.summary || s.seo?.description || ''
  return raw.toLowerCase().split(/[^a-z0-9']+/).filter((w) => w && !TITLE_NOISE.has(w)).join(' ')
}

function messageEntry(s: PublishedSermon): SearchEntry {
  const scripture = [...new Set(s.segments.flatMap((seg) => seg.scriptureRefs || []))]
  return {
    i: s.slug,
    t: s.format,
    ti: cleanMessageTitle(s.title),
    wh: s.speakers.join(' '),
    to: s.topics || [],
    su: summarySearchText(s),
    sc: scriptureSearchText(scripture),
    tg: s.seo?.tags || [],
    dt: dateSearchText(s.publishedAt),
    ch: chapterSearchText(s.segments),
  }
}

/** Search entry for ONE sermon of a split multi-sermon service: keyed to its card's
 *  sid, with that sermon's own title/speaker/summary/scripture so it's found on its
 *  own terms (searching "Dmitri" or "Walking in Wisdom" returns just that card). */
function sermonSegmentEntry(
  s: PublishedSermon,
  seg: PublishedSermon['segments'][number],
  sid: string,
): SearchEntry {
  const speakers = seg.speakers && seg.speakers.length > 0 ? seg.speakers : s.speakers
  return {
    i: sid,
    t: 'sermon',
    ti: cleanMessageTitle(cleanSegmentTitle(seg.title)),
    wh: speakers.join(' '),
    to: s.topics || [],
    su: (seg.summary || '')
      .toLowerCase()
      .split(/[^a-z0-9']+/)
      .filter((w) => w && !TITLE_NOISE.has(w))
      .join(' '),
    sc: scriptureSearchText(seg.scriptureRefs || []),
    tg: s.seo?.tags || [],
    dt: dateSearchText(s.publishedAt),
    ch: chapterSearchText([seg]),
  }
}

function renderLibrary(items: PublishedSermon[]): string {
  const sermons = items.filter((s) => s.format !== 'discussion')
  // A service with two+ sermons becomes one card per sermon; the Sermons tab, its
  // topic filter, and the search index all key off these units, not the services.
  const sermonUnits = expandSermonUnits(sermons)
  const discussions = items.filter((s) => s.format === 'discussion')
  // Songs recur week to week, so de-dupe by title: one card per unique song,
  // its newest occurrence, with a count. (items is newest-first, so the first
  // time we see a title is the most recent one.)
  const byTitle = new Map<string, SongItem>()
  for (const s of items) {
    for (const song of s.songs) {
      const k = song.title.trim().toLowerCase()
      const occ: SongOccurrence = {
        videoId: s.youtubeVideoId,
        slug: s.slug,
        startSec: song.startSec,
        endSec: song.endSec,
        durationSec: s.durationSec ?? 0,
        date: shortDate(s.publishedAt),
        leader: song.leader,
      }
      const ex = byTitle.get(k)
      // items is newest-first, so the first time we see a title is its newest
      // occurrence (the card default); later ones append in descending order.
      if (ex) {
        ex.count++
        ex.occurrences.push(occ)
      } else {
        byTitle.set(k, { sermon: s, song, count: 1, occurrences: [occ] })
      }
    }
  }
  const songItems: SongItem[] = [...byTitle.values()]

  // One content type at a time. Sermons lead, then Songs, then Discussions.
  // Each tab owns a chip filter (rendered into the shared rail) AND a grid panel;
  // the rail's active chips + the active grid switch together when the tab changes.
  const tabs: {
    id: string
    label: string
    count: number
    filter: (active: boolean) => string
    panel: (active: boolean) => string
  }[] = []
  if (sermonUnits.length > 0)
    tabs.push({ id: 'sermons', label: 'Sermons', count: sermonUnits.length, filter: (a) => topicFilter('sermons', a, sermonUnits.map((u) => u.sermon)), panel: (a) => sermonUnitGrid('sermons', sermonUnits, a, 'Sermons') })
  if (songItems.length > 0)
    tabs.push({ id: 'songs', label: 'Songs', count: songItems.length, filter: (a) => songFilter('songs', a, songItems), panel: (a) => songGrid('songs', songItems, a, 'Songs') })
  if (discussions.length > 0)
    tabs.push({ id: 'discussions', label: 'Discussions', count: discussions.length, filter: (a) => topicFilter('discussions', a, discussions), panel: (a) => messageGrid('discussions', discussions, a, 'Discussions') })
  if (tabs.length === 0) return ''

  // The search index: every searchable item (messages + songs) keyed to its card's
  // data-sid. Built from the same data the cards render, so it can never drift.
  const searchIndex: SearchEntry[] = [
    ...sermonUnits.map((u) => (u.seg ? sermonSegmentEntry(u.sermon, u.seg, u.sid) : messageEntry(u.sermon))),
    ...discussions.map(messageEntry),
    ...songItems.map((it, i): SearchEntry => ({
      i: 'song-' + i,
      t: 'song',
      ti: it.song.title,
      wh: it.song.leader || '',
      to: it.song.topic ? [it.song.topic] : [],
      su: '',
      sc: [],
      tg: [],
      dt: dateSearchText(it.sermon.publishedAt),
      ch: [],
      k: it.song.kind,
    })),
  ]

  const multi = tabs.length > 1
  // The sliding gold ink under the tabs (with a downward caret) signals which
  // tab the chips below belong to; JS positions it under the active tab and it
  // slides on switch. Only rendered when there is more than one tab.
  const tabBar = multi
    ? `<div class="watch-tabs" role="tablist" aria-label="Library">
                        ${tabs
                          .map(
                            (t, i) =>
                              `<button class="watch-tab" type="button" role="tab" id="tab-${t.id}" data-panel="${t.id}" aria-controls="panel-${t.id}" aria-selected="${i === 0 ? 'true' : 'false'}">${t.label}<span class="watch-tab-count">${t.count}</span></button>`,
                          )
                          .join('\n                        ')}
                        <span class="watch-tab-ink" aria-hidden="true"></span>
                    </div>`
    : ''
  // Shared chip rail: every tab's filter, only the active one shown. Pulling the
  // chips out of the panels lets them fade/slide + resize on tab switch instead
  // of the page cutting to a new layout.
  const chipRail = `<div class="watch-chips-rail" id="watch-chips-rail">
                        ${tabs.map((t, i) => t.filter(i === 0)).join('\n                        ')}
                    </div>`
  const panels = tabs.map((t, i) => t.panel(i === 0)).join('\n                    ')

  return `<section id="library" aria-label="Library">
                    <span class="section-eyebrow">Library</span>
                    <h2 class="section-heading">Find a message.</h2>
                    <p class="section-lead watch-library-lead">Tap any message to play just the part you came for.</p>
                    <div class="watch-search">
                        <svg class="watch-search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M10 4a6 6 0 104.47 10.03l4.24 4.25 1.42-1.42-4.25-4.24A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" fill="currentColor"/></svg>
                        <input id="watch-search-input" class="watch-search-input" type="search" inputmode="search" autocomplete="off" enterkeyhint="search" placeholder="Search a topic, passage, date, song, or speaker" aria-label="Search the library">
                        <button class="watch-search-clear" id="watch-search-clear" type="button" aria-label="Clear search" hidden>&times;</button>
                    </div>
                    <p class="watch-search-summary" id="watch-search-summary" role="status" aria-live="polite" hidden></p>
                    ${tabBar}
                    ${chipRail}
                    ${panels}
                    <script type="application/json" id="watch-search-index">${JSON.stringify(searchIndex)}</script>
                </section>`
}

/**
 * Client wiring for the "sung N times" recurrence dropdown on song cards. Opens on
 * tap (toggles .is-open; hover/focus is handled by CSS on fine pointers), closes on
 * outside-click / Escape, and — when a date is chosen — re-points THIS card's player
 * at that service's clip (same data-attr swap the hub date selector uses) and plays
 * it inside the tap gesture so it starts with sound. Idempotent + delegated, so it
 * survives the tab/filter show-more re-rendering.
 */
function watchSongMenuScript(): string {
  return `<script>
            (function () {
                function menuOf(trigger) { return trigger.parentNode ? trigger.parentNode.querySelector('.watch-song-occ') : null; }
                function setOpen(trigger, open) {
                    if (!trigger) return;
                    trigger.setAttribute('aria-expanded', String(open));
                    var m = menuOf(trigger); if (m) m.classList.toggle('is-open', open);
                }
                function closeAll(except) {
                    document.querySelectorAll('.watch-song-times[aria-expanded="true"]').forEach(function (b) {
                        if (b !== except) setOpen(b, false);
                    });
                }
                // A mouse hover opens the menu (desktop) — but ONLY for a real mouse,
                // never touch/pen — so a tap on a hybrid touch+hover laptop drives the
                // SAME .is-open state as everywhere else (no CSS :hover fighting the
                // tap-toggle). pointerenter/leave don't bubble, so bind per wrap; the
                // song cards are all server-rendered, so they're present at load.
                document.querySelectorAll('.watch-song-times-wrap').forEach(function (wrap) {
                    var trg = wrap.querySelector('.watch-song-times');
                    wrap.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { closeAll(trg); setOpen(trg, true); } });
                    wrap.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') setOpen(trg, false); });
                });
                document.addEventListener('click', function (e) {
                    var t = e.target.closest ? e.target.closest('.watch-song-times') : null;
                    var item = e.target.closest ? e.target.closest('.watch-song-occ-item') : null;
                    if (t) {
                        e.preventDefault();
                        var open = t.getAttribute('aria-expanded') === 'true';
                        closeAll(t);
                        setOpen(t, !open);
                        return;
                    }
                    if (item) {
                        e.preventDefault(); e.stopPropagation();
                        var card = item.closest('.watch-card');
                        var vp = card && card.querySelector('.vplayer');
                        if (vp) {
                            vp.setAttribute('data-video', item.getAttribute('data-video') || '');
                            vp.setAttribute('data-start', item.getAttribute('data-start') || '0');
                            vp.setAttribute('data-end', item.getAttribute('data-end') || '0');
                            vp.setAttribute('data-duration', item.getAttribute('data-dur') || '0');
                            if (vp.__resetPlayer) vp.__resetPlayer();
                            var menu = item.closest('.watch-song-occ');
                            if (menu) menu.querySelectorAll('.watch-song-occ-item').forEach(function (it) { it.removeAttribute('aria-current'); });
                            item.setAttribute('aria-current', 'true');
                            var trg = card.querySelector('.watch-song-times');
                            if (trg) trg.setAttribute('aria-expanded', 'false');
                            if (menu) menu.classList.remove('is-open');
                            // Play the chosen clip now, inside this tap gesture (so it gets sound).
                            var poster = vp.querySelector('.vplayer-poster');
                            if (poster) poster.click();
                        }
                        return;
                    }
                    closeAll(null);
                });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape' || e.key === 'Esc') closeAll(null);
                });
            })();
        </script>`
}

export const watchBody = (view: WatchHubView): string => {
  const library = view.mode === 'library' && view.items.length > 0
  return `
    <style>
        .watch-feature-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    </style>
    <body class="page-subpage">
        <script>
            /* Seamless arrival from the home "play" tap (/watch?play=1). Before the
               cross-document view-transition snapshot is captured, position the feature
               player so its CENTER sits exactly where the home thumbnail's center was on
               screen (passed via sessionStorage). The shared-element morph then keeps the
               video anchored in place and only SCALES it up to the feature size while the
               rest of the page crossfades in around it — no slide, no jump. A capped top
               spacer covers the case where the feature would otherwise sit too high to
               reach that point. Falls back to a simple under-the-nav scroll if there's no
               fresh home rect. Runs in pagereveal (VT path) + DOMContentLoaded (no-VT). */
            (function () {
                try {
                    // Mark JS-on pre-paint: the library's "Show more" collapse keys off
                    // html.watch-js, so without JS every card stays visible (crawlers + no-JS
                    // see the whole archive) and there's no first-paint flash with it.
                    document.documentElement.classList.add('watch-js');
                    if (new URLSearchParams(location.search).get('play') !== '1') return;
                    document.documentElement.classList.add('watch-play-arrival');
                    var placed = false;
                    function place() {
                        var el = document.querySelector('.vplayer--feature .vplayer-stage, .watch-feature-thumb');
                        if (!el) return;
                        placed = true;
                        var sec = document.getElementById('latest');
                        if (sec) sec.style.paddingTop = '';   // clear any prior spacer before measuring
                        var rect = el.getBoundingClientRect();
                        var natTop = rect.top + (window.pageYOffset || 0);
                        var stored = null;
                        try { stored = JSON.parse(sessionStorage.getItem('mscb:vhero') || 'null'); } catch (e) {}
                        if (stored && stored.cy != null && (Date.now() - stored.ts) < 12000) {
                            var natCenter = natTop + rect.height / 2;
                            var spacer = Math.min(260, Math.max(0, Math.round(stored.cy - natCenter)));
                            if (sec && spacer > 0) sec.style.paddingTop = spacer + 'px';
                            window.scrollTo(0, Math.max(0, Math.round(natCenter + spacer - stored.cy)));
                        } else {
                            var off = (window.innerWidth <= 960) ? 80 : 96;
                            window.scrollTo(0, Math.max(0, Math.round(natTop - off)));
                        }
                    }
                    addEventListener('pagereveal', place);
                    if (document.readyState === 'loading') addEventListener('DOMContentLoaded', function () { if (!placed) place(); });
                    else place();
                } catch (e) {}
            })();
        </script>
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section id="watch-intro">
                    <h1 class="section-heading">Watch, anytime.</h1>
                    <p class="subpage-intro-lead">Missed a Sunday, or want to sit with a message again? Watch a whole service, or jump straight to a sermon or discussion by topic. Each one plays right here, nothing to sign up for.</p>
                    <nav class="subpage-jump subpage-jump--short-set" aria-label="Jump to a section">
                        <a href="#latest">Latest service</a>
                        ${library ? '<a href="#library">Find a message</a>' : ''}
                        <span class="subpage-jump-break" aria-hidden="true"></span>
                        <a href="#watch-cta">Visit</a>
                    </nav>
                </section>

                ${library ? renderServiceSelector(view) : renderFallbackFeature(view)}

                ${library ? renderLibrary(view.items) : ''}

                <section id="watch-cta" class="subpage-final-cta">
                    <span class="section-eyebrow">In person</span>
                    <h2 class="section-heading">Even better in the room.</h2>
                    <p class="subpage-final-cta-lead">Online is a great place to start. When you are ready, the seat next to us is open: Sundays at 9 in West Boise, with free breakfast after.</p>
                    <a class="event-link-btn teaser-cta" href="/visit">Plan a Visit</a>
                </section>
            </main>

            ${footer()}
        </div>
        ${library ? watchPlayerScript() : ''}
        ${library ? watchSongMenuScript() : ''}
        <script>
            (function () {
                var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

                /* --- Chip rail collapse: count-sorted, three rows, with an inline expand.
                   Expand is additive — it reveals the rest of the chips in the SAME count
                   order (the chips you were reading never jump), and an active chip from
                   the overflow is pinned right after All so it never vanishes on collapse.
                   Every chip is in the DOM — this only hides the overflow. --- */
                var ChipCollapse = (function () {
                    var railEl = document.getElementById('watch-chips-rail');
                    function rowLimit() { return 3; }
                    function valueChips(f) {
                        return Array.prototype.filter.call(f.querySelectorAll('.watch-chip'), function (c) {
                            return !c.hasAttribute('data-chip-toggle') && c.getAttribute('data-val') !== 'all';
                        });
                    }
                    function toggleBtn(f) { return f.querySelector('[data-chip-toggle]'); }
                    function activeChip(f) {
                        return f.querySelector('.watch-chip[aria-pressed="true"]:not([data-chip-toggle]):not([data-val="all"])');
                    }
                    // Distinct row count of the laid-out chips. The separator is vertically
                    // centered (its own offsetTop), so it's skipped; remaining tops are
                    // bucketed with a tolerance so sub-pixel jitter never invents a row.
                    function rowCount(f) {
                        var tops = [];
                        Array.prototype.forEach.call(f.children, function (el) {
                            if (el.offsetParent === null) return;
                            if (el.classList.contains('watch-chip-sep')) return;
                            tops.push(el.offsetTop);
                        });
                        tops.sort(function (a, b) { return a - b; });
                        var n = 0, last = -999;
                        for (var i = 0; i < tops.length; i++) { if (tops[i] - last > 6) { n++; last = tops[i]; } }
                        return n;
                    }
                    function measureOrder(f, pin) {
                        var all = f.querySelector('.watch-chip[data-val="all"]'); if (all) all.style.order = '-3';
                        var sep = f.querySelector('.watch-chip-sep'); if (sep) sep.style.order = '-2';
                        valueChips(f).forEach(function (c) { c.style.order = ''; });
                        if (pin) pin.style.order = '-1';
                    }
                    // Greedily keep the leading chips that fit rowLimit rows WITH the toggle
                    // present (its space reserved). pin, if given, is forced visible first.
                    function measureKeep(f, pin) {
                        var chips = valueChips(f), tgl = toggleBtn(f), limit = rowLimit();
                        measureOrder(f, pin);
                        chips.forEach(function (c) { c.classList.remove('is-overflow'); });
                        if (tgl) tgl.hidden = true;
                        if (rowCount(f) <= limit) return { keep: chips.slice(), overflow: false };
                        if (tgl) tgl.hidden = false;
                        chips.forEach(function (c) { if (c !== pin) c.classList.add('is-overflow'); });
                        var keep = pin ? [pin] : [];
                        for (var i = 0; i < chips.length; i++) {
                            var c = chips[i]; if (c === pin) continue;
                            c.classList.remove('is-overflow');
                            if (rowCount(f) > limit) { c.classList.add('is-overflow'); break; }
                            keep.push(c);
                        }
                        return { keep: keep, overflow: true };
                    }
                    // Pure: returns the keep list + pin + overflow count, restoring the DOM.
                    function fit(f) {
                        var act = activeChip(f), chips = valueChips(f), tgl = toggleBtn(f);
                        var snapO = Array.prototype.map.call(f.children, function (el) { return [el, el.style.order]; });
                        var snapV = chips.map(function (c) { return [c, c.classList.contains('is-overflow')]; });
                        var snapH = tgl ? tgl.hidden : null;
                        var r = measureKeep(f, null), pin = null, keep = r.keep, overflow = r.overflow;
                        if (act && overflow && keep.indexOf(act) === -1) {
                            var r2 = measureKeep(f, act); keep = r2.keep; overflow = r2.overflow; pin = act;
                        }
                        snapO.forEach(function (p) { p[0].style.order = p[1]; });
                        snapV.forEach(function (p) { p[0].classList.toggle('is-overflow', p[1]); });
                        if (tgl) tgl.hidden = snapH;
                        return { keep: keep, pin: pin, hasOverflow: overflow, count: chips.length - keep.length };
                    }
                    function order(f, pin) {
                        var all = f.querySelector('.watch-chip[data-val="all"]'); if (all) all.style.order = '-3';
                        var sep = f.querySelector('.watch-chip-sep'); if (sep) sep.style.order = '-2';
                        valueChips(f).forEach(function (c) { c.classList.remove('is-pinned'); c.style.order = ''; });
                        if (pin) { pin.style.order = '-1'; pin.classList.add('is-pinned'); }
                    }
                    function setToggle(f, expanded, n) {
                        var t = toggleBtn(f); if (!t) return;
                        if (expanded) { t.hidden = false; t.setAttribute('aria-expanded', 'true'); t.setAttribute('aria-label', 'Show fewer topics'); }
                        else if (n > 0) {
                            t.hidden = false; t.setAttribute('aria-expanded', 'false'); t.setAttribute('aria-label', n + ' more topics');
                            var ns = t.querySelector('.watch-chip-toggle-n'); if (ns) ns.textContent = String(n);
                        } else { t.hidden = true; }
                    }
                    function applyCollapsed(f) {
                        if (!f) return;
                        var ft = fit(f);
                        order(f, ft.pin);
                        valueChips(f).forEach(function (c) { c.classList.toggle('is-overflow', ft.keep.indexOf(c) === -1); });
                        f.classList.remove('is-expanded');
                        setToggle(f, false, ft.count);
                    }
                    function applyExpanded(f) {
                        valueChips(f).forEach(function (c) { c.classList.remove('is-overflow'); });
                        order(f, null);   // same count order, pins cleared — expand only reveals
                        f.classList.add('is-expanded');
                        setToggle(f, true, 0);
                    }
                    // FLIP: survivors glide to their new slots, newly-shown chips fade/stagger
                    // in, and the rail height eases across. Newly-hidden chips are faded out
                    // by the caller first so they never pop. Reduced motion = instant.
                    function animate(f, mutate) {
                        if (reduce || !railEl) { mutate(); return; }
                        if (railEl.__cleanup) railEl.__cleanup();
                        var SEL = '.watch-chip, .watch-chip-sep';
                        var first = new Map();
                        f.querySelectorAll(SEL).forEach(function (el) { if (el.offsetParent) first.set(el, el.getBoundingClientRect()); });
                        var h1 = railEl.offsetHeight;
                        mutate();
                        // Natural target height, measured BEFORE we pin the start height —
                        // collapse shrinks it, expand grows it. (scrollHeight after pinning
                        // h1 would report h1 on collapse, so the height never animated and
                        // the content below cut at cleanup.)
                        var h2 = railEl.offsetHeight;
                        var els = Array.prototype.filter.call(f.querySelectorAll(SEL), function (el) { return el.offsetParent; });
                        var rev = 0, moved = [];
                        els.forEach(function (el) {
                            var fr = first.get(el), l = el.getBoundingClientRect();
                            if (fr) {
                                var dx = fr.left - l.left, dy = fr.top - l.top;
                                if (dx || dy) { el.style.transition = 'none'; el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; el.__d = 0; moved.push(el); }
                            } else {
                                el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translateY(8px)';
                                el.__d = Math.min(rev++, 12) * 22; moved.push(el);
                            }
                        });
                        railEl.style.height = h1 + 'px'; railEl.style.overflow = 'hidden'; railEl.style.transition = 'none';
                        void railEl.offsetWidth;
                        railEl.style.transition = 'height var(--motion-medium) var(--ease-out-soft)';
                        railEl.style.height = h2 + 'px';
                        moved.forEach(function (el) {
                            el.style.transition = 'transform var(--motion-medium) var(--ease-out-soft) ' + el.__d + 'ms, opacity 280ms var(--ease-out-soft) ' + el.__d + 'ms';
                            el.style.transform = ''; el.style.opacity = '';
                        });
                        var t = setTimeout(function () { if (railEl.__cleanup) railEl.__cleanup(); }, 780);
                        railEl.__cleanup = function () {
                            clearTimeout(t); railEl.__cleanup = null;
                            moved.forEach(function (el) { el.style.transition = ''; el.style.transform = ''; el.style.opacity = ''; el.__d = null; });
                            railEl.style.height = ''; railEl.style.overflow = ''; railEl.style.transition = '';
                        };
                    }
                    function expand(f) { animate(f, function () { applyExpanded(f); }); }
                    function collapse(f) {
                        var ft = fit(f);
                        var hide = valueChips(f).filter(function (c) { return ft.keep.indexOf(c) === -1; });
                        if (reduce || hide.length === 0) { applyCollapsed(f); return; }
                        hide.forEach(function (c) { c.classList.add('is-chip-out'); });
                        setTimeout(function () {
                            animate(f, function () { hide.forEach(function (c) { c.classList.remove('is-chip-out'); }); applyCollapsed(f); });
                        }, 150);
                    }
                    function toggle(f) { if (f.classList.contains('is-expanded')) collapse(f); else expand(f); }
                    function init() {
                        if (!railEl) return;
                        applyCollapsed(railEl.querySelector('.watch-filter.is-active'));
                    }
                    // After a selection: if a previously pinned (overflow) chip is no longer
                    // the active one, re-fit so the stale pin returns to its count slot.
                    function refresh(f) {
                        if (!f || f.classList.contains('is-expanded')) return;
                        var pinned = f.querySelector('.watch-chip.is-pinned');
                        if (pinned && pinned !== activeChip(f)) animate(f, function () { applyCollapsed(f); });
                    }
                    // Width crossed the mobile/desktop line (2<->3 rows) — re-fit the
                    // active collapsed filter. Expanded filters already show every chip.
                    function onResize() {
                        if (!railEl) return;
                        var f = railEl.querySelector('.watch-filter.is-active');
                        if (f && !f.classList.contains('is-expanded')) applyCollapsed(f);
                    }
                    return { init: init, applyCollapsed: applyCollapsed, toggle: toggle, refresh: refresh, onResize: onResize };
                })();

                /* --- Full-service selector --- */
                var feature = document.getElementById('service-feature');
                var dataEl = document.getElementById('services-data');
                if (feature && dataEl) {
                    var data = [];
                    try { data = JSON.parse(dataEl.textContent || '[]'); } catch (e) {}
                    var idx = 0;
                    var vp = feature.querySelector('.vplayer');
                    var img = feature.querySelector('.vplayer-poster img');
                    var title = document.getElementById('feature-title');
                    var meta = document.getElementById('feature-meta');
                    var blurb = document.getElementById('feature-blurb');
                    var fulllink = document.getElementById('feature-fulllink');
                    var list = document.getElementById('feature-list');
                    // Feed the hero scrubber the starting service's chapters (markers + the
                    // hover/scrub label). Swapping services re-feeds it inside paint().
                    if (vp && vp.__setChapters) vp.__setChapters((data[0] || {}).chapters);

                    function paint(i, scroll) {
                        var s = data[i]; if (!s) return;
                        idx = i;
                        var apply = function () {
                            // Point the inline player at the new service (full video),
                            // reset it to the poster so the next play loads it.
                            if (vp) {
                                vp.setAttribute('data-video', s.videoId);
                                vp.setAttribute('data-duration', String(s.dur || 0));
                                vp.setAttribute('data-start', '0'); vp.setAttribute('data-end', '0');
                                if (vp.__resetPlayer) vp.__resetPlayer();
                                if (vp.__setChapters) vp.__setChapters(s.chapters || []);
                            }
                            if (img) { img.src = s.poster; img.onerror = function () { this.onerror = null; this.src = 'https://img.youtube.com/vi/' + s.videoId + '/hqdefault.jpg'; }; }
                            title.textContent = s.title; meta.textContent = s.meta; blurb.textContent = s.blurb;
                            // An archived (segmented) service reveals + points the hero link at its
                            // chaptered permalink; the live service (no slug) plays inline with no
                            // link, so the link hides when it's selected.
                            if (fulllink) {
                                if (s.slug) { fulllink.hidden = false; fulllink.href = '/watch/' + s.slug; fulllink.innerHTML = 'Chapters &amp; transcript<span aria-hidden="true"> &rarr;</span>'; }
                                else { fulllink.hidden = true; }
                            }
                        };
                        if (reduce) { apply(); }
                        else { feature.classList.add('is-swapping'); setTimeout(function () { apply(); requestAnimationFrame(function () { feature.classList.remove('is-swapping'); }); }, 160); }
                        if (list) list.querySelectorAll('.watch-svc-row').forEach(function (b, j) { var on = j === i; b.classList.toggle('is-current', on); b.setAttribute('aria-current', on ? 'true' : 'false'); });
                        // Bring the freshly-loaded player into view (the index sits below it).
                        if (scroll) {
                            try {
                                var top = feature.getBoundingClientRect().top + window.pageYOffset - 96;
                                window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
                            } catch (e) { feature.scrollIntoView(); }
                        }
                    }
                    if (list) {
                        list.addEventListener('click', function (e) {
                            var b = e.target.closest('.watch-svc-row'); if (!b) return;
                            paint(parseInt(b.getAttribute('data-i'), 10) || 0, true);
                        });
                    }
                }

                /* --- Library tabs + shared animated chip rail + per-tab filter --- */
                var tablist = document.querySelector('.watch-tabs');
                var chipsRail = document.getElementById('watch-chips-rail');
                var tabInk = document.querySelector('.watch-tab-ink');
                function fadeGrid(grid, apply) {
                    if (!grid || reduce) { apply(); return; }
                    grid.classList.add('is-fading');
                    setTimeout(function () { apply(); requestAnimationFrame(function () { grid.classList.remove('is-fading'); }); }, 200);
                }

                // The sliding gold ink (underline + downward caret) sits under the
                // active tab, pointing at the chips it belongs to. Slides on switch.
                function moveInk(animate) {
                    if (!tabInk || !tablist) return;
                    var act = tablist.querySelector('.watch-tab[aria-selected="true"]');
                    if (!act) return;
                    if (!animate) tabInk.style.transition = 'none';
                    tabInk.style.left = act.offsetLeft + 'px';
                    tabInk.style.width = act.offsetWidth + 'px';
                    tabInk.style.top = (act.offsetTop + act.offsetHeight - 1) + 'px';
                    tabInk.style.opacity = '1';
                    if (!animate) { void tabInk.offsetWidth; tabInk.style.transition = ''; }
                }

                // Swap the rail from the old tab's chips to the new tab's: old chips
                // fade/slide out, the rail height eases to the new set, new chips
                // fade/slide in (staggered). Smooth whether the new tab has more or
                // fewer chips — never a hard cut to a new layout.
                function switchRail(toId) {
                    if (!chipsRail) return;
                    if (chipsRail.__cleanup) chipsRail.__cleanup();
                    var from = chipsRail.querySelector('.watch-filter.is-active');
                    var to = chipsRail.querySelector('.watch-filter[data-panel="' + toId + '"]');
                    if (!to || from === to) return;
                    if (reduce) {
                        if (from) { from.classList.remove('is-active'); from.hidden = true; }
                        to.hidden = false; to.classList.add('is-active');
                        ChipCollapse.applyCollapsed(to);
                        return;
                    }
                    var h1 = chipsRail.offsetHeight;
                    chipsRail.style.height = h1 + 'px';
                    chipsRail.style.overflow = 'hidden';
                    if (from) { from.classList.add('is-anim-out'); from.classList.remove('is-active'); }
                    to.hidden = false; to.classList.add('is-active');
                    ChipCollapse.applyCollapsed(to);  // collapse the incoming tab before measuring its height
                    var h2 = to.offsetHeight;
                    void chipsRail.offsetWidth;       // commit h1 before easing to h2
                    to.classList.add('is-anim-in');   // staggered chip-in keyframes
                    chipsRail.style.height = h2 + 'px';
                    var t = setTimeout(function () { if (chipsRail.__cleanup) chipsRail.__cleanup(); }, 680);
                    chipsRail.__cleanup = function () {
                        clearTimeout(t); chipsRail.__cleanup = null;
                        if (from) { from.classList.remove('is-anim-out'); from.hidden = true; }
                        to.classList.remove('is-anim-in');
                        chipsRail.style.height = ''; chipsRail.style.overflow = '';
                    };
                }

                if (tablist) {
                    moveInk(false);
                    tablist.addEventListener('click', function (e) {
                        var tab = e.target.closest('.watch-tab');
                        if (!tab || tab.getAttribute('aria-selected') === 'true') return;
                        var id = tab.getAttribute('data-panel');
                        var current = document.querySelector('.watch-panel.is-active');
                        var target = document.getElementById('panel-' + id);
                        if (!target || current === target) return;
                        tablist.querySelectorAll('.watch-tab').forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
                        moveInk(true);
                        switchRail(id);
                        if (current) { current.classList.remove('is-active'); current.setAttribute('hidden', ''); }
                        target.classList.add('is-active'); target.removeAttribute('hidden');
                    });
                    // Reposition the ink when layout shifts (web font load, resize).
                    var inkTimer;
                    window.addEventListener('resize', function () { clearTimeout(inkTimer); inkTimer = setTimeout(function () { moveInk(false); }, 120); });
                    window.addEventListener('load', function () { moveInk(false); });
                    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInk(false); });
                }

                /* --- Progressive disclosure: show 6, reveal 12 more per press --- */
                // Every card is in the DOM (SEO + search see all); this only collapses the
                // overflow visually and reveals it in batches. Paging is filter-aware (it
                // counts the cards a filter leaves visible) and bypassed during a search.
                var PAGE_INITIAL = 6, PAGE_BATCH = 12;
                var libEl = document.getElementById('library');
                function panelVisibleCards(panel) {
                    return Array.prototype.filter.call(panel.querySelectorAll('.watch-card'), function (c) {
                        return !c.classList.contains('is-filtered') && !c.classList.contains('is-search-hidden');
                    });
                }
                function setMoreButton(panel, remaining, animateGone) {
                    var wrap = panel.querySelector('[data-more-wrap]');
                    if (!wrap) return;
                    var cnt = wrap.querySelector('.watch-more-count');
                    if (remaining > 0) { wrap.classList.remove('is-exhausted'); wrap.hidden = false; if (cnt) cnt.textContent = ' (' + remaining + ')'; }
                    else if (animateGone) { wrap.hidden = false; wrap.classList.add('is-exhausted'); } // fades + collapses via CSS
                    else { wrap.classList.remove('is-exhausted'); wrap.hidden = true; }
                }
                function applyPaging(panel) {
                    if (!panel) return;
                    panel.classList.add('is-paged'); // hands collapse from the nth-child fallback to is-rest
                    var shown = parseInt(panel.getAttribute('data-shown'), 10) || PAGE_INITIAL;
                    var vis = panelVisibleCards(panel);
                    for (var i = 0; i < vis.length; i++) vis[i].classList.toggle('is-rest', i >= shown);
                    // A filtered/search-hidden card is hidden anyway; don't leave is-rest on it.
                    panel.querySelectorAll('.watch-card.is-filtered.is-rest, .watch-card.is-search-hidden.is-rest').forEach(function (c) { c.classList.remove('is-rest'); });
                    setMoreButton(panel, vis.length - shown, false);
                }
                function pageAll() { if (libEl) libEl.querySelectorAll('.watch-panel').forEach(applyPaging); }
                function resetPaging(panel) { if (panel) { panel.setAttribute('data-shown', String(PAGE_INITIAL)); applyPaging(panel); } }
                // Reveal the next batch. The layout must not open in one frame (that ejects the
                // button + the section below downward instantly); instead animate the grid's
                // HEIGHT from its current to its grown size so everything below travels down
                // smoothly while the new cards fade/slide in over the same window.
                function showMore(panel) {
                    var grid = panel.querySelector('.watch-grid');
                    var shown = parseInt(panel.getAttribute('data-shown'), 10) || PAGE_INITIAL;
                    var vis = panelVisibleCards(panel);
                    var next = vis.slice(shown, shown + PAGE_BATCH); // the cards about to appear
                    var newShown = shown + PAGE_BATCH;
                    panel.setAttribute('data-shown', String(newShown));
                    panel.classList.add('is-paged');
                    var remaining = Math.max(0, vis.length - newShown);
                    if (reduce || !grid) {
                        next.forEach(function (c) { c.classList.remove('is-rest'); });
                        setMoreButton(panel, remaining, false);
                        return;
                    }
                    if (grid.__pageDone) grid.__pageDone();          // settle any in-flight reveal
                    var h1 = grid.offsetHeight;
                    next.forEach(function (c) { c.classList.remove('is-rest'); });
                    var h2 = grid.scrollHeight;
                    grid.style.height = h1 + 'px'; grid.style.overflow = 'hidden';
                    void grid.offsetHeight;                           // commit the start height
                    // Material standard easing (gentle in AND out) so the open doesn't
                    // front-load a big first frame the way a pure ease-out would.
                    grid.style.transition = 'height 0.6s var(--ease-standard)';
                    grid.style.height = h2 + 'px';
                    next.forEach(function (c, i) {
                        c.classList.add('is-revealing'); c.style.animationDelay = (i * 30) + 'ms';
                        setTimeout(function () { c.classList.remove('is-revealing'); c.style.animationDelay = ''; }, 380 + i * 30);
                    });
                    grid.__pageDone = function () { clearTimeout(grid.__pageT); grid.__pageDone = null; grid.style.height = ''; grid.style.overflow = ''; grid.style.transition = ''; };
                    grid.__pageT = setTimeout(grid.__pageDone, 640);
                    setMoreButton(panel, remaining, true);            // animate the button out if exhausted
                }
                if (libEl) libEl.addEventListener('click', function (e) {
                    var b = e.target.closest('[data-more]');
                    if (b) { var panel = b.closest('.watch-panel'); if (panel) showMore(panel); }
                });

                // Each rail filter drives its own panel's grid (chips left the panels).
                function gridForFilter(filter) {
                    var panel = document.getElementById('panel-' + filter.getAttribute('data-panel'));
                    return panel ? panel.querySelector('.watch-grid') : null;
                }
                if (chipsRail) {
                    chipsRail.addEventListener('click', function (e) {
                        var chip = e.target.closest('.watch-chip');
                        if (!chip) return;
                        var filter = chip.closest('.watch-filter');
                        if (!filter) return;
                        if (chip.hasAttribute('data-chip-toggle')) { ChipCollapse.toggle(filter); return; }
                        var grid = gridForFilter(filter);
                        if (!grid) return;
                        var key = filter.getAttribute('data-key') || 'topic';
                        var val = chip.getAttribute('data-val');
                        filter.querySelectorAll('.watch-chip:not([data-chip-toggle])').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
                        // One restrained tactile beat on the chosen chip.
                        chip.classList.remove('is-popping'); void chip.offsetWidth; chip.classList.add('is-popping');
                        fadeGrid(grid, function () {
                            grid.querySelectorAll('.watch-card').forEach(function (card) {
                                var show = val === 'all' || card.getAttribute('data-' + key) === val;
                                card.classList.toggle('is-filtered', !show);
                            });
                            // A new filter is a new set — collapse it back to the first page.
                            resetPaging(grid.closest('.watch-panel'));
                        });
                        // If the active chip changed, drop any stale pin while collapsed.
                        ChipCollapse.refresh(filter);
                    });
                    // Apply each filter's default (e.g. Songs -> Program) on load.
                    chipsRail.querySelectorAll('.watch-filter').forEach(function (filter) {
                        var def = filter.getAttribute('data-default') || 'all';
                        if (def === 'all') return;
                        var grid = gridForFilter(filter);
                        if (!grid) return;
                        var key = filter.getAttribute('data-key') || 'topic';
                        grid.querySelectorAll('.watch-card').forEach(function (card) {
                            card.classList.toggle('is-filtered', card.getAttribute('data-' + key) !== def);
                        });
                    });
                    // Collapse the active filter to its row budget (others collapse lazily
                    // as their tab is shown); re-fit on width changes across the breakpoint.
                    ChipCollapse.init();
                    var chipResizeT;
                    window.addEventListener('resize', function () { clearTimeout(chipResizeT); chipResizeT = setTimeout(ChipCollapse.onResize, 150); });
                }
                // First paint: collapse every tab to its first page (after default filters).
                pageAll();

                /* --- Library search: advanced, multi-field, ranked, instant --- */
                (function () {
                    var lib = document.getElementById('library');
                    var input = document.getElementById('watch-search-input');
                    var clearBtn = document.getElementById('watch-search-clear');
                    var summary = document.getElementById('watch-search-summary');
                    var idxEl = document.getElementById('watch-search-index');
                    if (!lib || !input || !idxEl) return;
                    var INDEX = []; try { INDEX = JSON.parse(idxEl.textContent || '[]'); } catch (e) {}
                    var cards = {};
                    lib.querySelectorAll('.watch-card[data-sid]').forEach(function (c) { cards[c.getAttribute('data-sid')] = c; });

                    // Filler words a visitor types in a natural query ("the message about ...").
                    var STOP = {a:1,an:1,the:1,of:1,on:1,at:1,about:1,for:1,to:1,and:1,or:1,with:1,that:1,this:1,is:1,was:1,are:1,be:1,our:1,us:1,me:1,my:1,we:1,what:1,who:1,when:1,where:1,how:1,do:1,does:1,did:1,you:1,it:1,from:1,please:1,find:1,show:1,want:1,one:1};
                    // Field weights + the scoring below are mirrored verbatim in
                    // scripts/search-harness.mjs (run: npm run search:test), which tunes
                    // relevance against the LIVE catalog. Change one, change both.
                    // dt (date) + ch (chapter content) join the original fields; dt is a
                    // strong intent signal, ch is a recall booster kept below the summary.
                    var FIELD_W = { ti: 10, wh: 8, to: 9, sc: 6, su: 4, tg: 7, ty: 5, dt: 7, ch: 5 };
                    // When the query IS an item's full title (2+ words), pin it to the top —
                    // so searching the exact hymn "Holy, Holy, Holy" leads with the song, not
                    // every "the holy spirit" sermon it shares a word with.
                    var EXACT_TITLE_BONUS = 100;

                    function words(s) { return (s || '').toLowerCase().split(/[^a-z0-9']+/).filter(Boolean); }
                    function near(tok, w) {
                        if (tok === w) return true;
                        var la = tok.length, lb = w.length; if (Math.abs(la - lb) > 1) return false;
                        var i = 0, j = 0, e = 0;
                        while (i < la && j < lb) {
                            if (tok[i] === w[j]) { i++; j++; }
                            else { if (++e > 1) return false; if (la > lb) i++; else if (lb > la) j++; else { i++; j++; } }
                        }
                        if (i < la || j < lb) e++;
                        return e <= 1;
                    }
                    function fieldScore(tok, ws) {
                        var best = 0;
                        var hasDigit = /\d/.test(tok);
                        for (var k = 0; k < ws.length; k++) {
                            var w = ws[k];
                            if (w === tok) return 1;
                            if (w.indexOf(tok) === 0) best = Math.max(best, 0.85);
                            else if (w.indexOf(tok) > 0) best = Math.max(best, 0.6);
                            // Fuzzy only for word typos, never for glued scripture tokens
                            // (a digit in the token), so "matthew6" can't fuzz onto "matthew".
                            else if (tok.length >= 5 && w.length >= 4 && !hasDigit && near(tok, w)) best = Math.max(best, 0.5);
                        }
                        return best;
                    }
                    function parse(q) {
                        var raw = words(q);
                        var speaker = {};
                        for (var i = 0; i < raw.length; i++) if ((raw[i] === 'by' || raw[i] === 'pastor' || raw[i] === 'with') && raw[i + 1]) speaker[raw[i + 1]] = 1;
                        var toks = raw.filter(function (w) { return w.length >= 2 && !STOP[w]; });
                        // Scripture gluing: a book next to a number ("john 3", "1 john",
                        // "matthew 6") also emits a glued token (john3 / 1john / matthew6) so
                        // single-digit chapters/ordinals — dropped by the >=2 filter — still
                        // hit the glued tokens we index. Originals stay, so book-only is intact.
                        for (var j = 0; j < raw.length - 1; j++) {
                            var a = raw[j], b = raw[j + 1];
                            if (/^[a-z']+$/.test(a) && /^\d+$/.test(b)) toks.push(a + b);
                            else if (/^\d+$/.test(a) && /^[a-z']+$/.test(b)) toks.push(a + b);
                        }
                        return { toks: toks, speaker: speaker, qnorm: raw.join(' ') };
                    }
                    function typeText(item) {
                        if (item.t === 'song') return 'song songs worship music ' + (item.k || '');
                        if (item.t === 'discussion') return 'discussion conversation talk';
                        return 'sermon message teaching preaching';
                    }
                    var FW_CACHE = {};
                    function fieldsOf(item) {
                        if (FW_CACHE[item.i]) return FW_CACHE[item.i];
                        var f = {
                            ti: words(item.ti), wh: words(item.wh), to: words((item.to || []).join(' ')),
                            sc: words((item.sc || []).join(' ')), su: words(item.su), tg: words((item.tg || []).join(' ')),
                            ty: words(typeText(item)), dt: words(item.dt), ch: words((item.ch || []).join(' '))
                        };
                        FW_CACHE[item.i] = f; return f;
                    }
                    function score(item, p) {
                        var fw = fieldsOf(item), total = 0, matched = 0;
                        for (var i = 0; i < p.toks.length; i++) {
                            var tok = p.toks[i], best = 0;
                            for (var f in FIELD_W) {
                                var q = fieldScore(tok, fw[f]);
                                if (q > 0) { var w = FIELD_W[f]; if (p.speaker[tok] && f === 'wh') w += 8; if (w * q > best) best = w * q; }
                            }
                            if (best > 0) matched++;
                            total += best;
                        }
                        var base = matched === 0 ? 0 : total * (matched / p.toks.length);
                        // Exact full-title query (2+ words) -> pin to the top.
                        if (base > 0 && p.qnorm && fw.ti.length >= 2 && fw.ti.join(' ') === p.qnorm) base += EXACT_TITLE_BONUS;
                        return base;
                    }

                    var deb;
                    function schedule() { clearTimeout(deb); deb = setTimeout(run, 90); }
                    function run() {
                        var q = input.value.trim();
                        clearBtn.hidden = !q;
                        var p = q ? parse(q) : { toks: [], speaker: {} };
                        if (p.toks.length === 0) { exit(); return; }
                        var ranked = [];
                        for (var i = 0; i < INDEX.length; i++) { var sc = score(INDEX[i], p); if (sc > 0) ranked.push([INDEX[i].i, sc]); }
                        ranked.sort(function (a, b) { return b[1] - a[1]; });
                        var rank = {}; for (var r = 0; r < ranked.length; r++) rank[ranked[r][0]] = r;
                        // A search overrides any active topic/kind chip so every match shows.
                        lib.querySelectorAll('.watch-card.is-filtered').forEach(function (c) { c.classList.remove('is-filtered'); });
                        lib.querySelectorAll('.watch-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-val') === 'all')); });
                        // A search shows every match (paging is bypassed via .is-searching), so
                        // the "Show more" controls don't apply while searching.
                        lib.querySelectorAll('[data-more-wrap]').forEach(function (w) { w.hidden = true; });
                        lib.classList.add('is-searching');
                        var shown = 0, sid;
                        for (sid in cards) {
                            var card = cards[sid];
                            if (rank.hasOwnProperty(sid)) { card.classList.remove('is-search-hidden'); card.style.order = rank[sid]; shown++; }
                            else { card.classList.add('is-search-hidden'); card.style.order = ''; }
                        }
                        lib.querySelectorAll('.watch-panel').forEach(function (pan) {
                            var n = pan.querySelectorAll('.watch-card:not(.is-search-hidden)').length;
                            pan.classList.toggle('is-empty-group', n === 0);
                            var c = pan.querySelector('[data-group-count]'); if (c) c.textContent = n ? ' · ' + n : '';
                        });
                        summary.hidden = false;
                        summary.textContent = shown
                            ? shown + (shown === 1 ? ' result' : ' results') + ' for “' + q + '”'
                            : 'No results for “' + q + '”. Try a topic, a book like “Romans”, a date, or a song title.';
                    }
                    function exit() {
                        lib.classList.remove('is-searching');
                        for (var sid in cards) { cards[sid].classList.remove('is-search-hidden'); cards[sid].style.order = ''; }
                        lib.querySelectorAll('.watch-panel').forEach(function (pan) { pan.classList.remove('is-empty-group'); });
                        // Restore each rail filter's default chip + filtering on its grid
                        // (the chips live in the shared rail now, not inside the panels).
                        var railEl = document.getElementById('watch-chips-rail');
                        if (railEl) railEl.querySelectorAll('.watch-filter').forEach(function (f) {
                            var panel = document.getElementById('panel-' + f.getAttribute('data-panel'));
                            var g = panel ? panel.querySelector('.watch-grid') : null;
                            var k = f.getAttribute('data-key') || 'topic';
                            var d = f.getAttribute('data-default') || 'all';
                            f.querySelectorAll('.watch-chip:not([data-chip-toggle])').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-val') === d)); });
                            if (!g) return;
                            g.querySelectorAll('.watch-card').forEach(function (card) {
                                card.classList.toggle('is-filtered', !(d === 'all' || card.getAttribute('data-' + k) === d));
                            });
                        });
                        // The rail reappears after search — re-fit the active filter to its
                        // collapsed row budget (default reset may have changed the active chip).
                        if (railEl) ChipCollapse.applyCollapsed(railEl.querySelector('.watch-filter.is-active'));
                        // Leaving search restores the first-page collapse on every tab.
                        pageAll();
                        if (summary) { summary.hidden = true; summary.textContent = ''; }
                        clearBtn.hidden = !input.value;
                    }
                    input.addEventListener('input', schedule);
                    input.addEventListener('search', schedule);
                    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { input.value = ''; exit(); } });
                    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; exit(); input.focus(); });
                })();

                /* --- Fallback featured play (no published library yet) --- */
                var fp = document.getElementById('watch-feature-play');
                if (fp) {
                    var played = false;
                    function playFeature(muted) {
                        if (played) return; played = true;
                        var vid = fp.getAttribute('data-video');
                        var base = 'https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
                        var iframe = document.createElement('iframe');
                        iframe.className = 'watch-feature-iframe';
                        iframe.src = base + (muted ? '&mute=1' : '');
                        iframe.title = 'Sunday service video from Morning Star Christian Church';
                        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
                        iframe.setAttribute('allowfullscreen', '');
                        var holder = document.createElement('div');
                        holder.className = 'watch-feature-thumb';
                        holder.appendChild(iframe);
                        // Muted auto-arrival: a one-tap "sound" pill reloads the embed
                        // unmuted (the tap is a gesture, so audio is allowed).
                        if (muted) {
                            var b = document.createElement('button');
                            b.type = 'button'; b.className = 'vplayer-unmute'; b.setAttribute('aria-label', 'Turn on sound');
                            b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg><span>Tap for sound</span>';
                            b.addEventListener('click', function (e) {
                                e.preventDefault(); e.stopPropagation();
                                iframe.src = base;
                                b.classList.add('is-hiding');
                                setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 320);
                            });
                            holder.appendChild(b);
                            requestAnimationFrame(function () { b.classList.add('is-visible'); });
                        }
                        fp.replaceWith(holder);
                    }
                    fp.addEventListener('click', function () { playFeature(false); });
                    try { if (new URLSearchParams(location.search).get('play') === '1') playFeature(true); } catch (e) {}
                }
            })();
        </script>
    </body>`
}
