<script setup lang="ts">
import type { ProcessStep } from '~/content/types'
/* The process drawn as a pipeline. Wide screens: a track of numbered nodes
   joined by a progress line and grouped into phases; pick a node (click,
   arrow keys, or the prev/next buttons) and the step reads out beneath it.
   A toggle, phones and print all use the vertical timeline instead, with
   every step expanded, so nothing depends on interaction. */
export interface Phase { label: string; from: number; to: number }
const props = withDefaults(defineProps<{ steps: ProcessStep[]; phases?: Phase[] }>(), { phases: () => [] })

const active = ref(0)
const showAll = ref(false)
const uid = useId()
const n = computed(() => props.steps.length)
const step = computed(() => props.steps[active.value]!)
const pad = (i: number) => String(i + 1).padStart(2, '0')
const phaseOf = (i: number) => props.phases.find((p) => i + 1 >= p.from && i + 1 <= p.to)?.label
const go = (i: number) => { active.value = (i + n.value) % n.value }

function onKey(e: KeyboardEvent) {
  const map: Record<string, number> = { ArrowRight: active.value + 1, ArrowLeft: active.value - 1, Home: 0, End: n.value - 1 }
  if (!(e.key in map)) return
  e.preventDefault(); go(map[e.key]!)
  nextTick(() => (document.getElementById(`${uid}-tab-${active.value}`) as HTMLElement | null)?.focus())
}
</script>

<template>
  <div class="pl" :class="{ 'pl--all': showAll }">
    <div class="pl__bar">
      <p class="mono pl__count" aria-live="polite">Step {{ active + 1 }} of {{ n }}</p>
      <button type="button" class="pl__toggle" :aria-pressed="showAll" @click="showAll = !showAll">
        {{ showAll ? 'Step by step' : 'Show all steps' }}
      </button>
    </div>

    <!-- interactive track: wide screens, step-by-step mode -->
    <div class="pl__stage">
      <div class="pl__track" role="tablist" aria-label="Pipeline steps" @keydown="onKey">
        <template v-if="phases.length">
          <span v-for="p in phases" :key="p.label" class="mono pl__phase" :style="{ gridColumn: `${p.from} / ${p.to + 1}` }">{{ p.label }}</span>
        </template>
        <div class="pl__line" aria-hidden="true"><div class="pl__fill" :style="{ width: `${(active / (n - 1)) * 100}%` }" /></div>
        <button
          v-for="(s, i) in steps" :key="s[0]"
          :id="`${uid}-tab-${i}`" type="button" role="tab" class="pl__node"
          :class="{ 'is-active': i === active, 'is-done': i < active }"
          :aria-selected="i === active" :aria-controls="`${uid}-panel`" :tabindex="i === active ? 0 : -1"
          @click="go(i)"
        >
          <span class="pl__dot"><span class="mono">{{ pad(i) }}</span></span>
          <span class="pl__label">{{ s[0] }}</span>
        </button>
      </div>

      <div :id="`${uid}-panel`" role="tabpanel" :aria-labelledby="`${uid}-tab-${active}`" class="pl__panel">
        <Transition name="pl-swap" mode="out-in">
          <div :key="active" class="pl__detail">
            <div class="pl__meta mono">
              <span class="pl__num">{{ pad(active) }}</span>
              <span v-if="phaseOf(active)" class="pl__metaphase">{{ phaseOf(active) }}</span>
            </div>
            <h3 class="display h3 pl__title">{{ step[0] }}</h3>
            <p class="pl__text">{{ step[1] }}</p>
          </div>
        </Transition>
        <div class="pl__nav">
          <button type="button" class="pl__btn" :disabled="active === 0" @click="go(active - 1)">← Previous</button>
          <button type="button" class="pl__btn" :disabled="active === n - 1" @click="go(active + 1)">Next: {{ steps[active + 1]?.[0] ?? 'Done' }} →</button>
        </div>
      </div>
    </div>

    <!-- full timeline: phones, print, and the "show all" mode -->
    <ol class="pl__list">
      <template v-for="(s, i) in steps" :key="s[0]">
        <li v-if="phaseOf(i) && (i === 0 || phaseOf(i - 1) !== phaseOf(i))" class="mono pl__listphase" aria-hidden="true">{{ phaseOf(i) }}</li>
        <li class="pl__item">
          <span class="pl__dot pl__dot--static" aria-hidden="true"><span class="mono">{{ pad(i) }}</span></span>
          <div>
            <h3 class="h4">{{ s[0] }}</h3>
            <p>{{ s[1] }}</p>
          </div>
        </li>
      </template>
    </ol>
  </div>
</template>

<style scoped>
.pl { --_n: v-bind(n); }
.pl__bar { display: flex; justify-content: space-between; align-items: center; gap: var(--tm-sys-space-4); margin-bottom: var(--tm-sys-space-5); }
.pl__count { margin: 0; color: var(--tm-sys-color-on-surface-faint); }
.pl__toggle, .pl__btn {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .11em; text-transform: uppercase;
  padding: 8px 14px; min-height: 38px; border: 1px solid var(--tm-sys-color-outline); background: none; color: var(--tm-sys-color-on-surface-variant);
  border-radius: var(--tm-sys-shape-corner); cursor: pointer;
  transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.pl__toggle:hover, .pl__btn:hover:not(:disabled) { color: var(--tm-sys-color-on-surface); border-color: var(--tm-sys-color-primary-container); }
.pl__btn:disabled { opacity: .35; cursor: default; }

/* the track */
.pl__stage { display: none; }
.pl__track {
  position: relative; display: grid; grid-template-columns: repeat(var(--_n), minmax(0, 1fr)); grid-template-rows: auto auto;
  column-gap: 6px; padding-bottom: var(--tm-sys-space-3);
}
.pl__phase {
  grid-row: 1; align-self: end; padding: 0 0 14px 4px; font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase;
  color: var(--tm-sys-color-on-surface-faint); border-left: 1px solid var(--tm-sys-color-outline-variant); margin-bottom: 10px;
}
.pl__line { grid-row: 2; grid-column: 1 / -1; position: absolute; left: calc(100% / var(--_n) / 2); right: calc(100% / var(--_n) / 2); top: 17px; height: 1px; background: var(--tm-sys-color-outline); }
.pl__fill { height: 100%; background: var(--tm-sys-color-primary); transition: width var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-emphasized); }
.pl__node {
  grid-row: 2; position: relative; display: grid; justify-items: center; gap: 10px; padding: 0; background: none; border: 0; cursor: pointer;
  color: var(--tm-sys-color-on-surface-faint); font: inherit; min-width: 0; border-radius: var(--tm-sys-shape-corner);
}
.pl__node:focus-visible { outline: 2px solid var(--tm-sys-color-primary-hover); outline-offset: 4px; }
.pl__dot {
  width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--tm-sys-color-outline); background: var(--tm-sys-elevation-1-bg);
  display: grid; place-items: center; font-size: 11px; letter-spacing: .06em; color: var(--tm-sys-color-on-surface-variant);
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
/* the number inherits the dot's colour: the global .mono colour must not win on a green fill */
.pl__dot > span { color: inherit; font-weight: 500; }
.pl__node:hover .pl__dot { border-color: var(--tm-sys-color-primary-container); color: var(--tm-sys-color-on-surface); }
.pl__node.is-done .pl__dot { border-color: var(--tm-sys-color-primary-container); background: var(--tm-sys-color-primary-container); color: var(--tm-sys-color-on-surface); }
.pl__node.is-active .pl__dot { border-color: var(--tm-sys-color-primary-hover); background: var(--tm-sys-color-primary-hover); color: var(--tm-sys-color-on-primary); transform: scale(1.12); box-shadow: 0 0 0 4px var(--tm-sys-color-primary-tint); }
.pl__node.is-active .pl__dot > span { font-weight: 600; }
.pl__label { font-size: 12px; line-height: 1.3; text-align: center; max-width: 11ch; color: inherit; transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.pl__node.is-active .pl__label, .pl__node:hover .pl__label { color: var(--tm-sys-color-on-surface); }

/* the read-out */
.pl__panel {
  margin-top: var(--tm-sys-space-5); border: 1px solid var(--tm-sys-elevation-2-line); border-radius: var(--tm-sys-shape-corner);
  background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-6); display: grid; gap: var(--tm-sys-space-5);
}
.pl__detail { min-height: 8.5rem; }
.pl__meta { display: flex; gap: var(--tm-sys-space-3); align-items: baseline; color: var(--tm-sys-color-on-surface-faint); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .14em; text-transform: uppercase; }
.pl__num { color: var(--tm-sys-color-primary-hover); font-size: 13px; }
.pl__title { margin: var(--tm-sys-space-3) 0 0; }
.pl__text { margin: var(--tm-sys-space-3) 0 0; font-size: 16.5px; line-height: 1.6; max-width: 62ch; color: var(--tm-sys-color-on-surface-variant); }
.pl__nav { display: flex; justify-content: space-between; gap: var(--tm-sys-space-3); flex-wrap: wrap; }
.pl-swap-enter-active, .pl-swap-leave-active { transition: opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.pl-swap-enter-from { opacity: 0; transform: translateY(6px); }
.pl-swap-leave-to { opacity: 0; transform: translateY(-4px); }

/* the timeline: each item draws its own rail segment so the list can flow
   into two columns on wide screens without the rail breaking */
.pl__list { list-style: none; padding: 0; margin: 0; }
.pl__listphase { position: relative; padding: var(--tm-sys-space-4) 0 var(--tm-sys-space-2) 52px; font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.pl__listphase::before, .pl__item::before { content: ""; position: absolute; left: 17px; top: 0; bottom: 0; width: 1px; background: var(--tm-sys-color-outline-variant); }
.pl__listphase:first-child::before { top: 50%; }
.pl__item { position: relative; display: grid; grid-template-columns: 34px 1fr; gap: var(--tm-sys-space-4); padding: var(--tm-sys-space-3) 0 var(--tm-sys-space-4); }
.pl__item::before { top: 17px; }
.pl__item:last-child::before { display: none; }
.pl__dot--static { position: relative; z-index: 1; }
.pl__item h3 { margin: 6px 0 0; }
.pl__item p { margin: 6px 0 0; font-size: 15.5px; color: var(--tm-sys-color-on-surface-variant); line-height: 1.6; max-width: 60ch; }
@media (min-width: 900px) {
  .pl--all .pl__list { columns: 2; column-gap: var(--tm-sys-space-8); }
  .pl--all .pl__item, .pl--all .pl__listphase { break-inside: avoid; }
}

/* wide screens choose; phones and print always get the timeline */
@media (min-width: 900px) {
  .pl:not(.pl--all) .pl__stage { display: block; }
  .pl:not(.pl--all) .pl__list { display: none; }
  .pl--all .pl__count { visibility: hidden; }
}
@media (max-width: 899px) { .pl__bar { display: none; } }
@media print { .pl__bar, .pl__stage { display: none !important; } .pl__list { display: block !important; } }
@media (prefers-reduced-motion: reduce) { .pl__fill, .pl__dot, .pl-swap-enter-active, .pl-swap-leave-active { transition: none; } }
</style>
