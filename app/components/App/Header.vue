<script setup lang="ts">
import { NAV } from '~/content/site'

const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <header class="nav">
    <div class="nav__in">
      <NuxtLink class="brand" to="/">
        <span class="brand__mark">TMILADZI</span>
        <span class="brand__sub">Media&nbsp;·&nbsp;ZM</span>
      </NuxtLink>
      <nav class="nav__links" aria-label="Primary">
        <NuxtLink v-for="n in NAV" :key="n.to" class="nav__link" :to="n.to">{{ n.label }}</NuxtLink>
        <BaseButton class="nav__cta" to="/brief" variant="primary" size="sm">Start a brief</BaseButton>
      </nav>
      <button
        class="nav__burger"
        :class="{ 'is-open': open }"
        type="button"
        :aria-expanded="open"
        aria-controls="drawer"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        @click="open = !open"
      >
        <span class="nav__bars" aria-hidden="true"><i /><i /><i /></span>
      </button>
    </div>
    <AppDrawer id="drawer" :open="open" />
  </header>
</template>

<style scoped>
.nav {
  --_bg: var(--tm-sys-elevation-5-bg);
  --_line: var(--tm-sys-elevation-5-line);
  position: sticky; top: 0; z-index: 60;
  background: var(--_bg);
  backdrop-filter: var(--tm-sys-elevation-5-filter);
  -webkit-backdrop-filter: var(--tm-sys-elevation-5-filter);
  border-bottom: 1px solid var(--_line);
}
.nav__in {
  max-width: var(--tm-sys-layout-maxw); margin: 0 auto;
  padding: var(--tm-sys-space-3) var(--tm-sys-space-5);
  display: flex; align-items: center; gap: var(--tm-sys-space-5);
}
@media (min-width: 900px) { .nav__in { padding: var(--tm-sys-space-3) var(--tm-sys-space-7); } }
.brand { display: flex; align-items: baseline; gap: 10px; text-decoration: none; flex: none; }
.brand__mark {
  font-family: var(--tm-sys-type-display-family);
  font-variation-settings: var(--tm-sys-type-brand-axes);
  font-size: 20px; letter-spacing: -.03em;
}
.brand__sub {
  font-family: var(--tm-sys-type-data-family); font-size: 9.5px; letter-spacing: .22em;
  text-transform: uppercase; color: var(--tm-sys-color-primary-hover);
}
.nav__links { display: none; gap: 2px; margin-left: auto; align-items: center; }
@media (min-width: 1000px) { .nav__links { display: flex; } }
.nav__link {
  --_layer: var(--tm-sys-color-on-surface);
  font-family: var(--tm-sys-type-data-family); font-size: 11.5px; letter-spacing: .11em; text-transform: uppercase;
  color: var(--tm-sys-color-on-surface-variant); text-decoration: none; padding: 9px 12px;
  border-radius: var(--tm-sys-shape-corner);
  transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.nav__link:hover {
  color: var(--tm-sys-color-on-surface);
  background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent);
}
.nav__link[aria-current="page"] { color: var(--tm-sys-color-primary-hover); }
.nav__cta { margin-left: var(--tm-sys-space-3); }
.nav__burger {
  --_layer: var(--tm-sys-color-on-surface);
  margin-left: auto; display: grid; place-items: center;
  width: 44px; height: 44px; margin-top: -3px; margin-bottom: -3px;
  background: none; border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner);
  padding: 0; cursor: pointer; color: var(--tm-sys-color-on-surface);
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.nav__burger.is-open { border-color: var(--tm-sys-color-primary-container); }
/* three hairlines; the outer two fold into a cross when the drawer is open */
.nav__bars { position: relative; width: 18px; height: 12px; display: block; }
.nav__bars i {
  position: absolute; left: 0; width: 18px; height: 1.5px; background: currentColor; border-radius: 1px;
  transition: transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-emphasized),
              opacity var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-standard);
}
.nav__bars i:nth-child(1) { top: 0; }
.nav__bars i:nth-child(2) { top: 50%; margin-top: -0.75px; }
.nav__bars i:nth-child(3) { bottom: 0; }
.is-open .nav__bars i:nth-child(1) { transform: translateY(5.25px) rotate(45deg); }
.is-open .nav__bars i:nth-child(2) { opacity: 0; transform: scaleX(.2); }
.is-open .nav__bars i:nth-child(3) { transform: translateY(-5.25px) rotate(-45deg); }
.nav__burger:hover { background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); }
.nav__burger:active { background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-pressed), transparent); }
@media (min-width: 1000px) { .nav__burger { display: none; } }
</style>
