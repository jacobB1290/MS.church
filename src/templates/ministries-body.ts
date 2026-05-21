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
        <span class="address-dropdown-icon">📋</span><span>Copy</span>
      </button>
    </span>
  </span>
`

// Caffeina address pill — same UX as the church pill so the Discipleship
// section's two addresses ("Caffeina State Street" / "the church") behave
// identically: tap to open Apple Maps, Google Maps, or copy the name. Before
// this, Caffeina was a plain anchor that jumped straight to Google Maps
// while the church was a dropdown — two visually identical gold-underlined
// addresses with different behaviors.
const caffeinaPill = (label = 'Caffeina State Street'): string => `
  <span class="address-dropdown-wrapper">
    <button type="button" class="address-trigger ministry-address-trigger" data-address="Caffeina State Street, Boise, Idaho">${label}</button>
    <span class="address-dropdown">
      <a href="https://maps.apple.com/?q=Caffeina%20State%20Street%2C%20Boise%2C%20Idaho" target="_blank" rel="noopener" class="address-dropdown-item">
        <span class="address-dropdown-icon">🍎</span><span>Apple Maps</span>
      </a>
      <a href="https://maps.app.goo.gl/XkJR5aLy36VVD3356?g_st=ic" target="_blank" rel="noopener" class="address-dropdown-item">
        <span class="address-dropdown-icon">🗺️</span><span>Google Maps</span>
      </a>
      <button type="button" class="address-dropdown-item copy-address" data-address="Caffeina State Street, Boise, Idaho">
        <span class="address-dropdown-icon">📋</span><span>Copy</span>
      </button>
    </span>
  </span>
`

type Tip = { label: string; value: string }
type Entry = {
  id: string
  eyebrow: string
  /** Day + time + location, rendered as <h3>. Pass HTML so address pills work. */
  titleHtml: string
  description: string
  /** Utility info tips. Used when the ministry has scannable logistics
   *  (Worship's first-visit details, Kids' drop-off info, Activity Day's
   *  what-to-bring). When the section reads better as prose, leave this
   *  empty and put the equivalent info into `description` (Bible Reading,
   *  Bible Study, Youth Service take that path — five tip-tables in a row
   *  flattens the editorial voice). */
  tips: Tip[]
  /** Optional contextual CTA — a link that takes the reader to a DIFFERENT
   *  page that meaningfully extends the section (Worship → /visit, Youth
   *  → /about). Skipped for entries whose only CTA target was the closing
   *  Contact card — repeating "Ask about X → /#contact" five times under
   *  five ministries became visual noise. The page's single closing CTA
   *  carries that load. */
  ctaLabel?: string
  ctaHref?: string
  /** Optional secondary action — same .ministry-link styling, rendered on a
   *  second line below the primary CTA. Use for entries that benefit from a
   *  second context-shift link (e.g. Youth → "Read about our church" for
   *  parents/visitors who want the theology context before reaching out). */
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  /** Optional image for multi-entry sections (renderEntryPair). Path to a JPG;
   *  AVIF + WebP siblings are auto-derived. Without this, the entry renders
   *  with the placeholder SVG. */
  imageSrc?: string
  imageAlt?: string
  /** object-position values applied to the entry-pair image. */
  imagePosition?: string
  imagePositionDesktop?: string
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
  /** Real photo for the section image. When unset, falls back to the
      grey/dashed placeholder block. Path is relative to /static. */
  imageSrc?: string
  /** Optional desktop-only override (≥961px). When set, the renderer
      emits a <picture> with a media-source so desktop loads this image
      instead of imageSrc. Useful when the desktop container is a tall
      portrait crop and the mobile banner deserves a different framing /
      aspect ratio entirely. */
  imageSrcDesktop?: string
  imageAlt?: string
  /** CSS object-position for the image when cropped (defaults to center).
      Used to bias the crop on portrait containers — e.g. 'center 30%'
      shows more of the upper portion of a wide photo. */
  imagePosition?: string
  /** Optional desktop-only object-position override. Pairs with
      imageSrcDesktop when the desktop image's natural framing needs a
      different focal bias than the mobile image. */
  imagePositionDesktop?: string
  /** When set to 'pair', the section image renders as TWO polaroid-style
      tiles inside the same .ministry-section-image footprint instead of a
      single rounded rectangle. Use imageSrc + imageSrc2 for the two photos
      (each with optional alt + position). Combined visual mass matches the
      single-image case. Fellowship uses this — Activity Day's open gym +
      crochet circle are two distinct activities and benefit from two photos
      sitting together. */
  imageLayout?: 'pair'
  imageSrc2?: string
  imageAlt2?: string
  imagePosition2?: string
  entries: Entry[]
}

const SECTIONS: Section[] = [
  {
    id: 'worship',
    eyebrow: 'Worship',
    heading: 'How we gather together on Sundays.',
    imageSide: 'left',
    imageSrc: '/static/worship.jpg',
    // Desktop-only editorial portrait of the pastor teaching from the pulpit
    // (1025×1400, cropped from a 1025×1822 source). Replaces the worship-team
    // landscape on ≥961px where the column container is tall and portrait-
    // shaped; mobile keeps the 16:9 banner of the team. The 1025×1400 crop
    // (0.73 aspect) was chosen because at the project's standard desktop column
    // widths it produces ≤75px of vertical overflow — meaning the cropped
    // composition is preserved nearly intact in the rendered container, not
    // re-cropped aggressively by object-fit.
    // ?v= query is a cache-bust marker — /static is served with
    // Cache-Control: immutable, so the URL itself has to change when the
    // file contents change. Bump this when the cropped image is updated.
    imageSrcDesktop: '/static/worship-desktop.jpg?v=2',
    imageAlt: 'Morning Star Christian Church Sunday worship service in Boise, Idaho. Pastor teaching from the pulpit and the worship team leading songs at our nondenominational 9 AM gathering.',
    // Mobile (16:9 banner): faces of the worship team sit in the upper-middle
    // band; bias upward so heads/microphones are preserved over feet.
    imagePosition: 'center 35%',
    // Desktop (tall portrait container, ≈380–510 × 620 across 1024–1440px
    // viewports). The 1025×1400 source already places the eyes at ~21% and
    // gives ~14% headroom; Y=20% biases the small remaining overflow toward
    // the top so headroom stays consistent (~80px) across desktop widths.
    imagePositionDesktop: 'center 20%',
    entries: [
      {
        id: 'sunday-gatherings',
        eyebrow: 'Sunday Gatherings',
        titleHtml: `Sundays · 9:00 AM at ${churchAddressPill()}`,
        description:
          "Our weekly worship service runs about an hour: a brief welcome, two opening songs, the teaching, and a closing prayer. A free community breakfast follows for everyone who stays. Songs are on the screen, lyrics included, so sing along or just listen. The teaching stays grounded in scripture and runs about 25–30 minutes. New here? Pick any back row and walk in any week. There’s no signup and no expectation that you’ll know what to do.",
        tips: [
          { label: 'What to wear', value: "No strict dress code beyond being modest. Most folks land on the casual side (jeans and a shirt are completely fine), and you will see plenty of people dressed more formally too. Both fit in." },
          { label: 'Where to park', value: 'Parking is right next to the building. You will see the lot as soon as you pull up. Free, no permit needed.' },
          { label: 'At the door', value: 'Greeters meet everyone at the door for Sunday service. Any questions or need a hand finding something? They will help, no pressure.' },
          { label: 'If you arrive late', value: 'Slip in through the back. The back rows are the easiest entry. Nobody turns around.' },
          { label: 'Bringing kids', value: 'Sunday School runs for kids after the opening songs (see Kids below for details). You can also keep them in the service with you; both are welcome.' },
        ],
        ctaLabel: 'Plan Your First Visit',
        ctaHref: '/visit',
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
          "Children’s Sunday School runs in a separate room during the main service, so families can worship together at the start and kids can dive into scripture at their level when it is time. Safe, warm, joyful. Drop-off is welcome any Sunday, and our team is the same set of trusted faces every week so kids know who they are with.",
        tips: [
          { label: 'Ages', value: 'Preschool through about 5th grade. Older kids usually stay in the service with their family.' },
          { label: 'When they leave', value: "Kids head to the classroom after the two opening worship songs. We’ll point you to the room before the service starts." },
          { label: 'Drop-off', value: 'Walk your child to the classroom door. No signup form, no waiver, no ID required.' },
          { label: 'What they do', value: 'Bible storyline lesson + activity at their level. Snacks happen.' },
          { label: 'Pick-up', value: 'Pick up at the classroom right after the closing song. Stay for breakfast either way.' },
        ],
      },
    ],
  },
  {
    id: 'discipleship',
    eyebrow: 'Discipleship',
    heading: 'How we study scripture and grow together.',
    // 'left' so Bible Reading's cafe photo starts on the LEFT and Bible
    // Study auto-alternates to the RIGHT. Pairs with the Kids-flip above to
    // give the page an unbroken LRLRLR rhythm: worship-L, kids-R,
    // bible-reading-L, bible-study-R, fellowship-L, youth-R.
    imageSide: 'left',
    entries: [
      {
        id: 'bible-reading',
        eyebrow: 'Bible Reading',
        titleHtml: `Tuesdays · 8:30 AM at ${caffeinaPill()}`,
        // Tip table preserved (was briefly converted to prose in v1.62.25
        // for editorial variation, but the per-ministry tips serve as an
        // anti-anxiety device — scannable labels answer the specific
        // "what do I wear / bring / do if I'm late" concerns that stop
        // first-timers from showing up. Burying that in prose forces
        // anxious readers to scan whole paragraphs for the answers they
        // came for. Keep the dl format for that scannability everywhere
        // it carries first-visit info).
        description:
          'A morning Bible reading at a coffee shop on State Street. Casual, no curriculum: we read a passage, talk about it, drink coffee, go to work. Drop in any Tuesday.',
        imageSrc: '/static/bible-reading.jpg',
        imageAlt: 'Morning Star Christian Church Tuesday Bible reading at a Boise coffee shop. Open Bibles, coffee mugs, and a small group reading scripture together over coffee.',
        // Source: 1200×1500 portrait. Table + Bibles + mugs sit in the bottom
        // ~30% of the frame (cafe ceiling and interior fill the top two-thirds).
        // Mobile entry-pair image (landscape banner crop) needs to bias DOWN
        // so the table is in the visible window — Y=75% centers the crop on
        // the table-and-bibles zone, matching the user-provided reference.
        imagePosition: 'center 75%',
        // Desktop entry-pair image (near-square container) has more vertical
        // room. Y=55% biases slightly down so the table is dominant while
        // preserving the cafe ceiling lights / wall sign for context.
        imagePositionDesktop: 'center 55%',
        tips: [
          { label: 'Bring', value: 'A Bible, or open the Bible app on your phone. Both fine.' },
          { label: 'What to order', value: 'Whatever you want. The coffee shop is just our meeting spot, not catering for the group.' },
          { label: 'Finding the group', value: 'Look for 4–6 people at a table. Wave at any of us; we will pull up another chair.' },
        ],
      },
      {
        id: 'bible-study',
        eyebrow: 'Bible Study',
        titleHtml: `Thursdays · 6:00 PM at ${churchAddressPill('the church')}`,
        // Tip table preserved for the anti-anxiety scannability reason
        // documented on Bible Reading above. Trimmed from 4 to 3 by
        // dropping the original "Coffee" row — free-coffee-on-the-counter
        // is nice-to-know, not a top first-visit anxiety. The remaining
        // three (Bring / Late / First time) each map directly to a
        // common gate ("do I need to know anything?", "what if I'm
        // late?", "what happens when I walk in alone?") that stops
        // newcomers from showing up.
        description:
          'A 45-minute evening Bible study at the church with free coffee. Open discussion, gospel-grounded, paced so newcomers and longtime members can both engage. Whoever is leading that week opens a passage, asks questions, and we go from there. Honest questions are encouraged. There is no “too basic” or “too hard.”',
        tips: [
          { label: 'Bring', value: 'A Bible if you have one. We keep extras on the back table.' },
          { label: 'If you arrive late', value: 'Walk in and grab a chair. We do not pause the discussion for new arrivals; it just keeps going.' },
          { label: 'First time', value: 'Tell whoever greets you it is your first time and they will get you settled.' },
        ],
      },
    ],
  },
  {
    id: 'fellowship',
    eyebrow: 'Fellowship',
    heading: 'How we spend time together off-Sunday.',
    imageSide: 'left',
    // Two-photo polaroid pair — Activity Day runs open gym + crochet circle
    // simultaneously, so the section image deserves two photos (one per
    // activity) rather than a single representative shot. imageSrc + imageSrc2
    // will be wired to real photos when the church provides them; the
    // placeholder tiles below already render in the correct layout so the
    // photos drop in cleanly.
    imageLayout: 'pair',
    imageAlt: 'Wednesday Activity Day at Morning Star Christian Church in Boise, Idaho. Open gym and crochet circle running side by side.',
    // imageSrc + imageSrc2 left undefined for now → renders the placeholder
    // tiles in the same polaroid layout. Set these when photos arrive:
    //   imageSrc:  '/static/activity-day-gym.jpg',
    //   imageSrc2: '/static/activity-day-crochet.jpg',
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
          { label: 'Drop-in', value: 'Walk in any week. No signup, no fee.' },
        ],
      },
    ],
  },
  {
    id: 'youth',
    eyebrow: 'Youth',
    heading: 'How we walk with the next generation.',
    imageSide: 'right',
    // Single source — the 1320×2347 portrait of 5 girls. Same file
    // serves both viewports: mobile crops it to a 16:9 banner with the
    // faces biased to the upper portion; desktop uses (close to) the
    // full image in the portrait container with a slight upward bias.
    imageSrc: '/static/youth.jpg?v=2',
    imageAlt: 'Morning Star Christian Church youth group. Five teens dressed up arm-in-arm at a Friday Youth Service event in Boise, Idaho, evening backdrop of trees and fencing.',
    // Mobile (16:9 banner from a 9:16 portrait source): tight
    // horizontal band crops aggressively top-and-bottom. Faces sit at
    // source y≈950-1200 (≈45% from top of source). Y=50% centers the
    // crop so faces land in the upper third of the visible window with
    // upper-body / hands-and-bags context below.
    imagePosition: 'center 50%',
    // Desktop (5fr column, ~507×521 on most desktop widths, near
    // square): less aggressive crop. Y=28% keeps faces in the upper
    // third of the visible window and lets the dress detail / handbags
    // read through the middle and lower portion.
    imagePositionDesktop: 'center 55%',
    entries: [
      {
        id: 'youth-service',
        eyebrow: 'Youth Service',
        titleHtml: `Fridays · 7:00 PM at ${churchAddressPill('the church')}`,
        // Tip table preserved for the anti-anxiety scannability reason
        // documented on Bible Reading above. All three rows map to top
        // first-visit anxieties — "am I the right age?", "what do I
        // wear?", "what happens if I walk in alone the first time?".
        // The dress-code beat is intentionally long here because youth
        // dress code is one of the highest-anxiety questions for a
        // first-time teen.
        description:
          'A weekly service for high schoolers and older: worship, teaching, and time to actually talk to each other. About an hour, with fellowship after.',
        tips: [
          { label: 'Ages', value: '15 and up, high school through college age.' },
          { label: 'What to wear', value: 'No strict dress code beyond being modest. Expect a range. Most land somewhere above everyday casual and below full formal, with plenty leaning toward the dressier end of that. Folks who come more dressed up usually bring a change of clothes for fellowship time after.' },
          { label: 'First time', value: 'Walk in, grab a seat. Someone will spot you and pull you in. Worship, a short message, fellowship after.' },
        ],
        // Primary CTA is the contextual /about link (the original
        // "Ask about Youth Service" → /#contact was dropped along with
        // every other redundant ask-about CTA; the closing Contact card
        // carries that load).
        ctaLabel: 'Read about our church',
        ctaHref: '/about',
      },
    ],
  },
]

function renderTips(tips: Tip[]): string {
  // Prose-only entries (Bible Reading, Bible Study, Youth Service) pass an
  // empty tips array — render nothing rather than an empty <dl> shell so
  // the description prose ends the entry cleanly with no orphan rule.
  if (tips.length === 0) return ''
  const rows = tips
    .map((t) => `<div><dt>${t.label}</dt><dd>${t.value}</dd></div>`)
    .join('\n                                ')
  return `<dl class="ministry-tips">
                                ${rows}
                            </dl>`
}

function renderEntryLinks(e: Entry): string {
  // Primary CTA + optional secondary CTA — both styled as .ministry-link
  // (gold arrow link). The secondary sits on its own line below the primary
  // so the visual rhythm reads "primary action, alternate path" rather than
  // two competing peers on one line.
  //
  // Both are optional now: every "Ask about X → /#contact" link was dropped
  // (the page's closing CTA covers that load) so the only entries that emit
  // a primary link are the two with contextual cross-page targets — Worship
  // → /visit and Youth → /about. Entries with no CTA render nothing.
  if (!e.ctaHref || !e.ctaLabel) return ''
  const secondary = e.secondaryCtaHref && e.secondaryCtaLabel
    ? `\n                            <a href="${e.secondaryCtaHref}" class="ministry-link ministry-link--secondary">${e.secondaryCtaLabel} &rarr;</a>`
    : ''
  return `<a href="${e.ctaHref}" class="ministry-link">${e.ctaLabel} &rarr;</a>${secondary}`
}

function renderEntry(e: Entry, showEyebrow = true): string {
  // Eyebrow hidden in single-entry sections — the section-level eyebrow
  // (WORSHIP / KIDS / FELLOWSHIP / YOUTH) already labels the context, so an
  // identically-positioned "SUNDAY GATHERINGS" / "ACTIVITY DAY" / etc. reads
  // as redundant chrome. Multi-entry sections (Discipleship) keep eyebrows
  // because they distinguish two entries under one section.
  const eyebrowHtml = showEyebrow
    ? `<span class="ministry-eyebrow">${e.eyebrow}</span>\n                            `
    : ''
  return `<article class="ministry-block" id="${e.id}">
                            ${eyebrowHtml}<h3 class="ministry-title">${e.titleHtml}</h3>
                            <p class="ministry-text">${e.description}</p>
                            ${renderTips(e.tips)}
                            ${renderEntryLinks(e)}
                        </article>`
}

function renderEntryPair(e: Entry, side: 'left' | 'right'): string {
  let imgBlock: string
  if (!e.imageSrc) {
    imgBlock = `<div class="ministry-entry-image ministries-image-placeholder" aria-hidden="true">
                            ${PLACEHOLDER_SVG}
                        </div>`
  } else {
    const cssVars: string[] = []
    if (e.imagePosition) cssVars.push(`--img-pos: ${e.imagePosition}`)
    if (e.imagePositionDesktop) cssVars.push(`--img-pos-desktop: ${e.imagePositionDesktop}`)
    const styleAttr = cssVars.length ? ` style="${cssVars.join('; ')};"` : ''
    const [path, query] = e.imageSrc.split('?')
    const q = query ? `?${query}` : ''
    const base = path.replace(/\.jpe?g$/i, '')
    imgBlock = `<div class="ministry-entry-image"${styleAttr}>
                            <picture>
                                <source type="image/avif" srcset="${base}.avif${q}">
                                <source type="image/webp" srcset="${base}.webp${q}">
                                <img src="${e.imageSrc}" alt="${e.imageAlt ?? ''}" loading="lazy" decoding="async">
                            </picture>
                        </div>`
  }
  return `<article class="ministry-entry-pair ministry-entry-pair--${side}" id="${e.id}">
                        ${imgBlock}
                        <div class="ministry-entry-content">
                            <span class="ministry-eyebrow">${e.eyebrow}</span>
                            <h3 class="ministry-title">${e.titleHtml}</h3>
                            <p class="ministry-text">${e.description}</p>
                            ${renderTips(e.tips)}
                            ${renderEntryLinks(e)}
                        </div>
                    </article>`
}

function renderSection(s: Section): string {
  // Kids gets the vertical-video pattern (matches the original Sunday-School
  // design that lived on /visit). All other categories use the image-paired
  // editorial layout from /outreach (.ministries-pair).
  if (s.id === 'kids') {
    const entry = s.entries[0]
    // Single-entry section — entry eyebrow ("SUNDAY SCHOOL") is omitted
    // because the section eyebrow ("KIDS") already labels the context.
    return `<section class="ministry-section ministry-section--kids" id="${s.id}">
                    <span class="section-eyebrow">${s.eyebrow}</span>
                    <h2 class="section-heading">${s.heading}</h2>
                    <div class="sunday-school-content">
                        <div class="vertical-video-frame sunday-school-video" aria-hidden="true">
                            <div class="vertical-video-placeholder">${VIDEO_PLACEHOLDER_SVG}</div>
                        </div>
                        <div class="sunday-school-text">
                            <h3 class="ministry-title">${entry.titleHtml}</h3>
                            <p>${entry.description}</p>
                            ${renderTips(entry.tips)}
                            ${renderEntryLinks(entry)}
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

  // Single-entry sections hide the entry-level eyebrow (it duplicates the
  // section eyebrow above). Multi-entry sections keep eyebrows for
  // differentiation — but those flow through renderEntryPair earlier.
  const showEntryEyebrow = s.entries.length > 1
  const entriesHtml = s.entries.map((e) => renderEntry(e, showEntryEyebrow)).join('\n                        ')
  let imgBlock: string

  // ---- Two-photo polaroid pair layout (imageLayout: 'pair') ----
  // Renders two slightly-offset polaroid tiles inside the same
  // .ministry-section-image footprint a single image would occupy. Used by
  // Fellowship to show open gym + crochet circle as a paired set. Each tile
  // gets its own --img-pos via inline CSS var. Placeholder fallback used
  // when one or both images are missing.
  if (s.imageLayout === 'pair') {
    const variants = (src: string) => {
      const [path, query] = src.split('?')
      const q = query ? `?${query}` : ''
      const base = path.replace(/\.jpe?g$/i, '')
      return { avif: `${base}.avif${q}`, webp: `${base}.webp${q}`, jpg: src }
    }
    const renderTile = (src: string | undefined, alt: string | undefined, pos: string | undefined, idx: 1 | 2) => {
      const posStyle = pos ? ` style="--img-pos: ${pos};"` : ''
      if (!src) {
        return `<div class="ministry-pair-tile ministry-pair-tile--${idx} ministry-pair-tile-placeholder" aria-hidden="true">
                                <div class="ministry-pair-tile-inner">${PLACEHOLDER_SVG}</div>
                            </div>`
      }
      const vv = variants(src)
      return `<div class="ministry-pair-tile ministry-pair-tile--${idx}"${posStyle}>
                                <div class="ministry-pair-tile-inner">
                                    <picture>
                                        <source type="image/avif" srcset="${vv.avif}">
                                        <source type="image/webp" srcset="${vv.webp}">
                                        <img src="${vv.jpg}" alt="${alt ?? ''}" loading="lazy" decoding="async">
                                    </picture>
                                </div>
                            </div>`
    }
    imgBlock = `<div class="ministry-section-image ministry-section-image--pair" aria-label="${s.imageAlt ?? ''}">
                            ${renderTile(s.imageSrc, s.imageAlt, s.imagePosition, 1)}
                            ${renderTile(s.imageSrc2, s.imageAlt2, s.imagePosition2, 2)}
                        </div>`
  } else if (!s.imageSrc) {
    imgBlock = `<div class="ministry-section-image ministries-image-placeholder" aria-hidden="true">
                            ${PLACEHOLDER_SVG}
                        </div>`
  } else {
    // Build inline CSS custom properties for object-position. The
    // global rules read --img-pos at all sizes and --img-pos-desktop at
    // ≥961px. Either or both can be set per-section.
    const cssVars: string[] = []
    if (s.imagePosition) cssVars.push(`--img-pos: ${s.imagePosition}`)
    if (s.imagePositionDesktop) cssVars.push(`--img-pos-desktop: ${s.imagePositionDesktop}`)
    const styleAttr = cssVars.length ? ` style="${cssVars.join('; ')};"` : ''
    // Helper: derive AVIF / WebP sibling paths from a JPG src (preserving
    // any cache-bust query string). e.g. "/static/youth.jpg" → AVIF
    // "/static/youth.avif", WebP "/static/youth.webp".
    const variants = (src: string) => {
      const [path, query] = src.split('?')
      const q = query ? `?${query}` : ''
      const base = path.replace(/\.jpe?g$/i, '')
      return { avif: `${base}.avif${q}`, webp: `${base}.webp${q}`, jpg: src }
    }
    const v = variants(s.imageSrc)
    if (s.imageSrcDesktop) {
      // Two-source pattern: desktop ≥961px loads the desktop-only file,
      // mobile/tablet ≤960px loads the default. Each viewport's image
      // is served as AVIF/WebP/JPG via picture-source priority order.
      const vd = variants(s.imageSrcDesktop)
      imgBlock = `<div class="ministry-section-image"${styleAttr}>
                            <picture>
                                <source media="(min-width: 961px)" type="image/avif" srcset="${vd.avif}">
                                <source media="(min-width: 961px)" type="image/webp" srcset="${vd.webp}">
                                <source media="(min-width: 961px)" srcset="${vd.jpg}">
                                <source type="image/avif" srcset="${v.avif}">
                                <source type="image/webp" srcset="${v.webp}">
                                <img src="${v.jpg}" alt="${s.imageAlt ?? ''}" loading="lazy" decoding="async">
                            </picture>
                        </div>`
    } else {
      imgBlock = `<div class="ministry-section-image"${styleAttr}>
                            <picture>
                                <source type="image/avif" srcset="${v.avif}">
                                <source type="image/webp" srcset="${v.webp}">
                                <img src="${v.jpg}" alt="${s.imageAlt ?? ''}" loading="lazy" decoding="async">
                            </picture>
                        </div>`
    }
  }
  return `<section class="ministry-section ministry-section--${s.imageSide}" id="${s.id}">
                    <span class="section-eyebrow">${s.eyebrow}</span>
                    <h2 class="section-heading">${s.heading}</h2>
                    ${noteHtml}
                    <div class="ministry-section-content">
                        ${imgBlock}
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
            /* position: relative establishes a positioning context for
               the absolutely-positioned <img>/<picture> child below.
               Previously this was position: sticky for a stay-visible-
               while-scrolling effect on desktop, but sticky doesn't
               establish a containing block for absolute descendants —
               so the img was being positioned against the viewport.
               With image-height now driven by content height via
               align-self stretch (v1.52.1), sticky was redundant
               anyway. */
            position: relative;
            align-self: stretch;
        }
        /* Placeholder variant centers the SVG via grid. Real images use
           absolute-positioned fill (next ruleset) so they cannot grow
           the container to their intrinsic size. */
        .ministry-section-image.ministries-image-placeholder {
            display: grid;
            place-items: center;
        }
        .ministry-section-image > svg {
            width: 12%;
            max-width: 96px;
            min-width: 48px;
            height: auto;
        }

        /* ---------- Pair-layout (.ministry-section-image--pair) ----------
           Two polaroid-style tiles sitting inside the same container the
           single-image case would occupy. Container is unchanged so the
           combined visual mass of the pair matches the size a single
           ministry-section-image would render at. Borrows the polaroid
           paper-edge + soft shadow language from the home schedule banner
           so the pair reads as same-family imagery, not a one-off pattern.
           Border-radius on the container is removed (lives on each inner
           tile instead) and overflow is visible so the polaroid shadows can
           bleed slightly past the column edge. */
        .ministry-section-image.ministry-section-image--pair {
            background: transparent;
            border-radius: 0;
            overflow: visible;
        }
        .ministry-pair-tile {
            position: absolute;
            /* 54% width × 4:5 aspect produces tiles where each one's edges
               stay clearly visible in the diagonal layout (60% caused the
               back tile to disappear almost entirely behind the front tile).
               Calibrated so the two tiles overlap in a small central zone,
               not stacked-and-hidden. */
            width: 54%;
            aspect-ratio: 4 / 5;
            background: #fefcf6;
            padding: 5px;
            border-radius: 3px;
            box-shadow:
                0 14px 30px var(--text-primary-hairline),
                0 5px 12px var(--text-primary-hairline),
                0 1px 3px var(--text-primary-hairline);
            transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 480ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: transform;
        }
        .ministry-pair-tile--1 {
            /* Front tile, tilted left. Sits in the upper-left quadrant so
               its lower-right corner naturally meets tile 2's upper-left. */
            top: 0;
            left: 0;
            transform: rotate(-3.5deg);
            z-index: 2;
        }
        .ministry-pair-tile--2 {
            /* Back tile, tilted right. Anchored to bottom-right but lifted
               slightly off the edge so its top-left corner is visibly above
               tile 1's bottom edge — the two tiles read as a clear diagonal
               pair, not as one tile with another behind it. */
            bottom: 4%;
            right: 0;
            transform: rotate(3.5deg);
            z-index: 1;
        }
        .ministry-pair-tile:hover {
            transform: rotate(0) scale(1.03);
            z-index: 5;
            box-shadow:
                0 22px 44px var(--text-primary-hairline),
                0 10px 22px var(--text-primary-hairline),
                0 2px 4px var(--text-primary-hairline);
        }
        .ministry-pair-tile-inner {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 2px;
        }
        .ministry-pair-tile picture,
        .ministry-pair-tile img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: var(--img-pos, center);
        }
        /* Placeholder tile — same warm-cream + faint-icon treatment as
           .ministries-image-placeholder so the pair reads as intentional
           paper photos waiting for content, not a draft surface. */
        .ministry-pair-tile.ministry-pair-tile-placeholder .ministry-pair-tile-inner {
            background:
                radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--gold) 8%, transparent) 0%, transparent 60%),
                linear-gradient(180deg, color-mix(in srgb, var(--bg) 96%, var(--gold) 4%) 0%, color-mix(in srgb, var(--bg) 88%, var(--gold) 6%) 100%);
            display: grid;
            place-items: center;
            color: var(--text-primary-fade);
        }
        .ministry-pair-tile-placeholder .ministry-pair-tile-inner svg {
            width: 28%;
            max-width: 64px;
            min-width: 32px;
            opacity: 0.4;
        }
        /* Real images fill the container absolutely so they cannot
           influence its height. Use top/left + width/height (not inset)
           — for replaced elements like <img>, setting all four
           inset values plus width/height creates a constraint conflict
           and the browser falls back to intrinsic dimensions. object-fit
           cover crops to the container's aspect; object-position can be
           biased per-section via --img-pos / --img-pos-desktop CSS
           variables. */
        .ministry-section-image > img,
        .ministry-section-image > picture {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: block;
        }
        /* When the image is wrapped in <picture>, the inner <img>
           also needs to fill its <picture> parent — otherwise it
           renders at its intrinsic dimensions (e.g. 1320×2347 for
           youth.jpg) inside the absolutely-positioned 100×100%
           <picture>, and only the top-left portion is visible
           through the .ministry-section-image's overflow: hidden.
           That was the bug introduced when the renderer switched
           from <img> to <picture> for AVIF/WebP delivery in v1.59.0. */
        .ministry-section-image > picture > img {
            width: 100%;
            height: 100%;
            display: block;
        }
        .ministry-section-image > img,
        .ministry-section-image > picture > img {
            object-fit: cover;
            object-position: var(--img-pos, center);
        }
        /* Desktop-only object-position override. Sections set
           --img-pos / --img-pos-desktop on the .ministry-section-image
           container; --img-pos-desktop wins at ≥961px when defined,
           otherwise --img-pos applies at both viewports. Works the same
           whether the image is a plain <img> or wrapped in <picture>. */
        @media (min-width: 961px) {
            .ministry-section-image > img,
            .ministry-section-image > picture > img {
                object-position: var(--img-pos-desktop, var(--img-pos, center));
            }
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
            align-self: stretch;
            /* position: relative so real-image <picture> children can be
               absolutely positioned to fill the container (same pattern
               as .ministry-section-image). The placeholder variant below
               overrides with grid centering for the SVG. */
            position: relative;
        }
        /* Placeholder variant centers the SVG via grid. Real images use
           absolute-positioned fill (rules below). */
        .ministry-entry-image.ministries-image-placeholder {
            display: grid;
            place-items: center;
        }
        .ministry-entry-image > svg {
            width: 12%;
            max-width: 96px;
            min-width: 48px;
            height: auto;
        }
        /* Real images fill the entry container absolutely — same pattern
           as the section-level images (object-fit cover + object-position
           biased via --img-pos / --img-pos-desktop CSS variables). */
        .ministry-entry-image > img,
        .ministry-entry-image > picture {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: block;
        }
        .ministry-entry-image > picture > img {
            width: 100%;
            height: 100%;
            display: block;
        }
        .ministry-entry-image > img,
        .ministry-entry-image > picture > img {
            object-fit: cover;
            object-position: var(--img-pos, center);
        }
        @media (min-width: 961px) {
            .ministry-entry-image > img,
            .ministry-entry-image > picture > img {
                object-position: var(--img-pos-desktop, var(--img-pos, center));
            }
        }
        .ministry-entry-content {
            display: flex;
            flex-direction: column;
            gap: var(--space-xs);
        }

        /* Individual entry block — matches /outreach's .ministry-block
           weight (clean text, no surrounding box), with an extra
           .ministry-tips dl below the description. */
        /* Tip table — sized for editorial reading, not data-sheet density.
           Labels at --text-label (12px) and values at --text-body (16px) so
           each tip reads at body parity (was 10px/14px which felt cramped
           next to the bordered table chrome). Row gap bumped from --space-xs
           to --space-sm for breathing room — same beat as paragraph spacing
           in the same column above. */
        .ministry-tips {
            margin: var(--space-xs) 0 0;
            display: grid;
            gap: var(--space-sm);
            padding: var(--space-md) 0;
            border-top: 1px solid var(--text-primary-hairline);
            border-bottom: 1px solid var(--text-primary-hairline);
        }
        .ministry-tips > div {
            display: grid;
            grid-template-columns: clamp(120px, 13vw, 160px) 1fr;
            gap: var(--space-sm);
            align-items: baseline;
        }
        .ministry-tips dt {
            font-family: var(--font-display);
            font-size: var(--text-label);
            font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wide);
            text-transform: uppercase;
            color: var(--gold-dark);
            margin: 0;
        }
        .ministry-tips dd {
            margin: 0;
            color: var(--text-primary-muted);
            font-size: var(--text-body);
            line-height: var(--leading-loose);
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
            /* Full-page-width 7fr / 5fr grid matching every other ministry
               section's --right pattern (Bible Study, Youth). Text on the
               LEFT (7fr — the wider editorial column for body + tips), video
               on the RIGHT (5fr — narrower column with the 9:16 video tile
               centered inside). This gives the Kids section the same left-
               and right-page-edge alignment as its neighbors so the
               eye doesn't register a hitch between sections, and crucially
               aligns the body copy's left edge with the section heading's
               left edge above it (the previous max-width: 1040 + auto-
               margin centered the grid inside the page, but left the
               heading at the page edge — a 120px indent disconnect that
               read as accidental misalignment, not deliberate composition).
               max-width / margin overrides defeat the base .sunday-school-
               content rule inherited from home-styles.ts.

               grid-auto-flow: dense backfills empty cells. Without it, the
               grid-column overrides below (video set to col 2, text set
               to col 1) caused the auto-placement cursor to advance past
               row 1 after placing the video, dropping the text into
               (col 1, row 2) and leaving (col 1, row 1) empty — the
               giant gap-below-heading bug. With dense, the algorithm
               goes back to fill (col 1, row 1) with the text, so both
               items sit in the same row as intended. The explicit
               grid-row: 1 on each child below is belt-and-suspenders. */
            grid-template-columns: 7fr 5fr;
            max-width: none;
            margin: 0;
            /* Match the heading→content gap used by .ministry-section-content
               on every other section (Worship, Discipleship, Fellowship,
               Youth). The base .sunday-school-content (from home-styles)
               had no top margin because on /home the heading-content gap
               is driven by the surrounding section padding; on /ministries
               every other section explicitly adds var(--space-xl) to keep
               the per-section vertical rhythm consistent. Without this,
               Kids reads as 20px tighter than its neighbors — a subtle
               but visible rhythm break when scrolling down. */
            margin-top: var(--space-xl);
            /* Video vertically centers within the row instead of hugging
               the top. align-items: start would leave the 9:16 video
               orphaned in the upper-right with ~140px of empty column
               below it (the text+tips column extends past the video's
               max-height). Centering eliminates that visual gap and makes
               the pairing feel anchored. */
            align-items: center;
            column-gap: var(--space-2xl);
            grid-auto-flow: dense;
        }
        .ministry-section--kids .sunday-school-video {
            grid-column: 2;
            grid-row: 1;
        }
        .ministry-section--kids .sunday-school-text {
            grid-column: 1;
            grid-row: 1;
        }
        .ministry-section--kids .sunday-school-video.vertical-video-frame {
            /* The 5fr column is ~520px on a 1280px page — wider than the
               video's natural 9:16 footprint at the chosen 620px max-height
               (~349px wide). Cap max-width at 360 so the video keeps its
               vertical-phone-screen proportion regardless of column width;
               justify-self: center (inherited from the base
               .sunday-school-video.vertical-video-frame rule) horizontally
               centers it inside the 5fr column with ~80px breathing room
               on each side. That centered framing reads as a deliberate
               vertical accent, not a clipped/stretched poster. */
            max-width: 360px;
            max-height: 620px;
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
            /* Reset the desktop grid-column / grid-row overrides so the
               kids stack follows HTML source order on mobile (video first,
               text after). */
            .ministry-section--kids .sunday-school-video,
            .ministry-section--kids .sunday-school-text {
                grid-column: auto;
                grid-row: auto;
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
                   a fixed 16:9 banner above the content. Stay
                   position: relative (not static) so the absolutely-
                   positioned <img> child has a containing block here
                   too — otherwise it would climb up to the viewport. */
                min-height: 0;
                max-height: none;
                aspect-ratio: 16 / 9;
                position: relative;
                top: auto;
                border-radius: var(--radius-lg);
                align-self: auto;
            }
            /* Pair layout on mobile — 16:9 banner doesn't have headroom for
               two 4:5 polaroids stacked diagonally (they'd overlap the row),
               so place them side by side in roughly equal halves. Keep the
               polaroid styling (paper edge + shadow + slight rotation) so
               the design language matches desktop. Aspect bumped to 3:2 so
               the two side-by-side polaroids breathe — combined visual mass
               is still close to the single-image 16:9 banner case. */
            .ministry-section-image.ministry-section-image--pair {
                aspect-ratio: 3 / 2;
                border-radius: 0;
            }
            .ministry-section-image--pair .ministry-pair-tile {
                width: 44%;
                aspect-ratio: 4 / 5;
            }
            .ministry-section-image--pair .ministry-pair-tile--1 {
                top: 5%;
                left: 4%;
                transform: rotate(-3deg);
            }
            .ministry-section-image--pair .ministry-pair-tile--2 {
                top: auto;
                bottom: 5%;
                right: 4%;
                transform: rotate(3deg);
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
                font-size: var(--text-label);
                letter-spacing: var(--tracking-wide);
            }
            .ministry-tips dd {
                font-size: var(--text-body);
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

        /* ============================================================
           EDITORIAL POLISH PASS — v1.62.25
           Treats /ministries as an editorial spread rather than a list
           of identical section cards. Six moves, all additive on top of
           the existing layout:

           1. Intro heading: italicize "Mending the Broken" (no quotes),
              treating it as a stated motto rather than a quoted phrase.
              Pairs with --weight-regular italic in the display family
              so the phrase reads as set-into the sentence.
           2. Intro lead: bump to a true editorial lede — larger, slower,
              more saturated than .section-lead's default body-muted tone.
           3. Jump nav (.ministries-jump): five small-caps anchor chips
              under the intro lede so a 6,900-px page is navigable from
              the top. Editorial AND functional.
           4. Entry "datelines" (.ministry-title in single-entry context):
              demote from a competing h3 to a refined supporting line —
              same family, lighter weight, smaller, italicized. The
              Sundays · 9 AM · address line now reads as the entry's
              context-stamp, not as a second heading stacked under the
              section h2.
           5. Discipleship intra-pair gap: tighten from --space-3xl to
              --space-2xl so Bible Reading + Bible Study read as one
              paired group rather than two unrelated sections.
           6. Final CTA: drop the white .section-card box; let the
              eyebrow + heading + lead + button sit flush on the warm-
              cream page surface like every other section. The closing
              note reads as the page's last paragraph, not an "ad block".
           ============================================================ */

        /* 1. Intro motto + 2. promoted lede + 6. flush closing CTA were
           inlined here in v1.62.25-26; the styles graduated into
           home-styles.ts in v1.62.27 as shared subpage primitives
           (.motto, .subpage-intro-lead, .subpage-final-cta) so every
           subpage (/about, /beliefs, /visit, /outreach) can opt into
           the same editorial treatment without duplicating the rules.
           This file now only carries the /ministries-specific bits:
           jump nav, dateline-styled entry titles, and the intra-
           Discipleship gap tightening. */

        /* 3. Jump nav graduated into the shared .subpage-jump primitive
           in home-styles.ts (v1.62.28) so /about, /beliefs, /visit, and
           /outreach can opt into the same TOC pattern. Per-page styles
           kept here only when they need to override the shared rules.

           4. Entry titles read as DATELINES, not as competing H3s.
           The .ministry-title class is reused on /home (Sunday School)
           and other pages so we scope to .ministry-section / its
           descendants here only. Smaller, lighter, italic — magazine
           "Tuesdays · 8:30 AM at Caffeina" context line. */
        .ministry-section .ministry-title,
        .ministry-section--kids .sunday-school-text > .ministry-title {
            font-family: var(--font-display);
            font-size: var(--text-lead);
            font-weight: var(--weight-semibold);
            font-style: normal;
            line-height: var(--leading-snug);
            letter-spacing: var(--tracking-tight);
            color: var(--text-primary);
            margin: 0 0 var(--space-xs);
        }
        /* The italic-display "·" interpunct + address pill inside the
           dateline both inherit the new size — make sure the pill's
           underline still reads at the smaller scale. */
        .ministry-section .ministry-title .ministry-address-trigger {
            border-bottom-width: 1px;
        }

        /* 5. Discipleship two-entry gap: tighter so the pair reads as
           one group, not as two unrelated sections. Targets the
           .ministry-section--multi container that already wraps
           multi-entry sections (currently only Discipleship). */
        .ministry-section--multi .ministry-section-pairs {
            gap: var(--space-2xl);
        }

        /* Mobile + reduced-motion overrides for the shared subpage
           primitives moved into home-styles.ts in v1.62.27–28. */
    </style>
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main>
                <section id="ministries-intro">
                    <span class="section-eyebrow">Ministries</span>
                    <h1 class="section-heading">How we live out <em class="motto">Mending the Broken</em> week to week.</h1>
                    <p class="subpage-intro-lead">Worship, discipleship, fellowship, and walking with the next generation: the rhythms that keep us together between Sundays. Anyone is welcome at any of these. Drop in, ask questions, or just come see what it looks like.</p>
                    <nav class="subpage-jump" aria-label="Jump to a ministry">
                        <a href="#worship">Worship</a>
                        <a href="#kids">Kids</a>
                        <a href="#discipleship">Discipleship</a>
                        <a href="#fellowship">Fellowship</a>
                        <a href="#youth">Youth</a>
                    </nav>
                </section>

                ${sectionsHtml}

                <section id="ministries-cta" class="subpage-final-cta">
                    <span class="section-eyebrow">Questions?</span>
                    <h2 class="section-heading">Want to know more about any of these?</h2>
                    <p class="subpage-final-cta-lead">Reach out and we’ll point you to the right person, whether it’s a Tuesday morning coffee at Caffeina, a Wednesday open gym, or just figuring out what Sunday morning will be like for your family.</p>
                    <a class="event-link-btn teaser-cta" href="/#contact">Contact Us</a>
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

                // Smooth-scroll for in-page anchor clicks is handled
                // globally by the delegated handler in
                // subpage-header.ts (v1.62.29). No per-page wiring
                // needed here.
            })();
        </script>
    </body>`
