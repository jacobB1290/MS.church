import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

// Vite is dev-only here. Vercel deploys the Hono app via api/index.ts
// (Node serverless function) — no Vite build artifacts are used in prod.
// `npm run build` is a type-check (tsc --noEmit), not a bundle step.

export default defineConfig({
  plugins: [
    devServer({ entry: 'src/index.ts' }),
  ],
})
