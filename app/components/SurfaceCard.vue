<script setup lang="ts">
/* The raised surface every card-like block shares. `k` is the small
   mono key above the content; `tone` colours the border. */
withDefaults(defineProps<{
  k?: string
  tone?: 'mal' | 'cop' | 'none'
  to?: string
  tag?: 'div' | 'article' | 'li'
}>(), { tone: 'none', tag: 'div' })
</script>

<template>
  <NuxtLink v-if="to" class="card card--link" :class="`card--${tone}`" :to="to">
    <span v-if="k" class="card__k">{{ k }}</span>
    <slot />
  </NuxtLink>
  <component :is="tag" v-else class="card" :class="`card--${tone}`">
    <span v-if="k" class="card__k">{{ k }}</span>
    <slot />
  </component>
</template>

<style scoped>
.card {
  --_bg: var(--tm-sys-elevation-2-bg);
  --_line: var(--tm-sys-elevation-2-line);
  background: var(--_bg); border: 1px solid var(--_line); border-radius: var(--tm-sys-shape-corner);
  padding: var(--tm-sys-space-5);
  transition: border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.card--mal { --_line: var(--tm-sys-color-primary-container); }
.card--cop { --_line: var(--tm-sys-color-secondary-container); }
.card--link { cursor: pointer; text-decoration: none; display: block; }
.card--link:hover { --_line: var(--tm-sys-elevation-4-line); --_bg: var(--tm-sys-elevation-4-bg); transform: translateY(-2px); }
.card__k {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em;
  text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); margin-bottom: var(--tm-sys-space-3); display: block;
}
.card :deep(p) { font-size: 15.5px; color: var(--tm-sys-color-on-surface-variant); margin: var(--tm-sys-space-3) 0 0; }
.card :deep(p.fg) { color: var(--tm-sys-color-on-surface); }
</style>
