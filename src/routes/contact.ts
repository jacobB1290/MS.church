import { type Hono } from 'hono'

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

const encoder = new TextEncoder()

// HMAC-SHA256 → lowercase hex, byte-identical to Node's
// crypto.createHmac('sha256', secret).update(body).digest('hex').
async function signHmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function registerContactRoute(app: Hono) {
  app.post('/api/contact', async (c) => {
    const endpoint = getEnv('CRM_FORM_ENDPOINT')
    const secret = getEnv('PUBLIC_FORM_HMAC_SECRET')
    if (!endpoint || !secret) {
      // Misconfiguration (missing env). Don't reveal which value is absent.
      return c.json({ error: 'Contact form is temporarily unavailable.' }, 503)
    }

    const f = await c.req.json<ContactBody>().catch(() => null)
    if (!f) return c.json({ error: 'Bad request' }, 400)

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
      _nonce: crypto.randomUUID(),
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

    const signature = await signHmacHex(secret, body)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-form-signature': signature,
        },
        body,
      })
      if (!res.ok) {
        return c.json({ error: 'Could not submit. Please try again.' }, 502)
      }
      return c.json({ ok: true })
    } catch {
      return c.json({ error: 'Network error. Please try again.' }, 502)
    }
  })
}
