// ========================================
// GOOGLE CALENDAR API CONFIGURATION
// ========================================
// The API key is domain-restricted in Google Cloud Console to ms.church only
// and accesses only a public calendar, so it is safe to include here.
//
// HOW TO ADD EVENTS:
// 1. Create an event in Google Calendar
// 2. Attach a flyer image from Google Drive (must be shared publicly)
// 3. Optionally add CTA in description: [CTA: BUTTON TEXT | #contact]
//
// The website will:
// - Pull the event title and date
// - Pull the attached Google Drive image
// - Auto-sort into Upcoming vs Past events
// - Show "Stay Tuned" when no upcoming events exist

export const GOOGLE_CALENDAR_CONFIG = {
  API_KEY: 'AIzaSyBa2FQQolaJ0iM3vYSCCJd55vXkzmPA6Jg',
  CALENDAR_ID: 'morningstarchurchboise@gmail.com',
  MAX_RESULTS: 50,
  TIME_ZONE: 'America/Boise',
  // Server-side cache TTL in milliseconds (5 minutes)
  CACHE_TTL: 5 * 60 * 1000,
}

// ========================================
// YOUTUBE PLAYLIST CONFIGURATION
// ========================================
// Uses the public YouTube RSS feed — no API key required.

export const YOUTUBE_CONFIG = {
  PLAYLIST_ID: 'PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC',
  CACHE_TTL: 5 * 60 * 1000,
  // Hardcoded fallback when RSS feed is unreachable (update periodically)
  FALLBACK_VIDEO_ID: '8EP7I-lXdFI',
}

// ========================================
// FEATURE FLAGS
// ========================================
// Wednesday Activity Day is not official yet. While this is false it is hidden
// from every ON-SCREEN surface:
//   - Home schedule: the Wednesday tab + its banner tile are dropped, and the
//     banner rebalances from five tiles to four (via .schedule-layout--no-wed).
//   - /ministries: the Fellowship section and its jump-nav chip are dropped,
//     and the Youth section's image side auto-flips so the L/R image rhythm
//     still alternates cleanly without Fellowship in the sequence.
//   - The one visible CTA line that named "a Wednesday open gym" drops that
//     clause.
// TO MAKE IT OFFICIAL: flip this to true and redeploy — everything above comes
// back in one move, no other edits needed.
// (SEO/JSON-LD still lists Activity Day by design, so search/AI keep the data.)
export const WEDNESDAY_ENABLED: boolean = false
