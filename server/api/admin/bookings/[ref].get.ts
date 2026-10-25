import { clashes, studioToday } from '../../../../app/utils/booking'

/* One booking, with whatever already holds time at its slot (itself excluded). */
export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const booking = await getBooking(db, getRouterParam(event, 'ref')!)
  if (!booking) throw createError({ statusCode: 404, statusMessage: 'No such booking' })
  const busy = (await readBusy(db, studioToday(Date.now() - 86_400_000))).filter((x) => x.key !== booking.ref)
  const hours = booking.approvedHours ?? booking.requestedHours
  return { booking, clashes: clashes(busy, booking.date, booking.start, hours).map((x) => x.label) }
})
