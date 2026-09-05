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
const addonPrice = (a: Service['addons'][number]) => a.price == null ? 'On request' : 'K' + fmtMoney(a.price) + (a.unit ? ' / ' + a.unit : '')
const addonRows = computed(() => {
  const ids: string[] = []
  for (const s of props.services) for (const a of s.addons) if (!ids.includes(a.id)) ids.push(a.id)
  return ids.map((id) => ({
    id, label: ADDON_LABELS[id] || id,
    cells: props.services.map((s) => {
      const a = s.addons.find((x) => x.id === id)
      if (!a) return { text: '—', empty: true }
      if (a.price == null) return { text: 'On request', empty: false }
      return { text: addonPrice(a), empty: false, name: a.name !== ADDON_LABELS[id] ? a.name : undefined }
    }),
  }))
})
const delivery = (s: Service) => s.deliveryUnit === 'weeks' ? `${s.delivery} weeks` : `${s.delivery} hours`
</script>

<template>
  <div class="pt">
    <!-- Small screens: one card per package, each self-contained with its add-ons. -->
    <div class="pt__cards">
      <article v-for="s in services" :key="s.id" class="pcard">
        <span class="pkg__tag">{{ s.tag }}</span>
        <h3 class="pkg__name">{{ s.name }}</h3>
        <span class="pkg__price"><b class="num">{{ s.price == null ? 'On request' : fmtMoney(s.price) }}</b><span v-if="s.price != null">ZMW · {{ s.cov }}</span></span>
        <dl class="pcard__facts">
          <div><dt>Coverage</dt><dd>{{ s.cov }}</dd></div>
          <div><dt>Delivery</dt><dd>{{ delivery(s) }} as standard</dd></div>
          <div><dt>Deposit</dt><dd>{{ Math.round(s.dep * 100) }}%, holds the date</dd></div>
        </dl>
        <h4 class="pcard__k">What you get</h4>
        <TickList tone="cop" :items="s.includes" class="pcard__list" />
        <h4 class="pcard__k">Worth knowing</h4>
        <TickList tone="cop" :items="s.notes" class="pcard__list" />
        <h4 class="pcard__k">Optional add-ons</h4>
        <ul class="pcard__addons">
          <li v-for="a in s.addons" :key="a.id"><span>{{ a.name }}</span><span class="mono pcard__addonprice">{{ addonPrice(a) }}</span></li>
        </ul>
      </article>
    </div>

    <div class="tablewrap pt__wide">
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

    <h3 class="h4 pt__h pt__wide">Optional add-ons, priced openly</h3>
    <div class="tablewrap pt__wide">
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
/* Framed like SpecTable. On narrow screens the table scrolls sideways inside
   the frame, with the row labels pinned so a reader always knows which row
   they are looking at. */
.tablewrap {
  overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: var(--tm-sys-color-outline) transparent;
  border: 1px solid var(--tm-sys-elevation-2-line); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg);
}
/* one layout at a time: cards under 700px, the comparison table above */
.pt__wide { display: none; }
.pt__cards { display: grid; gap: var(--tm-sys-space-4); }
@media (min-width: 700px) { .pt__wide { display: block; } .pt__cards { display: none; } }
.pcard { border: 1px solid var(--tm-sys-elevation-2-line); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-5); }
.pcard .pkg__name { margin: 6px 0 10px; }
.pcard__facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--tm-sys-space-3); margin: var(--tm-sys-space-5) 0 0; padding: var(--tm-sys-space-4) 0; border-top: 1px solid var(--tm-sys-color-outline-variant); border-bottom: 1px solid var(--tm-sys-color-outline-variant); }
.pcard__facts dt { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.pcard__facts dd { margin: 4px 0 0; font-size: 14.5px; color: var(--tm-sys-color-on-surface-variant); }
.pcard__k { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); font-weight: 400; margin: var(--tm-sys-space-5) 0 0; }
.pcard__list { margin-top: var(--tm-sys-space-3); }
.pcard__addons { list-style: none; padding: 0; margin: var(--tm-sys-space-3) 0 0; font-size: 14.5px; color: var(--tm-sys-color-on-surface-variant); }
.pcard__addons li { display: flex; justify-content: space-between; gap: var(--tm-sys-space-3); padding: 8px 0; border-top: 1px solid var(--tm-sys-color-outline-variant); }
.pcard__addonprice { flex: none; color: var(--tm-sys-color-on-surface); }
/* fixed layout: the three package columns share the width equally */
.pkg { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 14.5px; min-width: 640px; }
.pkg th, .pkg td { text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--tm-sys-color-outline-variant); vertical-align: top; }
.pkg tr:last-child th, .pkg tr:last-child td { border-bottom: 0; }
.pkg__rowhead, .pkg tbody th { width: 18%; position: sticky; left: 0; z-index: 1; background: var(--tm-sys-elevation-2-bg); box-shadow: 1px 0 0 var(--tm-sys-color-outline-variant); }
.pkg tbody th { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); font-weight: 400; padding-top: 18px; }
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
.pkg--addons .pkg__rowhead, .pkg--addons tbody th { width: 26%; }
.pkg--addons tbody th { text-transform: none; letter-spacing: .02em; font-size: 13px; color: var(--tm-sys-color-on-surface); padding-top: 14px; }
.pkg__mini { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); font-weight: 400; }
.pkg__empty { color: var(--tm-sys-color-on-surface-faint); }
.pkg__alias { display: block; font-size: 10.5px; color: var(--tm-sys-color-on-surface-faint); margin-top: 3px; letter-spacing: .04em; }
</style>
