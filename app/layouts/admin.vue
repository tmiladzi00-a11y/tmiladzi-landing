<script setup lang="ts">
const { data: me } = await useAdminMe()
/* what needs staff, on every admin page: requests waiting and deposits past their hold */
const route = useRoute()
const { data: counts } = await useAsyncData('admin-counts',
  () => (me.value?.data?.database ? adminCall<{ pending: number; deposit: number; overdue: number }>('/api/admin/counts') : Promise.resolve(null)),
  { watch: [() => route.fullPath] })
const attention = computed(() => (counts.value?.data?.pending ?? 0) + (counts.value?.data?.overdue ?? 0))
const attentionLabel = computed(() => {
  const c = counts.value?.data
  if (!c) return ''
  return [c.pending && `${c.pending} waiting`, c.overdue && `${c.overdue} deposit${c.overdue === 1 ? '' : 's'} overdue`].filter(Boolean).join(', ')
})
useHead({ titleTemplate: (t) => (t ? `${t} — Tmiladzi CMS` : 'Tmiladzi CMS'), meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="adm">
    <header class="adm__bar">
      <NuxtLink to="/admin" class="adm__brand">Tmiladzi <span>CMS</span></NuxtLink>
      <nav class="adm__nav" aria-label="Admin">
        <NuxtLink to="/admin/bookings" class="adm__link" active-class="adm__link--on" :aria-label="attention ? `Bookings: ${attentionLabel}` : undefined">
          Bookings<span v-if="attention" class="adm__n" :class="{ 'adm__n--late': counts?.data?.overdue }" :title="attentionLabel">{{ attention }}</span>
        </NuxtLink>
        <NuxtLink to="/admin" class="adm__link" exact-active-class="adm__link--on">Packages</NuxtLink>
        <NuxtLink to="/admin/settings" class="adm__link" active-class="adm__link--on">Booking page</NuxtLink>
        <a href="/booking" target="_blank" rel="noopener" class="adm__link">View site ↗</a>
      </nav>
      <span v-if="me?.data" class="adm__who">{{ me.data.email }}
        <!-- Cloudflare Access ends the session; locally there is none to end -->
        <a v-if="me.data.email !== 'dev@localhost'" href="/cdn-cgi/access/logout" class="adm__out">Sign out</a>
      </span>
    </header>
    <main class="adm__main">
      <p v-if="me?.error" class="err adm__alert" role="alert">{{ me.error }}</p>
      <p v-else-if="me?.data && !me.data.database" class="err adm__alert" role="alert">
        No CMS database is bound to this deployment, so there is nothing to edit. The site is showing its built-in prices.
      </p>
      <slot v-else />
    </main>
  </div>
</template>

<style scoped>
.adm { min-height: 100vh; background: var(--tm-sys-color-surface); }
.adm__bar {
  position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; align-items: center; gap: var(--tm-sys-space-3) var(--tm-sys-space-6);
  padding: var(--tm-sys-space-3) var(--tm-sys-space-5); border-bottom: 1px solid var(--tm-sys-color-outline);
  background: var(--tm-sys-elevation-5-bg); backdrop-filter: var(--tm-sys-elevation-5-filter); -webkit-backdrop-filter: var(--tm-sys-elevation-5-filter);
}
.adm__brand { font-family: var(--tm-sys-type-display-family); font-size: 20px; color: var(--tm-sys-color-on-surface); text-decoration: none; }
.adm__brand span { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; color: var(--tm-sys-color-secondary-hover); vertical-align: 3px; }
.adm__nav { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-1); }
.adm__link {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .12em; text-transform: uppercase;
  color: var(--tm-sys-color-on-surface-variant); text-decoration: none; padding: 8px 12px; border-radius: var(--tm-sys-shape-corner);
}
.adm__link:hover { color: var(--tm-sys-color-on-surface); background: color-mix(in srgb, var(--tm-sys-color-on-surface) var(--tm-sys-state-hover), transparent); }
.adm__link--on { color: var(--tm-sys-color-primary-hover); }
.adm__n { margin-left: 6px; min-width: 18px; padding: 1px 6px; border-radius: var(--tm-sys-shape-corner-pill); background: var(--tm-sys-color-secondary); color: var(--tm-sys-color-on-secondary); font-size: 10px; letter-spacing: 0; }
.adm__n--late { background: var(--tm-sys-color-error); color: #fff; }
.adm__out { margin-left: var(--tm-sys-space-3); color: var(--tm-sys-color-on-surface-variant); }
.adm__out:hover { color: var(--tm-sys-color-on-surface); }
.adm__who { margin-left: auto; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-on-surface-faint); }
.adm__main { max-width: 1280px; margin: 0 auto; padding: var(--tm-sys-space-7) var(--tm-sys-space-5) var(--tm-sys-space-9); }
.adm__main :deep(.field) { align-content: start; } /* a hint under one field must not shift its neighbour's input */
.adm__alert { padding: var(--tm-sys-space-4); border: 1px solid var(--tm-sys-color-error); border-radius: var(--tm-sys-shape-corner); }
</style>
