# CLAUDE.md — Morning Star Christian Church Website

## Project Overview

This is the official website for **Morning Star Christian Church** in Boise, Idaho (ms.church). It is a monolithic single-page application built with Hono (a lightweight TypeScript web framework) and deployed to Cloudflare Pages as the primary target, with Vercel as a secondary deployment option.

The site serves as a church landing page with sections for the hero/welcome, service schedule, upcoming events (via Google Calendar), and a contact form.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Hono](https://hono.dev/) v4 |
| Language | TypeScript (strict mode) |
| Build tool | Vite + `@hono/vite-build` |
| JSX runtime | Hono's built-in JSX (`hono/jsx`) |
| Primary deployment | Cloudflare Pages |
| Secondary deployment | Vercel |
| Local dev server | Vite dev server with Cloudflare adapter |
| Process manager | PM2 (`ecosystem.config.cjs`) |

---

## Repository Structure

```
MS.church/
├── src/
│   ├── index.tsx        # PRIMARY source — Cloudflare Pages entry point (7800+ lines)
│   ├── index.ts         # Vercel mirror — identical to index.tsx except one import
│   └── renderer.tsx     # Minimal Hono JSX renderer (utility, not used by main routes)
├── api/
│   └── index.ts         # Vercel serverless function adapter
├── public/
│   └── static/
│       ├── style.css            # Minimal external CSS (nearly empty; styles are inlined)
│       ├── church-building.jpg  # Hero section image
│       ├── community-service-1.jpg
│       ├── friendsgiving-flyer.png
│       └── apple-touch-icon.png
├── package.json
├── tsconfig.json
├── vite.config.ts       # Vite + Cloudflare Pages build configuration
├── wrangler.jsonc       # Cloudflare Pages/Workers configuration
├── vercel.json          # Vercel deployment configuration
├── ecosystem.config.cjs # PM2 configuration for local preview
├── README.md            # Changelog (version history)
├── SCROLL_ALGORITHM_DOCUMENTATION.md
├── COMPLETE_SYNC_VERIFICATION.md
└── DEPLOYMENT_VERIFICATION_v1.9.1.md
```

---

## Architecture: Module-per-Route Template Pattern

The website uses Hono to render complete pages server-side as `c.html(...)` responses. All HTML, CSS, and JavaScript are inline template strings — no separate HTML files or external CSS bundles beyond the near-empty `public/static/style.css`.

The code is organized into modules by responsibility:

```
src/
├── index.tsx           # Cloudflare Pages entry (adds cloudflare serveStatic, imports app)
├── index.ts            # Vercel entry (adds node serveStatic, imports app)
├── app.ts              # Shared Hono app — registers all routes
├── config.ts           # Google Calendar configuration
├── routes/
│   ├── calendar.ts     # GET /api/calendar/events (with 5-min server-side cache)
│   ├── home.ts         # GET / (composes head + body + scripts templates)
│   ├── privacy.ts      # GET /privacy
│   └── misc.ts         # GET /robots.txt, /sitemap.xml, GET /form
└── templates/
    ├── home-head.ts    # <head> section (meta tags, schema, analytics, styles)
    ├── home-styles.ts  # ~4500 lines of CSS (imported by home-head.ts)
    ├── home-body.ts    # HTML body sections (nav, hero, schedule, events, watch, contact, footer)
    └── home-scripts.ts # Client-side JavaScript
```

**Editing workflow:** For home page changes, edit the relevant template file. For a new page, create `src/routes/your-page.ts` and register it in `src/app.ts`. Run `npm run sync-check` before committing.

### Routes (defined in `src/routes/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Main landing page (all sections) |
| GET | `/api/calendar/events` | Proxies Google Calendar API |
| GET | `/privacy` | Privacy policy page |
| GET | `/robots.txt` | SEO robots file |
| GET | `/sitemap.xml` | SEO sitemap |
| GET | `/form` | Standalone contact form page |
| Static | `/static/*` | Serves `public/` directory |
| Static | `/favicon.ico` | Serves favicon |

---

## The Two-File Deployment Split

`src/index.tsx` and `src/index.ts` are **nearly identical**. They differ in exactly one import:

**`src/index.tsx` (Cloudflare Pages):**
```typescript
import { serveStatic } from 'hono/cloudflare-workers'
```

**`src/index.ts` (Vercel):**
```typescript
import { serveStatic } from '@hono/node-server/serve-static'
```

**Critical rule: whenever you modify `src/index.tsx`, you MUST apply the same changes to `src/index.ts`**, keeping the Vercel import intact. Failure to sync these files will cause one platform to run outdated code. Run `npm run sync-check` to verify.

---

## Development Workflow

### Install dependencies
```bash
npm install
```

### Local development server
```bash
npm run dev
```
Starts a Vite dev server with the Cloudflare Workers adapter. Hot reload is available. Visit `http://localhost:5173` (or the port shown in the terminal).

### Build
```bash
npm run build
```
Outputs to `./dist/` via `@hono/vite-build` targeting Cloudflare Pages.

### Preview built output locally
```bash
npm run preview
```
Uses `wrangler pages dev` to preview the built `dist/` directory.

### Deploy to Cloudflare Pages
```bash
npm run deploy
```
Runs build then `wrangler pages deploy`.

### Deploy to Vercel
Vercel uses the `vercel-build` script automatically:
```bash
npm run vercel-build   # equivalent to: vite build
```
`vercel.json` rewrites all requests to `/api` (the `api/index.ts` serverless function).

---

## Versioning Convention

The project uses a manual version number tracked in two places:

1. **Comment at top of `src/index.tsx`** (line ~5):
   ```typescript
   // Version: 1.29.17 - Short description of change
   ```

2. **HTML comment inside the `c.html()` template string** (the `<!-- v1.X.X -->` comment in the `<html>` opening comment on the landing page route):
   ```html
   <!-- v1.31.0 - Short description of change -->
   ```

3. **The `version-footer` div** (search for `version-footer` in the file) displays the version on-screen.

**Always update all three when making changes.** The README.md also serves as a detailed changelog — add a new version entry there for significant changes.

---

## Google Calendar Integration

The `/api/calendar/events` endpoint fetches from Google Calendar and transforms events into a normalized format.

### Configuration (in `src/index.tsx`, near the top)
```typescript
const GOOGLE_CALENDAR_CONFIG = {
  API_KEY: 'AIzaSy...',           // Google Cloud API key
  CALENDAR_ID: 'morningstarchurchboise@gmail.com',
  MAX_RESULTS: 50,
  TIME_ZONE: 'America/Boise'
};
```

### Event format returned by API
```json
{
  "id": "gcal-event-id",
  "title": "Event Title",
  "description": "Clean description (CTA stripped)",
  "date": "2026-03-01",
  "displayDate": "MAR 1",
  "image": "https://drive.google.com/uc?export=view&id=...",
  "driveFileLink": "https://drive.google.com/file/d/.../view",
  "location": "3080 Wildwood St, Boise",
  "cta": { "text": "REGISTER NOW", "link": "#contact" }
}
```

### Adding CTA to a calendar event
In the Google Calendar event description, include:
```
[CTA: BUTTON TEXT | #contact]
```
Example: `[CTA: RESERVE YOUR SEAT | https://example.com/register]`

### Adding images to events
Attach a publicly shared Google Drive image file to the calendar event. The API proxy converts the Drive file ID to a direct image URL.

---

## Events Section: Hardcoded Fallback

Events can also be hardcoded directly in the HTML as a JSON script tag. Search for:
```html
<script type="application/json" id="events-data">
```

The event schema:
```json
{
  "id": "event-unique-id",
  "title": "Event Title",
  "description": "Short description",
  "date": "2026-02-15",
  "displayDate": "FEB 15",
  "image": "https://your-image-url.com/flyer.jpg",
  "cta": { "text": "REGISTER NOW", "link": "#contact" }
}
```

The JavaScript function `initializeEvents()` automatically:
- Categorizes events as upcoming or past based on current date
- Shows upcoming events in the main carousel
- Moves past events to a modal overlay ("View Past Events")
- Adjusts dot navigation and layout based on event count

---

## Page Sections

The main landing page (`/`) contains these sections in order:

1. **Navigation** — Fixed header with logo and anchor links
2. **Hero** — Church tagline ("Mending the Broken"), church image, "Find Us" frosted glass button with address dropdown (Apple Maps / Google Maps / Copy)
3. **Schedule** — Sunday service time and location info
4. **Outreach / Events** — Horizontal carousel of upcoming events (fetched from Google Calendar or hardcoded JSON); "Stay Tuned" card when no upcoming events; past events accessible via modal
5. **Contact** — Embedded Jotform iframe
6. **Footer** — Links, social media, version number

---

## Design System

All styles are inlined in the `<style>` block inside the template string. Key design tokens:

| Token | Value | Usage |
|-------|-------|-------|
| Primary dark | `#1a1a2e` | Text, nav background |
| Gold accent | `#d4a574` / `#c89860` | Buttons, highlights |
| Background | `#f8f9fd` | Page background |
| Font (headings) | `Playfair Display` | Serif, via Google Fonts |
| Font (body) | `Inter` | Sans-serif, via Google Fonts |

Responsive breakpoints: mobile ≤960px, desktop >960px (approximate).

---

## Analytics

Vercel Analytics and Speed Insights are loaded conditionally in the client via dynamic `<script>` injection. To disable tracking for development/testing, append `?notrack=true` to any page URL.

---

## Deployment Targets

### Cloudflare Pages (primary)
- Config: `wrangler.jsonc`
- Entry: `src/index.tsx`
- Build output: `dist/`
- Compatibility flags: `nodejs_compat`

### Vercel (secondary)
- Config: `vercel.json`
- Serverless function: `api/index.ts` (uses `@hono/node-server/vercel` adapter)
- All routes rewritten to `/api`
- Entry: `src/index.ts` (mirrors `src/index.tsx`)

---

## Key Conventions for AI Assistants

1. **For home page changes**, edit the relevant file in `src/templates/` or `src/routes/home.ts`. For new pages, create `src/routes/your-page.ts` and register it in `src/app.ts`.

2. **`src/index.tsx` and `src/index.ts` must stay in sync** (only their `serveStatic` import differs). Run `npm run sync-check` before committing any changes to these files.

3. **Bump the version number** in the comment at line 1 of both `src/index.tsx` and `src/index.ts`, and in the HTML comment inside `src/routes/home.ts`.

4. **Do not add external dependencies lightly.** The current architecture is intentionally lightweight: no React, no component library, no state management. Consider whether an inline implementation is sufficient before adding a package.

5. **All HTML, CSS, and JavaScript is inline** (in template strings). For the home page, CSS lives in `src/templates/home-styles.ts` and client JS in `src/templates/home-scripts.ts`.

6. **`public/static/style.css` is effectively empty** (contains only a placeholder `h1` rule). Do not rely on it for substantial styling — all styles live in the inlined `<style>` block.

7. **SEO metadata is extensive.** The `<head>` section (`src/templates/home-head.ts`) includes Schema.org JSON-LD, Open Graph, Twitter Card, geo tags, and canonical URL. Preserve and update these when changing page content.

8. **No test suite exists.** There are no automated tests. Validate changes visually by running `npm run dev`.

9. **The README.md is a changelog**, not typical documentation. Add a new version entry there for any significant changes.

10. **Church details** — address is 3080 Wildwood St (also written as "3080 N Wildwood St"), Boise, ID 83713. Email: `morningstarchurchboise@gmail.com`. Sunday service at 9:00 AM (10:00 AM per Schema.org — verify with church before changing).

11. **Calendar events** are fetched server-side in `src/routes/calendar.ts` with a 5-minute in-memory cache. The client calls `/api/calendar/events` — it does NOT call Google Calendar directly anymore. Update image URL handling in `calendar.ts` if the lh3.googleusercontent.com format changes.
