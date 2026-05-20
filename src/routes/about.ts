import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { aboutBody } from '../templates/about-body.js'

const ABOUT_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': 'https://ms.church/about#aboutpage',
      url: 'https://ms.church/about',
      name: 'About Morning Star Christian Church',
      description:
        'Learn about Morning Star Christian Church in Boise, Idaho — our mission, our story, what we believe, and how to plan your first Sunday visit.',
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
      mainEntity: {
        '@type': ['Church', 'PlaceOfWorship'],
        '@id': 'https://ms.church/#church',
        name: 'Morning Star Christian Church',
        description:
          'A welcoming, Bible-believing church in Boise, Idaho. Sunday worship at 9 AM with free community breakfast, Bible study, youth service, and outreach. We confess Jesus Christ as Lord and Savior and teach the whole counsel of Scripture — mending the broken through faith, community, and service.',
        url: 'https://ms.church',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '3080 Wildwood St',
          addressLocality: 'Boise',
          addressRegion: 'ID',
          postalCode: '83713',
          addressCountry: 'US',
        },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://ms.church/about' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://ms.church/about#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What kind of church is Morning Star Christian Church?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church is a nondenominational, Bible-believing Christian church in Boise, Idaho. We confess Jesus Christ as Lord and Savior, teach the whole counsel of Scripture with both grace and truth, and gather Sundays at 9 AM at 3080 Wildwood Street for worship and a free community breakfast.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does "Mending the Broken" mean at Morning Star?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Mending the Broken is the mission of Morning Star Christian Church — a commitment to caring for people the world overlooks: the lonely, the grieving, the new-to-faith, the food-insecure, the marginalized. It shapes everything from the free Sunday breakfast to monthly cooking at homeless shelters to how visitors are greeted at the door.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where is Morning Star Christian Church located in Boise?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church is at 3080 Wildwood Street, Boise, Idaho 83713 — in the Five Mile and Ustick area of West Boise, about a mile east of Eagle Road. There is a free parking lot on site.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can I get involved at Morning Star Christian Church?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The first step is simply attending a Sunday at 9 AM at 3080 Wildwood Street. From there, anyone interested can join a weekly Bible study (Tuesday morning at Caffeina State Street or Thursday evening at the church), volunteer with the cooking ministry, or use the contact form at ms.church/form to ask about other ministries.',
          },
        },
      ],
    },
  ],
})

export function registerAboutRoute(app: Hono) {
  app.get('/about', (c) => {
    // Long CDN cache: /about content is essentially static (mission, beliefs
    // summary, leadership). Stale-while-revalidate keeps it instant under
    // edge while we replace on next deploy.
    c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.36 - About page: longer CDN cache (s-maxage=600/swr=86400) and benefits from shared Speculation Rules prerender -->
<html lang="en">
${pageHead({
  title: 'About Morning Star Christian Church | Boise, Idaho',
  description:
    "Learn about Morning Star Christian Church in Boise, Idaho — our mission, our story, what we believe, and how to plan your first Sunday visit. A welcoming, Bible-believing church mending the broken through faith and community.",
  canonical: 'https://ms.church/about',
  ogImageAlt: 'About Morning Star Christian Church in Boise, Idaho',
  jsonLd: ABOUT_JSON_LD,
})}
${aboutBody()}
</html>`)
  })
}
