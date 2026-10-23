<script setup lang="ts">
import { STUDIO_TZ_LABEL, rangeLabel } from '~/utils/availability'
/* Hour blocks for a day. The visitor taps the first hour, then the last hour
   they need: any run of open hours is a booking. A taken hour stays on the
   row, crossed and unselectable, so the visitor sees what the day looks like,
   and a run cannot cross it. Two taps make a run; the next tap starts a new
   one. A second tap before the start, or past a taken hour, moves the start
   there instead. Tapping the start again keeps a single hour. */
const props = withDefaults(defineProps<{
  slots: readonly string[]
  /** Latest end of the day, e.g. '18:00'. */
  dayEnd: string
  start: string | null
  hours: number
  taken?: string[]
  /** Calendar not answered yet: nothing selectable. */
  waiting?: boolean
}>(), { taken: () => [] })
const emit = defineEmits<{ 'update:start': [t: string | null]; 'update:hours': [n: number] }>()

const at = (t: string | null) => (t ? props.slots.indexOf(t) : -1)
const inRun = (i: number) => props.start != null && i >= at(props.start) && i < at(props.start) + props.hours

/** A start has been tapped and the end is still to come. */
const awaitingEnd = ref(false)
watch(() => props.start, (v) => { if (!v) awaitingEnd.value = false })

function pick(i: number) {
  const t = props.slots[i]!
  if (props.taken.includes(t)) return
  const s = at(props.start)
  if (awaitingEnd.value && s >= 0 && i >= s && props.slots.slice(s, i + 1).every((x) => !props.taken.includes(x))) {
    emit('update:hours', i - s + 1); awaitingEnd.value = false; return
  }
  emit('update:start', t); emit('update:hours', 1); awaitingEnd.value = true
}
const endOf = (i: number) => props.slots[i + 1] ?? props.dayEnd
const chosen = computed(() => (props.start ? rangeLabel(props.start, endOf(at(props.start) + props.hours - 1), props.hours) : ''))
</script>

<template>
  <fieldset class="slots-fs">
    <legend class="h4 slots__h">Time</legend>
    <p class="muted slots__hint">Tap your first hour, then the last hour you need.</p>
    <div class="slots" :class="{ 'slots--wait': waiting }" :aria-busy="waiting">
      <button
        v-for="(t, i) in slots" :key="t" type="button" class="slot"
        :class="{ 'slot--on': inRun(i), 'slot--taken': taken.includes(t) }"
        :aria-pressed="inRun(i)" :disabled="waiting || taken.includes(t)"
        :aria-label="`${t} to ${endOf(i)}${taken.includes(t) ? ', already booked' : ''}`"
        @click="pick(i)"
      >{{ t }}</button>
    </div>
    <p class="mono slots__note" aria-live="polite">
      <template v-if="chosen"><strong class="slots__pick">{{ chosen }}</strong> · </template>{{ STUDIO_TZ_LABEL }}<template v-if="taken.length"> · crossed hours are already booked</template>
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
