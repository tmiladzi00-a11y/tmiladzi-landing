import { sampleBusy, type Busy } from '~/utils/availability'

/* Availability and submission for the booking wizard.

   Availability comes from the studio's own calendar through
   /api/availability (see server/api/availability.get.ts): the photographer
   adds a booking to their calendar and the site shows that time as taken.
   Four modes:
     loading      the calendar has not answered yet; the grid shows a skeleton
     live         the calendar answered; busy holds its intervals
     preview      no calendar is configured; sample data, with a notice
     unavailable  a calendar is configured but could not be read; every date
                  is shown open with a notice, and the studio confirms by reply

   Submission: an optional Google Apps Script web app at
   NUXT_PUBLIC_BOOKING_API. Apps Script rejects a pre-flighted CORS request,
   so the body is sent as text/plain (a "simple request") and parsed as JSON
   server-side. Do not change that header. Without it the wizard posts to
   the site's own /api/send.

   NUXT_PUBLIC_* values are shipped to every browser. Only an Apps Script
   address is accepted here; anything else (a calendar address pasted into
   the wrong variable, say) is ignored, so the browser is never sent to it.
   The calendar address belongs in NUXT_CALENDAR_ICS_URL, which stays on the
   server. */

export interface BookingResponse { ok: boolean; ref?: string; error?: string }
export type AvailabilityMode = 'loading' | 'live' | 'preview' | 'unavailable'

/** An Apps Script web app address, and nothing else. */
export function appsScriptUrl(value: unknown): string {
  const v = typeof value === 'string' ? value.trim() : ''
  return /^https:\/\/script\.google(usercontent)?\.com\/.+/i.test(v) ? v : ''
}

export function useBookingApi() {
  const api = appsScriptUrl(useRuntimeConfig().public.bookingApi)
  // 'loading' until the calendar has answered: the page never claims a mode it
  // has not confirmed, and dates stay unselectable until it knows what is free
  const mode = ref<AvailabilityMode>('loading')
  const busy = ref<Busy[]>([])

  async function loadAvailability() {
    try {
      const r = await $fetch<{ live: boolean; configured: boolean; busy: Busy[] }>('/api/availability')
      if (r.live) { busy.value = r.busy; mode.value = 'live'; return }
      if (r.configured) { busy.value = []; mode.value = 'unavailable'; return }
      busy.value = sampleBusy(); mode.value = 'preview'
    } catch {
      busy.value = []; mode.value = 'unavailable'
    }
  }

  /** Resolves ok:true in preview mode after a short pause, so the flow can be walked. */
  async function submit(payload: Record<string, unknown>): Promise<BookingResponse> {
    if (!api) { await new Promise((r) => setTimeout(r, 700)); return { ok: true } }
    const r = await fetch(api, {
      method: 'POST',
      // text/plain keeps this a "simple request" — Apps Script cannot answer a CORS pre-flight
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'book', ...payload }),
    })
    const j = (await r.json()) as BookingResponse
    if (!j || !j.ok) throw new Error((j && j.error) || 'Request failed')
    return j
  }

  return { api, mode, busy, loadAvailability, submit }
}
