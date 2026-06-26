// Shared rendering helpers for the /watch library, its permalink pages, and the
// topic pages. Pure + dependency-free so every watch surface renders cards,
// labels, and timestamps the same way (single source of truth — the hub, a
// topic page, and a "more like this" rail can never drift).

import type { PublishedSermon, SermonSegment, SermonFormat, SermonSong } from '../sermons-feed.js'
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
const ICON_EXPAND = `<svg class="icon-expand" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>`

/**
 * The reusable custom segment player. ONE implementation, used both inline on a
 * message/song card and full-width on the permalink (driven by `watchPlayerScript`
 * below). By default its scrubber spans only the message segment; the permalink
 * variant adds the "Full service" toggle + chapter wiring.
 *
 *   variant 'card'    — compact bar, no toggle. The card IS the player.
 *   variant 'main'    — permalink hero; honors ?full / ?t and owns the chapter list.
 *   variant 'feature' — the hub's full-service hero; plays the WHOLE service
 *                       (no segment), poster eager. Its video can be swapped by
 *                       the date selector (the player reads its data attrs live).
 *
 * `segOverride` lets a song card play an arbitrary [start,end] slice instead of
 * the message segment.
 */
export function vplayer(
  sermon: PublishedSermon,
  primary: SermonSegment | null,
  variant: 'card' | 'main' | 'feature',
  posterAlt: string,
  segOverride?: { startSec: number; endSec: number } | null,
  badge?: string | null,
  fadeAudio?: boolean,
): string {
  const poster = posterFor(sermon.youtubeVideoId, sermon.thumbnailUrl)
  const seg = segOverride ?? primary
  const segStart = seg ? Math.floor(seg.startSec) : 0
  const segEnd = seg ? Math.floor(seg.endSec) : 0
  const duration = Math.floor(sermon.durationSec ?? 0)
  const isMain = variant === 'main'
  const isFeature = variant === 'feature'
  const badgeText = badge === undefined ? (variant === 'card' ? formatNoun(sermon.format) : '') : badge || ''
  const kindBadge = badgeText ? `<span class="watch-card-kind">${escapeHtml(badgeText)}</span>` : ''
  const loadAttr = isFeature ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"'
  return `<div class="vplayer vplayer--${variant}" data-video="${escapeHtml(sermon.youtubeVideoId)}" data-start="${segStart}" data-end="${segEnd}" data-duration="${duration}"${isMain ? ' data-chapters data-allow-params' : ''}${fadeAudio ? ' data-fade' : ''}>
                            <div class="vplayer-stage">
                                <button class="vplayer-poster" type="button" aria-label="Play ${escapeHtml(sermon.title)}">
                                    <img src="${escapeHtml(poster)}" alt="${escapeHtml(posterAlt)}" width="1280" height="720" ${loadAttr}
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
                                <div class="vplayer-actions">
                                    ${isMain ? `<button class="vplayer-toggle" type="button" data-act="mode" aria-pressed="false">Full service</button>` : ''}
                                    <button class="vplayer-btn vplayer-btn--fs" type="button" data-act="fullscreen" aria-label="Full screen">${ICON_EXPAND}</button>
                                </div>
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
  const svcSpeaker = speakerLine(sermon.speakers)
  const metaBits = [
    shortDate(sermon.publishedAt) ? `<span class="watch-card-date">${shortDate(sermon.publishedAt)}</span>` : null,
    svcSpeaker ? `<span class="watch-card-who">with ${escapeHtml(svcSpeaker)}</span>` : null,
  ]
    .filter(Boolean)
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
export function messageCard(sermon: PublishedSermon, sid?: string): string {
  const noun = formatNoun(sermon.format)
  const topic = primaryTopic(sermon)
  const topicChip = topic ? topicSlug(topic) : ''
  const primary = primarySegment(sermon)
  const date = shortDate(sermon.publishedAt)
  const speaker = speakerLine(sermon.speakers)
  const preview = previewText(sermon)
  const metaBits = [
    date ? `<span class="watch-card-date">${date}</span>` : null,
    speaker ? `<span class="watch-card-who">with ${escapeHtml(speaker)}</span>` : null,
  ]
    .filter(Boolean)
    .join('<span class="watch-card-dot" aria-hidden="true">·</span>')
  const posterAlt = `${sermon.title} — ${noun.toLowerCase()} from Morning Star Christian Church in Boise, Idaho`
  return `<article class="watch-card watch-card--message" data-topic="${escapeHtml(topicChip)}"${sid ? ` data-sid="${escapeHtml(sid)}"` : ''}>
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
 * Song card — for the Songs library. The card IS an inline player scoped to the
 * song's clip (segOverride), so tapping it plays just that song. Title + who led
 * it; the small jump opens the full service at the song's moment.
 */
export function songCard(sermon: PublishedSermon, song: SermonSong, count = 1, sid?: string): string {
  const isProgram = song.kind === 'program'
  const posterAlt = `${song.title} — ${isProgram ? 'program song' : 'worship'} at Morning Star Christian Church in Boise, Idaho`
  const who = song.leader ? `${isProgram ? 'sung by' : 'led by'} ${escapeHtml(song.leader)}` : null
  const times = count > 1 ? `sung ${count} times` : null
  const songDate = count > 1 ? `latest ${shortDate(sermon.publishedAt)}` : shortDate(sermon.publishedAt)
  const metaBits = [
    who ? `<span class="watch-card-who">${who}</span>` : null,
    times ? `<span>${times}</span>` : null,
    songDate ? `<span class="watch-card-date">${songDate}</span>` : null,
  ]
    .filter(Boolean)
    .join('<span class="watch-card-dot" aria-hidden="true">·</span>')
  const topicChip = song.topic ? topicSlug(song.topic) : ''
  return `<article class="watch-card watch-card--message watch-card--song" data-kind="${song.kind}" data-topic="${escapeHtml(topicChip)}"${sid ? ` data-sid="${escapeHtml(sid)}"` : ''}>
                        ${vplayer(sermon, null, 'card', posterAlt, { startSec: song.startSec, endSec: song.endSec }, isProgram ? 'Program' : '', true)}
                        <div class="watch-card-body">
                            ${metaBits ? `<span class="watch-card-meta">${metaBits}</span>` : ''}
                            <span class="watch-card-title">${escapeHtml(song.title)}</span>
                            <div class="watch-card-foot">
                                ${song.topic ? `<a class="watch-card-topic" href="/watch/topic/${escapeHtml(topicChip)}">${escapeHtml(song.topic)}</a>` : '<span></span>'}
                                <a class="watch-card-full" href="/watch/${escapeHtml(sermon.slug)}?t=${Math.floor(song.startSec)}">Full service<span aria-hidden="true"> &rarr;</span></a>
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
                // Load the IFrame API IMMEDIATELY. /watch is a video page, so warming
                // it up front means window.YT is almost always ready by the first tap —
                // which lets start() build the player SYNCHRONOUSLY inside the click
                // gesture (so it autoplays WITH SOUND on the first press, instead of
                // playing from an async onReady that the browser blocks out-of-gesture).
                loadAPI();

                // Pool of PRELOADED (loaded, paused) players. Preloading the player BEFORE
                // the tap is the whole fix: a ready player's playVideo() called inside the
                // tap gesture starts on the FIRST press (the home-hero technique). Cap the
                // idle ones so a long grid can't pile up iframes; a playing one is dropped
                // from the pool and never evicted.
                var pool = [];
                function poolAdd(rec) { if (pool.indexOf(rec) >= 0) return; pool.push(rec); while (pool.length > 4) { var r = pool.shift(); if (r && r.evict) try { r.evict(); } catch (e) {} } }
                function poolDrop(rec) { var i = pool.indexOf(rec); if (i >= 0) pool.splice(i, 1); }
                // Preload a card's player once it has dwelt in view (so the play on tap is
                // in-gesture), and release it when it scrolls well away.
                var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
                    entries.forEach(function (en) { var fn = en.target.__vpVisible; if (fn) fn(en.isIntersecting); });
                }, { rootMargin: '120px 0px 120px 0px', threshold: 0.25 }) : null;

                function fmt(t) { t = Math.max(0, Math.floor(t)); var h = Math.floor(t/3600), m = Math.floor((t%3600)/60), s = t%60; var ss = ('0'+s).slice(-2); return h>0 ? h+':'+('0'+m).slice(-2)+':'+ss : m+':'+ss; }

                function initPlayer(root) {
                    if (root.__vpInit) return; root.__vpInit = true;
                    // Read live so the date selector can swap the featured video.
                    function vid() { return root.getAttribute('data-video'); }
                    function segStart() { return parseFloat(root.getAttribute('data-start')) || 0; }
                    function segEnd() { return parseFloat(root.getAttribute('data-end')) || 0; }
                    function fullDur() { return parseFloat(root.getAttribute('data-duration')) || 0; }
                    function hasSeg() { return segEnd() > segStart() + 1; }
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
                    var fsBtn = root.querySelector('[data-act="fullscreen"]');
                    var fsCard = root.closest('.watch-card');
                    var chapters = ownsChapters ? Array.prototype.slice.call(document.querySelectorAll('.watch-chapter')) : [];

                    var player = null, ready = false, scrubbing = false, pendingSeek = null, fellBack = false, started = false, revealed = false;
                    // Muted auto-start used by the home "play" hand-off: the browser
                    // only allows autoplay without a gesture when muted, so the feature
                    // begins muted and offers a one-tap "sound" pill.
                    var wantMute = false;
                    // Audio fade for song clips (data-fade): the clip eases up from silence
                    // as it starts and eases back down as it reaches its end, so a tapped
                    // song never cuts in or out abruptly. Only song cards opt in; the hero
                    // and the message play at full volume. iOS ignores setVolume (hardware
                    // volume), so it just plays normally there — no fade, never stuck silent.
                    var doFade = root.hasAttribute('data-fade');
                    var fadeRaf = null, targetVol = null, didFadeIn = false, didFadeOut = false;
                    var FADE_IN_MS = 800, FADE_OUT_MS = 700;
                    var reduceMotion = false; try { reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
                    function cancelFade() { if (fadeRaf) { cancelAnimationFrame(fadeRaf); fadeRaf = null; } }
                    function rampVol(from, to, ms) {
                        cancelFade();
                        if (!player || !player.setVolume) return;
                        if (reduceMotion || ms <= 0) { try { player.setVolume(Math.round(to)); } catch (e) {} return; }
                        var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
                        (function step() {
                            var now = (window.performance && performance.now) ? performance.now() : Date.now();
                            var k = Math.min(1, (now - t0) / ms);
                            var eased = 0.5 - 0.5 * Math.cos(Math.PI * k); // easeInOutSine, gentle on the ear
                            try { player.setVolume(Math.round(from + (to - from) * eased)); } catch (er) {}
                            if (k < 1) fadeRaf = requestAnimationFrame(step); else fadeRaf = null;
                        })();
                    }
                    function fadeInAudio() { try { player.setVolume(0); } catch (e) {} rampVol(0, targetVol == null ? 100 : targetVol, FADE_IN_MS); }
                    function fadeOutAudio(ms) { var cur = 100; try { cur = player.getVolume(); } catch (e) {} if (cur == null || isNaN(cur)) cur = (targetVol == null ? 100 : targetVol); rampVol(cur, 0, ms); }
                    var isHero = root.classList.contains('vplayer--main') || root.classList.contains('vplayer--feature');
                    var mode = hasSeg() ? 'segment' : 'full';
                    var raf = null, fallbackTimer = null, dwellTimer = null, frameId = 'vpf-' + Math.random().toString(36).slice(2);
                    var poolRec = { evict: evictIdle };

                    if (root.hasAttribute('data-allow-params')) {
                        try {
                            var params = new URLSearchParams(location.search);
                            if (params.get('full') === '1') mode = 'full';
                            var tp = parseFloat(params.get('t'));
                            if (!isNaN(tp)) { mode = 'full'; pendingSeek = tp; }
                        } catch (e) {}
                    }

                    function lo() { return mode === 'segment' ? segStart() : 0; }
                    function hi() { var d = fullDur() || (player && player.getDuration ? player.getDuration() : 0) || 0; return mode === 'segment' ? segEnd() : d; }
                    function span() { return Math.max(0.001, hi() - lo()); }

                    var api = { pause: function () { try { if (player && player.pauseVideo) player.pauseVideo(); } catch (e) {} } };
                    function claim() { if (active && active !== api) active.pause(); active = api; }

                    // Reset to the poster state — used when the date selector swaps the
                    // featured player's video so the next play loads the new one.
                    root.__resetPlayer = function () {
                        poolDrop(poolRec); if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; }
                        try { if (player && player.destroy) player.destroy(); } catch (e) {}
                        player = null; ready = false; fellBack = false; pendingSeek = null; started = false; revealed = false;
                        if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
                        cancelAnimationFrame(raf);
                        cancelFade(); targetVol = null; didFadeIn = false; didFadeOut = false;
                        var fr = stage.querySelector('.vplayer-frame'); if (fr) fr.remove();
                        poster.style.display = ''; poster.removeAttribute('disabled'); root.classList.remove('is-loading');
                        bar.hidden = true; root.classList.remove('is-playing');
                        mode = hasSeg() ? 'segment' : 'full';
                        if (active === api) active = null;
                    };

                    // Build the player NOW, paused (autoplay:0), hidden behind our poster, so
                    // it's fully initialized before any tap. Then start() can play it inside
                    // the user gesture and it starts on the first press.
                    // Construct the YT.Player. When window.YT is already loaded this runs
                    // SYNCHRONOUSLY (new YT.Player builds its iframe inline), so calling it
                    // inside a click gesture with autoplay:1 lets the video start WITH SOUND
                    // on the first press. Returns true if the player was built (or already
                    // exists), false if the API isn't loaded yet (caller falls back).
                    function buildPlayer(autoplay) {
                        if (player) return true;
                        if (fellBack || !vid() || !(window.YT && window.YT.Player)) return false;
                        var mount = document.createElement('div'); mount.id = frameId; mount.className = 'vplayer-frame'; stage.appendChild(mount);
                        try {
                            player = new YT.Player(frameId, {
                                videoId: vid(),
                                playerVars: { controls: 0, rel: 0, modestbranding: 1, playsinline: 1, fs: 1, start: Math.floor(lo()), autoplay: autoplay ? 1 : 0, mute: (autoplay && wantMute) ? 1 : 0, origin: location.origin },
                                events: { onReady: onReady, onStateChange: onState }
                            });
                            return true;
                        } catch (e) { var m = document.getElementById(frameId); if (m) m.remove(); return false; }
                    }
                    // Silent preload: build the paused player ahead of the tap so the tap can
                    // just playVideo() it in-gesture. Never starts playback itself — that is
                    // start()'s job, inside the gesture.
                    function preload() {
                        if (player || fellBack || !vid()) return;
                        if (!isHero) poolAdd(poolRec);
                        if (buildPlayer(false)) return;
                        loadAPI().then(function () { if (!fellBack && !player) buildPlayer(false); }).catch(function () {});
                    }
                    function evictIdle() {
                        if (started) return;
                        cancelFade();
                        try { if (player && player.destroy) player.destroy(); } catch (e) {}
                        player = null; ready = false;
                        var fr = stage.querySelector('.vplayer-frame'); if (fr) fr.remove();
                    }
                    // Hand the stage to the player — only once playback is CONFIRMED, so our
                    // poster never blinks away to reveal YouTube's own play screen.
                    function reveal() {
                        if (revealed) return; revealed = true;
                        root.classList.remove('is-loading');
                        poster.style.display = 'none'; bar.hidden = false;
                        durEl.textContent = fmt(span()); buildMarkers(); loop();
                        showUnmute();
                    }

                    // The tap. Plays the (preloaded, ready) player inside the gesture. If the
                    // player isn't up yet, build it and play the instant it's ready.
                    function start() {
                        if (fellBack) return;
                        if (started) { try { if (player && player.playVideo) player.playVideo(); } catch (e) {} return; }
                        started = true; poolDrop(poolRec); claim();
                        root.classList.add('is-loading'); poster.setAttribute('disabled', '');
                        // We are INSIDE the user's click gesture here. The whole point is to
                        // begin playback NOW, in this call stack, so the browser grants
                        // autoplay WITH SOUND and YouTube never shows its own play screen.
                        if (player && ready) {
                            // Preloaded player is up: just play it (keeps the custom scrubber).
                            if (pendingSeek != null) { doSeek(pendingSeek); pendingSeek = null; }
                            else { try { player.playVideo(); } catch (e) {} }
                        } else {
                            // Not confirmed-ready. Drop any half-built (autoplay:0) preload so we
                            // can rebuild with autoplay ON inside this gesture.
                            if (player && !ready) { try { if (player.destroy) player.destroy(); } catch (e) {} player = null; var pf = stage.querySelector('.vplayer-frame'); if (pf) pf.remove(); }
                            // Preferred: build the API player NOW (synchronous when the API is
                            // loaded) with autoplay:1 — first-press start, with sound, and the
                            // custom scrubber / segment clip / chapters all still work.
                            if (!buildPlayer(true)) {
                                // API not loaded yet: a raw autoplay embed created in this same
                                // gesture also starts with sound (loses the scrubber until reload).
                                gestureAutoplay(false);
                                return;
                            }
                        }
                        // Reveal/repair watchdog. Playback was already initiated in-gesture above;
                        // this only rescues the rare case where neither the API player nor its
                        // events ever came up. Out of gesture it can only autoplay MUTED, so it
                        // does exactly that and offers a one-tap sound pill — never a dead
                        // "press play on YouTube" screen.
                        if (!fallbackTimer) fallbackTimer = setTimeout(function () { if (!revealed) gestureAutoplay(); }, 2500);
                    }
                    // Start muted on arrival (no user gesture) for the home hand-off.
                    root.__autostartMuted = function () {
                        if (started || fellBack) return;
                        wantMute = true; started = true; poolDrop(poolRec); claim();
                        root.classList.add('is-loading'); poster.setAttribute('disabled', '');
                        // No user gesture on arrival (cross-document hand-off), so this MUST be
                        // muted per autoplay policy. Build with autoplay+mute so it starts on its
                        // own; a one-tap sound pill is offered once it reveals.
                        if (player && ready) { try { player.mute(); player.playVideo(); } catch (e) {} }
                        else if (!buildPlayer(true)) { loadAPI().then(function () { if (!fellBack && !player) buildPlayer(true); }).catch(function () {}); }
                        if (!fallbackTimer) fallbackTimer = setTimeout(function () { if (!revealed) gestureAutoplay(); }, 3000);
                    };
                    function showUnmute() {
                        if (!wantMute || root.querySelector('.vplayer-unmute')) return;
                        var b = document.createElement('button');
                        b.type = 'button'; b.className = 'vplayer-unmute'; b.setAttribute('aria-label', 'Turn on sound');
                        b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg><span>Tap for sound</span>';
                        b.addEventListener('click', function (e) {
                            e.preventDefault(); e.stopPropagation();
                            wantMute = false;
                            if (player && player.unMute) { try { player.unMute(); player.setVolume(100); } catch (er) {} }
                            else {
                                // Raw embed: unmute over the IFrame API (enablejsapi=1) so the
                                // video keeps playing in place. Reload via src is the last resort.
                                var nf = stage.querySelector('iframe.vplayer-frame');
                                if (nf && nf.contentWindow) {
                                    try {
                                        nf.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                                        nf.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
                                    } catch (er) { try { nf.src = nf.src.replace('&mute=1', ''); } catch (e2) {} }
                                } else if (nf) { try { nf.src = nf.src.replace('&mute=1', ''); } catch (e2) {} }
                            }
                            b.classList.add('is-hiding');
                            setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 320);
                        });
                        stage.appendChild(b);
                        requestAnimationFrame(function () { b.classList.add('is-visible'); });
                    }
                    // Raw-embed playback path. Building an <iframe autoplay=1> as a direct
                    // result of a tap inherits the user activation, so it starts WITH SOUND
                    // on the first press (the reliable lite-embed technique). forceMuted:
                    //   false     -> sound (only call from inside a live gesture).
                    //   true      -> muted (the cross-document hand-off).
                    //   undefined -> decide from navigator.userActivation (the watchdog path):
                    //                sound if activation is still live, else muted + sound pill.
                    function gestureAutoplay(forceMuted) {
                        if (fellBack || revealed) return; fellBack = true;
                        poolDrop(poolRec);
                        try { if (player && player.destroy) player.destroy(); } catch (e) {}
                        player = null;
                        var old = stage.querySelector('.vplayer-frame'); if (old) old.remove();
                        root.classList.remove('is-loading'); poster.style.display = 'none'; bar.hidden = true; revealed = true;
                        var muted;
                        if (forceMuted === true || forceMuted === false) muted = forceMuted;
                        else { var live = true; try { if (navigator.userActivation) live = !!navigator.userActivation.isActive; } catch (e) {} muted = !live; }
                        if (wantMute) muted = true;
                        var f = document.createElement('iframe'); f.className = 'vplayer-frame';
                        f.src = 'https://www.youtube-nocookie.com/embed/' + vid() + '?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1' + (muted ? '&mute=1' : '') + '&start=' + Math.floor(lo()) + '&origin=' + encodeURIComponent(location.origin);
                        f.title = 'Service video from Morning Star Christian Church';
                        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.setAttribute('allowfullscreen', '');
                        stage.appendChild(f);
                        if (muted) { wantMute = true; showUnmute(); }
                    }
                    function onReady() {
                        ready = true;
                        if (doFade) { try { var tv = player.getVolume ? player.getVolume() : 100; targetVol = (tv == null || isNaN(tv)) ? 100 : tv; player.setVolume(0); } catch (e) {} }
                        if (!started) return; // silent preload — wait, paused, behind the poster
                        if (wantMute) { try { player.mute(); } catch (e) {} }
                        if (pendingSeek != null) { doSeek(pendingSeek); pendingSeek = null; }
                        else { try { player.playVideo(); } catch (e) {} }
                    }
                    function onState(e) {
                        root.classList.toggle('is-playing', e.data === 1);
                        if (e.data === 1) {
                            started = true; poolDrop(poolRec); claim(); if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; } reveal();
                            // Fade up only when the clip is starting from its top; a resume
                            // after a manual pause or a scrub keeps the volume it had.
                            if (doFade && !didFadeIn) { var ct = lo(); try { ct = player.getCurrentTime(); } catch (er) {} if (ct <= lo() + 1.2) { didFadeIn = true; fadeInAudio(); } }
                        }
                    }
                    function loop() {
                        cancelAnimationFrame(raf);
                        (function tick() {
                            if (ready && player && player.getCurrentTime) {
                                var t = player.getCurrentTime();
                                if (doFade && mode === 'segment' && !didFadeOut && t >= segEnd() - 0.2 - (FADE_OUT_MS / 1000) && t < segEnd() - 0.2) { didFadeOut = true; fadeOutAudio(Math.max(150, (segEnd() - 0.2 - t) * 1000)); }
                                if (mode === 'segment' && t >= segEnd() - 0.2) { try { player.pauseVideo(); player.seekTo(segStart(), true); } catch (e) {} t = segStart(); root.classList.remove('is-playing'); if (doFade) { cancelFade(); try { player.setVolume(0); } catch (e) {} didFadeIn = false; didFadeOut = false; } }
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
                        if (mode === 'segment' && (t < segStart() - 0.5 || t > segEnd() + 0.5)) setMode('full');
                        try { player.seekTo(t, true); player.playVideo(); } catch (e) {}
                    }
                    function frac(clientX) { var r = track.getBoundingClientRect(); return Math.min(1, Math.max(0, (clientX - r.left) / r.width)); }
                    function preview(f) { fill.style.width = (f*100) + '%'; knob.style.left = (f*100) + '%'; curEl.textContent = fmt(f * span()); }

                    poster.addEventListener('click', start);
                    // Preload ahead of the tap on intent (hover / press / focus) so the play
                    // lands inside the gesture.
                    poster.addEventListener('pointerenter', preload);
                    poster.addEventListener('pointerdown', preload);
                    poster.addEventListener('focus', preload);
                    playBtn.addEventListener('click', function () { if (!ready) return; try { player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); } catch (e) {} });
                    if (toggleBtn) toggleBtn.addEventListener('click', function () { setMode(mode === 'segment' ? 'full' : 'segment'); });
                    // Fullscreen: expand the STAGE to the top layer (the iframe fills
                    // it on black). The card's backdrop-filter is neutralized while
                    // fullscreen so a filtered ancestor can't trap the element, and
                    // restored on exit. iOS only fullscreens <video>, so the request
                    // is a guarded no-op there.
                    function fsActive() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
                    function enterFs() {
                        var req = stage.requestFullscreen || stage.webkitRequestFullscreen || stage.msRequestFullscreen;
                        if (!req) return;
                        if (fsCard) { fsCard.style.backdropFilter = 'none'; fsCard.style.webkitBackdropFilter = 'none'; }
                        try { var r = req.call(stage); if (r && r.catch) r.catch(function () {}); } catch (e) {}
                    }
                    function exitFs() { try { (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document); } catch (e) {} }
                    function onFsChange() {
                        var on = fsActive() === stage;
                        root.classList.toggle('is-fs', on);
                        if (!on && fsCard) { fsCard.style.backdropFilter = ''; fsCard.style.webkitBackdropFilter = ''; }
                    }
                    if (fsBtn) {
                        fsBtn.addEventListener('click', function () { if (!started) start(); if (fsActive() === stage) exitFs(); else enterFs(); });
                        document.addEventListener('fullscreenchange', onFsChange);
                        document.addEventListener('webkitfullscreenchange', onFsChange);
                    }
                    scrub.addEventListener('pointerdown', function (e) { if (!ready) return; scrubbing = true; try { scrub.setPointerCapture(e.pointerId); } catch (er) {} preview(frac(e.clientX)); });
                    scrub.addEventListener('pointermove', function (e) { if (scrubbing) preview(frac(e.clientX)); });
                    scrub.addEventListener('pointerup', function (e) { if (!scrubbing) return; scrubbing = false; doSeek(lo() + frac(e.clientX) * span()); });
                    scrub.addEventListener('keydown', function (e) { if (!ready) return; var step = e.shiftKey ? 30 : 5, t = player.getCurrentTime(); if (e.key === 'ArrowRight') { doSeek(Math.min(hi(), t + step)); e.preventDefault(); } else if (e.key === 'ArrowLeft') { doSeek(Math.max(lo(), t - step)); e.preventDefault(); } });
                    chapters.forEach(function (ch) { ch.addEventListener('click', function () { var t = parseFloat(ch.getAttribute('data-seek') || '0'); if (ready && player) { started = true; reveal(); doSeek(t); } else { pendingSeek = t; start(); } }); });

                    // Preload eagerly for the single hero; lazily (on approach + dwell) for cards.
                    root.__vpVisible = function (vis) {
                        if (vis) { if (!dwellTimer && !player) dwellTimer = setTimeout(function () { dwellTimer = null; preload(); }, 350); }
                        else { if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; } if (!started) evictIdle(); }
                    };
                    if (isHero) preload();
                    else if (io) io.observe(root);
                }

                document.querySelectorAll('.vplayer').forEach(initPlayer);

                // Seamless arrival from the home "play" tap (/watch?play=1): start the
                // feature player the moment we land so the video is already running as
                // the cross-document morph settles — one continuous, uninterrupted play.
                try {
                    if (new URLSearchParams(location.search).get('play') === '1') {
                        var feat = document.querySelector('.vplayer--feature');
                        if (feat && feat.__autostartMuted) feat.__autostartMuted();
                    }
                } catch (e) {}
            })();
        </script>`
}
