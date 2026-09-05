<script setup lang="ts">
import type { Frame } from '~/content/types'

/* Full-screen viewer for a set of frames. Native <dialog> gives focus
   trapping and Escape for free; arrows and swipe move between frames; the
   counter tells the visitor how many are left. */
const props = defineProps<{ frames: Frame[]; index: number; open: boolean; pa: string; pb: string; project: string }>()
const emit = defineEmits<{ 'update:index': [i: number]; 'update:open': [v: boolean] }>()

const dlg = ref<HTMLDialogElement | null>(null)
const current = computed(() => props.frames[props.index])
const count = computed(() => props.frames.length)

function close() { emit('update:open', false) }
function step(d: number) { emit('update:index', (props.index + d + count.value) % count.value) }
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
}
let x0 = 0
function down(e: PointerEvent) { x0 = e.clientX }
function up(e: PointerEvent) { const dx = e.clientX - x0; if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1) }

watch(() => props.open, (v) => {
  const d = dlg.value
  if (!d) return
  if (v && !d.open) { d.showModal(); document.documentElement.style.overflow = 'hidden' }
  if (!v && d.open) { d.close(); document.documentElement.style.overflow = '' }
})
onBeforeUnmount(() => { document.documentElement.style.overflow = '' })
</script>

<template>
  <dialog ref="dlg" class="lb" aria-label="Frames from the shoot" @close="close" @keydown="onKey" @click.self="close">
    <div class="lb__bar">
      <span class="mono lb__count" aria-live="polite">{{ index + 1 }} of {{ count }}</span>
      <span class="mono lb__title">{{ project }}<template v-if="current"> · {{ current.tag }}</template></span>
      <button class="lb__btn" type="button" aria-label="Close" @click="close">×</button>
    </div>
    <div class="lb__stage" @pointerdown="down" @pointerup="up">
      <button class="lb__btn lb__nav lb__nav--prev" type="button" aria-label="Previous frame" @click="step(-1)">‹</button>
      <Transition name="lbf" mode="out-in">
        <div v-if="current" :key="index" class="lb__frame" :class="`lb__frame--${current.ratio}`">
          <PlateFrame :ratio="current.ratio" :pa="current.pa || pa" :pb="current.pb || pb" :src="current.image" :alt="current.alt" :tag="current.tag" :sub="`Frame ${index + 1} · ${current.ratio.replace('-', ':')}`" loading="eager" sizes="90vw" />
        </div>
      </Transition>
      <button class="lb__btn lb__nav lb__nav--next" type="button" aria-label="Next frame" @click="step(1)">›</button>
    </div>
  </dialog>
</template>

<style scoped>
.lb { border: 0; padding: 0; margin: 0; width: 100vw; height: 100dvh; max-width: none; max-height: none; background: rgba(11, 15, 13, .96); color: var(--tm-sys-color-on-surface); display: none; }
.lb[open] { display: grid; grid-template-rows: auto 1fr; }
.lb::backdrop { background: transparent; }
.lb__bar { display: grid; grid-template-columns: auto 1fr auto; gap: var(--tm-sys-space-4); align-items: center; padding: var(--tm-sys-space-3) var(--tm-sys-space-5); border-bottom: 1px solid var(--tm-sys-color-outline-variant); }
.lb__title { text-align: center; color: var(--tm-sys-color-on-surface-variant); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lb__count { color: var(--tm-sys-color-primary-hover); }
.lb__btn { --_layer: var(--tm-sys-color-on-surface); width: 44px; height: 44px; display: grid; place-items: center; background: none; border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); color: var(--tm-sys-color-on-surface); font-size: 22px; line-height: 1; cursor: pointer; transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.lb__btn:hover { background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); border-color: var(--tm-sys-color-primary); }
.lb__stage { position: relative; display: grid; place-items: center; padding: var(--tm-sys-space-5); min-height: 0; touch-action: pan-y; }
.lb__frame { width: min(92vw, calc((100dvh - 140px) * var(--_ar, 1.5))); max-width: 1600px; }
.lb__frame--3-2 { --_ar: 1.5; } .lb__frame--2-3 { --_ar: .6667; } .lb__frame--16-9 { --_ar: 1.7778; } .lb__frame--21-9 { --_ar: 2.3333; } .lb__frame--1-1 { --_ar: 1; } .lb__frame--4-5 { --_ar: .8; }
.lb__nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; }
.lb__nav--prev { left: var(--tm-sys-space-4); } .lb__nav--next { right: var(--tm-sys-space-4); }
@media (max-width: 720px) { .lb__nav { top: auto; bottom: calc(var(--tm-sys-space-4) + env(safe-area-inset-bottom)); transform: none; } }
.lbf-enter-active, .lbf-leave-active { transition: opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.lbf-enter-from { opacity: 0; transform: scale(.985); } .lbf-leave-to { opacity: 0; }
</style>
