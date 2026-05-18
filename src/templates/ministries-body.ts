import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /ministries — five-category hub for our weekly programs.
// Mirrors the /outreach hub pattern (intro section + section-card with cards)
// but for inward-facing ministries instead of outward-facing service.
// Categories follow the church-standard taxonomy: Worship, Discipleship,
// Fellowship, Youth, Kids. Each category is a section with anchor (#worship,
// #discipleship, etc.) so the home-page Schedule tabs can link directly into
// the relevant slice, and so Outreach's hospitality teaser can cross-reference
// #fellowship without duplicating Community Breakfast content.

type Ministry = {
  id: string
  name: string
  when: string
  description: string
  facts: { label: string; value: string }[]
  ctaLabel: string
  ctaHref: string
}

type Category = {
  id: string
  eyebrow: string
  heading: string
  ministries: Ministry[]
  // Optional small note rendered between heading and cards (e.g. cross-ref).
  note?: string
}

const CATEGORIES: Category[] = [
  {
    id: 'worship',
    eyebrow: 'Worship',
    heading: 'How we gather together on Sundays.',
    ministries: [
      {
        id: 'sunday-gatherings',
        name: 'Sunday Gatherings',
        when: 'Sundays · 9:00 AM',
        description:
          'Our weekly worship service. About an hour: songs, scripture, teaching, and a closing prayer — followed by a free breakfast for everyone who stays. Newcomers welcome any week, no signup, no pressure.',
        facts: [
          { label: 'When', value: 'Sundays at 9:00 AM' },
          { label: 'Where', value: '3080 Wildwood St, Boise' },
          { label: 'After', value: 'Free community breakfast' },
        ],
        ctaLabel: 'Plan Your Visit',
        ctaHref: '/visit',
      },
    ],
  },
  {
    id: 'discipleship',
    eyebrow: 'Discipleship',
    heading: 'How we study scripture and grow together.',
    ministries: [
      {
        id: 'bible-study',
        name: 'Bible Study',
        when: 'Thursdays · 6:00 PM',
        description:
          'A 45-minute evening Bible study at the church with free coffee. Open discussion, gospel-grounded, paced so newcomers and longtime members can both engage.',
        facts: [
          { label: 'When', value: 'Thursdays at 6:00 PM' },
          { label: 'Where', value: '3080 Wildwood St, Boise' },
          { label: 'Bring', value: 'A Bible — we have extras' },
        ],
        ctaLabel: 'Ask about Bible Study',
        ctaHref: '/#contact',
      },
      {
        id: 'bible-reading',
        name: 'Bible Reading',
        when: 'Tuesdays · 8:30 AM',
        description:
          'A morning Bible reading at Caffiena State Street. Coffee shop setting, casual, drop in any week.',
        facts: [
          { label: 'When', value: 'Tuesdays at 8:30 AM' },
          { label: 'Where', value: 'Caffiena State Street' },
          { label: 'Format', value: 'Coffee + scripture, drop in anytime' },
        ],
        ctaLabel: 'Ask about Bible Reading',
        ctaHref: '/#contact',
      },
    ],
  },
  {
    id: 'fellowship',
    eyebrow: 'Fellowship',
    heading: 'How we spend time together off-Sunday.',
    note:
      "We also share a free breakfast every Sunday after the service — see <a href='/outreach#meals-hospitality'>Community Breakfast</a> on the Outreach page for that.",
    ministries: [
      {
        id: 'activity-day',
        name: 'Activity Day',
        when: 'Wednesdays · 6:00 PM',
        description:
          'Open gym for basketball and volleyball, plus a crochet circle to learn the craft and grow your skills. About three hours, all ages welcome.',
        facts: [
          { label: 'When', value: 'Wednesdays at 6:00 PM' },
          { label: 'Where', value: '3080 Wildwood St, Boise' },
          { label: 'Bring', value: 'Just yourself — gear provided' },
        ],
        ctaLabel: 'Ask about Activity Day',
        ctaHref: '/#contact',
      },
    ],
  },
  {
    id: 'youth',
    eyebrow: 'Youth',
    heading: 'How we walk with the next generation.',
    ministries: [
      {
        id: 'youth-service',
        name: 'Youth Service',
        when: 'Fridays · 7:00 PM',
        description:
          'Worship, teaching, and fellowship designed for middle school and high school students. About an hour — leaders are present every week and parents are welcome to come early or stick around.',
        facts: [
          { label: 'When', value: 'Fridays at 7:00 PM' },
          { label: 'Where', value: '3080 Wildwood St, Boise' },
          { label: 'For', value: 'Middle school and high school' },
        ],
        ctaLabel: 'Ask about Youth Service',
        ctaHref: '/#contact',
      },
    ],
  },
  {
    id: 'kids',
    eyebrow: 'Kids',
    heading: 'How we make room for the youngest among us.',
    ministries: [
      {
        id: 'sunday-school',
        name: 'Sunday School',
        when: 'Sundays · During the 9 AM service',
        description:
          "Children's Sunday School runs in a separate room during the main service, so families can worship together and kids can dive into scripture at their level. Safe, warm, and joyful — drop-off is welcome any Sunday.",
        facts: [
          { label: 'When', value: 'During the 9 AM service' },
          { label: 'Focus', value: 'Gospel-centered, Bible storyline' },
          { label: 'Drop-in', value: 'Welcome any Sunday — no signup' },
        ],
        ctaLabel: 'Ask about Sunday School',
        ctaHref: '/#contact',
      },
    ],
  },
]

function renderMinistryCard(m: Ministry): string {
  const factRows = m.facts
    .map((f) => `<div><dt>${f.label}</dt><dd>${f.value}</dd></div>`)
    .join('\n                                ')
  return `<article class="ministry-entry" id="${m.id}">
                            <div class="ministry-entry-head">
                                <h3 class="ministry-entry-name">${m.name}</h3>
                                <p class="ministry-entry-when">${m.when}</p>
                            </div>
                            <p class="ministry-entry-desc">${m.description}</p>
                            <dl class="ministry-entry-facts">
                                ${factRows}
                            </dl>
                            <a class="event-link-btn ministry-entry-cta" href="${m.ctaHref}">${m.ctaLabel} &rarr;</a>
                        </article>`
}

function renderCategory(c: Category): string {
  const cards = c.ministries.map(renderMinistryCard).join('\n                        ')
  const noteHtml = c.note ? `<p class="ministry-category-note">${c.note}</p>` : ''
  return `<section class="ministry-category" id="${c.id}">
                    <span class="section-eyebrow">${c.eyebrow}</span>
                    <h2 class="section-heading">${c.heading}</h2>
                    ${noteHtml}
                    <div class="ministry-grid">
                        ${cards}
                    </div>
                </section>`
}

const categorySections = CATEGORIES.map(renderCategory).join('\n\n                ')

export const ministriesBody = (): string => `
    <style>
        /* Ministries — page-scoped styles. Matches the Outreach hub's
           card density (clean white cards in a vertical stack) while
           reusing the global section-card / section-eyebrow / event-link-btn
           tokens. */
        .ministry-category {
            margin-bottom: clamp(48px, 7vw, 88px);
        }
        .ministry-category:last-child {
            margin-bottom: 0;
        }
        .ministry-category-note {
            color: rgba(26, 26, 46, 0.62);
            font-size: clamp(13px, 1.4vw, 14.5px);
            line-height: 1.65;
            margin: clamp(8px, 1.4vw, 14px) 0 clamp(20px, 2.8vw, 28px);
            font-style: italic;
        }
        .ministry-category-note a {
            color: var(--gold);
            text-decoration: none;
            border-bottom: 1px solid rgba(212, 165, 116, 0.4);
            transition: border-color 0.25s ease;
        }
        .ministry-category-note a:hover {
            border-bottom-color: var(--gold-dark);
        }
        .ministry-grid {
            display: grid;
            gap: clamp(20px, 2.4vw, 28px);
            grid-template-columns: 1fr;
            margin-top: clamp(20px, 2.6vw, 28px);
        }
        @media (min-width: 961px) {
            .ministry-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            /* Single-entry categories (Worship, Fellowship, Youth, Kids) get
               a wider card so they read as the focal entry of the section
               instead of looking like a half-filled grid. */
            .ministry-grid:has(> .ministry-entry:only-child) {
                grid-template-columns: 1fr;
            }
        }
        .ministry-entry {
            background: #ffffff;
            border-radius: clamp(18px, 2vw, 24px);
            padding: clamp(24px, 3vw, 36px) clamp(22px, 2.8vw, 36px);
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05),
                        0 2px 8px rgba(0, 0, 0, 0.03);
            display: flex;
            flex-direction: column;
            gap: clamp(14px, 1.8vw, 20px);
        }
        .ministry-entry-head {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .ministry-entry-name {
            font-family: var(--font-display);
            font-size: clamp(22px, 2.6vw, 30px);
            font-weight: 700;
            color: #1a1a2e;
            margin: 0;
            line-height: 1.2;
            letter-spacing: -0.3px;
        }
        .ministry-entry-when {
            font-size: clamp(11px, 1.15vw, 12px);
            font-weight: 700;
            color: var(--gold);
            letter-spacing: 1.6px;
            text-transform: uppercase;
            margin: 0;
        }
        .ministry-entry-desc {
            color: rgba(26, 26, 46, 0.72);
            line-height: 1.7;
            font-size: clamp(15px, 1.55vw, 16.5px);
            margin: 0;
        }
        .ministry-entry-facts {
            display: grid;
            gap: clamp(8px, 1.1vw, 12px);
            margin: 0;
            padding: clamp(14px, 1.8vw, 18px) 0;
            border-top: 1px solid rgba(26, 26, 46, 0.08);
            border-bottom: 1px solid rgba(26, 26, 46, 0.08);
        }
        .ministry-entry-facts > div {
            display: grid;
            grid-template-columns: clamp(80px, 9vw, 110px) 1fr;
            gap: clamp(10px, 1.5vw, 16px);
            align-items: baseline;
        }
        .ministry-entry-facts dt {
            font-size: clamp(10px, 1vw, 11px);
            font-weight: 700;
            color: rgba(26, 26, 46, 0.55);
            letter-spacing: 1.4px;
            text-transform: uppercase;
        }
        .ministry-entry-facts dd {
            font-size: clamp(14px, 1.45vw, 15px);
            color: rgba(26, 26, 46, 0.85);
            line-height: 1.55;
            margin: 0;
        }
        .ministry-entry-cta {
            align-self: flex-start;
            margin-top: 4px;
        }
        @media (max-width: 600px) {
            .ministry-entry-facts > div {
                grid-template-columns: 1fr;
                gap: 2px;
            }
        }
    </style>
    <body>
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main>
                <section id="ministries-intro">
                    <span class="section-eyebrow">Ministries</span>
                    <h1 class="section-heading">How we live out 'Mending the Broken' week to week.</h1>
                    <p class="section-lead">Worship, discipleship, fellowship, and walking with the next generation &mdash; the rhythms that keep us together between Sundays. Anyone is welcome at any of these. Drop in, ask questions, or just come see what it looks like.</p>
                </section>

                ${categorySections}

                <section id="ministries-cta">
                    <span class="section-eyebrow">Questions?</span>
                    <h2 class="section-heading">Want to know more about any of these?</h2>
                    <div class="section-card visit-final-cta">
                        <p class="section-lead">Reach out and we'll point you to the right person &mdash; whether it's a Tuesday morning coffee at Caffiena, a Wednesday open gym, or just figuring out what Sunday morning will be like for your family.</p>
                        <a class="event-link-btn teaser-cta" href="/#contact">Contact Us</a>
                    </div>
                </section>
            </main>

            ${footer()}
        </div>
    </body>`
