/* Delivers a brief or a booking request to the studio inbox.
   Runs at the edge on Cloudflare Pages. Uses Resend's HTTP API because a
   Worker has no SMTP; any provider with a JSON endpoint would slot in here.
   Without an API key it answers ok:false, reason:'not-configured' and the
   client keeps its copy-and-WhatsApp fallback. */
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

  const cfEnv = (event.context as { cloudflare?: { env?: Record<string, string> } }).cloudflare?.env || {}
  const config = useRuntimeConfig(event)
  const apiKey = config.resendApiKey || cfEnv.NUXT_RESEND_API_KEY || ''
  const to = config.mailTo || cfEnv.NUXT_MAIL_TO || 'tmiladzi@gmail.com'
  const from = config.mailFrom || cfEnv.NUXT_MAIL_FROM || 'Tmiladzi site <site@tmiladzi.com>'
  if (!apiKey) return { ok: false, sent: false, reason: 'not-configured' }

  const replyTo = body.replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.replyTo) ? body.replyTo : undefined
  const subject = (body.subject || (body.kind === 'brief' ? 'Project brief' : 'Booking request')).slice(0, 140)

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from, to: [to], subject, text: body.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
        headers: { 'X-Entity-Ref-ID': `${body.kind}-${Date.now()}` },
      }),
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      console.error('resend failed', r.status, detail.slice(0, 300))
      setResponseStatus(event, 502)
      return { ok: false, sent: false, reason: 'provider-error' }
    }
    return { ok: true, sent: true }
  } catch (e) {
    console.error('send error', e)
    setResponseStatus(event, 502)
    return { ok: false, sent: false, reason: 'network' }
  }
})
