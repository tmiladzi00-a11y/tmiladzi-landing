<script setup lang="ts">
import { STUDIO_TZ_LABEL } from '~/utils/availability'
/* Start times for a day, one per hour. The visitor picks when they would like
   to start; how long the session runs is confirmed by the studio when it
   approves the booking. A taken hour stays on the row, crossed and
   unselectable, so the visitor sees what the day looks like. */
const props = withDefaults(defineProps<{
  slots: readonly string[]
  start: string | null
  taken?: string[]
  /** Availability not answered yet: nothing selectable. */
  waiting?: boolean
}>(), { taken: () => [] })
const emit = defineEmits<{ 'update:start': [t: string] }>()
</script>

<template>
  <fieldset class="slots-fs">
    <legend class="h4 slots__h">Start time</legend>
    <p class="muted slots__hint">Choose when you would like us to start. We confirm how long the session runs when we accept your booking.</p>
    <div class="slots" :class="{ 'slots--wait': waiting }" :aria-busy="waiting">
      <button
        v-for="t in slots" :key="t" type="button" class="slot"
        :class="{ 'slot--on': start === t, 'slot--taken': taken.includes(t) }"
        :aria-pressed="start === t" :disabled="waiting || taken.includes(t)"
        :aria-label="`Start at ${t}${taken.includes(t) ? ', already booked' : ''}`"
        @click="emit('update:start', t)"
      >{{ t }}</button>
    </div>
    <p class="mono slots__note" aria-live="polite">
      <template v-if="props.start"><strong class="slots__pick">Starting at {{ props.start }}</strong> · </template>{{ STUDIO_TZ_LABEL }}<template v-if="taken.length"> · crossed hours are already booked</template>
    </p>
  </fieldset>
</template>

<style scoped>
.slots-fs { border: 0; padding: 0; margin: var(--tm-sys-space-6) 0 0; min-width: 0; }
.slots__h { margin: 0; padding: 0; }
.slots__hint { margin: var(--tm-sys-space-2) 0 0; font-size: 14px; }
.slots { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-2); margin-top: var(--tm-sys-space-5); }
.slots--wait .slot { opacity: .45; cursor: progress; pointer-events: none; }
.slots__note { margin: var(--tm-sys-space-3) 0 0; font-size: 10.5px; }
.slots__pick { color: var(--tm-sys-color-on-surface); font-weight: 500; }
.slot {
  --_layer: var(--tm-sys-color-on-surface);
  font-family: var(--tm-sys-type-data-family); font-size: 11.5px; letter-spacing: .08em;
  padding: 9px 14px; min-height: 38px; display: inline-flex; align-items: center;
  border: 1px solid var(--tm-sys-color-outline); background: none; border-radius: var(--tm-sys-shape-corner);
  cursor: pointer; color: var(--tm-sys-color-on-surface-variant);
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.slot:hover:not(:disabled) { border-color: var(--tm-sys-color-primary-container); color: var(--tm-sys-color-on-surface); background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); }
.slot:focus-visible { outline: 2px solid var(--tm-sys-color-focus); outline-offset: 3px; }
.slot--on, .slot--on:hover:not(:disabled) { background: var(--tm-sys-color-secondary); border-color: var(--tm-sys-color-secondary); color: var(--tm-sys-color-on-secondary); font-weight: 500; }
.slot--taken, .slot--taken:hover {
  cursor: not-allowed; color: var(--tm-sys-color-on-surface-faint); border-color: var(--tm-sys-color-outline-variant);
  text-decoration: line-through; background: transparent;
  background-image: repeating-linear-gradient(135deg, rgba(200, 122, 69, .22) 0 1px, transparent 1px 5px);
}
</style>
