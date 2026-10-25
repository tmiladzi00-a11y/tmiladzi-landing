<script setup lang="ts">
import type { Service, Tier } from '~/content/types'
import { fmtMoney } from '~/utils/money'
import { TIER_LABEL } from '~/utils/catalog'
const props = defineProps<{ services: Service[]; modelValue: string | null }>()
defineEmits<{ 'update:modelValue': [id: string] }>()

/* Premium | Basic switch, Premium first and selected on arrival. Shown only
   when both ranges have packages. Coming back to this step opens on the range
   of the package already chosen; switching range keeps that choice until
   another is made. */
const ORDER: Tier[] = ['premium', 'basic']
const tiers = computed(() => ORDER.filter((t) => props.services.some((s) => s.tier === t)))
const tier = ref<string>(props.services.find((s) => s.id === props.modelValue)?.tier
  ?? (tiers.value.includes('premium') ? 'premium' : tiers.value[0]) ?? 'premium')
const shown = computed(() => (tiers.value.length > 1 ? props.services.filter((s) => s.tier === tier.value) : props.services))
/* "2 packages · from K2,000": what each side of the switch holds */
const meta = (t: Tier) => {
  const list = props.services.filter((s) => s.tier === t)
  const prices = list.flatMap((s) => (s.price == null ? [] : [s.price]))
  return `${list.length} package${list.length === 1 ? '' : 's'} · ` + (prices.length ? 'from K' + fmtMoney(Math.min(...prices)) : 'on request')
}
</script>

<template>
  <fieldset class="pks-fs">
    <legend class="sr-only">Coverage</legend>
    <div v-if="tiers.length > 1" class="range" :class="`range--${tier}`" role="radiogroup" aria-label="Package range">
      <span class="range__thumb" aria-hidden="true" />
      <label v-for="t in tiers" :key="t" class="range__opt" :class="{ 'range__opt--on': tier === t }">
        <input v-model="tier" class="sr-only" type="radio" name="tier" :value="t">
        <span class="range__name">{{ TIER_LABEL[t] }}</span>
        <span class="range__meta">{{ meta(t) }}</span>
      </label>
    </div>
    <div class="pks">
      <label v-for="s in shown" :key="s.id" class="pk" :class="{ 'pk--on': modelValue === s.id }">
        <input class="sr-only" type="radio" name="service" :value="s.id" :checked="modelValue === s.id" @change="$emit('update:modelValue', s.id)">
        <span class="card__k" :class="{ 'cop-hi': !s.live }">{{ s.tag }}</span>
        <span class="h4 pk__name">{{ s.name }}</span>
        <span v-if="s.price == null" class="price"><b class="pk__req">On request</b></span>
        <span v-else class="price"><b class="num">{{ fmtMoney(s.price) }}</b><span>from · {{ s.cov }}</span></span>
        <span class="pk__blurb">{{ s.blurb }}</span>
        <TickList v-if="s.includes.length" tone="cop" :items="s.includes.slice(0, 4)" class="pk__tick" />
        <span class="pk__pick">{{ modelValue === s.id ? 'Selected' : 'Select →' }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.pks-fs { border: 0; padding: 0; margin: var(--tm-sys-space-5) 0 0; min-width: 0; }
/* Premium | Basic: two halves, a thumb that slides to the chosen one.
   Basic rides on the primary green, Premium on the copper, so the range in
   view is obvious at a glance. Premium always sits left (see ORDER). */
.range {
  --_fill: var(--tm-sys-color-primary); --_on: var(--tm-sys-color-on-primary);
  position: relative; display: grid; grid-template-columns: 1fr 1fr; max-width: 560px;
  padding: 4px; margin-bottom: var(--tm-sys-space-5);
  border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg);
}
.range--premium { --_fill: var(--tm-sys-color-secondary); --_on: var(--tm-sys-color-on-secondary); }
.range__thumb {
  position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px);
  background: var(--_fill); border-radius: var(--tm-sys-shape-corner);
  transition: transform var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-emphasized),
              background var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-standard);
}
.range--basic .range__thumb { transform: translateX(100%); }
.range__opt {
  position: relative; display: grid; gap: 4px; justify-items: center; text-align: center; cursor: pointer;
  padding: var(--tm-sys-space-4) var(--tm-sys-space-3); min-height: 76px; align-content: center;
  border-radius: var(--tm-sys-shape-corner); color: var(--tm-sys-color-on-surface-variant);
  transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.range__opt:not(.range__opt--on):hover { color: var(--tm-sys-color-on-surface); background: color-mix(in srgb, var(--tm-sys-color-on-surface) var(--tm-sys-state-hover), transparent); }
.range__opt--on { color: var(--_on); }
.range__opt:has(input:focus-visible) { outline: 2px solid var(--tm-sys-color-focus); outline-offset: 2px; }
.range__name { font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-display-h4-axes); font-size: 22px; line-height: 1.1; letter-spacing: -.01em; }
.range__opt--on .range__name { font-weight: 600; }
.range__meta { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .12em; text-transform: uppercase; opacity: .85; }
.pks { display: grid; gap: var(--tm-sys-space-4); grid-template-columns: 1fr; }
@media (min-width: 760px) { .pks { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1100px) { .pks { grid-template-columns: repeat(3, 1fr); } }
.pk {
  --_bg: var(--tm-sys-elevation-2-bg); --_line: var(--tm-sys-elevation-2-line);
  text-align: left; background: var(--_bg); border: 1px solid var(--_line); border-radius: var(--tm-sys-shape-corner);
  padding: var(--tm-sys-space-5); cursor: pointer; display: flex; flex-direction: column;
  transition: border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.pk:hover { --_line: var(--tm-sys-color-primary-container); --_bg: var(--tm-sys-elevation-3-bg); }
.pk--on { --_line: var(--tm-sys-color-secondary); --_bg: var(--tm-sys-elevation-3-bg); }
.pk:has(input:focus-visible) { outline: 2px solid var(--tm-sys-color-focus); outline-offset: 3px; }
.pk--on .pk__pick { color: var(--tm-sys-color-secondary-hover); }
.card__k { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); margin-bottom: var(--tm-sys-space-3); display: block; }
.pk__name { display: block; }
.price { display: flex; align-items: baseline; gap: 8px; margin-top: var(--tm-sys-space-3); }
.price b { font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes); font-size: 26px; letter-spacing: -.02em; }
.price span { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.pk__req { font-size: 19px; }
.pk__blurb { font-size: 14px; color: var(--tm-sys-color-on-surface-variant); margin-top: var(--tm-sys-space-3); display: block; }
.pk__tick { margin-top: var(--tm-sys-space-3); }
.pk__pick { margin-top: auto; padding-top: var(--tm-sys-space-4); font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
</style>
