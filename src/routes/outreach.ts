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
        "Morning Star Christian Church's ministries and community outreach in Boise, Idaho — Sunday School, monthly homeless-shelter cooking, free community breakfast, and seasonal events.",
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
      mainEntity: {
        '@type': 'ItemList',
        name: 'Ministries & Outreach Programs',
        itemListElement: [
          {
            '@type': 'Service',
            position: 1,
            name: 'Sunday School',
            description:
              "Children's Sunday School during the 9:00 AM service — gospel-centered teaching for kids while families worship together.",
            url: 'https://ms.church/outreach#sunday-school',
          },
          {
            '@type': 'Service',
            position: 2,
            name: 'Cooking at the Homeless Shelters',
            description:
              'Once-a-month cooking and serving meals at homeless shelters in Boise.',
            url: 'https://ms.church/outreach#cooking-ministry',
          },
          {
            '@type': 'Service',
            position: 3,
            name: 'Free Community Breakfast',
            description:
              'Free breakfast every Sunday after the morning service, with transportation from select shelters.',
            url: 'https://ms.church/outreach#community-breakfast',
          },
          {
            '@type': 'Service',
            position: 4,
            name: 'Seasonal Outreach & Events',
            description:
              'Year-round community events open to the city — Friendsgiving, holiday outreach, and more.',
            url: 'https://ms.church/outreach#seasonal-outreach',
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
  ],
})

export function registerOutreachRoute(app: Hono) {
  app.get('/outreach', (c) => {
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.42.0 - Outreach hub -->
<html lang="en">
${pageHead({
  title: 'Outreach & Ministries | Morning Star Christian Church, Boise',
  description:
    "Morning Star Christian Church's ministries and outreach in Boise — Sunday School, monthly homeless-shelter cooking, free community breakfast, and seasonal events. Browse upcoming and past events.",
  canonical: 'https://ms.church/outreach',
  ogImageAlt: 'Morning Star Christian Church outreach and ministries in Boise, Idaho',
  jsonLd: OUTREACH_JSON_LD,
})}
${outreachBody()}
${homeScripts()}
</html>`)
  })
}
