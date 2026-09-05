<script setup lang="ts">
/* A flat row of names in the display face. Used where a sector grouping
   would be overkill: a case study's "also for" strip, a proposal footer. */
defineProps<{ names: string[] }>()
</script>

<template>
  <ul class="logos">
    <li v-for="n in names" :key="n" class="logo">{{ n }}</li>
  </ul>
</template>

<style scoped>
.logos { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-4) var(--tm-sys-space-7); align-items: center; list-style: none; padding: 0; margin: 0; }
.logo {
  font-family: var(--tm-sys-type-display-family); font-variation-settings: "wdth" 100, "wght" 650;
  font-size: 15px; letter-spacing: .02em; color: var(--tm-sys-color-on-surface-faint);
  text-transform: uppercase; transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.logo:hover { color: var(--tm-sys-color-on-surface-variant); }
</style>
