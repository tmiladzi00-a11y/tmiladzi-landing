<script setup lang="ts">
defineProps<{ options: [string, string][]; modelValue: string; label?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="filters" role="group" :aria-label="label || 'Filter'">
    <button
      v-for="[value, text] in options"
      :key="value"
      type="button"
      class="filter"
      :class="{ active: value === modelValue }"
      :aria-pressed="value === modelValue"
      @click="$emit('update:modelValue', value)"
    >{{ text }}</button>
  </div>
</template>

<style scoped>
.filters { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-2); margin-bottom: var(--tm-sys-space-6); }
.filter {
  --_layer: var(--tm-sys-color-on-surface);
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm);
  letter-spacing: .11em; text-transform: uppercase;
  padding: 8px 14px; min-height: 38px; border: 1px solid var(--tm-sys-color-outline); background: none;
  border-radius: var(--tm-sys-shape-corner); cursor: pointer; color: var(--tm-sys-color-on-surface-variant);
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.filter:hover { border-color: var(--tm-sys-color-primary-container); color: var(--tm-sys-color-on-surface);
  background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); }
.filter.active { background: var(--tm-sys-color-primary); border-color: var(--tm-sys-color-primary); color: var(--tm-sys-color-on-primary); font-weight: 500; }
</style>
