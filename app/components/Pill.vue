<script setup lang="ts">
defineProps<{ tone?: 'mal' | 'cop' }>()
</script>

<template>
  <span class="pill" :class="tone && `pill--${tone}`">
    <span class="dot" aria-hidden="true" /><slot />
  </span>
</template>

<style scoped>
.pill {
  --_fg: var(--tm-sys-color-on-surface-variant);
  --_line: var(--tm-sys-color-outline);
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs);
  letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase;
  border: 1px solid var(--_line); border-radius: var(--tm-sys-shape-corner-pill);
  padding: 5px 11px; color: var(--_fg);
}
.pill--mal { --_line: var(--tm-sys-color-primary-container); --_fg: var(--tm-sys-color-primary-hover); }
.pill--cop { --_line: var(--tm-sys-color-secondary-container); --_fg: var(--tm-sys-color-secondary-hover); }
.dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex: none; }
</style>
