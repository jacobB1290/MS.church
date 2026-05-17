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
