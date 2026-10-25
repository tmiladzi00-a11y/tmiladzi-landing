/* The admin calendar's entries between two dates (a month view is at most
   six weeks): confirmed and waiting bookings, and blocked time. */
const DATE = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const { from, to } = getQuery(event)
  if (typeof from !== 'string' || typeof to !== 'string' || !DATE.test(from) || !DATE.test(to) || to < from) {
    throw createError({ statusCode: 400, statusMessage: 'from and to must be dates, from first' })
  }
  if (Date.parse(to) - Date.parse(from) > 62 * 86_400_000) throw createError({ statusCode: 400, statusMessage: 'At most 62 days at a time' })
  return calendarEntries(db, from, to)
})
