<script setup lang="ts">
import type { BookingSettings, Service } from '~/content/types'
import { SITE } from '~/content/site'
import { TERMS_VERSION, PRIVACY_VERSION } from '~/content/terms'
import { useBookingQuote } from '~/composables/useBookingQuote'
import { useBookingApi } from '~/composables/useBookingApi'
import { useTermsFingerprint } from '~/composables/useTermsFingerprint'
import { copyText } from '~/composables/useClipboard'
import { fmtDate } from '~/utils/dates'
import { fmtMoney } from '~/utils/money'
import { dayAvailability, bookedRanges } from '~/utils/availability'
import { hourlySlots } from '~/utils/catalog'
import { momoLine, paymentLines, requestedHoursFor } from '~/utils/booking'

/* Packages, bookable hours and form choices come from the CMS via the page.
   The client picks a start time only; the studio sets how long the session
   runs when it accepts the request in the admin. */
const props = defineProps<{ services: Service[]; settings: BookingSettings }>()

const STEPS = ['Coverage', 'Date', 'Add-ons', 'Details', 'Confirm']
const REGIONS = computed(() => props.settings.regions)
const HEARD = computed(() => props.settings.heard)
const SLOTS = computed(() => hourlySlots(props.settings.dayStart, props.settings.dayEnd))

/* ---------- state ---------- */
const step = ref(1)
const dir = ref(1)
const serviceId = ref<string | null>(null)
const service = computed<Service | null>(() => props.services.find((s) => s.id === serviceId.value) ?? null)
const date = ref<string | null>(null)
const start = ref<string | null>(null)
const quote = useBookingQuote(service)
const api = useBookingApi()
const fingerprint = useTermsFingerprint()

const f = reactive({
  // no pre-filled answers: a default nobody changes reads as an answer, and
  // would fill "how did you find us" with the first option
  name: '', partner: '', email: '', phone: '', venue: '', region: '', guests: '',
  heard: '', notes: '', terms: false, marketing: false,
})
const formErr = ref('')
const sendErr = ref('')
/* the server turned the request down because the date or time is no longer free */
const slotGone = ref(false)
const sending = ref(false)
/* true when the request reached the studio (stored, or emailed);
   false means the visitor has to send the text themselves */
const delivered = ref(false)
/* the client's receipt email went out, so the page can say a copy is in their inbox */
const emailed = ref(false)
const data = ref<ReturnType<typeof collect> | null>(null)
const copyLabel = ref('Copy request')
const stepsEl = ref<HTMLElement | null>(null)
const bookingTextEl = ref<HTMLElement | null>(null)
const announce = ref('')

/* ---------- progress survives a refresh or an app switch ----------
   Kept in this tab's sessionStorage until the request is sent. The terms tick
   is never restored: consent is given afresh. */
const SAVE_KEY = 'tm-booking-v1'
const restored = ref(false)
onMounted(async () => {
  api.loadAvailability()
  let saved: { step: number; serviceId: string; date: string | null; start: string | null; add: Record<string, number>; f: Partial<typeof f> } | null = null
  try { saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || 'null') } catch {}
  if (!saved || !props.services.some((s) => s.id === saved!.serviceId)) return
  serviceId.value = saved.serviceId
  await nextTick() // let the package watcher reset first, then put the rest back
  date.value = saved.date
  start.value = saved.start
  quote.add.value = saved.add ?? {}
  Object.assign(f, { ...saved.f, terms: false })
  step.value = Math.min(Math.max(saved.step, 1), 4)
  restored.value = true
})
watch([step, serviceId, date, start, () => quote.add.value, f], () => {
  if (!serviceId.value || step.value > 4) return
  const { terms: _t, ...rest } = f
  try { sessionStorage.setItem(SAVE_KEY, JSON.stringify({ step: step.value, serviceId: serviceId.value, date: date.value, start: start.value, add: quote.add.value, f: rest })) } catch {}
}, { deep: true })
function forget() { try { sessionStorage.removeItem(SAVE_KEY) } catch {} }
function startOver() {
  forget()
  restored.value = false
  serviceId.value = null
  Object.assign(f, { name: '', partner: '', email: '', phone: '', venue: '', region: '', guests: '', heard: '', notes: '', terms: false, marketing: false })
  touched.clear(); tried.value = false; formErr.value = ''
  go(1)
}

watch(serviceId, () => {
  date.value = null; start.value = null; quote.reset()
})

/* ---------- availability for the chosen day ---------- */
const busy = api.busy
const dayInfo = computed(() => (date.value ? dayAvailability(busy.value, date.value, SLOTS.value) : null))
const booked = computed(() => (date.value && api.mode.value === 'live' ? bookedRanges(busy.value, date.value) : []))
const takenSlots = computed(() => dayInfo.value?.taken ?? [])
// a start free on one day may be taken on another, or availability may
// arrive after the choice was made: never carry a clashing start forward
watch([date, takenSlots], () => { if (start.value && takenSlots.value.includes(start.value)) start.value = null })
watch(dayInfo, (d) => { if (d?.state === 'full') { date.value = null; start.value = null } })

/* hours asked for: the package's own plus any extra time added in step 3. Kept
   with the request for staff; the client only ever sees the start time, since
   the studio sets the length when it accepts. */
const askedHours = computed(() => (service.value ? requestedHoursFor(service.value, quote.add.value) : 0))
const timeText = computed(() => start.value)
/* extra time is not offered: the studio sets the length when it accepts */
const stepAddons = computed(() => service.value?.addons.filter((a) => a.id !== 'time') ?? [])

const canDate = computed(() => !!service.value)
const canAddons = computed(() => !!date.value && !!start.value && dayInfo.value?.state !== 'full')
const summaryTime = computed(() => timeText.value || '—')
const momo = momoLine(SITE.momo)

/* ---------- navigation ---------- */
/* set when the visitor jumps from the review to fix one thing */
const fromReview = ref(false)
function go(n: number) {
  dir.value = n >= step.value ? 1 : -1
  if (n >= 5) fromReview.value = false
  step.value = n
  announce.value = n <= 5 ? `Step ${n} of 5: ${STEPS[n - 1]}` : 'Request sent'
  if (n === 5) { data.value = collect(); sendErr.value = ''; slotGone.value = false }
  nextTick(() => {
    const top = stepsEl.value
    if (top) window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' })
  })
}

/* the new step's heading takes focus once it is on screen, so keyboard and
   screen-reader users carry on from the top of the step, not from <body> */
function focusStep() {
  document.getElementById(`s${step.value}-h`)?.focus({ preventScroll: true })
}
function editFrom(n: number) {
  fromReview.value = true
  go(n)
}
const canReturn = computed(() => fromReview.value && (step.value !== 1 || canAddons.value) && (step.value !== 2 || canAddons.value))
function backToReview() {
  if (step.value === 4) return submitDetails()
  go(5)
}

/* ---------- collect ---------- */
function collect() {
  const svc = service.value!
  const t = quote.quote.value
  const addons = svc.addons.flatMap((a) => {
    const q = quote.qty(a.id)
    return q ? [{ id: a.id, name: a.name, qty: q, unit: a.unit || '', amount: a.price == null ? null : a.price * q }] : []
  })
  return {
    // provisional: the server issues the real reference when it stores the request
    ref: 'TM-' + Date.now().toString(36).slice(-6).toUpperCase(),
    service: svc.name, serviceId: svc.id,
    base: svc.price, coverage: svc.cov,
    addons, addonQty: { ...quote.add.value }, total: t.total, tbq: t.tbc,
    deposit: t.deposit, depositPct: t.depositPct,
    delivery: quote.deliveryNumber.value, deliveryText: quote.delivery.value,
    date: date.value!, dateLabel: fmtDate(date.value!), time: timeText.value || 'To confirm', start: start.value!, hours: askedHours.value,
    name: f.name.trim(), partner: f.partner.trim(), email: f.email.trim(), phone: f.phone.trim(),
    venue: f.venue.trim(), region: f.region, guests: f.guests.trim(),
    notes: f.notes.trim(), heard: f.heard,
    termsAccepted: f.terms,
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_VERSION,
    termsFingerprint: fingerprint.value,
    marketingConsent: f.marketing,
    acceptedAt: new Date().toISOString(),
  }
}

/** [label, value, the step that changes it] */
const reviewRows = computed<[string, string, number?][]>(() => {
  const d = data.value
  if (!d) return []
  const rows: [string, string, number?][] = [
    ['Coverage', d.service + ' · ' + d.coverage, 1],
    ['Date', d.dateLabel, 2], ['Time', d.time, 2],
    ['Delivery', d.deliveryText],
    ['Name', d.name + (d.partner ? ' & ' + d.partner : ''), 4],
    ['Email', d.email, 4], ['Phone', d.phone, 4],
    ['Venue', d.venue || '—', 4], ['Region', d.region, 4],
    ['Guests', d.guests || '—', 4], ['Found us via', d.heard || '—', 4],
  ]
  if (d.addons.length) rows.push(['Add-ons', d.addons.map((a) => a.name + (a.qty > 1 ? ' ×' + a.qty : '') + (a.amount == null ? ' (quoted separately)' : '')).join(', '), 3])
  rows.push(['Total', d.total ? 'K' + fmtMoney(d.total) + (d.tbq ? ' plus items quoted separately' : '') : 'On request'])
  if (d.total) rows.push(['Deposit to hold', 'K' + fmtMoney(d.deposit) + ' (' + d.depositPct + '%) — non-refundable'])
  rows.push(['Payment', 'Mobile money to ' + momo + ', once we confirm'])
  if (d.notes) rows.push(['Notes', d.notes, 4])
  rows.push(['Terms accepted', d.termsVersion])
  if (d.marketingConsent) rows.push(['Marketing updates', 'Yes, opted in'])
  return rows
})

function bookingText(d: NonNullable<typeof data.value>): string {
  const lines = [
    'BOOKING REQUEST — TMILADZI MEDIA',
    'Reference : ' + d.ref, '',
    'Coverage  : ' + d.service + ' (' + d.coverage + ')',
    'Date      : ' + d.dateLabel,
    'Time      : ' + d.time,
    'Delivery  : ' + d.deliveryText, '',
    'Name      : ' + d.name + (d.partner ? ' & ' + d.partner : ''),
    'Email     : ' + d.email,
    'Phone     : ' + d.phone,
    'Venue     : ' + (d.venue || '—'),
    'Region    : ' + d.region,
    'Guests    : ' + (d.guests || '—'),
    'Found via : ' + d.heard, '',
  ]
  if (d.base != null) lines.push('Base      : K' + fmtMoney(d.base))
  for (const a of d.addons) lines.push('  + ' + a.name + (a.qty > 1 ? ' x' + a.qty : '') + ' : ' + (a.amount == null ? 'quoted separately' : 'K' + fmtMoney(a.amount)))
  lines.push('Total     : ' + (d.total ? 'K' + fmtMoney(d.total) : 'on request'))
  if (d.total) lines.push('Deposit   : K' + fmtMoney(d.deposit) + ' (' + d.depositPct + '%)')
  lines.push('', ...paymentLines(SITE.momo, d.ref, d.total ? d.deposit : null))
  lines.push('', 'NOTES', d.notes || '—')
  lines.push('', 'Terms of business accepted : ' + d.termsVersion,
    'Privacy notice version     : ' + d.privacyVersion,
    'Text fingerprint           : ' + d.termsFingerprint,
    'Accepted at                : ' + d.acceptedAt,
    'Marketing consent          : ' + (d.marketingConsent ? 'yes' : 'no'))
  return lines.join('\n')
}
const requestText = computed(() => (data.value ? bookingText(data.value) : ''))
const confirmLine = computed(() => {
  const d = data.value
  if (!d) return ''
  return d.service + ' on ' + d.dateLabel + ', starting ' + d.start +
    (d.total ? '. Deposit to hold the date: K' + fmtMoney(d.deposit) + '.' : '. We will come back with a quotation.')
})
const waHref = computed(() => {
  const d = data.value
  if (!d) return SITE.whatsapp
  return SITE.whatsapp + '?text=' + encodeURIComponent(`Hi Tmiladzi Media — I've just sent booking request ${d.ref} for ${d.service} on ${d.dateLabel}.`)
})

/* ---------- details validation ----------
   A field says what is wrong once the visitor leaves it (or presses Review),
   and the message updates as they type, so it clears the moment it is fixed.
   Review stays greyed out until the terms are ticked: a cancellation term is
   only worth having if it was put in front of the client before they paid,
   and this is the record that it was. */
const touched = reactive(new Set<string>())
const tried = ref(false)
const problems = computed(() => {
  const em = f.email.trim()
  return {
    name: f.name.trim() ? undefined : 'Please add your name',
    email: !em ? 'Please add your email so we can reply'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) ? 'That does not look like an email address. Check for a typo.' : undefined,
    phone: !f.phone.trim() ? 'Please add a phone or WhatsApp number'
      : f.phone.replace(/\D/g, '').length < 9 ? 'That number looks too short' : undefined,
    region: f.region ? undefined : 'Please choose where it is: travel is quoted from this',
  }
})
type DetailField = keyof typeof problems.value
const fieldErr = (k: DetailField) => (tried.value || touched.has(k) ? problems.value[k] : undefined)
function onLeave(e: FocusEvent) {
  const id = (e.target as HTMLElement | null)?.id ?? ''
  if (id.startsWith('k-')) touched.add(id.slice(2))
}
watch(problems, (p) => { if (!p.name && !p.email && !p.phone && !p.region) formErr.value = '' })

function submitDetails() {
  if (!f.terms) return // the button is disabled; Enter in a field must not get past it either
  tried.value = true
  const first = (['name', 'email', 'phone', 'region'] as const).find((k) => problems.value[k])
  if (first) {
    formErr.value = 'Please fix the highlighted fields so we can reply to you.'
    nextTick(() => document.getElementById('k-' + first)?.focus())
    return
  }
  formErr.value = ''
  go(5)
}

/* ---------- send ---------- */
const COPY_FALLBACK = 'Copy the request below and WhatsApp it to +260 974 901 668 — we will pick it up straight away.'

async function send() {
  const d = data.value ?? collect()
  data.value = d
  sendErr.value = ''
  slotGone.value = false
  sending.value = true
  try {
    const r = await api.submit({
      serviceId: d.serviceId, date: d.date, start: d.start, addons: d.addonQty,
      name: d.name, partner: d.partner, email: d.email, phone: d.phone, venue: d.venue, region: d.region,
      guests: d.guests, heard: d.heard, notes: d.notes, termsAccepted: d.termsAccepted, termsVersion: d.termsVersion,
      privacyVersion: d.privacyVersion, termsFingerprint: d.termsFingerprint, marketingConsent: d.marketingConsent,
    })
    if (r.kind === 'stored') {
      // the server's reference and prices are the ones on record
      Object.assign(d, { ref: r.receipt.ref, total: r.receipt.total, deposit: r.receipt.deposit, depositPct: r.receipt.depositPct, tbq: r.receipt.tbq })
      delivered.value = true
      emailed.value = r.receipt.emailed
      forget()
    } else if (r.kind === 'rejected') {
      // stay here: nothing was booked, and the visitor can fix it
      sendErr.value = r.message
      slotGone.value = r.field === 'start' || r.field === 'date'
      if (slotGone.value) api.loadAvailability()
      return
    } else if (r.kind === 'no-database') {
      await emailRequest(d)
    } else {
      delivered.value = false
      sendErr.value = 'We could not send that automatically. ' + COPY_FALLBACK
    }
    go(6)
  } finally {
    sending.value = false
  }
}

/* No bookings database on this deployment: the request goes by email instead. */
async function emailRequest(d: NonNullable<typeof data.value>) {
  try {
    const r = await $fetch<{ ok: boolean; sent?: boolean; reason?: string }>('/api/send', {
      method: 'POST',
      body: { kind: 'booking', subject: `Booking request ${d.ref} — ${d.service}, ${d.dateLabel}`, text: bookingText(d), replyTo: d.email, name: d.name },
    })
    delivered.value = !!(r.ok && r.sent)
    if (!delivered.value) sendErr.value = (r.reason === 'not-configured' ? 'Automatic sending is not switched on yet. ' : 'We could not send that automatically. ') + COPY_FALLBACK
  } catch {
    delivered.value = false
    sendErr.value = 'We could not send that automatically. ' + COPY_FALLBACK
  }
}

async function copy() {
  copyLabel.value = await copyText(requestText.value, bookingTextEl.value)
  setTimeout(() => { copyLabel.value = 'Copy request' }, 1800)
}

const noticeNote = 'A date with a copper corner already has something booked; crossed dates are fully booked.'
const addonIntro = computed(() => {
  if (!stepAddons.value.length) return 'No add-ons for this service yet — tell us in the notes what else you need and we will quote it.'
  return 'Everything here is optional. The total on the right updates as you go. Need a longer session? Say so in the notes; we confirm the length when we accept your booking.'
})
</script>

<template>
  <div>
    <p v-if="api.mode.value === 'loading'" class="preview-note preview-note--live" role="status">
      <span class="dot dot--wait" aria-hidden="true" />Checking availability…
    </p>
    <p v-else-if="api.mode.value === 'preview'" class="preview-note" role="note">
      <span class="dot" aria-hidden="true" />Preview mode · sample availability
    </p>
    <p v-else-if="api.mode.value === 'unavailable'" class="preview-note" role="note">
      <span class="dot" aria-hidden="true" />Availability unreachable · every date shown open, confirmed by reply
    </p>
    <p class="sr-only" aria-live="polite">{{ announce }}</p>
    <p v-if="restored && step < 5" class="restored" role="status">We kept the booking you started.
      <button type="button" @click="startOver">Start over</button></p>

    <div ref="stepsEl"><BookingStepIndicator :steps="STEPS" :current="step" /></div>

    <div class="split">
      <div>
        <!-- STEP 1 — COVERAGE -->
        <Transition :name="dir > 0 ? 'step-fwd' : 'step-back'" mode="out-in" @after-enter="focusStep">
        <section v-if="step === 1" key="1" class="bstep" aria-labelledby="s1-h">
          <h2 id="s1-h" tabindex="-1" class="sr-only">Choose your package</h2>
          <BookingServicePicker v-model="serviceId" :services="services" />
          <div class="bactions">
            <BaseButton v-if="canReturn" variant="copper" type="button" arrow @click="backToReview">Back to review</BaseButton>
            <BaseButton :variant="canReturn ? 'ghost' : 'copper'" type="button" :disabled="!canDate" arrow :aria-describedby="canDate ? undefined : 'need-1'" @click="go(2)">Choose a date</BaseButton>
          </div>
          <p v-if="!canDate" id="need-1" class="mono terms-needed">Choose a package above to continue.</p>
        </section>

        <!-- STEP 2 — DATE -->
        <section v-else-if="step === 2" key="2" class="bstep" aria-labelledby="s2-h">
          <h2 id="s2-h" tabindex="-1" class="display h3 bstep__h">When is it?</h2>
          <p class="muted bstep__p">{{ noticeNote }}</p>
          <div class="mt-5">
            <BookingAvailabilityCalendar v-model="date" :busy="busy" :slots="SLOTS" :loading="api.mode.value === 'loading'" />
          </div>
          <p v-if="booked.length" class="mono booked">Already booked {{ fmtDate(date!) }}: {{ booked.map((b) => `${b.from}–${b.to}`).join(', ') }}</p>
          <BookingSlotList v-model:start="start" :slots="SLOTS" :taken="takenSlots" :waiting="api.mode.value === 'loading'" />
          <div class="bactions">
            <BaseButton type="button" @click="go(1)">← Back</BaseButton>
            <BaseButton v-if="canReturn" variant="copper" type="button" arrow @click="backToReview">Back to review</BaseButton>
            <BaseButton v-else variant="copper" type="button" :disabled="!canAddons" arrow :aria-describedby="canAddons ? undefined : 'need-2'" @click="go(3)">Add-ons</BaseButton>
          </div>
          <p v-if="!canAddons" id="need-2" class="mono terms-needed">{{ date ? 'Pick a start time' : 'Pick a date, then a start time,' }} to continue.</p>
        </section>

        <!-- STEP 3 — ADD-ONS -->
        <section v-else-if="step === 3" key="3" class="bstep" aria-labelledby="s3-h">
          <h2 id="s3-h" tabindex="-1" class="display h3 bstep__h">Anything extra?</h2>
          <p class="muted bstep__p">{{ addonIntro }}</p>
          <BookingAddonStepper v-if="service" :addons="stepAddons" :qty="quote.qty" @bump="quote.bump" />
          <div class="bactions">
            <BaseButton type="button" @click="go(2)">← Back</BaseButton>
            <BaseButton v-if="canReturn" variant="copper" type="button" arrow @click="backToReview">Back to review</BaseButton>
            <BaseButton v-else variant="copper" type="button" arrow @click="go(4)">Your details</BaseButton>
          </div>
        </section>

        <!-- STEP 4 — DETAILS -->
        <section v-else-if="step === 4" key="4" class="bstep" aria-labelledby="s4-h">
          <h2 id="s4-h" tabindex="-1" class="display h3 bstep__h">Tell us about the day</h2>
          <p class="muted bstep__p">The more we know now, the fewer surprises later —
            which is the single biggest thing that goes wrong on a shoot.</p>
          <form class="form mt-5" novalidate @submit.prevent="submitDetails" @focusout="onLeave">
            <fieldset class="fs">
              <legend class="sr-only">Your details</legend>
              <FormRow>
                <FormField id="k-name" label="Your name" :error="fieldErr('name')" required>
                  <input id="k-name" v-model="f.name" required autocomplete="name" placeholder="Full name">
                </FormField>
                <FormField id="k-partner" :label="service?.id === 'wedding' ? 'Partner’s name' : 'Second contact'">
                  <input id="k-partner" v-model="f.partner" placeholder="If it applies">
                </FormField>
              </FormRow>
              <FormRow>
                <FormField id="k-email" label="Email" :error="fieldErr('email')" required>
                  <input id="k-email" v-model="f.email" type="email" required autocomplete="email" placeholder="you@email.com">
                </FormField>
                <FormField id="k-phone" label="Phone / WhatsApp" :error="fieldErr('phone')" required>
                  <input id="k-phone" v-model="f.phone" type="tel" required autocomplete="tel" placeholder="+260 …">
                </FormField>
              </FormRow>
            </fieldset>
            <fieldset class="fs">
              <legend class="sr-only">The day</legend>
              <FormRow>
                <FormField id="k-venue" label="Venue or location">
                  <input id="k-venue" v-model="f.venue" placeholder="e.g. Nsobe Game Camp, Ndola">
                </FormField>
                <FormField id="k-region" label="Where is it?" :error="fieldErr('region')" required>
                  <select id="k-region" v-model="f.region"><option value="" disabled>Choose…</option><option v-for="o in REGIONS" :key="o">{{ o }}</option></select>
                </FormField>
              </FormRow>
              <FormRow>
                <FormField id="k-guests" label="Approximate guests">
                  <input id="k-guests" v-model="f.guests" inputmode="numeric" placeholder="e.g. 180">
                </FormField>
                <FormField id="k-heard" label="How did you find us? (optional)">
                  <select id="k-heard" v-model="f.heard"><option value="">Choose…</option><option v-for="o in HEARD" :key="o">{{ o }}</option></select>
                </FormField>
              </FormRow>
              <FormField id="k-notes" label="What matters most to you about the photographs?">
                <textarea id="k-notes" v-model="f.notes" placeholder="Family groups that must happen, people who are travelling in, a moment you don't want missed, a look you have in mind, or parts of another package you'd like swapped in…" />
              </FormField>
            </fieldset>

            <KeyTerms title="Before you go on — the three that cost money">
              <li>The deposit is <strong>50% of the total and it is not
                  refundable</strong>. It pays for taking your date off the market.</li>
              <li>Cancel close to the day and <strong>the balance becomes
                  payable too</strong>, on a sliding scale — 60 days out for a wedding, 14 for
                  everything else.</li>
              <li>You may <strong>move your date once free of charge</strong>
                  if you give us 30 days' notice on a wedding, 7 on anything else.</li>
              <template #action><BaseButton size="sm" to="/terms" arrow>Read the full terms</BaseButton></template>
            </KeyTerms>

            <div id="acceptWrap">
              <AcceptBox id="k-terms" v-model="f.terms">
                I have read and accept the
                <NuxtLink to="/terms">Terms of business</NuxtLink> and the
                <NuxtLink to="/privacy">Privacy Notice</NuxtLink>, including the cancellation
                terms and the non-refundable deposit.
              </AcceptBox>
            </div>
            <AcceptBox id="k-marketing" v-model="f.marketing" quiet>
              <em>Optional.</em> I'm happy to receive occasional updates
              about Tmiladzi Media's work. Nothing to do with your booking, and you can stop it
              any time.
            </AcceptBox>

            <p v-if="formErr" class="err" role="alert">{{ formErr }}</p>
            <div class="bactions">
              <BaseButton type="button" @click="go(3)">← Back</BaseButton>
              <BaseButton variant="copper" type="submit" arrow :disabled="!f.terms" :aria-describedby="f.terms ? undefined : 'terms-needed'">{{ fromReview ? 'Back to review' : 'Review request' }}</BaseButton>
            </div>
            <p v-if="!f.terms" id="terms-needed" class="mono terms-needed">Tick the terms box above to continue.</p>
          </form>
        </section>

        <!-- STEP 5 — CONFIRM -->
        <section v-else-if="step === 5" key="5" class="bstep" aria-labelledby="s5-h">
          <h2 id="s5-h" tabindex="-1" class="display h3 bstep__h">Check it over</h2>
          <p class="muted bstep__p">Nothing is charged here. Send the request; once we confirm the date
            and how long your session runs, you pay the deposit by mobile money.</p>
          <SurfaceCard class="mt-5">
            <dl class="review">
              <ContactRow v-for="([k, v, edit], i) in reviewRows" :key="k" :term="k" :last="i === reviewRows.length - 1">
                <span class="review__v">{{ v }}</span>
                <button v-if="edit" type="button" class="review__edit" :aria-label="`Edit ${k.toLowerCase()}`" @click="editFrom(edit)">Edit</button>
              </ContactRow>
            </dl>
          </SurfaceCard>
          <SurfaceCard tone="cop" class="mt-4">
            <span class="card__k cop-hi">How the date is held</span>
            <ol class="held">
              <ProcessItem n="01" tone="cop" title="You send this request">It reaches us immediately, with a reference number for you to keep.</ProcessItem>
              <ProcessItem n="02" tone="cop" title="We confirm within one working day">If we are free and it is a good fit, we accept, set how long your session runs and email you the confirmed time and total.</ProcessItem>
              <ProcessItem n="03" tone="cop" title="Pay the deposit by mobile money">Send it to {{ momo }}, with your reference. The date is held for 72 hours while you pay; the balance is due on delivery.</ProcessItem>
              <ProcessItem n="04" tone="cop" title="We plan the day properly" last>A written run sheet, agreed with whoever is really making the decisions, a week before.</ProcessItem>
            </ol>
          </SurfaceCard>
          <p v-if="sendErr" class="err mt-4" role="alert">{{ sendErr }}</p>
          <div class="bactions">
            <BaseButton v-if="slotGone" type="button" @click="go(2)">← Choose another time</BaseButton>
            <BaseButton v-else type="button" @click="go(4)">← Edit details</BaseButton>
            <BaseButton variant="copper" type="button" :disabled="sending || slotGone" arrow @click="send">
              <span v-if="sending" class="spin" aria-hidden="true" />{{ sending ? 'Sending…' : 'Send booking request' }}
            </BaseButton>
          </div>
        </section>

        <!-- STEP 6 — DONE -->
        <section v-else-if="step === 6" key="6" class="bstep" aria-labelledby="s6-h">
          <div class="confirmed">
            <Eyebrow>Request sent</Eyebrow>
            <h2 id="s6-h" tabindex="-1" class="display h2 confirmed__h">{{ delivered ? 'Your request is with us.' : 'Your request is ready to send.' }}</h2>
            <p class="lede mt-4">{{ confirmLine }}</p>
            <p v-if="sendErr" class="err" role="alert">{{ sendErr }}</p>
            <div class="refno">{{ data?.ref }}</div>
            <p class="muted bstep__p">Keep that reference<template v-if="emailed">; a copy of your request is in your inbox at {{ data?.email }}</template>. <template v-if="delivered">It has reached us, and we will email you
              within one working day to confirm the date and how long your session runs.</template><template v-else>Once it reaches us we reply within one working day to confirm the date and how long your session runs.</template> If you would rather
              talk it through now, WhatsApp is the fastest route.</p>
            <SurfaceCard tone="cop" k="Paying the deposit" class="mt-4">
              <p class="mt-0">Once we confirm, pay <template v-if="data?.total">the deposit of <b>K{{ fmtMoney(data.deposit) }}</b></template><template v-else>the deposit</template>
                by mobile money to <b class="nowrap">{{ momo }}</b>, using <b>{{ data?.ref }}</b> as the reference.
                Your date is held for 72 hours while you pay.</p>
            </SurfaceCard>
            <div class="bactions">
              <BaseButton variant="copper" :href="waHref" external arrow>Message on WhatsApp</BaseButton>
              <BaseButton type="button" @click="copy">{{ copyLabel }}</BaseButton>
              <BaseButton to="/">Back to the home page</BaseButton>
            </div>
            <pre ref="bookingTextEl" class="mono request">{{ requestText }}</pre>
          </div>
        </section>
        </Transition>
      </div>

      <!-- phones: the rail is below the steps, so the price travels in a bar -->
      <div v-if="service && step < 6" class="sumbar" aria-hidden="true">
        <span class="sumbar__k">Total</span>
        <b class="num sumbar__v">{{ quote.totalText.value }}</b>
        <span class="sumbar__k sumbar__dep">Deposit</span>
        <b class="num sumbar__v sumbar__depv">{{ quote.depositText.value.replace(/\s+\(.*\)$/, '') }}</b>
      </div>

      <aside>
        <BookingSummary
          :service="service?.name ?? '—'"
          :date="date ? fmtDate(date) : '—'"
          :time="summaryTime"
          :delivery="service ? quote.delivery.value : '—'"
          :items="service ? quote.quote.value.items : []"
          :total="quote.totalText.value"
          :deposit="quote.depositText.value"
          :total-value="service && service.price != null ? quote.quote.value.total : null"
          :deposit-value="service && service.price != null && quote.quote.value.total ? quote.quote.value.deposit : null"
          :tbc="quote.quote.value.tbc"
          :deposit-pct="quote.quote.value.depositPct"
        />
        <SurfaceCard k="Rather just ask?" class="mt-5">
          <p class="mt-0">Not sure which coverage fits, or your day is unusual? Message
            directly — we would rather talk first than sell you the wrong thing.</p>
          <dl class="ask">
            <ContactRow term="WhatsApp" flush><a :href="SITE.whatsapp" target="_blank" rel="noopener">{{ SITE.phone }}</a></ContactRow>
            <ContactRow term="Email" last><a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a></ContactRow>
          </dl>
        </SurfaceCard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.sumbar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
  display: grid; grid-template-columns: auto 1fr auto auto; gap: 4px 12px; align-items: baseline;
  padding: 10px var(--tm-sys-space-5) calc(10px + env(safe-area-inset-bottom));
  background: var(--tm-sys-elevation-5-bg); backdrop-filter: var(--tm-sys-elevation-5-filter); -webkit-backdrop-filter: var(--tm-sys-elevation-5-filter);
  border-top: 1px solid var(--tm-sys-color-outline);
}
.sumbar__k { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .14em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.sumbar__v { font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes); font-size: 20px; letter-spacing: -.02em; }
.sumbar__depv { color: var(--tm-sys-color-secondary-hover); font-size: 16px; }
@media (min-width: 900px) { .sumbar { display: none; } }
@media (max-width: 899px) { .bactions:last-child { padding-bottom: 64px; } }
.preview-note {
  display: inline-flex; align-items: center; gap: 8px; font-family: var(--tm-sys-type-data-family); font-size: 10.5px;
  letter-spacing: .1em; text-transform: uppercase; color: var(--tm-sys-color-secondary-hover);
  border: 1px dashed var(--tm-sys-color-secondary-container); border-radius: var(--tm-sys-shape-corner); padding: 6px 11px; margin: 0 0 var(--tm-sys-space-5);
}
.dot--wait { animation: dotwait 1.4s var(--tm-sys-motion-easing-standard) infinite; }
@keyframes dotwait { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
.preview-note--live { color: var(--tm-sys-color-primary-hover); border: 1px solid var(--tm-sys-color-primary-container); }
.dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex: none; }
/* a step slides the way the user went: forward from the right, back from the left */
.step-fwd-enter-active, .step-back-enter-active { transition: opacity var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-decelerate), transform var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-decelerate); }
.step-fwd-leave-active, .step-back-leave-active { transition: opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-accelerate), transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-accelerate); }
.step-fwd-enter-from { opacity: 0; transform: translateX(18px); }
.step-fwd-leave-to { opacity: 0; transform: translateX(-18px); }
.step-back-enter-from { opacity: 0; transform: translateX(-18px); }
.step-back-leave-to { opacity: 0; transform: translateX(18px); }
.bstep__h { margin-bottom: var(--tm-sys-space-3); }
.bstep__p { font-size: 15.5px; }
.booked { margin: var(--tm-sys-space-4) 0 0; font-size: 10.5px; color: var(--tm-sys-color-on-surface-variant); }
.bactions { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-3); margin-top: var(--tm-sys-space-6); }
.form { display: grid; gap: var(--tm-sys-space-4); }
.fs { border: 0; padding: 0; margin: 0; min-width: 0; display: grid; gap: var(--tm-sys-space-4); }
.review, .ask { margin: 0; }
.ask { margin-top: var(--tm-sys-space-4); }
.review__v { font-size: 13.5px; }
.card__k { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; display: block; margin-bottom: var(--tm-sys-space-3); }
.held { list-style: none; padding: 0; margin: 0; }
.nowrap { white-space: nowrap; }
/* step headings take focus on arrival; the ring would read as a stray box */
h2[tabindex="-1"]:focus { outline: none; }
.review__edit {
  margin-left: var(--tm-sys-space-3); padding: 2px 8px; cursor: pointer; background: transparent; border: 1px solid var(--tm-sys-color-outline-variant);
  border-radius: var(--tm-sys-shape-corner); color: var(--tm-sys-color-secondary-hover);
  font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase;
}
.review__edit:hover { border-color: var(--tm-sys-color-secondary); }
.restored { display: flex; flex-wrap: wrap; align-items: center; gap: var(--tm-sys-space-3); margin: 0 0 var(--tm-sys-space-4); font-size: 14.5px; color: var(--tm-sys-color-on-surface-variant); }
.restored button { padding: 4px 10px; cursor: pointer; background: transparent; color: var(--tm-sys-color-on-surface); border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; }
.terms-needed { margin: var(--tm-sys-space-3) 0 0; font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-on-surface-faint); }
.confirmed { border: 1px solid var(--tm-sys-color-primary-container); background: var(--tm-sys-color-primary-tint); border-radius: var(--tm-sys-shape-corner); padding: var(--tm-sys-space-6); }
.confirmed__h { max-width: 18ch; }
.refno {
  font-family: var(--tm-sys-type-data-family); font-size: 22px; letter-spacing: .14em; color: var(--tm-sys-color-primary-hover);
  border: 1px solid var(--tm-sys-color-primary-container); border-radius: var(--tm-sys-shape-corner); padding: 12px 18px; display: inline-block; margin: var(--tm-sys-space-4) 0;
}
.request { white-space: pre-wrap; line-height: 1.7; margin: var(--tm-sys-space-5) 0 0; color: var(--tm-sys-color-on-surface-variant); max-height: 260px; overflow: auto; }
.spin { width: 15px; height: 15px; border: 2px solid var(--tm-sys-color-outline); border-top-color: var(--tm-sys-color-on-secondary); border-radius: 50%; animation: sp .7s linear infinite; display: inline-block; vertical-align: -2px; }
@keyframes sp { to { transform: rotate(360deg); } }
</style>
