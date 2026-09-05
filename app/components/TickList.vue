<script setup lang="ts">
withDefaults(defineProps<{ items?: string[]; tone?: 'mal' | 'cop'; size?: 'md' | 'lg' }>(), { tone: 'mal', size: 'md' })
</script>

<template>
  <ul class="tick" :class="[`tick--${tone}`, `tick--${size}`]">
    <template v-if="items"><li v-for="i in items" :key="i">{{ i }}</li></template>
    <slot v-else />
  </ul>
</template>

<style scoped>
.tick { --_rule: var(--tm-sys-color-primary); list-style: none; padding: 0; margin: var(--tm-sys-space-4) 0 0; }
.tick--cop { --_rule: var(--tm-sys-color-secondary); }
.tick :deep(li) { position: relative; padding-left: 20px; font-size: 14.5px; color: var(--tm-sys-color-on-surface-variant); margin-bottom: 8px; line-height: 1.55; }
.tick :deep(li)::before { content: ""; position: absolute; left: 0; top: .62em; width: 8px; height: 1px; background: var(--_rule); }
.tick--lg :deep(li) { font-size: 16px; line-height: 1.65; margin-bottom: 11px; }
.tick :deep(strong) { color: var(--tm-sys-color-on-surface); font-weight: 600; }
</style>
