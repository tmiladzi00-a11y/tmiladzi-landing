import type { Catalog } from '../../app/content/types'

/* What the booking page renders from: published packages and the booking
   settings from the CMS, or the built-in catalogue (see loadCatalog). */
export default defineEventHandler(async (event): Promise<Catalog> => {
  setHeader(event, 'Cache-Control', 'no-store')
  return loadCatalog(useDb(event))
})
