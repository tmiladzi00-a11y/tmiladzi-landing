<script setup lang="ts">
const { data: me } = await useAdminMe()
useHead({ titleTemplate: (t) => (t ? `${t} — Tmiladzi CMS` : 'Tmiladzi CMS'), meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="adm">
    <header class="adm__bar">
      <NuxtLink to="/admin" class="adm__brand">Tmiladzi <span>CMS</span></NuxtLink>
      <nav class="adm__nav" aria-label="Admin">
        <NuxtLink to="/admin" class="adm__link" exact-active-class="adm__link--on">Packages</NuxtLink>
        <NuxtLink to="/admin/settings" class="adm__link" active-class="adm__link--on">Booking page</NuxtLink>
        <a href="/booking" target="_blank" rel="noopener" class="adm__link">View site ↗</a>
      </nav>
      <span v-if="me?.data" class="adm__who">{{ me.data.email }}</span>
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
.adm__who { margin-left: auto; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-on-surface-faint); }
.adm__main { max-width: 1280px; margin: 0 auto; padding: var(--tm-sys-space-7) var(--tm-sys-space-5) var(--tm-sys-space-9); }
.adm__main :deep(.field) { align-content: start; } /* a hint under one field must not shift its neighbour's input */
.adm__alert { padding: var(--tm-sys-space-4); border: 1px solid var(--tm-sys-color-error); border-radius: var(--tm-sys-shape-corner); }
</style>
