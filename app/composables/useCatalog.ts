import type { Catalog } from '~/content/types'
import { SERVICES, BOOKING_DEFAULTS } from '~/content/services'

/* Packages and booking settings from the CMS (/api/catalog). Rendered on the
   server, so prices are in the HTML. Should the request fail outright, the
   page still has the built-in catalogue rather than nothing. */
export function useCatalog() {
  return useFetch<Catalog>('/api/catalog', {
    key: 'catalog',
    default: (): Catalog => ({ source: 'static', services: SERVICES, settings: BOOKING_DEFAULTS }),
  })
}
