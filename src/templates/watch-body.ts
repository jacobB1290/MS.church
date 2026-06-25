import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import {
  messageCard,
  songCard,
  escapeHtml,
  watchPlayerScript,
  vplayer,
  segmentPoster,
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
                            <div class="watch-feature-actions">
                                <a class="event-link-btn event-link-btn--red teaser-cta" href="${escapeHtml(view.ytWatchUrl)}" target="_blank" rel="noopener">Watch on YouTube</a>
                            </div>
                        </div>
                    </div>
                </section>`
}

/* ---- Service selector (library): pick which full service to watch ---- */
function renderServiceSelector(allItems: PublishedSermon[]): string {
  const first = allItems[0]
  const firstTitle = typo(cleanServiceTitle(first.title))
  // The index is a quick-access list of recent full services; the deep archive
  // is the library tabs below (every older service is reachable via its card's
  // "Full service" permalink). Cap it so it stays a list, not a ledger.
  const items = allItems.slice(0, 8)
  const data = items.map((s) => ({
    slug: s.slug,
    title: typo(cleanServiceTitle(s.title)),
    poster: segmentPoster(s.youtubeVideoId, 0, 0, s.durationSec, s.posterUrl),
    videoId: s.youtubeVideoId,
    dur: Math.floor(s.durationSec ?? 0),
    meta: metaLineFor(s),
    blurb: typo(s.summary ?? ''),
  }))
  // A quiet editorial index of recent services: date + clean title, hairline
  // rules. Selecting a row swaps the featured player above (and scrolls to it).
  const rows = items
    .map(
      (s, i) =>
        `<button class="watch-svc-row${i === 0 ? ' is-current' : ''}" type="button" data-i="${i}" aria-label="Watch ${escapeHtml(typo(cleanServiceTitle(s.title)))}">
                            <span class="watch-svc-row-date">${escapeHtml(shortDate(s.publishedAt) ?? '')}</span>
                            <span class="watch-svc-row-title">${escapeHtml(typo(cleanServiceTitle(s.title)))}</span>
                            <span class="watch-svc-row-go" aria-hidden="true">${PLAY_TRIANGLE_SM}</span>
                        </button>`,
    )
    .join('\n                        ')

  // The featured plays the WHOLE service inline (no segment). The index below
  // swaps which video it points at (the player reads its data attrs live).
  return `<section id="latest" aria-label="Watch a full service">
                    <span class="section-eyebrow">Watch a full service</span>
                    <div class="watch-feature" id="service-feature">
                        <div class="watch-feature-player">${vplayer(first, null, 'feature', 'Sunday service from Morning Star Christian Church in Boise, Idaho.')}</div>
                        <div class="watch-feature-meta">
                            <h2 class="watch-feature-title" id="feature-title">${escapeHtml(firstTitle)}</h2>
                            <span class="watch-feature-meta-line" id="feature-meta">${escapeHtml(metaLineFor(first))}</span>
                            <p class="watch-feature-blurb" id="feature-blurb">${escapeHtml(typo(first.summary ?? ''))}</p>
                            <a class="watch-feature-fulllink" id="feature-fulllink" href="/watch/${escapeHtml(first.slug)}">Chapters &amp; transcript<span aria-hidden="true"> &rarr;</span></a>
                        </div>
                    </div>
                    ${
                      items.length > 1
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
                              .join('\n                            ')}`
  return `<div class="watch-filter${active ? ' is-active' : ''}" role="group" aria-label="${escapeHtml(label)}" data-panel="${escapeHtml(panelId)}" data-key="${escapeHtml(key)}" data-default="${escapeHtml(defaultVal)}"${active ? '' : ' hidden'}>${inner}</div>`
}

function topicFilter(panelId: string, active: boolean, items: PublishedSermon[]): string {
  const topics = tallyTopics(items)
  return filterRow(panelId, active, 'topic', 'Filter by topic', topics.map((t) => ({ val: t.slug, label: t.topic, count: t.count })))
}

type SongItem = { sermon: PublishedSermon; song: PublishedSermon['songs'][number]; count: number }

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

/**
 * A tab's panel: the group label (shown only in search results) + the card grid.
 * The chips moved out to the shared rail above so they can animate on tab switch.
 */
function messageGrid(id: string, items: PublishedSermon[], active: boolean, groupLabel: string): string {
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'}>
                        <h3 class="watch-group-label" aria-hidden="true">${groupLabel}<span class="watch-group-count" data-group-count></span></h3>
                        <div class="watch-grid">
                        ${items.map((s) => messageCard(s, s.slug)).join('\n                        ')}
                        </div>
                    </div>`
}

function songGrid(id: string, songItems: SongItem[], active: boolean, groupLabel: string): string {
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'}>
                        <h3 class="watch-group-label" aria-hidden="true">${groupLabel}<span class="watch-group-count" data-group-count></span></h3>
                        <div class="watch-grid">
                        ${songItems.map((it, i) => songCard(it.sermon, it.song, it.count, 'song-' + i)).join('\n                        ')}
                        </div>
                    </div>`
}

/** url-safe-ish text for the search blob; everything is matched lowercased. */
type SearchEntry = { i: string; t: string; ti: string; wh: string; to: string[]; su: string; sc: string[]; tg: string[]; k?: string }

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

function messageEntry(s: PublishedSermon): SearchEntry {
  const scripture = [...new Set(s.segments.flatMap((seg) => seg.scriptureRefs || []))]
  return {
    i: s.slug,
    t: s.format,
    ti: cleanMessageTitle(s.title),
    wh: s.speakers.join(' '),
    to: s.topics || [],
    su: s.summary || s.seo?.description || '',
    sc: scripture,
    tg: s.seo?.tags || [],
  }
}

function renderLibrary(items: PublishedSermon[]): string {
  const sermons = items.filter((s) => s.format !== 'discussion')
  const discussions = items.filter((s) => s.format === 'discussion')
  // Songs recur week to week, so de-dupe by title: one card per unique song,
  // its newest occurrence, with a count. (items is newest-first, so the first
  // time we see a title is the most recent one.)
  const byTitle = new Map<string, SongItem>()
  for (const s of items) {
    for (const song of s.songs) {
      const k = song.title.trim().toLowerCase()
      const ex = byTitle.get(k)
      if (ex) ex.count++
      else byTitle.set(k, { sermon: s, song, count: 1 })
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
  if (sermons.length > 0)
    tabs.push({ id: 'sermons', label: 'Sermons', count: sermons.length, filter: (a) => topicFilter('sermons', a, sermons), panel: (a) => messageGrid('sermons', sermons, a, 'Sermons') })
  if (songItems.length > 0)
    tabs.push({ id: 'songs', label: 'Songs', count: songItems.length, filter: (a) => songFilter('songs', a, songItems), panel: (a) => songGrid('songs', songItems, a, 'Songs') })
  if (discussions.length > 0)
    tabs.push({ id: 'discussions', label: 'Discussions', count: discussions.length, filter: (a) => topicFilter('discussions', a, discussions), panel: (a) => messageGrid('discussions', discussions, a, 'Discussions') })
  if (tabs.length === 0) return ''

  // The search index: every searchable item (messages + songs) keyed to its card's
  // data-sid. Built from the same data the cards render, so it can never drift.
  const searchIndex: SearchEntry[] = [
    ...sermons.map(messageEntry),
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
                    <p class="section-lead watch-library-lead">Tap any message and it plays right here, just the part you came for. Filter by topic, or open the full service.</p>
                    <div class="watch-search">
                        <svg class="watch-search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M10 4a6 6 0 104.47 10.03l4.24 4.25 1.42-1.42-4.25-4.24A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" fill="currentColor"/></svg>
                        <input id="watch-search-input" class="watch-search-input" type="search" inputmode="search" autocomplete="off" enterkeyhint="search" placeholder="Search by topic, title, song, or who spoke" aria-label="Search the library">
                        <button class="watch-search-clear" id="watch-search-clear" type="button" aria-label="Clear search" hidden>&times;</button>
                    </div>
                    <p class="watch-search-summary" id="watch-search-summary" role="status" aria-live="polite" hidden></p>
                    ${tabBar}
                    ${chipRail}
                    ${panels}
                    <script type="application/json" id="watch-search-index">${JSON.stringify(searchIndex)}</script>
                </section>`
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

                ${library ? renderServiceSelector(view.items) : renderFallbackFeature(view)}

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
        <script>
            (function () {
                var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
                            }
                            if (img) { img.src = s.poster; img.onerror = function () { this.onerror = null; this.src = 'https://img.youtube.com/vi/' + s.videoId + '/hqdefault.jpg'; }; }
                            title.textContent = s.title; meta.textContent = s.meta; blurb.textContent = s.blurb;
                            if (fulllink) fulllink.href = '/watch/' + s.slug;
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
                        return;
                    }
                    var h1 = chipsRail.offsetHeight;
                    chipsRail.style.height = h1 + 'px';
                    chipsRail.style.overflow = 'hidden';
                    if (from) { from.classList.add('is-anim-out'); from.classList.remove('is-active'); }
                    to.hidden = false; to.classList.add('is-active');
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
                        var grid = gridForFilter(filter);
                        if (!grid) return;
                        var key = filter.getAttribute('data-key') || 'topic';
                        var val = chip.getAttribute('data-val');
                        filter.querySelectorAll('.watch-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
                        fadeGrid(grid, function () {
                            grid.querySelectorAll('.watch-card').forEach(function (card) {
                                var show = val === 'all' || card.getAttribute('data-' + key) === val;
                                card.classList.toggle('is-filtered', !show);
                            });
                        });
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
                }

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
                    var FIELD_W = { ti: 10, wh: 8, to: 9, sc: 6, su: 4, tg: 7, ty: 5 };

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
                        for (var k = 0; k < ws.length; k++) {
                            var w = ws[k];
                            if (w === tok) return 1;
                            if (w.indexOf(tok) === 0) best = Math.max(best, 0.85);
                            else if (w.indexOf(tok) > 0) best = Math.max(best, 0.6);
                            else if (tok.length >= 5 && w.length >= 4 && near(tok, w)) best = Math.max(best, 0.5);
                        }
                        return best;
                    }
                    function parse(q) {
                        var raw = words(q);
                        var speaker = {};
                        for (var i = 0; i < raw.length; i++) if ((raw[i] === 'by' || raw[i] === 'pastor' || raw[i] === 'with') && raw[i + 1]) speaker[raw[i + 1]] = 1;
                        return { toks: raw.filter(function (w) { return w.length >= 2 && !STOP[w]; }), speaker: speaker };
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
                            ty: words(typeText(item))
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
                        return matched === 0 ? 0 : total * (matched / p.toks.length);
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
                            : 'No results for “' + q + '”. Try a topic, a name like “John”, or a song title.';
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
                            f.querySelectorAll('.watch-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-val') === d)); });
                            if (!g) return;
                            g.querySelectorAll('.watch-card').forEach(function (card) {
                                card.classList.toggle('is-filtered', !(d === 'all' || card.getAttribute('data-' + k) === d));
                            });
                        });
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
