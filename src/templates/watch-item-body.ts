import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import {
  escapeHtml,
  mmss,
  longDate,
  lengthLabel,
  speakerLine,
  formatNoun,
  messageSpan,
  SEGMENT_LABEL,
  vplayer,
  watchPlayerScript,
  messageCard,
} from './watch-shared.js'
import { topicSlug, type PublishedSermon } from '../sermons-feed.js'

// /watch/<slug> — a single service permalink with the custom segment player.
//
// The player (shared `vplayer` + `watchPlayerScript`, the same one the inline
// message cards use) opens on just the message by default; a "Full service"
// toggle expands to the whole video with chapter markers. ?full=1 opens straight
// to the full service; ?t=<sec> deep-links to a moment. Crawlers get the full
// transcript, chapters, summary, and VideoObject/Clip schema in the HTML.

function chapterTitle(seg: { type: string; title: string }): string {
  return seg.title
}

export const watchItemBody = (
  sermon: PublishedSermon,
  related: PublishedSermon[] = [],
): string => {
  const noun = formatNoun(sermon.format)
  const dateLabel = longDate(sermon.publishedAt)
  const len = lengthLabel(sermon.durationSec)
  const speaker = speakerLine(sermon.speakers)
  // Default landing + scrubber bounds span the whole message (a discussion's
  // topic children play as one continuous video), so the permalink opens at the
  // message start and never mid-message when a later part is the longest.
  const messageSeg = messageSpan(sermon)

  const refs = Array.from(
    new Set(sermon.segments.flatMap((s) => s.scriptureRefs).filter(Boolean)),
  ).slice(0, 8)

  const metaBits = [noun, dateLabel, speaker ? `with ${escapeHtml(speaker)}` : null, len]
    .filter(Boolean)
    .map((b) => `<span>${b}</span>`)
    .join('<span aria-hidden="true">·</span>')

  const chapters = sermon.segments
    .map((seg) => {
      const label = SEGMENT_LABEL[seg.type] ?? seg.type
      const title = chapterTitle(seg)
      const showKind = !title.toLowerCase().startsWith(label.toLowerCase())
      // Per-message attribution: a sermon/discussion chapter names who delivered
      // it, so a multi-message service reads "with Dmitri" on one and "with Zach"
      // on the other instead of both names on each.
      const who = seg.speakers && seg.speakers.length > 0 ? speakerLine(seg.speakers) : null
      // A chapter that the segmenter broke into parts (e.g. a discussion working
      // through several topics) lists those parts as indented, tappable sub-rows
      // under it. They jump within the one chapter; they are not chapters of their
      // own (no scrubber marker, no kind badge). Usually there are none.
      const subs =
        seg.children && seg.children.length > 0
          ? `<ol class="watch-subchapters">
                                    ${seg.children
                                      .map(
                                        (c) => `<li>
                                        <button class="watch-subchapter" type="button" data-seek="${Math.floor(c.startSec)}">
                                            <span class="watch-subchapter-time">${escapeHtml(mmss(c.startSec))}</span>
                                            <span class="watch-subchapter-title">${escapeHtml(c.title)}</span>
                                        </button>
                                    </li>`,
                                      )
                                      .join('\n                                    ')}
                                </ol>`
          : ''
      return `<li>
                                <button class="watch-chapter" type="button" data-seek="${Math.floor(seg.startSec)}">
                                    <span class="watch-chapter-time">${escapeHtml(mmss(seg.startSec))}</span>
                                    <span>
                                        <span class="watch-chapter-title">${escapeHtml(title)}${showKind ? `<span class="watch-chapter-kind">${escapeHtml(label)}</span>` : ''}</span>
                                        ${who ? `<span class="watch-chapter-who">with ${escapeHtml(who)}</span>` : ''}
                                        ${seg.summary ? `<span class="watch-chapter-note">${escapeHtml(seg.summary)}</span>` : ''}
                                    </span>
                                </button>
                                ${subs}
                            </li>`
    })
    .join('\n                            ')

  const refChips =
    refs.length > 0
      ? `<div class="watch-refs" aria-label="Scripture in this message">
                                ${refs.map((r) => `<span class="watch-ref">${escapeHtml(r)}</span>`).join('\n                                ')}
                            </div>`
      : ''

  // Topic moves up to the head (next to the title), where it's actually seen.
  const topicHead =
    sermon.topics.length > 0
      ? `<div class="watch-permalink-topics" aria-label="Topic">
                        <a class="watch-card-topic" href="/watch/topic/${escapeHtml(topicSlug(sermon.topics[0]))}">${escapeHtml(sermon.topics[0])}</a>
                    </div>`
      : ''

  const transcript = sermon.transcript
    ? `<details class="watch-transcript">
                        <summary>Read the transcript</summary>
                        <div class="watch-transcript-body">${escapeHtml(sermon.transcript)}</div>
                    </details>`
    : ''

  const posterAlt = `${sermon.title} — ${noun.toLowerCase()} from Morning Star Christian Church in Boise, Idaho`

  const relatedBlock =
    related.length > 0
      ? `<section id="more" aria-label="More services" style="margin-top: var(--space-3xl);">
                    <span class="section-eyebrow">More to watch</span>
                    <h2 class="section-heading">Keep going.</h2>
                    <div class="watch-grid" style="margin-top: var(--space-lg);">
                        ${related.map((s) => messageCard(s)).join('\n                        ')}
                    </div>
                </section>`
      : ''

  return `
    <body class="page-subpage watch-permalink-page">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section class="watch-permalink-head">
                    <span class="watch-permalink-kicker">${escapeHtml(noun)}</span>
                    <h1 class="watch-permalink-title">${escapeHtml(sermon.title)}</h1>
                    <div class="watch-permalink-meta">${metaBits}</div>
                    ${topicHead}
                </section>

                <div class="watch-permalink-grid">
                    <div class="watch-permalink-main">
                        ${vplayer(sermon, null, 'main', posterAlt, messageSeg)}

                        ${sermon.summary ? `<p class="watch-feature-blurb" style="font-size: var(--text-body); color: var(--text-primary-soft); max-width: 68ch;">${escapeHtml(sermon.summary)}</p>` : ''}
                        ${refChips}
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
                        <div class="watch-aside-block">
                            <a class="event-link-btn teaser-cta" href="/visit">Plan a Visit</a>
                        </div>
                    </aside>
                </div>

                ${relatedBlock}

                ${transcript ? `<section class="watch-transcript-section" aria-label="Transcript">${transcript}</section>` : ''}
            </main>

            ${footer('/')}
        </div>
        ${watchPlayerScript()}
    </body>`
}
