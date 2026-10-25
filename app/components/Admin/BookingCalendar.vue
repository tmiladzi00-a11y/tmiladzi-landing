<script setup lang="ts">
import type { CalendarEntry } from '~/utils/booking'
import { sessionRange } from '~/utils/booking'
import { MONTHS, DOW, iso, fmtDate, startOfMonth, addMonths, addDays, parseIso } from '~/utils/dates'

/* The month at a glance for staff: confirmed bookings, requests still waiting,
   and blocked time, each in its own colour. Picking a day lists everything on
   it, with links to the bookings and a shortcut to block time that day. */
const emit = defineEmits<{ block: [date: string] }>()

const today = iso(new Date())
const cursor = ref(startOfMonth(new Date()))
const selected = ref(today)

/* six Monday-first weeks covering the month */
const gridStart = computed(() => addDays(cursor.value, -((cursor.value.getDay() + 6) % 7)))
const range = computed(() => ({ from: iso(gridStart.value), to: iso(addDays(gridStart.value, 41)) }))

const { data: res, refresh } = await useAsyncData('admin-calendar',
  () => adminCall<CalendarEntry[]>(`/api/admin/calendar?from=${range.value.from}&to=${range.value.to}`),
  { watch: [range] })
defineExpose({ refresh })

const byDate = computed(() => {
  const m = new Map<string, CalendarEntry[]>()
  for (const e of res.value?.data ?? []) m.set(e.date, [...(m.get(e.date) ?? []), e])
  return m
})
const cells = computed(() => Array.from({ length: 42 }, (_, i) => {
  const d = addDays(gridStart.value, i)
  const s = iso(d)
  return { iso: s, day: d.getDate(), inMonth: d.getMonth() === cursor.value.getMonth(), entries: byDate.value.get(s) ?? [] }
}))
const dayEntries = computed(() => byDate.value.get(selected.value) ?? [])

function go(n: number) { cursor.value = addMonths(cursor.value, n) }
function toToday() { cursor.value = startOfMonth(new Date()); selected.value = today }
function pick(s: string) {
  selected.value = s
  // a day from the neighbouring month brings that month into view
  const d = parseIso(s)
  if (d.getMonth() !== cursor.value.getMonth()) cursor.value = startOfMonth(d)
}

const STATUS = { approved: 'Confirmed', pending: 'Waiting', blocked: 'Blocked', declined: 'Declined', cancelled: 'Cancelled' } as const
const short = (e: CalendarEntry) => (e.kind === 'block' ? 'Blocked' : e.label.split(' · ')[0])
const allDay = (e: CalendarEntry) => e.start === '00:00' && e.hours >= 24
const when = (e: CalendarEntry) => (allDay(e) ? 'All day' : sessionRange(e.date, e.start, e.hours))
const summary = (c: { iso: string; entries: CalendarEntry[] }) => {
  if (!c.entries.length) return `${fmtDate(c.iso)}: nothing booked`
  const n = (s: string) => c.entries.filter((e) => e.status === s).length
  return `${fmtDate(c.iso)}: ` + [[n('approved'), 'confirmed'], [n('pending'), 'waiting'], [n('blocked'), 'blocked']]
    .filter(([k]) => k).map(([k, w]) => `${k} ${w}`).join(', ')
}
</script>

<template>
  <div class="bcal">
    <div class="bcal__main">
    <div class="bcal__bar">
      <div class="bcal__nav">
        <button type="button" class="nb" aria-label="Previous month" @click="go(-1)">‹</button>
        <h2 class="bcal__month">{{ MONTHS[cursor.getMonth()] }} {{ cursor.getFullYear() }}</h2>
        <button type="button" class="nb" aria-label="Next month" @click="go(1)">›</button>
        <button type="button" class="nb nb--text" @click="toToday">Today</button>
      </div>
      <ul class="legend" aria-label="Key">
        <li><span class="sw sw--approved" />Confirmed</li>
        <li><span class="sw sw--pending" />Waiting</li>
        <li><span class="sw sw--blocked" />Blocked</li>
      </ul>
    </div>
    <p v-if="res?.error" class="err" role="alert">{{ res.error }}</p>

    <div class="bcal__dow" aria-hidden="true"><span v-for="d in DOW" :key="d">{{ d }}</span></div>
    <div class="bcal__grid" role="group" :aria-label="`${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`">
      <button
        v-for="c in cells" :key="c.iso" type="button" class="cell"
        :class="{ 'cell--out': !c.inMonth, 'cell--today': c.iso === today, 'cell--sel': c.iso === selected, 'cell--past': c.iso < today }"
        :aria-pressed="c.iso === selected" :aria-label="summary(c)" @click="pick(c.iso)"
      >
        <span class="cell__n">{{ c.day }}</span>
        <span v-for="e in c.entries.slice(0, 3)" :key="e.kind + e.key" class="ev" :class="`ev--${e.status}`" :title="`${when(e)} · ${e.label} (${STATUS[e.status]})`">
          <b>{{ allDay(e) ? 'All day' : e.start }}</b> {{ short(e) }}
        </span>
        <span v-if="c.entries.length > 3" class="ev__more">+{{ c.entries.length - 3 }} more</span>
        <span v-if="c.entries.length" class="dots" aria-hidden="true">
          <i v-for="e in c.entries.slice(0, 4)" :key="e.kind + e.key" :class="`dot dot--${e.status}`" />
        </span>
      </button>
    </div>
    </div>

    <section class="day" aria-live="polite">
      <div class="day__head">
        <h3 class="day__h">{{ fmtDate(selected) }}</h3>
        <button v-if="selected >= today" type="button" class="nb nb--text" @click="emit('block', selected)">Block time this day</button>
      </div>
      <p v-if="!dayEntries.length" class="muted day__none">Nothing booked or blocked.</p>
      <ul v-else class="day__list">
        <li v-for="e in dayEntries" :key="e.kind + e.key" class="item" :class="`item--${e.status}`">
          <span class="mono item__time">{{ when(e) }}</span>
          <span class="item__what">
            <NuxtLink v-if="e.kind === 'booking'" :to="`/admin/bookings/${e.key}`">{{ e.label }}</NuxtLink>
            <template v-else>{{ e.label }}</template>
          </span>
          <span class="mono item__status">{{ STATUS[e.status] }}<template v-if="e.depositDue"> · deposit due</template><template v-if="e.kind === 'booking'"> · {{ e.key }}</template></span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.bcal { display: grid; gap: var(--tm-sys-space-3); }
.bcal__main { display: grid; gap: var(--tm-sys-space-3); min-width: 0; }
.bcal__bar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--tm-sys-space-3); }
.bcal__nav { display: flex; align-items: center; gap: var(--tm-sys-space-2); }
.bcal__month { margin: 0 6px; min-width: 9.5em; text-align: center; font-family: var(--tm-sys-type-display-family); font-size: 20px; font-weight: 700; }
.nb {
  height: 32px; min-width: 32px; padding: 0 10px; cursor: pointer; background: transparent; color: var(--tm-sys-color-on-surface);
  border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); font-size: 16px;
}
.nb:hover { border-color: var(--tm-sys-color-primary); }
.nb:focus-visible, .cell:focus-visible { outline: 2px solid var(--tm-sys-color-focus); outline-offset: 2px; }
.nb--text { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .12em; text-transform: uppercase; }
.legend { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-4); list-style: none; margin: 0; padding: 0; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .1em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-variant); }
.legend li { display: flex; align-items: center; gap: 6px; }
.sw { width: 14px; height: 10px; border-radius: 2px; }

/* the three states, shared by legend, events, dots and the day list */
.sw--approved, .ev--approved, .dot--approved { background: var(--tm-sys-color-primary-tint); border: 1px solid var(--tm-sys-color-primary); }
.sw--pending, .ev--pending, .dot--pending { background: var(--tm-sys-color-secondary-tint); border: 1px dashed var(--tm-sys-color-secondary); }
.sw--blocked, .ev--blocked, .dot--blocked { border: 1px solid var(--tm-sys-color-outline); background: repeating-linear-gradient(135deg, var(--tm-sys-color-outline-variant) 0 2px, transparent 2px 6px); }

.bcal__dow { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .14em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); padding: 0 2px; }
.bcal__grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.cell {
  min-height: 108px; padding: 6px; display: flex; flex-direction: column; align-items: stretch; gap: 3px; text-align: left; cursor: pointer;
  background: var(--tm-sys-elevation-2-bg); border: 1px solid var(--tm-sys-color-outline-variant); border-radius: var(--tm-sys-shape-corner); color: var(--tm-sys-color-on-surface);
}
.cell:hover { border-color: var(--tm-sys-color-outline); }
.cell--out { opacity: .45; }
.cell--past .cell__n { color: var(--tm-sys-color-on-surface-faint); }
.cell--today .cell__n { color: var(--tm-sys-color-on-secondary); background: var(--tm-sys-color-secondary); border-radius: 999px; padding: 0 6px; }
.cell--sel { border-color: var(--tm-sys-color-primary); box-shadow: inset 0 0 0 1px var(--tm-sys-color-primary); }
.cell__n { align-self: flex-start; font-family: var(--tm-sys-type-data-family); font-size: 12px; line-height: 20px; }
.ev { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding: 2px 5px; border-radius: 3px; font-family: var(--tm-sys-type-data-family); font-size: 10.5px; line-height: 1.5; color: var(--tm-sys-color-on-surface); }
.ev b { font-weight: 600; }
.ev__more { font-family: var(--tm-sys-type-data-family); font-size: 10px; color: var(--tm-sys-color-on-surface-faint); padding-left: 5px; }
.dots { display: none; gap: 3px; flex-wrap: wrap; margin-top: auto; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
/* phones: no room for names, the colours carry it */
@media (max-width: 760px) {
  .cell { min-height: 56px; }
  .ev, .ev__more { display: none; }
  .dots { display: flex; }
}

.day { margin-top: var(--tm-sys-space-3); border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-4) var(--tm-sys-space-5); }
.day__head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--tm-sys-space-3); }
.day__h { margin: 0; font-family: var(--tm-sys-type-display-family); font-size: 18px; font-weight: 700; }
.day__none { margin: var(--tm-sys-space-3) 0 0; font-size: 14.5px; }
.day__list { list-style: none; margin: var(--tm-sys-space-3) 0 0; padding: 0; display: grid; gap: 6px; }
.item { display: grid; grid-template-columns: 170px minmax(0, 1fr) auto; gap: var(--tm-sys-space-3); align-items: center; padding: 8px 12px; border-radius: var(--tm-sys-shape-corner); border-left: 3px solid; font-size: 14.5px; }
.item--approved { border-left-color: var(--tm-sys-color-primary); background: var(--tm-sys-color-primary-tint); }
.item--pending { border-left-color: var(--tm-sys-color-secondary); background: var(--tm-sys-color-secondary-tint); }
.item--blocked { border-left-color: var(--tm-sys-color-outline); background: transparent; }
.item__time { font-size: var(--tm-sys-type-data-size-sm); }
.item__what a { color: var(--tm-sys-color-on-surface); }
.item__what a:hover { color: var(--tm-sys-color-primary-hover); }
.item__status { font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .1em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-variant); }
@media (max-width: 760px) { .item { grid-template-columns: 1fr; gap: 2px; } }
/* laptops: the month on the left, the picked day's schedule beside it and
   kept in view, so clicking through days updates it without scrolling */
@media (min-width: 1100px) {
  .bcal { grid-template-columns: minmax(0, 1fr) 340px; gap: var(--tm-sys-space-5); align-items: start; }
  .day { position: sticky; top: 76px; margin-top: 0; max-height: calc(100vh - 96px); overflow: auto; }
  .item { grid-template-columns: 1fr; gap: 2px; }
}
</style>
