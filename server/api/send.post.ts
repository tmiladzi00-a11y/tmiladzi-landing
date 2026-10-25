/* Delivers a brief (or, with no CMS database, a booking request) to the
   studio inbox. Without an API key it answers ok:false, reason:'not-configured'
   and the client keeps its copy-and-WhatsApp fallback. */
interface SendBody {
  kind: 'brief' | 'booking'
  subject?: string
  text: string
  replyTo?: string
  name?: string
  /** Honeypot: real browsers leave this empty. */
  website?: string
}

const MAX_TEXT = 12_000

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<SendBody>>(event).catch(() => null)
  if (!body || (body.kind !== 'brief' && body.kind !== 'booking') || typeof body.text !== 'string') {
    setResponseStatus(event, 400)
    return { ok: false, reason: 'bad-request' }
  }
  if (body.website) return { ok: true, sent: false, reason: 'ignored' } // bot filled the honeypot
  if (body.text.length > MAX_TEXT) { setResponseStatus(event, 413); return { ok: false, reason: 'too-long' } }

  const subject = body.subject || (body.kind === 'brief' ? 'Project brief' : 'Booking request')
  const r = await sendMail(event, {
    subject, text: body.text, html: formMail(body.kind, subject, body.text), replyTo: body.replyTo, tag: body.kind,
  })
  if (r.sent) return { ok: true, sent: true }
  if (r.reason !== 'not-configured') setResponseStatus(event, 502)
  return { ok: false, sent: false, reason: r.reason }
})
