import { sampleBusy, type Busy } from '~/utils/availability'
import type { BookingRequest } from '~/utils/booking'

/* Availability and submission for the booking wizard.

   Availability is the time held by approved bookings and by blocks staff add
   in the admin (/api/availability). Four modes:
     loading      not answered yet; the grid shows a skeleton
     live         answered from the bookings database
     preview      no database is bound; sample data, with a notice
     unavailable  the database could not be read; every date is shown open
                  with a notice, and the studio confirms by reply

   Submission stores a pending booking (/api/bookings), which staff approve
   or decline in the admin. With no database it answers not-configured and
   the wizard emails the request instead (/api/send). */

export type AvailabilityMode = 'loading' | 'live' | 'preview' | 'unavailable'

export interface BookingReceipt {
  ref: string
  total: number
  deposit: number
  depositPct: number
  tbq: boolean
  /** The client's receipt email went out. */
  emailed: boolean
}
export type SubmitResult =
  | { kind: 'stored'; receipt: BookingReceipt }
  | { kind: 'no-database' }
  | { kind: 'rejected'; message: string; field?: string }
  | { kind: 'failed' }

export function useBookingApi() {
  // 'loading' until availability has answered: the page never claims a mode it
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

  async function submit(payload: BookingRequest): Promise<SubmitResult> {
    try {
      const r = await $fetch<{ ok: boolean } & BookingReceipt>('/api/bookings', { method: 'POST', body: payload })
      return { kind: 'stored', receipt: r }
    } catch (e) {
      const err = e as { statusCode?: number; data?: { reason?: string; statusMessage?: string; data?: Record<string, string> } }
      if (err.statusCode === 503 && err.data?.reason === 'not-configured') return { kind: 'no-database' }
      if (err.statusCode === 409 || err.statusCode === 422) {
        return { kind: 'rejected', message: err.data?.statusMessage || 'Please check your booking and try again.', field: Object.keys(err.data?.data ?? {})[0] }
      }
      return { kind: 'failed' }
    }
  }

  return { mode, busy, loadAvailability, submit }
}
