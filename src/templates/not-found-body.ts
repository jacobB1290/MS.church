import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// 404 page — rendered as a standard subpage (subpageHeader + footer) so
// even the error page shares the site's warm editorial design system:
// same tokens, same entrance fade, same chrome. The previous standalone
// 404 used a cool blue-white palette that read as a different site.

export const notFoundBody = (): string => `
    <style>
        /* 404 — page-scoped. Centers the message in the viewport space
           between the chrome and the footer so the page never feels
           like an empty document. */
        .notfound-section {
            min-height: clamp(320px, 48vh, 560px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
        }
        .notfound-code {
            font-family: var(--font-display);
            font-size: var(--text-hero);
            font-weight: var(--weight-bold);
            color: var(--gold);
            line-height: var(--leading-tight);
            letter-spacing: var(--tracking-tight);
            margin: 0 0 var(--space-xs);
        }
        .notfound-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-sm);
            margin-top: var(--space-md);
        }
    </style>
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section class="notfound-section">
                    <p class="notfound-code" aria-hidden="true">404</p>
                    <h1 class="section-heading">We couldn&rsquo;t find that page.</h1>
                    <p class="subpage-intro-lead">The address may have changed, or the link may be out of date. Everything you&rsquo;re looking for is still a click away.</p>
                    <div class="notfound-actions">
                        <a class="event-link-btn teaser-cta" href="/">Back to Home</a>
                        <a class="event-link-btn teaser-cta event-link-btn-secondary" href="/visit">Plan a Visit</a>
                    </div>
                </section>
            </main>

            ${footer('/')}
        </div>
    </body>`
