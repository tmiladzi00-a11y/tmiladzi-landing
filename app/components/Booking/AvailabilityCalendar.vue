<script setup lang="ts">
import { MONTHS, DOW, iso, fmtDate, startOfMonth, addMonths, addDays } from '~/utils/dates'
import { dayAvailability, type Busy } from '~/utils/availability'

/* A date has three states, worked out from the studio calendar's busy
   intervals for the service being booked: open, partly taken (some start
   times gone, or part of the day for a full-day service), and full. Only a
   full date is unselectable: one booking does not close a day. */
const props = defineProps<{
  modelValue: string | null
  busy: Busy[]
  /** The service being booked: its hours decide what fits. */
  hours: number
  timed: boolean
  slots: readonly string[]
  /** Days' notice: dates before today + notice are not offered. */
  notice: number
  /** Months ahead the cursor may travel. */
  horizon?: number
  /** The studio calendar has not answered yet: show the month as a skeleton. */
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [date: string] }>()

const today = new Date(); today.setHours(0, 0, 0, 0)
const cursor = ref(startOfMonth(today))
const dir = ref(1)
const horizon = computed(() => props.horizon ?? 13)
const minDate = computed(() => addDays(today, props.notice))

const cells = computed(() => {
  const c = cursor.value
  const first = new Date(c.getFullYear(), c.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7 // Monday-first
  const days = new Date(c.getFullYear(), c.getMonth() + 1, 0).getDate()
  const out: { key: string; day?: number; iso?: string; blocked?: boolean; partial?: boolean; tooSoon?: boolean; label?: string }[] = []
  const svc = { hours: props.hours, times: props.timed }
  for (let i = 0; i < lead; i++) out.push({ key: 'e' + i })
  for (let i = 1; i <= days; i++) {
    const d = new Date(c.getFullYear(), c.getMonth(), i)
    const s = iso(d)
    const tooSoon = d < minDate.value
    const a = tooSoon ? null : dayAvailability(props.busy, s, svc, props.slots)
    const blocked = a?.state === 'full'
    const partial = a?.state === 'partial'
    const status = tooSoon ? 'Too soon' : blocked ? 'Fully booked'
      : partial ? (props.timed ? `Available, ${a!.free.length} of ${props.slots.length} start times open` : 'Available, part of the day is already booked')
      : 'Available'
    out.push({ key: s, day: i, iso: s, blocked, partial, tooSoon, label: `${fmtDate(s)} — ${status}` })
  }
  return out
})
const monthLabel = computed(() => MONTHS[cursor.value.getMonth()] + ' ' + cursor.value.getFullYear())
const prevDisabled = computed(() => cursor.value <= startOfMonth(today))
const nextDisabled = computed(() => cursor.value >= addMonths(today, horizon.value))

function prev() { if (!prevDisabled.value) { dir.value = -1; cursor.value = addMonths(cursor.value, -1) } }
function next() { if (!nextDisabled.value) { dir.value = 1; cursor.value = addMonths(cursor.value, 1) } }
const monthKey = computed(() => cursor.value.getFullYear() * 12 + cursor.value.getMonth())
</script>

<template>
  <div class="calwrap" data-density="compact">
    <div class="calhead">
      <button class="calnav" type="button" aria-label="Previous month" :disabled="prevDisabled" @click="prev">‹</button>
      <span class="calmonth" aria-live="polite">{{ monthLabel }}</span>
      <button class="calnav" type="button" aria-label="Next month" :disabled="nextDisabled" @click="next">›</button>
    </div>
    <div class="calgrid" aria-hidden="true">
      <div v-for="d in DOW" :key="d" class="caldow">{{ d }}</div>
    </div>
    <Transition :name="dir > 0 ? 'cal-fwd' : 'cal-back'" mode="out-in">
    <div :key="monthKey" class="calgrid" :class="{ 'calgrid--loading': loading }" role="group" aria-label="Available dates" :aria-busy="loading">
      <template v-for="(c, i) in cells" :key="c.key">
        <div v-if="!c.day" class="calday empty" />
        <button
          v-else
          type="button"
          class="calday"
          :class="{ blocked: !loading && c.blocked, partial: !loading && c.partial, sel: modelValue === c.iso }"
          :style="{ '--col': i % 7 }"
          :disabled="loading || c.blocked || c.tooSoon"
          :aria-pressed="modelValue === c.iso"
          :aria-label="loading ? `${c.day}, checking availability` : c.label"
          @click="emit('update:modelValue', c.iso!)"
        >{{ c.day }}</button>
      </template>
    </div>
    </Transition>
    <p v-if="loading" class="calstatus" role="status"><span class="calstatus__dot" aria-hidden="true" />Checking the studio calendar…</p>
    <div v-else class="callegend" aria-hidden="true">
      <span><i class="swatch swatch--free" />Open</span>
      <span><i class="swatch swatch--part" />Some times taken</span>
      <span><i class="swatch swatch--blk" />Fully booked</span>
      <span><i class="swatch swatch--sel" />Your date</span>
    </div>
  </div>
</template>

<style scoped>
.calwrap { max-width: 520px; }
/* the month grid slides the way the user paged */
.cal-fwd-enter-active, .cal-back-enter-active { transition: opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-decelerate), transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-decelerate); }
.cal-fwd-leave-active, .cal-back-leave-active { transition: opacity var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-accelerate), transform var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-accelerate); }
.cal-fwd-enter-from { opacity: 0; transform: translateX(14px); }
.cal-fwd-leave-to { opacity: 0; transform: translateX(-14px); }
.cal-back-enter-from { opacity: 0; transform: translateX(-14px); }
.cal-back-leave-to { opacity: 0; transform: translateX(14px); }
.calhead { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--tm-sys-space-4); }
.calnav {
  --_layer: var(--tm-sys-color-on-surface);
  background: none; border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner);
  width: var(--tm-sys-density-control-h); height: var(--tm-sys-density-control-h); cursor: pointer;
  color: var(--tm-sys-color-on-surface-variant); font-size: 18px; line-height: 1;
  transition: border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.calnav:hover:not(:disabled) { border-color: var(--tm-sys-color-primary); color: var(--tm-sys-color-primary-hover); background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); }
.calnav:disabled { opacity: .3; cursor: not-allowed; }
.calmonth { font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-plate-axes); font-size: 20px; letter-spacing: -.01em; }
.calgrid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.caldow { font-family: var(--tm-sys-type-data-family); font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); text-align: center; padding-bottom: 6px; }
.calday {
  aspect-ratio: 1; border: 1px solid var(--tm-sys-color-outline-variant); background: var(--tm-sys-elevation-2-bg);
  border-radius: var(--tm-sys-shape-corner); font-family: var(--tm-sys-type-data-family); font-size: 13px; cursor: pointer;
  color: var(--tm-sys-color-on-surface); display: grid; place-items: center; position: relative; padding: 0; min-height: 36px;
  transition: border-color var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-standard), background var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-standard);
}
.calday:hover:not(:disabled) { border-color: var(--tm-sys-color-primary); background: var(--tm-sys-elevation-3-bg); }
.calday:disabled { color: var(--tm-sys-color-on-surface-faint); cursor: not-allowed; background: transparent; border-color: transparent; }
.calday.blocked {
  color: #5C6560; background: transparent; border-color: var(--tm-sys-color-outline-variant);
  background-image: repeating-linear-gradient(135deg, rgba(200, 122, 69, .22) 0 1px, transparent 1px 5px);
}
/* partly taken: still selectable, marked with a copper corner */
.calday.partial::after {
  content: ""; position: absolute; top: 0; right: 0; width: 0; height: 0;
  border-style: solid; border-width: 0 9px 9px 0;
  border-color: transparent var(--tm-sys-color-secondary) transparent transparent;
}
.calday.partial.sel::after { border-right-color: var(--tm-sys-color-on-secondary); }
/* the chosen date keeps its fill under the pointer: it was just clicked, so
   the pointer is still on it */
.calday.sel, .calday.sel:hover:not(:disabled) { background: var(--tm-sys-color-secondary); border-color: var(--tm-sys-color-secondary); color: var(--tm-sys-color-on-secondary); font-weight: 500; }
.calday.empty, .calday.empty:hover { border: 0; background: none; cursor: default; pointer-events: none; }
/* waiting on the studio calendar: the month holds its shape and breathes,
   column by column, and nothing can be picked until the answer is in */
.calgrid--loading .calday:not(.empty) {
  color: var(--tm-sys-color-on-surface-faint); background: var(--tm-sys-elevation-2-bg);
  border-color: var(--tm-sys-color-outline-variant); cursor: progress;
  animation: calwait 1.4s var(--tm-sys-motion-easing-standard) infinite;
  animation-delay: calc(var(--col, 0) * 80ms);
}
@keyframes calwait { 0%, 100% { opacity: .35; } 50% { opacity: .85; } }
.calstatus {
  display: flex; align-items: center; gap: 8px; margin: var(--tm-sys-space-4) 0 0; max-width: none;
  font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .08em; color: var(--tm-sys-color-primary-hover);
}
.calstatus__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; animation: calwait 1.4s var(--tm-sys-motion-easing-standard) infinite; }
.callegend { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-4); margin-top: var(--tm-sys-space-4); }
.callegend span { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; color: var(--tm-sys-color-on-surface-faint); display: flex; align-items: center; gap: 7px; }
.swatch { width: 13px; height: 13px; border-radius: var(--tm-sys-shape-corner); border: 1px solid var(--tm-sys-color-outline-variant); flex: none; display: inline-block; }
.swatch--free { background: var(--tm-sys-elevation-2-bg); }
.swatch--part { background: var(--tm-sys-elevation-2-bg); position: relative; overflow: hidden; }
.swatch--part::after { content: ""; position: absolute; top: 0; right: 0; border-style: solid; border-width: 0 6px 6px 0; border-color: transparent var(--tm-sys-color-secondary) transparent transparent; }
.swatch--blk { background-image: repeating-linear-gradient(135deg, rgba(200, 122, 69, .22) 0 1px, transparent 1px 5px); }
.swatch--sel { background: var(--tm-sys-color-secondary); border-color: var(--tm-sys-color-secondary); }
</style>
