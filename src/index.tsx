// Version: 1.49.21 - Refine the /visit handshake animation away from "cheap bounce." The v1.49.20 9-keyframe damped oscillation read as cartoon "boing" because real handshakes are NOT continuous oscillation — they are 2-3 firm pumps then COMPLETE STILLNESS. New animation: handshake-gesture is a 10s cycle where the first 10% (~1s) plays three firm decreasing-amplitude pumps (-7 → +4 → -5 → +2 → -3 → 0 px) and the remaining 90% (~9s) is total stillness. Each pump has cubic-bezier(0.32, 0.5, 0.45, 0.92) ease-out timing — sharp downstroke with soft landing — giving the pumps weight without bouncy decay. The long stillness is half the refinement: most of the time the illustration just IS, the way a real handshake mostly is two people standing still after the gesture. Entry animation unchanged (1.4s scale + Y drop + opacity fade-in).
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
