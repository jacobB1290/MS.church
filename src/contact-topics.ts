// Contact topics — the single source of truth for the per-CTA "reason" a
// visitor is reaching out about. A specific CTA on any page (e.g. "Join the
// next cook") links to the contact form with `?topic=<slug>`; the form reads
// the slug, shows a tailored banner + prompt (see home-scripts.ts / the /form
// page), and the submit includes the slug. The /api/contact route resolves the
// slug here (server-side allowlist) and forwards generic primitives to the CRM:
// a suggested interest TAG and an inbox CATEGORY hint, plus the human label.
//
// This file is the ONLY place the topic taxonomy lives. The website owns it;
// the CRM stays generic (it just applies whatever tag + category it is told).
// To add a contact mode: add an entry here and point a CTA at `?topic=<slug>`.
//
// Visible strings (headline / blurb / placeholder) render to the page, so they
// use curly typography per the editorial rule. slug / tag are code values.

// Mirrors the CRM's inbox category vocabulary (ms-management
// src/lib/inbox-segments.ts). 'general' is the default catch-all; the CRM only
// seeds the three managed segments and only for a brand-new contact.
export type InboxCategoryHint = 'prayer' | 'question' | 'outreach' | 'general'

export interface ContactTopic {
  /** Stable id — the URL `?topic=` value, the CRM `form_id`, and consent suffix. */
  slug: string
  /** Short human label. */
  label: string
  /** The "subject line" shown in the form banner. */
  headline: string
  /** Replaces the generic contact lede when this topic is active. */
  blurb: string
  /** Tailored message-box placeholder. */
  placeholder: string
  /** Additive interest tag the CRM applies to the contact (lowercase slug). */
  tag: string
  /** Inbox segment the CRM seeds for a new contact (skipped for 'general'). */
  category: InboxCategoryHint
}

export const CONTACT_TOPICS: Record<string, ContactTopic> = {
  visit: {
    slug: 'visit',
    label: 'Planning a visit',
    headline: 'Planning your first visit',
    blurb: 'Tell us you’re thinking about coming and we’ll help you plan your first Sunday. A real person on our team will write back.',
    placeholder: 'I’m thinking about visiting and wanted to ask…',
    tag: 'visit-planning',
    category: 'question',
  },
  'cooking-ministry': {
    slug: 'cooking-ministry',
    label: 'Cooking ministry',
    headline: 'Joining the next community cook',
    blurb: 'Let us know you’d like to help and we’ll get you on the crew for the next cook. No experience needed, only willing hands.',
    placeholder: 'I’d love to help with the next community cook…',
    tag: 'cooking-ministry',
    category: 'outreach',
  },
  beliefs: {
    slug: 'beliefs',
    label: 'A question about faith',
    headline: 'A question about faith',
    blurb: 'Ask us anything about what we believe. There’s no wrong question, and a real person will write back.',
    placeholder: 'Something I read raised a question…',
    tag: 'beliefs-question',
    category: 'question',
  },
  prayer: {
    slug: 'prayer',
    label: 'Prayer request',
    headline: 'Sharing a prayer request',
    blurb: 'Share what’s on your heart. Our team prays over every request, and we hold them in confidence.',
    placeholder: 'You can share as much or as little as you’d like…',
    tag: 'prayer-request',
    category: 'prayer',
  },
  leadership: {
    slug: 'leadership',
    label: 'A note for our team',
    headline: 'A note for our team',
    blurb: 'Your message goes straight to the same handful of people who lead on Sunday morning.',
    placeholder: 'What’s on your heart?',
    tag: 'leadership',
    category: 'general',
  },
  ministries: {
    slug: 'ministries',
    label: 'A question about a ministry',
    headline: 'A question about our ministries',
    blurb: 'Tell us what you’d like to know and we’ll point you to the right person.',
    placeholder: 'I wanted to ask about…',
    tag: 'ministries-question',
    category: 'question',
  },
}

/** Server-side allowlist resolve: a known topic, or null. Case-insensitive. */
export function resolveContactTopic(
  slug: string | null | undefined,
): ContactTopic | null {
  if (!slug) return null
  const key = String(slug).toLowerCase()
  return Object.prototype.hasOwnProperty.call(CONTACT_TOPICS, key)
    ? CONTACT_TOPICS[key]
    : null
}

/**
 * The client-facing display subset (no CRM mechanics), keyed by slug, ready to
 * embed in a `<script type="application/json">`. `<` is escaped so the JSON can
 * never break out of the script element.
 */
export function contactTopicsClientJson(): string {
  const out: Record<
    string,
    { headline: string; blurb: string; placeholder: string }
  > = {}
  for (const t of Object.values(CONTACT_TOPICS)) {
    out[t.slug] = { headline: t.headline, blurb: t.blurb, placeholder: t.placeholder }
  }
  return JSON.stringify(out).replace(/</g, '\\u003c')
}
