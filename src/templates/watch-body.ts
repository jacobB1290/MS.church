import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import {
  messageCard,
  songCard,
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
}

export type WatchHubView = {
  mode: 'library' | 'fallback'
  feature: WatchFeature
  items: PublishedSermon[]
  ytWatchUrl: string
  playlistUrl: string
}

const PLAY_TRIANGLE = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`

function metaLineFor(s: PublishedSermon): string {
  const speaker = speakerLine(s.speakers)
  return [longDate(s.publishedAt), speaker ? `with ${speaker}` : null, lengthLabel(s.durationSec)]
    .filter(Boolean)
    .join(' · ')
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
                            <span class="watch-feature-tag">Most recent</span>
                            <h2 class="watch-feature-title">${escapeHtml(f.title)}</h2>
                            ${f.dateLabel ? `<span class="watch-feature-meta-line">${escapeHtml(f.dateLabel)}</span>` : ''}
                            <p class="watch-feature-blurb">${escapeHtml(f.summary)}</p>
                            <div class="watch-feature-actions">
                                <a class="event-link-btn event-link-btn--red teaser-cta" href="${escapeHtml(view.ytWatchUrl)}" target="_blank" rel="noopener">Watch on YouTube</a>
                            </div>
                        </div>
                    </div>
                </section>`
}

/* ---- Service selector (library): pick which full service to watch ---- */
function renderServiceSelector(items: PublishedSermon[]): string {
  const first = items[0]
  const data = items.map((s) => ({
    slug: s.slug,
    title: s.title,
    poster: posterFor(s.youtubeVideoId, s.thumbnailUrl),
    videoId: s.youtubeVideoId,
    dur: Math.floor(s.durationSec ?? 0),
    meta: metaLineFor(s),
    blurb: s.summary ?? '',
  }))
  const list = items
    .map(
      (s, i) =>
        `<li><button class="watch-feature-li${i === 0 ? ' is-current' : ''}" type="button" data-i="${i}"><span class="watch-feature-li-date">${escapeHtml(shortDate(s.publishedAt) ?? '')}</span><span class="watch-feature-li-title">${escapeHtml(s.title)}</span></button></li>`,
    )
    .join('\n                            ')

  // The featured plays the WHOLE service inline (no segment). The date selector
  // swaps which video it points at (the player reads its data attrs live).
  return `<section id="latest" aria-label="Watch a full service">
                    <span class="section-eyebrow">Watch a full service</span>
                    <div class="watch-feature" id="service-feature">
                        <div class="watch-feature-player">${vplayer(first, null, 'feature', 'Sunday service from Morning Star Christian Church in Boise, Idaho.')}</div>
                        <div class="watch-feature-meta">
                            <span class="watch-feature-tag" id="feature-tag">Latest service</span>
                            <h2 class="watch-feature-title" id="feature-title">${escapeHtml(first.title)}</h2>
                            <span class="watch-feature-meta-line" id="feature-meta">${escapeHtml(metaLineFor(first))}</span>
                            <p class="watch-feature-blurb" id="feature-blurb">${escapeHtml(first.summary ?? '')}</p>
                            <a class="watch-feature-fulllink" id="feature-fulllink" href="/watch/${escapeHtml(first.slug)}">Chapters &amp; transcript<span aria-hidden="true"> &rarr;</span></a>
                            ${
                              items.length > 1
                                ? `<div class="watch-feature-nav" role="group" aria-label="Browse services">
                                <button class="watch-feature-step" id="feature-newer" type="button" aria-label="Newer service" disabled><span aria-hidden="true">&larr;</span> Newer</button>
                                <button class="watch-feature-step" id="feature-older" type="button" aria-label="Older service">Older <span aria-hidden="true">&rarr;</span></button>
                                <button class="watch-feature-listbtn" id="feature-list-toggle" type="button" aria-expanded="false" aria-controls="feature-list">All services <span class="watch-feature-count">${items.length}</span></button>
                            </div>
                            <div class="watch-feature-list" id="feature-list">
                                <ul>
                            ${list}
                                </ul>
                            </div>`
                                : ''
                            }
                        </div>
                    </div>
                    <script type="application/json" id="services-data">${JSON.stringify(data)}</script>
                </section>`
}

/* ---- Library tabs (message types) ---- */

/** A chip row that filters the panel's cards by a data attribute (key = topic | kind). */
function filterRow(key: string, label: string, chips: { val: string; label: string; count: number }[]): string {
  if (chips.length <= 1) return ''
  return `<div class="watch-filter" role="group" aria-label="${escapeHtml(label)}" data-key="${escapeHtml(key)}">
                            <button class="watch-chip" type="button" data-val="all" aria-pressed="true">All</button>
                            ${chips
                              .map(
                                (c) =>
                                  `<button class="watch-chip" type="button" data-val="${escapeHtml(c.val)}" aria-pressed="false">${escapeHtml(c.label)}<span class="watch-chip-count">${c.count}</span></button>`,
                              )
                              .join('\n                            ')}
                        </div>`
}

function topicFilter(items: PublishedSermon[]): string {
  const topics = tallyTopics(items)
  return filterRow('topic', 'Filter by topic', topics.map((t) => ({ val: t.slug, label: t.topic, count: t.count })))
}

function messagePanel(id: string, items: PublishedSermon[], active: boolean, lead: string, groupLabel: string): string {
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'}>
                        <p class="section-lead watch-panel-lead">${lead}</p>
                        <h3 class="watch-group-label" aria-hidden="true">${groupLabel}<span class="watch-group-count" data-group-count></span></h3>
                        ${topicFilter(items)}
                        <div class="watch-grid">
                        ${items.map((s) => messageCard(s, s.slug)).join('\n                        ')}
                        </div>
                    </div>`
}

type SongItem = { sermon: PublishedSermon; song: PublishedSermon['songs'][number]; count: number }

function songPanel(id: string, songItems: SongItem[], active: boolean, lead: string, groupLabel: string): string {
  const worship = songItems.filter((it) => it.song.kind !== 'program').length
  const program = songItems.filter((it) => it.song.kind === 'program').length
  const filter =
    worship > 0 && program > 0
      ? filterRow('kind', 'Filter songs', [
          { val: 'worship', label: 'Worship', count: worship },
          { val: 'program', label: 'Program', count: program },
        ])
      : ''
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'}>
                        <p class="section-lead watch-panel-lead">${lead}</p>
                        <h3 class="watch-group-label" aria-hidden="true">${groupLabel}<span class="watch-group-count" data-group-count></span></h3>
                        ${filter}
                        <div class="watch-grid">
                        ${songItems.map((it, i) => songCard(it.sermon, it.song, it.count, 'song-' + i)).join('\n                        ')}
                        </div>
                    </div>`
}

/** url-safe-ish text for the search blob; everything is matched lowercased. */
type SearchEntry = { i: string; t: string; ti: string; wh: string; to: string[]; su: string; sc: string[]; tg: string[]; k?: string }
function messageEntry(s: PublishedSermon): SearchEntry {
  const scripture = [...new Set(s.segments.flatMap((seg) => seg.scriptureRefs || []))]
  return {
    i: s.slug,
    t: s.format,
    ti: s.title,
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
  const tabs: { id: string; label: string; count: number; panel: (active: boolean) => string }[] = []
  if (sermons.length > 0)
    tabs.push({ id: 'sermons', label: 'Sermons', count: sermons.length, panel: (a) => messagePanel('sermons', sermons, a, 'Tap a sermon and it plays right here, just the message. Filter by topic, or open the full service.', 'Sermons') })
  if (songItems.length > 0)
    tabs.push({ id: 'songs', label: 'Songs', count: songItems.length, panel: (a) => songPanel('songs', songItems, a, 'Every song we have sung, on its own. Tap one to play just that song.', 'Songs') })
  if (discussions.length > 0)
    tabs.push({ id: 'discussions', label: 'Discussions', count: discussions.length, panel: (a) => messagePanel('discussions', discussions, a, 'Two hosts working through the text together. Tap one to play the conversation right here.', 'Discussions') })
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

  const tabBar =
    tabs.length > 1
      ? `<div class="watch-tabs" role="tablist" aria-label="Library">
                        ${tabs
                          .map(
                            (t, i) =>
                              `<button class="watch-tab" type="button" role="tab" id="tab-${t.id}" data-panel="${t.id}" aria-controls="panel-${t.id}" aria-selected="${i === 0 ? 'true' : 'false'}">${t.label}<span class="watch-tab-count">${t.count}</span></button>`,
                          )
                          .join('\n                        ')}
                    </div>`
      : ''
  const panels = tabs.map((t, i) => t.panel(i === 0)).join('\n                    ')

  return `<section id="library" aria-label="Library">
                    <span class="section-eyebrow">Library</span>
                    <h2 class="section-heading">Find a message.</h2>
                    <div class="watch-search">
                        <svg class="watch-search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M10 4a6 6 0 104.47 10.03l4.24 4.25 1.42-1.42-4.25-4.24A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" fill="currentColor"/></svg>
                        <input id="watch-search-input" class="watch-search-input" type="search" inputmode="search" autocomplete="off" enterkeyhint="search" placeholder="Search by topic, title, song, or who spoke" aria-label="Search the library">
                        <button class="watch-search-clear" id="watch-search-clear" type="button" aria-label="Clear search" hidden>&times;</button>
                    </div>
                    <p class="watch-search-summary" id="watch-search-summary" role="status" aria-live="polite" hidden></p>
                    ${tabBar}
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
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section id="watch-intro">
                    <h1 class="section-heading">Watch, anytime.</h1>
                    <p class="subpage-intro-lead">Missed a Sunday, or want to sit with a message again? Watch a whole service, or jump straight to a sermon or discussion by topic. Each one plays right here, nothing to sign up for.</p>
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
                    var tag = document.getElementById('feature-tag');
                    var title = document.getElementById('feature-title');
                    var meta = document.getElementById('feature-meta');
                    var blurb = document.getElementById('feature-blurb');
                    var fulllink = document.getElementById('feature-fulllink');
                    var older = document.getElementById('feature-older');
                    var newer = document.getElementById('feature-newer');
                    var listToggle = document.getElementById('feature-list-toggle');
                    var list = document.getElementById('feature-list');

                    function paint(i) {
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
                            tag.textContent = i === 0 ? 'Latest service' : 'Past service';
                            title.textContent = s.title; meta.textContent = s.meta; blurb.textContent = s.blurb;
                            if (fulllink) fulllink.href = '/watch/' + s.slug;
                        };
                        if (reduce) { apply(); }
                        else { feature.classList.add('is-swapping'); setTimeout(function () { apply(); requestAnimationFrame(function () { feature.classList.remove('is-swapping'); }); }, 160); }
                        if (older) older.disabled = i >= data.length - 1;
                        if (newer) newer.disabled = i <= 0;
                        if (list) list.querySelectorAll('.watch-feature-li').forEach(function (b, j) { b.classList.toggle('is-current', j === i); });
                    }
                    if (older) older.addEventListener('click', function () { if (idx < data.length - 1) paint(idx + 1); });
                    if (newer) newer.addEventListener('click', function () { if (idx > 0) paint(idx - 1); });
                    if (listToggle && list) {
                        listToggle.addEventListener('click', function () {
                            var open = !list.classList.contains('is-open');
                            list.classList.toggle('is-open', open);
                            listToggle.setAttribute('aria-expanded', String(open));
                        });
                        list.addEventListener('click', function (e) {
                            var b = e.target.closest('.watch-feature-li'); if (!b) return;
                            paint(parseInt(b.getAttribute('data-i'), 10) || 0);
                            list.classList.remove('is-open'); listToggle.setAttribute('aria-expanded', 'false');
                        });
                    }
                }

                /* --- Library tabs + per-tab topic filter --- */
                var tablist = document.querySelector('.watch-tabs');
                function fadeGrid(grid, apply) {
                    if (!grid || reduce) { apply(); return; }
                    grid.classList.add('is-fading');
                    setTimeout(function () { apply(); requestAnimationFrame(function () { grid.classList.remove('is-fading'); }); }, 200);
                }
                if (tablist) {
                    tablist.addEventListener('click', function (e) {
                        var tab = e.target.closest('.watch-tab');
                        if (!tab || tab.getAttribute('aria-selected') === 'true') return;
                        var id = tab.getAttribute('data-panel');
                        var current = document.querySelector('.watch-panel.is-active');
                        var target = document.getElementById('panel-' + id);
                        if (!target || current === target) return;
                        tablist.querySelectorAll('.watch-tab').forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
                        if (current) { current.classList.remove('is-active'); current.setAttribute('hidden', ''); }
                        target.classList.add('is-active'); target.removeAttribute('hidden');
                    });
                }
                document.querySelectorAll('.watch-panel').forEach(function (panel) {
                    var filter = panel.querySelector('.watch-filter');
                    var grid = panel.querySelector('.watch-grid');
                    if (!filter || !grid) return;
                    var key = filter.getAttribute('data-key') || 'topic';
                    filter.addEventListener('click', function (e) {
                        var chip = e.target.closest('.watch-chip');
                        if (!chip) return;
                        var val = chip.getAttribute('data-val');
                        filter.querySelectorAll('.watch-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
                        fadeGrid(grid, function () {
                            grid.querySelectorAll('.watch-card').forEach(function (card) {
                                var show = val === 'all' || card.getAttribute('data-' + key) === val;
                                card.classList.toggle('is-filtered', !show);
                            });
                        });
                    });
                });

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
                            else if (tok.length >= 4 && w.length >= 3 && near(tok, w)) best = Math.max(best, 0.7);
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
                        if (summary) { summary.hidden = true; summary.textContent = ''; }
                        clearBtn.hidden = !input.value;
                    }
                    input.addEventListener('input', schedule);
                    input.addEventListener('search', schedule);
                    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { input.value = ''; exit(); } });
                    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; exit(); input.focus(); });
                })();

                /* --- Fallback featured play --- */
                var fp = document.getElementById('watch-feature-play');
                if (fp) {
                    var played = false;
                    fp.addEventListener('click', function () {
                        if (played) return; played = true;
                        var iframe = document.createElement('iframe');
                        iframe.className = 'watch-feature-iframe';
                        iframe.src = 'https://www.youtube.com/embed/' + fp.getAttribute('data-video') + '?autoplay=1&rel=0&modestbranding=1';
                        iframe.title = 'Sunday service video from Morning Star Christian Church';
                        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
                        iframe.setAttribute('allowfullscreen', '');
                        var holder = document.createElement('div');
                        holder.className = 'watch-feature-thumb';
                        holder.appendChild(iframe);
                        fp.replaceWith(holder);
                    });
                }
            })();
        </script>
    </body>`
}
