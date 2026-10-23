<script setup lang="ts">
import type { PackageRecord } from '~/content/types'
import { TIERS, TIER_LABEL } from '~/utils/catalog'
import { fmtMoney } from '~/utils/money'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Packages' })

const { data: res, refresh } = await useAsyncData('admin-packages', () => adminCall<PackageRecord[]>('/api/admin/packages'))
const list = computed(() => res.value?.data ?? [])
const groups = computed(() => TIERS.map((tier) => ({ tier, label: TIER_LABEL[tier], items: list.value.filter((p) => p.tier === tier) })))
const busy = ref('')
/* a message handed over by the editor after publishing, unpublishing or deleting */
const flash = useState('admin-flash', () => '')
const msg = ref(flash.value)
flash.value = ''

/* Order is one list across both tiers; moving swaps with the neighbour in the same tier. */
async function move(p: PackageRecord, dir: -1 | 1) {
  const ids = list.value.map((x) => x.id)
  const same = list.value.filter((x) => x.tier === p.tier)
  const other = same[same.indexOf(p) + dir]
  if (!other) return
  const i = ids.indexOf(p.id), j = ids.indexOf(other.id)
  ;[ids[i], ids[j]] = [ids[j]!, ids[i]!]
  busy.value = p.id
  const r = await adminCall('/api/admin/order', { method: 'PUT', body: { ids } })
  msg.value = r.error ?? ''
  await refresh()
  busy.value = ''
}

async function togglePublished(p: PackageRecord) {
  busy.value = p.id
  const r = await adminCall<PackageRecord>(`/api/admin/packages/${p.id}`, { method: 'PUT', body: { ...p, published: !p.published } })
  msg.value = r.error ?? `${p.name} is ${p.published ? 'now a draft' : 'live on the booking page'}.`
  await refresh()
  busy.value = ''
}

const when = (s?: string) => (s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—')
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1 class="display h3 head__h">Packages</h1>
        <p class="muted head__p">What clients can book. Only published packages appear on the booking and weddings pages.</p>
      </div>
      <BaseButton variant="copper" to="/admin/packages/new" arrow>New package</BaseButton>
    </div>
    <p v-if="res?.error" class="err" role="alert">{{ res.error }}</p>
    <p class="mono msg" role="status">{{ msg }}</p>

    <section v-for="g in groups" :key="g.tier" class="tier" :aria-labelledby="`t-${g.tier}`">
      <h2 :id="`t-${g.tier}`" class="tier__h">{{ g.label }} <span>{{ g.items.length }}</span></h2>
      <p v-if="!g.items.length" class="muted tier__empty">No {{ g.label.toLowerCase() }} packages yet.</p>
      <ul v-else class="rows">
        <li v-for="(p, i) in g.items" :key="p.id" class="pkrow" :class="{ 'pkrow--busy': busy === p.id }">
          <div class="pkrow__order">
            <button type="button" class="ic" :disabled="i === 0 || !!busy" :aria-label="`Move ${p.name} up`" @click="move(p, -1)">↑</button>
            <button type="button" class="ic" :disabled="i === g.items.length - 1 || !!busy" :aria-label="`Move ${p.name} down`" @click="move(p, 1)">↓</button>
          </div>
          <div class="pkrow__main">
            <NuxtLink :to="`/admin/packages/${p.id}`" class="pkrow__name">{{ p.name }}</NuxtLink>
            <span class="mono pkrow__meta">{{ p.tag }} · {{ p.cov }} · {{ p.addons.length }} add-on{{ p.addons.length === 1 ? '' : 's' }}</span>
          </div>
          <span class="num pkrow__price">{{ p.price == null ? 'On request' : 'K' + fmtMoney(p.price) }}</span>
          <span class="chip" :class="p.published ? 'chip--live' : 'chip--draft'">{{ p.published ? 'Published' : 'Draft' }}</span>
          <span class="mono pkrow__when" :title="p.updatedBy">{{ when(p.updatedAt) }}</span>
          <div class="pkrow__act">
            <BaseButton size="sm" :disabled="!!busy" @click="togglePublished(p)">{{ p.published ? 'Unpublish' : 'Publish' }}</BaseButton>
            <BaseButton size="sm" :to="`/admin/packages/${p.id}`">Edit</BaseButton>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: var(--tm-sys-space-4); }
.head__h { margin: 0; }
.head__p { margin: var(--tm-sys-space-2) 0 0; max-width: 60ch; }
.msg { min-height: 1.6em; margin: var(--tm-sys-space-4) 0 0; font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-primary-hover); }
.tier { margin-top: var(--tm-sys-space-6); }
.tier__h { margin: 0 0 var(--tm-sys-space-3); font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-secondary-hover); }
.tier__h span { color: var(--tm-sys-color-on-surface-faint); margin-left: 6px; }
.tier__empty { margin: 0; padding: var(--tm-sys-space-4); border: 1px dashed var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); }
.rows { list-style: none; margin: 0; padding: 0; border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); }
.pkrow {
  display: grid; align-items: center; gap: var(--tm-sys-space-2) var(--tm-sys-space-4);
  grid-template-columns: auto 1fr auto; padding: var(--tm-sys-space-3) var(--tm-sys-space-4);
  transition: opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.pkrow + .pkrow { border-top: 1px solid var(--tm-sys-color-outline-variant); }
.pkrow--busy { opacity: .5; }
@media (min-width: 860px) { .pkrow { grid-template-columns: auto minmax(0, 1fr) 110px 96px 120px 200px; } }
@media (max-width: 859px) {
  .pkrow__when { display: none; }
  .pkrow__order { grid-row: 1 / 3; }
  .chip { grid-column: 2; grid-row: 2; }
  .pkrow__act { grid-column: 1 / -1; }
}
.pkrow__order { display: flex; flex-direction: column; gap: 2px; }
.ic {
  width: 28px; height: 22px; display: grid; place-items: center; cursor: pointer; font-size: 12px;
  background: transparent; color: var(--tm-sys-color-on-surface-variant); border: 1px solid var(--tm-sys-color-outline-variant); border-radius: var(--tm-sys-shape-corner);
}
.ic:hover:not(:disabled) { border-color: var(--tm-sys-color-primary); color: var(--tm-sys-color-primary-hover); }
.ic:disabled { opacity: .3; cursor: default; }
.pkrow__main { min-width: 0; display: grid; gap: 2px; }
.pkrow__name { font-family: var(--tm-sys-type-display-family); font-size: 19px; color: var(--tm-sys-color-on-surface); text-decoration: none; }
.pkrow__name:hover { color: var(--tm-sys-color-primary-hover); }
.pkrow__meta { font-size: var(--tm-sys-type-data-size-xs); color: var(--tm-sys-color-on-surface-faint); }
.pkrow__price { font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes); font-size: 18px; text-align: right; }
.pkrow__when { font-size: var(--tm-sys-type-data-size-xs); color: var(--tm-sys-color-on-surface-faint); }
.pkrow__act { display: flex; gap: var(--tm-sys-space-2); justify-content: end; }
.chip { justify-self: start; font-family: var(--tm-sys-type-data-family); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; padding: 4px 8px; border-radius: var(--tm-sys-shape-corner-pill); border: 1px solid; }
.chip--live { color: var(--tm-sys-color-primary-hover); border-color: var(--tm-sys-color-primary-container); background: var(--tm-sys-color-primary-tint); }
.chip--draft { color: var(--tm-sys-color-on-surface-faint); border-color: var(--tm-sys-color-outline); }
</style>
