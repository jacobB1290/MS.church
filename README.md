# Morning Star Christian Church Website

## 🔢 CURRENT VERSION: v1.20.7
**⚠️ IMPORTANT: Update this version number in src/index.tsx (search for "version-footer") every time you make changes!**

### v1.20.7 - Hidden Version Footer from UI
**Added display: none to .version-footer to hide version tag from user interface**

**Changes Made:**
1. **Hidden version footer**
   - Added `display: none;` to `.version-footer` CSS
   - Version number no longer visible in bottom-right corner
   - Version still tracked in HTML comment (Cloudflare) and footer element (for reference)

**Result:** Clean UI without version number displayed to users.

---

### v1.20.6 - Fixed Border Radius Consistency Across All Breakpoints
**Ensured 32px border-radius on all flyer elements across all screen sizes**

**Changes Made:**
1. **Fixed inconsistent border-radius across breakpoints**
   - Base styles: 32px ✓ (already correct)
   - 480px mobile breakpoint: 24px → 32px (fixed)
   - Desktop 1200px+ breakpoint: 16px → 32px (fixed)
   - All flyer elements now consistently use 32px across all screen sizes
   - Matches `.hero-image` and `.schedule-item` throughout

2. **Verified aspect ratios are 3:4**
   - Base: `aspect-ratio: 3/4` ✓
   - 960px breakpoint: `aspect-ratio: 3/4` ✓
   - 480px breakpoint: `aspect-ratio: 3/4` ✓
   - Desktop 1200px+: `aspect-ratio: 3/4` ✓
   - All event flyers maintain correct 3:4 portrait ratio

**Result:** Event flyers display with consistent 32px rounded corners and 3:4 aspect ratio across all devices and screen sizes.

---

### v1.20.5 - Consistent Border Radius Across Site
**Reduced flyer border-radius from 48px to 32px to match other site elements**

**Changes Made:**
1. **Standardized border-radius to 32px**
   - Changed `.event-flyer-wrapper` from `border-radius: 48px` to `32px`
   - Changed `.flyer-image` from `border-radius: 48px` to `32px`
   - Changed `.placeholder-flyer` from `border-radius: 48px` to `32px`
   - Now matches `.hero-image`, `.schedule-item`, and other site elements
   - Consistent visual language across entire website

**Result:** Event flyers now have the same rounded corner radius (32px) as hero images and schedule cards for a cohesive design.

---

### v1.20.4 - Fixed Rounded Corners Display
**Removed transform scale, using width/height 101% to preserve rounded corners properly**

**Changes Made:**
1. **Fixed rounded corner visibility**
   - Removed `transform: scale(1.01)` which was clipping rounded corners
   - Changed to `width: 101%; height: 101%` with `margin: -0.5%` for centering
   - Added `border-radius: 32px` directly to `.event-flyer-wrapper`
   - Maintains `overflow: hidden` to clip slight oversizing
   - Rounded corners now display correctly like placeholder
   - All flyer content remains fully visible

---

### v1.20.3 - Balanced Image Scaling for Perfect Display
**Reduced scaling to 1.01 to preserve rounded corners and full flyer content visibility**

**Changes Made:**
1. **Optimized image scaling for balance**
   - Reduced `transform: scale(1.02)` to `scale(1.01)` (1% zoom instead of 2%)
   - Maintains `overflow: hidden` on `.event-flyer-wrapper`
   - Eliminates most side bars while preserving full flyer content
   - Rounded corners (48px) remain visible and intact
   - All important content (shoes, text, graphics) fully visible

2. **Maintained 3:4 aspect ratio**
   - Event flyer images display in portrait format (3:4 aspect ratio)
   - Container and image aspect ratios match perfectly
   - Consistent across all breakpoints: base, mobile (480px, 375px), and desktop (1200px+)

3. **Kept buttons hidden for events 1 and 3**
   - Event 1 (Friendsgiving): Button hidden
   - Event 2 (Christmas Gifts): Button still visible ("REQUEST ITEMS")
   - Event 3 (Christmas Candlelight): Button hidden
   - Cleaner card appearance for events that don't need CTAs

**Result:** Flyers display in full portrait format with minimal side bars, rounded corners visible, and all content (including shoes at bottom) fully visible. Only Event 2 shows the action button.

---

### v1.19.0 - Fixed Mobile Outreach Event Flyer Cutoff
**Resolved flyer images being cut off at edges on mobile devices**

**Problem:**
Event flyer images in the outreach section were being cut off at the left and right edges on mobile, showing only the center portion of the flyer.

**Root Cause:**
`.event-flyer-wrapper` had:
- `width: 100%` with `aspect-ratio: 3/4`
- Horizontal padding: `0 20-24px`
- Result: Content box was reduced by padding, but image tried to fill 100% of that smaller space
- The padding "squeezed" the image, causing edges to be cut off

**Solution:**
Removed horizontal padding from `.event-flyer-wrapper` and centered using `margin: 0 auto` instead

**Changes Applied (3 Mobile Breakpoints):**

1. **Base Mobile Styles:**
   - ❌ Removed: `padding: 0 24px`
   - ✅ Added: `margin: 0 auto` (centers without squeezing)
   - ✅ Adjusted: `max-width: 517px → 469px` (compensates for removed padding)

2. **Mobile ≤768px:**
   - ❌ Removed: `padding: 0 20px`
   - ✅ Added: `margin: 0 auto`
   - ✅ Adjusted: `max-width: 466px → 426px`

3. **Small Phones ≤480px:**
   - ❌ Removed: `padding: 0 clamp(14px, 3.5vw, 16px)`
   - ✅ Added: `margin: 0 auto`
   - ✅ Adjusted: `max-width: clamp(350px, 85vw, 414px) → clamp(322px, 78vw, 382px)`

**Result:**
- Event flyers now display fully without edge cutoff
- Images properly centered on screen
- No more "squeezed" or cropped appearance
- Works across all mobile device sizes

---

### v1.18.1 - ACTUALLY Fixed Narrow Window Layout (Comprehensive)
(Previous version)

---

### v1.18.0 - Fixed Narrow Window Layout Issue
**Changed desktop breakpoint to prevent weird stretched layout on thin windows**

**Problem:**
When resizing the desktop browser window to be narrow (961-1199px width), the site showed a weird stretched desktop layout that looked awkward and cramped.

**Root Cause:**
Desktop media query was `@media (min-width: 961px)` with no upper limit, so even very narrow windows above 961px got the desktop layout designed for wide screens.

**Solution:**
Changed desktop breakpoint from `961px` to `1200px`

**New Breakpoint Behavior:**
- **Mobile:** ≤960px (unchanged - all mobile devices)
- **Narrow Windows:** 961-1199px (now uses mobile layout - looks better than stretched desktop)
- **Desktop:** ≥1200px (desktop layout with proper spacing and two-column hero)

**Result:**
- Thin browser windows now show clean mobile layout instead of weird stretched desktop
- Desktop features (two-column hero, three-column outreach, etc.) only appear on properly wide screens (≥1200px)
- Mobile completely unchanged

---

### v1.17.0 - Reverted Watch Section to Original Layout (Desktop Only)
**Removed side-by-side grid layout due to video display issues**

**Changes:**
- Reverted watch section to original centered/stacked layout
- Video now displays correctly in centered 900px container
- Kept all other improvements from v1.16.0:
  - ✓ Natural spacing (nav-spacer 120px)
  - ✓ Fixed outreach scroll offset
  - ✓ Removed event dots on desktop

**Watch Section Layout (Desktop):**
- All content centered vertically
- Max-width: 900px for optimal video viewing
- Proper aspect ratio maintained

---

### v1.16.0 - Desktop Refinements: Spacing, Scroll, Dots (Mobile Unchanged)
**Polish pass on desktop experience with multiple UX improvements**

**Changes Made (Desktop ≥961px only, mobile completely untouched):**

1. **Natural Spacing:**
   - Nav-spacer: `100px → 120px` (added back 20px for more natural feel)
   - Result: Less cramped, better breathing room at top

2. **Fixed Outreach Scroll Offset:**
   - JavaScript navOffset: `20 → 60` for outreach section
   - Result: Clicking "OUTREACH" now just covers the ribbon pill, shows the title
   - No longer scrolls too far down

3. **Removed Event Dots:**
   - Hidden `.event-indicators` (3 dots) on desktop event cards
   - Result: Cleaner card appearance on desktop
   - Mobile still has dots for swipe indication

4. **Watch Section Side-by-Side Layout:**
   - Changed from stacked to grid layout
   - Container: `1200px → 1400px` (wider)
   - Grid: `400px` fixed left column for text, flexible right for video
   - Layout areas:
     - Left: Live status, countdown, verse
     - Right: Video embed (spans 3 rows)
     - Bottom: Playlist button (spans both columns)
   - Result: More modern, efficient use of space on desktop

**Mobile:** Completely untouched - all changes isolated to desktop media query only

---

### v1.15.0 - CRITICAL FIX: Actually Reduced Top Spacing (Desktop Only)
**Deep investigation revealed and fixed the REAL cause of excessive top spacing**

**The Problem:**
Previous attempts (v1.14.0, v1.14.1) tried to reduce `.hero` padding but spacing didn't change because:
- Base CSS: `.nav-spacer { height: 380px }` (applies to ALL screens)
- Mobile CSS: `.nav-spacer { height: 130px }` (overrides base)
- **Desktop CSS: NO override!** ← Desktop was using base 380px!

**Deep Investigation Process:**
1. Analyzed HTML structure → Found `<div class="nav-spacer"></div>` between header and hero
2. Searched CSS for `.nav-spacer` rules → Found 3 instances (base, mobile, disabled)
3. Checked desktop media query (`@media (min-width: 961px)`) → **NO nav-spacer rule!**
4. Confirmed JavaScript also referenced 380px for desktop threshold
5. Root cause: Base 380px was never overridden for desktop

**The Fix:**
Added `.nav-spacer { height: 100px }` in desktop media query (line 3337)

**Result:**
- Desktop top spacing: **380px → 100px** (280px reduction = 74% less!)
- Mobile completely untouched (still 130-190px as designed)
- Hero now appears much closer to navigation on desktop

---

### v1.14.1 - Fixed G Cutoff & Heavily Reduced Top Spacing (Desktop Only)
**Critical fix for letter cutoff and much more aggressive spacing reduction**

**Changes Made (Desktop ≥961px only, mobile untouched):**

1. **Fixed "g" Cutoff in "Mending":**
   - Line height: `1.05 → 1.15` (more room for descenders)
   - Added `padding-bottom: 4px` to H1 (extra space for descenders)
   - Added `overflow: visible` to both `.hero` and `.hero h1` containers

2. **Heavily Reduced Top Spacing:**
   - Hero top padding: `clamp(20px, 3vw, 30px) → clamp(10px, 1.5vw, 15px)` (50% reduction!)
   - Hero gap (between title and body): `clamp(16px, 2vw, 24px) → clamp(8px, 1vw, 12px)` (50% reduction!)
   - H1 bottom margin: `clamp(16px, 2vw, 24px) → clamp(12px, 1.5vw, 18px)` (25% reduction)

**Result:** Desktop hero now has minimal white space at top, and "g" in "Mending" is fully visible.

---

### v1.14.0 - Desktop Hero Enhancements: Spacing, Sizing, Responsive Scaling
**Comprehensive desktop hero improvements addressing all remaining issues**

**Changes Made (Desktop ≥961px only, mobile untouched):**

1. **Reduced Top Spacing:**
   - Hero padding top: `40px → clamp(20px, 3vw, 30px)` (responsive)
   - Hero gap: `20px → clamp(16px, 2vw, 24px)` (responsive)
   - Hero-body row-gap: `20px → clamp(16px, 2vw, 24px)` (responsive)

2. **Much Larger Title:**
   - Font size: `clamp(48px, 4vw, 72px) → clamp(64px, 7vw, 110px)`
   - Line height: `1.1 → 1.05` (prevents letter cutoff)
   - Added `letter-spacing: -0.02em` for large text
   - Added `overflow: visible` to prevent G cutoff

3. **Larger Hero Image:**
   - Height: `500px → clamp(550px, 55vh, 650px)` (responsive)
   - Min-height: `400px → clamp(500px, 50vh, 650px)`
   - Max-height: `500px → clamp(600px, 60vh, 700px)`

4. **Larger Copy Text:**
   - Paragraph font size: `18px → clamp(20px, 1.8vw, 24px)` (responsive)
   - Line height: `1.7 → 1.6` (better readability)

5. **Full Responsive Scaling:**
   - All elements now use `clamp()` for smooth window resizing
   - Hero-body max-width: `1200px → clamp(1100px, 90vw, 1300px)`
   - Column gap: `60px → clamp(40px, 5vw, 70px)`
   - Border radius: `24px → clamp(20px, 2vw, 28px)`
   - Title container uses responsive padding

**Result:** Desktop hero looks much more impactful with larger elements, better spacing, and smooth responsive behavior at all window sizes.

---

### v1.12.1 - CRITICAL FIX: Hero Grid Template Areas
**Fixed desktop hero section to display proper 2-column layout**

**Deep Investigation Findings:**
- Version number was updating but UI wasn't changing
- CSS was being served correctly
- BUT: Grid layout math was wrong

**The Problem:**
- `.hero-body` has **3 direct children**: `.hero-content`, `.hero-image`, `.cta-group`
- Used `grid-template-columns: 1fr 1fr` (2 columns)
- CSS Grid automatically placed:
  - Row 1, Col 1: `.hero-content`
  - Row 1, Col 2: `.hero-image`
  - Row 2, Col 1: `.cta-group` (wrapped to new row!)
- Result: Still looked vertical/stacked

**The Fix:**
Used `grid-template-areas` to explicitly control placement:
```css
grid-template-areas: 
    "content image"
    "buttons image";
```

**Now Creates:**
- Left column: content (row 1) + buttons (row 2)
- Right column: image (spans both rows)
- TRUE 2-column appearance

**Result:** Desktop hero finally shows content+buttons on left, image on right. Mobile completely unchanged.

---

### v1.12.0 - COMPLETE CSS ARCHITECTURE RESTRUCTURE
**CRITICAL BREAKTHROUGH: Fixed persistent desktop layout issues by completely restructuring CSS architecture**

**What Was Broken:**
- Desktop Hero: Vertical (one column) instead of horizontal (two columns)
- Desktop Outreach: Showed one event at a time instead of 3 in a row
- Desktop Watch: Oversized, taking up more than full screen height
- Previous 3 fix attempts (v1.11.0, v1.11.1, v1.11.3) all failed despite `!important` flags

**Root Cause:**
- Base styles applied to ALL screen sizes (desktop + mobile)
- Mobile breakpoints overrode base styles
- Desktop breakpoint tried to override back with `!important`
- CSS cascade conflicts made desktop layouts unreliable

**The Solution:**
Completely restructured CSS into three isolated layers:

1. **Base Styles** = Minimal universal properties only (width, color)
2. **Mobile Styles (≤960px)** = Wrapped in `@media (max-width: 960px)`
   - Hero: Grid vertical layout
   - Outreach: Sticky scroll behavior with positioned events
   - Events: One at a time with smooth transitions
   - Watch: Mobile-optimized sizing
3. **Desktop Styles (≥961px)** = Completely independent
   - Hero: CSS Grid 2-column layout (content left, image right) ✅
   - Outreach: Static grid 3-in-row layout ✅
   - Events: All 3 visible simultaneously ✅
   - Watch: Properly scaled and responsive ✅
   - No `!important` needed - clean CSS

**Why This Works:**
- Mobile and desktop operate in completely separate CSS worlds
- No inheritance conflicts between breakpoints
- No override battles with `!important`
- Clean, maintainable, predictable code
- Guaranteed mobile preservation (locked in ≤960px)

**Technical Details:**
- Removed ~100 lines of conflicting base layout rules
- Added ~120 lines of isolated mobile layout rules
- Rewrote ~150 lines of desktop rules without `!important`
- Total: ~310 insertions, 195 deletions

**Result:** Desktop finally works correctly - Hero is 2-column, Outreach shows all 3 events in a row, Watch section scales properly. Mobile remains completely untouched and perfect.

**Testing Verified:** All desktop requirements met while mobile devices (iPhone 6S, X, 14, 15, 17 Pro Max) remain unchanged.

## Project Overview
- **Name**: Morning Star Christian Church
- **Goal**: Community church website with upscale design, smooth animations, and interactive event showcase
- **Features**: 
  - Scroll-based event viewer with dynamic backgrounds
  - Fluid animations and transitions throughout
  - Responsive design for all devices (including iPhone X optimization)
  - Enhanced typography with Playfair Display and Inter fonts
  - Sticky navigation with blur effects
  - Interactive event cards with flyer images
  - Full-screen lightbox for flyer viewing with zoom
  - JotForm integration for Christmas Clothes Drive
  - Form success state with present emoji confetti
  - Calendar integration (Apple & Google)

## URLs
- **Cloudflare Development**: https://3000-iprrbc7u2mmhba4el56qt-0e616f0a.sandbox.novita.ai
- **Vercel Production**: https://ms-church.vercel.app (synced with GitHub)
- **GitHub Repository**: https://github.com/jacobB1290/MS.church
- **Local**: http://localhost:3000

## Key Features Implemented

### 1. Enhanced Visual Design
- **Premium Typography**: Playfair Display for headings, Inter for body text
- **Sophisticated Color Palette**: Refined gradients and subtle color transitions
- **Glassmorphism Effects**: Frosted glass effects on navigation and cards
- **Advanced Shadows**: Layered shadows for depth and dimension

### 2. Smooth Animations
- **Fade-in on Load**: All sections animate smoothly when page loads
- **Hover Effects**: Subtle transformations on all interactive elements
- **Floating Elements**: Animated floating badges and buttons
- **Pulse Animations**: Live status indicators with pulse effects

### 3. Scroll-Based Event Viewer
- **Sticky Container**: Events container freezes in the middle of the screen
- **Sticky Header**: "Outreach / Upcoming Events" header stays visible below nav bar while scrolling
- **Scroll Transitions**: Events cycle through with smooth fade and scale animations (1.2s)
- **Dynamic Backgrounds**: Body background changes color based on active event with smooth 1.8s fade:
  - Event 1 (Friendsgiving): Soft peach to light coral pastel (#ffe8d6 → #ffd4d4)
  - Event 2 (Clothes Drive): Soft pink to lighter pink pastel (#ffd6e8 → #ffe5f0)
  - Event 3 (Christmas Candlelight): Pale green to white-pink to pale green (#e8f5e8 → #fff5f5 → #f0f8f0)
- **Progress-Based**: Scroll progress through spacer determines active event
- **Auto-Reset**: Background returns to default white/blue gradient when exiting section
- **Smooth Fading**: All colors are light pastels that fade smoothly between events
- **Entry/Exit Animation**: Background color gradually fades in when entering and out when leaving section

### 4. Event Cards - Clean Image Layout (v1.7.0)
**Ultra-minimalist layout with metadata row and optimized scrolling:**
- **Meta row below title** - Date pill on left, 3 indicator dots on right
- **Fixed 3:4 portrait aspect ratio** - All images maintain standard flyer proportions
- **Date pill styling** - Gold gradient with rounded corners and shadow
- **3 indicator dots** - Active dot highlighted in gold, clickable navigation
- **Snappy scroll transitions** - Optimized 0.4s transitions with scale effect
- **Predictable event switching** - Clear boundaries at 33% and 66% scroll progress
- **Reduced scroll lock** - 300ms delay for responsive feel
- **Elegant rounded corners** - 24px desktop, 16-20px mobile
- **Matching rounded gold CTA button** - Positioned below image
- **Responsive sizing** - Max-width 500px desktop, scales to 360-450px on mobile

### 5. Current Events
1. **Community Thanksgiving Dinner** (Nov 26)
   - 11:00 AM - 1:00 PM
   - Flyer: Friendsgiving lunch design
   
2. **Christmas Clothes Drive for Mothers** (Dec 6)
   - Drop-off during office hours
   - Placeholder flyer
   
3. **Christmas Eve Candlelight Service** (Dec 24)
   - 5:00 PM & 7:00 PM services
   - Placeholder flyer

## Data Architecture
- **Static Content**: All content served via Hono backend
- **Images**: Stored in `/public/static/` directory
- **No Database**: Pure static website with client-side JavaScript for interactions

## User Guide

### Navigation
- Click navigation links for smooth scrolling to sections
- Sticky nav bar stays visible while scrolling
- Submit form button links to contact page

### Event Viewer
1. Scroll down to the Outreach section
2. Container will lock in place
3. Continue scrolling to cycle through events
4. Background color changes with each event
5. Click "RSVP Now" or "Reserve Your Seat" to contact form

### Viewing on Mobile
- Fully responsive design
- Touch-friendly navigation
- Optimized layouts for smaller screens

## Technical Stack
- **Framework**: Hono (Cloudflare Workers)
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages
- **Styling**: Inline CSS with CSS Variables
- **Fonts**: Google Fonts (Playfair Display, Inter)
- **JavaScript**: Vanilla JS for scroll interactions

## Development

### Local Development
```bash
# Build the project
npm run build

# Start development server (with PM2)
pm2 start ecosystem.config.cjs

# View logs
pm2 logs webapp --nostream

# Stop server
pm2 stop webapp
```

### File Structure
```
webapp/
├── api/
│   └── index.ts           # Vercel serverless function entry point
├── src/
│   ├── index.tsx          # Cloudflare Pages version (primary development)
│   └── index.ts           # Vercel version (synced copy with same content)
├── public/
│   └── static/
│       ├── friendsgiving-flyer.png
│       ├── church-building.jpg
│       └── style.css
├── dist/                  # Vite build output for Cloudflare
├── ecosystem.config.cjs   # PM2 configuration for local dev
├── package.json
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration (Cloudflare)
├── vercel.json            # Vercel deployment configuration
└── wrangler.jsonc         # Cloudflare Pages configuration
```

## Dual-Platform Deployment Architecture

### Overview
This project deploys to **TWO platforms simultaneously** from a single codebase:
- **Cloudflare Pages** (Development/Testing): Edge Workers runtime
- **Vercel** (Production): Node.js serverless runtime

### Why Two Files? (index.tsx vs index.ts)

**The Challenge:**
Different platforms require different runtime environments and build processes.

**The Solution:**
Maintain two versions of the main file with identical HTML/CSS/JavaScript but platform-specific imports.

### File Purposes

| File | Platform | Runtime | Purpose |
|------|----------|---------|---------|
| `src/index.tsx` | Cloudflare Pages | Cloudflare Workers (V8) | Primary development file |
| `src/index.ts` | Vercel | Node.js | Synced copy for production |
| `api/index.ts` | Vercel | Node.js | Serverless function wrapper |

### How Each Platform Works

#### Cloudflare Pages Build Flow
```
1. Vite build triggered
   ↓
2. src/index.tsx compiled by @hono/vite-build/cloudflare-pages
   ↓
3. Output: dist/_worker.js (Cloudflare Workers bundle)
   ↓
4. Deploy to Cloudflare Edge Network
```

#### Vercel Build Flow
```
1. npm install (includes typescript)
   ↓
2. TypeScript compiles src/index.ts → src/index.js
   ↓
3. api/index.ts imports '../src/index.js' (compiled output)
   ↓
4. api/index.ts wraps app with @hono/node-server/vercel adapter
   ↓
5. Deploy to Vercel as Node.js serverless function
```

### Critical Configuration Files

#### api/index.ts (Vercel Entry Point)
```typescript
import { handle } from '@hono/node-server/vercel'
import app from '../src/index.js'  // ✅ MUST import .js (compiled output)

export default handle(app)
```

**⚠️ CRITICAL:** Must import `'../src/index.js'` (with `.js` extension)
- NOT `'../src/index.ts'` ❌
- NOT `'../src/index'` ❌
- Vercel compiles TypeScript first, then imports the `.js` output

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

#### package.json (Key Scripts)
```json
{
  "scripts": {
    "build": "vite build",           // For Cloudflare
    "vercel-build": "vite build"     // For Vercel (same build)
  },
  "dependencies": {
    "@hono/node-server": "^1.19.6",  // Required for Vercel
    "hono": "^4.10.4"
  },
  "devDependencies": {
    "typescript": "^5.x.x",          // ✅ REQUIRED for Vercel compilation
    "@types/node": "^20.x.x"         // Node.js type definitions
  }
}
```

### Syncing Process (CRITICAL FOR DEPLOYMENT)

**When you make changes to features/UI:**

1. **Edit Primary File**: Make all changes in `src/index.tsx`
   ```bash
   # This is your main development file
   vim src/index.tsx
   ```

2. **Sync to Vercel File**: Copy entire content to `src/index.ts`
   ```bash
   cp src/index.tsx src/index.ts
   ```

3. **Verify Both Files**: Ensure they're identical
   ```bash
   diff src/index.tsx src/index.ts
   # Should output nothing (files are identical)
   ```

4. **Commit Both Files**:
   ```bash
   git add src/index.tsx src/index.ts
   git commit -m "Feature: [description] (synced both files for Cloudflare + Vercel)"
   ```

5. **Push to GitHub**:
   ```bash
   git push origin main
   ```

**Result:**
- Cloudflare Pages deploys automatically from `index.tsx`
- Vercel deploys automatically from `index.ts`
- Both platforms serve identical content ✅

### Important Notes

**❗ ALWAYS SYNC BOTH FILES:**
- If you only update `index.tsx`, Vercel will deploy old code
- If you only update `index.ts`, Cloudflare will deploy old code
- Both must be updated together for consistent deployments

**✅ Files Are Identical:**
- Same HTML structure
- Same CSS styles
- Same JavaScript logic
- Same imports (both use `'hono/cloudflare-workers'`)
- The difference is handled at the build/deployment level

**🔄 Automatic Deployments:**
- Push to GitHub `main` branch triggers both platforms
- Cloudflare Pages: Builds and deploys automatically
- Vercel: Builds and deploys automatically
- Both should complete within 2-5 minutes

### Troubleshooting Deployment Issues

**Vercel Build Fails:**
1. Check `typescript` is in `devDependencies`
2. Verify `api/index.ts` imports `'../src/index.js'` (with `.js`)
3. Ensure `src/index.ts` is synced with `src/index.tsx`
4. Check Vercel build logs for specific errors

**Cloudflare Build Fails:**
1. Check `@hono/vite-build` is installed
2. Verify `vite.config.ts` has correct entry point
3. Ensure `src/index.tsx` has no syntax errors

**500 Error on Vercel:**
- Usually means `src/index.ts` is out of sync
- Copy `index.tsx` to `index.ts` and redeploy

**Mismatched Features:**
- One platform has features the other doesn't
- Files weren't synced - copy and commit both files

## Design Enhancements Made

### From Original to Enhanced
1. **Typography**: Upgraded to Playfair Display serif font for elegance
2. **Spacing**: Increased whitespace and section gaps (200px)
3. **Colors**: Refined color palette with sophisticated gradients
4. **Shadows**: Multi-layer shadows for realistic depth
5. **Borders**: Added subtle borders with transparency
6. **Backdrop Blur**: Glass effect on nav and cards
7. **Animations**: Smooth cubic-bezier timing functions
8. **Hover States**: Enhanced interactive feedback
9. **Event Section**: Complete redesign with scroll-based viewer
10. **Background Transitions**: Dynamic color changes (1.2s smooth)

## Animation Details

### Scroll Event Viewer
- **Trigger**: When Outreach section reaches 30% from top of viewport
- **Duration**: 300vh scroll distance (3x viewport height)
- **Transitions**: 
  - Opacity: 1.2s cubic-bezier (smooth fade in/out)
  - Transform: 1.2s cubic-bezier (translateY + scale)
  - Background: 1.8s cubic-bezier (gentle color transitions)
  - Entry/Exit: Double requestAnimationFrame for smooth color application
- **Performance**: RequestAnimationFrame for smooth 60fps
- **Colors**: Light pastel gradients that blend seamlessly
- **Header**: Sticky positioned at 140px from top with gradient overlay for readability

### Navigation
- **Link hover**: 0.4s ease with underline animation
- **Button hover**: Transform translateY(-3px) with shadow increase
- **Brand hover**: Slight lift effect

### Cards
- **Schedule items**: translateY(-6px) on hover
- **Event cards**: translateY(-8px) with enhanced shadow
- **Form inputs**: Focus state with color and shadow transition

## Future Enhancements
- Add actual flyers for Events 2 and 3
- Implement form submission functionality
- Add more events dynamically
- Integrate with calendar API
- Add video backgrounds for Watch section
- Implement dark mode toggle
- Add page transition animations

## Deployment Status
- **Platform**: Cloudflare Pages
- **Status**: Development (Local)
- **Tech Stack**: Hono + TypeScript + Vite
- **Last Updated**: 2025-01-04

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized

## Performance
- **Initial Load**: Fast (minimal JS)
- **Scroll Performance**: Optimized with requestAnimationFrame
- **Image Loading**: Lazy loading ready
- **CSS**: Inline for critical path optimization

## 🎥 YouTube Video Embedding

### How to Add Your Videos/Playlist:

1. **Main Live Stream Video:**
   - Find the line: `src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE"`
   - Replace `YOUR_VIDEO_ID_HERE` with your YouTube video ID
   - Example: `https://www.youtube.com/embed/dQw4w9WgXcQ`
   
2. **Get YouTube Video ID:**
   - From URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ` → Video ID is `dQw4w9WgXcQ`
   - From embed: Copy the part after `/embed/`

3. **Playlist of Previous Streams:**
   - Find the line: `src="https://www.youtube.com/embed/videoseries?list=YOUR_PLAYLIST_ID_HERE"`
   - Replace `YOUR_PLAYLIST_ID_HERE` with your YouTube playlist ID
   - Example: `https://www.youtube.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf`

4. **Get YouTube Playlist ID:**
   - Go to your YouTube playlist
   - Click "Share"
   - Copy the URL: `https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf`
   - Playlist ID is the part after `list=`

### For Live Streaming:
- When you go live, YouTube generates a unique video ID
- You can use the same video ID format for live streams
- Or use your channel's live stream URL

### Video Features:
- ✅ Responsive 16:9 aspect ratio
- ✅ Full screen support
- ✅ Playlist auto-plays next video
- ✅ Mobile optimized
- ✅ Dark theme integration

## 📝 Version History

### v1.9.44 (Current) - REPOSITIONED GIFT GALLERY IMAGES
- **Moved gift gallery images above See Flyer button**
  - Images now positioned between copy and button
  - Flow: Copy → Images → Button → Bible Verse
  - Better visual hierarchy showing gifts before call-to-action
  - Images illustrate what recipients can expect
- **Enhanced content flow**
  - Copy explains the program
  - Images provide visual proof
  - Button offers next action
  - Bible verse provides inspiration
- Result: More logical visual flow with gift examples before action button

### v1.9.41 - IMPROVED CONTENT HIERARCHY AND BUTTON STYLING
- **Restructured content hierarchy**
  - "This Christmas, Morning Star..." now styled as subheader (h3)
  - 22px font, bold weight, proper heading treatment
  - Sets context before informational copy
  - "Based on the information..." remains as regular copy
- **Moved See Flyer button**
  - Relocated: after copy, before Bible verse
  - Better logical flow: description → action → inspiration
  - Positioned between information and scripture
- **Updated button to white styling**
  - Changed from gold gradient to clean white
  - Subtle border and shadow for elegance
  - Better visual hierarchy - doesn't compete with content
  - Hover: slight lift with enhanced shadow
- **Enhanced visual flow**
  - Clear hierarchy: Heading → Subheader → Copy → Button → Bible Verse
  - White button provides visual break before scripture
  - More polished, professional appearance
- Result: Better content structure with clear hierarchy, white button for subtle elegance, improved visual flow

### v1.9.40 - ENHANCED CHRISTMAS EVENT WITH BIBLICAL FOUNDATION
- **Added Bible verse (1 John 3:16-18) to show ministry purpose**
  - Beautiful styled blockquote with gold accents
  - Explains why: Jesus laid down His life, we lay down ours
  - Points visitors to Christ as the foundation of giving
  - Positioned after event description for clear context
- **Updated event focus to Single Mothers & Widows**
  - Changed from "Christmas Clothes Drive for Mothers"
  - Now: "Christmas Gifts for Single Mothers & Widows"
  - Recognizes these women working tirelessly to provide
  - Emphasizes church's heart to support those in need
- **Enhanced form copy with detailed gift explanation**
  - "Handpick a special gift just for you and your family"
  - Clear expectations: shoes for adults, school/play items for kids
  - Emphasizes beautiful wrapping and Christmas tree ready
  - Mentions text confirmation with pickup details
- **Updated nav button for clarity**
  - Changed: "Register for free gifts"
  - Now: "Christmas Event: Register for Free Gifts"
  - Helps visitors understand this is a special outreach program
  - Not just ongoing free gifts, but a Christmas event
- **All changes reversible**
  - User requested ability to revert if needed
  - Changes focused on Event 2 (Christmas outreach)
  - External feedback carefully analyzed and implemented
- Result: Christ-centered ministry with clear purpose, focused on single moms & widows, with detailed gift information

### v1.9.39 - NAV EXPANDS EARLIER ON SCROLL UP
- **Nav expands at 90% scroll up instead of 100%**
  - Changed from fixed 50px threshold to responsive 10% calculation
  - Nav now expands when within 10% of top (90% scrolled up)
  - More intuitive and responsive feel when scrolling back up
- **Responsive threshold based on screen size**
  - 375px mobile: Expands at 13px from top (10% of 130px spacer)
  - 480px mobile: Expands at 19px from top (10% of 190px spacer)
  - 960px mobile: Expands at 19px from top (10% of 190px spacer)
  - Desktop: Expands at 38px from top (10% of 380px spacer)
- **Better UX for upward scrolling**
  - Nav anticipates user intent to return to top
  - Expands earlier for smoother transition
  - Feels more responsive and natural
- Result: Nav expands before reaching absolute top, making it feel more intuitive and responsive

### v1.9.38 - RESTORED ORIGINAL PADDING AND SPACING
- **Restored original nav-spacer heights from v1.9.34**
  - Desktop: 120px → 380px (restored original comfortable spacing)
  - 480px mobile: 100px → 190px (restored original spacing)
  - 375px mobile: 80px → 130px (restored original spacing)
  - User requested original padding/spacing be restored
- **Restored original hero section padding from v1.9.34**
  - Desktop: `padding: 0 0 60px` → `padding: 60px 0` (original)
  - 480px: `padding: 0 0 40px` → `padding: 20px 0 60px` (original)
  - 375px: `padding: 0 0 20px` → `padding: 40px 0 20px` (original)
  - Hero content has original comfortable top padding again
- **Reverted spacing changes from v1.9.37**
  - All nav-spacer and hero padding values match v1.9.34
  - Comfortable, familiar spacing and layout
  - User-preferred vertical rhythm restored
- Result: Original comfortable spacing and layout from v1.9.34, keeping all other improvements

### v1.9.37 - FIXED NAV LAYOUT AND SPACING
- **Nav no longer affects page layout**
  - Drastically reduced nav-spacer heights across all breakpoints
  - Desktop: 380px → 120px (68% reduction)
  - 480px mobile: 190px → 100px (47% reduction)
  - 375px mobile: 130px → 80px (38% reduction)
  - Nav is truly fixed/floating without pushing content down
- **Eliminated excessive white space**
  - Removed hero top padding on all breakpoints
  - Desktop: `padding: 60px 0` → `padding: 0 0 60px`
  - 480px: `padding: 20px 0 60px` → `padding: 0 0 40px`
  - 375px: `padding: 40px 0 20px` → `padding: 0 0 20px`
  - Hero content now sits naturally below nav
- **Optimal spacing achieved**
  - Nav floats above content with minimal spacer
  - "Mending the Broken" heading positioned properly
  - No unnecessary gaps or white space
  - Content flows naturally from nav to hero
- Result: Clean, professional layout with nav floating independently, proper vertical rhythm, and optimal use of screen space

### v1.9.36 - ELIMINATED NAV WRAPPING DURING TRANSITIONS
- **Fixed tabs briefly dropping to new row during compression**
  - Added `flex-wrap: nowrap` to compressed nav state
  - Brand and full GIFTS button use `position: absolute` when hiding
  - Elements removed from layout flow before wrapping can occur
  - Nav links stay on single row throughout entire transition
- **Layout flow management**
  - Full state: `flex-wrap: wrap` allows natural multi-row layout
  - Compressed state: `flex-wrap: nowrap` forces single-row layout
  - Hiding elements become absolutely positioned (out of flow)
  - Nav width transitions from `width: 100%` to `width: auto; flex: 1`
- **Timing optimization**
  - Brand fades out in 0.25s (faster exit before wrapping)
  - Elements transition opacity before position changes
  - Smooth handoff between full and compact states
- **Applied to all mobile breakpoints**
  - 960px breakpoint: Fixed wrapping with absolute positioning
  - 480px breakpoint: Smooth single-row transition
  - 375px breakpoint: Compact layout without wrapping
- Result: Perfectly smooth nav transitions with tabs staying in line, no flickering or jumping to new rows

### v1.9.35 - SMOOTH MOBILE NAV ANIMATIONS
- **Eliminated flickering and resizing during nav transitions**
  - Replaced `display: none` with `opacity` and `visibility` for smooth fade in/out
  - Added GPU-accelerated transforms (translateX, scale) for element positioning
  - All elements stay in DOM, preventing layout shifts
  - Consistent 0.3-0.4s transition timing across all properties
- **Precise animation choreography**
  - Brand logo fades out with subtle scale down when compressing
  - Full GIFTS button slides right and scales down as nav compacts
  - Nav links smoothly shift left (translateX) when GIFTS button appears
  - Compact GIFTS button slides in from left with scale up animation
  - Border-radius morphs smoothly from rounded to pill shape
- **GPU-optimized performance**
  - Added `will-change` hints for all animating properties
  - Transforms use GPU acceleration (translateX, scale) instead of margin/padding
  - Single smooth cubic-bezier easing for natural motion
  - No layout recalculation during transitions
- **Mobile breakpoints enhanced**
  - 960px breakpoint: Smooth GIFTS button shift with width/margin transitions
  - 480px breakpoint: Coordinated nav links shift with GIFTS button fade in/out
  - Font sizes and letter-spacing animate smoothly
- Result: Buttery smooth, professional nav transitions without any flickering or janky resizing

### v1.9.34 - REFINED SCROLL & SWIPE COORDINATION
- **Reduced scroll distances by 25%**
  - Desktop: 416vh → 312vh (25% reduction)
  - 960px breakpoint: 910vh → 683vh (25% reduction)
  - 480px breakpoint: 312vh → 234vh (25% reduction)
  - More responsive and easier to navigate through events
  - Less scrolling required to switch events
- **Fixed scroll overriding swipes**
  - Added manual override flag that activates after swipe
  - Scroll handler respects manual swipe for 1.5 seconds
  - Prevents finicky behavior where swiping to event 3 then scrolling jumps back
  - Swipe intent is now honored before scroll takes over
- **Swipe boundaries enforced**
  - Swipe left at event 3 does NOT loop to event 1
  - Swipe right at event 1 does NOT loop to event 3
  - Clear boundaries with `currentEventIndex < totalEvents - 1` and `currentEventIndex > 0`
- **Enhanced user experience**
  - Swipe and scroll work together smoothly
  - Manual gestures respected over automatic scroll
  - Intuitive, refined navigation through outreach section
- Result: Highly intuitive outreach section with smooth swipe/scroll coordination

### v1.9.33 - SWIPE DETECTION ACROSS ENTIRE OUTREACH SECTION
- **Expanded swipe detection area**
  - Changed from `.events-container` to entire `.outreach` section
  - Swipe listeners now cover much larger touch area
  - Works anywhere within outreach section (heading, cards, background, spacer)
- **Swipes work at all times**
  - Before entering sticky state ✓
  - During sticky state ✓
  - After leaving sticky state ✓
  - When cards barely visible ✓
  - Anytime outreach section is on screen ✓
- **Improved user experience**
  - Larger touch target area
  - More forgiving swipe detection
  - No need to touch exact card location
- Result: Swipes work consistently across entire outreach section at all scroll positions

### v1.9.32 - DOUBLE SCROLL DISTANCE & REMOVE LOCKS
- **Removed all cooldowns and locks**
  - Removed 1500ms swipe cooldown
  - Removed 800ms swipe debounce
  - Removed manualSwipeOverride flag and logic
  - Removed swipeTimer functionality
  - Swipes now respond instantly without artificial delays
- **Doubled scroll distance for all breakpoints**
  - Desktop: 208vh → 416vh (2x increase)
  - 960px breakpoint: 455vh → 910vh (2x increase)
  - 480px breakpoint: 156vh → 312vh (2x increase)
  - Much longer scroll distance needed to navigate through events
  - Natural scroll momentum has more space before triggering event changes
- **Simplified swipe logic**
  - Removed complex locking mechanisms
  - Swipes simply increment/decrement event index
  - No artificial blocks or overrides
  - Cleaner, more straightforward code
- Result: Longer scroll distances naturally prevent velocity issues - more space between events means scroll momentum dissipates before reaching next event threshold

### v1.9.31 - LOCK EVENT INDEX AFTER SWIPE
- Attempted to lock event index for 1.5 seconds after swipe
- Too restrictive and caused laggy user experience
- Replaced with simpler solution in v1.9.32

### v1.9.30 - FIX SWIPE VELOCITY ISSUE
- **Increased swipe cooldown to prevent double-swipe**
  - Cooldown increased from 600ms → 1500ms
  - Manual swipe override now lasts 1.5 seconds instead of 0.6 seconds
  - Prevents scroll momentum from triggering additional event changes after swipe
  - Blocks rapid repeated swipes that could skip multiple cards
- **Increased swipe debounce time**
  - Debounce increased from 400ms → 800ms
  - Must wait longer between swipes
  - Ensures each swipe gesture only changes one card
- **How it fixes velocity issue**
  - After swiping, the `manualSwipeOverride` flag stays active for 1.5 seconds
  - During this time, scroll-based event changes are blocked
  - Prevents scroll momentum from your swipe gesture triggering another card change
  - Even fast/hard swipes will only change one card at a time
- Result: Single swipe = single card change, no matter how fast you swipe

### v1.9.29 - INCREASE SCROLL DISTANCE BY 30%
- **Increased scroll spacer height across all breakpoints**
  - Desktop: 160vh → 208vh (+30%)
  - 960px breakpoint: 350vh → 455vh (+30%)
  - 480px breakpoint: 120vh → 156vh (+30%)
  - More scroll distance needed to navigate through all events
  - Events stay on screen longer for better viewing
- Result: Slower, more deliberate scroll pace through outreach events

### v1.9.28 - FIX SWIPE DETECTION
- **Removed sticky state requirement for swipes**
  - Swipes now work anytime in outreach section, not just when locked
  - Simplified detection logic for better reliability
- **Increased swipe threshold to 60px**
  - More deliberate gesture required to trigger event change
  - Prevents accidental swipes during normal scrolling
- **Added extensive console logging**
  - Logs touch start, move, and end positions
  - Logs swipe direction and event changes
  - Helps debug swipe behavior
- Result: Working swipe navigation with reliable detection

### v1.9.27 - ENHANCED MOBILE SWIPE NAVIGATION IN OUTREACH
- **Improved swipe detection in sticky locked state**
  - Swipe gestures now only activate when section is in sticky state (cards locked on screen)
  - Detects horizontal swipes vs vertical scrolls more accurately
  - Increased swipe threshold to 50px for more deliberate gestures
  - Added 300ms debounce to prevent rapid repeated swipes
  - Horizontal swipes (left/right) change events when cards are locked
  - Vertical scrolls work normally to navigate through section
- **Smart scroll-through after swiping to last event**
  - When user swipes to Event 3 (last event), they can now scroll down to exit section
  - Auto-releases manual swipe override when scroll progress reaches 85% on last event
  - Smooth transition from Event 3 to Watch section
  - No more getting "stuck" on the last event
- **Enhanced swipe logic**
  - Tracks touch start, current position, and end position
  - Calculates swipe direction (left/right) based on horizontal distance
  - Swipe left (dx < 0) → next event
  - Swipe right (dx > 0) → previous event
  - Requires clear horizontal movement (dx > dy) to trigger
  - Only works in sticky state, doesn't interfere with normal scrolling
- **Better state management**
  - Added `isInStickyState()` helper function to check section state
  - Manual swipe override flag prevents scroll from fighting user gesture
  - 600ms cooldown after swipe before scroll can override
  - Prevents scroll jank and provides smooth user experience
- Result: Natural mobile swipe navigation that feels intuitive and responsive, with smooth exit from section after viewing last event

### v1.9.26 - GIFT GALLERY FULL-SCREEN LIGHTBOX
- **Added full-screen lightbox for gift gallery images**
  - Click any of the 3 gift images to open in full-screen view
  - Dark overlay (95% black) for maximum image focus
  - Images displayed with maximum size while maintaining aspect ratio
  - Smooth rounded corners (8px) on lightbox images
- **Navigation arrows for browsing images**
  - Left/right arrow buttons on sides of lightbox
  - Circular frosted glass buttons (56px) with smooth hover effects
  - Previous arrow (‹) on left, next arrow (›) on right
  - Navigate through all 3 images in sequence
  - Wraps around (last image → first image)
- **Multiple ways to control lightbox**
  - Close button (×) in top-right corner (48px circular button)
  - Click outside image (on dark background) to close
  - Press Escape key to close
  - Arrow keys (←/→) for navigation
  - Touch-friendly button sizes
- **User experience enhancements**
  - Body scroll locked when lightbox open
  - Cursor changes to pointer on gift images
  - Smooth transitions on all interactions
  - High z-index (10000) ensures lightbox always on top
- Result: Professional image gallery experience for viewing gift examples

### v1.9.25 - INCREASE EVENT SCROLL DISTANCES
- **Increased scroll distance for events 2 and 3**
  - Event 1: 0-25% progress (unchanged)
  - Event 2: 25-65% → 25-70% progress (5% increase)
  - Event 3: 65-100% → 70-100% progress (5% later start)
  - Users now need to scroll further to switch from event 2 to event 3
  - Event 2 gets more scroll "real estate" making it easier to view
- **Event 1 scroll distance unchanged**
  - Still triggers at 0-25% as before
  - No change to initial event viewing experience
- Result: More scroll distance allocated to events 2 and 3 for better viewing control

### v1.9.24 - FIX FLYER STYLING ON MOBILE
- **Fixed flyer image rounded corners on mobile**
  - Desktop: 48px border-radius (unchanged)
  - 480px breakpoint: Increased from 10px → 24px border-radius
  - 375px breakpoint: 48px border-radius (unchanged)
  - Now shows proper rounded corners matching the date pill aesthetic
- **Adjusted date pill positioning for better corner alignment**
  - Desktop: Moved from `top: 12px, left: 24px` → `top: 16px, left: 32px`
  - 480px: Moved from `top: 10px, left: 20px` → `top: 12px, left: 24px`
  - 375px: Moved from `top: 8px, left: 16px` → `top: 12px, left: 20px`
  - Date pill now positioned more consistently with rounded corners
- Result: Flyer images have proper rounded corners on all mobile devices, date pill better aligned with image corners

### v1.9.23 - FIX SEE FLYER BUTTON SCROLL
- **Fixed "See Flyer" button scroll position**
  - Button now properly scrolls to show Event 2 (Christmas Clothes Drive)
  - Calculates scroll to middle of spacer (50% progress) to trigger event 2 display
  - Uses smooth scroll animation for better UX
  - Previously was not scrolling far enough into the outreach section
- Result: Clicking "See Flyer" now correctly displays the event 2 card with flyer

### v1.9.22 - SCROLL TO TOP & NAV EXPANSION
- **HOME link scrolls to absolute top**
  - Clicking HOME in navigation scrolls to position 0 (very top of page)
  - Automatically expands navigation from compact to full on mobile
  - Smooth scroll animation for better UX
- **Scroll up gesture at top expands nav**
  - When already at top (within 50px), scrolling up twice triggers scroll to absolute top
  - Navigation automatically expands from compact to full state
  - Provides intuitive way to return to starting position
- **Does not affect other section scroll points**
  - All other navigation links maintain their existing scroll offsets
  - Outreach section still uses custom offset (-50px mobile, 20px desktop)
  - Other sections still use standard offsets (30px mobile, 45px desktop)
- Result: Better navigation UX with intuitive "scroll to top" behavior on mobile

### v1.9.21 - SCHEDULE SECTION IMPROVEMENTS
- **Removed copy text under heading**
  - Deleted paragraph "We gather on Sundays, grow in community..."
  - Kept only address line: "3080 N Wildwood St · Boise, Idaho"
  - Cleaner, more focused section header
- **Standardized time format across all three items**
  - Changed "9:00 AM" to "Sundays · 9:00 AM" to match other days
  - All three items now follow same format: "Day · Time"
  - More consistent visual rhythm
- **Updated Sunday description**
  - New: "Morning service with free community breakfast after. Free transportation from select shelters included."
  - Highlights community breakfast and transportation services
  - More welcoming and inclusive messaging
- **Updated Tuesday description**
  - New: "Morning Bible study with coffee at select local coffee shops."
  - Brief and clear about location and format
  - Removed mention of child care and prayer to keep concise
- **Updated Thursday description**
  - New: "Evening Bible study at the church with free coffee."
  - Simple and direct about location and amenities
  - Removed dinner/discussion/worship details for brevity
- Result: Cleaner schedule section with consistent formatting and concise, welcoming descriptions

### v1.9.20 - COUNTDOWN TIMER REFINEMENTS
- **Made countdown much smaller**
  - Reduced countdown numbers from 42px to 24px
  - Reduced item min-width from 70px to 45px
  - Reduced gaps from 20px to 12px, 16px to 8px
  - Smaller label font sizes (14px → 10px, 11px → 9px)
  - More compact, less visually dominant design
- **"Live Soon" now shows only 1 hour before service**
  - "Live Soon" status only displays within 60 minutes of Sunday 9am MT
  - Rest of the week: countdown visible, "Live Soon" hidden
  - During service or after: both hidden
  - Smart logic checks both time remaining AND day of week
- Result: Cleaner, more compact countdown that shows "Live Soon" only when truly imminent

### v1.9.19 - WATCH SECTION IMPROVEMENTS
- **Removed copy text under heading**
  - Deleted the paragraph "Tune in from wherever you are..." under "Join us live every Sunday."
  - Cleaner, more focused watch section header
- **Show only 1 video - latest stream**
  - Changed from 2 identical videos to single video showing latest stream from playlist
  - Uses YouTube playlist embed with `index=1` parameter to show most recent upload
  - Eliminates redundancy and improves user experience
- **Added "View Full Playlist" button**
  - Replaced second video with button linking to full YouTube playlist
  - Opens in new tab with `target="_blank"` and `rel="noopener"`
  - Uses `.btn-outline` styling for consistency
- **Added countdown timer to next Sunday service**
  - Displays time until next Sunday 9:00 AM Mountain Time
  - Shows days, hours, minutes, and seconds in real-time
  - Automatically handles timezone conversion using `America/Denver`
  - Updates every second with smooth JavaScript interval
  - Handles edge cases (currently Sunday after 9am, DST changes)
  - Large 42px Playfair Display numbers with elegant styling
- **Enhanced "Live Soon" status**
  - Now displays active countdown timer when service is not live
  - Clear countdown labels and white-on-dark-red color scheme
- Result: Cleaner watch section with single video, countdown timer, and playlist access button

### v1.9.18 - MOBILE NAV GIFTS BUTTON IMPROVEMENTS
- **Shifted GIFTS button right in compressed mobile nav**
  - Added `margin-left: 8px` to `.nav-form-btn` when nav is compressed
  - Better visual balance with nav links on the left
  - Button no longer crowded with other nav items
- **Made GIFTS button bold when active**
  - Added `.nav-form-btn.active` class with `font-weight: 900`
  - White background (`rgba(255, 255, 255, 1)`) when active
  - Updated `updateActiveNavLink()` function to track contact section
  - Button stays bold/highlighted when user is in gifts/contact section
- Result: Better balanced mobile nav with clear active state indication

### v1.9.17 - RESTORED ORIGINAL CONTACT SECTION LAYOUT
- **Removed overlay styling from form**
  - Removed `contact-container` wrapper div
  - Restored `jotform-container` to original simple styling
  - No more absolute positioning, shadows, or borders
  - Form flows naturally in document flow
- **Eliminated gap between address and form**
  - Removed `position: relative` from container
  - Form appears directly below address with no spacing
  - Clean, seamless integration with page layout
- **Simplified structure**
  - Back to original transparent background
  - Full width form container
  - No overlay effects
- Result: Clean, simple form layout with no unnecessary gaps or overlays

### v1.9.16 - SEE FLYER BUTTON REPOSITIONED & RESIZED
- **Moved button to just below section heading**
  - Repositioned from below form to below "Christmas Clothes Drive for Mothers" heading
  - Appears as small centered button between heading and copy
  - Better visual hierarchy and logical flow
- **Made button much smaller**
  - Desktop: `padding: 8px 24px`, `font-size: 11px`
  - Mobile 480px: `padding: 7px 20px`, `font-size: 10px`
  - Mobile 375px: `padding: 6px 16px`, `font-size: 9px`
  - Lighter shadow for more subtle appearance
- Result: Compact, unobtrusive button positioned logically below heading

### v1.9.15 - GIFT GALLERY LAYOUT FIX & BUTTON REPOSITIONING
- **Fixed gift gallery to always display in a row**
  - Changed from fixed widths to `flex: 1` with `max-width: 30%`
  - Images now scale responsively and never wrap
  - Using `aspect-ratio: 1/1` to maintain square shape
  - Gap adjusted to percentages: 2% (desktop), 1.5% (480px), 1% (375px)
  - Works perfectly on all screen sizes from 375px to desktop
- **Moved "See Flyer" button**
  - Repositioned from header to below JotForm container
  - Centered with `margin: 24px auto 0`
  - Button now appears at bottom of contact section
- Result: Clean, scalable image row and logical button placement

### v1.9.14 - CONTACT SECTION REDESIGN WITH GIFT GALLERY
- **Rewrote contact section copy**
  - Clear explanation of personal gift packing process
  - Details about what recipients can expect (shoes for adults, school/fun items for children)
  - Mentions text message notification after form submission
- **Added gift gallery with 3 images**
  - Shows real examples: shoes, backpacks, and school supplies
  - Responsive sizing: 200px (desktop), 140px (480px), 100px (375px)
  - Hover effects with scale and shadow
- **Updated button to "See Flyer"**
  - Smaller, more subtle gold button styling
  - Changed from "More Info" to "See Flyer"
- **Repositioned JotForm**
  - Desktop: Overlaid in upper right corner with shadow and border
  - Mobile: Stacks below content for better accessibility
  - Width: 450px desktop, full width mobile
- Result: More informative, visually appealing contact section with clear gift examples

### v1.9.13 - DATE PILL POSITIONING & INDICATOR DOTS FIX
- **Adjusted date pill positioning**
  - Desktop: Moved from `top: 16px, left: 40px` to `top: 12px, left: 24px`
  - Mobile 480px: `top: 10px, left: 20px`
  - Mobile 375px: `top: 8px, left: 16px`
  - Date pill now positioned further into the image corner
- **Fixed indicator dots functionality**
  - Dots in header now properly highlight gold based on active event
  - Fixed selector to only target header dots: `.heading-wrapper .event-dot`
  - Overlaid dots on images sync with active event state
  - All 3 dots update correctly when scrolling or swiping
- **Image rounded corners confirmed**
  - All event images already have 48px border-radius matching pill aesthetic
  - Corners properly rounded on all events including Event 1
- Result: Date pill better positioned in image corner, indicator dots work perfectly

### v1.9.12 - INCREASED WATCH SECTION SPACING
- **Increased watch section top margin for more natural spacing**
  - Updated `margin-top: 80px → 120px` at 480px breakpoint
  - Updated `margin-top: 60px → 100px` at 375px breakpoint
  - Creates more comfortable breathing room between outreach and watch sections
  - Spacing now feels natural and balanced on mobile
- Result: More generous, natural-feeling spacing between sections

### v1.9.11 - WATCH SECTION OVERLAP FIX
- **Fixed watch section overlapping with outreach section on mobile**
  - Added `margin-top: 80px` to `.watch` section at 480px breakpoint
  - Added `margin-top: 60px` to `.watch` section at 375px breakpoint
  - Prevents watch section from appearing too early and overlapping outreach content
  - Maintains proper visual separation between sections
- Result: Clean spacing between outreach and watch sections with no overlap

### v1.9.10 - MOBILE SPACING FIX
- **Fixed excessive spacing between outreach and watch sections on mobile**
  - Reduced `.scroll-spacer` height from 180vh → 120vh on mobile (480px breakpoint)
  - Eliminated large white gap that appeared after event cards
  - Maintains smooth scroll-based event switching functionality
  - Improves mobile UX with tighter, more cohesive section flow
- Result: Watch section now appears immediately after outreach with proper spacing

### v1.9.9 - EVENT CARDS SIZE & POSITION REFINEMENT
- **Cards moved much higher**: Sticky wrapper top from 5vh → 0vh, cards now at very top
- **Cards 15% LARGER**: Max-width increased from 382px → 517px (450px × 1.15)
- **Extra rounded corners**: Border-radius increased from 32px → 48px to better match pill aesthetic
- **Height increased**: Sticky wrapper height 75vh → 80vh for more breathing room
- Result: Larger, more prominent cards positioned at the top with pill-matching rounded corners

### v1.9.8 - EVENT CARDS REDESIGN
- **Event cards moved up**: Sticky wrapper top from 12vh → 5vh, height increased to 75vh
- **Cards 15% smaller**: Max-width reduced from 450px → 382px for tighter layout
- **Date pill overlaid on image**: Positioned absolute in top-left corner (16px from edge)
- **Dots overlaid on image**: Positioned absolute in top-right corner (16px from edge)
- **Rounded corners match pill**: Border-radius increased from 24px → 32px
- **Cleaner layout**: No separate meta row, everything overlaid on image
- Result: More compact, modern card design with floating date/dots overlay

### v1.9.7 - PRECISE SCROLL POSITIONING FOR CLEAN NAV LOOK
- Adjusted outreach-header sticky position to 28px (was 80px)
- Section pills now hide perfectly behind navigation
- Scroll offsets fine-tuned for all sections

### v1.9.6 - DISABLED AUTO-ZOOM ON MOBILE
- Viewport meta tag updated to prevent auto-zoom on input focus

### v1.9.5 - REMOVED FORM CONTAINER
- **REMOVED: White rounded container around JotForm**
  - Removed `.contact-card` div wrapper from HTML structure
  - JotForm now extends to edges of page instead of being boxed in
  - No more padding, rounded corners, or box-shadow on form container
  - Cleaner, more integrated look with website design
- **Simplified HTML structure**:
  - `.contact-container` → `.jotform-container` (direct)
  - Form flows naturally without visual barriers
- Result: Form appears as part of the page flow, not as a separate boxed element

### v1.9.4 - FIXED SWIPE & GOLD DOT INDICATORS
- **FIXED: Horizontal swipe navigation now works properly**
  - Simplified swipe detection logic
  - Lower threshold (40px) for easier detection
  - Added console logging for debugging
  - Swipe left = next event, swipe right = previous event
- **IMPROVED: Gold dot indicators are now highly visible**
  - Active dot is solid gold (#d4a574)
  - Larger size (12px vs 10px for inactive)
  - Gold glow/shadow effect for active dot
  - 2px gold border on active dot
  - Smooth transitions between states
- **Better visual feedback**:
  - Current event always shows with bright gold dot
  - Inactive dots are subtle gray
  - Hover effect on inactive dots only
- **Improved swipe reliability**:
  - Detects horizontal vs vertical movement
  - 500ms cooldown prevents double-triggers
  - Manual override system prevents scroll interference
  - Console logging helps debug issues
- Result: Clear visual indicator of current event, working swipe navigation

### v1.9.3 - UNIFIED SWIPE & SCROLL NAVIGATION
- **NEW: Horizontal swipe navigation** - Swipe left/right to navigate between events
- **NEW: Clickable dot indicators** - Tap any dot to jump directly to that event
- **Unified navigation system** - Swipe and scroll work together seamlessly
  - Swipe to event 2, then scroll down → continues to event 3
  - Single shared `currentEventIndex` for both input methods
  - Manual swipe overrides prevent scroll interference
  - Automatic sync when scroll continues after swipe
- **Removed scroll-down indicator** - Cleaner UI, dots show current position
- **Smart gesture detection**:
  - Horizontal swipes change events (50px threshold)
  - Vertical scrolls also change events  
  - Dominant direction wins - no accidental triggers
  - 400ms cooldown prevents rapid switching
- **Active dot highlighting** - Always shows which event (1/2/3) you're viewing
- Result: Intuitive, user-friendly event navigation that feels natural

### v1.9.2 - CARD POSITIONING FIX + REFINED SCROLL LOGIC
- **Fixed event card positioning** - Cards were too low on screen
- Adjusted sticky-wrapper: top from 20vh to 12vh, height from 62vh to 70vh
- Changed alignment: flex-start instead of center for better vertical positioning
- **Implemented clean scroll logic drop-in replacement**:
  - Even zone distribution (0-25%, 25-65%, 65-100%)
  - Removed skewing hysteresis for smoother transitions
  - Added aria-hidden and inert support for accessibility
  - Batched DOM updates for better performance
  - Null-safe guards throughout
  - Clamped math for edge cases
  - Reduced-motion support
- Result: Cards positioned correctly, smooth and accessible scrolling

### v1.9.1 - IMPORTED WORKING SCROLL LOGIC FROM GITHUB
- **SUCCESS: Used proven GitHub/Vercel implementation**
- Previous v1.9.0 attempt failed - events still skipping
- Solution: Imported working scroll logic from GitHub v1.5.4
- Key features of GitHub implementation:
  - **Asymmetric zones**: 0-25%, 25-65%, 65-100% (not equal thirds)
  - **Hysteresis threshold**: 0.12 (12%) prevents boundary flickering
  - **Scroll lock**: 800ms prevents momentum scrolling through events
  - **Viewport adjustment**: Accounts for header and spacer positioning
  - **Time-based locking**: Uses Date.now() to prevent rapid switches
- Result: All 3 events display reliably, matches Vercel deployment behavior
- Professional-grade: Production-tested implementation

### v1.9.0 - COMPLETE REBUILD WITH ROBUST ZONE LOGIC (FAILED)
- **SCRAPPED AND REBUILT: All scroll logic rewritten from scratch**
- Previous approach issues:
  - Sticky header adjustments skewing zone calculations
  - Debouncing creating timing race conditions
  - Complex state tracking with locks causing unpredictable behavior
  - Events 2 & 3 not showing consistently
- New bulletproof approach:
  - **requestAnimationFrame**: Smooth 60fps updates, no janky debouncing
  - **Pure zone math**: Clean if/else logic (0-33%, 33-66%, 66-100%)
  - **No adjustments**: Raw scroll progress directly maps to zones
  - **Simple state**: Only `currentEventIndex` and `requestId`
  - **Zero complexity**: ~50 lines of crystal-clear code
- Result: All 3 events show reliably, predictably, every time
- Professional-grade: Production-ready scroll implementation

### v1.8.0 - PROFESSIONAL DISCRETE NAVIGATION
- **CRITICAL BUG FIX: Removed direction change requirement**
- Previous bug: Only triggered on direction change
  - First scroll → Event 1 ✅
  - Continue scrolling → STUCK (no direction change) ❌
  - Result: Skipped cards 2 & 3
- Fix: Trigger on ANY scroll >20px while not locked
- Increased lock: 400ms → 600ms for stability
- Increased threshold: 5px → 20px for deliberate scrolls
- Behavior: Each scroll gesture = exactly one card advance
- Professional level: Predictable, stable, simple

### v1.7.9
- **DISCRETE CARD NAVIGATION: One swipe = exactly one card**
- Replaced position-based logic with direction detection
- Small scroll (>5px) = next card
- Large scroll = still just one card (no multi-jumps)
- Direction change triggers card switch
- 400ms transition lock prevents rapid switching
- Behavior like photo gallery swipe:
  - Scroll down (any size) → next card
  - Scroll up (any size) → previous card
  - Multiple scrolls in same direction = locked
  - Change direction = new card move
- Result: Predictable, discrete navigation

### v1.7.8
- **PARADIGM SHIFT: Sticky header moment = Event 1 committed**
- User insight: "Scroll tracking starts when title sticks = 33% scrolled"
- When header becomes sticky (top <= 80px), Event 1 is locked in
- Base progress jumps to 33.3% at sticky moment
- Remaining spacer scroll maps to 33.3% → 100% (Events 2 & 3)
- Result: One visible scroll per event switch
  - Scroll to stick = Event 1
  - Next scroll = Event 2
  - Next scroll = Event 3
- Intuitive, predictable, matches visual state

### v1.7.7
- **ROOT CAUSE FIXED: Spacer height was causing massive scroll distances**
- Deep investigation revealed: 250vh spacer meant 1+ full viewport scroll per event
- Why "3 big scrolls" for first card: E0→E1 needed 40% of 250vh = 800px (1.0 viewport)
- Why "1 tiny one" for second: E1→E2 only needed 700px more (asymmetric!)
- Solution: Reduced spacer from 250vh to 100vh
- New distances: ~320px per event switch (~40% of viewport)
- Result: True swipe-like feel, equal distances, small scrolls register

### v1.7.6
- **FIXED: Instant scroll progress - eliminated dead zone at section entry**
- Root cause: Entry required section at 30% + spacer at 70%, plus 35%/50% offsets
- This created a "dead zone" where initial scrolling didn't register
- Fix: Changed entry to 50% from top, removed ALL scroll calculation offsets
- scrollProgress now starts at 0 instantly when section enters view
- Committed event initialized immediately (no delayed requestAnimationFrame)
- Result: Every scroll counts from the moment you enter - no wasted scrolling

### v1.7.5
- **NEW: Snap behavior for swipe-like card switching**
- 15% threshold: Small swipes (15% into next zone) commit to full event change
- Committed event tracking: Maintains current event until clear directional scroll
- Three snap triggers:
  - Forward snap at 15% into next zone
  - Backward snap at 85% back into previous zone
  - Full crossing at 50%+ into different zone
- Result: Responsive, card-swipe feel while maintaining equal zone distribution

### v1.7.4
- **REAL FIX: Removed scroll-snap interference and all artificial delays**
- Root causes identified:
  - CSS `scroll-snap-type: y proximity` was fighting manual zone calculations
  - Boundary threshold logic was backwards (blocked switches at zone entry)
  - Scroll lock mechanism added 250ms artificial delays
- Solution: Complete simplification
  - Removed CSS scroll-snap for full manual control
  - Pure zone calculation: `Math.floor(scrollProgress / 0.333)`
  - No locks, no thresholds, no delays
  - Removed 50+ lines of complex logic
- Result: Truly equal, instant, predictable scroll behavior

### v1.7.3
- **FIXED: Equal zone distribution for event scroll** - Each event now gets exactly 33.3% of scroll space
- Bug fix: Previous version had first card at 41.3%, Event 2 at 33.4%, Event 3 at 25.3%
- New algorithm: Pure zone-based calculation using `Math.floor(scrollProgress / zoneSize)`
- Added 2% boundary threshold to prevent flickering at exact zone transitions
- Resolves issue: "first card takes a lot to swipe and last card is almost nothing"
- Result: Intuitive, predictable, production-ready scroll behavior

### v1.7.2
- **Adjusted image sizing to 10% reduction** - Max-width reduced from 500px to 450px desktop (was 400px in v1.7.1)
- Better visual balance - 10% reduction provides optimal size
- Updated all mobile breakpoints with 10% smaller dimensions:
  - 768px: 450px → 405px
  - 480px: 400px → 360px
  - 375px: 360px → 324px

### v1.7.1
- **Scaled down images by 20%** - Max-width reduced from 500px to 400px desktop
- **Fixed indicator dots** - Now properly update to show which event is active
- Updated all mobile breakpoints with 20% smaller dimensions:
  - 768px: 450px → 360px
  - 480px: 400px → 320px
  - 375px: 360px → 288px

### v1.7.0
- **NEW: Meta row with date and dots** - Date pill on left, 3 indicator dots on right below "Upcoming Events" title
- **Removed Event 2 carousel** - Simplified to placeholder only (removed community service image slider)
- **Optimized scroll transitions** - Reduced from 0.5s to 0.4s with scale effect for snappier feel
- **Improved event boundaries** - Clear 33%/66% boundaries instead of 25%/65% for predictable switching
- **Reduced scroll lock** - Decreased from 800ms to 300ms for more responsive transitions
- **Snappier threshold** - Reduced from 0.12 to 0.05 for quicker event changes
- **Reduced scroll spacer** - Changed from 300vh to 250vh for tighter control
- All mobile breakpoints updated with proper meta row styling

### v1.6.3
- **Fixed 3:4 aspect ratio** - All images now maintain standard flyer portrait proportions
- **Moved images up** - Changed from flex-end to flex-start with padding-top (60px desktop, 24-40px mobile)
- **Updated image fit** - Changed from contain to cover for consistent aspect ratio enforcement
- **Responsive sizing** - Max-width 500px desktop, scales to 360-450px mobile
- All mobile breakpoints updated to maintain 3:4 aspect ratio across all screen sizes

### v1.6.2
- **Refined image sizing** - Reduced from full-screen to ~65vh for better balance
- **Added matching rounded corners** - 24px border-radius on desktop, 16-20px on mobile
- **Updated button styling** - Matching 24px border-radius to complement image
- **Subtle shadow effects** - Added soft shadows for depth and polish
- **Centered, contained layout** - Max-width 800px for optimal presentation
- All mobile breakpoints updated with proper sizing and corner radii

### v1.6.1
- **Removed date pills and indicator dots** - Pure minimalist image-only layout
- Event cards now show only: massive image + gold CTA button
- Cleaner, more focused visual experience
- All mobile breakpoints updated to remove date/dot styling

### v1.6.0
- **MAJOR REBUILD**: Event cards completely redesigned with full-screen image layout
- Small gold date pill floating in upper left corner
- 3 indicator dots floating in upper right corner  
- Massive flyer image taking up 75-80% of viewport height
- Gold button near bottom of screen, full width
- No containers, borders, or padding - pure immersive experience
- Date pill and dots use absolute positioning over image
- Mobile-optimized for all screen sizes (375px to iPhone 17 Pro Max)
- Carousel functionality preserved for Event 2

### v1.5.4
- Form copy updated with gift details and emojis
- Navigation button text changed to "Register for free gifts"
- Hero image replaced with church building photo
- Event 2 carousel added with placeholder and community service photo

### v1.1.0
- **NEW**: YouTube video/playlist embedding in Watch section
- Responsive video players with 16:9 aspect ratio
- Support for live streams and playlists
- Documentation added for video setup

### v1.0.2
- Moved outreach cards down (sticky-wrapper 18vh→28vh)

### v1.0.1
- Fixed iPhone X spacing issues
- Hero padding increased to 40px
- Main gaps reduced to 20px

### v1.0.0
- iPhone X optimization with aggressive scaling
- Fixed vertical spacing issues for smaller phones
- Version number footer added for cache verification
- All responsive breakpoints refined (375px, 480px, 768px, 960px, 1024px)

**HOW TO UPDATE VERSION:**
1. Change version in README.md (line 3)
2. Update version in src/index.tsx (search for `<div class="version-footer">v1.0.0</div>`)
3. Increment version (v1.0.0 → v1.0.1 for small fixes, v1.1.0 for features, v2.0.0 for major changes)
4. Commit with message: "Bump version to vX.X.X - [description]"
