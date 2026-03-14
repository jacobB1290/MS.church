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

### Standard Width Rule

**All page sections must inherit their width from the `.page` container.** No section should be wider or narrower than the standard content area defined by `.page`:

- On desktop (>960px): `.page` uses `width: min(1280px, 94%)` with `max-width: 1400px`.
- On tablet (≤899px): `.page` uses `width: 100%` (full viewport).
- On mobile (≤480px): `.page` uses `width: 100%; padding: 0 clamp(3%, 5vw, 5%)`.

**Do NOT use `width: 100vw` or full-bleed techniques** (`margin-left: calc(50% - 50vw)`) on content sections. These break sections out of the `.page` container and make them wider than sibling sections. The only exception is the hero section, which intentionally spans the full viewport.

Every section (schedule, outreach, watch, contact, footer) should use `width: 100%; max-width: 100%` so they fill exactly the `.page` content area — no more, no less. Carousel cards, section-cards, and other content blocks inherit this width naturally.

**Before committing any layout change**, visually verify that the modified section has the same left/right edges as the schedule `.section-card` on both mobile and desktop.

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

---

## Outreach Section — Editing Guide

The outreach section is the most complex part of the page. Mistakes here took many iterations to fix. Follow these rules precisely.

### Where the code lives

| What | File | What to search for |
|------|------|--------------------|
| Card HTML structure | `src/templates/home-scripts.ts` | `renderUpcomingEventCard`, `carousel-past-card` |
| Card CSS | `src/templates/home-styles.ts` | `.event-outer-card`, `.carousel-card`, `.carousel-past-card` |
| Carousel JS logic | `src/templates/home-scripts.ts` | `initCarousel`, `startAutoTick` |
| Memories card HTML | `src/templates/home-scripts.ts` | `carousel-see-past-btn`, `past-card-title` |

### Card structure hierarchy

```
.carousel-card          ← slot in the scroll container; controls edge spacing
  .event-card           ← inner wrapper
    .event-outer-card   ← visible white frosted-glass card (rounded, shadowed)
      .event-card-header ← date (left) + time pill (right), or MEMORIES label
      .event-flyer-wrapper / .carousel-past-card  ← image or memories content
      .event-link-btn   ← gold pill CTA button at the bottom of the card
```

### Width and spacing rules

**NEVER** change the outreach section's width beyond `width: 100%; max-width: 100%`. It must inherit from `.page` like every other section. Violations that were removed and must not return:
- `width: 100vw` on `.outreach` — made the section wider than all siblings
- `margin-left: calc(50% - 50vw)` or any negative-margin full-bleed trick on `.outreach` or `.carousel-wrapper` — caused asymmetric card positioning

**The correct way to give cards edge spacing on mobile** is to add horizontal `padding` to `.carousel-card` in the `@media (max-width: 960px)` block:
```css
@media (max-width: 960px) {
    .carousel-card {
        padding: 0 16px;  /* breathing room from viewport edges */
    }
}
```
At `≤480px`, reduce this to `0 4px` because `.page` already adds its own `clamp(3%, 5vw, 5%)` padding at that breakpoint — stacking both would over-inset the card.

### Mobile carousel: what must never be re-added

These were explicitly removed and must not come back:

1. **Navigation arrows on mobile** — hidden with `display: none !important` in `@media (max-width: 960px)`. The `!important` is required because JS sets `style.display = 'flex'` inline during `render()`. Without it, arrows reappear.

2. **`clip-path: inset(-60px 0px)` (zero horizontal bleed)** — this was replaced with `inset(-60px -16px -60px -16px)` so card box-shadows can fade naturally at the left/right edges rather than being hard-clipped. Do not revert to `0px`.

3. **Adjacent card bleed** — if you increase the horizontal clip beyond `-16px`, or if you accidentally remove the negative margin that keeps adjacent cards a full viewport-width away, the neighbouring card will peek through. The carousel positions cards by `transform: translateX(index * 100%)`, so they are already full-viewport-width apart. The `-16px` bleed is safe.

### CSS typography tokens — use these, not raw px

```
--text-eyebrow: 10px   ← badges, overlines (OUTREACH label, MEMORIES badge)
--text-label:   12px   ← do NOT use for card content or buttons; too small for mobile
--text-small:   14px   ← minimum for button text (event-link-btn uses this)
--text-heading: clamp(20px, 2.5vw, 26px)  ← card sub-headings
```

**Minimum readable sizes for the outreach card on mobile (industry standard):**
- Card section title (`.past-card-title`): **20px**
- Card body text (`.past-card-description`, `.past-card-text`): **16px** — this is the iOS/Android minimum to avoid browser auto-zoom
- Button text (`.event-link-btn`): **14px** (`--text-small`) — set at the base rule, not only at the desktop breakpoint

### Button rules

There are two distinct button classes in this section:

| Class | Used for | Location |
|-------|----------|----------|
| `.event-link-btn` | CTA buttons on all carousel cards (GET DIRECTIONS, Browse Memories) | `home-scripts.ts` |
| `.carousel-past-card .past-card-btn` | "Browse Memories" button in the desktop 2-up grid memories card | `home-scripts.ts` |

Both share identical visual styling. **Both must have their font-size set at the base rule level** (not only in a desktop `min-width` override), otherwise mobile gets a smaller size than desktop.

**`text-transform` on buttons:**
- `.event-link-btn` uses `text-transform: uppercase` — correct for CTA buttons like GET DIRECTIONS
- The **Browse Memories** button (`#carousel-see-past-btn`) overrides this with `text-transform: none; letter-spacing: 0.3px` — it is sentence case intentionally
- Do NOT remove the `#carousel-see-past-btn` override or the button will revert to "BROWSE MEMORIES"

**`font-family` on buttons:** `<button>` elements do NOT inherit `font-family` in some browsers. The `.event-link-btn` rule explicitly sets `font-family: var(--font-body), 'Inter', sans-serif`. Do not change this back to `font-family: inherit`.

### Memories card copy

The "Memories" card text and button label are hardcoded in `home-scripts.ts` in **two places** — the desktop 2-up grid render (search `btn-view-past-events-desktop`) and the mobile carousel render (search `carousel-see-past-btn`). When changing copy, update **both**:

```
desktop:  <span class="past-card-btn">Browse Memories</span>
carousel: <button class="event-link-btn" id="carousel-see-past-btn">Browse Memories</button>
```

### Auto-scroll threshold

`startAutoTick()` only starts if `getMaxIndex() >= 2` (i.e. there are at least 2 total carousel slots). With 1 upcoming event and 1 memories card, that's exactly 2 — auto-scroll runs. With only a Stay Tuned card (no events), there's only 1 slot — auto-scroll correctly skips. Do not lower this threshold.

### Breakpoints that apply to the outreach section

| Breakpoint | Key effect |
|------------|-----------|
| `> 960px` (desktop) | Two-column grid layout: event cards left, memories card right |
| `≤ 960px` (mobile) | Single-column carousel; arrows hidden; `carousel-card` gets horizontal padding |
| `≤ 899px` | `.page` loses its padding; outreach stays `width: 100%` inheriting full viewport width |
| `≤ 480px` | `.page` regains `clamp(3%, 5vw, 5%)` padding; `carousel-card` padding reduced to `0 4px` |
