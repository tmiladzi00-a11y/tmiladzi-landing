import { clashes, studioToday } from '../../../../app/utils/booking'
import type { BookingView } from '../../../utils/bookings'

/* One tab of bookings, or search results across all of them (?q=), plus the
   counts for the tab badges. Waiting requests carry what they would clash
   with if accepted as asked. */
export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const query = getQuery(event)
  const today = studioToday()
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 80) : ''
  const view: BookingView = (['pending', 'deposit', 'upcoming', 'past', 'closed'] as const).find((v) => v === query.view) ?? 'pending'
  const [bookings, counts, busy] = await Promise.all([
    q.length >= 2 ? searchBookings(db, q) : listBookings(db, view, today),
    bookingCounts(db, today),
    view === 'pending' && !q ? readBusy(db, studioToday(Date.now() - 86_400_000)) : Promise.resolve([]),
  ])
  const clash: Record<string, string[]> = {}
  for (const b of bookings) {
    if (b.status !== 'pending') continue
    const hit = clashes(busy, b.date, b.start, b.requestedHours).map((x) => x.label)
    if (hit.length) clash[b.ref] = hit
  }
  return { bookings, pending: counts.pending, counts, clash }
})
