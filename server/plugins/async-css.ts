/* Every style the first paint needs is inlined in the HTML (features.inlineStyles).
   The per-chunk stylesheets Nuxt still links exist for client-side navigation,
   so they can load without blocking render. Rewrite each <link> into a preload
   that promotes itself, with a <noscript> copy for browsers without scripting.
   Do not bundle CSS into one file (vite cssCodeSplit:false): Nuxt then drops
   the link entirely and pages reached by navigation arrive unstyled. */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html) => {
    html.head = html.head.map((chunk) =>
      chunk.replace(
        /<link rel="stylesheet" href="(\/_nuxt\/[^"]+\.css)"([^>]*)>/g,
        (_m, href, rest) =>
          `<link rel="preload" as="style" href="${href}"${rest} onload="this.onload=null;this.rel='stylesheet'">` +
          `<noscript><link rel="stylesheet" href="${href}"${rest}></noscript>`,
      ),
    )
  })
})
