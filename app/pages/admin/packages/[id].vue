<script setup lang="ts">
import { useEventListener, useMediaQuery } from '@vueuse/core'
import type { Addon, PackageRecord, Service } from '~/content/types'
import { TIERS, TIER_LABEL, blankPackage, checkPackage, type Errors } from '~/utils/catalog'
import { fmtMoney } from '~/utils/money'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const isNew = computed(() => route.params.id === 'new')

/* The form edits loose values (numbers may be '' while typing); checkPackage
   turns them into a record, the same check the API runs. Ids are never typed:
   a new package's id is made from its name, an add-on's from its name, and
   the add-on billed for extra hours is the one ticked as such (id 'time'). */
type AddonForm = Omit<Addon, 'price' | 'max'> & { price: number | ''; max: number | ''; delivery: boolean; extraHours: boolean }
interface Form {
  id: string; tier: PackageRecord['tier']; name: string; tag: string; price: number | ''; depPct: number | ''
  hours: number | ''; cov: string; delivery: number | ''; deliveryUnit: PackageRecord['deliveryUnit']
  live: boolean; blurb: string; includes: string; notes: string; published: boolean; addons: AddonForm[]
}

const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)

const toForm = (p: PackageRecord): Form => ({
  id: p.id, tier: p.tier, name: p.name, tag: p.tag, price: p.price ?? '', depPct: Math.round(p.dep * 100),
  hours: p.hours, cov: p.cov, delivery: p.delivery, deliveryUnit: p.deliveryUnit, live: p.live, blurb: p.blurb,
  includes: p.includes.join('\n'), notes: p.notes.join('\n'), published: p.published,
  addons: p.addons.map((a) => ({ ...a, price: a.price ?? '', max: a.max ?? '', delivery: a.affects === 'delivery', extraHours: a.id === 'time' })),
})
const fromForm = (f: Form) => ({
  ...f, id: isNew.value ? slug(f.name) : f.id,
  price: f.price === '' ? null : f.price, dep: f.depPct === '' ? NaN : Number(f.depPct) / 100,
  includes: f.includes.split('\n'), notes: f.notes.split('\n'),
  addons: f.addons.map(({ delivery, extraHours, ...a }) => ({
    ...a, id: extraHours ? 'time' : a.id && a.id !== 'time' ? a.id : slug(a.name),
    price: a.price === '' ? null : a.price, max: a.max === '' ? null : a.max, affects: delivery ? 'delivery' as const : undefined,
  })),
})

const { data: loaded } = await useAsyncData(`admin-pkg-${route.params.id}`, () =>
  isNew.value ? Promise.resolve({ data: blankPackage() }) : adminCall<PackageRecord>(`/api/admin/packages/${route.params.id}`))
const form = reactive<Form>(toForm(loaded.value?.data ?? blankPackage()))
const loadError = computed(() => loaded.value?.error)
useHead({ title: () => (isNew.value ? 'New package' : form.name || 'Package') })

/* ---------- validation as you go ----------
   A field shows its problem once you have left it (or tried to save), and
   the message updates as you type, so it disappears the moment it is fixed. */
const touched = reactive(new Set<string>())
const submitted = ref(false)
const serverErrors = ref<Errors>({})
const check = computed(() => checkPackage(fromForm(form)))
const live = computed<Errors>(() => (check.value.ok ? {} : check.value.errors))
function err(k: string): string | undefined {
  return serverErrors.value[k] ?? (submitted.value || touched.has(k) ? live.value[k] : undefined)
}
function onLeave(e: FocusEvent) {
  const k = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-field]')?.dataset.field
  if (k) touched.add(k)
}
/* ids are made from names, so their problems are reported against the name */
const nameErr = computed(() => err('name') ?? (serverErrors.value.id
  ? 'Another package already has this name. Choose a different one.'
  : err('id') && form.name.trim() ? 'Use some letters or numbers in the name.' : undefined))
function addonNameErr(i: number) {
  const k = `addons.${i}.`
  if (err(k + 'name')) return err(k + 'name')
  const idErr = submitted.value || touched.has(k + 'name') ? live.value[k + 'id'] : undefined
  if (!idErr) return undefined
  if (idErr === 'Used twice') return form.addons[i]!.extraHours ? 'Only one add-on can be the extra-hours charge.' : 'Another add-on already has this name.'
  return 'Use some letters or numbers in the name.'
}
const problems = computed(() => Object.keys(live.value).length)

/* ---------- unsaved changes ---------- */
const snapshot = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== snapshot.value)
watch(form, () => { serverErrors.value = {} }, { deep: true })
onBeforeRouteLeave(() => (dirty.value ? confirm('You have unsaved changes. Leave without saving?') : true))
useEventListener('beforeunload', (e: BeforeUnloadEvent) => { if (dirty.value) e.preventDefault() })

/* ---------- live preview ---------- */
const wide = useMediaQuery('(min-width: 1000px)')
const showPreview = ref(false)
const num = (v: number | '' | null) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const preview = computed<Service>(() => {
  const b = fromForm(form)
  return {
    id: b.id || 'preview', tier: b.tier, name: b.name.trim() || 'Package name', tag: b.tag, price: b.price,
    dep: Number.isFinite(b.dep) ? b.dep : 0, hours: num(b.hours), cov: b.cov.trim() || '—', delivery: num(b.delivery),
    deliveryUnit: b.deliveryUnit, live: b.live, blurb: b.blurb, includes: lines(form.includes), notes: lines(form.notes),
    addons: b.addons.filter((a) => a.name.trim()).map((a, i) => ({
      id: a.id === 'time' ? 'time' : `p${i}-${a.id}`, name: a.name, unit: a.unit, type: a.type, price: a.price, d: a.d,
      ...(typeof a.max === 'number' ? { max: a.max } : {}),
    })),
  }
})
/* step 3 never lists the extra-hours charge: the studio sets the length on approval */
const stepAddons = computed(() => preview.value.addons.filter((a) => a.id !== 'time'))
const extraHour = computed(() => preview.value.addons.find((a) => a.id === 'time'))
const money = (n: number | null) => (n == null ? 'On request' : 'K' + fmtMoney(n))

/* ---------- editing ---------- */
function addAddon() {
  form.addons.push({ id: '', name: '', unit: '', type: 'toggle', price: '', max: '', d: '', delivery: false, extraHours: false })
  nextTick(() => document.getElementById(`a${form.addons.length - 1}-name`)?.focus())
}
function moveAddon(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= form.addons.length) return
  ;[form.addons[i], form.addons[j]] = [form.addons[j]!, form.addons[i]!]
}
/* no question asked: nothing is saved until Save, and leaving unsaved asks first */
function removeAddon(i: number) {
  form.addons.splice(i, 1)
}
/* the extra-hours charge is always a per-hour quantity */
function setExtraHours(a: AddonForm) {
  if (a.extraHours) { a.type = 'qty'; a.unit = 'hour'; a.max = '' }
}

const formErr = ref('')
const saved = ref('')
const saving = ref<'' | 'publish' | 'draft'>('')
/* shown on the packages list after a redirect from here */
const flash = useState('admin-flash', () => '')

function focusFirstProblem() {
  nextTick(() => {
    const el = document.querySelector<HTMLElement>('.ed .field--bad input, .ed .field--bad select, .ed .field--bad textarea')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.focus({ preventScroll: true })
  })
}

/* Publish: save, put it on the booking page and go back to the list, in one
   click. Draft: save without publishing (taking a live package off the site);
   only taking one down returns to the list, a plain draft save stays here. */
async function save(publish: boolean) {
  saved.value = ''
  submitted.value = true
  if (!check.value.ok) { formErr.value = ''; focusFirstProblem(); return }
  const wasLive = form.published
  const body = { ...check.value.value, published: publish }
  formErr.value = ''; saving.value = publish ? 'publish' : 'draft'
  const r = isNew.value
    ? await adminCall<PackageRecord>('/api/admin/packages', { method: 'POST', body })
    : await adminCall<PackageRecord>(`/api/admin/packages/${form.id}`, { method: 'PUT', body })
  saving.value = ''
  if (r.error) {
    formErr.value = r.error
    nextTick(() => { serverErrors.value = r.fields ?? {}; focusFirstProblem() })
    return
  }
  const p = r.data!
  clearNuxtData(['admin-packages', `admin-pkg-${p.id}`])
  Object.assign(form, toForm(p))
  snapshot.value = JSON.stringify(form)
  submitted.value = false
  touched.clear()
  if (publish || wasLive) {
    flash.value = publish ? `“${p.name}” is live on the booking page.` : `“${p.name}” moved to drafts and is no longer on the site.`
    return navigateTo('/admin')
  }
  if (isNew.value) return navigateTo(`/admin/packages/${p.id}`, { replace: true })
  saved.value = 'Draft saved. It is not on the site until you publish it.'
}

async function remove() {
  const r = await adminCall(`/api/admin/packages/${form.id}`, { method: 'DELETE' })
  if (r.error) { formErr.value = r.error; return }
  clearNuxtData('admin-packages')
  snapshot.value = JSON.stringify(form)
  flash.value = `“${form.name}” was deleted.`
  return navigateTo('/admin')
}
</script>

<template>
  <div>
    <NuxtLink to="/admin" class="mono back">← All packages</NuxtLink>
    <p v-if="loadError" class="err" role="alert">{{ loadError }}</p>
    <div v-else class="edwrap">
      <!-- LIVE PREVIEW: the same components the booking page uses, fed from the form -->
      <aside v-if="wide || showPreview" class="pv" aria-label="Live preview">
        <div class="pv__in">
          <p class="pv__k">Live preview <span>· what clients see</span></p>
          <p class="mono pv__step">Step 1 · Coverage — under <b>{{ TIER_LABEL[form.tier] }}</b></p>
          <div class="pv__frame" inert>
            <BookingServicePicker :services="[preview]" :model-value="null" />
          </div>
          <p class="mono pv__step">Step 3 · Add-ons</p>
          <div class="pv__frame" inert>
            <BookingAddonStepper v-if="stepAddons.length" :addons="stepAddons" :qty="() => 0" />
            <p v-else class="muted pv__none">No optional add-ons.</p>
          </div>
          <dl class="pv__facts">
            <div><dt>Deposit</dt><dd>{{ Math.round(preview.dep * 100) }}% of the total</dd></div>
            <div><dt>Delivery</dt><dd>{{ preview.delivery }} {{ preview.deliveryUnit }}</dd></div>
            <div><dt>Extra hours</dt><dd>{{ extraHour ? money(extraHour.price) + ' / hour' : 'Not offered' }}</dd></div>
          </dl>
        </div>
      </aside>

      <!-- Enter in a field saves without changing whether the package is live -->
      <form class="ed" novalidate @submit.prevent="save(form.published)" @focusout="onLeave">
        <div class="ed__head">
          <h1 class="display h3 ed__h">{{ isNew ? 'New package' : form.name || 'Untitled' }}</h1>
          <span class="state" :class="form.published ? 'state--live' : 'state--draft'">
            {{ form.published ? 'Live on the booking page' : isNew ? 'New · not on the site yet' : 'Draft · not on the site' }}
          </span>
        </div>
        <button v-if="!wide" type="button" class="pvtoggle" :aria-expanded="showPreview" @click="showPreview = !showPreview">
          {{ showPreview ? 'Hide preview' : 'Show preview' }}
        </button>

        <fieldset class="sec">
          <legend class="sec__k">The package</legend>
          <FormRow>
            <FormField id="p-name" data-field="name" label="Name" :error="nameErr" required>
              <input id="p-name" v-model="form.name" placeholder="e.g. Weddings" maxlength="80">
            </FormField>
            <FormField id="p-tier" data-field="tier" label="Range" :error="err('tier')" hint="Which side of the Basic | Premium switch it sits on" required>
              <select id="p-tier" v-model="form.tier"><option v-for="t in TIERS" :key="t" :value="t">{{ TIER_LABEL[t] }}</option></select>
            </FormField>
          </FormRow>
          <FormField id="p-tag" label="Tag" hint="The small line above the name, e.g. “Full day”">
            <input id="p-tag" v-model="form.tag" maxlength="40">
          </FormField>
          <FormField id="p-blurb" data-field="blurb" label="Short description" :error="err('blurb')" :hint="`${form.blurb.length} / 400 characters`">
            <textarea id="p-blurb" v-model="form.blurb" rows="2" class="short" />
          </FormField>
        </fieldset>

        <fieldset class="sec">
          <legend class="sec__k">Price &amp; terms</legend>
          <FormRow>
            <FormField id="p-price" data-field="price" label="Price (Kwacha)" :error="err('price')" hint="Leave empty to show “On request”">
              <input id="p-price" v-model.number="form.price" type="number" min="0" step="50" inputmode="numeric" placeholder="On request">
            </FormField>
            <FormField id="p-dep" data-field="dep" label="Deposit (%)" :error="err('dep')" hint="Share of the total paid to hold the date" required>
              <input id="p-dep" v-model.number="form.depPct" type="number" min="0" max="100" inputmode="numeric">
            </FormField>
          </FormRow>
          <FormRow>
            <FormField id="p-hours" data-field="hours" label="Hours included" :error="err('hours')" hint="Extra hours are charged with the extra-hours add-on" required>
              <input id="p-hours" v-model.number="form.hours" type="number" min="1" max="24" inputmode="numeric">
            </FormField>
            <FormField id="p-cov" data-field="cov" label="Coverage label" :error="err('cov')" hint="How the hours read to clients, e.g. “10 hours”" required>
              <input id="p-cov" v-model="form.cov">
            </FormField>
          </FormRow>
          <FormRow>
            <FormField id="p-delivery" data-field="delivery" label="Standard delivery" :error="err('delivery')" required>
              <input id="p-delivery" v-model.number="form.delivery" type="number" min="0" inputmode="numeric">
            </FormField>
            <FormField id="p-unit" data-field="deliveryUnit" label="Delivery in" :error="err('deliveryUnit')" required>
              <select id="p-unit" v-model="form.deliveryUnit"><option value="weeks">Weeks</option><option value="hours">Hours</option></select>
            </FormField>
          </FormRow>
        </fieldset>

        <fieldset class="sec">
          <legend class="sec__k">What clients see</legend>
          <FormRow>
            <FormField id="p-inc" data-field="includes" label="What you get" :error="err('includes')" hint="One per line. The first four show on the card.">
              <textarea id="p-inc" v-model="form.includes" rows="6" />
            </FormField>
            <FormField id="p-notes" data-field="notes" label="Worth knowing" :error="err('notes')" hint="One per line. Shown on the Weddings page.">
              <textarea id="p-notes" v-model="form.notes" rows="6" />
            </FormField>
          </FormRow>
        </fieldset>

        <fieldset class="sec">
          <legend class="sec__k">Add-ons</legend>
          <p class="muted sec__p">Optional extras clients choose in step 3.</p>
          <p v-if="err('addons')" class="err">{{ err('addons') }}</p>
          <div v-for="(a, i) in form.addons" :key="i" class="addon" :class="{ 'addon--hours': a.extraHours }">
            <div class="addon__bar">
              <span class="mono addon__n">{{ String(i + 1).padStart(2, '0') }}<template v-if="a.extraHours"> · extra-hours charge</template></span>
              <button type="button" class="ic" :disabled="i === 0" :aria-label="`Move ${a.name || 'add-on'} up`" @click="moveAddon(i, -1)">↑</button>
              <button type="button" class="ic" :disabled="i === form.addons.length - 1" :aria-label="`Move ${a.name || 'add-on'} down`" @click="moveAddon(i, 1)">↓</button>
              <button type="button" class="ic ic--wide" @click="removeAddon(i)">Remove</button>
            </div>
            <div class="addon__grid">
              <FormField :id="`a${i}-name`" :data-field="`addons.${i}.name`" label="Name" :error="addonNameErr(i)" required>
                <input :id="`a${i}-name`" v-model="a.name" placeholder="e.g. Wedding reel">
              </FormField>
              <FormField :id="`a${i}-type`" :data-field="`addons.${i}.type`" label="Clients choose it" :error="err(`addons.${i}.type`)">
                <select :id="`a${i}-type`" v-model="a.type" :disabled="a.extraHours"><option value="toggle">On / off</option><option value="qty">By quantity</option></select>
              </FormField>
              <FormField :id="`a${i}-price`" :data-field="`addons.${i}.price`" label="Price (Kwacha)" :error="err(`addons.${i}.price`)" hint="Empty = quoted separately">
                <input :id="`a${i}-price`" v-model.number="a.price" type="number" min="0" inputmode="numeric" placeholder="Quoted separately">
              </FormField>
              <FormField v-if="a.type === 'qty'" :id="`a${i}-unit`" label="Priced per">
                <input :id="`a${i}-unit`" v-model="a.unit" :readonly="a.extraHours" placeholder="hour, each, week">
              </FormField>
              <FormField v-if="a.type === 'qty' && !a.extraHours" :id="`a${i}-max`" :data-field="`addons.${i}.max`" label="Most a client can pick" :error="err(`addons.${i}.max`)" hint="Empty = no limit">
                <input :id="`a${i}-max`" v-model.number="a.max" type="number" min="1" max="99" inputmode="numeric">
              </FormField>
            </div>
            <FormField :id="`a${i}-d`" label="Description">
              <input :id="`a${i}-d`" v-model="a.d" placeholder="One line on what the client gets">
            </FormField>
            <div class="ticks">
              <label class="tick"><input v-model="a.extraHours" type="checkbox" @change="setExtraHours(a)"> This is the extra-hours charge: when you accept a booking for longer than the package includes, the extra hours are billed at this price</label>
              <label v-if="!a.extraHours" class="tick"><input v-model="a.delivery" type="checkbox"> Each one bought shortens delivery by one {{ form.deliveryUnit === 'weeks' ? 'week' : 'day' }}</label>
            </div>
          </div>
          <div><BaseButton size="sm" @click="addAddon">+ Add an add-on</BaseButton></div>
        </fieldset>

        <div class="ed__foot">
          <p v-if="formErr" class="err" role="alert">{{ formErr }}</p>
          <p v-else-if="submitted && problems" class="err" role="alert">
            {{ problems === 1 ? 'One field needs' : `${problems} fields need` }} attention before this can be saved.
          </p>
          <p v-else-if="saved && !dirty" class="mono ok" role="status">{{ saved }}</p>
          <p v-else-if="dirty" class="mono pending">Unsaved changes</p>
          <div class="ed__actions">
            <BaseButton variant="copper" :disabled="!!saving" @click="save(true)">
              {{ saving === 'publish' ? 'Publishing…' : form.published ? 'Publish changes' : 'Publish' }}
            </BaseButton>
            <BaseButton :disabled="!!saving" @click="save(false)">
              {{ saving === 'draft' ? 'Saving…' : form.published ? 'Move to drafts' : 'Save draft' }}
            </BaseButton>
            <div v-if="!isNew" class="del"><AdminConfirmButton label="Delete" :question="`Delete “${form.name}”? It disappears from the site immediately and cannot be recovered.`" confirm-label="Yes, delete it" :disabled="!!saving" @confirm="remove" /></div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.back { font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-on-surface-faint); text-decoration: none; }
.back:hover { color: var(--tm-sys-color-primary-hover); }
.edwrap { display: grid; gap: var(--tm-sys-space-6); margin-top: var(--tm-sys-space-4); }
@media (min-width: 1000px) { .edwrap { grid-template-columns: 360px minmax(0, 1fr); align-items: start; } }

/* preview */
.pv__in { display: grid; gap: var(--tm-sys-space-3); }
@media (min-width: 1000px) {
  .pv { position: sticky; top: 76px; max-height: calc(100vh - 92px); overflow: auto; padding-right: 4px; }
}
.pv__k { margin: 0; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-secondary-hover); }
.pv__k span { color: var(--tm-sys-color-on-surface-faint); }
.pv__step { margin: var(--tm-sys-space-2) 0 0; font-size: var(--tm-sys-type-data-size-xs); color: var(--tm-sys-color-on-surface-faint); }
.pv__step b { color: var(--tm-sys-color-on-surface); font-weight: 500; }
.pv__frame { border: 1px dashed var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); padding: var(--tm-sys-space-3); }
.pv__frame :deep(.pks-fs) { margin: 0; }
.pv__frame :deep(.pks) { grid-template-columns: 1fr; }
.pv__none { margin: 0; font-size: 14px; }
.pv__facts { margin: var(--tm-sys-space-2) 0 0; display: grid; gap: 6px; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); }
.pv__facts div { display: flex; justify-content: space-between; gap: var(--tm-sys-space-3); border-bottom: 1px solid var(--tm-sys-color-outline-variant); padding-bottom: 6px; }
.pv__facts dt { color: var(--tm-sys-color-on-surface-faint); }
.pv__facts dd { margin: 0; text-align: right; }
.pvtoggle {
  justify-self: start; cursor: pointer; padding: 8px 12px; background: transparent; color: var(--tm-sys-color-primary-hover);
  border: 1px solid var(--tm-sys-color-primary-container); border-radius: var(--tm-sys-shape-corner);
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .12em; text-transform: uppercase;
}

/* form */
.ed { display: grid; gap: var(--tm-sys-space-6); min-width: 0; }
.ed__head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--tm-sys-space-4); }
.ed__h { margin: 0; }
.state {
  padding: 8px 12px; border: 1px solid; border-radius: var(--tm-sys-shape-corner-pill);
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .14em; text-transform: uppercase;
}
.state--live { color: var(--tm-sys-color-primary-hover); border-color: var(--tm-sys-color-primary-container); background: var(--tm-sys-color-primary-tint); }
.state--draft { color: var(--tm-sys-color-on-surface-faint); border-color: var(--tm-sys-color-outline); }
.sec { border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-5); margin: 0; min-width: 0; display: grid; gap: var(--tm-sys-space-4); }
.sec__k { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-secondary-hover); padding: 0 6px; }
.sec__p { margin: 0; font-size: 14.5px; }
.short { min-height: 72px !important; }
.addon { border: 1px solid var(--tm-sys-color-outline-variant); border-radius: var(--tm-sys-shape-corner); padding: var(--tm-sys-space-4); display: grid; gap: var(--tm-sys-space-3); background: var(--tm-sys-color-surface); }
.addon--hours { border-color: var(--tm-sys-color-secondary-container); }
.addon__bar { display: flex; align-items: center; gap: 6px; }
.addon__n { font-size: var(--tm-sys-type-data-size-xs); color: var(--tm-sys-color-on-surface-faint); margin-right: auto; }
.addon--hours .addon__n { color: var(--tm-sys-color-secondary-hover); }
.addon__grid { display: grid; gap: var(--tm-sys-space-3); grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
.addon__grid > :first-child { grid-column: span 2; }
.ic {
  height: 28px; min-width: 28px; padding: 0 8px; display: inline-grid; place-items: center; cursor: pointer;
  font-family: var(--tm-sys-type-data-family); font-size: 11px; letter-spacing: .08em;
  background: transparent; color: var(--tm-sys-color-on-surface-variant); border: 1px solid var(--tm-sys-color-outline-variant); border-radius: var(--tm-sys-shape-corner);
}
.ic:hover:not(:disabled) { border-color: var(--tm-sys-color-primary); color: var(--tm-sys-color-primary-hover); }
.ic:disabled { opacity: .3; cursor: default; }
.ic--wide { text-transform: uppercase; }
.ticks { display: grid; gap: 6px; }
.tick { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; line-height: 1.45; color: var(--tm-sys-color-on-surface-variant); cursor: pointer; }
.tick input { margin-top: 3px; }
.ed__foot { position: sticky; bottom: 0; z-index: 2; padding: var(--tm-sys-space-4) 0; background: var(--tm-sys-color-surface); border-top: 1px solid var(--tm-sys-color-outline); display: grid; gap: var(--tm-sys-space-3); }
.ed__actions { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-3); }
.ed__foot .err, .ok, .pending { margin: 0; }
.ok, .pending { font-size: var(--tm-sys-type-data-size-sm); }
.ok { color: var(--tm-sys-color-primary-hover); }
.pending { color: var(--tm-sys-color-secondary-hover); }
.del { margin-left: auto; }
</style>
