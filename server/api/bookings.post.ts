import { checkBookingRequest, newRef, studioToday } from '../../app/utils/booking'

/* A booking request from the wizard. It is checked and priced here from the
   catalogue (the browser's total is never used), stored as pending with
   everything the client entered; the studio is emailed and the client gets a
   receipt with their reference and the deposit details. It holds no time
   until a member of staff approves it in the admin. Without a database this
   answers 503 not-configured and the wizard falls back to sending the request
   by email. */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (body?.website) return { ok: true, ref: newRef() } // a bot filled the honeypot: thank it and keep nothing

  const db = useDb(event)
  if (!db) {
    setResponseStatus(event, 503)
    return { ok: false, reason: 'not-configured' }
  }

  const [catalog, busy] = await Promise.all([loadCatalog(db), readBusy(db, studioToday(Date.now() - 86_400_000))])
  const checked = checkBookingRequest(body, catalog, busy)
  if (!checked.ok) {
    const first = Object.values(checked.errors)[0]
    throw createError({ statusCode: checked.errors.start ? 409 : 422, statusMessage: first, data: checked.errors })
  }

  // references are random; on the rare collision, draw again
  let ref = ''
  for (let i = 0; i < 5 && !ref; i++) {
    const candidate = newRef()
    try {
      await insertBooking(db, candidate, checked.value)
      ref = candidate
    } catch (e) {
      if (i === 4 || !/unique|constraint/i.test(String(e))) throw e
    }
  }

  const booking = (await getBooking(db, ref))!
  // the request is already stored: a failed email must not fail the booking
  const studio = studioNewBookingMail(booking, `${getRequestURL(event).origin}/admin/bookings/${ref}`)
  const receipt = clientReceivedMail(booking)
  const [, sent] = await Promise.all([
    sendMail(event, { ...studio, replyTo: booking.email, tag: 'booking' }),
    sendMail(event, { ...receipt, to: booking.email, replyTo: studioAddress(event), tag: 'booking-received' }),
  ])

  const q = checked.value.quote
  return { ok: true, ref, total: q.total, deposit: q.deposit, depositPct: q.depositPct, tbq: q.tbc, emailed: sent.sent }
})
