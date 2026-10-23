// https://nuxt.com/docs/api/configuration/nuxt-config

/** Production CMS database id from the pipeline; trimmed, since a pasted value often carries a newline. */
const d1DatabaseId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim()
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
    // Cloudflare Zero Trust Access in front of /admin (server/utils/access.ts).
    // Read at build time: the deploy workflow passes the repo variables
    // NUXT_ACCESS_TEAM_DOMAIN and NUXT_ACCESS_AUD in, because Pages drops
    // plain dashboard variables when the build ships its own wrangler config.
    // Dashboard secrets of the same names still override at runtime. Leave
    // them out of .env and local dev signs in as dev@localhost.
    accessTeamDomain: process.env.NUXT_ACCESS_TEAM_DOMAIN || '',
    accessAud: process.env.NUXT_ACCESS_AUD || '',
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
    // The CMS database (D1) is bound only when the pipeline supplies its id
    // (repo variable CLOUDFLARE_D1_DATABASE_ID); without it the site serves
    // the built-in catalogue. Must match the database the deploy workflow migrates.
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      dev: { configPath: 'wrangler.dev.jsonc' },
      wrangler: d1DatabaseId
        ? { d1_databases: [{ binding: 'DB', database_name: 'tmiladzi-cms', database_id: d1DatabaseId }] }
        : {},
    },
    // Flat files (work.html, not work/index.html): Cloudflare Pages then serves
    // /work as-is instead of redirecting to /work/, which kept the client
    // router's path from matching the server's and broke same-page navigation.
    prerender: { crawlLinks: true, routes: ['/', '/sitemap.xml'], ignore: ['/api'], autoSubfolderIndex: false },
  },
  experimental: { defaults: { nuxtLink: { prefetch: true } }, viewTransition: true },
})
