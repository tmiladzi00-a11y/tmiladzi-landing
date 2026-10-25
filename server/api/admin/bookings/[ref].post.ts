import { approvalQuote, clashes, studioToday } from '../../../../app/utils/booking'

/* Staff decisions on a booking:
     approve  { start, hours, note?, override? }  holds the time; re-prices extra hours
     decline  { note? }                            a pending request
     cancel   { note? }                            an approved booking; frees the time
     deposit-paid / deposit-unpaid                 records the deposit (no email)
   Approving over something that already holds the time needs override: true.
   The client is emailed either way; the response says whether that worked. */
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const ref = getRouterParam(event, 'ref')!
  const body = await readBody<Record<string, unknown>>(event).catch(() => null) ?? {}
  const booking = await getBooking(db, ref)
  if (!booking) throw createError({ statusCode: 404, statusMessage: 'No such booking' })
  const by = event.context.admin!.email
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : ''

  if (body.action === 'deposit-paid' || body.action === 'deposit-unpaid') {
    if (!await setDepositPaid(db, ref, body.action === 'deposit-paid', by)) {
      throw createError({ statusCode: 409, statusMessage: 'Only an accepted booking has a deposit to record' })
    }
    return { booking: (await getBooking(db, ref))!, mailed: false }
  }

  if (body.action === 'approve') {
    if (booking.status !== 'pending') throw createError({ statusCode: 409, statusMessage: `This booking is already ${booking.status}` })
    const start = typeof body.start === 'string' && TIME.test(body.start) ? body.start : null
    const hours = Number(body.hours)
    const errors: Record<string, string> = {}
    if (!start) errors.start = 'A start time, e.g. 09:00'
    if (!Number.isInteger(hours) || hours < 1 || hours > 24) errors.hours = 'Whole hours, 1 to 24'
    if (Object.keys(errors).length) throw createError({ statusCode: 422, statusMessage: 'Check the highlighted fields', data: errors })
    const busy = (await readBusy(db, studioToday(Date.now() - 86_400_000))).filter((x) => x.key !== ref)
    const hit = clashes(busy, booking.date, start!, hours).map((x) => x.label)
    if (hit.length && body.override !== true) {
      throw createError({ statusCode: 409, statusMessage: 'This overlaps time that is already taken', data: { clashes: hit } })
    }
    const priced = approvalQuote(booking.package, booking.addons, hours)
    const ok = await decideBooking(db, ref, {
      status: 'approved', by, note, start: start!, approvedHours: hours,
      addons: priced.addons, total: priced.quote.total, deposit: priced.quote.deposit, tbq: priced.quote.tbc,
    })
    if (!ok) throw createError({ statusCode: 409, statusMessage: 'Someone else has just decided this booking' })
  } else if (body.action === 'decline' || body.action === 'cancel') {
    const status = body.action === 'decline' ? 'declined' : 'cancelled'
    const ok = await decideBooking(db, ref, { status, by, note })
    if (!ok) throw createError({ statusCode: 409, statusMessage: `Only a ${status === 'declined' ? 'pending' : 'approved'} booking can be ${status}` })
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
  }

  const updated = (await getBooking(db, ref))!
  const mail = updated.status === 'approved' ? clientApprovedMail(updated) : clientClosedMail(updated)
  const sent = await sendMail(event, { ...mail, to: updated.email, replyTo: studioAddress(event), tag: `booking-${updated.status}` })
  return { booking: updated, mailed: sent.sent }
})
