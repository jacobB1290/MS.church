# Morning Star Christian Church Website

## 🔢 CURRENT VERSION: v1.9.5
**⚠️ IMPORTANT: Update this version number in src/index.tsx (search for "version-footer") every time you make changes!**

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
├── src/
│   └── index.tsx          # Main Hono application
├── public/
│   └── static/
│       ├── friendsgiving-flyer.png
│       └── style.css
├── dist/                  # Build output
├── ecosystem.config.cjs   # PM2 configuration
├── package.json
├── vite.config.ts
└── wrangler.jsonc        # Cloudflare configuration
```

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

### v1.9.5 (Current) - REMOVED FORM CONTAINER
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
