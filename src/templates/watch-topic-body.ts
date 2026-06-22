import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import { watchCard, escapeHtml } from './watch-shared.js'
import type { PublishedSermon } from '../sermons-feed.js'

// /watch/topic/<slug> — every published service tagged with one AI topic. A real
// filtered view (its own crawlable URL + schema), and the destination of the
// topic chips on cards and permalinks.

export const watchTopicBody = (
  topic: string,
  sermons: PublishedSermon[],
): string => {
  const cards = sermons.map((s) => watchCard(s)).join('\n                        ')
  const count = sermons.length
  return `
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section id="watch-intro">
                    <span class="section-eyebrow">Topic</span>
                    <h1 class="section-heading">${escapeHtml(topic)}.</h1>
                    <p class="subpage-intro-lead">${count} ${count === 1 ? 'service' : 'services'} on ${escapeHtml(topic.toLowerCase())}, each one ready to watch in full right here. <a href="/watch" style="color: var(--gold-dark);">Back to all services</a>.</p>
                </section>

                <section aria-label="Services on this topic">
                    <div class="watch-grid">
                        ${cards}
                    </div>
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
    </body>`
}
