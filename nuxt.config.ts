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
    public: {
      // Google Apps Script /exec URL. Empty means preview mode: sample
      // availability, a visible notice, and the WhatsApp fallback.
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
  nitro: {
    preset: 'cloudflare-pages',
    cloudflare: { deployConfig: true, nodeCompat: true },
    // Flat files (work.html, not work/index.html): Cloudflare Pages then serves
    // /work as-is instead of redirecting to /work/, which kept the client
    // router's path from matching the server's and broke same-page navigation.
    prerender: { crawlLinks: true, routes: ['/', '/sitemap.xml'], ignore: ['/api'], autoSubfolderIndex: false },
  },
  experimental: { defaults: { nuxtLink: { prefetch: true } }, viewTransition: true },
})
