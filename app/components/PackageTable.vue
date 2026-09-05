<script setup lang="ts">
import type { Service } from '~/content/types'
import { fmtMoney } from '~/utils/money'
/* The three packages side by side, driven by the same data the booking
   engine prices from, so the marketing page can never disagree with the
   quote. */
const props = defineProps<{ services: Service[] }>()

const ADDON_LABELS: Record<string, string> = {
  time: 'Additional time', prewed: 'Pre-wedding photoshoot', second: 'Extra photographer', reel: 'Reel',
  highlight: 'Highlight video', express: 'Faster delivery', photo: 'Additional photo', raws: 'All unedited photos',
}
const addonRows = computed(() => {
  const ids: string[] = []
  for (const s of props.services) for (const a of s.addons) if (!ids.includes(a.id)) ids.push(a.id)
  return ids.map((id) => ({
    id, label: ADDON_LABELS[id] || id,
    cells: props.services.map((s) => {
      const a = s.addons.find((x) => x.id === id)
      if (!a) return { text: '—', empty: true }
      if (a.price == null) return { text: 'On request', empty: false }
      return { text: 'K' + fmtMoney(a.price) + (a.unit ? ' / ' + a.unit : ''), empty: false, name: a.name !== ADDON_LABELS[id] ? a.name : undefined }
    }),
  }))
})
const delivery = (s: Service) => s.deliveryUnit === 'weeks' ? `${s.delivery} weeks` : `${s.delivery} hours`
</script>

<template>
  <div class="pt">
    <div class="tablewrap">
      <table class="pkg">
        <caption class="sr-only">The three packages compared</caption>
        <thead>
          <tr>
            <th scope="col" class="pkg__rowhead"><span class="sr-only">Package</span></th>
            <th v-for="s in services" :key="s.id" scope="col" class="pkg__head">
              <span class="pkg__tag">{{ s.tag }}</span>
              <span class="pkg__name">{{ s.name }}</span>
              <span class="pkg__price"><b class="num">{{ s.price == null ? 'On request' : fmtMoney(s.price) }}</b><span v-if="s.price != null">ZMW · {{ s.cov }}</span></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">Coverage</th><td v-for="s in services" :key="s.id">{{ s.cov }}</td></tr>
          <tr><th scope="row">Delivery</th><td v-for="s in services" :key="s.id">{{ delivery(s) }} as standard</td></tr>
          <tr><th scope="row">What you get</th><td v-for="s in services" :key="s.id"><TickList tone="cop" :items="s.includes" class="pkg__list" /></td></tr>
          <tr><th scope="row">Worth knowing</th><td v-for="s in services" :key="s.id"><TickList tone="cop" :items="s.notes" class="pkg__list" /></td></tr>
          <tr><th scope="row">Deposit</th><td v-for="s in services" :key="s.id">{{ Math.round(s.dep * 100) }}%, holds the date</td></tr>
        </tbody>
      </table>
    </div>

    <h3 class="h4 pt__h">Optional add-ons, priced openly</h3>
    <div class="tablewrap">
      <table class="pkg pkg--addons">
        <caption class="sr-only">Add-on prices by package</caption>
        <thead>
          <tr><th scope="col" class="pkg__rowhead"><span class="sr-only">Add-on</span></th><th v-for="s in services" :key="s.id" scope="col" class="pkg__mini">{{ s.name }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in addonRows" :key="r.id">
            <th scope="row">{{ r.label }}</th>
            <td v-for="(c, i) in r.cells" :key="i" :class="{ 'pkg__empty': c.empty }">{{ c.text }}<span v-if="c.name" class="pkg__alias">{{ c.name }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.pt { display: grid; gap: var(--tm-sys-space-4); }
.pt__h { margin: var(--tm-sys-space-6) 0 0; }
.pkg { width: 100%; border-collapse: collapse; font-size: 14.5px; min-width: 640px; }
.pkg th, .pkg td { text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--tm-sys-color-outline-variant); vertical-align: top; }
.pkg tr:last-child th, .pkg tr:last-child td { border-bottom: 0; }
.pkg tbody th { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); font-weight: 400; width: 18%; padding-top: 18px; }
.pkg td { color: var(--tm-sys-color-on-surface-variant); }
.pkg__head { vertical-align: bottom; border-bottom: 1px solid var(--tm-sys-color-outline) !important; }
.pkg__tag { display: block; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.pkg__name { display: block; font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-display-h3-axes); font-size: 20px; letter-spacing: -.01em; margin: 8px 0 10px; color: var(--tm-sys-color-on-surface); }
.pkg__price { display: flex; align-items: baseline; gap: 8px; }
.pkg__price b { font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes); font-size: 26px; letter-spacing: -.02em; color: var(--tm-sys-color-on-surface); }
.pkg__price span { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.pkg__list { margin: 0; }
.pkg__list :deep(li) { margin-bottom: 6px; }
.pkg--addons td { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-md); color: var(--tm-sys-color-on-surface); }
.pkg--addons tbody th { text-transform: none; letter-spacing: .02em; font-size: 13px; color: var(--tm-sys-color-on-surface); width: 28%; padding-top: 14px; }
.pkg__mini { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); font-weight: 400; }
.pkg__empty { color: var(--tm-sys-color-on-surface-faint); }
.pkg__alias { display: block; font-size: 10.5px; color: var(--tm-sys-color-on-surface-faint); margin-top: 3px; letter-spacing: .04em; }
</style>
