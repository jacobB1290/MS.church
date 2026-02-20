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
