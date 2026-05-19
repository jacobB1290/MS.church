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
              'Weekly Friday service for high schoolers and older (15 and up) — worship, teaching, and time to actually talk to each other. About an hour, with fellowship after. Fridays at 7:00 PM.',
            url: 'https://ms.church/ministries#youth-service',
            provider: { '@id': 'https://ms.church/#church' },
            audience: {
              '@type': 'PeopleAudience',
              suggestedMinAge: 15,
              audienceType: 'High school youth and young adults',
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
    {
      '@type': 'FAQPage',
      '@id': 'https://ms.church/ministries#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What Bible studies does Morning Star Christian Church offer in Boise?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church offers two weekly Bible study groups in Boise: a Tuesday morning Bible reading at Caffiena State Street coffee shop at 8:30 AM, and a Thursday evening Bible study at the church at 6:00 PM. Both are free, open to all, and gospel-grounded with free coffee.',
          },
        },
        {
          '@type': 'Question',
          name: 'When does the youth group meet at Morning Star?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Friday Youth Service at Morning Star Christian Church meets every Friday at 7:00 PM at 3080 Wildwood Street, Boise. It is for high schoolers and older (ages 15 and up) — about an hour of worship and teaching, with fellowship after.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is Sunday School like at Morning Star Christian Church?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sunday School at Morning Star Christian Church runs during the 9 AM service in a dedicated classroom. Kids from preschool through about 5th grade head to the room after the opening worship songs. Drop-in is welcome any Sunday — no signup, no waiver, no ID required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Morning Star have small groups or community groups?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church operates two weekly small-group-style gatherings: Tuesday morning Bible reading at Caffiena State Street, and Thursday evening Bible study at the church. Both are open-discussion, paced so newcomers and longtime members can engage together.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Wednesday Activity Day at Morning Star really an open gym?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Wednesday Activity Day at Morning Star Christian Church runs 6:00 to 9:00 PM and includes open gym (basketball, volleyball, and other activities) plus a crochet circle for fellowship. All ages and skill levels welcome. No signup or fee.',
          },
        },
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
