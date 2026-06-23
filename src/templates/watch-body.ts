import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import {
  messageCard,
  escapeHtml,
  watchPlayerScript,
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
  const poster = posterFor(first.youtubeVideoId, first.thumbnailUrl)
  const data = items.map((s) => ({
    slug: s.slug,
    title: s.title,
    poster: posterFor(s.youtubeVideoId, s.thumbnailUrl),
    videoId: s.youtubeVideoId,
    date: longDate(s.publishedAt) ?? '',
    short: shortDate(s.publishedAt) ?? '',
    meta: metaLineFor(s),
    blurb: s.summary ?? '',
  }))
  const list = items
    .map(
      (s, i) =>
        `<li><button class="watch-feature-li${i === 0 ? ' is-current' : ''}" type="button" data-i="${i}"><span class="watch-feature-li-date">${escapeHtml(shortDate(s.publishedAt) ?? '')}</span><span class="watch-feature-li-title">${escapeHtml(s.title)}</span></button></li>`,
    )
    .join('\n                            ')

  return `<section id="latest" aria-label="Watch a full service">
                    <span class="section-eyebrow">Watch a full service</span>
                    <div class="watch-feature" id="service-feature">
                        <a class="watch-feature-thumb" id="feature-thumb" href="/watch/${escapeHtml(first.slug)}?full=1" aria-label="Watch the full service">
                            <img id="feature-img" src="${escapeHtml(poster)}" alt="Sunday service from Morning Star Christian Church in Boise, Idaho." width="1280" height="720" loading="eager" fetchpriority="high"
                                 onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${escapeHtml(first.youtubeVideoId)}/hqdefault.jpg';">
                            <span class="watch-feature-play">${PLAY_TRIANGLE}</span>
                        </a>
                        <div class="watch-feature-meta">
                            <span class="watch-feature-tag" id="feature-tag">Latest service</span>
                            <h2 class="watch-feature-title" id="feature-title">${escapeHtml(first.title)}</h2>
                            <span class="watch-feature-meta-line" id="feature-meta">${escapeHtml(metaLineFor(first))}</span>
                            <p class="watch-feature-blurb" id="feature-blurb">${escapeHtml(first.summary ?? '')}</p>
                            <div class="watch-feature-actions">
                                <a class="event-link-btn teaser-cta" id="feature-cta" href="/watch/${escapeHtml(first.slug)}?full=1">Watch this service</a>
                            </div>
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
function topicFilter(items: PublishedSermon[]): string {
  const topics = tallyTopics(items)
  if (topics.length <= 1) return ''
  return `<div class="watch-filter" role="group" aria-label="Filter by topic">
                            <button class="watch-chip" type="button" data-topic="all" aria-pressed="true">All</button>
                            ${topics
                              .map(
                                (t) =>
                                  `<button class="watch-chip" type="button" data-topic="${escapeHtml(t.slug)}" aria-pressed="false">${escapeHtml(t.topic)}<span class="watch-chip-count">${t.count}</span></button>`,
                              )
                              .join('\n                            ')}
                        </div>`
}

function messagePanel(id: string, items: PublishedSermon[], active: boolean, lead: string): string {
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'}>
                        <p class="section-lead watch-panel-lead">${lead}</p>
                        ${topicFilter(items)}
                        <div class="watch-grid">
                        ${items.map((s) => messageCard(s)).join('\n                        ')}
                        </div>
                    </div>`
}

function renderLibrary(items: PublishedSermon[]): string {
  const sermons = items.filter((s) => s.format !== 'discussion')
  const discussions = items.filter((s) => s.format === 'discussion')
  const tabs: { id: string; label: string; count: number; items: PublishedSermon[]; lead: string }[] = []
  if (sermons.length > 0)
    tabs.push({ id: 'sermons', label: 'Sermons', count: sermons.length, items: sermons, lead: 'Tap a sermon and it plays right here, just the message. Filter by topic, or open the full service.' })
  if (discussions.length > 0)
    tabs.push({ id: 'discussions', label: 'Discussions', count: discussions.length, items: discussions, lead: 'Two hosts working through the text together. Tap one to play the conversation right here.' })
  if (tabs.length === 0) return ''

  const tabBar =
    tabs.length > 1
      ? `<div class="watch-tabs" role="tablist" aria-label="Messages">
                        ${tabs
                          .map(
                            (t, i) =>
                              `<button class="watch-tab" type="button" role="tab" id="tab-${t.id}" data-panel="${t.id}" aria-controls="panel-${t.id}" aria-selected="${i === 0 ? 'true' : 'false'}">${t.label}<span class="watch-tab-count">${t.count}</span></button>`,
                          )
                          .join('\n                        ')}
                    </div>`
      : ''
  const panels = tabs.map((t, i) => messagePanel(t.id, t.items, i === 0, t.lead)).join('\n                    ')

  return `<section id="library" aria-label="Messages">
                    <span class="section-eyebrow">Messages</span>
                    <h2 class="section-heading">Find a message.</h2>
                    ${tabBar}
                    ${panels}
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
                    var img = document.getElementById('feature-img');
                    var tag = document.getElementById('feature-tag');
                    var title = document.getElementById('feature-title');
                    var meta = document.getElementById('feature-meta');
                    var blurb = document.getElementById('feature-blurb');
                    var cta = document.getElementById('feature-cta');
                    var thumb = document.getElementById('feature-thumb');
                    var older = document.getElementById('feature-older');
                    var newer = document.getElementById('feature-newer');
                    var listToggle = document.getElementById('feature-list-toggle');
                    var list = document.getElementById('feature-list');

                    function paint(i) {
                        var s = data[i]; if (!s) return;
                        idx = i;
                        var href = '/watch/' + s.slug + '?full=1';
                        var apply = function () {
                            img.src = s.poster; img.onerror = function () { this.onerror = null; this.src = 'https://img.youtube.com/vi/' + s.videoId + '/hqdefault.jpg'; };
                            tag.textContent = i === 0 ? 'Latest service' : 'Past service';
                            title.textContent = s.title; meta.textContent = s.meta; blurb.textContent = s.blurb;
                            cta.href = href; thumb.href = href;
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
                document.querySelectorAll('.watch-panel, #panel-sermons, #panel-discussions').forEach(function (panel) {
                    var filter = panel.querySelector('.watch-filter');
                    var grid = panel.querySelector('.watch-grid');
                    if (!filter || !grid) return;
                    filter.addEventListener('click', function (e) {
                        var chip = e.target.closest('.watch-chip');
                        if (!chip) return;
                        var topic = chip.getAttribute('data-topic');
                        filter.querySelectorAll('.watch-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
                        fadeGrid(grid, function () {
                            grid.querySelectorAll('.watch-card').forEach(function (card) {
                                var show = topic === 'all' || card.getAttribute('data-topic') === topic;
                                card.classList.toggle('is-filtered', !show);
                            });
                        });
                    });
                });

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
