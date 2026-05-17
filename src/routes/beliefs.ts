import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { beliefsBody } from '../templates/beliefs-body.js'

const BELIEFS_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://ms.church/beliefs#page',
      url: 'https://ms.church/beliefs',
      name: 'Statement of Beliefs · Morning Star Christian Church',
      description:
        'The complete statement of beliefs of Morning Star Christian Church — eleven core doctrinal convictions on Scripture, the Trinity, the deity and redemptive work of Christ, salvation, the Holy Spirit, resurrection, the unity of believers, evangelism and discipleship, marriage, dedication to prayer and service, and the sanctity of human life.',
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://ms.church/about' },
        { '@type': 'ListItem', position: 3, name: 'Statement of Beliefs', item: 'https://ms.church/beliefs' },
      ],
    },
  ],
})

export function registerBeliefsRoute(app: Hono) {
  app.get('/beliefs', (c) => {
    // Statement of Beliefs effectively never changes; cache aggressively.
    c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.32 - Statement of Beliefs page (11 convictions, adopted from parent church) -->
<html lang="en">
${pageHead({
  title: 'Statement of Beliefs · Morning Star Christian Church, Boise',
  description:
    'The complete statement of beliefs of Morning Star Christian Church in Boise — eleven core doctrinal convictions on Scripture, the Trinity, Christ, salvation, the Holy Spirit, the resurrection, the church, evangelism, marriage, prayer, and the sanctity of life.',
  canonical: 'https://ms.church/beliefs',
  ogImageAlt: 'Statement of Beliefs · Morning Star Christian Church in Boise, Idaho',
  jsonLd: BELIEFS_JSON_LD,
})}
${beliefsBody()}
</html>`)
  })
}
