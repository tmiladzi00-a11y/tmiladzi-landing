import type { ClientGroup } from './types'

/* Grouped by sector rather than listed flat: a procurement reader is
   scanning for their own sector, not admiring a wall of names.

   A client with a `logo` renders its mark; one without renders its name in
   the display face. Every logo here is a client's trademark: show it only
   where that client has agreed to appear. Files live in public/logos.
   `w`/`h` are the file's intrinsic pixels, so the layout is reserved
   before the image arrives; `height` is the rendered size, tuned by eye so
   a heavy wordmark and a small seal carry the same weight. */
export const CLIENTS: ClientGroup[] = [
  { sector: 'Mining & energy', names: [
    { name: 'KoBold Metals', logo: '/logos/kobold-metals.svg', w: 1062, h: 209, height: 26 },
    { name: 'Mingomba Mining' },
    { name: 'Barloworld Zambia', logo: '/logos/barloworld.png', w: 228, h: 53, height: 26 },
    { name: 'Caterpillar', logo: '/logos/caterpillar.svg', w: 112, h: 20, height: 18 },
    { name: 'ZIMEC', logo: '/logos/zimec.png', w: 260, h: 135, height: 38 },
  ] },
  { sector: 'Banking & finance', names: [
    { name: 'Stanbic Bank', logo: '/logos/stanbic.svg', w: 195, h: 53, height: 30, mode: 'tone' },
    { name: 'Standard Chartered', logo: '/logos/standard-chartered.svg', w: 280, h: 110, height: 30 },
    { name: 'FNB', logo: '/logos/fnb.svg', w: 406, h: 226, height: 36, mode: 'tone' },
  ] },
  { sector: 'Development & climate', names: [
    { name: 'USAID', years: '2022 – 2023', logo: '/logos/usaid.png', w: 320, h: 96, height: 26 },
    { name: 'Dialogue Earth', logo: '/logos/dialogue-earth.svg', w: 200, h: 32, height: 16 },
  ] },
  { sector: 'Government & infrastructure', names: [
    { name: 'Office of the President', logo: '/logos/zambia-coat-of-arms.png', w: 100, h: 116, height: 46 },
    { name: 'Zambia Airports', logo: '/logos/zambia-airports.png', w: 151, h: 72, height: 38 },
  ] },
  { sector: 'Agribusiness', names: [
    { name: 'Zambeef', logo: '/logos/zambeef.png', w: 174, h: 124, height: 46 },
    { name: 'Novatek', logo: '/logos/novatek.png', w: 520, h: 190, height: 32 },
  ] },
]
