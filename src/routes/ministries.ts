import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { ministriesBody } from '../templates/ministries-body.js'

const MINISTRIES_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://ms.church/ministries#page',
      url: 'https://ms.church/ministries',
      name: 'Ministries · Morning Star Christian Church',
      description:
        "Morning Star's weekly ministries in Boise — Sunday worship, Bible study, Bible reading, Activity Day, Youth service, and Sunday School. How we live out 'Mending the Broken' week to week.",
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
      mainEntity: {
        '@type': 'ItemList',
        name: 'Weekly Ministries at Morning Star Christian Church',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: 6,
        itemListElement: [
          {
            '@type': 'Service',
            position: 1,
            name: 'Sunday Gatherings (Worship)',
            description:
              'Weekly Sunday worship at 9:00 AM at 3080 Wildwood St, Boise. About an hour: welcome, two opening songs, teaching, closing prayer, followed by a free community breakfast.',
            url: 'https://ms.church/ministries#worship',
            provider: { '@id': 'https://ms.church/#church' },
            audience: { '@type': 'Audience', audienceType: 'General public — all welcome' },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'Service',
            position: 2,
            name: 'Sunday School (Kids)',
            description:
              "Children's Sunday School during the 9 AM service — Bible-storyline lesson at their level. Preschool through about 5th grade. Drop-in welcome any Sunday — no signup, no waiver, no ID required.",
            url: 'https://ms.church/ministries#sunday-school',
            provider: { '@id': 'https://ms.church/#church' },
            audience: {
              '@type': 'PeopleAudience',
              suggestedMinAge: 4,
              suggestedMaxAge: 11,
              audienceType: 'Preschool through 5th grade',
            },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'Service',
            position: 3,
            name: 'Tuesday Bible Reading (Discipleship)',
            description:
              'Morning Bible reading at Caffiena State Street coffee shop in Boise. Casual, no curriculum — read a passage, talk about it, drink coffee. Tuesdays at 8:30 AM.',
            url: 'https://ms.church/ministries#bible-reading',
            provider: { '@id': 'https://ms.church/#church' },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'Service',
            position: 4,
            name: 'Thursday Bible Study (Discipleship)',
            description:
              '45-minute evening Bible study at the church with free coffee. Open discussion, gospel-grounded, paced so newcomers and longtime members can both engage. Thursdays at 6:00 PM.',
            url: 'https://ms.church/ministries#bible-study',
            provider: { '@id': 'https://ms.church/#church' },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'Service',
            position: 5,
            name: 'Activity Day (Fellowship)',
            description:
              'Wednesday evening open gym (basketball and volleyball) and a crochet circle. About three hours, all ages welcome. Wednesdays at 6:00 PM.',
            url: 'https://ms.church/ministries#activity-day',
            provider: { '@id': 'https://ms.church/#church' },
            audience: { '@type': 'Audience', audienceType: 'All ages' },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'Service',
            position: 6,
            name: 'Youth Service (Youth)',
            description:
              'Weekly Friday service for high-school students 15 and up — worship, teaching, and time to talk to each other. About an hour. Leaders are present every week and parents are welcome to drop off, stay, or pick up early. Fridays at 7:00 PM.',
            url: 'https://ms.church/ministries#youth-service',
            provider: { '@id': 'https://ms.church/#church' },
            audience: {
              '@type': 'PeopleAudience',
              suggestedMinAge: 15,
              audienceType: 'High school students',
            },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
        ],
      },
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
