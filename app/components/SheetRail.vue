<template>
  <div class="sheet-rail" aria-hidden="true" />
</template>

<style scoped>
/* contact-sheet rail: a hairline down the page edge */
.sheet-rail {
  position: absolute; inset: 0 auto 0 0; width: 1px;
  background: var(--tm-sys-color-outline-variant); display: none; pointer-events: none;
}
@media (min-width: 1100px) {
  .sheet-rail { display: block; left: calc(50% - var(--tm-sys-layout-maxw) / 2 + 22px); }
}
</style>
