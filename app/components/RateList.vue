<script setup lang="ts">
/* A price list a client can actually scan: services grouped, names in the
   body face with the qualifier beneath, and the numbers right-aligned in
   display numerals so the eye runs down one column. */
export interface Rate {
  name: string
  /** Duration or unit qualifier under the name, e.g. "Half day · 1–4 hrs". */
  qual?: string
  /** Formatted figure without currency, e.g. "7,500". */
  price: string
  /** "from" when the figure is a floor; omitted for fixed day rates. */
  from?: boolean
  /** Per-unit suffix, e.g. "/ day". */
  unit?: string
}
defineProps<{ groups: { k: string; rows: Rate[] }[]; currency?: string }>()
</script>

<template>
  <div class="rates">
    <div v-if="currency" class="rates__cur mono">{{ currency }}</div>
    <section v-for="g in groups" :key="g.k" class="rates__group">
      <h4 class="rates__k">{{ g.k }}</h4>
      <ul class="rates__list">
        <li v-for="r in g.rows" :key="r.name + (r.qual || '')" class="rate">
          <div class="rate__name">
            {{ r.name }}
            <span v-if="r.qual" class="mono rate__qual">{{ r.qual }}</span>
          </div>
          <div class="rate__price">
            <span v-if="r.from" class="mono rate__pre">from</span>
            <b class="num rate__num">{{ r.price }}</b>
            <span v-if="r.unit" class="mono rate__unit">{{ r.unit }}</span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.rates { display: grid; gap: var(--tm-sys-space-5); }
.rates__cur { color: var(--tm-sys-color-on-surface-faint); text-align: right; margin-bottom: calc(-1 * var(--tm-sys-space-3)); }
.rates__k {
  font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track);
  text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); font-weight: 400;
  margin: 0 0 var(--tm-sys-space-2); padding-bottom: var(--tm-sys-space-2); border-bottom: 1px solid var(--tm-sys-color-outline);
}
.rates__list { list-style: none; padding: 0; margin: 0; }
.rate {
  display: flex; justify-content: space-between; align-items: baseline; gap: var(--tm-sys-space-4);
  padding: 10px 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant);
}
.rate:last-child { border-bottom: 0; }
.rate__name { font-size: 15px; color: var(--tm-sys-color-on-surface); line-height: 1.35; }
.rate__qual { display: block; font-size: 11px; color: var(--tm-sys-color-on-surface-faint); margin-top: 2px; letter-spacing: .04em; }
.rate__price { display: flex; align-items: baseline; gap: 6px; flex: none; }
.rate__pre, .rate__unit { font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.rate__num {
  font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes);
  font-size: 20px; letter-spacing: -.02em; color: var(--tm-sys-color-on-surface); font-weight: 500;
}
</style>
