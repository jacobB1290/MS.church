import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { outreachBody } from '../templates/outreach-body.js'
import { homeScripts } from '../templates/home-scripts.js'

// /outreach uses homeScripts() because the calendar carousel + past-events
// modal logic still lives there. The home-scripts code gracefully no-ops
// any feature whose DOM elements aren't present on the page, so loading it
// here only activates the carousel — the home-page-specific bits (hero
// blur, countdown, YouTube iframe) early-return on the outreach page.

const OUTREACH_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://ms.church/outreach#page',
      url: 'https://ms.church/outreach',
      name: 'Outreach & Ministries at Morning Star Christian Church',
      description:
        "Morning Star Christian Church's community outreach in Boise, Idaho — monthly homeless-shelter cooking, free community breakfast, and seasonal events.",
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
      mainEntity: {
        '@type': 'ItemList',
        name: 'Outreach Programs',
        itemListElement: [
          {
            '@type': 'Service',
            position: 1,
            name: 'Cooking at the Homeless Shelters',
            description:
              'Once-a-month cooking and serving meals at homeless shelters in Boise.',
            url: 'https://ms.church/outreach#cooking-ministry',
          },
          {
            '@type': 'Service',
            position: 2,
            name: 'Free Community Breakfast',
            description:
              'Free breakfast every Sunday after the morning service, with transportation from select shelters.',
            url: 'https://ms.church/outreach#community-breakfast',
          },
          {
            '@type': 'Service',
            position: 3,
            name: 'Seasonal & Community Events',
            description:
              'Year-round open-door gatherings — Friendsgiving in the fall, community events around major holidays, and city-wide outreach throughout the year.',
            url: 'https://ms.church/outreach#events',
          },
        ],
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'Outreach', item: 'https://ms.church/outreach' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://ms.church/outreach#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Where can I find a free community breakfast in Boise on Sunday?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church serves a free community breakfast every Sunday after the 9:00 AM service at 3080 Wildwood Street, Boise, Idaho. The breakfast is open to everyone — members, visitors, and neighbors — with no charge, no donation expected, and no signup required.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does Morning Star Christian Church serve the Boise homeless community?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church serves the Boise homeless community through a monthly cooking ministry at local shelters, a free Sunday community breakfast open to everyone, and transportation from select shelters to the Sunday service.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the cooking ministry at Morning Star?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The cooking ministry at Morning Star Christian Church is a team of volunteers that prepares and serves meals at Boise homeless shelters once a month, and prepares the weekly free Sunday community breakfast for anyone who attends or stops by the church.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Morning Star Christian Church offer transportation to Sunday service?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Morning Star Christian Church provides free transportation from select homeless shelters in Boise to and from the Sunday morning service at 3080 Wildwood Street.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can I volunteer with Morning Star Christian Church outreach?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Volunteer opportunities at Morning Star Christian Church include the cooking ministry, Sunday breakfast preparation, seasonal community events, and shelter transportation. Reach out through our contact form at ms.church/form or speak to a greeter on a Sunday.',
          },
        },
      ],
    },
  ],
})

export function registerOutreachRoute(app: Hono) {
  app.get('/outreach', (c) => {
    // Browser revalidates every load so newly published events show on the next
    // refresh (never a stale browser copy needing a hard reload); the edge keeps
    // a tight cache + SWR.
    c.header('Cache-Control', 'public, max-age=0, must-revalidate')
    c.header('CDN-Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.42.1 - Outreach hub (refined design system) -->
<html lang="en">
${pageHead({
  title: 'Outreach & Ministries | Morning Star Christian Church, Boise',
  description:
    "Morning Star Christian Church's community outreach in Boise — monthly homeless-shelter cooking, free community breakfast, and seasonal events. Browse upcoming and past events.",
  canonical: 'https://ms.church/outreach',
  ogImageAlt: 'Morning Star Christian Church outreach and ministries in Boise, Idaho',
  jsonLd: OUTREACH_JSON_LD,
})}
${outreachBody()}
${homeScripts()}
</html>`)
  })
}
