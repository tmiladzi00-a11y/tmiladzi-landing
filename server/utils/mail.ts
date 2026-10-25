import type { H3Event } from 'h3'

/* Email through Resend's HTTP API (a Worker has no SMTP). Without
   NUXT_RESEND_API_KEY nothing is sent and the caller is told so; every
   caller has a fallback, so mail is never the only record of anything. */

export interface Mail {
  /** Defaults to the studio inbox (NUXT_MAIL_TO). */
  to?: string
  subject: string
  /** Plain text: always sent, for clients that do not show HTML and for spam scoring. */
  text: string
  /** The branded version (server/utils/emailLayout.ts). */
  html?: string
  replyTo?: string
  /** For the X-Entity-Ref-ID header, so threads do not merge in the inbox. */
  tag: string
}
export type MailResult =
  | { sent: true }
  /** detail: Resend's own explanation, e.g. "The tmiladzi.com domain is not verified" */
  | { sent: false; reason: 'not-configured' | 'provider-error' | 'network'; detail?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendMail(event: H3Event, m: Mail): Promise<MailResult> {
  const cfEnv = (event.context as { cloudflare?: { env?: Record<string, string> } }).cloudflare?.env || {}
  const config = useRuntimeConfig(event)
  const apiKey = config.resendApiKey || cfEnv.NUXT_RESEND_API_KEY || ''
  const studio = config.mailTo || cfEnv.NUXT_MAIL_TO || 'tmiladzi00@gmail.com'
  const from = config.mailFrom || cfEnv.NUXT_MAIL_FROM || 'Tmiladzi site <site@tmiladzi.com>'
  if (!apiKey) {
    // one line in the Pages log stream, so a silent "no email" has a visible cause
    console.warn(`mail not sent (${m.tag}): NUXT_RESEND_API_KEY is not set on this deployment`)
    return { sent: false, reason: 'not-configured' }
  }

  const replyTo = m.replyTo && EMAIL.test(m.replyTo) ? m.replyTo : undefined
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from, to: [m.to || studio], subject: m.subject.slice(0, 140), text: m.text,
        ...(m.html ? { html: m.html } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        headers: { 'X-Entity-Ref-ID': `${m.tag}-${Date.now()}` },
      }),
    })
    if (!r.ok) {
      const body = (await r.text().catch(() => '')).slice(0, 300)
      console.error('resend failed', r.status, body)
      let detail = `Resend answered ${r.status}`
      try { detail = (JSON.parse(body) as { message?: string }).message || detail } catch {}
      return { sent: false, reason: 'provider-error', detail }
    }
    return { sent: true }
  } catch (e) {
    console.error('mail error', e instanceof Error ? e.message : e)
    return { sent: false, reason: 'network', detail: e instanceof Error ? e.message : undefined }
  }
}

/** Studio inbox address, for replies that should come back to the studio. */
export function studioAddress(event: H3Event): string {
  const cfEnv = (event.context as { cloudflare?: { env?: Record<string, string> } }).cloudflare?.env || {}
  return useRuntimeConfig(event).mailTo || cfEnv.NUXT_MAIL_TO || 'tmiladzi00@gmail.com'
}

/** Whether the site has a Resend key at all, for the admin's email check. */
export function mailConfigured(event: H3Event): boolean {
  const cfEnv = (event.context as { cloudflare?: { env?: Record<string, string> } }).cloudflare?.env || {}
  return !!(useRuntimeConfig(event).resendApiKey || cfEnv.NUXT_RESEND_API_KEY)
}
