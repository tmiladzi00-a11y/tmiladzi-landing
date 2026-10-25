import { studioToday } from '../../../../app/utils/booking'

/* Take time off the calendar by hand: a booking made by phone, a day off.
   { date, start, end, reason } with end '24:00' for the rest of the day. */
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const b = await readBody<Record<string, unknown>>(event).catch(() => null) ?? {}
  const date = String(b.date ?? '')
  const start = String(b.start ?? '')
  const end = String(b.end ?? '')
  const errors: Record<string, string> = {}
  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) errors.date = 'Choose a date'
  else if (date < studioToday()) errors.date = 'That date has passed'
  if (!TIME.test(start)) errors.start = 'e.g. 09:00'
  if (end !== '24:00' && !TIME.test(end)) errors.end = 'e.g. 17:00'
  else if (!errors.start && end <= start) errors.end = 'Must be after the start'
  if (Object.keys(errors).length) throw createError({ statusCode: 422, statusMessage: 'Check the highlighted fields', data: errors })
  const reason = typeof b.reason === 'string' ? b.reason.trim().slice(0, 200) : ''
  await db.prepare('INSERT INTO blocks (date, start, end, reason, created_by) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(date, start, end, reason, event.context.admin!.email).run()
  setResponseStatus(event, 201)
  return listBlocks(db, studioToday())
})
