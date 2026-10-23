import type { H3Event } from 'h3'
import { createRemoteJWKSet, jwtVerify } from 'jose'

/* Admin sign-in is Cloudflare Zero Trust Access. An Access application on
   /admin* and /api/admin* puts its login (email one-time code, Google, ...)
   in front of those paths before a request reaches this worker. Access then
   attaches a signed JWT, and this checks it as well: a request that found a
   way round Access (a pages.dev preview URL, a misconfigured policy) still
   carries no valid token and is refused.

   NUXT_ACCESS_TEAM_DOMAIN  e.g. tmiladzi.cloudflareaccess.com
   NUXT_ACCESS_AUD          the Access application's "Application Audience (AUD) Tag"

   Set as GitHub repo variables and passed in at build (see nuxt.config.ts),
   or as Cloudflare Pages secrets, read here at runtime.

   Without both: local dev signs everyone in as dev@localhost; a deployment
   refuses every admin request (fails closed). */

export interface AdminIdentity { email: string }

declare module 'h3' {
  interface H3EventContext { admin?: AdminIdentity }
}

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export async function requireAdmin(event: H3Event): Promise<AdminIdentity> {
  const cfEnv = (event.context as { cloudflare?: { env?: Record<string, string> } }).cloudflare?.env || {}
  const config = useRuntimeConfig(event)
  // runtime secrets first, so a dashboard value can replace what the build carried
  const team = String(cfEnv.NUXT_ACCESS_TEAM_DOMAIN || config.accessTeamDomain || '').trim()
    .replace(/^https?:\/\//, '').replace(/\/+$/, '')
  const aud = String(cfEnv.NUXT_ACCESS_AUD || config.accessAud || '').trim()

  if (!team || !aud) {
    if (import.meta.dev) return { email: 'dev@localhost' }
    throw createError({ statusCode: 503, statusMessage: 'Admin sign-in is not configured' })
  }

  const token = getHeader(event, 'cf-access-jwt-assertion') || getCookie(event, 'CF_Authorization')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Sign in through Cloudflare Access' })

  let keys = keySets.get(team)
  if (!keys) {
    keys = createRemoteJWKSet(new URL(`https://${team}/cdn-cgi/access/certs`))
    keySets.set(team, keys)
  }
  try {
    const { payload } = await jwtVerify(token, keys, { issuer: `https://${team}`, audience: aud })
    if (typeof payload.email !== 'string' || !payload.email) throw new Error('token has no email')
    return { email: payload.email }
  } catch (e) {
    console.error('access token rejected', e instanceof Error ? e.message : e)
    throw createError({ statusCode: 403, statusMessage: 'Access token rejected' })
  }
}
