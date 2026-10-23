/* Every /api/admin request: signed in through Access, never cached, and
   writes only from this site's own pages (a form on another site cannot
   ride the admin's Access cookie). */
export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/admin')) return
  setHeader(event, 'Cache-Control', 'no-store')
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    const origin = getHeader(event, 'origin')
    let sameSite = false
    try { sameSite = !!origin && new URL(origin).host === getRequestHost(event, { xForwardedHost: true }) } catch {}
    if (!sameSite) throw createError({ statusCode: 403, statusMessage: 'Cross-site request refused' })
  }
  event.context.admin = await requireAdmin(event)
})
