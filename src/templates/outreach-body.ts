import { nav } from './shared/nav.js'
import { footer } from './shared/footer.js'

// /outreach — Ministries hub + events.
// The events carousel + past events modal are moved here from home.
// The associated JS lives in home-scripts.ts (still loaded on /outreach
// since the script gracefully no-ops on pages without the carousel DOM).

const PLACEHOLDER_IMAGE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`

export const outreachBody = (): string => `
    <body>
        <div class="page">
            ${nav('/outreach')}
            <div class="nav-spacer"></div>
            <main>
                <section class="subpage-hero" id="outreach-hero">
                    <span class="section-eyebrow">Outreach</span>
                    <h1 class="subpage-heading">How We Serve Boise</h1>
                    <p class="subpage-lead">Faith without works is dead. Here's how Morning Star puts love into action — through weekly ministries, monthly community service, and seasonal events open to anyone in the city.</p>
                </section>

                <section class="about-section" id="ministries">
                    <span class="section-eyebrow">Our Ministries</span>
                    <h2 class="section-heading-sm">Ways we live out our mission, every week.</h2>

                    <article class="ministry-card" id="sunday-school">
                        <div class="about-grid about-grid-left">
                            <div class="about-text-card">
                                <span class="ministry-meta">Sundays · During the 9:00 AM service</span>
                                <h3 class="ministry-heading">Sunday School</h3>
                                <p>Children's Sunday School runs during the main service so families can worship together and kids can dive into scripture at their level. Curriculum focuses on the gospel, the Bible's storyline, and what it means to follow Jesus. Safe, warm, and joyful — drop-off is welcome any Sunday.</p>
                                <p class="ministry-cta"><a href="/#contact">Ask about Sunday School →</a></p>
                            </div>
                            <div class="about-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_IMAGE_SVG}</div>
                        </div>
                    </article>

                    <article class="ministry-card" id="cooking-ministry">
                        <div class="about-grid about-grid-right">
                            <div class="about-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_IMAGE_SVG}</div>
                            <div class="about-text-card">
                                <span class="ministry-meta">Monthly · Boise homeless shelters</span>
                                <h3 class="ministry-heading">Cooking at the Shelters</h3>
                                <p>Once a month, a team from Morning Star cooks and serves a full hot meal at local homeless shelters in Boise. It's hands-on, it's humble, and it's one of the most concrete ways we live "mending the broken." No experience required — only willing hands.</p>
                                <p class="ministry-cta"><a href="/#contact">Join the next cook →</a></p>
                            </div>
                        </div>
                    </article>

                    <article class="ministry-card" id="community-breakfast">
                        <div class="about-grid about-grid-left">
                            <div class="about-text-card">
                                <span class="ministry-meta">Every Sunday · After service</span>
                                <h3 class="ministry-heading">Free Community Breakfast</h3>
                                <p>Every Sunday morning after worship, breakfast is on us — for guests, members, neighbors, and anyone passing through. We also offer free transportation from select Boise shelters so the table is open to people who need it most.</p>
                                <p class="ministry-cta"><a href="/#schedule">See the full schedule →</a></p>
                            </div>
                            <div class="about-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_IMAGE_SVG}</div>
                        </div>
                    </article>

                    <article class="ministry-card" id="seasonal-outreach">
                        <div class="about-grid about-grid-right">
                            <div class="about-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_IMAGE_SVG}</div>
                            <div class="about-text-card">
                                <span class="ministry-meta">Year-round · Boise community</span>
                                <h3 class="ministry-heading">Seasonal Events &amp; Outreach</h3>
                                <p>From Friendsgiving in the fall to community-wide events around major holidays, Morning Star regularly hosts open-door gatherings designed to feed people, build friendships, and welcome neighbors who may not have a church home. See what's coming up below.</p>
                            </div>
                        </div>
                    </article>
                </section>

                <section class="outreach" id="events" style="animation-delay: 0.3s">
                    <span class="section-eyebrow">Events</span>
                    <h2 class="section-heading">Upcoming &amp; Past Events</h2>

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
