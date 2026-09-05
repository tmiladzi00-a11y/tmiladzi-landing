<script setup lang="ts">
import type { PlateRatio } from '~/content/types'

/* A labelled slot on a contact sheet. With `src` it is a photograph
   with the frame's metadata over it; without, it is a duotone ground
   with grain, a hairline hatch and registration marks, so an empty slot
   reads as a deliberate frame rather than an image that failed to load. */
const props = withDefaults(defineProps<{
  ratio?: PlateRatio
  /** Duotone ground: top-left and bottom-right. */
  pa?: string
  pb?: string
  src?: string
  alt?: string
  tag?: string
  title?: string
  sub?: string
  /** Thumbnail mode: caption lives outside the plate, so only the tag renders. */
  thumb?: boolean
  /** Lift on hover: for plates inside a link. */
  lift?: boolean
  sizes?: string
  loading?: 'lazy' | 'eager'
  /** Shared-element name so the plate morphs between routes. */
  vtName?: string
}>(), { ratio: '3-2', pa: '#1E5F47', pb: '#3A2417', loading: 'lazy', sizes: '(min-width: 1040px) 400px, (min-width: 680px) 50vw, 100vw' })

const style = computed(() => ({ '--pa': props.pa, '--pb': props.pb, viewTransitionName: props.vtName }))
</script>

<template>
  <figure class="plate" :class="[`ar-${ratio}`, { 'plate--img': src, 'plate--lift': lift }]" :style="style">
    <NuxtImg
      v-if="src"
      class="plate__img"
      :src="src"
      :alt="alt || ''"
      :sizes="sizes"
      :loading="loading"
      format="webp"
    />
    <span class="reg reg--tl" aria-hidden="true" /><span class="reg reg--br" aria-hidden="true" />
    <figcaption class="plate__meta">
      <span v-if="tag" class="plate__tag">{{ tag }}</span>
      <span v-if="thumb && !src" class="plate__tag plate__tag--dim">Image slot · {{ ratio.replace('-', ':') }}</span>
      <div v-else-if="!thumb && (title || sub)">
        <div v-if="title" class="plate__title">{{ title }}</div>
        <div v-if="sub" class="plate__sub">{{ sub }}</div>
      </div>
      <slot />
    </figcaption>
  </figure>
</template>

<style scoped>
.plate {
  --_bg: var(--tm-sys-elevation-2-bg);
  --_line: var(--tm-sys-elevation-2-line);
  --_reg: var(--tm-sys-color-primary-hover);
  --_meta: rgba(233, 239, 234, .78);
  --_meta-dim: rgba(233, 239, 234, .55);
  position: relative; overflow: hidden; margin: 0;
  background: var(--_bg); border: 1px solid var(--_line);
  box-shadow: inset 0 0 0 1px rgba(233, 239, 234, .05);
  isolation: isolate;
  transition: transform var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-emphasized);
}
.plate::before {
  content: ""; position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(95% 75% at 20% 14%, var(--pa) 0%, transparent 66%),
    radial-gradient(90% 85% at 84% 88%, var(--pb) 0%, transparent 68%),
    linear-gradient(155deg, #0C1310 0%, #1A2522 100%);
}
/* grain + a fine diagonal hatch */
.plate::after {
  content: ""; position: absolute; inset: 0; z-index: 1;
  opacity: .55; mix-blend-mode: overlay; pointer-events: none;
  background-image:
    repeating-linear-gradient(135deg, rgba(255, 255, 255, .055) 0 1px, transparent 1px 9px),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='.42'/></svg>");
}
/* a real photograph replaces the ground; the hatch goes, the grain stays faint */
.plate--img::before { display: none; }
.plate--img::after {
  opacity: .22;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='.42'/></svg>");
}
.plate__img { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; }
.plate--img .plate__meta {
  background: linear-gradient(to top, rgba(11, 15, 13, .78) 0%, rgba(11, 15, 13, .1) 45%, transparent 100%);
}
.plate--lift:hover, :is(a, button):hover > .plate--lift { transform: translateY(-3px); }
/* a frame picked out on the light table: marks and slug come up to full */
.plate--lift:hover .reg, :is(a, button):hover > .plate--lift .reg { opacity: 1; }
.plate--lift:hover .plate__tag, :is(a, button):hover > .plate--lift .plate__tag { color: var(--tm-sys-color-on-surface); }
.plate--lift:hover .plate__tag--dim, :is(a, button):hover > .plate--lift .plate__tag--dim { color: var(--_meta); }

.ar-3-2 { aspect-ratio: 3 / 2; }
.ar-2-3 { aspect-ratio: 2 / 3; }
.ar-16-9 { aspect-ratio: 16 / 9; }
.ar-1-1 { aspect-ratio: 1 / 1; }
.ar-4-5 { aspect-ratio: 4 / 5; }
.ar-21-9 { aspect-ratio: 21 / 9; }

.plate__meta {
  position: absolute; inset: 0; z-index: 2;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: var(--tm-sys-space-4); margin: 0;
}
.plate__tag {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs);
  letter-spacing: .16em; text-transform: uppercase; color: var(--_meta);
  transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.plate__tag--dim { color: var(--_meta-dim); }
.plate__title {
  font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-plate-axes);
  font-size: var(--tm-sys-type-plate-title-size); line-height: 1.05; letter-spacing: -.015em;
}
.plate__sub {
  font-family: var(--tm-sys-type-data-family); font-size: 10.5px; color: var(--_meta);
  letter-spacing: .08em; margin-top: 6px;
}
/* corner registration marks: the crop marks on a printed sheet */
.reg { position: absolute; z-index: 3; width: 12px; height: 12px; border: 0; opacity: .5; transition: opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.reg--tl { top: 8px; left: 8px; border-top: 1px solid var(--_reg); border-left: 1px solid var(--_reg); }
.reg--br { bottom: 8px; right: 8px; border-bottom: 1px solid var(--_reg); border-right: 1px solid var(--_reg); }
</style>
