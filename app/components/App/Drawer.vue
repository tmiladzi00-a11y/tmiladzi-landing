<script setup lang="ts">
import { DRAWER } from '~/content/site'
defineProps<{ open: boolean }>()
</script>

<template>
  <div class="drawer" :class="{ open }" :hidden="!open" :aria-hidden="!open">
    <NuxtLink v-for="(n, i) in DRAWER" :key="n.to" :to="n.to" :style="{ '--i': i }">{{ n.label }}</NuxtLink>
  </div>
</template>

<style scoped>
.drawer {
  border-top: 1px solid var(--tm-sys-elevation-1-line); background: var(--tm-sys-elevation-1-bg);
  padding: var(--tm-sys-space-4) var(--tm-sys-space-5) var(--tm-sys-space-6);
}
.drawer.open a { animation: drop var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-decelerate) both; animation-delay: calc(var(--i, 0) * 30ms); }
@keyframes drop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@media (min-width: 1000px) { .drawer { display: none !important; } }
.drawer a {
  --_layer: var(--tm-sys-color-on-surface);
  display: block; text-decoration: none; padding: 12px 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant);
  font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-drawer-axes); font-size: 20px;
  min-height: var(--tm-sys-layout-touch);
}
.drawer a[aria-current="page"] { color: var(--tm-sys-color-primary-hover); }
</style>
