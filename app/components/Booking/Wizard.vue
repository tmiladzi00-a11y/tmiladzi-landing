<script setup lang="ts">
import { SERVICES, SLOTS } from '~/content/services'
import type { Service } from '~/content/types'
import { SITE } from '~/content/site'
import { TERMS_VERSION, PRIVACY_VERSION } from '~/content/terms'
import { useBookingQuote } from '~/composables/useBookingQuote'
import { useBookingApi } from '~/composables/useBookingApi'
import { useTermsFingerprint } from '~/composables/useTermsFingerprint'
import { copyText } from '~/composables/useClipboard'
import { fmtDate } from '~/utils/dates'
import { fmtMoney } from '~/utils/money'

const STEPS = ['Coverage', 'Date', 'Add-ons', 'Details', 'Confirm']
const REGIONS = ['Within the Copperbelt', 'Outside the Copperbelt', 'Outside Zambia']
const HEARD = ['Referred by a venue or vendor', 'Referred by a friend or family', 'Instagram', 'Facebook', 'Google', 'Saw your work at an event', 'Other']

/* ---------- state ---------- */
const step = ref(1)
const dir = ref(1)
const serviceId = ref<string | null>(null)
const service = computed<Service | null>(() => SERVICES.find((s) => s.id === serviceId.value) ?? null)
const date = ref<string | null>(null)
const time = ref<string | null>(null)
const quote = useBookingQuote(service)
const api = useBookingApi()
const fingerprint = useTermsFingerprint()

const f = reactive({
  name: '', partner: '', email: '', phone: '', venue: '', region: REGIONS[0]!, guests: '',
  heard: HEARD[0]!, notes: '', terms: false, marketing: false,
})
const fieldErr = reactive<{ name?: string; email?: string; phone?: string }>({})
const formErr = ref('')
const termsBad = ref(false)
const sendErr = ref('')
const sending = ref(false)
const data = ref<ReturnType<typeof collect> | null>(null)
const copyLabel = ref('Copy request')
const stepsEl = ref<HTMLElement | null>(null)
const bookingTextEl = ref<HTMLElement | null>(null)
const announce = ref('')

onMounted(() => { api.loadAvailability() })

watch(serviceId, () => {
  date.value = null; time.value = null; quote.reset()
})

const effectiveTime = computed(() => (service.value && !service.value.times ? 'Full day' : time.value))
const canDate = computed(() => !!service.value)
const canAddons = computed(() => !!date.value && !!effectiveTime.value)
const summaryTime = computed(() => effectiveTime.value || '—')

/* ---------- navigation ---------- */
function go(n: number) {
  dir.value = n >= step.value ? 1 : -1
  step.value = n
  announce.value = n <= 5 ? `Step ${n} of 5: ${STEPS[n - 1]}` : 'Request sent'
  if (n === 5) data.value = collect()
  nextTick(() => {
    const top = stepsEl.value
    if (top) window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' })
  })
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
    ref: 'TM-' + Date.now().toString(36).slice(-5).toUpperCase(),
    service: svc.name, serviceId: svc.id,
    base: svc.price, coverage: svc.cov,
    addons, total: t.total, tbq: t.tbc,
    deposit: t.deposit, depositPct: t.depositPct,
    delivery: quote.deliveryNumber.value, deliveryText: quote.delivery.value,
    date: date.value!, dateLabel: fmtDate(date.value!), time: effectiveTime.value || 'To confirm',
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

const reviewRows = computed<[string, string][]>(() => {
  const d = data.value
  if (!d) return []
  const rows: [string, string][] = [
    ['Coverage', d.service + ' · ' + d.coverage],
    ['Date', d.dateLabel], ['Start time', d.time],
    ['Delivery', d.deliveryText],
    ['Name', d.name + (d.partner ? ' & ' + d.partner : '')],
    ['Email', d.email], ['Phone', d.phone],
    ['Venue', d.venue || '—'], ['Region', d.region],
    ['Guests', d.guests || '—'], ['Found us via', d.heard],
  ]
  if (d.addons.length) rows.push(['Add-ons', d.addons.map((a) => a.name + (a.qty > 1 ? ' ×' + a.qty : '') + (a.amount == null ? ' (quoted separately)' : '')).join(', ')])
  rows.push(['Total', d.total ? 'K' + fmtMoney(d.total) + (d.tbq ? ' plus items quoted separately' : '') : 'On request'])
  if (d.total) rows.push(['Deposit to hold', 'K' + fmtMoney(d.deposit) + ' (' + d.depositPct + '%) — non-refundable'])
  if (d.notes) rows.push(['Notes', d.notes])
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
    'Start     : ' + d.time,
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
  return d.service + ' on ' + d.dateLabel + (d.time && d.time !== 'Full day' ? ' at ' + d.time : '') +
    (d.total ? '. Deposit to hold the date: K' + fmtMoney(d.deposit) + '.' : '. We will come back with a quotation.')
})
const waHref = computed(() => {
  const d = data.value
  if (!d) return SITE.whatsapp
  return SITE.whatsapp + '?text=' + encodeURIComponent(`Hi Tmiladzi Media — I've just sent booking request ${d.ref} for ${d.service} on ${d.dateLabel}.`)
})

/* ---------- details validation ---------- */
function submitDetails() {
  fieldErr.name = f.name.trim() ? undefined : 'Required'
  fieldErr.phone = f.phone.trim() ? undefined : 'Required'
  const em = f.email.trim()
  fieldErr.email = !em ? 'Required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) ? 'That does not look like an email address' : undefined
  if (fieldErr.name || fieldErr.phone || fieldErr.email) {
    formErr.value = 'Please add your name, a valid email and a phone number so we can reply.'
    return
  }
  // A cancellation term is only worth having if it was put in front of the
  // client before they paid. This is the record that it was.
  if (!f.terms) {
    termsBad.value = true
    formErr.value = 'Please accept the terms — in particular the non-refundable deposit and the cancellation scale — before sending your request.'
    nextTick(() => document.getElementById('acceptWrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    return
  }
  termsBad.value = false
  formErr.value = ''
  go(5)
}

/* ---------- send ---------- */
async function send() {
  const d = data.value ?? collect()
  data.value = d
  sendErr.value = ''
  sending.value = true
  try {
    const j = await api.submit(d)
    if (j.ref) d.ref = j.ref
  } catch {
    sendErr.value = 'We could not send that automatically. Copy the request below and WhatsApp it to +260 974 901 668 — we will pick it up straight away.'
  } finally {
    sending.value = false
    go(6)
  }
}

async function copy() {
  copyLabel.value = await copyText(requestText.value, bookingTextEl.value)
  setTimeout(() => { copyLabel.value = 'Copy request' }, 1800)
}

const noticeNote = computed(() => service.value
  ? `${service.value.name} need at least ${service.value.notice} days' notice. Crossed dates are already booked.`
  : 'Crossed dates are already booked.')
const addonIntro = computed(() => service.value?.addons.length
  ? 'Everything here is optional. The total on the right updates as you go.'
  : 'No add-ons for this service yet — tell us in the notes what else you need and we will quote it.')
</script>

<template>
  <div>
    <p v-if="!api.api" class="preview-note" role="note">
      <span class="dot" aria-hidden="true" />Preview mode · sample availability
    </p>
    <p class="sr-only" aria-live="polite">{{ announce }}</p>

    <div ref="stepsEl"><BookingStepIndicator :steps="STEPS" :current="step" /></div>

    <div class="split">
      <div>
        <!-- STEP 1 — COVERAGE -->
        <Transition :name="dir > 0 ? 'step-fwd' : 'step-back'" mode="out-in">
        <section v-if="step === 1" key="1" class="bstep" aria-labelledby="s1-h">
          <h2 id="s1-h" class="display h3 bstep__h">What are we covering?</h2>
          <p class="muted bstep__p">Session types can be adjusted to your liking —
            you can take parts of a service you like from a different package. Say so in the notes
            and we will build the quote around it.</p>
          <BookingServicePicker v-model="serviceId" :services="SERVICES" />
          <div class="bactions">
            <BaseButton variant="copper" type="button" :disabled="!canDate" arrow @click="go(2)">Choose a date</BaseButton>
          </div>
        </section>

        <!-- STEP 2 — DATE -->
        <section v-else-if="step === 2" key="2" class="bstep" aria-labelledby="s2-h">
          <h2 id="s2-h" class="display h3 bstep__h">When is it?</h2>
          <p class="muted bstep__p">{{ noticeNote }}</p>
          <div class="mt-5">
            <BookingAvailabilityCalendar v-model="date" :blocked="api.blocked.value" :notice="service?.notice ?? 3" />
          </div>
          <BookingSlotList v-if="service?.times" v-model="time" :slots="SLOTS" />
          <div class="bactions">
            <BaseButton type="button" @click="go(1)">← Back</BaseButton>
            <BaseButton variant="copper" type="button" :disabled="!canAddons" arrow @click="go(3)">Add-ons</BaseButton>
          </div>
        </section>

        <!-- STEP 3 — ADD-ONS -->
        <section v-else-if="step === 3" key="3" class="bstep" aria-labelledby="s3-h">
          <h2 id="s3-h" class="display h3 bstep__h">Anything extra?</h2>
          <p class="muted bstep__p">{{ addonIntro }}</p>
          <BookingAddonStepper v-if="service" :addons="service.addons" :qty="quote.qty" @bump="quote.bump" />
          <div class="bactions">
            <BaseButton type="button" @click="go(2)">← Back</BaseButton>
            <BaseButton variant="copper" type="button" arrow @click="go(4)">Your details</BaseButton>
          </div>
        </section>

        <!-- STEP 4 — DETAILS -->
        <section v-else-if="step === 4" key="4" class="bstep" aria-labelledby="s4-h">
          <h2 id="s4-h" class="display h3 bstep__h">Tell us about the day</h2>
          <p class="muted bstep__p">The more we know now, the fewer surprises later —
            which is the single biggest thing that goes wrong on a shoot.</p>
          <form class="form mt-5" novalidate @submit.prevent="submitDetails">
            <fieldset class="fs">
              <legend class="sr-only">Your details</legend>
              <FormRow>
                <FormField id="k-name" label="Your name" :error="fieldErr.name" required>
                  <input id="k-name" v-model="f.name" required autocomplete="name" placeholder="Full name">
                </FormField>
                <FormField id="k-partner" :label="service?.id === 'wedding' ? 'Partner’s name' : 'Second contact'">
                  <input id="k-partner" v-model="f.partner" placeholder="If it applies">
                </FormField>
              </FormRow>
              <FormRow>
                <FormField id="k-email" label="Email" :error="fieldErr.email" required>
                  <input id="k-email" v-model="f.email" type="email" required autocomplete="email" placeholder="you@email.com">
                </FormField>
                <FormField id="k-phone" label="Phone / WhatsApp" :error="fieldErr.phone" required>
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
                <FormField id="k-region" label="Where is it?">
                  <select id="k-region" v-model="f.region"><option v-for="o in REGIONS" :key="o">{{ o }}</option></select>
                </FormField>
              </FormRow>
              <FormRow>
                <FormField id="k-guests" label="Approximate guests">
                  <input id="k-guests" v-model="f.guests" inputmode="numeric" placeholder="e.g. 180">
                </FormField>
                <FormField id="k-heard" label="How did you find us?">
                  <select id="k-heard" v-model="f.heard"><option v-for="o in HEARD" :key="o">{{ o }}</option></select>
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
              <AcceptBox id="k-terms" v-model="f.terms" :bad="termsBad">
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
              <BaseButton variant="copper" type="submit" arrow>Review request</BaseButton>
            </div>
          </form>
        </section>

        <!-- STEP 5 — CONFIRM -->
        <section v-else-if="step === 5" key="5" class="bstep" aria-labelledby="s5-h">
          <h2 id="s5-h" class="display h3 bstep__h">Check it over</h2>
          <p class="muted bstep__p">Nothing is charged here. Send the request and we
            confirm availability, then send payment details for the deposit that holds your date.</p>
          <SurfaceCard class="mt-5">
            <dl class="review">
              <ContactRow v-for="([k, v], i) in reviewRows" :key="k" :term="k" :last="i === reviewRows.length - 1"><span class="review__v">{{ v }}</span></ContactRow>
            </dl>
          </SurfaceCard>
          <SurfaceCard tone="cop" class="mt-4">
            <span class="card__k cop-hi">How the date is held</span>
            <ol class="held">
              <ProcessItem n="01" tone="cop" title="You send this request">It reaches us immediately and the date is pencilled in.</ProcessItem>
              <ProcessItem n="02" tone="cop" title="We confirm within one working day">If we are free and it is a good fit, we accept and send the deposit details.</ProcessItem>
              <ProcessItem n="03" tone="cop" title="Deposit holds the date for 72 hours">Your date is reserved for three days while you pay. The booking is confirmed once the deposit lands; the balance is due on delivery.</ProcessItem>
              <ProcessItem n="04" tone="cop" title="We plan the day properly" last>A written run sheet, agreed with whoever is really making the decisions, a week before.</ProcessItem>
            </ol>
          </SurfaceCard>
          <div class="bactions">
            <BaseButton type="button" @click="go(4)">← Edit details</BaseButton>
            <BaseButton variant="copper" type="button" :disabled="sending" arrow @click="send">
              <span v-if="sending" class="spin" aria-hidden="true" />{{ sending ? 'Sending…' : 'Send booking request' }}
            </BaseButton>
          </div>
        </section>

        <!-- STEP 6 — DONE -->
        <section v-else-if="step === 6" key="6" class="bstep" aria-labelledby="s6-h">
          <div class="confirmed">
            <Eyebrow>Request sent</Eyebrow>
            <h2 id="s6-h" class="display h2 confirmed__h">Your date is pencilled in.</h2>
            <p class="lede mt-4">{{ confirmLine }}</p>
            <p v-if="sendErr" class="err" role="alert">{{ sendErr }}</p>
            <div class="refno">{{ data?.ref }}</div>
            <p class="muted bstep__p">Keep that reference. We will reply to your email
              within one working day with confirmation and the deposit details. If you would rather
              talk it through now, WhatsApp is the fastest route.</p>
            <div class="bactions">
              <BaseButton variant="copper" :href="waHref" external arrow>Message on WhatsApp</BaseButton>
              <BaseButton type="button" @click="copy">{{ copyLabel }}</BaseButton>
              <BaseButton to="/celebrations">Back to packages</BaseButton>
            </div>
            <pre ref="bookingTextEl" class="mono request">{{ requestText }}</pre>
          </div>
        </section>
        </Transition>
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
.preview-note {
  display: inline-flex; align-items: center; gap: 8px; font-family: var(--tm-sys-type-data-family); font-size: 10.5px;
  letter-spacing: .1em; text-transform: uppercase; color: var(--tm-sys-color-secondary-hover);
  border: 1px dashed var(--tm-sys-color-secondary-container); border-radius: var(--tm-sys-shape-corner); padding: 6px 11px; margin: 0 0 var(--tm-sys-space-5);
}
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
.bactions { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-3); margin-top: var(--tm-sys-space-6); }
.form { display: grid; gap: var(--tm-sys-space-4); }
.fs { border: 0; padding: 0; margin: 0; min-width: 0; display: grid; gap: var(--tm-sys-space-4); }
.review, .ask { margin: 0; }
.ask { margin-top: var(--tm-sys-space-4); }
.review__v { font-size: 13.5px; }
.card__k { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; display: block; margin-bottom: var(--tm-sys-space-3); }
.held { list-style: none; padding: 0; margin: 0; }
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
