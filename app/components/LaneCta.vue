<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'mal' | 'cop'; pill: string; title: string; compact?: boolean }>(), { tone: 'mal' })
</script>

<template>
  <div class="lane" :class="[`lane--${tone}`, { 'lane--compact': compact }]">
    <div class="lane__body">
      <Pill :tone="tone">{{ pill }}</Pill>
      <h3 class="display h3 lane__title">{{ title }}</h3>
      <slot />
    </div>
    <div class="lane__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.lane {
  --_line: var(--tm-sys-color-outline);
  border: 1px solid var(--_line); border-radius: var(--tm-sys-shape-corner); padding: var(--tm-sys-space-6);
  background: linear-gradient(160deg, var(--tm-sys-elevation-2-bg) 0%, var(--tm-sys-elevation-1-bg) 100%);
  display: flex; flex-direction: column;
}
.lane--cop { --_line: var(--tm-sys-color-secondary-container); }
.lane--compact { padding: var(--tm-sys-space-5); }
.lane__body { flex: 1; }
.lane__title { margin: var(--tm-sys-space-4) 0 var(--tm-sys-space-3); }
.lane__action { align-self: flex-start; margin-top: var(--tm-sys-space-5); }
.lane__body :deep(.tick) { margin-top: var(--tm-sys-space-4); }
</style>
