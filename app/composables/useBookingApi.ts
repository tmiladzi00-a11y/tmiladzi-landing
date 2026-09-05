import { addDays, addMonths, iso } from '~/utils/dates'

/* Backend: a Google Apps Script web app running in Tsolofelo's own Google
   account. Set NUXT_PUBLIC_BOOKING_API to its /exec URL and the page goes
   live — reads real availability from the calendar and posts real requests.
   Left blank, the page runs in preview mode on sample data so it can still
   be clicked through.

   Note on the POST: Apps Script rejects a pre-flighted CORS request, so the
   body is sent as text/plain (a "simple request") and parsed as JSON
   server-side. Do not change that header. */

export interface BookingResponse { ok: boolean; ref?: string; error?: string }

/** Sample availability for preview mode: a believable scatter of taken dates. */
export function sampleBlocked(now = new Date()): string[] {
  const out: string[] = []
  for (let i = 3; i < 150; i += 1) {
    const d = addDays(now, i)
    const dow = d.getDay()
    if ((dow === 6 && i % 3 === 0) || (dow === 0 && i % 5 === 0) || i % 17 === 0) out.push(iso(d))
  }
  return out
}

export function useBookingApi() {
  const api = useRuntimeConfig().public.bookingApi as string
  const live = ref(false)
  const blocked = ref<string[]>([])
  const loading = ref(false)

  async function loadAvailability() {
    if (!api) { blocked.value = sampleBlocked(); live.value = false; return }
    loading.value = true
    try {
      const from = new Date()
      const to = addMonths(from, 14)
      const r = await fetch(`${api}?action=availability&from=${iso(from)}&to=${iso(to)}`)
      const j = await r.json()
      blocked.value = j.blocked || []
      live.value = true
    } catch {
      blocked.value = sampleBlocked(); live.value = false
    } finally { loading.value = false }
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

  return { api, live, blocked, loading, loadAvailability, submit }
}
