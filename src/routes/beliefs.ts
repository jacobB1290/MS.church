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
    {
      '@type': 'FAQPage',
      '@id': 'https://ms.church/beliefs#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a nondenominational Christian church?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A nondenominational Christian church is a Christian church that operates independently of established denominational hierarchies such as Baptist, Catholic, Presbyterian, Lutheran, or Methodist organizations. Nondenominational churches teach directly from the Bible, are led by local elders and pastors, and emphasize the core foundations of Christian faith shared across all evangelical traditions.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Morning Star Christian Church nondenominational?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Morning Star Christian Church is a nondenominational Christian church in Boise, Idaho. We are not affiliated with any one denomination — Baptist, Methodist, Presbyterian, or otherwise — and base our teaching directly on the Bible while affirming the historic foundations of Christian faith shared across evangelical traditions.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does Morning Star Christian Church believe about the Bible?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church believes the Bible is the inspired, authoritative Word of God — the final rule for faith and practice. We teach the whole counsel of Scripture clearly and faithfully, with both grace and truth, and we do not water down what Scripture says to make it more comfortable.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does Morning Star Christian Church believe about salvation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Morning Star Christian Church believes salvation is by grace alone, through faith alone, in Jesus Christ alone. Salvation is a gift from God, not earned by works or merit. Every person who confesses Jesus as Lord and believes in their heart that God raised Him from the dead is saved.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is a nondenominational church different from Baptist, Methodist, or Catholic churches?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nondenominational churches like Morning Star Christian Church operate independently of any denominational governing body. Where Baptist, Methodist, Presbyterian, and Catholic churches are accountable to denominational structures and creeds, nondenominational churches are governed locally by their own elders and pastors and base teaching directly on the Bible. The core Christian faith shared across all traditions — Trinity, Christ, salvation by grace — remains the same.',
          },
        },
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
