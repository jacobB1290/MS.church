import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { visitBody } from '../templates/visit-body.js'

const VISIT_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://ms.church/visit#page',
      url: 'https://ms.church/visit',
      name: 'Plan Your Visit · Morning Star Christian Church',
      description:
        'Plan your first Sunday at Morning Star Christian Church in Boise — map and directions, what to expect during the 9 AM service, Sunday School info, and the free breakfast that follows.',
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
      mainEntity: {
        '@type': ['Church', 'PlaceOfWorship'],
        '@id': 'https://ms.church/#church',
        name: 'Morning Star Christian Church',
        url: 'https://ms.church',
        hasMap: 'https://www.google.com/maps?q=3080+Wildwood+St,Boise,ID+83713',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '3080 Wildwood St',
          addressLocality: 'Boise',
          addressRegion: 'ID',
          postalCode: '83713',
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 43.6150,
          longitude: -116.2023,
        },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'Plan Your Visit', item: 'https://ms.church/visit' },
      ],
    },
  ],
})

export function registerVisitRoute(app: Hono) {
  app.get('/visit', (c) => {
    // /visit is essentially static (map embed, service flow, Sunday school).
    c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    return c.html(`<!DOCTYPE html>
<!-- v1.44.0 - Plan Your Visit page -->
<html lang="en">
${pageHead({
  title: 'Plan Your Visit · Morning Star Christian Church, Boise',
  description:
    "Plan your first Sunday at Morning Star Christian Church in Boise — map and directions, what to expect during the 9 AM service, Sunday School info, and the free breakfast that follows.",
  canonical: 'https://ms.church/visit',
  ogImageAlt: 'Plan a visit to Morning Star Christian Church in Boise, Idaho',
  jsonLd: VISIT_JSON_LD,
})}
${visitBody()}
</html>`)
  })
}
