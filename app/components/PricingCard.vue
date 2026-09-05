<script setup lang="ts">
import { fmtMoney } from '~/utils/money'
defineProps<{ title: string; price: number; unit: string; blurb: string }>()
</script>

<template>
  <SurfaceCard tone="cop">
    <div class="pricing__head">
      <h3 class="display h3">{{ title }}</h3>
      <div class="price"><b class="num">{{ fmtMoney(price) }}</b><span>ZMW · {{ unit }}</span></div>
    </div>
    <p class="muted pricing__blurb">{{ blurb }}</p>
    <slot />
  </SurfaceCard>
</template>

<style scoped>
.pricing__head { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-4); justify-content: space-between; align-items: baseline; }
.pricing__blurb { margin-top: var(--tm-sys-space-4); }
.price { display: flex; align-items: baseline; gap: 8px; margin: 0; }
.price b {
  font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes);
  font-size: 26px; letter-spacing: -.02em;
}
.price span { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
:deep(.h4 + .tick) { margin-top: var(--tm-sys-space-3); }
:deep(.h4) { margin-top: var(--tm-sys-space-5); }
</style>
