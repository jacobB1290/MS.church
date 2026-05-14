import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /outreach — Ministries hub + events.
// Section order: intro → events → meals & hospitality (combined section
// containing Cooking Ministry + Community Breakfast as two parallel
// ministry blocks under one shared banner image) → past-events modal.
// The #cooking-ministry and #community-breakfast IDs live on the
// inner <article> blocks so home-page teaser links continue to scroll
// to the specific ministry.
// Sunday School lives on /visit now (it's a visitor-onboarding concern,
// not a community-service ministry).

const PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`

export const outreachBody = (): string => `
    <body>
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main>
                <section id="outreach-intro">
                    <span class="section-eyebrow">Outreach</span>
                    <h1 class="section-heading">How We Serve Boise</h1>
                    <p class="section-lead">Faith without works is dead. Here's how Morning Star puts love into action — through monthly community service and seasonal events open to anyone in the city.</p>
                </section>

                <section class="outreach" id="events">
                    <span class="section-eyebrow">Events</span>
                    <h2 class="section-heading">Upcoming &amp; Past Events</h2>
                    <p class="section-lead">Year-round, Morning Star hosts open-door gatherings designed to feed people, build friendships, and welcome the city — from Friendsgiving in the fall to community-wide events around major holidays. Browse what's coming up next, or scroll back through past gatherings.</p>

                    <!-- Stay Tuned Card - shown when no upcoming events -->
                    <div class="stay-tuned-container" id="stay-tuned-container" style="display: none;"></div>

                    <!-- Carousel for upcoming events -->
                    <div class="carousel-wrapper" id="carousel-wrapper" style="display: none;">
                        <div class="carousel-viewport" aria-live="polite" aria-atomic="false">
                            <div class="carousel-track" id="carousel-track" role="list">
                                <!-- Cards rendered by JS; track slides via translateX -->
                            </div>
                        </div>
                        <button class="carousel-arrow prev" id="carousel-prev" aria-label="Previous event">&#8249;</button>
                        <button class="carousel-arrow next" id="carousel-next" aria-label="Next event">&#8250;</button>
                        <div class="carousel-nav" id="carousel-nav">
                            <div class="carousel-dots" id="carousel-dots"></div>
                        </div>
                    </div>
                </section>

                <section id="meals-hospitality">
                    <span class="section-eyebrow">Meals &amp; Hospitality</span>
                    <h2 class="section-heading">Two tables, one mission.</h2>
                    <div class="ministries-pair">
                        <div class="ministries-image ministries-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
                        <div class="ministries-grid">
                            <article class="ministry-block" id="cooking-ministry">
                                <span class="ministry-eyebrow">Cooking Ministry</span>
                                <h3 class="ministry-title">Monthly &middot; Boise homeless shelters</h3>
                                <p class="ministry-text">Once a month, a team from Morning Star cooks and serves a full hot meal at local homeless shelters in Boise. It's hands-on, it's humble, and it's one of the most concrete ways we live "mending the broken." No experience required &mdash; only willing hands.</p>
                                <a href="/#contact" class="ministry-link">Join the next cook &rarr;</a>
                            </article>
                            <article class="ministry-block" id="community-breakfast">
                                <span class="ministry-eyebrow">Community Breakfast</span>
                                <h3 class="ministry-title">Every Sunday &middot; After service</h3>
                                <p class="ministry-text">Every Sunday morning after worship, breakfast is on us &mdash; for guests, members, neighbors, and anyone passing through. We also offer free transportation from select Boise shelters so the table is open to people who need it most.</p>
                                <a href="/visit#what-to-expect" class="ministry-link">More about Sunday morning &rarr;</a>
                            </article>
                        </div>
                    </div>
                </section>

                <!-- Past Events Modal - Overlay Carousel (outside normal page flow) -->
                <div class="past-events-modal" id="past-events-modal">
                    <div class="past-events-modal-content">
                        <div class="past-events-modal-header">
                            <h3 class="past-events-modal-title">Past Events</h3>
                            <button class="past-events-modal-close" id="close-past-events" aria-label="Close past events">&times;</button>
                        </div>
                        <div class="past-events-carousel">
                            <button class="past-events-nav prev" id="past-prev" aria-label="Previous event">&#8249;</button>
                            <div class="past-events-slides" id="past-events-slides">
                                <!-- Past event slides dynamically generated -->
                            </div>
                            <button class="past-events-nav next" id="past-next" aria-label="Next event">&#8250;</button>
                        </div>
                        <div class="past-events-dots" id="past-events-dots">
                            <!-- Dots dynamically generated -->
                        </div>
                    </div>
                </div>
            </main>

            ${footer()}
        </div>
    </body>`
