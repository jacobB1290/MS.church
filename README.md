# Morning Star Christian Church Website

## Project Overview
- **Name**: Morning Star Christian Church Website
- **Goal**: Recreate the exact church website design with gradient colors removed for better readability
- **Features**: 
  - Same layout and structure as original
  - Clean neutral background (#f0f0f0) instead of gradient
  - Maintains original button colors (soft yellow and gray)
  - All original navigation and content preserved
  - Mobile-responsive design

## URLs
- **Development**: https://3000-iprrbc7u2mmhba4el56qt-0e616f0a.sandbox.novita.ai
- **Production**: Not yet deployed
- **GitHub**: Not yet configured

## Design Changes from Original
- **REMOVED**: Blue-yellow-maroon gradient background
- **REPLACED WITH**: Clean neutral gray background (#f0f0f0)
- **KEPT**: All original layout, typography, spacing, and button designs
- **KEPT**: Original tagline "A CHURCH ANCHORED IN HOPE"
- **KEPT**: Original heading "Mending the Broken."
- **KEPT**: Original button styling (soft yellow primary, gray secondary)

## Pages
- **Home** (`/`) - Landing page with hero message and CTAs
- **Schedule** (`/schedule`) - Service times and events
- **Outreach** (`/outreach`) - Community programs information
- **Watch** (`/watch`) - Live stream placeholder
- **Form** (`/form`) - Contact form

## Technical Stack
- **Platform**: Cloudflare Pages
- **Backend**: Hono Framework
- **Frontend**: Vanilla HTML/CSS (no external frameworks)
- **Styling**: Custom CSS with exact original design minus gradients
- **Status**: ✅ Active (Development)
- **Last Updated**: November 4, 2024

## Key Design Elements Preserved
1. **Header**: White background with navigation
2. **Logo**: "MORNING STAR CHRISTIAN CHURCH" text
3. **Navigation**: HOME, SCHEDULE, OUTREACH, WATCH, SUBMIT THE FORM
4. **Tagline Badge**: "A CHURCH ANCHORED IN HOPE" 
5. **Main Heading**: "Mending the Broken."
6. **Description Text**: Church mission statement
7. **Two CTAs**: "SUBMIT THE FORM" and "WATCH LIVE STREAM"
8. **Typography**: Light, modern font weights
9. **Spacing**: Original padding and margins

## Local Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs webapp --nostream

# Restart server
pm2 restart webapp

# Stop server
pm2 stop webapp
```

## Project Structure
```
webapp/
├── src/
│   └── index.tsx      # Main Hono application with all routes
├── dist/              # Build output
├── ecosystem.config.cjs # PM2 configuration
├── wrangler.jsonc     # Cloudflare configuration
├── package.json       # Dependencies and scripts
└── README.md         # Project documentation
```