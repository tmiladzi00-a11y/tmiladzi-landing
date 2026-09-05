/* Every style the first paint needs is inlined in the HTML (features.inlineStyles).
   The single bundled stylesheet exists for client-side navigation, so it can load
   without blocking render. Rewrite its <link> into a preload that promotes
   itself, with a <noscript> copy for browsers without scripting. */
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
