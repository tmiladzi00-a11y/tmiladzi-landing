import { PROJECTS } from '~/content/projects'

/* Prerendered at build time. Static routes plus one entry per case study.
   robots.txt points here. */
const STATIC: [path: string, priority: string][] = [
  ['/', '1.0'], ['/work', '0.9'], ['/films', '0.8'], ['/capabilities', '0.8'], ['/studio', '0.7'],
  ['/celebrations', '0.8'], ['/booking', '0.7'], ['/brief', '0.8'], ['/contact', '0.6'],
  ['/terms', '0.3'], ['/privacy', '0.3'], ['/commercial', '0.3'], ['/copyright', '0.3'],
]

export default defineEventHandler((event) => {
  const base = (useRuntimeConfig(event).public.siteUrl as string || 'https://tmiladzi.com').replace(/\/$/, '')
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    ...STATIC.map(([p, pr]) => ({ loc: base + p, priority: pr })),
    ...PROJECTS.map((p) => ({ loc: `${base}/work/${p.id}`, priority: '0.7' })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
