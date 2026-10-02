import { parseIcs, mergeBusy, type Busy } from '../utils/ics'
import { STUDIO_UTC_OFFSET_MIN } from '../../app/utils/availability'

/* Live availability for the booking calendar.

   The studio keeps its bookings in an ordinary calendar (Google, Apple,
   Outlook). That calendar's private iCal address goes in
   NUXT_CALENDAR_ICS_URL on the Cloudflare Pages project. This worker fetches
   it, reduces it to busy intervals and returns only those: no titles, no
   names, no locations ever leave here. Several addresses may be given,
   separated by commas or new lines, and are merged.

   Nothing is written back. A booking appears on the site when the
   photographer adds it to the calendar, on the next page load after the
   two-minute cache turns over. */

const CACHE_SECONDS = 120
const HORIZON_DAYS = 430 // a little over 14 months, matching the calendar's reach
const DAY = 86_400_000

interface Payload { live: boolean; configured: boolean; busy: Busy[]; fetchedAt?: string }

export default defineEventHandler(async (event): Promise<Payload> => {
  const cfEnv = (event.context as { cloudflare?: { env?: Record<string, string> } }).cloudflare?.env || {}
  const raw = (useRuntimeConfig(event).calendarIcsUrl as string) || cfEnv.NUXT_CALENDAR_ICS_URL || ''
  const urls = raw.split(/[\s,]+/).map((u) => u.trim().replace(/^webcal:\/\//i, 'https://')).filter((u) => /^https?:\/\//i.test(u))

  setHeader(event, 'Cache-Control', 'public, max-age=60')
  if (!urls.length) return { live: false, configured: false, busy: [] }

  // Cloudflare's edge cache, when running there; absent in local dev. The key
  // is derived from the calendar addresses (hashed, never stored), so a reset
  // secret address, or a preview deployment on a different calendar, never
  // reads another calendar's cached answer.
  const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(urls.join('\n')))
  const tag = [...new Uint8Array(digest)].slice(0, 12).map((x) => x.toString(16).padStart(2, '0')).join('')
  const key = new Request(`https://availability.tmiladzi.internal/v2/${tag}`)
  if (cache) {
    const hit = await cache.match(key).catch(() => undefined)
    if (hit) return (await hit.json()) as Payload
  }

  const now = Date.now()
  const opts = { from: now - DAY, to: now + HORIZON_DAYS * DAY, offsetMin: STUDIO_UTC_OFFSET_MIN }
  try {
    const feeds = await Promise.all(urls.map(async (u) => {
      const ctl = new AbortController()
      const timer = setTimeout(() => ctl.abort(), 8000)
      try {
        const r = await fetch(u, { signal: ctl.signal, headers: { Accept: 'text/calendar, text/plain;q=0.8' } })
        if (!r.ok) throw new Error('calendar responded ' + r.status)
        return parseIcs(await r.text(), opts)
      } finally { clearTimeout(timer) }
    }))
    const body: Payload = { live: true, configured: true, busy: mergeBusy(feeds.flat()), fetchedAt: new Date(now).toISOString() }
    if (cache) {
      await cache.put(key, new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_SECONDS}` } })).catch(() => {})
    }
    return body
  } catch (e) {
    console.error('availability fetch failed', e instanceof Error ? e.message : e)
    // configured but unreachable: say so, and let the page show every date as
    // open with a notice rather than inventing availability. A blip must not
    // be remembered: the next load tries the calendar again.
    setHeader(event, 'Cache-Control', 'no-store')
    return { live: false, configured: true, busy: [] }
  }
})
