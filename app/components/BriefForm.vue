<script setup lang="ts">
import { SITE } from '~/content/site'
import { copyText } from '~/composables/useClipboard'

const SECTORS = ['Mining & industry', 'NGO & development', 'Banking & financial services', 'Aviation, transport & infrastructure', 'Agribusiness & manufacturing', 'Construction & engineering', 'Government & institutional', 'Other']
const SCOPES = ['Event or launch coverage', 'Site, plant or field photography', 'Documentary film (10–40 min)', 'Corporate or brand film', 'Interviews & testimonials', 'Monthly content retainer', 'Leadership portraits', 'Not sure yet — advise me']
const BUDGETS = ['Under 10,000', '10,000 – 30,000', '30,000 – 60,000', '60,000 – 120,000', 'Over 120,000', 'Retainer — annual budget', 'Need guidance on budget']
const NDA = ['No', 'Yes — NDA', 'Yes — site induction', 'Yes — both']
const SPEC = ['No, use your standard', 'Yes, we have one']

const f = reactive({
  org: '', name: '', email: '', phone: '', sector: SECTORS[0]!, scope: SCOPES[0]!,
  when: '', where: '', budget: BUDGETS[0]!, goal: '', nda: NDA[0]!, spec: SPEC[0]!, consent: false, website: '',
})
const errors = reactive<{ org?: string; name?: string; email?: string }>({})
const formErr = ref('')
const consentBad = ref(false)
/* idle → sending → sent (delivered by the site) | ready (copy-and-send fallback) */
const state = ref<'idle' | 'sending' | 'sent' | 'ready'>('idle')
const fallbackReason = ref('')
const text = ref('')
const pre = ref<HTMLElement | null>(null)
const formEl = ref<HTMLElement | null>(null)
const copyLabel = ref('Copy brief')

const v = (s: string) => s.trim() || '—'

function compose() {
  return [
    'PROJECT BRIEF — TMILADZI MEDIA',
    '',
    'Organisation : ' + v(f.org),
    'Contact      : ' + v(f.name),
    'Email        : ' + v(f.email),
    'Phone        : ' + v(f.phone),
    'Sector       : ' + v(f.sector),
    '',
    'Scope        : ' + v(f.scope),
    'Dates        : ' + v(f.when),
    'Location     : ' + v(f.where),
    'Budget band  : ZMW ' + v(f.budget),
    'NDA/induction: ' + v(f.nda),
    'Client spec  : ' + v(f.spec),
    '',
    'OBJECTIVE',
    v(f.goal),
    '',
    'Privacy consent given: yes, ' + new Date().toISOString(),
  ].join('\n')
}

async function submit() {
  errors.org = f.org.trim() ? undefined : 'Required'
  errors.name = f.name.trim() ? undefined : 'Required'
  errors.email = !f.email.trim() ? 'Required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? 'That does not look like an email address' : undefined
  if (errors.org || errors.name || errors.email) {
    formErr.value = 'Please add your organisation, your name and a valid email so we can reply.'
    return
  }
  if (!f.consent) {
    consentBad.value = true
    formErr.value = 'Please tick the box so we may hold your details to prepare the proposal.'
    return
  }
  consentBad.value = false
  formErr.value = ''
  text.value = compose()
  state.value = 'sending'
  try {
    const r = await $fetch<{ ok: boolean; sent?: boolean; reason?: string }>('/api/send', {
      method: 'POST',
      body: { kind: 'brief', subject: `Project brief — ${f.org.trim()}`, text: text.value, replyTo: f.email.trim(), name: f.name.trim(), website: f.website },
    })
    if (r.ok && r.sent) { state.value = 'sent' }
    else { fallbackReason.value = r.reason === 'not-configured' ? 'Automatic sending is not switched on yet.' : 'We could not send that automatically.'; state.value = 'ready' }
  } catch {
    fallbackReason.value = 'We could not send that automatically.'
    state.value = 'ready'
  }
  nextTick(() => pre.value?.closest('.out')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
}

async function copy() {
  copyLabel.value = await copyText(text.value, pre.value)
  setTimeout(() => { copyLabel.value = 'Copy brief' }, 1800)
}
function edit() {
  state.value = 'idle'
  nextTick(() => formEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
</script>

<template>
  <form ref="formEl" class="form" novalidate @submit.prevent="submit">
    <!-- the six questions, as six questions -->
    <fieldset class="q">
      <legend class="q__legend"><span class="q__n">01</span>Who you are</legend>
      <FormRow>
        <FormField id="b-org" label="Organisation" :error="errors.org" required>
          <input id="b-org" v-model="f.org" name="org" required autocomplete="organization" placeholder="e.g. Barloworld Zambia">
        </FormField>
        <FormField id="b-name" label="Your name" :error="errors.name" required>
          <input id="b-name" v-model="f.name" name="name" required autocomplete="name" placeholder="Full name">
        </FormField>
      </FormRow>
      <FormRow>
        <FormField id="b-email" label="Email" :error="errors.email" required>
          <input id="b-email" v-model="f.email" name="email" type="email" required autocomplete="email" placeholder="name@company.co.zm">
        </FormField>
        <FormField id="b-phone" label="Phone or WhatsApp">
          <input id="b-phone" v-model="f.phone" name="phone" type="tel" autocomplete="tel" placeholder="+260 …">
        </FormField>
      </FormRow>
    </fieldset>

    <fieldset class="q">
      <legend class="q__legend"><span class="q__n">02</span>The sector the work sits in</legend>
      <FormField id="b-sector" label="Sector">
        <select id="b-sector" v-model="f.sector" name="sector"><option v-for="o in SECTORS" :key="o">{{ o }}</option></select>
      </FormField>
    </fieldset>

    <fieldset class="q">
      <legend class="q__legend"><span class="q__n">03</span>What you need made</legend>
      <FormField id="b-scope" label="Scope">
        <select id="b-scope" v-model="f.scope" name="scope"><option v-for="o in SCOPES" :key="o">{{ o }}</option></select>
      </FormField>
    </fieldset>

    <fieldset class="q">
      <legend class="q__legend"><span class="q__n">04</span>When, where, and under what conditions</legend>
      <FormRow>
        <FormField id="b-when" label="Dates or deadline">
          <input id="b-when" v-model="f.when" name="when" placeholder="e.g. mid-October, 3 days">
        </FormField>
        <FormField id="b-where" label="Location">
          <input id="b-where" v-model="f.where" name="where" placeholder="e.g. Mpongwe, Copperbelt">
        </FormField>
      </FormRow>
      <FormRow>
        <FormField id="b-nda" label="NDA or site induction required?">
          <select id="b-nda" v-model="f.nda" name="nda"><option v-for="o in NDA" :key="o">{{ o }}</option></select>
        </FormField>
        <FormField id="b-spec" label="Client technical spec to shoot to?">
          <select id="b-spec" v-model="f.spec" name="spec"><option v-for="o in SPEC" :key="o">{{ o }}</option></select>
        </FormField>
      </FormRow>
    </fieldset>

    <fieldset class="q">
      <legend class="q__legend"><span class="q__n">05</span>The budget band</legend>
      <FormField id="b-budget" label="Budget band (ZMW)">
        <select id="b-budget" v-model="f.budget" name="budget"><option v-for="o in BUDGETS" :key="o">{{ o }}</option></select>
      </FormField>
    </fieldset>

    <fieldset class="q">
      <legend class="q__legend"><span class="q__n">06</span>What has to happen because of this work</legend>
      <FormField id="b-goal" label="Objective">
        <textarea id="b-goal" v-model="f.goal" name="goal" placeholder="Who is the audience, and what do you need them to understand, believe or do?" />
      </FormField>
    </fieldset>

    <!-- honeypot: hidden from people, tempting to bots -->
    <div class="hp" aria-hidden="true"><label for="b-website">Website</label><input id="b-website" v-model="f.website" name="website" tabindex="-1" autocomplete="off"></div>

    <AcceptBox id="b-consent" v-model="f.consent" tone="mal" :bad="consentBad">
      I have read the <NuxtLink to="/privacy">Privacy Notice</NuxtLink>
      and understand that any quotation will be issued subject to Tmiladzi Media's
      <NuxtLink to="/commercial">Commercial Services Terms</NuxtLink>.
    </AcceptBox>

    <p v-if="formErr" class="err" role="alert">{{ formErr }}</p>

    <div v-if="state !== 'sent'" class="row mt-2">
      <BaseButton variant="primary" type="submit" :disabled="state === 'sending'" arrow>{{ state === 'sending' ? 'Sending…' : 'Send brief' }}</BaseButton>
      <BaseButton :href="SITE.whatsapp" external>Or message on WhatsApp</BaseButton>
    </div>
    <p v-if="state !== 'sent'" class="note">Replies within one working day. Proposals and quotations usually within two.
      Our <NuxtLink to="/terms">terms of business</NuxtLink> apply to
      commissioned work; the licence you get is set out in your quotation.</p>

    <div v-if="state === 'sent'" class="out" aria-live="polite">
      <Eyebrow class="mb-3">Brief sent</Eyebrow>
      <p class="muted out__p">It has reached <strong class="fg">{{ SITE.email }}</strong>. We read every brief properly and reply within one working day, with a question or two if the scope is unclear. A copy is below for your records.</p>
      <details class="out__details"><summary class="mono">Your brief as sent</summary><pre ref="pre" class="out__pre">{{ text }}</pre></details>
      <div class="row mt-4">
        <BaseButton size="sm" type="button" @click="copy">{{ copyLabel }}</BaseButton>
        <BaseButton size="sm" to="/work">See the work while you wait</BaseButton>
      </div>
    </div>

    <div v-if="state === 'ready'" class="out" aria-live="polite">
      <Eyebrow class="mb-3">Brief ready</Eyebrow>
      <p class="muted out__p">{{ fallbackReason }} Copy this and send it to
        <strong class="fg">{{ SITE.email }}</strong>, or paste it straight into WhatsApp. It is the same brief either way.</p>
      <pre ref="pre" class="out__pre">{{ text }}</pre>
      <div class="row mt-4">
        <BaseButton variant="primary" size="sm" type="button" @click="copy">{{ copyLabel }}</BaseButton>
        <BaseButton size="sm" :href="SITE.whatsapp" external>Open WhatsApp</BaseButton>
        <BaseButton size="sm" type="button" @click="edit">Edit answers</BaseButton>
      </div>
    </div>
  </form>
</template>

<style scoped>
.form { display: grid; gap: var(--tm-sys-space-5); }
.q { border: 0; padding: 0; margin: 0; min-width: 0; display: grid; gap: var(--tm-sys-space-4); }
.q__legend {
  font-family: var(--tm-sys-type-body-family); font-weight: 650; font-size: 18px; line-height: 1.25; letter-spacing: -.01em;
  padding: 0; margin-bottom: var(--tm-sys-space-2); display: flex; gap: 12px; align-items: baseline; color: var(--tm-sys-color-on-surface);
}
.q__n { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .1em; color: var(--tm-sys-color-primary); font-weight: 400; }
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.out {
  border: 1px solid var(--tm-sys-color-primary-container); background: var(--tm-sys-color-primary-tint);
  border-radius: var(--tm-sys-shape-corner); padding: var(--tm-sys-space-5); margin-top: var(--tm-sys-space-2);
  animation: reveal var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-decelerate) both;
}
@keyframes reveal { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.out__p { font-size: 15px; }
.out__pre {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size); line-height: 1.7; white-space: pre-wrap;
  color: var(--tm-sys-color-on-surface-variant); margin: var(--tm-sys-space-4) 0 0; max-height: 280px; overflow: auto;
}
.out__details summary { cursor: pointer; }
</style>
