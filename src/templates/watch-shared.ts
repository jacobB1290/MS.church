// Shared rendering helpers for the /watch library, its permalink pages, and the
// topic pages. Pure + dependency-free so every watch surface renders cards,
// labels, and timestamps the same way (single source of truth — the hub, a
// topic page, and a "more like this" rail can never drift).

import type { PublishedSermon, SermonSegment, SermonFormat, SermonSong } from '../sermons-feed.js'
import { topicSlug, itemTopic } from '../sermons-feed.js'

/**
 * The complete-voiced description of a service that has no chapters yet (live
 * right now, or aired but not segmented), and the cold-start fallback. It must
 * read as a finished, watchable thing — present the full service, never "we're
 * processing this" / "here's roughly what a Sunday looks like." Single source so
 * the home plate and /watch can't drift.
 */
export const SERVICE_BLURB =
  'The whole service is here to watch, the worship, the scripture, and the message, grounded in the Bible. About half an hour, nothing you need to bring.'

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
  // The full-service permalink marks where the message starts with a pointed chip
  // on the scrubber (replacing the old "Just the message" toggle).
  const msgNoun = formatNoun(sermon.format)
  const showFlag = isMain && !!seg
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
                                        ${showFlag ? `<button class="vplayer-flag" type="button" hidden aria-label="Jump to the ${escapeHtml(msgNoun.toLowerCase())}"><span>${escapeHtml(msgNoun)}</span></button>` : ''}
                                        <div class="vplayer-tip" hidden aria-hidden="true"></div>
                                    </div>
                                    <span class="vplayer-time" data-dur>0:00</span>
                                </div>
                                <div class="vplayer-actions">
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
                    var hasChapterAttr = root.hasAttribute('data-chapters');
                    var poster = root.querySelector('.vplayer-poster');
                    var stage = root.querySelector('.vplayer-stage');
                    var bar = root.querySelector('.vplayer-bar');
                    var fill = root.querySelector('.vplayer-fill');
                    var knob = root.querySelector('.vplayer-knob');
                    var scrub = root.querySelector('.vplayer-scrub');
                    var track = root.querySelector('.vplayer-track');
                    var tip = root.querySelector('.vplayer-tip');
                    var flag = root.querySelector('.vplayer-flag');
                    var curEl = root.querySelector('[data-cur]');
                    var durEl = root.querySelector('[data-dur]');
                    var toggleBtn = root.querySelector('[data-act="mode"]');
                    var playBtn = root.querySelector('[data-act="toggle"]');
                    var fsBtn = root.querySelector('[data-act="fullscreen"]');
                    var fsCard = root.closest('.watch-card');
                    // Chapters come EITHER from the permalink's on-page list (.watch-chapter,
                    // each with data-seek) OR, for the hub's full-service hero, from an injected
                    // array set via root.__setChapters (it has no on-page list and its service
                    // changes as you pick from "Recent services"). ownsChapters() is true for
                    // either source. chapterData() yields {seek, title, el?} sorted by time.
                    var injectedChapters = null, domChapters = null;
                    function ownsChapters() { return hasChapterAttr || !!injectedChapters; }
                    function chapterData() {
                        if (injectedChapters) return injectedChapters;
                        if (!hasChapterAttr) return [];
                        if (domChapters) return domChapters;   // the on-page list is static — cache it
                        domChapters = Array.prototype.map.call(document.querySelectorAll('.watch-chapter'), function (c) {
                            var tEl = c.querySelector('.watch-chapter-title');
                            var title = tEl ? (tEl.firstChild ? tEl.firstChild.textContent : tEl.textContent) : c.textContent;
                            return { seek: parseFloat(c.getAttribute('data-seek') || '0'), title: (title || '').trim(), el: c };
                        });
                        return domChapters;
                    }
                    // Adopt mode: the same-page home->watch morph hands this feature an
                    // already-playing external player (its iframe lives in an overlay host
                    // that can't be re-parented without reloading). We never self-build then,
                    // and fullscreen targets that host instead of our empty stage.
                    var adoptMode = root.hasAttribute('data-adopt');
                    var fsTarget = stage;

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

                    // The permalink is the FULL service now (the "Just the message" toggle is
                    // gone; a pointed chip on the scrubber marks where the message starts).
                    // Default lands on the message; ?t deep-links a moment; ?full=1 starts at 0.
                    if (root.hasAttribute('data-allow-params')) {
                        mode = 'full';
                        try {
                            var params = new URLSearchParams(location.search);
                            var tp = parseFloat(params.get('t'));
                            if (!isNaN(tp)) pendingSeek = tp;
                            else if (params.get('full') !== '1' && hasSeg()) pendingSeek = segStart();
                        } catch (e) { if (hasSeg()) pendingSeek = segStart(); }
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
                                events: { onReady: onReady, onStateChange: onState, onAutoplayBlocked: onBlocked, onError: onError }
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
                        showFlag(9000);   // hold longer on first load; scrubbing re-shows it for 5s
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
                                // gesture also starts WITH SOUND (loses the scrubber until reload).
                                gestureAutoplay(true);
                                return;
                            }
                        }
                        // Reveal/repair watchdog (muted recovery; never a dead YouTube screen).
                        armFallback();
                    }
                    // Watchdog that rescues a play that never confirmed — but ONLY after giving a
                    // slow load real time, and NEVER by re-attempting unmuted out of gesture.
                    // On a slow connection the API player legitimately takes a while; tearing it
                    // down too early (and swapping to an out-of-gesture embed) is itself what
                    // flashed YouTube's play screen. So: wait longer, and if the player is still
                    // buffering or already playing, keep waiting instead of killing it. When it is
                    // truly stalled, recover MUTED (always allowed) with a one-tap sound pill.
                    function armFallback() {
                        if (fallbackTimer) return;
                        fallbackTimer = setTimeout(function tick() {
                            fallbackTimer = null;
                            if (revealed || fellBack) return;
                            var st = null; try { if (player && player.getPlayerState) st = player.getPlayerState(); } catch (e) {}
                            // 3 = buffering, 1 = playing (not yet revealed): it's working, give it more time.
                            if (st === 3 || st === 1) { fallbackTimer = setTimeout(tick, 3000); return; }
                            gestureAutoplay(false);
                        }, 7000);
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
                        armFallback();
                    };
                    // Adopt an EXTERNAL, already-playing player (the same-page home->watch
                    // morph). Its iframe lives in fsEl (an overlay host) covering our stage,
                    // so the custom controls wire to it in place — no rebuild, no reload, the
                    // audio the morph started keeps going, now with the custom scrubber.
                    root.__adoptPlayer = function (extPlayer, fsEl) {
                        if (!extPlayer || player === extPlayer) return;
                        try { if (player && player.destroy) player.destroy(); } catch (e) {}
                        player = extPlayer; ready = true; started = true; fellBack = false; wantMute = false;
                        if (fsEl) fsTarget = fsEl;
                        poolDrop(poolRec); claim();
                        try { if (player.addEventListener) player.addEventListener('onStateChange', onState); } catch (e) {}
                        // Reveal WITHOUT hiding the poster: the overlay host covers it, but the
                        // poster still gives the stage its height (the iframe isn't our child).
                        revealed = true; root.classList.remove('is-loading');
                        poster.style.pointerEvents = 'none';
                        bar.hidden = false; durEl.textContent = fmt(span()); buildMarkers(); loop();
                        try { root.classList.toggle('is-playing', player.getPlayerState && player.getPlayerState() === 1); } catch (e) {}
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
                    // on the first press (the reliable lite-embed technique). allowSound:
                    //   true  -> with sound. ONLY pass this from INSIDE a live click gesture.
                    //   false/undefined -> muted. This is the safe default for every async /
                    //     watchdog / hand-off path: muted autoplay is ALWAYS allowed, so it can
                    //     never trip YouTube's own play screen. A one-tap sound pill is offered.
                    function gestureAutoplay(allowSound) {
                        if (fellBack || revealed) return; fellBack = true;
                        poolDrop(poolRec);
                        try { if (player && player.destroy) player.destroy(); } catch (e) {}
                        player = null;
                        var old = stage.querySelector('.vplayer-frame'); if (old) old.remove();
                        root.classList.remove('is-loading'); poster.style.display = 'none'; bar.hidden = true; revealed = true;
                        var muted = allowSound !== true;
                        if (wantMute) muted = true;
                        var f = document.createElement('iframe'); f.className = 'vplayer-frame';
                        f.src = 'https://www.youtube-nocookie.com/embed/' + vid() + '?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1' + (muted ? '&mute=1' : '') + '&start=' + Math.floor(lo()) + '&origin=' + encodeURIComponent(location.origin);
                        f.title = 'Service video from Morning Star Christian Church';
                        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.setAttribute('allowfullscreen', '');
                        stage.appendChild(f);
                        if (muted) { wantMute = true; showUnmute(); }
                    }
                    // YouTube tells us it refused to autoplay with sound (no usable gesture).
                    // Don't leave its play screen up: flip THIS player to muted (always allowed)
                    // and play — the custom scrubber survives — then offer a one-tap sound pill.
                    function onBlocked() {
                        wantMute = true;
                        try { if (player) { player.mute(); player.playVideo(); } } catch (e) {}
                    }
                    // A hard player error before anything played (e.g. HTML5 hiccup): fall back to
                    // a fresh muted embed rather than sit on a dead frame. Embedding-disabled
                    // errors (101/150) can't be helped, so don't thrash on them.
                    function onError(e) {
                        var code = e && e.data;
                        if (revealed || fellBack) return;
                        if (code === 101 || code === 150) return;
                        gestureAutoplay(false);
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
                                    var dispT = t;
                                    if (seekLock != null) {
                                        // Hold the requested position until the seek lands (or 2s
                                        // safety) so the knob doesn't flash back to the old time.
                                        if (nowMs() > seekLock.until || Math.abs(t - seekLock.t) < 0.4) seekLock = null;
                                        else dispT = seekLock.t;
                                    }
                                    var p = Math.min(1, Math.max(0, (dispT - lo()) / span()));
                                    fill.style.width = (p*100) + '%'; knob.style.left = (p*100) + '%';
                                    curEl.textContent = fmt(Math.max(0, dispT - lo()));
                                    scrub.setAttribute('aria-valuenow', String(Math.round(p*100)));
                                    if (ownsChapters()) highlight(dispT);
                                }
                            }
                            raf = requestAnimationFrame(tick);
                        })();
                    }
                    function highlight(t) {
                        var cs = chapterData(), idx = -1;
                        for (var i = 0; i < cs.length; i++) { if (t + 0.5 >= cs[i].seek) idx = i; }
                        cs.forEach(function (c, i) { if (c.el) c.el.classList.toggle('is-current', i === idx); });
                        if (track) track.querySelectorAll('.vplayer-marker').forEach(function (m) { m.classList.toggle('is-current', parseInt(m.getAttribute('data-ci'), 10) === idx); });
                        return idx;
                    }
                    function buildMarkers() {
                        if (!track) return;
                        track.querySelectorAll('.vplayer-marker').forEach(function (m) { m.remove(); });
                        if (mode !== 'full' || !ownsChapters()) return;
                        var d = hi(); if (d <= 0) return;
                        chapterData().forEach(function (c, i) {
                            if (c.seek <= 0 || c.seek >= d) return;
                            var m = document.createElement('span'); m.className = 'vplayer-marker';
                            m.style.left = (((c.seek - lo()) / span()) * 100) + '%';
                            m.setAttribute('data-ci', String(i));
                            track.appendChild(m);
                        });
                    }
                    // The chapter that contains time t (the last one that has started).
                    function chapterAt(t) {
                        var cs = chapterData(); if (!cs.length) return null;
                        var pick = cs[0];
                        for (var i = 0; i < cs.length; i++) { if (t + 0.001 >= cs[i].seek) pick = cs[i]; }
                        return pick;
                    }
                    // The little label above the track naming the chapter at fraction f.
                    function showTip(f) {
                        if (!tip || !ownsChapters() || mode !== 'full') return;
                        var c = chapterAt(lo() + f * span()); if (!c) return;
                        tip.textContent = c.title || '';
                        tip.style.left = (Math.min(0.98, Math.max(0.02, f)) * 100) + '%';
                        if (tip.hidden) { tip.hidden = false; void tip.offsetWidth; }
                        tip.classList.add('is-visible');
                    }
                    function hideTip() { if (tip) { tip.classList.remove('is-visible'); tip.hidden = true; } }
                    // Magnetic snap: pull a near-miss to the chapter marker within ~14px so the
                    // scrubber clicks onto chapter starts, while still allowing a free seek.
                    function snapFrac(f) {
                        if (!ownsChapters() || mode !== 'full') return f;
                        var cs = chapterData(); if (!cs.length) return f;
                        var w = ((trackRect || (track && track.getBoundingClientRect()) || {}).width) || 1;
                        var best = f, bestPx = 14;
                        for (var i = 0; i < cs.length; i++) {
                            var cf = (cs[i].seek - lo()) / span(); if (cf < 0 || cf > 1) continue;
                            var dpx = Math.abs(cf - f) * w; if (dpx < bestPx) { bestPx = dpx; best = cf; }
                        }
                        return best;
                    }
                    // The pointed "message" chip above the scrubber: marks where the sermon /
                    // discussion starts. Shows when the bar appears, fades after a few seconds,
                    // and returns whenever you touch the timeline. Tapping it jumps to the message.
                    var flagTimer = null;
                    function positionFlag() {
                        if (!flag) return;
                        var fr = (segStart() - lo()) / span();
                        flag.style.left = (Math.min(0.985, Math.max(0.015, fr)) * 100) + '%';
                    }
                    function showFlag(ms) {
                        if (!flag || mode !== 'full' || !hasSeg()) return;
                        positionFlag();
                        flag.hidden = false; void flag.offsetWidth; flag.classList.add('is-visible');
                        clearTimeout(flagTimer);
                        flagTimer = setTimeout(function () { flag.classList.remove('is-visible'); }, ms || 5000);
                    }
                    if (flag) flag.addEventListener('click', function (e) {
                        e.preventDefault(); e.stopPropagation();
                        var t = segStart();
                        if (ready && player) { started = true; reveal(); doSeek(t); } else { pendingSeek = t; start(); }
                        showFlag();
                    });
                    // Set/replace the chapter source for a data-fed player (the hub hero) and
                    // refresh markers. Called on load and whenever the selected service changes.
                    root.__setChapters = function (arr) {
                        injectedChapters = (arr && arr.length)
                            ? arr.map(function (c) { return { seek: Math.floor(c.seek != null ? c.seek : (c.t || 0)), title: (c.title || '').trim() }; })
                            : null;
                        buildMarkers();
                    };
                    // Report whether this player is mid-play and where, so a jump to the
                    // service permalink can resume exactly there instead of its cue point.
                    root.__playbackState = function () {
                        var playing = false, t = 0;
                        try {
                            if (player && player.getPlayerState) { var st = player.getPlayerState(); playing = (st === 1 || st === 3); }
                            if (player && player.getCurrentTime) t = player.getCurrentTime() || 0;
                        } catch (e) {}
                        return { playing: started && playing, time: t };
                    };
                    function setMode(next) {
                        if (mode === next) return; mode = next;
                        if (toggleBtn) { toggleBtn.textContent = mode === 'segment' ? 'Full service' : 'Just the message'; toggleBtn.setAttribute('aria-pressed', String(mode === 'full')); }
                        durEl.textContent = fmt(span()); buildMarkers();
                    }
                    function doSeek(t) {
                        if (mode === 'segment' && (t < segStart() - 0.5 || t > segEnd() + 0.5)) setMode('full');
                        try { player.seekTo(t, true); player.playVideo(); } catch (e) {}
                    }
                    // Scrub state. trackRect is cached at pointerdown (no getBoundingClientRect
                    // per move); previews are coalesced into one rAF; seekLock pins the on-screen
                    // position to the requested time until the video catches up so the knob never
                    // snaps backward after release.
                    var trackRect = null, dragRaf = null, pendingFrac = 0, seekLock = null;
                    function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
                    function frac(clientX) { var r = trackRect || track.getBoundingClientRect(); return r.width ? Math.min(1, Math.max(0, (clientX - r.left) / r.width)) : 0; }
                    function paintFrac(f) { fill.style.width = (f*100) + '%'; knob.style.left = (f*100) + '%'; curEl.textContent = fmt(f * span()); scrub.setAttribute('aria-valuenow', String(Math.round(f*100))); }
                    function flushPreview() { dragRaf = null; paintFrac(pendingFrac); }
                    function queuePreview(f) { pendingFrac = f; if (dragRaf == null) dragRaf = requestAnimationFrame(flushPreview); }
                    function lockSeek(t) { seekLock = { t: t, until: nowMs() + 2000 }; paintFrac((t - lo()) / span()); doSeek(t); }

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
                        var req = fsTarget.requestFullscreen || fsTarget.webkitRequestFullscreen || fsTarget.msRequestFullscreen;
                        if (!req) return;
                        if (fsCard) { fsCard.style.backdropFilter = 'none'; fsCard.style.webkitBackdropFilter = 'none'; }
                        try { var r = req.call(fsTarget); if (r && r.catch) r.catch(function () {}); } catch (e) {}
                    }
                    function exitFs() { try { (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document); } catch (e) {} }
                    function onFsChange() {
                        var on = fsActive() === fsTarget;
                        root.classList.toggle('is-fs', on);
                        if (!on && fsCard) { fsCard.style.backdropFilter = ''; fsCard.style.webkitBackdropFilter = ''; }
                    }
                    if (fsBtn) {
                        fsBtn.addEventListener('click', function () { if (!started && !adoptMode) start(); if (fsActive() === fsTarget) exitFs(); else enterFs(); });
                        document.addEventListener('fullscreenchange', onFsChange);
                        document.addEventListener('webkitfullscreenchange', onFsChange);
                    }
                    // Move/up are bound to the WINDOW for the drag's duration, so a finger that
                    // wanders off the thin track (or vertically) keeps registering; pointercancel
                    // ends the drag cleanly so it can never get stuck mid-scrub.
                    function onScrubMove(e) { if (!scrubbing) return; if (e.cancelable) e.preventDefault(); var f = snapFrac(frac(e.clientX)); queuePreview(f); showTip(f); }
                    function endScrub(e) {
                        if (!scrubbing) return;
                        scrubbing = false;
                        window.removeEventListener('pointermove', onScrubMove);
                        window.removeEventListener('pointerup', endScrub);
                        window.removeEventListener('pointercancel', endScrub);
                        if (dragRaf != null) { cancelAnimationFrame(dragRaf); dragRaf = null; }
                        var f = (e && typeof e.clientX === 'number' && e.type !== 'pointercancel') ? frac(e.clientX) : pendingFrac;
                        f = snapFrac(f);
                        paintFrac(f); hideTip(); showFlag();
                        lockSeek(lo() + f * span());
                    }
                    scrub.addEventListener('pointerdown', function (e) {
                        if (!ready) return;
                        if (e.button != null && e.button !== 0) return;
                        scrubbing = true;
                        trackRect = track.getBoundingClientRect();
                        if (e.cancelable) e.preventDefault();
                        window.addEventListener('pointermove', onScrubMove);
                        window.addEventListener('pointerup', endScrub);
                        window.addEventListener('pointercancel', endScrub);
                        var f0 = snapFrac(frac(e.clientX)); queuePreview(f0); showTip(f0); showFlag();
                    });
                    // Hover preview (no drag): glide the chapter label along the track so you
                    // can read chapter names before seeking. Touch has no hover -> skip.
                    scrub.addEventListener('pointermove', function (e) {
                        if (scrubbing || e.pointerType === 'touch' || !ownsChapters() || mode !== 'full') return;
                        var r = track.getBoundingClientRect(); if (!r.width) return;
                        showTip(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
                    });
                    scrub.addEventListener('pointerleave', function () { if (!scrubbing) hideTip(); });
                    scrub.addEventListener('keydown', function (e) {
                        if (!ready) return;
                        var step = e.shiftKey ? 30 : 5, t; try { t = player.getCurrentTime(); } catch (er) { t = lo(); }
                        if (e.key === 'ArrowRight') { lockSeek(Math.min(hi(), t + step)); e.preventDefault(); }
                        else if (e.key === 'ArrowLeft') { lockSeek(Math.max(lo(), t - step)); e.preventDefault(); }
                    });
                    chapterData().forEach(function (c) { if (!c.el) return; c.el.addEventListener('click', function () { var t = c.seek; if (ready && player) { started = true; reveal(); doSeek(t); } else { pendingSeek = t; start(); } }); });

                    // Preload eagerly for the single hero; lazily (on approach + dwell) for cards.
                    root.__vpVisible = function (vis) {
                        if (vis) { if (!dwellTimer && !player) dwellTimer = setTimeout(function () { dwellTimer = null; preload(); }, 350); }
                        else { if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; } if (!started) evictIdle(); }
                    };
                    if (adoptMode) { /* the morph adopts an external player; never self-build */ }
                    else if (isHero) preload();
                    else if (io) io.observe(root);
                }

                document.querySelectorAll('.vplayer').forEach(initPlayer);

                // Jumping to a service permalink from the hub hero ("Chapters & transcript")
                // or a library card ("Full service"): if the source player is mid-play, carry
                // the position + a play flag so the permalink resumes exactly there. If it's
                // idle, fall through to the link's natural target — the hero opens the whole
                // service from the top (?full=1), a card opens its authored message/song moment
                // (the href as rendered). A normal navigation drops the gesture's sound grant,
                // so the permalink resumes muted with a one-tap sound pill (the ?play=1 path).
                document.addEventListener('click', function (e) {
                    var a = e.target && e.target.closest ? e.target.closest('a.watch-feature-fulllink, a.watch-card-full') : null;
                    if (!a) return;
                    var href = a.getAttribute('href'); if (!href || href.charAt(0) === '#') return;
                    var isHero = a.classList.contains('watch-feature-fulllink');
                    var card = isHero ? null : a.closest('.watch-card');
                    var vp = isHero ? document.querySelector('.vplayer--feature') : (card && card.querySelector('.vplayer'));
                    var ps = vp && vp.__playbackState ? vp.__playbackState() : null;
                    var dest;
                    if (ps && ps.playing) dest = href.split('?')[0] + '?t=' + Math.floor(ps.time) + '&play=1';
                    else if (isHero) dest = href.split('?')[0] + '?full=1';   // idle hero -> from the top
                    else return;   // idle card -> its authored library point; let the link navigate
                    e.preventDefault();
                    try { window.location.assign(dest); } catch (er) { window.location.href = dest; }
                });

                // Seamless arrival from a "play" tap (?play=1): start the hero/permalink
                // player the moment we land so the video is already running. Covers both the
                // home->/watch morph (feature) and a playing hero/card -> permalink jump (main).
                try {
                    if (new URLSearchParams(location.search).get('play') === '1') {
                        var arrival = document.querySelector('.vplayer--feature, .vplayer--main');
                        if (arrival && arrival.__autostartMuted) arrival.__autostartMuted();
                    }
                } catch (e) {}
            })();
        </script>`
}
