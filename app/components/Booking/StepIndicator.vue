<script setup lang="ts">
defineProps<{ steps: string[]; current: number }>()
</script>

<template>
  <ol class="steps" aria-label="Booking steps">
    <li v-for="(s, i) in steps" :key="s" class="step" :class="{ done: i + 1 < current, now: i + 1 === current }" :aria-current="i + 1 === current ? 'step' : undefined">
      <span class="step__n" aria-hidden="true">{{ i + 1 }}</span>{{ s }}
    </li>
  </ol>
</template>

<style scoped>
.steps { display: flex; gap: var(--tm-sys-space-2); flex-wrap: wrap; margin: 0 0 var(--tm-sys-space-7); padding: 0 0 var(--tm-sys-space-4); list-style: none; border-bottom: 1px solid var(--tm-sys-color-outline-variant); }
/* From tablet up the steps share the row equally, with a hairline track
   running between them so the row reads as progress, not a left-bunched list. */
@media (min-width: 700px) {
  .steps { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: var(--tm-sys-space-4); }
  .step { margin-right: 0; }
}
@media (min-width: 900px) {
  .step:not(:last-child)::after { content: ""; flex: 1; height: 1px; margin-left: var(--tm-sys-space-3); background: var(--tm-sys-color-outline-variant); }
  .step.done:not(:last-child)::after { background: var(--tm-sys-color-primary-container); }
}
.step {
  display: flex; align-items: center; gap: 9px; padding: 6px 0; margin-right: var(--tm-sys-space-5); min-width: 0; white-space: nowrap;
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .11em; text-transform: uppercase;
  color: var(--tm-sys-color-on-surface-faint);
  transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.step__n {
  width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--tm-sys-color-outline);
  display: grid; place-items: center; font-size: var(--tm-sys-type-data-size-xs); flex: none;
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.step.done { color: var(--tm-sys-color-on-surface-variant); }
.step.done .step__n { border-color: var(--tm-sys-color-primary-container); background: var(--tm-sys-color-primary-container); color: var(--tm-sys-color-on-surface); }
.step.now { color: var(--tm-sys-color-secondary-hover); }
.step.now .step__n { border-color: var(--tm-sys-color-secondary); color: var(--tm-sys-color-secondary-hover); }
</style>
