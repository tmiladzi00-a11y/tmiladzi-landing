import type { Busy } from '../../app/utils/availability'
import { studioToday } from '../../app/utils/booking'

/* Availability for the booking calendar: the time held by approved bookings
   and by the blocks staff add in the admin. Only the intervals leave here,
   never names or references. Pending requests hold nothing until approved.
   Without a database the page falls back to sample data (preview mode). */

interface Payload { live: boolean; configured: boolean; busy: Busy[] }

export default defineEventHandler(async (event): Promise<Payload> => {
  setHeader(event, 'Cache-Control', 'no-store')
  const db = useDb(event)
  if (!db) return { live: false, configured: false, busy: [] }
  try {
    // from yesterday: a booking that started then may run past midnight into today
    const busy = await readBusy(db, studioToday(Date.now() - 86_400_000))
    return { live: true, configured: true, busy: busy.map(({ s, e }) => ({ s, e })) }
  } catch (e) {
    console.error('availability read failed', e instanceof Error ? e.message : e)
    // configured but unreadable: every date shows open with a notice, the studio confirms by hand
    return { live: false, configured: true, busy: [] }
  }
})
