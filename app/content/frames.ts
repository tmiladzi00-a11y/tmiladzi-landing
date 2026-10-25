import type { RecentFrame } from './types'

/* "Recent frames" on the home page: photographs from recent jobs, in the
   order they scroll. Several may come from one job; each borrows its
   caption (title, year, kind, place, sector tag) from that job in
   projects.ts, so the job must be cleared for its client to be named.
   A frame's own `caption` replaces the job's title, year and details.
   Files are in public/frames/, prepared at ~2000px and JPEG quality 80
   with camera metadata removed. */
export const RECENT_FRAMES: RecentFrame[] = [
  { project: 'mingomba-exploration', src: '/frames/mingomba-underground.jpg',
    alt: 'A group in hard hats and cap lamps walking through an underground tunnel, crew in blue overalls in the foreground' },
  { project: 'novatek-production', src: '/frames/novatek-warehouse.jpg',
    alt: 'A smiling Novatek warehouse worker with a clipboard giving a thumbs-up beside stacked 50kg feed bags' },
  { project: 'barloworld-programme', src: '/frames/barloworld-kitwe-dusk.jpg',
    alt: 'Barloworld Equipment’s Kitwe branch at dusk, the lit Cat sign against an orange sky' },
  { project: 'impact-documentary', src: '/frames/impact-clinic.jpg',
    alt: 'Two health workers in hair nets and gloves carrying out a procedure in a clinic room' },
  { project: 'novatek-production', src: '/frames/novatek-bagging-line.jpg',
    alt: 'A Novatek worker in a hair net laughing on the bagging line behind a filled Broiler Grower sack' },
  { project: 'mingomba-exploration', src: '/frames/mingomba-briefing.jpg', caption: 'Board room',
    alt: 'A KoBold Metals geologist presenting to visitors in high-visibility vests around a boardroom table' },
  { project: 'novatek-production', src: '/frames/novatek-feedlot.jpg', caption: 'Standing orders',
    alt: 'A smiling woman in a Novatek and Zambeef shirt, arms folded, at a cattle feedlot' },
]
