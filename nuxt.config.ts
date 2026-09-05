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
  // One stylesheet, not one per shared component: a single render-blocking
  // round trip on a slow link instead of ten.
  vite: { build: { cssCodeSplit: false } },
  nitro: { prerender: { crawlLinks: true, routes: ['/'] } },
  experimental: { defaults: { nuxtLink: { prefetch: true } }, viewTransition: true },
})
