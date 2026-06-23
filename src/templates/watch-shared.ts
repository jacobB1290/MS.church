// Shared rendering helpers for the /watch library, its permalink pages, and the
// topic pages. Pure + dependency-free so every watch surface renders cards,
// labels, and timestamps the same way (single source of truth — the hub, a
// topic page, and a "more like this" rail can never drift).

import type { PublishedSermon, SermonSegment, SermonFormat } from '../sermons-feed.js'
import { topicSlug, itemTopic } from '../sermons-feed.js'

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** "mm:ss" or "h:mm:ss". */
export function mmss(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

export function longDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Boise',
  })
}

/** "Jun 21, 2026" — compact dateline for cards. */
export function shortDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Boise',
  })
}

/** "42 min" / "1 hr 12 min". */
export function lengthLabel(totalSec: number | null): string | null {
  if (!totalSec || totalSec <= 0) return null
  const mins = Math.round(totalSec / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

export function posterFor(videoId: string, thumb: string | null): string {
  return thumb || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

// Friendly chapter-type labels — mirrors the CRM segmenter's vocabulary.
export const SEGMENT_LABEL: Record<string, string> = {
  welcome: 'Welcome',
  worship: 'Worship',
  scripture: 'Scripture',
  prayer: 'Prayer',
  sermon: 'Sermon',
  discussion: 'Discussion',
  poem: 'Poem',
  testimony: 'Testimony',
  offering: 'Offering',
  announcement: 'Announcement',
  benediction: 'Benediction',
  other: 'Other',
}

/** The library-tab noun for a service's message format. */
export function formatNoun(format: SermonFormat): string {
  return format === 'discussion' ? 'Discussion' : 'Sermon'
}

/**
 * The "message" segment a permalink plays by default — the part people came for,
 * not the welcome or the worship. For a sermon that's the sermon chapter; for a
 * discussion it's the discussion chapter. Falls back to the longest substantive
 * chapter, then to the whole service when a video has no chapters.
 */
export function primarySegment(sermon: PublishedSermon): SermonSegment | null {
  const segs = sermon.segments
  if (segs.length === 0) return null
  const want = sermon.format === 'discussion' ? 'discussion' : 'sermon'
  const byType = segs.filter((s) => s.type === want)
  const longest = (list: SermonSegment[]) =>
    list.reduce<SermonSegment | null>(
      (best, s) => (!best || s.endSec - s.startSec > best.endSec - best.startSec ? s : best),
      null,
    )
  if (byType.length > 0) return longest(byType)
  // No explicit message chapter: longest chapter that isn't pure preamble.
  const substantive = segs.filter((s) => !['welcome', 'worship', 'offering', 'announcement'].includes(s.type))
  return longest(substantive.length > 0 ? substantive : segs)
}

/** A short, human speaker line ("with Pastor John" / "John and Mark"). */
export function speakerLine(speakers: string[]): string | null {
  const clean = speakers.map((s) => s.trim()).filter(Boolean)
  if (clean.length === 0) return null
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`
}

/** The preview line under a card title: the summary, trimmed to ~150 chars. */
export function previewText(sermon: PublishedSermon): string {
  const raw = (sermon.summary ?? sermon.seo?.description ?? '').trim()
  if (raw.length <= 160) return raw
  const cut = raw.slice(0, 157)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

/** The single topic that represents this item (one tag per the design). */
export function primaryTopic(sermon: PublishedSermon): string | null {
  return itemTopic(sermon)
}

const ICON_PLAY = `<svg class="icon-play" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`
const ICON_PAUSE = `<svg class="icon-pause" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>`
const POSTER_PLAY = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`

/**
 * The reusable custom segment player. ONE implementation, used both inline on a
 * message/song card and full-width on the permalink (driven by `watchPlayerScript`
 * below). By default its scrubber spans only the message segment; the permalink
 * variant adds the "Full service" toggle + chapter wiring.
 *
 *   variant 'card' — compact bar, no toggle. The card IS the player.
 *   variant 'main' — permalink hero; honors ?full / ?t and owns the chapter list.
 */
export function vplayer(
  sermon: PublishedSermon,
  primary: SermonSegment | null,
  variant: 'card' | 'main',
  posterAlt: string,
): string {
  const poster = posterFor(sermon.youtubeVideoId, sermon.thumbnailUrl)
  const segStart = primary ? Math.floor(primary.startSec) : 0
  const segEnd = primary ? Math.floor(primary.endSec) : 0
  const duration = Math.floor(sermon.durationSec ?? 0)
  const isMain = variant === 'main'
  const kindBadge = variant === 'card' ? `<span class="watch-card-kind">${escapeHtml(formatNoun(sermon.format))}</span>` : ''
  return `<div class="vplayer vplayer--${variant}" data-video="${escapeHtml(sermon.youtubeVideoId)}" data-start="${segStart}" data-end="${segEnd}" data-duration="${duration}"${isMain ? ' data-chapters data-allow-params' : ''}>
                            <div class="vplayer-stage">
                                <button class="vplayer-poster" type="button" aria-label="Play ${escapeHtml(sermon.title)}">
                                    <img src="${escapeHtml(poster)}" alt="${escapeHtml(posterAlt)}" width="1280" height="720" loading="lazy" decoding="async"
                                         onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${escapeHtml(sermon.youtubeVideoId)}/hqdefault.jpg';">
                                    <span class="vplayer-poster-scrim" aria-hidden="true"></span>
                                    <span class="vplayer-poster-play">${POSTER_PLAY}</span>
                                    ${kindBadge}
                                </button>
                            </div>
                            <div class="vplayer-bar" hidden>
                                <button class="vplayer-btn" type="button" data-act="toggle" aria-label="Play or pause">${ICON_PLAY}${ICON_PAUSE}</button>
                                <div class="vplayer-mid">
                                    <span class="vplayer-time" data-cur>0:00</span>
                                    <div class="vplayer-scrub" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                                        <div class="vplayer-track"><div class="vplayer-fill"></div><div class="vplayer-knob"></div></div>
                                    </div>
                                    <span class="vplayer-time" data-dur>0:00</span>
                                </div>
                                ${isMain ? `<button class="vplayer-toggle" type="button" data-act="mode" aria-pressed="false">Full service</button>` : ''}
                            </div>
                        </div>`
}

/**
 * Full-service card — for the "Watch a full service" browse. A plain link to the
 * permalink in full-service mode (you go there to watch the whole thing).
 * Duration badge, no topic, no blurb. Posters are lazy (below the featured LCP).
 */
export function serviceCard(sermon: PublishedSermon): string {
  const href = `/watch/${escapeHtml(sermon.slug)}?full=1`
  const poster = posterFor(sermon.youtubeVideoId, sermon.thumbnailUrl)
  const noun = formatNoun(sermon.format)
  const len = lengthLabel(sermon.durationSec)
  const metaBits = [shortDate(sermon.publishedAt), speakerLine(sermon.speakers) ? `with ${escapeHtml(speakerLine(sermon.speakers)!)}` : null]
    .filter(Boolean)
    .map((b) => `<span>${b}</span>`)
    .join('<span class="watch-card-dot" aria-hidden="true">·</span>')
  return `<article class="watch-card watch-card--service">
                        <a class="watch-card-link" href="${href}" aria-label="${escapeHtml(`Watch the full service: ${sermon.title}`)}">
                            <span class="watch-card-thumb">
                                <img src="${escapeHtml(poster)}"
                                     alt="${escapeHtml(`${sermon.title} — Sunday service from Morning Star Christian Church in Boise, Idaho`)}"
                                     width="1280" height="720" loading="lazy" decoding="async"
                                     onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${escapeHtml(sermon.youtubeVideoId)}/hqdefault.jpg';">
                                <span class="watch-card-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>
                                ${len ? `<span class="watch-card-kind watch-card-kind--len">${escapeHtml(len)}</span>` : ''}
                            </span>
                            <span class="watch-card-body">
                                ${metaBits ? `<span class="watch-card-meta">${metaBits}</span>` : ''}
                                <span class="watch-card-title">${escapeHtml(sermon.title)}</span>
                            </span>
                        </a>
                    </article>`
}

/**
 * Message card — for the "Sermons & discussions" browse and topic pages. The card
 * IS an inline segment player: tapping it plays the sermon (or discussion) right
 * there, just the message. Jumping to the full service page is a small optional
 * link. One topic tag, a brief preview, and a data-topic hook for the filter.
 */
export function messageCard(sermon: PublishedSermon): string {
  const noun = formatNoun(sermon.format)
  const topic = primaryTopic(sermon)
  const topicChip = topic ? topicSlug(topic) : ''
  const primary = primarySegment(sermon)
  const date = shortDate(sermon.publishedAt)
  const speaker = speakerLine(sermon.speakers)
  const preview = previewText(sermon)
  const metaBits = [date, speaker ? `with ${escapeHtml(speaker)}` : null]
    .filter(Boolean)
    .map((b) => `<span>${b}</span>`)
    .join('<span class="watch-card-dot" aria-hidden="true">·</span>')
  const posterAlt = `${sermon.title} — ${noun.toLowerCase()} from Morning Star Christian Church in Boise, Idaho`
  return `<article class="watch-card watch-card--message" data-topic="${escapeHtml(topicChip)}">
                        ${vplayer(sermon, primary, 'card', posterAlt)}
                        <div class="watch-card-body">
                            ${metaBits ? `<span class="watch-card-meta">${metaBits}</span>` : ''}
                            <span class="watch-card-title">${escapeHtml(sermon.title)}</span>
                            ${preview ? `<span class="watch-card-preview">${escapeHtml(preview)}</span>` : ''}
                            <div class="watch-card-foot">
                                ${topic ? `<a class="watch-card-topic" href="/watch/topic/${escapeHtml(topicChip)}">${escapeHtml(topic)}</a>` : '<span></span>'}
                                <a class="watch-card-full" href="/watch/${escapeHtml(sermon.slug)}">Full service<span aria-hidden="true"> &rarr;</span></a>
                            </div>
                        </div>
                    </article>`
}

/**
 * The reusable client player. Initializes EVERY `.vplayer` on the page (inline
 * cards + the permalink hero) from one implementation. Segment-only scrubber,
 * one-at-a-time playback (starting one pauses the others), a native-embed
 * fallback if the IFrame API can't load, and — for the `data-chapters`/
 * `data-allow-params` main player — the chapter seeks + the Full-service toggle +
 * ?full/?t deep-link handling. Emitted once per page (hub + permalink).
 */
export function watchPlayerScript(): string {
  return `<script>
            (function () {
                var active = null, apiPromise = null;
                function loadAPI() {
                    if (window.YT && window.YT.Player) return Promise.resolve();
                    if (apiPromise) return apiPromise;
                    apiPromise = new Promise(function (res) {
                        var prev = window.onYouTubeIframeAPIReady;
                        window.onYouTubeIframeAPIReady = function () { if (prev) prev(); res(); };
                        var s = document.createElement('script'); s.id = 'yt-iframe-api'; s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
                    });
                    return apiPromise;
                }
                function fmt(t) { t = Math.max(0, Math.floor(t)); var h = Math.floor(t/3600), m = Math.floor((t%3600)/60), s = t%60; var ss = ('0'+s).slice(-2); return h>0 ? h+':'+('0'+m).slice(-2)+':'+ss : m+':'+ss; }

                function initPlayer(root) {
                    var videoId = root.getAttribute('data-video');
                    var segStart = parseFloat(root.getAttribute('data-start')) || 0;
                    var segEnd = parseFloat(root.getAttribute('data-end')) || 0;
                    var fullDur = parseFloat(root.getAttribute('data-duration')) || 0;
                    var hasSeg = segEnd > segStart + 1;
                    var ownsChapters = root.hasAttribute('data-chapters');
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
                    var chapters = ownsChapters ? Array.prototype.slice.call(document.querySelectorAll('.watch-chapter')) : [];

                    var player = null, ready = false, scrubbing = false, pendingSeek = null, fellBack = false;
                    var mode = hasSeg ? 'segment' : 'full';
                    var raf = null, fallbackTimer = null, frameId = 'vpf-' + Math.random().toString(36).slice(2);

                    if (root.hasAttribute('data-allow-params')) {
                        try {
                            var params = new URLSearchParams(location.search);
                            if (params.get('full') === '1') mode = 'full';
                            var tp = parseFloat(params.get('t'));
                            if (!isNaN(tp)) { mode = 'full'; pendingSeek = tp; }
                        } catch (e) {}
                    }

                    function lo() { return mode === 'segment' ? segStart : 0; }
                    function hi() { var d = fullDur || (player && player.getDuration ? player.getDuration() : 0) || 0; return mode === 'segment' ? segEnd : d; }
                    function span() { return Math.max(0.001, hi() - lo()); }

                    var api = { pause: function () { try { if (player && player.pauseVideo) player.pauseVideo(); } catch (e) {} } };
                    function claim() { if (active && active !== api) active.pause(); active = api; }

                    function start() {
                        if (player || fellBack) return;
                        claim();
                        poster.setAttribute('disabled', '');
                        var mount = document.createElement('div'); mount.id = frameId; mount.className = 'vplayer-frame'; stage.appendChild(mount);
                        fallbackTimer = setTimeout(function () { if (!ready) nativeFallback(); }, 6000);
                        loadAPI().then(function () {
                            if (fellBack) return;
                            player = new YT.Player(frameId, {
                                videoId: videoId,
                                playerVars: { controls: 0, rel: 0, modestbranding: 1, playsinline: 1, fs: 1, start: Math.floor(lo()), autoplay: 1, origin: location.origin },
                                events: { onReady: onReady, onStateChange: onState }
                            });
                        }).catch(function () { if (!ready) nativeFallback(); });
                    }
                    function nativeFallback() {
                        if (fellBack || ready) return; fellBack = true;
                        var m = document.getElementById(frameId); if (m) m.remove();
                        poster.style.display = 'none';
                        var f = document.createElement('iframe'); f.className = 'vplayer-frame';
                        f.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&start=' + Math.floor(lo());
                        f.title = 'Service video from Morning Star Christian Church';
                        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.setAttribute('allowfullscreen', '');
                        stage.appendChild(f);
                    }
                    function onReady() {
                        ready = true; if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
                        poster.style.display = 'none'; bar.hidden = false;
                        durEl.textContent = fmt(span()); buildMarkers();
                        if (pendingSeek != null) { doSeek(pendingSeek); pendingSeek = null; } else { try { player.playVideo(); } catch (e) {} }
                        loop();
                    }
                    function onState(e) { root.classList.toggle('is-playing', e.data === 1); if (e.data === 1) claim(); }
                    function loop() {
                        cancelAnimationFrame(raf);
                        (function tick() {
                            if (ready && player && player.getCurrentTime) {
                                var t = player.getCurrentTime();
                                if (mode === 'segment' && t >= segEnd - 0.2) { try { player.pauseVideo(); player.seekTo(segStart, true); } catch (e) {} t = segStart; root.classList.remove('is-playing'); }
                                if (!scrubbing) {
                                    var p = Math.min(1, Math.max(0, (t - lo()) / span()));
                                    fill.style.width = (p*100) + '%'; knob.style.left = (p*100) + '%';
                                    curEl.textContent = fmt(Math.max(0, t - lo()));
                                    scrub.setAttribute('aria-valuenow', String(Math.round(p*100)));
                                    if (ownsChapters) highlight(t);
                                }
                            }
                            raf = requestAnimationFrame(tick);
                        })();
                    }
                    function highlight(t) {
                        var idx = -1;
                        for (var i = 0; i < chapters.length; i++) { if (t + 0.5 >= parseFloat(chapters[i].getAttribute('data-seek') || '0')) idx = i; }
                        chapters.forEach(function (c, i) { c.classList.toggle('is-current', i === idx); });
                    }
                    function buildMarkers() {
                        if (!track) return;
                        track.querySelectorAll('.vplayer-marker').forEach(function (m) { m.remove(); });
                        if (mode !== 'full' || !ownsChapters) return;
                        var d = hi(); if (d <= 0) return;
                        chapters.forEach(function (c) {
                            var st = parseFloat(c.getAttribute('data-seek') || '0'); if (st <= 0 || st >= d) return;
                            var m = document.createElement('span'); m.className = 'vplayer-marker'; m.style.left = ((st/d)*100) + '%'; track.appendChild(m);
                        });
                    }
                    function setMode(next) {
                        if (mode === next) return; mode = next;
                        if (toggleBtn) { toggleBtn.textContent = mode === 'segment' ? 'Full service' : 'Just the message'; toggleBtn.setAttribute('aria-pressed', String(mode === 'full')); }
                        durEl.textContent = fmt(span()); buildMarkers();
                    }
                    function doSeek(t) {
                        if (mode === 'segment' && (t < segStart - 0.5 || t > segEnd + 0.5)) setMode('full');
                        try { player.seekTo(t, true); player.playVideo(); } catch (e) {}
                    }
                    function frac(clientX) { var r = track.getBoundingClientRect(); return Math.min(1, Math.max(0, (clientX - r.left) / r.width)); }
                    function preview(f) { fill.style.width = (f*100) + '%'; knob.style.left = (f*100) + '%'; curEl.textContent = fmt(f * span()); }

                    poster.addEventListener('click', start);
                    playBtn.addEventListener('click', function () { if (!ready) return; try { player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); } catch (e) {} });
                    if (toggleBtn) toggleBtn.addEventListener('click', function () { setMode(mode === 'segment' ? 'full' : 'segment'); });
                    scrub.addEventListener('pointerdown', function (e) { if (!ready) return; scrubbing = true; try { scrub.setPointerCapture(e.pointerId); } catch (er) {} preview(frac(e.clientX)); });
                    scrub.addEventListener('pointermove', function (e) { if (scrubbing) preview(frac(e.clientX)); });
                    scrub.addEventListener('pointerup', function (e) { if (!scrubbing) return; scrubbing = false; doSeek(lo() + frac(e.clientX) * span()); });
                    scrub.addEventListener('keydown', function (e) { if (!ready) return; var step = e.shiftKey ? 30 : 5, t = player.getCurrentTime(); if (e.key === 'ArrowRight') { doSeek(Math.min(hi(), t + step)); e.preventDefault(); } else if (e.key === 'ArrowLeft') { doSeek(Math.max(lo(), t - step)); e.preventDefault(); } });
                    chapters.forEach(function (ch) { ch.addEventListener('click', function () { var t = parseFloat(ch.getAttribute('data-seek') || '0'); if (ready) doSeek(t); else { pendingSeek = t; start(); } }); });
                }

                document.querySelectorAll('.vplayer').forEach(initPlayer);
            })();
        </script>`
}
