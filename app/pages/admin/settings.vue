<script setup lang="ts">
import type { BookingSettings } from '~/content/types'
import { useEventListener } from '@vueuse/core'
import { checkSettings, hourlySlots, type Errors } from '~/utils/catalog'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Booking page' })

const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0') + ':00')

const { data: loaded } = await useAsyncData('admin-settings', () => adminCall<BookingSettings>('/api/admin/settings'))
const s = loaded.value?.data
const form = reactive({
  eyebrow: s?.eyebrow ?? '', title: s?.title ?? '', lede: s?.lede ?? '',
  dayStart: s?.dayStart ?? '07:00', dayEnd: s?.dayEnd ?? '18:00',
  regions: (s?.regions ?? []).join('\n'), heard: (s?.heard ?? []).join('\n'),
})
const blocks = computed(() => (form.dayEnd > form.dayStart ? hourlySlots(form.dayStart, form.dayEnd).length : 0))

/* Same as the package editor: a field shows its problem once you leave it
   (or try to save), and the message clears as soon as it is fixed. */
const body = () => ({ ...form, regions: form.regions.split('\n'), heard: form.heard.split('\n') })
const check = computed(() => checkSettings(body()))
const touched = reactive(new Set<string>())
const submitted = ref(false)
const serverErrors = ref<Errors>({})
function err(k: string): string | undefined {
  const live = check.value.ok ? {} : check.value.errors
  return serverErrors.value[k] ?? (submitted.value || touched.has(k) ? live[k] : undefined)
}
/* moving the first hour can make the last hour wrong: say so on the last hour at once */
const dayEndErr = computed(() => err('dayEnd') ?? (touched.has('dayStart') && !check.value.ok ? check.value.errors.dayEnd : undefined))
function onLeave(e: Event) {
  const k = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-field]')?.dataset.field
  if (k) touched.add(k)
}

const snapshot = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== snapshot.value)
watch(form, () => { serverErrors.value = {} }, { deep: true })
onBeforeRouteLeave(() => (dirty.value ? confirm('You have unsaved changes. Leave without saving?') : true))
useEventListener('beforeunload', (e: BeforeUnloadEvent) => { if (dirty.value) e.preventDefault() })

const msg = ref('')
const formErr = ref('')
const saving = ref(false)

async function save() {
  msg.value = ''
  submitted.value = true
  if (!check.value.ok) {
    nextTick(() => document.querySelector<HTMLElement>('.ed .field--bad input, .ed .field--bad select, .ed .field--bad textarea')?.focus())
    return
  }
  formErr.value = ''; saving.value = true
  const r = await adminCall<BookingSettings>('/api/admin/settings', { method: 'PUT', body: check.value.value })
  saving.value = false
  if (r.error) { serverErrors.value = r.fields ?? {}; formErr.value = r.error; return }
  snapshot.value = JSON.stringify(form)
  submitted.value = false
  touched.clear()
  msg.value = 'Saved. The booking page shows it now.'
}
</script>

<template>
  <div>
    <h1 class="display h3 h">Booking page</h1>
    <p class="muted p">The words at the top of the booking page, the hours clients can book, and the choices in the details form.</p>
    <p v-if="loaded?.error" class="err" role="alert">{{ loaded.error }}</p>
    <form v-else class="ed" novalidate @submit.prevent="save" @focusout="onLeave" @change="onLeave">
      <fieldset class="sec">
        <legend class="sec__k">Page heading</legend>
        <FormRow>
          <FormField id="s-eyebrow" label="Eyebrow" hint="Small line above the title">
            <input id="s-eyebrow" v-model="form.eyebrow">
          </FormField>
          <FormField id="s-title" data-field="title" label="Title" :error="err('title')" required>
            <input id="s-title" v-model="form.title">
          </FormField>
        </FormRow>
        <FormField id="s-lede" data-field="lede" label="Introduction" :error="err('lede')" :hint="`${form.lede.length} / 600 characters`">
          <textarea id="s-lede" v-model="form.lede" rows="3" />
        </FormField>
      </fieldset>

      <fieldset class="sec">
        <legend class="sec__k">Bookable hours</legend>
        <FormRow>
          <FormField id="s-start" data-field="dayStart" label="First hour starts" :error="err('dayStart')">
            <select id="s-start" v-model="form.dayStart"><option v-for="h in HOURS" :key="h">{{ h }}</option></select>
          </FormField>
          <FormField id="s-end" data-field="dayEnd" label="Last hour ends" :error="dayEndErr">
            <select id="s-end" v-model="form.dayEnd"><option v-for="h in HOURS" :key="h">{{ h }}</option></select>
          </FormField>
        </FormRow>
        <p class="mono blocks">{{ blocks }} one-hour block{{ blocks === 1 ? '' : 's' }} a day. Availability still comes from the studio calendar.</p>
      </fieldset>

      <fieldset class="sec">
        <legend class="sec__k">Details form</legend>
        <FormRow>
          <FormField id="s-regions" data-field="regions" label="“Where is it?” choices" :error="err('regions')" hint="One per line">
            <textarea id="s-regions" v-model="form.regions" rows="5" />
          </FormField>
          <FormField id="s-heard" data-field="heard" label="“How did you find us?” choices" :error="err('heard')" hint="One per line">
            <textarea id="s-heard" v-model="form.heard" rows="5" />
          </FormField>
        </FormRow>
      </fieldset>

      <div class="foot">
        <p v-if="formErr" class="err" role="alert">{{ formErr }}</p>
        <p v-else-if="submitted && !check.ok" class="err" role="alert">Fix the highlighted fields to save.</p>
        <p v-else-if="msg && !dirty" class="mono ok" role="status">{{ msg }}</p>
        <p v-else-if="dirty" class="mono pending">Unsaved changes</p>
        <div><BaseButton variant="copper" type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save changes' }}</BaseButton></div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.h { margin: 0; }
.p { margin: var(--tm-sys-space-2) 0 0; max-width: 60ch; }
.ed { display: grid; gap: var(--tm-sys-space-6); margin-top: var(--tm-sys-space-6); }
.sec { border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-5); margin: 0; min-width: 0; display: grid; gap: var(--tm-sys-space-4); }
.sec__k { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-secondary-hover); padding: 0 6px; }
.blocks { margin: 0; font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-on-surface-faint); }
.foot { display: grid; gap: var(--tm-sys-space-3); }
.foot .err, .ok { margin: 0; }
.ok, .pending { margin: 0; font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-primary-hover); }
.pending { color: var(--tm-sys-color-secondary-hover); }
</style>
