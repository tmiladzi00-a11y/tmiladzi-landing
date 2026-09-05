<script setup lang="ts">
withDefaults(defineProps<{ copper?: boolean; tag?: 'p' | 'span' | 'div' | 'h2' | 'h3' }>(), { tag: 'p' })
</script>

<template>
  <component :is="tag" class="eyebrow" :class="{ 'eyebrow--cop': copper }"><slot /></component>
</template>

<style scoped>
.eyebrow {
  --_fg: var(--tm-sys-color-primary-hover);
  --_rule: var(--tm-sys-color-primary);
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm);
  letter-spacing: var(--tm-sys-type-eyebrow-track); text-transform: uppercase;
  color: var(--_fg); margin: 0 0 var(--tm-sys-space-4);
  display: flex; align-items: flex-start; gap: var(--tm-sys-space-3); max-width: none;
}
.eyebrow::before { content: ""; width: 22px; height: 1px; background: var(--_rule); flex: none; margin-top: .75em; }
.eyebrow--cop { --_fg: var(--tm-sys-color-secondary-hover); --_rule: var(--tm-sys-color-secondary); }
</style>
