<template>
  <a class="skip" href="#main">Skip to content</a>
  <AppHeader />
  <main id="main" class="main">
    <SheetRail />
    <slot />
  </main>
  <AppFooter />
</template>

<style scoped>
.main { position: relative; }
.skip {
  position: absolute; left: var(--tm-sys-space-4); top: -60px; z-index: 100;
  padding: 10px 14px; background: var(--tm-sys-color-primary); color: var(--tm-sys-color-on-primary);
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm);
  letter-spacing: .12em; text-transform: uppercase; text-decoration: none;
  border-radius: var(--tm-sys-shape-corner);
  transition: top var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-standard);
}
.skip:focus-visible { top: var(--tm-sys-space-4); }
</style>
