import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { privacyBody } from '../templates/privacy-body.js'

const PRIVACY_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://ms.church/privacy#page',
      url: 'https://ms.church/privacy',
      name: 'Privacy Policy & Terms · Morning Star Christian Church',
      description:
        'Privacy Policy and Terms of Service for Morning Star Christian Church in Boise, Idaho.',
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'Privacy & Terms', item: 'https://ms.church/privacy' },
      ],
    },
  ],
})

export function registerPrivacyRoute(app: Hono) {
  app.get('/privacy', (c) => {
    // Legal text changes rarely; cache like the other static-ish subpages.
    c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    return c.html(`<!DOCTYPE html>
<html lang="en">
${pageHead({
  title: 'Privacy Policy & Terms · Morning Star Christian Church, Boise',
  description:
    'Privacy Policy and Terms of Service for Morning Star Christian Church in Boise, Idaho. Learn how we protect your data when you use our website.',
  canonical: 'https://ms.church/privacy',
  ogImageAlt: 'Privacy Policy & Terms · Morning Star Christian Church in Boise, Idaho',
  jsonLd: PRIVACY_JSON_LD,
})}
${privacyBody()}
</html>`)
  })
}
