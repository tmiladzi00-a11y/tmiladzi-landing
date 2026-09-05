<script setup lang="ts">
/* A numbered row in a genuine sequence. `n` is the marker: "01", "+",
   anything. `tone` colours the marker. */
withDefaults(defineProps<{
  n: string
  title: string
  tone?: 'mal' | 'cop'
  tag?: 'li' | 'div'
  level?: 'h2' | 'h3' | 'h4'
  first?: boolean
  last?: boolean
}>(), { tone: 'mal', tag: 'li', level: 'h3' })
</script>

<template>
  <component :is="tag" class="ruleitem" :class="[`ruleitem--${tone}`, { 'ruleitem--first': first, 'ruleitem--last': last }]">
    <span class="ruleitem__n" aria-hidden="true">{{ n }}</span>
    <div>
      <component :is="level" class="h4">{{ title }}</component>
      <p><slot /></p>
    </div>
  </component>
</template>

<style scoped>
.ruleitem {
  --_marker: var(--tm-sys-color-primary);
  display: grid; grid-template-columns: auto 1fr; gap: var(--tm-sys-space-4);
  padding: var(--tm-sys-space-4) 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant);
}
.ruleitem--cop { --_marker: var(--tm-sys-color-secondary); }
.ruleitem--first { border-top: 1px solid var(--tm-sys-color-outline-variant); }
.ruleitem--last { border-bottom: 0; }
.ruleitem__n {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm);
  color: var(--_marker); letter-spacing: .1em; padding-top: 5px; min-width: 1.5em;
}
.ruleitem p { margin: 6px 0 0; font-size: 15.5px; color: var(--tm-sys-color-on-surface-variant); }
.ruleitem p :deep(b) { color: var(--tm-sys-color-on-surface); }
</style>
