import type { H3Event } from 'h3'
import { createRemoteJWKSet, jwtVerify } from 'jose'

/* Admin sign-in is Cloudflare Zero Trust Access. An Access application on
   /admin* and /api/admin* puts its login (email one-time code, Google, ...)
   in front of those paths before a request reaches this worker. Access then
   attaches a signed JWT, and this checks it as well: a request that found a
   way round Access (a pages.dev preview URL, a misconfigured policy) still
   carries no valid token and is refused.

   The studio's Access application is built in below. Neither value is a
   secret (Cloudflare puts both in every sign-in token), and shipping them
   with the code means they cannot go missing from a deployment: dashboard
   variables were being dropped because the build deploys its own wrangler
   config. NUXT_ACCESS_TEAM_DOMAIN and NUXT_ACCESS_AUD still override them,
   e.g. for a different Access team.

   Local dev ignores the built-in values and signs everyone in as
   dev@localhost. A deployment with no values refuses every admin request
   (fails closed). */
const ACCESS_TEAM_DOMAIN = 'crimson-surf-accf.cloudflareaccess.com'
const ACCESS_AUD = '788eaeb7adb305289c2cda78f0c042861d655e8a132c4ca073e063dcffb23864'

export interface AdminIdentity { email: string }

declare module 'h3' {
  interface H3EventContext { admin?: AdminIdentity }
}

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export async function requireAdmin(event: H3Event): Promise<AdminIdentity> {
  const cfEnv = (event.context as { cloudflare?: { env?: Record<string, string> } }).cloudflare?.env || {}
  const config = useRuntimeConfig(event)
  const team = String(config.accessTeamDomain || cfEnv.NUXT_ACCESS_TEAM_DOMAIN || (import.meta.dev ? '' : ACCESS_TEAM_DOMAIN))
    .replace(/^https?:\/\//, '').replace(/\/+$/, '')
  const aud = String(config.accessAud || cfEnv.NUXT_ACCESS_AUD || (import.meta.dev ? '' : ACCESS_AUD))

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
