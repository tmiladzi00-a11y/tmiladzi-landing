<script setup lang="ts">
/* One <dt>/<dd> pair inside a <dl>. Compose several inside a plain <dl>. */
withDefaults(defineProps<{ term: string; first?: boolean; last?: boolean; flush?: boolean }>(), {})
</script>

<template>
  <div class="contactrow" :class="{ 'contactrow--first': first, 'contactrow--last': last, 'contactrow--flush': flush }">
    <dt>{{ term }}</dt>
    <dd><slot /></dd>
  </div>
</template>

<style scoped>
.contactrow {
  display: grid; grid-template-columns: auto 1fr; gap: var(--tm-sys-space-4); align-items: baseline;
  padding: var(--tm-sys-space-4) 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant);
}
.contactrow--last { border-bottom: 0; }
.contactrow--flush { padding-top: 0; }
dt { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
dd { margin: 0; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-lg); color: var(--tm-sys-color-on-surface); }
dd :deep(a) { text-decoration: none; border-bottom: 1px solid var(--tm-sys-color-primary-container); transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
dd :deep(a:hover) { color: var(--tm-sys-color-primary-hover); }
</style>
