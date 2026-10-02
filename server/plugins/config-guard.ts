/* Catches a calendar address pasted into the wrong variable.
   NUXT_PUBLIC_BOOKING_API is public: its value is serialised into every
   page's payload and sent to every visitor's browser. A private iCal address
   there would hand out read access to the whole calendar. So the value is
   blanked on every request before the page renders, and the mistake is made
   loud in the server log. */
const CALENDAR_LIKE = /\.ics(\?|$)|calendar\.google\.com|webcal:|\/ical\//i

export default defineNitroPlugin((nitroApp) => {
  if (CALENDAR_LIKE.test(String(useRuntimeConfig().public.bookingApi || ''))) {
    console.error(
      '\n[tmiladzi] NUXT_PUBLIC_BOOKING_API holds what looks like a calendar address.\n' +
      '           That variable is PUBLIC and is sent to every browser; it has been\n' +
      '           blanked for this deployment. Move the address to\n' +
      '           NUXT_CALENDAR_ICS_URL (server-only), leave NUXT_PUBLIC_BOOKING_API\n' +
      '           empty, and reset the calendar\'s secret address.\n',
    )
  }
  nitroApp.hooks.hook('request', (event) => {
    const cfg = useRuntimeConfig(event)
    if (CALENDAR_LIKE.test(String(cfg.public.bookingApi || ''))) cfg.public.bookingApi = ''
  })
})
