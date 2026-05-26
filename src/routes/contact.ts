import { type Hono } from 'hono'
import { createHmac, randomUUID } from 'node:crypto'

// Public contact form receiver. The browser posts plain JSON here; this
// server-side route signs the exact bytes with PUBLIC_FORM_HMAC_SECRET and
// forwards them to the church CRM's /api/public-form endpoint. The HMAC stays
// server-side so the shared secret is never exposed to the browser.
//
// The CRM verifies an HMAC-SHA256 hex digest of the RAW request body, sent in
// the `x-form-signature` header, and rejects stale (>5 min) or replayed
// (_nonce) submissions. We therefore build the body string once and sign those
// exact bytes. See ms-management src/server/webhooks/verify.ts for the matching
// verification.
//
// Uses Node's crypto (the active deploy target is Vercel's Node runtime). To
// run on Cloudflare Workers instead, swap to Web Crypto (crypto.subtle) — the
// hex digest is byte-identical.

type ContactBody = {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  message?: string
  updatesOptIn?: boolean
  termsAccepted?: boolean
  sourcePage?: string
}

const getEnv = (name: string): string | undefined =>
  typeof process !== 'undefined' ? process.env?.[name] : undefined

// HMAC-SHA256 → lowercase hex.
const signHmacHex = (secret: string, body: string): string =>
  createHmac('sha256', secret).update(body).digest('hex')

// Hard cap on the CRM forward so a slow/unreachable endpoint can never hold the
// serverless function open to its platform timeout.
const CRM_TIMEOUT_MS = 10_000

export function registerContactRoute(app: Hono) {
  app.post('/api/contact', async (c) => {
    const endpoint = getEnv('CRM_FORM_ENDPOINT')
    const secret = getEnv('PUBLIC_FORM_HMAC_SECRET')
    if (!endpoint || !secret) {
      // Misconfiguration (missing env). Don't reveal which value is absent.
      return c.json({ error: 'Contact form is temporarily unavailable.' }, 503)
    }

    console.log('[contact] received submission')
    const f = await c.req.json<ContactBody>().catch(() => null)
    if (!f) return c.json({ error: 'Bad request' }, 400)
    console.log('[contact] body parsed')

    const phone = (f.phone ?? '').trim()
    const email = (f.email ?? '').trim()
    if (!phone && !email) {
      return c.json({ error: 'Add a phone number or email.' }, 400)
    }
    if (!f.termsAccepted) {
      return c.json({ error: 'Please accept the terms.' }, 400)
    }

    const name =
      [f.firstName, f.lastName]
        .map((s) => (s ?? '').trim())
        .filter(Boolean)
        .join(' ') || null
    const message = (f.message ?? '').trim() || null
    const sourcePage = (f.sourcePage ?? '').trim() || null

    // Build the signed body ONCE and sign those exact bytes — the CRM verifies
    // the raw text it receives, so the string we sign must be the string we send.
    const body = JSON.stringify({
      _ts: Date.now(),
      _nonce: randomUUID(),
      form_id: 'contact',
      name,
      phone: phone || null,
      email: email || null,
      consent_method: 'public_form:contact',
      // "Receive updates" checkbox = express marketing consent.
      marketing_opt_in: Boolean(f.updatesOptIn),
      payload: {
        // message is nested here (not top-level) because the CRM schema strips
        // unknown top-level keys but persists the whole payload object verbatim.
        message,
        updates_opt_in: Boolean(f.updatesOptIn),
        terms_accepted: Boolean(f.termsAccepted),
        source_page: sourcePage,
      },
    })

    const signature = signHmacHex(secret, body)
    console.log('[contact] signed, forwarding to CRM')

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-form-signature': signature,
        },
        body,
        signal: AbortSignal.timeout(CRM_TIMEOUT_MS),
      })
      console.log('[contact] CRM responded', res.status)
      if (!res.ok) {
        return c.json({ error: 'Could not submit. Please try again.' }, 502)
      }
      return c.json({ ok: true })
    } catch (err) {
      console.error('[contact] forward failed', err instanceof Error ? err.message : err)
      return c.json({ error: 'Network error. Please try again.' }, 502)
    }
  })
}
