import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { ministriesBody } from '../templates/ministries-body.js'

const MINISTRIES_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://ms.church/ministries#page',
      url: 'https://ms.church/ministries',
      name: 'Ministries · Morning Star Christian Church',
      description:
        "Morning Star's weekly ministries in Boise — Sunday worship, Bible study, Bible reading, Activity Day, Youth service, and Sunday School. How we live out 'Mending the Broken' week to week.",
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'Ministries', item: 'https://ms.church/ministries' },
      ],
    },
  ],
})

export function registerMinistriesRoute(app: Hono) {
  app.get('/ministries', (c) => {
    // /ministries is essentially static (program descriptions, no events feed).
    // Match /about and /beliefs cache headers.
    c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    return c.html(`<!DOCTYPE html>
<!-- v1.51.0 - Ministries hub -->
<html lang="en">
${pageHead({
  title: 'Ministries · Morning Star Christian Church, Boise',
  description:
    "Morning Star's weekly ministries in Boise — Sunday worship, Bible study, Bible reading, Activity Day, Youth service, and Sunday School. How we live out 'Mending the Broken' week to week.",
  canonical: 'https://ms.church/ministries',
  ogImageAlt: 'Morning Star Christian Church ministries in Boise, Idaho',
  jsonLd: MINISTRIES_JSON_LD,
})}
${ministriesBody()}
</html>`)
  })
}
