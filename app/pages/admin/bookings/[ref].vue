<script setup lang="ts">
import type { Booking } from '~/utils/booking'
import { approvalQuote, depositState, holdEndsAt, sessionRange } from '~/utils/booking'
import type { Errors } from '~/utils/catalog'
import { fmtDate } from '~/utils/dates'
import { fmtMoney } from '~/utils/money'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const bookingRef = String(route.params.ref)
useHead({ title: bookingRef })

const { data: res, refresh } = await useAsyncData(`admin-booking-${bookingRef}`,
  () => adminCall<{ booking: Booking; clashes: string[] }>(`/api/admin/bookings/${bookingRef}`))
const b = computed(() => res.value?.data?.booking)
const flash = useState('admin-flash', () => '')

/* ---------- accept: the studio sets the start and how long it runs ---------- */
const ap = reactive({ start: b.value?.start ?? '09:00', hours: b.value?.requestedHours ?? 1, note: '' })
const preview = computed(() => {
  const x = b.value
  if (!x || !Number.isInteger(ap.hours) || ap.hours < 1) return null
  const { quote } = approvalQuote(x.package, x.addons, ap.hours)
  const extra = Math.max(0, ap.hours - (x.package.hours ?? ap.hours))
  return { range: sessionRange(x.date, ap.start, ap.hours), extra, total: quote.total, deposit: quote.deposit, changed: quote.total !== x.total }
})
/* most requests are fine as asked: one press accepts them; the form is for changes */
const asked = computed(() => {
  const x = b.value
  if (!x) return null
  return { range: sessionRange(x.date, x.start, x.requestedHours), total: approvalQuote(x.package, x.addons, x.requestedHours).quote.total }
})
const changing = ref(false)
const errors = ref<Errors>({})
const err = ref('')
const clashWith = ref<string[]>([])
const busy = ref('')
/* the last accept tried, so "Accept anyway" repeats exactly that one */
const lastAccept = ref<{ start: string; hours: number }>({ start: '', hours: 0 })

async function act(action: 'approve' | 'decline' | 'cancel', extra: Record<string, unknown> = {}) {
  busy.value = action; err.value = ''
  const r = await adminCall<{ booking: Booking; mailed: boolean }>(`/api/admin/bookings/${bookingRef}`, { method: 'POST', body: { action, note: ap.note, ...extra } })
  busy.value = ''
  if (r.error) {
    errors.value = r.fields ?? {}
    clashWith.value = Array.isArray((r.fields as { clashes?: unknown } | undefined)?.clashes) ? (r.fields as unknown as { clashes: string[] }).clashes : []
    err.value = r.error
    return
  }
  const done = { approve: 'accepted', decline: 'declined', cancel: 'cancelled' }[action]
  flash.value = `${bookingRef} ${done}. ` + (r.data!.mailed ? `${r.data!.booking.name} has been emailed.` : `The email to ${r.data!.booking.name} could not be sent: let them know by WhatsApp.`)
  clearNuxtData(['admin-bookings', 'admin-calendar', 'admin-counts'])
  return navigateTo({ path: '/admin/bookings', query: { view: 'calendar' } })
}
function accept(start: string, hours: number, override = false) {
  lastAccept.value = { start, hours }
  return act('approve', { start, hours, override })
}
const acceptAsAsked = () => accept(b.value!.start, b.value!.requestedHours)
const acceptChanged = () => accept(ap.start, ap.hours)
const acceptAnyway = () => accept(lastAccept.value.start, lastAccept.value.hours, true)

/* ---------- deposit: recorded by staff when the mobile money arrives ---------- */
const deposit = computed(() => (b.value ? depositState(b.value) : 'none'))
const holdEnds = computed(() => (b.value ? new Date(holdEndsAt(b.value)).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''))
const depositMsg = ref('')
async function setDeposit(paid: boolean) {
  busy.value = 'deposit'; err.value = ''
  const r = await adminCall(`/api/admin/bookings/${bookingRef}`, { method: 'POST', body: { action: paid ? 'deposit-paid' : 'deposit-unpaid' } })
  busy.value = ''
  if (r.error) { err.value = r.error; return }
  depositMsg.value = paid ? 'Deposit recorded as received.' : 'Deposit marked as not received.'
  clearNuxtData(['admin-bookings', 'admin-calendar', 'admin-counts'])
  await refresh()
}

const addonRows = computed(() => {
  const x = b.value
  if (!x) return []
  return Object.entries(x.addons).flatMap(([id, q]) => {
    const a = x.package.addons?.find((y) => y.id === id)
    return a ? [[`${a.name}${q > 1 ? ' × ' + q : ''}`, a.price == null ? 'Quoted separately' : 'K' + fmtMoney(a.price * q)] as [string, string]] : []
  })
})
const stamp = (s: string | null) => (s ? new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z').toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—')
const waLink = computed(() => (b.value ? 'https://wa.me/' + b.value.phone.replace(/[^\d]/g, '').replace(/^0/, '260') : '#'))
</script>

<template>
  <div>
    <NuxtLink to="/admin/bookings" class="mono back">← All bookings</NuxtLink>
    <p v-if="res?.error" class="err" role="alert">{{ res.error }}</p>
    <div v-else-if="b" class="bk">
      <div class="bk__head">
        <div>
          <p class="mono bk__ref">{{ b.ref }}</p>
          <h1 class="display h3 bk__h">{{ b.packageName }} · {{ fmtDate(b.date) }}</h1>
          <p class="muted bk__sub">Requested {{ stamp(b.createdAt) }}<template v-if="b.decidedAt"> · {{ b.status }} {{ stamp(b.decidedAt) }} by {{ b.decidedBy }}</template></p>
        </div>
        <span class="chip" :class="`chip--${b.status}`">{{ b.status === 'pending' ? 'Waiting' : b.status }}</span>
      </div>

      <div class="bk__grid">
        <section class="sec" aria-labelledby="s-book">
          <h2 id="s-book" class="sec__k">The booking</h2>
          <dl class="dl">
            <div><dt>Date</dt><dd>{{ fmtDate(b.date) }}</dd></div>
            <div v-if="b.status === 'approved'"><dt>Time</dt><dd>{{ sessionRange(b.date, b.start, b.approvedHours ?? b.requestedHours) }} · {{ b.approvedHours }} h</dd></div>
            <div v-else><dt>Asked for</dt><dd>From {{ b.start }} · about {{ b.requestedHours }} h</dd></div>
            <div><dt>Package</dt><dd>{{ b.packageName }} · {{ b.package.cov }}</dd></div>
            <div v-for="[k, v] in addonRows" :key="k"><dt>+ {{ k }}</dt><dd>{{ v }}</dd></div>
            <div><dt>Total</dt><dd><b>{{ b.total ? 'K' + fmtMoney(b.total) : 'On request' }}</b><template v-if="b.tbq"> plus items quoted separately</template></dd></div>
            <div v-if="b.total"><dt>Deposit</dt><dd>K{{ fmtMoney(b.deposit) }} ({{ b.depositPct }}%)</dd></div>
            <div><dt>Delivery</dt><dd>{{ b.deliveryText }}</dd></div>
          </dl>
        </section>

        <section class="sec" aria-labelledby="s-client">
          <h2 id="s-client" class="sec__k">The client</h2>
          <dl class="dl">
            <div><dt>Name</dt><dd>{{ b.name }}<template v-if="b.partner"> &amp; {{ b.partner }}</template></dd></div>
            <div><dt>Email</dt><dd><a :href="`mailto:${b.email}`">{{ b.email }}</a></dd></div>
            <div><dt>Phone</dt><dd><a :href="`tel:${b.phone}`">{{ b.phone }}</a> · <a :href="waLink" target="_blank" rel="noopener">WhatsApp</a></dd></div>
            <div><dt>Venue</dt><dd>{{ b.venue || '—' }}</dd></div>
            <div><dt>Where</dt><dd>{{ b.region || '—' }}</dd></div>
            <div><dt>Guests</dt><dd>{{ b.guests || '—' }}</dd></div>
            <div><dt>Found us via</dt><dd>{{ b.heard || '—' }}</dd></div>
          </dl>
          <h3 class="sec__k sec__k--sub">What matters to them</h3>
          <p class="notes">{{ b.notes || 'No notes.' }}</p>
        </section>
      </div>

      <!-- ACCEPT / DECLINE -->
      <section v-if="b.status === 'pending'" class="sec act" aria-labelledby="s-act">
        <h2 id="s-act" class="sec__k">Accept or decline</h2>
        <p v-if="res?.data?.clashes.length" class="warn">As asked, this overlaps: {{ res.data.clashes.join('; ') }}.</p>
        <div v-if="!changing" class="asked">
          <BaseButton variant="copper" :disabled="!!busy" @click="acceptAsAsked">{{ busy === 'approve' ? 'Accepting…' : 'Accept as asked' }}</BaseButton>
          <span class="asked__what">{{ asked?.range }} · {{ b.requestedHours }} h · {{ asked?.total ? 'K' + fmtMoney(asked.total) : 'On request' }}</span>
          <button type="button" class="linkish" @click="changing = true">Change the time or length</button>
        </div>
        <div v-else class="act__row">
          <FormField id="a-start" label="Start" :error="errors.start"><input id="a-start" v-model="ap.start" type="time" step="1800"></FormField>
          <FormField id="a-hours" label="Hours" :error="errors.hours" :hint="`Asked for ${b.requestedHours}; package includes ${b.package.hours}`">
            <input id="a-hours" v-model.number="ap.hours" type="number" min="1" max="24" inputmode="numeric">
          </FormField>
          <div v-if="preview" class="pv">
            <span class="mono pv__k">Session</span><b>{{ preview.range }}</b>
            <span class="mono pv__k">Total</span><b>{{ preview.total ? 'K' + fmtMoney(preview.total) : 'On request' }}<template v-if="preview.extra"> · {{ preview.extra }} extra h billed</template></b>
            <span v-if="preview.changed" class="pv__note">The client sees the new total in their confirmation email.</span>
          </div>
        </div>
        <FormField id="a-note" label="Message to the client (optional)" hint="Added to the acceptance or decline email.">
          <textarea id="a-note" v-model="ap.note" rows="3" class="short" />
        </FormField>
        <p v-if="err" class="err" role="alert">{{ err }}<template v-if="clashWith.length">: {{ clashWith.join('; ') }}</template></p>
        <div class="act__btns">
          <BaseButton v-if="clashWith.length" variant="copper" :disabled="!!busy" @click="acceptAnyway">Accept anyway</BaseButton>
          <BaseButton v-else-if="changing" variant="copper" :disabled="!!busy" @click="acceptChanged">{{ busy === 'approve' ? 'Accepting…' : 'Accept with these changes' }}</BaseButton>
          <AdminConfirmButton label="Decline" :question="`Decline ${b.ref}? ${b.name} will be emailed${ap.note ? ' with your message' : ''}.`" confirm-label="Yes, decline" :disabled="!!busy" @confirm="act('decline')" />
        </div>
      </section>

      <section v-if="b.status === 'approved' && deposit !== 'none'" id="s-dep" class="sec dep" :class="`dep--${deposit}`" aria-labelledby="s-dep-h">
        <h2 id="s-dep-h" class="sec__k">Deposit · K{{ fmtMoney(b.deposit) }}</h2>
        <p v-if="deposit === 'paid'" class="dep__state">Received · recorded {{ stamp(b.depositPaidAt) }} by {{ b.depositPaidBy }}</p>
        <p v-else-if="deposit === 'overdue'" class="dep__state">Overdue: the 72-hour hold ended {{ holdEnds }}. Chase {{ b.name }}, or cancel to free the date.</p>
        <p v-else class="dep__state">Due by {{ holdEnds }} (72 hours from acceptance), by mobile money with reference {{ b.ref }}.</p>
        <p v-if="depositMsg" class="mono ok" role="status">{{ depositMsg }}</p>
        <div class="act__btns">
          <BaseButton v-if="deposit !== 'paid'" variant="copper" :disabled="!!busy" @click="setDeposit(true)">{{ busy === 'deposit' ? 'Saving…' : 'Mark deposit received' }}</BaseButton>
          <button v-else type="button" class="linkish" :disabled="!!busy" @click="setDeposit(false)">Mark as not received</button>
          <a class="linkish" :href="`${waLink}?text=${encodeURIComponent(`Hi ${b.name}, a reminder that the deposit of K${fmtMoney(b.deposit)} for ${fmtDate(b.date)} (${b.ref}) holds your date.`)}`" target="_blank" rel="noopener">Send a reminder on WhatsApp</a>
        </div>
      </section>

      <section v-if="b.status === 'approved'" class="sec act" aria-labelledby="s-act">
        <h2 id="s-act" class="sec__k">Cancel this booking</h2>
        <p class="muted sec__p">Frees its time on the calendar and emails the client.</p>
        <FormField id="c-note" label="Reason (optional, sent to the client)"><textarea id="c-note" v-model="ap.note" rows="2" class="short" /></FormField>
        <p v-if="err" class="err" role="alert">{{ err }}</p>
        <div class="act__btns">
          <AdminConfirmButton label="Cancel booking" :question="`Cancel ${b.ref}? Its time becomes bookable again and ${b.name} will be emailed.`" confirm-label="Yes, cancel it" :disabled="!!busy" @confirm="act('cancel')" />
        </div>
      </section>

      <p v-else-if="b.status !== 'pending' && b.decisionNote" class="muted">Note sent to the client: “{{ b.decisionNote }}”</p>

      <!-- phones: the next thing to do stays under the thumb -->
      <div v-if="b.status === 'pending' || deposit === 'due' || deposit === 'overdue'" class="mbar">
        <template v-if="b.status === 'pending'">
          <BaseButton variant="copper" size="sm" :disabled="!!busy" @click="acceptAsAsked">Accept as asked</BaseButton>
          <a href="#s-act" class="linkish">Change or decline ↓</a>
        </template>
        <template v-else>
          <BaseButton variant="copper" size="sm" :disabled="!!busy" @click="setDeposit(true)">Mark deposit received</BaseButton>
          <a href="#s-dep" class="linkish">{{ deposit === 'overdue' ? 'Overdue' : 'Deposit' }} ↓</a>
        </template>
      </div>

      <details class="rec">
        <summary class="mono">Terms record</summary>
        <dl class="dl">
          <div><dt>Terms of business</dt><dd>{{ b.termsVersion }}</dd></div>
          <div><dt>Privacy notice</dt><dd>{{ b.privacyVersion }}</dd></div>
          <div><dt>Text fingerprint</dt><dd class="mono">{{ b.termsFingerprint || '—' }}</dd></div>
          <div><dt>Accepted at</dt><dd>{{ stamp(b.acceptedAt) }}</dd></div>
          <div><dt>Marketing updates</dt><dd>{{ b.marketingConsent ? 'Opted in' : 'No' }}</dd></div>
        </dl>
      </details>
    </div>
  </div>
</template>

<style scoped>
.back { font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-on-surface-faint); text-decoration: none; }
.back:hover { color: var(--tm-sys-color-primary-hover); }
.bk { display: grid; gap: var(--tm-sys-space-5); margin-top: var(--tm-sys-space-4); }
.bk__head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: start; gap: var(--tm-sys-space-4); }
.bk__ref { margin: 0; font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .14em; color: var(--tm-sys-color-secondary-hover); }
.bk__h { margin: 4px 0 0; }
.bk__sub { margin: 6px 0 0; font-size: 14px; }
.bk__grid { display: grid; gap: var(--tm-sys-space-5); }
@media (min-width: 900px) { .bk__grid { grid-template-columns: 1fr 1fr; align-items: start; } }
.sec { border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-5); display: grid; gap: var(--tm-sys-space-3); margin: 0; }
.sec__k { margin: 0; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-secondary-hover); }
.sec__k--sub { margin-top: var(--tm-sys-space-2); }
.sec__p { margin: 0; font-size: 14.5px; }
.dl { margin: 0; display: grid; }
.dl div { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: var(--tm-sys-space-3); padding: 8px 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant); font-size: 14.5px; }
.dl div:last-child { border-bottom: 0; }
.dl dt { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .1em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); padding-top: 3px; }
.dl dd { margin: 0; overflow-wrap: anywhere; }
.dl a { color: var(--tm-sys-color-primary-hover); }
.notes { margin: 0; white-space: pre-wrap; font-size: 15px; }
.chip { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; padding: 6px 10px; border-radius: var(--tm-sys-shape-corner-pill); border: 1px solid var(--tm-sys-color-outline); color: var(--tm-sys-color-on-surface-faint); }
.chip--pending { color: var(--tm-sys-color-secondary-hover); border-color: var(--tm-sys-color-secondary-container); background: var(--tm-sys-color-secondary-tint); }
.chip--approved { color: var(--tm-sys-color-primary-hover); border-color: var(--tm-sys-color-primary-container); background: var(--tm-sys-color-primary-tint); }
.act { border-color: var(--tm-sys-color-secondary-container); }
.act__row { display: flex; flex-wrap: wrap; align-items: start; gap: var(--tm-sys-space-4); }
.act__row :deep(.field) { width: 160px; }
.pv { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: baseline; padding: 10px 14px; border: 1px dashed var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); font-size: 14.5px; }
.pv__k { font-size: var(--tm-sys-type-data-size-xs); color: var(--tm-sys-color-on-surface-faint); letter-spacing: .1em; text-transform: uppercase; }
.pv__note { grid-column: 1 / -1; font-size: 13px; color: var(--tm-sys-color-on-surface-variant); }
.warn { margin: 0; padding: 10px 14px; border-radius: var(--tm-sys-shape-corner); border: 1px solid var(--tm-sys-color-secondary-container); background: var(--tm-sys-color-secondary-tint); color: var(--tm-sys-color-secondary-hover); font-size: 14.5px; }
.short { min-height: 64px !important; }
.act__btns { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-3); }
.del:hover { color: var(--tm-sys-color-error); }
.rec summary { cursor: pointer; font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-on-surface-faint); }
.rec .dl { margin-top: var(--tm-sys-space-3); }
.asked { display: flex; flex-wrap: wrap; align-items: center; gap: var(--tm-sys-space-2) var(--tm-sys-space-4); }
.asked__what { font-size: 15px; }
.linkish {
  background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px;
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .06em; color: var(--tm-sys-color-primary-hover);
}
.linkish:disabled { opacity: .5; cursor: default; }
.dep__state { margin: 0; font-size: 15px; }
.dep--due { border-color: var(--tm-sys-color-secondary-container); }
.dep--overdue { border-color: var(--tm-sys-color-error); }
.dep--overdue .dep__state { color: var(--tm-sys-color-error); }
.dep--paid { border-color: var(--tm-sys-color-primary-container); }
.dep--paid .dep__state { color: var(--tm-sys-color-primary-hover); }
.ok { margin: 0; font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-primary-hover); }
.mbar { display: none; }
@media (max-width: 760px) {
  .mbar {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: var(--tm-sys-space-3);
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); border-top: 1px solid var(--tm-sys-color-outline);
    background: var(--tm-sys-elevation-5-bg); backdrop-filter: var(--tm-sys-elevation-5-filter); -webkit-backdrop-filter: var(--tm-sys-elevation-5-filter);
  }
  .bk { padding-bottom: 80px; }
}
</style>
