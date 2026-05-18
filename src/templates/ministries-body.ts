import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /ministries — five-category hub for our weekly programs.
// Editorial design language matching /outreach (no boxed cards — clean
// .ministry-block stacks paired with imagery). Each category section has
// an image + content split; the Kids section gets the vertical-video
// pattern that Sunday School used on /visit previously.
//
// Anchors so the home Schedule tabs deep-link in:
//   #worship, #discipleship, #fellowship, #youth, #kids

const PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`

const VIDEO_PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>`

// Reusable address pill that opens the Apple/Google/Copy dropdown — same UI
// as the home hero. JS to wire it up is inlined at the bottom of this file.
const churchAddressPill = (label = '3080 Wildwood St · Boise, Idaho'): string => `
  <span class="address-dropdown-wrapper">
    <button type="button" class="address-trigger ministry-address-trigger" data-address="3080 Wildwood St, Boise, Idaho">${label}</button>
    <span class="address-dropdown">
      <a href="https://maps.apple.com/place?place-id=I975B333A92084AE7" target="_blank" rel="noopener" class="address-dropdown-item">
        <span class="address-dropdown-icon">🍎</span><span>Apple Maps</span>
      </a>
      <a href="https://maps.app.goo.gl/nmYV7hSLXKVGexu38?g_st=ipc" target="_blank" rel="noopener" class="address-dropdown-item">
        <span class="address-dropdown-icon">🗺️</span><span>Google Maps</span>
      </a>
      <button type="button" class="address-dropdown-item copy-address" data-address="3080 Wildwood St, Boise, Idaho">
        <span class="address-dropdown-icon">📋</span><span>Copy Address</span>
      </button>
    </span>
  </span>
`

const caffienaLink = `<a href="https://maps.app.goo.gl/XkJR5aLy36VVD3356?g_st=ic" target="_blank" rel="noopener" class="ministry-address-link">Caffiena State Street</a>`

type Tip = { label: string; value: string }
type Entry = {
  id: string
  eyebrow: string
  /** Day + time + location, rendered as <h3>. Pass HTML so address pills work. */
  titleHtml: string
  description: string
  tips: Tip[]
  ctaLabel: string
  ctaHref: string
}

type Section = {
  id: string
  eyebrow: string
  heading: string
  /** Optional italic note rendered between heading and the image/content split. */
  note?: string
  /** Image side for the FIRST entry at desktop ≥ 961px. Subsequent entries
      alternate (so a 2-entry section reads image-left / image-right). */
  imageSide: 'left' | 'right'
  entries: Entry[]
}

const SECTIONS: Section[] = [
  {
    id: 'worship',
    eyebrow: 'Worship',
    heading: 'How we gather together on Sundays.',
    imageSide: 'left',
    entries: [
      {
        id: 'sunday-gatherings',
        eyebrow: 'Sunday Gatherings',
        titleHtml: `Sundays · 9:00 AM at ${churchAddressPill()}`,
        description:
          "Our weekly worship service runs about an hour: a brief welcome, two opening songs, the teaching, a closing prayer — followed by a free community breakfast for everyone who stays. Songs are on the screen, lyrics included, sing along or just listen. The teaching stays grounded in scripture and runs about 25–30 minutes. New here? Pick any back row and walk in any week — there's no signup and no expectation that you'll know what to do.",
        tips: [
          { label: 'What to wear', value: "No strict dress code beyond being modest. Most folks land on the casual side — jeans and a shirt are completely fine — and you will see plenty of people dressed more formally too. Both fit in." },
          { label: 'Where to park', value: 'Parking is right next to the building. You will see the lot as soon as you pull up — free, no permit needed.' },
          { label: 'At the door', value: 'Greeters meet everyone at the door for Sunday service. Any questions or need a hand finding something? They will help — no pressure.' },
          { label: 'If you arrive late', value: 'Slip in through the back. The back rows are the easiest entry. Nobody turns around.' },
          { label: 'Bringing kids', value: 'Sunday School runs for kids after the opening songs — see Kids below, or just stay in the service with us; both are welcome.' },
        ],
        ctaLabel: 'Plan Your First Visit',
        ctaHref: '/visit',
      },
    ],
  },
  {
    id: 'discipleship',
    eyebrow: 'Discipleship',
    heading: 'How we study scripture and grow together.',
    imageSide: 'right',
    entries: [
      {
        id: 'bible-study',
        eyebrow: 'Bible Study',
        titleHtml: `Thursdays · 6:00 PM at ${churchAddressPill('the church')}`,
        description:
          "A 45-minute evening Bible study at the church with free coffee. Open discussion, gospel-grounded, paced so newcomers and longtime members can both engage. Whoever is leading that week opens a passage, asks questions, and we go from there. Honest questions are encouraged — there is no \"too basic\" or \"too hard.\"",
        tips: [
          { label: 'What to bring', value: 'A Bible if you have one — we have extras on the back table.' },
          { label: 'Coffee', value: 'Free and on the counter. Grab a cup whenever.' },
          { label: 'If you arrive late', value: 'Walk in and grab a chair. We do not pause the discussion for new arrivals; it just keeps going.' },
          { label: 'First time', value: 'Tell whoever greets you it is your first time and they will get you settled.' },
        ],
        ctaLabel: 'Ask about Bible Study',
        ctaHref: '/#contact',
      },
      {
        id: 'bible-reading',
        eyebrow: 'Bible Reading',
        titleHtml: `Tuesdays · 8:30 AM at ${caffienaLink}`,
        description:
          "A morning Bible reading at a coffee shop on State Street. Casual, no curriculum — we read a passage, talk about it, drink coffee, go to work. Drop in any Tuesday.",
        tips: [
          { label: 'Where', value: 'Caffiena State Street — tap the address above for directions.' },
          { label: 'What to order', value: 'Whatever you want; the coffee shop is just our meeting spot. We are not buying for the group.' },
          { label: 'Bring', value: 'A Bible or the Bible app on your phone. Both fine.' },
          { label: 'Finding the group', value: 'Look for 4–6 people at a table. Wave at any of us — we will pull up another chair.' },
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
      "We also share a free breakfast every Sunday after the service — that's part of <a href='/outreach#meals-hospitality'>Community Breakfast</a> on the Outreach page.",
    imageSide: 'left',
    entries: [
      {
        id: 'activity-day',
        eyebrow: 'Activity Day',
        titleHtml: `Wednesdays · 6:00 PM at ${churchAddressPill('the church')}`,
        description:
          'Two things going at once: open gym for basketball and volleyball, and a crochet circle for whoever wants to learn the craft or work on a project. About three hours start to finish. People drift between both. Kids run around. It is the friendliest night of our week.',
        tips: [
          { label: 'What to wear', value: 'Athletic clothes + flat shoes if you are playing; whatever is comfortable if you are crocheting.' },
          { label: 'Bring', value: 'Just yourself. Basketballs, volleyballs, and crochet supplies are all provided. Bring your own yarn if you have a project in mind.' },
          { label: 'Who comes', value: 'All ages, from kids through retirees. Beginners welcome at both gym and crochet.' },
          { label: 'Drop-in', value: 'Walk in any week — no signup, no fee.' },
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
    imageSide: 'right',
    entries: [
      {
        id: 'youth-service',
        eyebrow: 'Youth Service',
        titleHtml: `Fridays · 7:00 PM at ${churchAddressPill('the church')}`,
        description:
          'A weekly service for our older students — worship, teaching, and time to actually talk to each other. About an hour. Leaders are present every week and parents are welcome to drop off, stay, or pick up early.',
        tips: [
          { label: 'Ages', value: '15 and up — high schoolers and older.' },
          { label: 'What to wear', value: 'Whatever your student would wear to hang out with friends. No dress code.' },
          { label: 'Drop-off', value: 'Pull up, walk them to the door, one of us will be there. Pick up at 8:00 PM in the same spot.' },
          { label: 'For parents', value: 'Come early for coffee with our leaders if you want to meet who is teaching your student that night.' },
          { label: 'First night', value: "Worship songs, a short message, and hangout time after. Tell us it is your student's first time and we will pair them with someone who has been a few weeks." },
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
    imageSide: 'left', // ignored — Kids uses the vertical-video pattern
    entries: [
      {
        id: 'sunday-school',
        eyebrow: 'Sunday School',
        titleHtml: `Sundays · During the 9 AM service at ${churchAddressPill('the church')}`,
        description:
          "Children's Sunday School runs in a separate room during the main service, so families can worship together at the start and kids can dive into scripture at their level when it is time. Safe, warm, joyful — and drop-off is welcome any Sunday. Our team is the same set of trusted faces every week so kids know who they are with.",
        tips: [
          { label: 'Ages', value: 'Preschool through about 5th grade. Older kids usually stay in the service with their family.' },
          { label: 'When they leave', value: "Kids head to the classroom after the two opening worship songs. We'll point you to the room before the service starts." },
          { label: 'Drop-off', value: 'Walk your child to the classroom door — no signup form, no waiver, no ID required.' },
          { label: 'What they do', value: 'Bible storyline lesson + activity at their level. Snacks happen.' },
          { label: 'Pick-up', value: 'Pick up at the classroom right after the closing song. Stay for breakfast either way.' },
        ],
        ctaLabel: 'Ask about Sunday School',
        ctaHref: '/#contact',
      },
    ],
  },
]

function renderTips(tips: Tip[]): string {
  const rows = tips
    .map((t) => `<div><dt>${t.label}</dt><dd>${t.value}</dd></div>`)
    .join('\n                                ')
  return `<dl class="ministry-tips">
                                ${rows}
                            </dl>`
}

function renderEntry(e: Entry): string {
  return `<article class="ministry-block" id="${e.id}">
                            <span class="ministry-eyebrow">${e.eyebrow}</span>
                            <h3 class="ministry-title">${e.titleHtml}</h3>
                            <p class="ministry-text">${e.description}</p>
                            ${renderTips(e.tips)}
                            <a href="${e.ctaHref}" class="ministry-link">${e.ctaLabel} &rarr;</a>
                        </article>`
}

function renderEntryPair(e: Entry, side: 'left' | 'right'): string {
  return `<article class="ministry-entry-pair ministry-entry-pair--${side}" id="${e.id}">
                        <div class="ministry-entry-image ministries-image-placeholder" aria-hidden="true">
                            ${PLACEHOLDER_SVG}
                        </div>
                        <div class="ministry-entry-content">
                            <span class="ministry-eyebrow">${e.eyebrow}</span>
                            <h3 class="ministry-title">${e.titleHtml}</h3>
                            <p class="ministry-text">${e.description}</p>
                            ${renderTips(e.tips)}
                            <a href="${e.ctaHref}" class="ministry-link">${e.ctaLabel} &rarr;</a>
                        </div>
                    </article>`
}

function renderSection(s: Section): string {
  // Kids gets the vertical-video pattern (matches the original Sunday-School
  // design that lived on /visit). All other categories use the image-paired
  // editorial layout from /outreach (.ministries-pair).
  if (s.id === 'kids') {
    const entry = s.entries[0]
    return `<section class="ministry-section ministry-section--kids" id="${s.id}">
                    <span class="section-eyebrow">${s.eyebrow}</span>
                    <h2 class="section-heading">${s.heading}</h2>
                    <div class="sunday-school-content">
                        <div class="vertical-video-frame sunday-school-video" aria-hidden="true">
                            <div class="vertical-video-placeholder">${VIDEO_PLACEHOLDER_SVG}</div>
                        </div>
                        <div class="sunday-school-text">
                            <span class="ministry-eyebrow">${entry.eyebrow}</span>
                            <h3 class="ministry-title">${entry.titleHtml}</h3>
                            <p>${entry.description}</p>
                            ${renderTips(entry.tips)}
                            <a href="${entry.ctaHref}" class="ministry-link">${entry.ctaLabel} &rarr;</a>
                        </div>
                    </div>
                </section>`
  }

  const noteHtml = s.note ? `<p class="ministry-section-note">${s.note}</p>` : ''

  // Multi-entry sections (currently Discipleship) get one image per entry,
  // with the image side alternating starting from the section's imageSide.
  // Single-entry sections keep the original sticky-image layout below.
  if (s.entries.length > 1) {
    const pairsHtml = s.entries
      .map((e, i) => {
        const side: 'left' | 'right' =
          i % 2 === 0 ? s.imageSide : s.imageSide === 'left' ? 'right' : 'left'
        return renderEntryPair(e, side)
      })
      .join('\n                    ')
    return `<section class="ministry-section ministry-section--multi" id="${s.id}">
                    <span class="section-eyebrow">${s.eyebrow}</span>
                    <h2 class="section-heading">${s.heading}</h2>
                    ${noteHtml}
                    <div class="ministry-section-pairs">
                        ${pairsHtml}
                    </div>
                </section>`
  }

  const entriesHtml = s.entries.map(renderEntry).join('\n                        ')
  return `<section class="ministry-section ministry-section--${s.imageSide}" id="${s.id}">
                    <span class="section-eyebrow">${s.eyebrow}</span>
                    <h2 class="section-heading">${s.heading}</h2>
                    ${noteHtml}
                    <div class="ministry-section-content">
                        <div class="ministry-section-image ministries-image-placeholder" aria-hidden="true">
                            ${PLACEHOLDER_SVG}
                        </div>
                        <div class="ministry-section-entries">
                            ${entriesHtml}
                        </div>
                    </div>
                </section>`
}

const sectionsHtml = SECTIONS.map(renderSection).join('\n\n                ')

export const ministriesBody = (): string => `
    <style>
        /* /ministries — editorial split per category, no boxed cards.
           Desktop and mobile are intentionally different layouts, not
           the same layout resized.

           DESKTOP (≥961px) — magazine spread.
             • Two-column split: a 5:7 image-to-content ratio so the
               entry text dominates and the image sits as a tall accent.
             • Image is sticky inside its section, so as the reader
               scrolls through multi-paragraph tip lists the image
               stays anchored beside them.
             • Image side alternates per section (--left, --right) for
               editorial rhythm.

           MOBILE (≤960px) — vertical reading stack.
             • Image becomes a short 16:9 banner above the content (not
               a tall portrait — phone screens are already vertical;
               another portrait just doubles the height).
             • Each entry gains a small gold tab marker above its
               eyebrow (matches /outreach's mobile pattern) so the eye
               registers "new ministry begins here" without needing a
               box.
             • Tips stack label-above-value with a vertical hairline
               instead of a side-by-side dl grid — punchier on a phone.
             • Address pills get extra padding so they're tap-sized.

           Kids section reuses the global .sunday-school-content +
           .vertical-video-frame pattern (matching the original /visit
           Sunday-School design). */

        .ministry-section {
            margin-bottom: var(--space-3xl);
            scroll-margin-top: 90px;
        }
        .ministry-section:last-child {
            margin-bottom: 0;
        }
        .ministry-section-note {
            color: var(--text-primary-faint);
            font-size: var(--text-small);
            line-height: var(--leading-normal);
            margin: var(--space-xs) 0 0;
            font-style: italic;
            max-width: 60ch;
        }
        .ministry-section-note a {
            color: var(--gold);
            text-decoration: none;
            border-bottom: 1px solid rgba(212, 165, 116, 0.4);
            transition: border-color 0.25s ease;
        }
        .ministry-section-note a:hover {
            border-bottom-color: var(--gold-dark);
        }

        /* ---------- Desktop layout ----------
           Two design fixes vs. the v1.51.1 layout:

           1. Grid columns flip based on .--left / .--right so the IMAGE
              is ALWAYS in the 5fr (smaller) column and the CONTENT is
              always in the 7fr (larger) column. Previously a single
              5fr 7fr grid combined with order: to swap the image
              side meant right-side images landed in the 7fr column and
              rendered ~40% wider than left-side images.

           2. Images STRETCH to row height (align-items: stretch +
              min-height/max-height clamps, no fixed aspect-ratio).
              The placeholder was previously fixed at aspect 4/5 with
              align-items: start, so on entries with short content the
              image kept going below the content end, leaving an awkward
              gap. Stretching ties image height to content height — when
              real photos arrive they'll still look right via
              object-fit: cover. */
        .ministry-section-content {
            display: grid;
            grid-template-columns: 5fr 7fr;
            gap: var(--space-2xl);
            align-items: stretch;
            margin-top: var(--space-xl);
        }
        .ministry-section--right .ministry-section-content {
            grid-template-columns: 7fr 5fr;
        }
        .ministry-section--right .ministry-section-image {
            order: 2;
        }
        .ministry-section--right .ministry-section-entries {
            order: 1;
        }
        .ministry-section-image {
            width: 100%;
            min-height: clamp(320px, 36vw, 460px);
            max-height: 620px;
            border-radius: var(--radius-xl);
            overflow: hidden;
            display: grid;
            place-items: center;
            position: sticky;
            top: 112px;
            align-self: stretch;
        }
        .ministry-section-image > svg {
            width: 12%;
            max-width: 96px;
            min-width: 48px;
            height: auto;
        }
        .ministry-section-entries {
            display: flex;
            flex-direction: column;
            gap: var(--space-2xl);
        }

        /* ---------- Multi-entry pairs (Discipleship) ----------
           Same per-pair logic: each pair flips grid columns based on
           the alternating side so the image is always in the smaller
           column, and the image stretches to match content height. */
        .ministry-section-pairs {
            display: flex;
            flex-direction: column;
            gap: var(--space-3xl);
            margin-top: var(--space-xl);
        }
        .ministry-entry-pair {
            display: grid;
            grid-template-columns: 5fr 7fr;
            gap: var(--space-2xl);
            align-items: stretch;
        }
        .ministry-entry-pair--right {
            grid-template-columns: 7fr 5fr;
        }
        .ministry-entry-pair--right .ministry-entry-image {
            order: 2;
        }
        .ministry-entry-pair--right .ministry-entry-content {
            order: 1;
        }
        .ministry-entry-image {
            width: 100%;
            min-height: clamp(320px, 36vw, 460px);
            max-height: 620px;
            border-radius: var(--radius-xl);
            overflow: hidden;
            display: grid;
            place-items: center;
            align-self: stretch;
        }
        .ministry-entry-image > svg {
            width: 12%;
            max-width: 96px;
            min-width: 48px;
            height: auto;
        }
        .ministry-entry-content {
            display: flex;
            flex-direction: column;
            gap: var(--space-xs);
        }

        /* Individual entry block — matches /outreach's .ministry-block
           weight (clean text, no surrounding box), with an extra
           .ministry-tips dl below the description. */
        .ministry-tips {
            margin: var(--space-xs) 0 0;
            display: grid;
            gap: var(--space-xs);
            padding: var(--space-md) 0;
            border-top: 1px solid var(--text-primary-hairline);
            border-bottom: 1px solid var(--text-primary-hairline);
        }
        .ministry-tips > div {
            display: grid;
            grid-template-columns: clamp(110px, 12vw, 150px) 1fr;
            gap: var(--space-sm);
            align-items: baseline;
        }
        .ministry-tips dt {
            font-family: var(--font-display);
            font-size: var(--text-eyebrow);
            font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wide);
            text-transform: uppercase;
            color: var(--gold-dark);
            margin: 0;
        }
        .ministry-tips dd {
            margin: 0;
            color: var(--text-primary-muted);
            font-size: var(--text-small);
            line-height: var(--leading-normal);
        }

        /* Inline address-pill trigger inside .ministry-title — opens the
           Apple/Google/Copy dropdown. Visually matches a subtle gold
           dashed underline so it reads as interactive inside the title. */
        .ministry-address-trigger {
            background: transparent;
            border: none;
            padding: 0;
            margin: 0;
            font: inherit;
            color: var(--gold-dark);
            cursor: pointer;
            border-bottom: 1px dashed rgba(184, 130, 70, 0.45);
            line-height: inherit;
            transition: color 0.25s ease, border-color 0.25s ease;
        }
        .ministry-address-trigger:hover {
            color: var(--gold);
            border-bottom-color: var(--gold);
        }
        .ministry-address-link {
            color: var(--gold-dark);
            text-decoration: none;
            border-bottom: 1px dashed rgba(184, 130, 70, 0.45);
            transition: color 0.25s ease, border-color 0.25s ease;
        }
        .ministry-address-link:hover {
            color: var(--gold);
            border-bottom-color: var(--gold);
        }
        .ministry-title .address-dropdown-wrapper {
            position: relative;
            display: inline-block;
            white-space: nowrap;
        }
        .ministry-title .address-dropdown {
            top: calc(100% + 8px);
        }

        /* Kids section extras — the global .sunday-school-content layout
           expects the section's <h2> to carry the entry name; we add an
           in-content eyebrow + title so this section can share the same
           per-entry structure as the rest.

           The default layout (originally designed for /visit's Sunday
           School block) sized the video at 280px / max-height 440px,
           which felt orphaned on /ministries next to a longer tip list.
           Bump video column to 360px / max-height 560px so it carries
           visual weight comparable to the text column. Also widen the
           overall content max-width and shift align-items so the video
           hugs the top of the row rather than floating in the middle. */
        .ministry-section--kids .sunday-school-content {
            grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
            max-width: 1040px;
            align-items: start;
            column-gap: var(--space-2xl);
        }
        .ministry-section--kids .sunday-school-video.vertical-video-frame {
            max-height: 560px;
        }
        .ministry-section--kids .sunday-school-text > .ministry-eyebrow {
            margin-bottom: -4px;
        }
        .ministry-section--kids .sunday-school-text > .ministry-title {
            margin: 0 0 6px;
        }
        .ministry-section--kids .sunday-school-text > .ministry-tips {
            border-top: 1px solid var(--text-primary-hairline);
            border-bottom: 1px solid var(--text-primary-hairline);
        }

        /* ---------- Mobile layout (different design, not just scaled) ---------- */
        @media (max-width: 960px) {
            /* The .ministry-section--kids overrides above are 2-class
               selectors which beat the global single-class
               .sunday-school-content mobile rule from home-styles.ts.
               Re-state the collapse here at matching specificity so
               the Kids section actually stacks on mobile instead of
               trying to render a 360px video column next to a tiny
               text column. */
            .ministry-section--kids .sunday-school-content {
                grid-template-columns: 1fr;
                max-width: none;
                column-gap: 0;
                row-gap: var(--space-lg);
                align-items: stretch;
                justify-items: center;
            }
            .ministry-section--kids .sunday-school-video.vertical-video-frame {
                max-width: 240px;
                max-height: 426px;
            }
            .ministry-section {
                margin-bottom: var(--space-3xl);
                scroll-margin-top: 75px;
            }
            .ministry-section-content {
                grid-template-columns: 1fr;
                gap: var(--space-lg);
                margin-top: var(--space-md);
            }
            /* On mobile, always image-on-top regardless of desktop alternation.
               The desktop rules use a 2-class selector (.ministry-section--right
               .ministry-section-content) so the mobile override has to match
               specificity to win, hence the explicit --right rule. */
            .ministry-section--right .ministry-section-content {
                grid-template-columns: 1fr;
            }
            .ministry-section--right .ministry-section-image,
            .ministry-section--right .ministry-section-entries {
                order: 0;
            }
            .ministry-section-image {
                /* Drop the desktop stretch behavior; on mobile the image is
                   a fixed 16:9 banner above the content. */
                min-height: 0;
                max-height: none;
                aspect-ratio: 16 / 9;
                position: static;
                top: auto;
                border-radius: var(--radius-lg);
                align-self: auto;
            }
            .ministry-section-entries {
                gap: var(--space-xl);
            }

            /* Multi-entry pairs collapse to single-column on mobile —
               image on top, content below — and the alternating order
               is dropped so every pair reads top-to-bottom. Each pair
               is already visually separated by its own image, so no
               gold tab marker is needed. */
            .ministry-section-pairs {
                gap: var(--space-2xl);
                margin-top: var(--space-md);
            }
            .ministry-entry-pair,
            .ministry-entry-pair--right {
                grid-template-columns: 1fr;
                gap: var(--space-lg);
            }
            .ministry-entry-pair--right .ministry-entry-image,
            .ministry-entry-pair--right .ministry-entry-content {
                order: 0;
            }
            .ministry-entry-image {
                min-height: 0;
                max-height: none;
                aspect-ratio: 16 / 9;
                border-radius: var(--radius-lg);
                align-self: auto;
            }

            /* Gold tab marker above each entry — explicit "new ministry"
               signal in the absence of a 2-column grid that would
               separate them spatially. Same idiom /outreach uses on its
               mobile ministry blocks. */
            .ministry-section-entries > .ministry-block {
                position: relative;
                padding-top: var(--space-md);
            }
            .ministry-section-entries > .ministry-block::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: clamp(48px, 12vw, 72px);
                height: 2px;
                background: linear-gradient(90deg, var(--gold) 0%, var(--gold-dark) 100%);
                border-radius: 1px;
            }
            /* Single-entry sections don't need the marker (the section
               heading already separates it from the previous section). */
            .ministry-section-entries > .ministry-block:only-child::before {
                display: none;
            }

            /* Tips stacked label-above-value, hairline left margin so
               each tip reads as a separate beat instead of merging into
               a paragraph. */
            .ministry-tips {
                gap: var(--space-sm);
                padding: var(--space-sm) 0;
            }
            .ministry-tips > div {
                grid-template-columns: 1fr;
                gap: 2px;
                padding-left: var(--space-xs);
                border-left: 2px solid rgba(212, 165, 116, 0.35);
            }
            .ministry-tips dt {
                font-size: var(--text-eyebrow);
                letter-spacing: var(--tracking-wide);
            }
            .ministry-tips dd {
                font-size: var(--text-small);
                line-height: var(--leading-normal);
            }

            /* Address pills become bigger tap targets on mobile. */
            .ministry-address-trigger,
            .ministry-address-link {
                display: inline-block;
                padding: 2px 4px;
                margin: 0 -4px;
            }
            .ministry-title .address-dropdown-wrapper {
                white-space: normal;
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
                    <p class="section-lead">Worship, discipleship, fellowship, and walking with the next generation — the rhythms that keep us together between Sundays. Anyone is welcome at any of these. Drop in, ask questions, or just come see what it looks like.</p>
                </section>

                ${sectionsHtml}

                <section id="ministries-cta">
                    <span class="section-eyebrow">Questions?</span>
                    <h2 class="section-heading">Want to know more about any of these?</h2>
                    <div class="section-card visit-final-cta">
                        <p class="section-lead">Reach out and we'll point you to the right person — whether it's a Tuesday morning coffee at Caffiena, a Wednesday open gym, or just figuring out what Sunday morning will be like for your family.</p>
                        <a class="event-link-btn teaser-cta" href="/#contact">Contact Us</a>
                    </div>
                </section>
            </main>

            ${footer()}
        </div>
        <script>
            (function() {
                // Address dropdown — same wiring as home, scoped to this page.
                var triggers = document.querySelectorAll('.address-trigger');
                var dropdowns = document.querySelectorAll('.address-dropdown');
                triggers.forEach(function(trigger, index) {
                    trigger.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var dd = dropdowns[index];
                        var isActive = dd.classList.contains('active');
                        dropdowns.forEach(function(d) { d.classList.remove('active'); });
                        if (!isActive) dd.classList.add('active');
                    });
                });
                document.querySelectorAll('.copy-address').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var addr = this.getAttribute('data-address');
                        var span = this.querySelector('span:last-child');
                        var original = span ? span.textContent : '';
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(addr).then(function() {
                                if (span) span.textContent = 'Copied!';
                                setTimeout(function() {
                                    if (span) span.textContent = original;
                                    var d = btn.closest('.address-dropdown');
                                    if (d) d.classList.remove('active');
                                }, 1500);
                            }).catch(function() {});
                        }
                    });
                });
                document.addEventListener('click', function(e) {
                    if (!e.target.closest('.address-dropdown-wrapper')) {
                        dropdowns.forEach(function(d) { d.classList.remove('active'); });
                    }
                });
                document.querySelectorAll('.address-dropdown-item[href]').forEach(function(link) {
                    link.addEventListener('click', function() {
                        setTimeout(function() {
                            dropdowns.forEach(function(d) { d.classList.remove('active'); });
                        }, 300);
                    });
                });
            })();
        </script>
    </body>`
