import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /watch — the on-site sermons hub.
//
// Rendered ENTIRELY from a server-built WatchView (composed in routes/watch.ts):
// the featured video, its title/date, the sermon summary, the scripture refs,
// and the "order of the morning" program all arrive as props. Nothing about the
// primary content is fetched on the client, so there's no DOM mutation during
// scroll (no long-animation-frame) and crawlers get the real content in the HTML.
//
// The WatchView is sourced, in order: (1) the CRM published-sermons feed when the
// church has published a chaptered service (program = the real chapters, with
// jump-to-timestamp links); (2) the live YouTube latest video + the evergreen
// order-of-service; (3) the hardcoded fallback video. So the page is useful and
// honest today, and fills with real, chaptered content the moment a sermon is
// published from the system — no code change needed.
//
// The only client JS is the click-to-play facade (swap the poster for the embed
// on tap); it never runs during scroll.
//
// Inherits subpage-header + subpage-spacer + the page entrance fade. No reveal-*
// classes (subpages reveal via the entrance, like /visit).

export type WatchProgramItem = {
  title: string
  note: string
  /** "mm:ss" deep-link label, present only for real (CRM) chapters. */
  time?: string
  /** YouTube timestamp deep link, present only for real (CRM) chapters. */
  href?: string
}

export type WatchView = {
  videoId: string
  posterUrl: string
  title: string
  dateLabel: string | null
  summary: string
  scriptureRefs: string[]
  program: WatchProgramItem[]
  /** True when the program is the real chaptered service from the CRM feed. */
  programLive: boolean
  ytWatchUrl: string
  playlistUrl: string
}

// Evergreen reflection prompts — useful for any week's message. Open-ended on
// purpose; not marked up as FAQ (the page's FAQ JSON-LD answers watch-intent
// questions instead). These stay static until the pipeline authors per-sermon
// discussion guides.
const DISCUSSION = [
  'What word or verse from this week stayed with you, and why that one?',
  'What does this passage show you about God? What does it show you about yourself?',
  'Is there something here you have been avoiding, or something you need to make right?',
  'If you took this seriously, what would be different by next Sunday? Be specific.',
  'Who in your life needs to hear what you heard today?',
  'How can someone pray for you as you try to live this out?',
]

const PLAY_GLYPH = `<svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true">
                                        <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#FF0000"></path>
                                        <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                                    </svg>`

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderProgram(items: WatchProgramItem[]): string {
  return items
    .map((s) => {
      const titleInner = s.href
        ? `<a class="watch-program-link" href="${escapeHtml(s.href)}" target="_blank" rel="noopener">${escapeHtml(s.title)}${s.time ? `<span class="watch-program-time">${escapeHtml(s.time)}</span>` : ''}</a>`
        : `${escapeHtml(s.title)}`
      return `<li class="watch-program-item">
                                <span class="watch-program-title">${titleInner}</span>
                                ${s.note ? `<span class="watch-program-note">${escapeHtml(s.note)}</span>` : ''}
                            </li>`
    })
    .join('\n                            ')
}

export const watchBody = (view: WatchView): string => {
  const discussionItems = DISCUSSION.map(
    (q) => `<li class="watch-discussion-item">${q}</li>`,
  ).join('\n                            ')

  const scriptureChips =
    view.scriptureRefs.length > 0
      ? `<div class="watch-scripture" aria-label="Scripture in this message">
                                ${view.scriptureRefs
                                  .map((r) => `<span class="watch-scripture-ref">${escapeHtml(r)}</span>`)
                                  .join('\n                                ')}
                            </div>`
      : ''

  const programHeading = view.programLive ? 'How this Sunday unfolded.' : 'A Sunday, in order.'
  const programLead = view.programLive
    ? 'Chapter by chapter, the way the morning actually went. Tap any chapter to jump straight to that moment.'
    : 'The morning follows the same simple shape every week, so it always feels familiar. Worship is live, the lyrics are on the screen, and you are welcome to sing or simply listen.'

  return `
    <style>
        /* /watch — sermons hub. Page-specific layout only; all colour, type,
           spacing, radius, shadow and motion come from the shared tokens. */

        /* --- Sermon: feature player + meta --- */
        .watch-feature {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
            gap: var(--space-xl);
            align-items: start;
        }
        /* Click-to-play facade. A framed 16:9 poster with a centred YouTube
           glyph; tapping swaps in the real embed (see the inline script). The
           single rounded frame + soft shadow is the only chrome — no nested
           card, per the editorial surface rule. */
        .watch-player {
            position: relative;
            display: block;
            width: 100%;
            aspect-ratio: 16 / 9;
            margin: 0;
            padding: 0;
            border: none;
            border-radius: var(--radius-lg);
            overflow: hidden;
            background: var(--surface);
            box-shadow: var(--shadow-md);
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
        }
        .watch-player-poster {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform var(--motion-slow) var(--ease-out-soft), filter var(--motion-medium) var(--ease-out-soft);
        }
        .watch-player-scrim {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.34) 100%);
            transition: opacity var(--motion-medium) var(--ease-out-soft);
        }
        .watch-player-play {
            position: absolute;
            top: 50%;
            left: 50%;
            width: clamp(58px, 8vw, 74px);
            height: auto;
            transform: translate(-50%, -50%) scale(1);
            transition: transform var(--motion-medium) var(--ease-out-soft);
            filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.32));
            pointer-events: none;
        }
        .watch-player:hover .watch-player-poster { transform: scale(1.03); }
        .watch-player:hover .watch-player-play { transform: translate(-50%, -50%) scale(1.08); }
        .watch-player:focus-visible {
            outline: 2px solid var(--gold);
            outline-offset: 3px;
        }
        .watch-player.is-playing { cursor: default; box-shadow: var(--shadow-lg); }
        .watch-player.is-playing:hover .watch-player-poster { transform: none; }
        .watch-feature-iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }

        .watch-feature-meta {
            display: flex;
            flex-direction: column;
            gap: var(--space-xs);
        }
        .watch-feature-tag {
            font-size: var(--text-eyebrow);
            font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wider);
            text-transform: uppercase;
            color: var(--gold-dark);
        }
        .watch-feature-title {
            font-family: var(--font-display);
            font-size: var(--text-lead);
            line-height: var(--leading-snug);
            color: var(--text-primary);
            margin: 0;
        }
        .watch-feature-date { font-size: var(--text-small); color: var(--text-muted); }
        .watch-feature-blurb {
            font-size: var(--text-body);
            line-height: var(--leading-normal);
            color: var(--text-muted);
            margin: var(--space-xs) 0 0;
        }
        .watch-scripture {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-xs);
            margin-top: var(--space-sm);
        }
        .watch-scripture-ref {
            font-size: var(--text-micro);
            font-weight: var(--weight-semibold);
            letter-spacing: var(--tracking-wide);
            color: var(--gold-dark);
            background: color-mix(in oklab, var(--gold) 12%, transparent);
            border-radius: var(--radius-pill);
            padding: 4px 12px;
        }
        .watch-feature-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-sm);
            margin-top: var(--space-sm);
        }
        /* The theme verse lives inside the meta column (not full-width below),
           so the text side fills the height of the tall video frame instead of
           leaving a dead gap on desktop. Left-aligned + gold, a quiet standfirst. */
        .watch-feature-verse {
            margin: var(--space-md) 0 0;
            padding-top: var(--space-md);
            border-top: 1px solid var(--text-hairline);
            font-family: var(--font-display);
            font-style: italic;
            font-size: var(--text-body);
            line-height: var(--leading-snug);
            color: var(--gold-dark);
        }
        .watch-feature-verse cite {
            display: block;
            margin-top: var(--space-xs);
            font-family: var(--font-body);
            font-style: normal;
            font-size: var(--text-micro);
            letter-spacing: var(--tracking-wide);
            text-transform: uppercase;
            color: var(--text-muted);
        }

        /* --- Worship & Program: order-of-service run sheet --- */
        .watch-program {
            list-style: none;
            counter-reset: program;
            margin: 0;
            padding: 0;
            max-width: 760px;
        }
        /* A run sheet, read top to bottom (a service has an order). Hairline
           rules + a quiet display ordinal, no filled chips or grid cells — so
           it reads as a printed order of service, not a feature grid. */
        .watch-program-item {
            counter-increment: program;
            position: relative;
            padding: var(--space-md) 0 var(--space-md) calc(var(--space-xl) + var(--space-sm));
            border-top: 1px solid var(--text-hairline);
        }
        .watch-program-item:first-child {
            border-top: none;
            padding-top: 0;
        }
        .watch-program-item::before {
            content: counter(program);
            position: absolute;
            left: 0;
            top: var(--space-md);
            font-family: var(--font-display);
            font-size: var(--text-lead);
            font-weight: var(--weight-bold);
            line-height: 1;
            color: var(--gold-dark);
        }
        .watch-program-item:first-child::before { top: 0; }
        .watch-program-title {
            display: block;
            font-size: var(--text-body);
            font-weight: var(--weight-semibold);
            color: var(--text-primary);
        }
        .watch-program-link {
            color: var(--text-primary);
            text-decoration: none;
            display: inline-flex;
            align-items: baseline;
            gap: var(--space-xs);
            transition: color var(--motion-fast) var(--ease-out-soft);
        }
        .watch-program-link:hover { color: var(--gold-dark); }
        .watch-program-time {
            font-family: var(--font-body);
            font-size: var(--text-micro);
            font-weight: var(--weight-semibold);
            letter-spacing: var(--tracking-wide);
            color: var(--gold-dark);
            background: color-mix(in oklab, var(--gold) 12%, transparent);
            border-radius: var(--radius-pill);
            padding: 2px 9px;
        }
        .watch-program-note {
            display: block;
            font-size: var(--text-small);
            line-height: var(--leading-normal);
            color: var(--text-muted);
            margin-top: 2px;
        }
        .watch-program-foot {
            margin-top: var(--space-lg);
            font-size: var(--text-small);
            color: var(--text-muted);
        }
        .watch-program-foot a {
            color: var(--gold-dark);
            text-decoration: none;
            border-bottom: 1px solid var(--text-hairline);
            transition: border-color var(--motion-fast) var(--ease-out-soft);
        }
        .watch-program-foot a:hover { border-color: var(--gold); }

        /* --- Discussion: reflection prompts --- */
        .watch-discussion {
            list-style: none;
            counter-reset: q;
            margin: 0;
            padding: 0;
            display: grid;
            gap: var(--space-md);
        }
        .watch-discussion-item {
            counter-increment: q;
            position: relative;
            padding: var(--space-md) 0 var(--space-md) calc(var(--space-xl) + var(--space-xs));
            border-bottom: 1px solid var(--text-hairline);
            font-size: var(--text-lead);
            font-family: var(--font-display);
            line-height: var(--leading-snug);
            color: var(--text-primary-soft);
        }
        .watch-discussion-item:first-child { padding-top: 0; }
        .watch-discussion-item:last-child { border-bottom: none; }
        .watch-discussion-item::before {
            content: counter(q, decimal-leading-zero);
            position: absolute;
            left: 0;
            top: var(--space-md);
            font-family: var(--font-body);
            font-size: var(--text-label);
            font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wide);
            color: var(--gold-dark);
        }
        .watch-discussion-item:first-child::before { top: 0; }
        @media (min-width: 961px) {
            .watch-discussion { grid-template-columns: 1fr 1fr; column-gap: var(--space-2xl); gap: 0; }
            .watch-discussion-item { padding-top: var(--space-md); }
            .watch-discussion-item:nth-child(-n+2) { padding-top: 0; }
        }

        /* --- Mobile --- */
        @media (max-width: 960px) {
            .watch-feature {
                grid-template-columns: 1fr;
                gap: var(--space-lg);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .watch-player-poster,
            .watch-player-play,
            .watch-program-foot a,
            .watch-program-link { transition: none; }
            .watch-player:hover .watch-player-poster,
            .watch-player:hover .watch-player-play { transform: none; }
        }
    </style>
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section id="watch-intro">
                    <h1 class="section-heading">Watch, and carry it into the week.</h1>
                    <p class="subpage-intro-lead">Missed a Sunday, or want to sit with the message again? Here is the latest service to watch in full, the shape of a morning at Morning Star, and a few questions to take with you after the screen goes dark.</p>
                    <nav class="subpage-jump" aria-label="Jump to a section">
                        <a href="#sermon">Sermon</a>
                        <a href="#worship">Worship &amp; Program</a>
                        <a href="#discussion">Discussion</a>
                    </nav>
                </section>

                <section id="sermon">
                    <span class="section-eyebrow">Sermon</span>
                    <h2 class="section-heading">This Sunday’s message, ready when you are.</h2>
                    <div class="watch-feature">
                        <button class="watch-player" id="watch-player" data-video="${escapeHtml(view.videoId)}" type="button" aria-label="Play the latest Sunday service">
                            <img class="watch-player-poster" id="watch-poster"
                                 src="${escapeHtml(view.posterUrl)}"
                                 alt="Latest Sunday worship service from Morning Star Christian Church in Boise, Idaho."
                                 width="1280" height="720" loading="eager" fetchpriority="high"
                                 onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${escapeHtml(view.videoId)}/hqdefault.jpg';">
                            <span class="watch-player-scrim" aria-hidden="true"></span>
                            <span class="watch-player-play">${PLAY_GLYPH}</span>
                        </button>
                        <div class="watch-feature-meta">
                            <span class="watch-feature-tag">Latest service</span>
                            <h3 class="watch-feature-title">${escapeHtml(view.title)}</h3>
                            ${view.dateLabel ? `<span class="watch-feature-date">${escapeHtml(view.dateLabel)}</span>` : ''}
                            <p class="watch-feature-blurb">${escapeHtml(view.summary)}</p>
                            ${scriptureChips}
                            <div class="watch-feature-actions">
                                <a class="event-link-btn event-link-btn--red teaser-cta" href="${escapeHtml(view.ytWatchUrl)}" target="_blank" rel="noopener">Watch on YouTube</a>
                                <a class="event-link-btn event-link-btn-secondary teaser-cta" href="${escapeHtml(view.playlistUrl)}" target="_blank" rel="noopener">All past services</a>
                            </div>
                            <blockquote class="watch-feature-verse">&ldquo;Faith comes from hearing the message, and the message is heard through the word about Christ.&rdquo;<cite>Romans 10:17</cite></blockquote>
                        </div>
                    </div>
                </section>

                <section id="worship">
                    <span class="section-eyebrow">Worship &amp; Program</span>
                    <h2 class="section-heading">${programHeading}</h2>
                    <p class="section-lead">${programLead}</p>
                    <ol class="watch-program">
                            ${renderProgram(view.program)}
                    </ol>
                    <p class="watch-program-foot">Planning a first visit in person? <a href="/visit#what-to-expect">See what to expect on a Sunday &rarr;</a></p>
                </section>

                <section id="discussion">
                    <span class="section-eyebrow">Discussion</span>
                    <h2 class="section-heading">Take it into the week.</h2>
                    <p class="section-lead">Watching is a start. These are for the drive home, the dinner table, or a group: read the passage again, then talk it through.</p>
                    <ol class="watch-discussion">
                            ${discussionItems}
                    </ol>
                    <p class="watch-program-foot">Want to dig in with others? <a href="/ministries#bible-study">Find a Bible study &rarr;</a></p>
                </section>

                <section id="watch-cta" class="subpage-final-cta">
                    <span class="section-eyebrow">In person</span>
                    <h2 class="section-heading">Even better in the room.</h2>
                    <p class="subpage-final-cta-lead">Online is a great place to start. When you are ready, the seat next to us is open: Sundays at 9 in West Boise, with free breakfast after.</p>
                    <a class="event-link-btn teaser-cta" href="/visit">Plan a Visit</a>
                </section>
            </main>

            ${footer()}
        </div>
        <script>
            (function () {
                var player = document.getElementById('watch-player');
                if (!player) return;
                // Click-to-play: swap the facade for the real embed once, on tap.
                // Server-rendered videoId — no fetch, so nothing mutates the DOM
                // during scroll.
                var played = false;
                player.addEventListener('click', function () {
                    if (played) return;
                    played = true;
                    var id = player.getAttribute('data-video');
                    var iframe = document.createElement('iframe');
                    iframe.className = 'watch-feature-iframe';
                    iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
                    iframe.title = 'Sunday service video from Morning Star Christian Church';
                    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.setAttribute('frameborder', '0');
                    // Swap the <button> facade for a plain container, so we
                    // don't leave a focusable, empty button wrapping the iframe
                    // in the accessibility tree.
                    var holder = document.createElement('div');
                    holder.className = 'watch-player is-playing';
                    holder.appendChild(iframe);
                    player.replaceWith(holder);
                });
            })();
        </script>
    </body>`
}
