<script setup lang="ts">
import type { Block, Booking } from '~/utils/booking'
import { depositState, sessionRange } from '~/utils/booking'
import { refDebounced } from '@vueuse/core'
import type { Errors } from '~/utils/catalog'
import { fmtDate } from '~/utils/dates'
import { fmtMoney } from '~/utils/money'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Bookings' })

type View = 'calendar' | 'pending' | 'deposit' | 'upcoming' | 'past' | 'closed'
const VIEWS: [View, string][] = [['calendar', 'Calendar'], ['pending', 'Waiting'], ['deposit', 'Awaiting deposit'], ['upcoming', 'Upcoming'], ['past', 'Past'], ['closed', 'Declined & cancelled']]
const route = useRoute()
const view = computed<View>(() => VIEWS.find(([v]) => v === route.query.view)?.[0] ?? 'calendar')

/* search across every booking by name, phone, email or reference */
const search = ref('')
const q = refDebounced(computed(() => search.value.trim()), 300)
const searching = computed(() => q.value.length >= 2)

/* the calendar tab still loads the waiting list: its counts are the tab badges */
const { data: res } = await useAsyncData('admin-bookings',
  () => adminCall<{ bookings: Booking[]; counts: { pending: number; deposit: number; overdue: number }; clash: Record<string, string[]> }>(
    `/api/admin/bookings?view=${view.value === 'calendar' ? 'pending' : view.value}` + (searching.value ? `&q=${encodeURIComponent(q.value)}` : '')),
  { watch: [view, q] })
const list = computed(() => res.value?.data?.bookings ?? [])
const counts = computed(() => res.value?.data?.counts)
const badge = (v: View) => (v === 'pending' ? counts.value?.pending : v === 'deposit' ? counts.value?.deposit : 0)

/* a message handed over by the booking page after a decision */
const flash = useState('admin-flash', () => '')
const msg = ref(flash.value)
flash.value = ''

const when = (b: Booking) => b.status === 'approved' && b.approvedHours
  ? sessionRange(b.date, b.start, b.approvedHours)
  : `from ${b.start} · asked ${b.requestedHours} h`
const created = (s: string) => new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z').toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/* ---------- block time by hand: phone bookings, days off ---------- */
const { data: blocksRes, refresh: refreshBlocks } = await useAsyncData('admin-blocks', () => adminCall<Block[]>('/api/admin/blocks'))
const blocks = computed(() => blocksRes.value?.data ?? [])
const bf = reactive({ date: '', allDay: true, start: '09:00', end: '17:00', reason: '' })
const blockErr = ref<Errors>({})
const blockFormErr = ref('')
const adding = ref(false)

async function addBlock() {
  adding.value = true
  const r = await adminCall<Block[]>('/api/admin/blocks', {
    method: 'POST',
    body: { date: bf.date, start: bf.allDay ? '00:00' : bf.start, end: bf.allDay ? '24:00' : bf.end, reason: bf.reason },
  })
  adding.value = false
  if (r.error) { blockErr.value = r.fields ?? {}; blockFormErr.value = r.error; return }
  blockErr.value = {}; blockFormErr.value = ''
  bf.reason = ''; bf.date = ''
  await Promise.all([refreshBlocks(), cal.value?.refresh()])
}
async function removeBlock(b: Block) {
  const r = await adminCall(`/api/admin/blocks/${b.id}`, { method: 'DELETE' })
  blockFormErr.value = r.error ?? ''
  await Promise.all([refreshBlocks(), cal.value?.refresh()])
}
/* "Block time this day" on the calendar fills in the form below */
const cal = ref<{ refresh: () => Promise<void> } | null>(null)
function blockDay(date: string) {
  bf.date = date
  nextTick(() => {
    document.getElementById('blocks-h')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.getElementById('b-reason')?.focus({ preventScroll: true })
  })
}
const blockTime = (b: Block) => (b.start === '00:00' && b.end === '24:00' ? 'All day' : `${b.start} – ${b.end}`)
</script>

<template>
  <div>
    <h1 class="display h3 h">Bookings</h1>
    <p class="muted p">Requests from the booking page wait here until you accept or decline them. Accepting one
      sets how long the session runs and takes that time off the calendar. Pick a day on the calendar to see its schedule.</p>
    <p class="mono msg" role="status">{{ msg }}</p>

    <nav class="tabs" aria-label="Bookings">
      <NuxtLink v-for="[v, label] in VIEWS" :key="v" :to="{ query: { view: v } }" class="tab" :class="{ 'tab--on': view === v }" :aria-current="view === v ? 'page' : undefined">
        {{ label }}<span v-if="badge(v)" class="tab__n" :class="{ 'tab__n--late': v === 'deposit' && counts?.overdue }" :title="v === 'deposit' && counts?.overdue ? `${counts.overdue} past the 72-hour hold` : undefined">{{ badge(v) }}</span>
      </NuxtLink>
    </nav>
    <div class="find">
      <label for="find" class="sr-only">Search bookings</label>
      <input id="find" v-model="search" type="search" placeholder="Search by name, phone, email or reference" autocomplete="off">
      <span v-if="searching" class="mono find__n" role="status">{{ list.length }} found</span>
    </div>

    <AdminBookingCalendar v-if="view === 'calendar' && !searching" ref="cal" @block="blockDay" />
    <p v-else-if="res?.error" class="err" role="alert">{{ res.error }}</p>
    <p v-else-if="!list.length" class="muted empty">{{ searching ? `No bookings match “${q}”.` : view === 'pending' ? 'Nothing waiting. New requests appear here.' : view === 'deposit' ? 'No deposits outstanding.' : 'Nothing here yet.' }}</p>
    <ul v-else class="rows">
      <li v-for="b in list" :key="b.ref" class="bkrow">
        <NuxtLink :to="`/admin/bookings/${b.ref}`" class="bkrow__main">
          <span class="mono bkrow__ref">{{ b.ref }}</span>
          <span class="bkrow__when"><b>{{ fmtDate(b.date) }}</b> · {{ when(b) }}</span>
          <span class="bkrow__who">{{ b.name }} · {{ b.packageName }}</span>
        </NuxtLink>
        <span class="num bkrow__total">{{ b.total ? 'K' + fmtMoney(b.total) : 'On request' }}</span>
        <span v-if="res?.data?.clash[b.ref]" class="chip chip--warn" :title="res.data.clash[b.ref]!.join('\n')">Clashes</span>
        <span v-else-if="view === 'pending' && !searching" class="mono bkrow__age">{{ created(b.createdAt) }}</span>
        <span v-else-if="depositState(b) === 'overdue'" class="chip chip--late">Deposit overdue</span>
        <span v-else-if="depositState(b) === 'due'" class="chip chip--warn">Deposit due</span>
        <span v-else class="chip" :class="`chip--${b.status}`">{{ b.status === 'pending' ? 'waiting' : b.status }}</span>
      </li>
    </ul>

    <section class="sec blocks" aria-labelledby="blocks-h">
      <h2 id="blocks-h" class="sec__k">Block time</h2>
      <p class="muted sec__p">For bookings taken by phone, and days the studio is closed. Blocked time cannot be booked on the site.</p>
      <form class="bform" novalidate @submit.prevent="addBlock">
        <FormField id="b-date" label="Date" :error="blockErr.date">
          <input id="b-date" v-model="bf.date" type="date">
        </FormField>
        <label class="tick"><input v-model="bf.allDay" type="checkbox"> All day</label>
        <template v-if="!bf.allDay">
          <FormField id="b-start" label="From" :error="blockErr.start"><input id="b-start" v-model="bf.start" type="time" step="1800"></FormField>
          <FormField id="b-end" label="Until" :error="blockErr.end"><input id="b-end" v-model="bf.end" type="time" step="1800"></FormField>
        </template>
        <FormField id="b-reason" label="Note (staff only)" class="bform__reason">
          <input id="b-reason" v-model="bf.reason" placeholder="e.g. Phone booking: Banda wedding">
        </FormField>
        <BaseButton variant="copper" type="submit" :disabled="adding">{{ adding ? 'Blocking…' : 'Block it' }}</BaseButton>
      </form>
      <p v-if="blockFormErr" class="err">{{ blockFormErr }}</p>
      <ul v-if="blocks.length" class="blist">
        <li v-for="b in blocks" :key="b.id">
          <span><b>{{ fmtDate(b.date) }}</b> · {{ blockTime(b) }}<template v-if="b.reason"> · {{ b.reason }}</template></span>
          <AdminConfirmButton label="Remove" size="sm" :question="`Remove the block on ${fmtDate(b.date)}? That time becomes bookable again.`" confirm-label="Yes, remove" @confirm="removeBlock(b)" />
        </li>
      </ul>
      <p v-else class="muted sec__p">No blocked time coming up.</p>
    </section>
  </div>
</template>

<style scoped>
.h { margin: 0; }
.p { margin: var(--tm-sys-space-2) 0 0; max-width: 70ch; }
.msg { min-height: 1.6em; margin: var(--tm-sys-space-4) 0 0; font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-primary-hover); }
.tabs { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-1); margin: var(--tm-sys-space-3) 0 var(--tm-sys-space-4); border-bottom: 1px solid var(--tm-sys-color-outline); }
.tab {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; margin-bottom: -1px; text-decoration: none;
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .1em; text-transform: uppercase;
  color: var(--tm-sys-color-on-surface-variant); border-bottom: 2px solid transparent;
}
.tab:hover { color: var(--tm-sys-color-on-surface); }
.tab--on { color: var(--tm-sys-color-on-surface); border-bottom-color: var(--tm-sys-color-secondary); }
.tab__n { min-width: 20px; padding: 1px 6px; border-radius: var(--tm-sys-shape-corner-pill); background: var(--tm-sys-color-secondary); color: var(--tm-sys-color-on-secondary); font-size: 10px; text-align: center; }
.empty { padding: var(--tm-sys-space-5); border: 1px dashed var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); }
.rows { list-style: none; margin: 0; padding: 0; border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); }
.bkrow { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: var(--tm-sys-space-2) var(--tm-sys-space-4); padding: var(--tm-sys-space-3) var(--tm-sys-space-4); }
.bkrow + .bkrow { border-top: 1px solid var(--tm-sys-color-outline-variant); }
.bkrow__main { display: grid; gap: 2px; min-width: 0; text-decoration: none; color: var(--tm-sys-color-on-surface); }
.bkrow__main:hover .bkrow__when { color: var(--tm-sys-color-primary-hover); }
.bkrow__ref { font-size: var(--tm-sys-type-data-size-xs); color: var(--tm-sys-color-secondary-hover); letter-spacing: .1em; }
.bkrow__when b { font-weight: 600; }
.bkrow__who { font-size: 14px; color: var(--tm-sys-color-on-surface-variant); }
.bkrow__total { font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes); font-size: 17px; }
.bkrow__age { font-size: var(--tm-sys-type-data-size-xs); color: var(--tm-sys-color-on-surface-faint); }
.chip { font-family: var(--tm-sys-type-data-family); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; padding: 4px 8px; border-radius: var(--tm-sys-shape-corner-pill); border: 1px solid var(--tm-sys-color-outline); color: var(--tm-sys-color-on-surface-faint); }
.chip--approved { color: var(--tm-sys-color-primary-hover); border-color: var(--tm-sys-color-primary-container); background: var(--tm-sys-color-primary-tint); }
.tab__n--late { background: var(--tm-sys-color-error); color: #fff; }
.chip--late { color: var(--tm-sys-color-error); border-color: var(--tm-sys-color-error); }
.find { display: flex; align-items: center; gap: var(--tm-sys-space-3); margin: 0 0 var(--tm-sys-space-4); }
.find input {
  flex: 1 1 auto; max-width: 420px; min-height: 40px; padding: 8px 12px; font-size: 15px;
  background: var(--tm-sys-color-surface); color: var(--tm-sys-color-on-surface); border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner);
}
.find input:focus { outline: none; border-color: var(--tm-sys-color-primary); }
.find__n { font-size: var(--tm-sys-type-data-size-xs); color: var(--tm-sys-color-on-surface-faint); }
.chip--warn { color: var(--tm-sys-color-secondary-hover); border-color: var(--tm-sys-color-secondary-container); background: var(--tm-sys-color-secondary-tint); cursor: help; }
.sec { margin-top: var(--tm-sys-space-7); border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-5); display: grid; gap: var(--tm-sys-space-3); }
.sec__k { margin: 0; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-secondary-hover); }
.sec__p { margin: 0; font-size: 14.5px; }
.bform { display: flex; flex-wrap: wrap; align-items: end; gap: var(--tm-sys-space-3); }
.bform :deep(.field) { min-width: 150px; }
.bform__reason { flex: 1 1 240px; }
.tick { display: flex; align-items: center; gap: 8px; font-size: 14px; min-height: var(--tm-sys-density-control-h); color: var(--tm-sys-color-on-surface-variant); cursor: pointer; }
.blist { list-style: none; margin: 0; padding: 0; display: grid; }
.blist li { display: flex; justify-content: space-between; align-items: center; gap: var(--tm-sys-space-3); padding: 10px 0; border-top: 1px solid var(--tm-sys-color-outline-variant); font-size: 14.5px; }
.blist b { font-weight: 600; }
.ic {
  height: 28px; padding: 0 10px; cursor: pointer; font-family: var(--tm-sys-type-data-family); font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
  background: transparent; color: var(--tm-sys-color-on-surface-variant); border: 1px solid var(--tm-sys-color-outline-variant); border-radius: var(--tm-sys-shape-corner);
}
.ic:hover { border-color: var(--tm-sys-color-error); color: var(--tm-sys-color-error); }
</style>
