<script setup lang="ts">
/* A pair of pager chevrons for a horizontal strip. Sits in a section head's
   aside next to the row's action; the strip itself scrolls by touch below
   the desktop breakpoint, so the pair is hidden there. */
defineProps<{ label?: string }>()
const emit = defineEmits<{ page: [dir: -1 | 1] }>()
</script>

<template>
  <div class="stripnav" role="group" :aria-label="label || 'Scroll frames'">
    <button type="button" class="stripnav__btn" aria-label="Scroll left" @click="emit('page', -1)">‹</button>
    <button type="button" class="stripnav__btn" aria-label="Scroll right" @click="emit('page', 1)">›</button>
  </div>
</template>

<style scoped>
.stripnav { display: none; gap: var(--tm-sys-space-2); }
@media (min-width: 900px) { .stripnav { display: flex; } }
.stripnav__btn {
  --_layer: var(--tm-sys-color-on-surface);
  width: 38px; height: 38px; display: grid; place-items: center; padding: 0;
  background: none; border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner);
  color: var(--tm-sys-color-on-surface-variant); font-size: 20px; line-height: 1; cursor: pointer;
  transition: border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.stripnav__btn:hover { border-color: var(--tm-sys-color-primary); color: var(--tm-sys-color-primary-hover); background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); }
</style>
