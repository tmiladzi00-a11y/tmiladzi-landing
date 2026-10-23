// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  modules: ['@nuxt/image', '@vueuse/nuxt'],
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/fonts.css',
    '~/assets/css/base.css',
  ],
  typescript: { strict: true, typeCheck: false },
  // Component styles ride inside the HTML: one fewer render-blocking
  // round trip per component on a slow link.
  features: { inlineStyles: true },
  runtimeConfig: {
    // Server-only. Set as environment variables on the Cloudflare Pages
    // project (NUXT_RESEND_API_KEY, NUXT_MAIL_TO, NUXT_MAIL_FROM). Without a
    // key the send endpoint answers "not configured" and the forms fall back
    // to copy-and-WhatsApp, exactly as before.
    resendApiKey: '',
    mailTo: 'tmiladzi@gmail.com',
    mailFrom: 'Tmiladzi site <site@tmiladzi.com>',
    // Private iCal address of the studio's bookings calendar
    // (NUXT_CALENDAR_ICS_URL). The booking page reads live availability from
    // it; blank means preview mode on sample data.
    calendarIcsUrl: '',
    // Cloudflare Zero Trust Access in front of /admin. The studio's team and
    // AUD are built into server/utils/access.ts; NUXT_ACCESS_TEAM_DOMAIN and
    // NUXT_ACCESS_AUD override them. Local dev signs in as dev@localhost.
    accessTeamDomain: '',
    accessAud: '',
    public: {
      // Optional Google Apps Script /exec URL for booking submissions. Empty
      // means requests go through the site's own /api/send.
      bookingApi: '',
      siteUrl: 'https://tmiladzi.com',
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'index, follow, noai, noimageai' },
        { name: 'theme-color', content: '#0B0F0D' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Tmiladzi Media' },
      ],
      link: [
        { rel: 'preload', href: '/fonts/archivo-latin-full-normal.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'preload', href: '/fonts/ibm-plex-mono-latin-400-normal.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'preload', href: '/fonts/ibm-plex-mono-latin-500-normal.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'preload', href: '/fonts/newsreader-latin-full-normal.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      ],
    },
  },
  image: { quality: 82, format: ['webp'] },
  // CSS stays split per chunk. With everything bundled into one file Nuxt
  // drops the stylesheet link (it believes the inlined styles cover it), and
  // pages reached by client-side navigation then arrive unstyled until a
  // refresh. Split files are what the router loads on navigation; the
  // initial page's styles are inlined and the async-css plugin keeps the
  // duplicate links off the critical path.
  // Cloudflare Pages: every page is prerendered to static HTML at build time
  // and served as files; the small worker that ships alongside handles
  // /api/* (form delivery) and anything not prerendered. Nitro writes the
  // wrangler.json and enables Node compatibility itself.
  // The booking and packages pages read prices from the CMS (/api/catalog), so
  // they render per request instead of at build time. The admin is a
  // client-side app behind Cloudflare Access and is never indexed.
  routeRules: {
    '/booking': { prerender: false },
    '/celebrations': { prerender: false },
    '/admin/**': { ssr: false, prerender: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },
  nitro: {
    preset: 'cloudflare-pages',
    // dev.configPath: local D1 for the CMS; kept out of the deploy config (see the file).
    cloudflare: { deployConfig: true, nodeCompat: true, dev: { configPath: 'wrangler.dev.jsonc' } },
    // Flat files (work.html, not work/index.html): Cloudflare Pages then serves
    // /work as-is instead of redirecting to /work/, which kept the client
    // router's path from matching the server's and broke same-page navigation.
    prerender: { crawlLinks: true, routes: ['/', '/sitemap.xml'], ignore: ['/api'], autoSubfolderIndex: false },
  },
  experimental: { defaults: { nuxtLink: { prefetch: true } }, viewTransition: true },
})
