# Morning Star Christian Church

The official website for [Morning Star Christian Church](https://ms.church) in Boise, Idaho.

Built with [Hono](https://hono.dev/) (TypeScript), deployed to Vercel.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Vite dev server with hot reload (uses `src/index.ts`) |
| `npm run build` | Type-check (`tsc --noEmit`). Vercel handles the actual TS compilation on deploy. |
| `npm run harness` | Playwright-driven visual + perf regression suite (`scripts/harness/run.mjs`) |

## Deployment

Vercel reads `vercel.json` and serves everything through `api/index.ts` → `src/index.ts`. The rewrite rule routes every request (including `/static/*`) into the Hono app, which serves files from `public/static/` via `@hono/node-server/serve-static`.

**To switch back to Cloudflare Pages**, see the comment block at the top of `src/index.ts` — it's a one-line import swap plus restoring `wrangler.jsonc` + deps from git history.

## Layout

```
src/
├── index.ts            # Hono app entry (imported by api/index.ts)
├── app.ts              # Route registration + 404 handler + security headers
├── design-tokens.ts    # Shared design constants
├── routes/             # One file per URL (home, about, ministries, …)
└── templates/          # Reusable head/body/scripts/styles, plus shared/ partials

public/static/          # Self-hosted images, each as .jpg / .webp / .avif
api/index.ts            # Vercel serverless function adapter (3-line shim)
scripts/harness/        # Playwright visual + perf test suite
```

The home page uses a module-per-template pattern (`home-head.ts`, `home-body.ts`, `home-scripts.ts`, `home-styles.ts`). Other routes have their own `*-body.ts` and share the head/styles. See `CLAUDE.md` for the design system and editing conventions.

## Visual regression

```bash
npm run dev                                   # in one terminal
node scripts/harness/run.mjs                  # in another
open scripts/harness/output/report.html       # color-coded grid of pass/fail
```

Must be run after any animation, scroll/anchor, or non-trivial design change. See the "Visual + Performance Harness" section in `CLAUDE.md` for what it covers and how to extend it.

## Versioning

Each meaningful change gets a version number in commit messages (`v1.59.x`). Detailed per-version notes live in `CHANGELOG.md` (gitignored — local only).
