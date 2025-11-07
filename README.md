# Morning Star Christian Church Website

## 🔢 CURRENT VERSION: v1.9.26
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

### v1.9.26 (Current) - GIFT GALLERY FULL-SCREEN LIGHTBOX
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
