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
  when: '', where: '', budget: BUDGETS[0]!, goal: '', nda: NDA[0]!, spec: SPEC[0]!, consent: false,
})
const errors = reactive<{ org?: string; name?: string; email?: string }>({})
const formErr = ref('')
const consentBad = ref(false)
const out = ref(false)
const text = ref('')
const pre = ref<HTMLElement | null>(null)
const formEl = ref<HTMLElement | null>(null)
const copyLabel = ref('Copy brief')

const v = (s: string) => s.trim() || '—'

function submit() {
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
  text.value = [
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
  out.value = true
  nextTick(() => pre.value?.closest('.out')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
}

async function copy() {
  copyLabel.value = await copyText(text.value, pre.value)
  setTimeout(() => { copyLabel.value = 'Copy brief' }, 1800)
}
function edit() {
  out.value = false
  nextTick(() => formEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
</script>

<template>
  <form ref="formEl" class="form" novalidate @submit.prevent="submit">
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
    <FormField id="b-sector" label="Sector">
      <select id="b-sector" v-model="f.sector" name="sector"><option v-for="o in SECTORS" :key="o">{{ o }}</option></select>
    </FormField>
    <FormField id="b-scope" label="What do you need made?">
      <select id="b-scope" v-model="f.scope" name="scope"><option v-for="o in SCOPES" :key="o">{{ o }}</option></select>
    </FormField>
    <FormRow>
      <FormField id="b-when" label="Dates or deadline">
        <input id="b-when" v-model="f.when" name="when" placeholder="e.g. mid-October, 3 days">
      </FormField>
      <FormField id="b-where" label="Location">
        <input id="b-where" v-model="f.where" name="where" placeholder="e.g. Mpongwe, Copperbelt">
      </FormField>
    </FormRow>
    <FormField id="b-budget" label="Budget band (ZMW)">
      <select id="b-budget" v-model="f.budget" name="budget"><option v-for="o in BUDGETS" :key="o">{{ o }}</option></select>
    </FormField>
    <FormField id="b-goal" label="What has to happen because of this work?">
      <textarea id="b-goal" v-model="f.goal" name="goal" placeholder="Who is the audience, and what do you need them to understand, believe or do?" />
    </FormField>
    <FormRow>
      <FormField id="b-nda" label="NDA or site induction required?">
        <select id="b-nda" v-model="f.nda" name="nda"><option v-for="o in NDA" :key="o">{{ o }}</option></select>
      </FormField>
      <FormField id="b-spec" label="Client technical spec to shoot to?">
        <select id="b-spec" v-model="f.spec" name="spec"><option v-for="o in SPEC" :key="o">{{ o }}</option></select>
      </FormField>
    </FormRow>

    <AcceptBox id="b-consent" v-model="f.consent" tone="mal" :bad="consentBad">
      I have read the <NuxtLink to="/privacy">Privacy Notice</NuxtLink>
      and understand that any quotation will be issued subject to Tmiladzi Media's
      <NuxtLink to="/commercial">Commercial Services Terms</NuxtLink>.
    </AcceptBox>

    <p v-if="formErr" class="err" role="alert">{{ formErr }}</p>

    <div class="row mt-2">
      <BaseButton variant="primary" type="submit" arrow>Prepare brief</BaseButton>
      <BaseButton :href="SITE.whatsapp" external>Or message on WhatsApp</BaseButton>
    </div>
    <p class="note">Replies within one working day. Proposals and quotations usually within two.
      Our <NuxtLink to="/terms">terms of business</NuxtLink> apply to
      commissioned work; the licence you get is set out in your quotation.</p>

    <div v-if="out" class="out" aria-live="polite">
      <Eyebrow class="mb-3">Brief ready</Eyebrow>
      <p class="muted out__p">Copy this and send it to
        <strong class="fg">{{ SITE.email }}</strong>, or paste it straight into WhatsApp.
        Once the site is live on your own hosting this submits itself.</p>
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
.form { display: grid; gap: var(--tm-sys-space-4); }
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
</style>
