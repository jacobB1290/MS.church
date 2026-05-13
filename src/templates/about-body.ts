import { nav } from './shared/nav.js'
import { footer } from './shared/footer.js'
import { navScripts } from './shared/nav-scripts.js'

// /about — full About Us page.
// Content is placeholder-friendly; real copy should be supplied by the church.
// Images use the v1.40.0 placeholder pattern so the layout is final before
// real photography is sourced.

const PLACEHOLDER_IMAGE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`

export const aboutBody = (): string => `
    <body>
        <div class="page">
            ${nav('/about')}
            <div class="nav-spacer"></div>
            <main>
                <section class="subpage-hero" id="about-hero">
                    <span class="section-eyebrow">About Us</span>
                    <h1 class="subpage-heading">Mending the Broken in Boise, Idaho</h1>
                    <p class="subpage-lead">Morning Star Christian Church is a welcoming nondenominational community in the heart of Boise — where every story, every age, and every burden is met with grace, scripture, and a seat at the table.</p>
                </section>

                <section class="about-section" id="mission">
                    <div class="about-grid about-grid-left">
                        <div class="about-text-card">
                            <span class="section-eyebrow">Our Mission</span>
                            <h2 class="section-heading-sm">Faith, family, and a city we love.</h2>
                            <p>We exist to point people to Jesus, to build a family that bears one another's burdens, and to serve Boise with the same compassion we've been shown. "Mending the Broken" is not a slogan — it's the lens we view every Sunday morning, every Tuesday coffee, every Thursday study, every Friday youth night, and every meal we cook for our city's most vulnerable.</p>
                        </div>
                        <div class="about-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_IMAGE_SVG}</div>
                    </div>
                </section>

                <section class="about-section" id="story">
                    <div class="about-grid about-grid-right">
                        <div class="about-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_IMAGE_SVG}</div>
                        <div class="about-text-card">
                            <span class="section-eyebrow">Our Story</span>
                            <h2 class="section-heading-sm">A small church with a big heart.</h2>
                            <p>Morning Star was planted in Boise to be a place where people who never thought church was for them could find belonging. We're young, we're small, and we believe that the gospel is the most powerful force in any city — including ours. Whether you've grown up in church or you're walking through the door for the first time, you'll find friendly faces, honest teaching, and free breakfast every Sunday.</p>
                        </div>
                    </div>
                </section>

                <section class="about-section" id="beliefs">
                    <span class="section-eyebrow">What We Believe</span>
                    <h2 class="section-heading-sm">Core convictions, simply stated.</h2>
                    <div class="beliefs-grid">
                        <article class="belief-card">
                            <h3>Scripture</h3>
                            <p>The Bible is the inspired, authoritative Word of God and the final rule of faith and practice.</p>
                        </article>
                        <article class="belief-card">
                            <h3>Jesus</h3>
                            <p>Jesus is the Son of God who lived, died, rose again, and is coming back — and salvation is found in him alone.</p>
                        </article>
                        <article class="belief-card">
                            <h3>Grace</h3>
                            <p>We are saved by grace through faith, not by anything we have done — so every seat at our table is a free one.</p>
                        </article>
                        <article class="belief-card">
                            <h3>Community</h3>
                            <p>The church is a family. We gather, we eat, we pray, we serve, we carry each other — and we welcome anyone who wants in.</p>
                        </article>
                    </div>
                </section>

                <section class="about-section" id="leadership">
                    <div class="about-grid about-grid-left">
                        <div class="about-text-card">
                            <span class="section-eyebrow">Leadership</span>
                            <h2 class="section-heading-sm">Meet our pastor.</h2>
                            <p>Our church is shepherded by a small, accessible leadership team rooted in scripture and committed to walking with our congregation through every season. Reach out any time — we'd love to meet you, answer questions, or pray for you.</p>
                            <p class="about-leader-meta">Want to get in touch? <a href="/#contact">Send us a message →</a></p>
                        </div>
                        <div class="about-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_IMAGE_SVG}</div>
                    </div>
                </section>

                <section class="about-section about-cta" id="visit">
                    <span class="section-eyebrow">Visit Us</span>
                    <h2 class="section-heading-sm">Plan your first Sunday.</h2>
                    <p>Join us at <strong>9:00 AM</strong> any Sunday at <strong>3080 Wildwood St, Boise</strong>. Coffee and breakfast are on us. Wear what's comfortable. There's no pressure, no dress code, and no insider language — just a room full of people glad you came.</p>
                    <div class="about-cta-row">
                        <a class="about-cta-btn primary" href="/#schedule">See full schedule</a>
                        <a class="about-cta-btn" href="/outreach">Explore our outreach</a>
                        <a class="about-cta-btn" href="/#contact">Contact us</a>
                    </div>
                </section>
            </main>

            ${footer()}
        </div>

        ${navScripts()}
    </body>`
