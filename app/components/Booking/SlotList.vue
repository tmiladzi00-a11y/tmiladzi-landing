<script setup lang="ts">
import { STUDIO_TZ_LABEL } from '~/utils/availability'
/* Start times for a day. A taken time stays on the row, crossed and
   unselectable, so the visitor sees what the day looks like rather than a
   list with holes in it. */
withDefaults(defineProps<{ slots: readonly string[]; modelValue: string | null; taken?: string[]; /** Calendar not answered yet: nothing selectable. */ waiting?: boolean }>(), { taken: () => [] })
defineEmits<{ 'update:modelValue': [t: string] }>()
</script>

<template>
  <fieldset class="slots-fs">
    <legend class="h4 slots__h">Start time</legend>
    <div class="slots" :class="{ 'slots--wait': waiting }" :aria-busy="waiting">
      <label v-for="t in slots" :key="t" class="slot" :class="{ 'slot--on': modelValue === t, 'slot--taken': taken.includes(t) }">
        <input class="sr-only" type="radio" name="slot" :value="t" :checked="modelValue === t" :disabled="waiting || taken.includes(t)" @change="$emit('update:modelValue', t)">{{ t }}<span v-if="taken.includes(t)" class="sr-only">, already booked</span>
      </label>
    </div>
    <p class="mono slots__note">{{ STUDIO_TZ_LABEL }}<template v-if="taken.length"> · crossed times are already booked</template></p>
  </fieldset>
</template>

<style scoped>
.slots-fs { border: 0; padding: 0; margin: var(--tm-sys-space-6) 0 0; min-width: 0; }
.slots__h { margin: 0; padding: 0; }
.slots { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-2); margin-top: var(--tm-sys-space-5); }
.slots--wait .slot { opacity: .45; cursor: progress; pointer-events: none; }
.slots__note { margin: var(--tm-sys-space-3) 0 0; font-size: 10.5px; }
.slot {
  --_layer: var(--tm-sys-color-on-surface);
  font-family: var(--tm-sys-type-data-family); font-size: 11.5px; letter-spacing: .08em;
  padding: 9px 14px; min-height: 38px; display: inline-flex; align-items: center;
  border: 1px solid var(--tm-sys-color-outline); background: none; border-radius: var(--tm-sys-shape-corner);
  cursor: pointer; color: var(--tm-sys-color-on-surface-variant);
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.slot:hover { border-color: var(--tm-sys-color-primary-container); color: var(--tm-sys-color-on-surface); background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); }
.slot:has(input:focus-visible) { outline: 2px solid var(--tm-sys-color-focus); outline-offset: 3px; }
.slot--on, .slot--on:hover { background: var(--tm-sys-color-secondary); border-color: var(--tm-sys-color-secondary); color: var(--tm-sys-color-on-secondary); font-weight: 500; }
.slot--taken, .slot--taken:hover {
  cursor: not-allowed; color: var(--tm-sys-color-on-surface-faint); border-color: var(--tm-sys-color-outline-variant);
  text-decoration: line-through; background: transparent;
  background-image: repeating-linear-gradient(135deg, rgba(200, 122, 69, .22) 0 1px, transparent 1px 5px);
}
</style>
