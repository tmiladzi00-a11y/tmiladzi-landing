// Prints metric-matched fallback @font-face rules so the swap from the
// system fallback to the web font does not shift layout.
// node scripts/font-fallbacks.mjs   (paste the output into fonts.css)
import { readFileSync } from 'node:fs'
import { fromBuffer } from '@capsizecss/unpack'
import { createFontStack } from '@capsizecss/core'
import georgia from '@capsizecss/metrics/georgia'
import arial from '@capsizecss/metrics/arial'

const archivo = await fromBuffer(readFileSync('public/fonts/archivo-latin-full-normal.woff2'))
const newsreader = await fromBuffer(readFileSync('public/fonts/newsreader-latin-full-normal.woff2'))

for (const [primary, fallback] of [[archivo, arial], [newsreader, georgia]]) {
  const { fontFamily, fontFaces } = createFontStack([primary, fallback])
  console.log('/* ' + fontFamily + ' */')
  console.log(fontFaces)
}
