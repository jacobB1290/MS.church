import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import {
  escapeHtml,
  mmss,
  longDate,
  lengthLabel,
  posterFor,
  speakerLine,
  formatNoun,
  primarySegment,
  SEGMENT_LABEL,
} from './watch-shared.js'
import { topicSlug, type PublishedSermon } from '../sermons-feed.js'
import { watchCard } from './watch-shared.js'

// /watch/<slug> — a single service permalink with the CUSTOM SEGMENT PLAYER.
//
// By default the player shows ONLY the message segment in its scrubber (the part
// people came for), not the whole hour. A "Watch full service" toggle expands to
// the entire video with chapter markers. It's progressive enhancement over a
// poster facade: nothing loads until the visitor taps play, and crawlers get the
// full transcript, chapters, summary, and VideoObject/Clip schema in the HTML.

const PLAY_TRIANGLE = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`
const ICON_PLAY = `<svg class="icon-play" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`
const ICON_PAUSE = `<svg class="icon-pause" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>`

function chapterTitle(seg: { type: string; title: string }): string {
  const label = SEGMENT_LABEL[seg.type]
  if (label && seg.title.toLowerCase().startsWith(label.toLowerCase())) return seg.title
  return seg.title
}

export const watchItemBody = (
  sermon: PublishedSermon,
  related: PublishedSermon[] = [],
): string => {
  const noun = formatNoun(sermon.format)
  const poster = posterFor(sermon.youtubeVideoId, sermon.thumbnailUrl)
  const dateLabel = longDate(sermon.publishedAt)
  const len = lengthLabel(sermon.durationSec)
  const speaker = speakerLine(sermon.speakers)
  const primary = primarySegment(sermon)
  const segStart = primary ? Math.floor(primary.startSec) : 0
  const segEnd = primary ? Math.floor(primary.endSec) : 0
  const duration = sermon.durationSec ?? 0

  const refs = Array.from(
    new Set(sermon.segments.flatMap((s) => s.scriptureRefs).filter(Boolean)),
  ).slice(0, 8)

  const metaBits = [
    noun,
    dateLabel,
    speaker ? `with ${escapeHtml(speaker)}` : null,
    len,
  ]
    .filter(Boolean)
    .map((b) => `<span>${b}</span>`)
    .join('<span aria-hidden="true">·</span>')

  const chapters = sermon.segments
    .map((seg) => {
      const label = SEGMENT_LABEL[seg.type] ?? seg.type
      const title = chapterTitle(seg)
      // Drop the small-caps kind tag when the title already says it ("Welcome"
      // shouldn't read "Welcome WELCOME"); keep it when it adds a category.
      const showKind = !title.toLowerCase().startsWith(label.toLowerCase())
      return `<li>
                                <button class="watch-chapter" type="button" data-seek="${Math.floor(seg.startSec)}">
                                    <span class="watch-chapter-time">${escapeHtml(mmss(seg.startSec))}</span>
                                    <span>
                                        <span class="watch-chapter-title">${escapeHtml(title)}${showKind ? `<span class="watch-chapter-kind">${escapeHtml(label)}</span>` : ''}</span>
                                        ${seg.summary ? `<span class="watch-chapter-note">${escapeHtml(seg.summary)}</span>` : ''}
                                    </span>
                                </button>
                            </li>`
    })
    .join('\n                            ')

  const refChips =
    refs.length > 0
      ? `<div class="watch-refs" aria-label="Scripture in this message">
                                ${refs.map((r) => `<span class="watch-ref">${escapeHtml(r)}</span>`).join('\n                                ')}
                            </div>`
      : ''

  const topicLinks =
    sermon.topics.length > 0
      ? `<div class="watch-aside-block">
                            <p class="watch-aside-label">Topics</p>
                            <div class="watch-card-topics">
                                ${sermon.topics
                                  .map(
                                    (t) =>
                                      `<a class="watch-card-topic" href="/watch/topic/${escapeHtml(topicSlug(t))}">${escapeHtml(t)}</a>`,
                                  )
                                  .join('\n                                ')}
                            </div>
                        </div>`
      : ''

  const transcript = sermon.transcript
    ? `<details class="watch-transcript">
                        <summary>Read the transcript</summary>
                        <div class="watch-transcript-body">${escapeHtml(sermon.transcript)}</div>
                    </details>`
    : ''

  const relatedBlock =
    related.length > 0
      ? `<section id="more" aria-label="More services" style="margin-top: var(--space-3xl);">
                    <span class="section-eyebrow">More to watch</span>
                    <h2 class="section-heading">Keep going.</h2>
                    <div class="watch-grid" style="margin-top: var(--space-lg);">
                        ${related.map((s) => watchCard(s)).join('\n                        ')}
                    </div>
                </section>`
      : ''

  return `
    <style>
        .watch-permalink-aside { position: sticky; top: calc(var(--space-2xl)); }
        @media (max-width: 960px) { .watch-permalink-aside { position: static; } }
    </style>
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section class="watch-permalink-head">
                    <span class="watch-permalink-kicker">${escapeHtml(noun)}</span>
                    <h1 class="watch-permalink-title">${escapeHtml(sermon.title)}</h1>
                    <div class="watch-permalink-meta">${metaBits}</div>
                </section>

                <div class="watch-permalink-grid">
                    <div>
                        <div class="vplayer" data-video="${escapeHtml(sermon.youtubeVideoId)}" data-start="${segStart}" data-end="${segEnd}" data-duration="${Math.floor(duration)}">
                            <div class="vplayer-stage">
                                <button class="vplayer-poster" type="button" aria-label="Play ${escapeHtml(sermon.title)}">
                                    <img src="${escapeHtml(poster)}" alt="${escapeHtml(`${sermon.title} — ${noun.toLowerCase()} from Morning Star Christian Church in Boise, Idaho`)}" width="1280" height="720" loading="eager" fetchpriority="high"
                                         onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${escapeHtml(sermon.youtubeVideoId)}/hqdefault.jpg';">
                                    <span class="vplayer-poster-scrim" aria-hidden="true"></span>
                                    <span class="vplayer-poster-play">${PLAY_TRIANGLE}</span>
                                </button>
                            </div>
                            <div class="vplayer-bar" hidden>
                                <button class="vplayer-btn" type="button" data-act="toggle" aria-label="Play or pause">${ICON_PLAY}${ICON_PAUSE}</button>
                                <div class="vplayer-mid">
                                    <span class="vplayer-time" data-cur>0:00</span>
                                    <div class="vplayer-scrub" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                                        <div class="vplayer-track">
                                            <div class="vplayer-fill"></div>
                                            <div class="vplayer-knob"></div>
                                        </div>
                                    </div>
                                    <span class="vplayer-time" data-dur>0:00</span>
                                </div>
                                <button class="vplayer-toggle" type="button" data-act="mode" aria-pressed="false">Full service</button>
                            </div>
                        </div>

                        ${sermon.summary ? `<p class="watch-feature-blurb" style="font-size: var(--text-body); color: var(--text-primary-soft); max-width: 68ch;">${escapeHtml(sermon.summary)}</p>` : ''}
                        ${refChips}
                        ${transcript}
                    </div>

                    <aside class="watch-permalink-aside" aria-label="Chapters and details">
                        ${
                          sermon.segments.length > 0
                            ? `<div class="watch-aside-block">
                            <p class="watch-aside-label">Chapters</p>
                            <ol class="watch-chapters">
                            ${chapters}
                            </ol>
                        </div>`
                            : ''
                        }
                        ${topicLinks}
                        <div class="watch-aside-block">
                            <a class="event-link-btn teaser-cta" href="/visit">Plan a Visit</a>
                        </div>
                    </aside>
                </div>

                ${relatedBlock}
            </main>

            ${footer()}
        </div>
        <script>
            (function () {
                var root = document.querySelector('.vplayer');
                if (!root) return;
                var videoId = root.getAttribute('data-video');
                var segStart = parseFloat(root.getAttribute('data-start')) || 0;
                var segEnd = parseFloat(root.getAttribute('data-end')) || 0;
                var fullDur = parseFloat(root.getAttribute('data-duration')) || 0;
                var hasSeg = segEnd > segStart + 1;

                var poster = root.querySelector('.vplayer-poster');
                var stage = root.querySelector('.vplayer-stage');
                var bar = root.querySelector('.vplayer-bar');
                var fill = root.querySelector('.vplayer-fill');
                var knob = root.querySelector('.vplayer-knob');
                var scrub = root.querySelector('.vplayer-scrub');
                var track = root.querySelector('.vplayer-track');
                var curEl = root.querySelector('[data-cur]');
                var durEl = root.querySelector('[data-dur]');
                var toggleBtn = root.querySelector('[data-act="mode"]');
                var playBtn = root.querySelector('[data-act="toggle"]');
                var chapters = Array.prototype.slice.call(document.querySelectorAll('.watch-chapter'));

                var player = null, ready = false, scrubbing = false, pendingSeek = null, fellBack = false;
                var mode = hasSeg ? 'segment' : 'full';
                var raf = null, fallbackTimer = null;

                function fmt(t) { t = Math.max(0, Math.floor(t)); var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; var ss = ('0' + s).slice(-2); return h > 0 ? h + ':' + ('0' + m).slice(-2) + ':' + ss : m + ':' + ss; }
                function lo() { return mode === 'segment' ? segStart : 0; }
                function hi() { var d = fullDur || (player && player.getDuration ? player.getDuration() : 0) || 0; return mode === 'segment' ? segEnd : d; }
                function span() { return Math.max(0.001, hi() - lo()); }

                function loadAPI() {
                    return new Promise(function (res) {
                        if (window.YT && window.YT.Player) return res();
                        var prev = window.onYouTubeIframeAPIReady;
                        window.onYouTubeIframeAPIReady = function () { if (prev) prev(); res(); };
                        if (!document.getElementById('yt-iframe-api')) {
                            var s = document.createElement('script'); s.id = 'yt-iframe-api'; s.src = 'https://www.youtube.com/iframe_api';
                            document.head.appendChild(s);
                        }
                    });
                }

                function start() {
                    if (player || fellBack) return;
                    poster.setAttribute('disabled', '');
                    var mount = document.createElement('div'); mount.id = 'vplayer-frame'; mount.className = 'vplayer-frame'; stage.appendChild(mount);
                    // Resilience: if the IFrame API can't load (blocked script,
                    // offline CDN), don't strand the visitor on a dead poster —
                    // fall back to a plain embed that still starts on the segment.
                    fallbackTimer = setTimeout(function () { if (!ready) nativeFallback(); }, 6000);
                    loadAPI().then(function () {
                        if (fellBack) return;
                        player = new YT.Player('vplayer-frame', {
                            videoId: videoId,
                            playerVars: { controls: 0, rel: 0, modestbranding: 1, playsinline: 1, fs: 1, start: Math.floor(lo()), autoplay: 1, origin: location.origin },
                            events: { onReady: onReady, onStateChange: onState }
                        });
                    }).catch(function () { if (!ready) nativeFallback(); });
                }

                function nativeFallback() {
                    if (fellBack || ready) return;
                    fellBack = true;
                    var mount = document.getElementById('vplayer-frame'); if (mount) mount.remove();
                    poster.style.display = 'none';
                    var f = document.createElement('iframe'); f.className = 'vplayer-frame';
                    f.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&start=' + Math.floor(lo());
                    f.title = 'Service video from Morning Star Christian Church';
                    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.setAttribute('allowfullscreen', '');
                    stage.appendChild(f);
                    // No API to drive the custom bar — leave it hidden; native
                    // controls take over inside the embed.
                }

                function onReady() {
                    ready = true;
                    if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
                    poster.style.display = 'none';
                    bar.hidden = false;
                    durEl.textContent = fmt(span());
                    buildMarkers();
                    if (pendingSeek != null) { doSeek(pendingSeek); pendingSeek = null; }
                    else { try { player.playVideo(); } catch (e) {} }
                    loop();
                }

                function onState(e) {
                    root.classList.toggle('is-playing', e.data === 1);
                }

                function loop() {
                    cancelAnimationFrame(raf);
                    (function tick() {
                        if (ready && player && player.getCurrentTime) {
                            var t = player.getCurrentTime();
                            if (mode === 'segment' && t >= segEnd - 0.2) {
                                try { player.pauseVideo(); player.seekTo(segStart, true); } catch (e) {}
                                t = segStart; root.classList.remove('is-playing');
                            }
                            if (!scrubbing) {
                                var p = Math.min(1, Math.max(0, (t - lo()) / span()));
                                fill.style.width = (p * 100) + '%'; knob.style.left = (p * 100) + '%';
                                curEl.textContent = fmt(Math.max(0, t - lo()));
                                scrub.setAttribute('aria-valuenow', String(Math.round(p * 100)));
                                highlight(t);
                            }
                        }
                        raf = requestAnimationFrame(tick);
                    })();
                }

                function highlight(t) {
                    var idx = -1;
                    for (var i = 0; i < chapters.length; i++) {
                        if (t + 0.5 >= parseFloat(chapters[i].getAttribute('data-seek') || '0')) idx = i;
                    }
                    chapters.forEach(function (c, i) { c.classList.toggle('is-current', i === idx); });
                }

                function buildMarkers() {
                    track.querySelectorAll('.vplayer-marker').forEach(function (m) { m.remove(); });
                    if (mode !== 'full') return;
                    var d = hi(); if (d <= 0) return;
                    chapters.forEach(function (c) {
                        var st = parseFloat(c.getAttribute('data-seek') || '0');
                        if (st <= 0 || st >= d) return;
                        var m = document.createElement('span'); m.className = 'vplayer-marker'; m.style.left = ((st / d) * 100) + '%';
                        track.appendChild(m);
                    });
                }

                function setMode(next) {
                    if (mode === next) return;
                    mode = next;
                    toggleBtn.textContent = mode === 'segment' ? 'Full service' : 'Just the message';
                    toggleBtn.setAttribute('aria-pressed', String(mode === 'full'));
                    durEl.textContent = fmt(span());
                    buildMarkers();
                }

                function doSeek(t) {
                    if (mode === 'segment' && (t < segStart - 0.5 || t > segEnd + 0.5)) setMode('full');
                    try { player.seekTo(t, true); player.playVideo(); } catch (e) {}
                }

                function frac(clientX) { var r = track.getBoundingClientRect(); return Math.min(1, Math.max(0, (clientX - r.left) / r.width)); }
                function preview(f) { fill.style.width = (f * 100) + '%'; knob.style.left = (f * 100) + '%'; curEl.textContent = fmt(f * span()); }

                poster.addEventListener('click', start);

                playBtn.addEventListener('click', function () {
                    if (!ready) return;
                    try { player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); } catch (e) {}
                });

                toggleBtn.addEventListener('click', function () {
                    if (!ready) { setMode(mode === 'segment' ? 'full' : 'segment'); return; }
                    setMode(mode === 'segment' ? 'full' : 'segment');
                });

                scrub.addEventListener('pointerdown', function (e) {
                    if (!ready) return;
                    scrubbing = true; try { scrub.setPointerCapture(e.pointerId); } catch (er) {}
                    preview(frac(e.clientX));
                });
                scrub.addEventListener('pointermove', function (e) { if (scrubbing) preview(frac(e.clientX)); });
                scrub.addEventListener('pointerup', function (e) {
                    if (!scrubbing) return; scrubbing = false;
                    var f = frac(e.clientX); doSeek(lo() + f * span());
                });
                scrub.addEventListener('keydown', function (e) {
                    if (!ready) return;
                    var step = e.shiftKey ? 30 : 5, t = player.getCurrentTime();
                    if (e.key === 'ArrowRight') { doSeek(Math.min(hi(), t + step)); e.preventDefault(); }
                    else if (e.key === 'ArrowLeft') { doSeek(Math.max(lo(), t - step)); e.preventDefault(); }
                });

                chapters.forEach(function (ch) {
                    ch.addEventListener('click', function () {
                        var t = parseFloat(ch.getAttribute('data-seek') || '0');
                        if (ready) doSeek(t);
                        else { pendingSeek = t; start(); }
                    });
                });
            })();
        </script>
    </body>`
}
