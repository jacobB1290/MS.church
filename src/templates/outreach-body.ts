import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /outreach — Ministries hub + events.
// Uses standardized .section-eyebrow / .section-heading / .section-card /
// .schedule-item / .event-link-btn classes — no bespoke styles.
// The events carousel + past-events modal are migrated from home; the
// Google Calendar JS lives in home-scripts.ts (still bundled on this page).
// Section order: intro → events (top of fold) → ministries → past-events modal.

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
                    <p class="section-lead">Faith without works is dead. Here's how Morning Star puts love into action — through weekly ministries, monthly community service, and seasonal events open to anyone in the city.</p>
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

                <section id="sunday-school">
                    <span class="section-eyebrow">Sunday School</span>
                    <h2 class="section-heading">Sundays · During the 9 AM service</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>Children's Sunday School runs during the main service so families can worship together and kids can dive into scripture at their level. Curriculum focuses on the gospel, the Bible's storyline, and what it means to follow Jesus. Safe, warm, and joyful — drop-off is welcome any Sunday.</p>
                                <p style="margin-top: 14px;"><a href="/#contact" style="color: var(--gold); font-weight: 600;">Ask about Sunday School →</a></p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
                        </div>
                    </div>
                </section>

                <section id="cooking-ministry">
                    <span class="section-eyebrow">Cooking Ministry</span>
                    <h2 class="section-heading">Monthly · Boise homeless shelters</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>Once a month, a team from Morning Star cooks and serves a full hot meal at local homeless shelters in Boise. It's hands-on, it's humble, and it's one of the most concrete ways we live "mending the broken." No experience required — only willing hands.</p>
                                <p style="margin-top: 14px;"><a href="/#contact" style="color: var(--gold); font-weight: 600;">Join the next cook →</a></p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
                        </div>
                    </div>
                </section>

                <section id="community-breakfast">
                    <span class="section-eyebrow">Community Breakfast</span>
                    <h2 class="section-heading">Every Sunday · After service</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>Every Sunday morning after worship, breakfast is on us — for guests, members, neighbors, and anyone passing through. We also offer free transportation from select Boise shelters so the table is open to people who need it most.</p>
                                <p style="margin-top: 14px;"><a href="/#schedule" style="color: var(--gold); font-weight: 600;">See the full schedule →</a></p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
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
