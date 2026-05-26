import { handle } from '@hono/node-server/vercel'
import type { IncomingMessage, ServerResponse } from 'node:http'
import app from '../src/index.js'

// The official @hono/node-server/vercel handle() works for GET/HEAD, but on
// Vercel's Node runtime it hangs on requests with a body: the incoming body
// stream is never delivered to Hono's c.req.json(), so the function waits for
// data that never arrives and dies at the 300s timeout (honojs/node-server#306).
//
// Fix: keep the proven adapter for bodyless GET/HEAD (the whole site), and for
// body-carrying methods buffer the body ourselves (or reuse Vercel's pre-parsed
// req.body) and hand app.fetch() a fully-formed Web Request. The custom path
// only runs for POST/PUT/PATCH/DELETE, so the blast radius is contained.
const honoHandle = handle(app)

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') {
    return honoHandle(req, res)
  }

  const host = req.headers.host ?? 'localhost'
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const url = `${proto}://${host}${req.url ?? '/'}`

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    // Drop hop-by-hop / length headers; the buffered body sets its own length.
    if (key === 'content-length' || key === 'transfer-encoding' || key === 'connection') continue
    if (Array.isArray(value)) for (const v of value) headers.append(key, v)
    else if (value != null) headers.set(key, value)
  }

  // Prefer Vercel's pre-parsed body if present; otherwise drain the stream.
  let body: Buffer | undefined
  const preParsed = (req as unknown as { body?: unknown }).body
  if (preParsed !== undefined && preParsed !== null) {
    if (Buffer.isBuffer(preParsed)) body = preParsed
    else if (typeof preParsed === 'string') body = Buffer.from(preParsed)
    else body = Buffer.from(JSON.stringify(preParsed))
  } else {
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    body = Buffer.concat(chunks)
  }

  const request = new Request(url, {
    method,
    headers,
    body: body && body.length > 0 ? new Uint8Array(body) : undefined,
  })

  const response = await app.fetch(request)

  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(Buffer.from(await response.arrayBuffer()))
}
