import type { Catalog } from '../../app/content/types'

/* What the booking and packages pages render from: published packages and
   the booking settings from the CMS, or the built-in catalogue when there is
   no database, it has no published packages yet, or it cannot be read. A
   CMS outage degrades to the shipped prices rather than an empty page. */
export default defineEventHandler(async (event): Promise<Catalog> => {
  setHeader(event, 'Cache-Control', 'no-store')
  const db = useDb(event)
  if (!db) return staticCatalog()
  try {
    const [packages, settings] = await Promise.all([readPackages(db, { publishedOnly: true }), readSettings(db)])
    if (!packages.length) return { ...staticCatalog(), settings }
    const services = packages.map(({ published: _p, sort: _s, updatedAt: _u, updatedBy: _b, ...service }) => service)
    return { source: 'cms', services, settings }
  } catch (e) {
    console.error('catalog read failed', e instanceof Error ? e.message : e)
    return staticCatalog()
  }
})
