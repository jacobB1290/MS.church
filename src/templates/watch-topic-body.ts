import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import { messageCard, songCard, escapeHtml, watchPlayerScript } from './watch-shared.js'
import type { PublishedSermon } from '../sermons-feed.js'

// /watch/topic/<slug> — everything tagged with one topic: messages (sermons +
// discussions) and worship songs. A real filtered view (its own crawlable URL +
// schema). Each card plays inline, like the hub.

type SongMatch = { sermon: PublishedSermon; song: PublishedSermon['songs'][number]; count: number }

export const watchTopicBody = (
  topic: string,
  sermons: PublishedSermon[],
  songs: SongMatch[] = [],
): string => {
  const total = sermons.length + songs.length
  const lede =
    [
      sermons.length ? `${sermons.length} ${sermons.length === 1 ? 'message' : 'messages'}` : '',
      songs.length ? `${songs.length} ${songs.length === 1 ? 'song' : 'songs'}` : '',
    ]
      .filter(Boolean)
      .join(' and ') || `${total} items`

  const messagesSection = sermons.length
    ? `<section aria-label="Messages on this topic">
                    ${songs.length ? '<span class="section-eyebrow">Messages</span>' : ''}
                    <div class="watch-grid">
                        ${sermons.map((s) => messageCard(s)).join('\n                        ')}
                    </div>
                </section>`
    : ''

  const songsSection = songs.length
    ? `<section aria-label="Songs on this topic" style="margin-top: var(--space-2xl);">
                    <span class="section-eyebrow">Songs</span>
                    <div class="watch-grid">
                        ${songs.map((x) => songCard(x.sermon, x.song, x.count)).join('\n                        ')}
                    </div>
                </section>`
    : ''

  return `
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section id="watch-intro">
                    <span class="section-eyebrow">Topic</span>
                    <h1 class="section-heading">${escapeHtml(topic)}.</h1>
                    <p class="subpage-intro-lead">${lede} on ${escapeHtml(topic.toLowerCase())}, each one ready to watch right here. <a href="/watch" style="color: var(--gold-dark);">Back to all services</a>.</p>
                </section>

                ${messagesSection}
                ${songsSection}

                <section id="watch-cta" class="subpage-final-cta">
                    <span class="section-eyebrow">In person</span>
                    <h2 class="section-heading">Even better in the room.</h2>
                    <p class="subpage-final-cta-lead">Online is a great place to start. When you are ready, the seat next to us is open: Sundays at 9 in West Boise, with free breakfast after.</p>
                    <a class="event-link-btn teaser-cta" href="/visit">Plan a Visit</a>
                </section>
            </main>

            ${footer('/')}
        </div>
        ${watchPlayerScript()}
    </body>`
}
