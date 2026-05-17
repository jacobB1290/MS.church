import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /about — full About Us page.
// Uses standardized .section-eyebrow / .section-heading / .section-card /
// .event-link-btn / .btn-secondary classes from the home design system —
// no bespoke styles. Image slots use the v1.40.0 placeholder pattern.

const PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`

export const aboutBody = (): string => `
    <body>
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main>
                <section id="about-intro">
                    <span class="section-eyebrow">About Us</span>
                    <h1 class="section-heading">Mending the Broken in Boise, Idaho</h1>
                    <p class="section-lead">Morning Star Christian Church is a welcoming, Bible-believing community in the heart of Boise — where every story, every age, and every burden is met with grace, scripture, and a seat at the table.</p>
                </section>

                <section id="mission">
                    <span class="section-eyebrow">Our Mission</span>
                    <h2 class="section-heading">Faith, family, and a city we love.</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>We exist to point people to Jesus, to build a family that bears one another's burdens, and to serve Boise with the same compassion we've been shown. "Mending the Broken" is not a slogan — it's the lens we view every Sunday morning, every Tuesday coffee, every Thursday study, every Friday youth night, and every meal we cook for our city's most vulnerable.</p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
                        </div>
                    </div>
                </section>

                <section id="story">
                    <span class="section-eyebrow">Our Story</span>
                    <h2 class="section-heading">A small church with a big heart.</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>Morning Star was planted in Boise to be a place where people who never thought church was for them could find belonging. We're young, we're small, and we believe that the gospel is the most powerful force in any city — including ours. Whether you've grown up in church or you're walking through the door for the first time, you'll find friendly faces, honest teaching, and free breakfast every Sunday.</p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
                        </div>
                    </div>
                </section>

                <section id="beliefs">
                    <span class="section-eyebrow">What We Believe</span>
                    <h2 class="section-heading">Core convictions, simply stated.</h2>
                    <div class="section-card">
                        <div class="schedule-grid">
                            <article class="schedule-item belief-item">
                                <div class="schedule-item-text">
                                    <span>Scripture</span>
                                    <h3>Bible-Believing, Bible-Teaching</h3>
                                    <p>The Bible is the inspired, authoritative Word of God — and we teach the whole of it. No watered-down version, no skipped pages. The whole counsel of God, in grace and truth.</p>
                                </div>
                            </article>
                            <article class="schedule-item belief-item">
                                <div class="schedule-item-text">
                                    <span>Jesus</span>
                                    <h3>Lord and Savior</h3>
                                    <p>Jesus Christ — God's Son, crucified, risen, and coming again — is the only Lord and Savior. Salvation is found in him alone, and a real, daily relationship with him is the heart of our faith.</p>
                                </div>
                            </article>
                            <article class="schedule-item belief-item">
                                <div class="schedule-item-text">
                                    <span>Grace</span>
                                    <h3>Saved by Faith</h3>
                                    <p>We are saved by grace through faith, not by anything we have done — every seat at our table is a free one.</p>
                                </div>
                            </article>
                            <article class="schedule-item belief-item">
                                <div class="schedule-item-text">
                                    <span>Community</span>
                                    <h3>The Church Family</h3>
                                    <p>We gather, we eat, we pray, we serve, we carry each other — and we welcome anyone who wants in.</p>
                                </div>
                            </article>
                        </div>
                        <div class="teaser-cta-row">
                            <a class="event-link-btn teaser-cta" href="/beliefs">Read Our Full Statement of Beliefs</a>
                        </div>
                    </div>
                </section>

                <section id="leadership">
                    <span class="section-eyebrow">Leadership</span>
                    <h2 class="section-heading">Meet our pastor.</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>Our church is shepherded by a small, accessible leadership team rooted in scripture and committed to walking with our congregation through every season. Reach out any time — we'd love to meet you, answer questions, or pray for you.</p>
                                <p style="margin-top: 14px;"><a href="/#contact" style="color: var(--gold); font-weight: 600;">Send us a message →</a></p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
                        </div>
                    </div>
                </section>

                <section id="visit">
                    <span class="section-eyebrow">Visit Us</span>
                    <h2 class="section-heading">Plan your first Sunday.</h2>
                    <div class="section-card">
                        <p class="section-lead">Join us at <strong>9:00 AM</strong> any Sunday at <strong>3080 Wildwood St, Boise</strong>. Coffee and breakfast are on us. Wear what's comfortable. There's no dress code, no insider language — just a room full of people glad you came.</p>
                        <div class="subpage-cta-row">
                            <a class="event-link-btn" href="/#schedule">See Full Schedule</a>
                            <a class="event-link-btn event-link-btn-secondary" href="/outreach">Explore Outreach</a>
                            <a class="event-link-btn event-link-btn-secondary" href="/#contact">Contact Us</a>
                        </div>
                    </div>
                </section>
            </main>

            ${footer()}
        </div>
    </body>`
