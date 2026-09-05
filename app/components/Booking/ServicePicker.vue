<script setup lang="ts">
import type { Service } from '~/content/types'
import { fmtMoney } from '~/utils/money'
defineProps<{ services: Service[]; modelValue: string | null }>()
defineEmits<{ 'update:modelValue': [id: string] }>()
</script>

<template>
  <fieldset class="pks-fs">
    <legend class="sr-only">Coverage</legend>
    <div class="pks">
      <label v-for="s in services" :key="s.id" class="pk" :class="{ 'pk--on': modelValue === s.id }">
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
