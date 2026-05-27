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
        'Plan your first Sunday at Morning Star Christian Church in Boise — map and directions, the 8-step service flow (welcome, worship, teaching, dismissal, breakfast), and the practical first-timer details: what to wear, where to park, who greets you at the door.',
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
    {
      '@type': 'FAQPage',
      '@id': 'https://ms.church/visit#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What can a first-time visitor expect at Morning Star Christian Church?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On your first Sunday at Morning Star Christian Church, expect a warm welcome from greeters at the door, a 60–75 minute worship service starting at 9 AM, and a free community breakfast afterward. There is no signup, no waiver, and no pressure to introduce yourself, donate, or commit to anything. Come exactly as you are.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is a typical Sunday service like at Morning Star?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A typical Sunday service at Morning Star Christian Church follows a simple flow: welcome and opening prayer, two opening worship songs, dismissal of kids to Sunday school, scripture reading, the message, closing worship, and dismissal to the free community breakfast.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there childcare during the Sunday service at Morning Star?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Sunday school runs in a dedicated classroom during the 9 AM service for kids from preschool through about 5th grade. Children head to the room after the opening worship songs. Older kids usually stay in the service with their family. Drop-off is welcome any Sunday — no signup, no ID required.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I get to Morning Star Christian Church?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church is located at 3080 Wildwood Street in West Boise, Idaho 83713 — in the Five Mile and Ustick area, roughly a mile east of Eagle Road and minutes from Maple Grove. The building has a free parking lot on site.',
          },
        },
        {
          '@type': 'Question',
          name: 'What should I wear to Morning Star Christian Church?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'There is no strict dress code at Morning Star Christian Church beyond keeping it modest. Most folks land on the casual side — jeans and a shirt are completely fine — and you will see plenty of people dressed more formally. Both fit in. Come as you are.',
          },
        },
        {
          '@type': 'Question',
          name: 'Will I be asked to give money at Morning Star?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Visitors at Morning Star Christian Church are never asked or expected to give. Members may give voluntarily, but there is no pressure, no plate passed at visitors, and no donation request at the door. The Sunday breakfast is also genuinely free.',
          },
        },
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
    "Plan your first Sunday at Morning Star Christian Church in Boise — map and directions, the 8-step service flow (welcome, worship, teaching, dismissal, breakfast), and the practical first-timer details: what to wear, where to park, who greets you at the door.",
  canonical: 'https://ms.church/visit',
  ogImageAlt: 'Plan a visit to Morning Star Christian Church in Boise, Idaho',
  jsonLd: VISIT_JSON_LD,
})}
${visitBody()}
</html>`)
  })
}
