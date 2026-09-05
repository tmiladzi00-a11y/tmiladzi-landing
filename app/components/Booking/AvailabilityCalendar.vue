<script setup lang="ts">
import { MONTHS, DOW, iso, fmtDate, startOfMonth, addMonths, addDays } from '~/utils/dates'

const props = defineProps<{
  modelValue: string | null
  blocked: string[]
  /** Days' notice: dates before today + notice are not offered. */
  notice: number
  /** Months ahead the cursor may travel. */
  horizon?: number
}>()
const emit = defineEmits<{ 'update:modelValue': [date: string] }>()

const today = new Date(); today.setHours(0, 0, 0, 0)
const cursor = ref(startOfMonth(today))
const dir = ref(1)
const horizon = computed(() => props.horizon ?? 13)
const blockedSet = computed(() => new Set(props.blocked))
const minDate = computed(() => addDays(today, props.notice))

const cells = computed(() => {
  const c = cursor.value
  const first = new Date(c.getFullYear(), c.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7 // Monday-first
  const days = new Date(c.getFullYear(), c.getMonth() + 1, 0).getDate()
  const out: { key: string; day?: number; iso?: string; blocked?: boolean; tooSoon?: boolean; label?: string }[] = []
  for (let i = 0; i < lead; i++) out.push({ key: 'e' + i })
  for (let i = 1; i <= days; i++) {
    const d = new Date(c.getFullYear(), c.getMonth(), i)
    const s = iso(d)
    const blocked = blockedSet.value.has(s)
    const tooSoon = d < minDate.value
    out.push({ key: s, day: i, iso: s, blocked, tooSoon, label: `${fmtDate(s)} — ${blocked ? 'Booked' : tooSoon ? 'Too soon' : 'Available'}` })
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
    <div :key="monthKey" class="calgrid" role="group" aria-label="Available dates">
      <template v-for="c in cells" :key="c.key">
        <div v-if="!c.day" class="calday empty" />
        <button
          v-else
          type="button"
          class="calday"
          :class="{ blocked: c.blocked, sel: modelValue === c.iso }"
          :disabled="c.blocked || c.tooSoon"
          :aria-pressed="modelValue === c.iso"
          :aria-label="c.label"
          @click="emit('update:modelValue', c.iso!)"
        >{{ c.day }}</button>
      </template>
    </div>
    </Transition>
    <div class="callegend" aria-hidden="true">
      <span><i class="swatch swatch--free" />Open</span>
      <span><i class="swatch swatch--blk" />Already booked</span>
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
.calday.sel { background: var(--tm-sys-color-secondary); border-color: var(--tm-sys-color-secondary); color: var(--tm-sys-color-on-secondary); font-weight: 500; }
.calday.empty { border: 0; background: none; cursor: default; }
.callegend { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-4); margin-top: var(--tm-sys-space-4); }
.callegend span { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; color: var(--tm-sys-color-on-surface-faint); display: flex; align-items: center; gap: 7px; }
.swatch { width: 13px; height: 13px; border-radius: var(--tm-sys-shape-corner); border: 1px solid var(--tm-sys-color-outline-variant); flex: none; display: inline-block; }
.swatch--free { background: var(--tm-sys-elevation-2-bg); }
.swatch--blk { background-image: repeating-linear-gradient(135deg, rgba(200, 122, 69, .22) 0 1px, transparent 1px 5px); }
.swatch--sel { background: var(--tm-sys-color-secondary); border-color: var(--tm-sys-color-secondary); }
</style>
