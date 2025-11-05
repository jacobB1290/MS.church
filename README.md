# Morning Star Christian Church Website

## 🔢 CURRENT VERSION: v1.0.0
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
- **Development**: https://3000-iprrbc7u2mmhba4el56qt-0e616f0a.sandbox.novita.ai
- **Local**: http://localhost:3000
- **GitHub**: (To be configured)

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

### 4. Event Cards
Each event card includes:
- Date badge with gradient background
- Event title and time
- Detailed description
- Bulleted feature list
- Call-to-action button
- Flyer image or placeholder
- **Alternating Layout**: Flyer/text positions alternate for visual variety
  - Events 1 & 3: Flyer on left, text on right
  - Event 2: Text on left, flyer on right

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

## 📝 Version History

### v1.0.0 (Current)
- iPhone X optimization with aggressive scaling
- Fixed vertical spacing issues for smaller phones
- Version number footer added for cache verification
- All responsive breakpoints refined (375px, 480px, 768px, 960px, 1024px)

**HOW TO UPDATE VERSION:**
1. Change version in README.md (line 3)
2. Update version in src/index.tsx (search for `<div class="version-footer">v1.0.0</div>`)
3. Increment version (v1.0.0 → v1.0.1 for small fixes, v1.1.0 for features, v2.0.0 for major changes)
4. Commit with message: "Bump version to vX.X.X - [description]"
