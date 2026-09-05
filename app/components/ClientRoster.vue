<script setup lang="ts">
import type { ClientGroup } from '~/content/types'
defineProps<{ groups: ClientGroup[] }>()
</script>

<template>
  <div class="clients">
    <div v-for="g in groups" :key="g.sector" class="clientgroup">
      <h3>{{ g.sector }}</h3>
      <ul>
        <li v-for="c in g.names" :key="c.name" :class="{ 'has-logo': c.logo }">
          <NuxtImg
            v-if="c.logo"
            class="clogo"
            :class="{ 'clogo--tone': c.mode === 'tone' }"
            :style="c.height ? { '--_h': c.height + 'px' } : undefined"
            :src="c.logo"
            :alt="c.name"
            :width="c.w"
            :height="c.h"
            :format="c.logo.endsWith('.svg') ? undefined : 'webp'"
            loading="lazy"
            decoding="async"
          />
          <span v-else class="cname">{{ c.name }}</span>
          <span v-if="c.years" class="cyear">{{ c.years }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.clients { display: grid; gap: var(--tm-sys-space-6) var(--tm-sys-space-5); grid-template-columns: repeat(2, 1fr); }
@media (min-width: 720px) { .clients { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1060px) { .clients { grid-template-columns: repeat(5, 1fr); } }
.clientgroup h3 {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em;
  text-transform: uppercase; color: var(--tm-sys-color-primary-hover); margin: 0 0 var(--tm-sys-space-4); font-weight: 400;
  padding-bottom: 9px; border-bottom: 1px solid var(--tm-sys-color-outline);
}
.clientgroup ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
.clientgroup li { line-height: 1.3; }
.cname {
  font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-client-axes);
  font-size: 14.5px; color: var(--tm-sys-color-on-surface-variant); letter-spacing: .01em;
  display: block; padding: 4px 0;
}
/* Marks sit as silhouettes in the text colour, so ten brands read as one
   roster on the dark ground, and come up to full white on hover. Colour
   would fail here: half of these wordmarks are black ink. The filter runs
   on the image, not the box, so the reserved size never changes. */
.clogo {
  --_h: 26px;
  display: block; height: var(--_h); width: auto; max-width: 100%;
  filter: brightness(0) invert(.86); opacity: .92;
  transition: filter var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
li:hover .clogo { filter: brightness(0) invert(1); opacity: 1; }
/* a dark figure on a coloured ground keeps its figure: greyscale, lifted,
   and the true colours on hover */
.clogo--tone { filter: grayscale(1) brightness(1.25) contrast(1.05); opacity: .9; }
li:hover .clogo--tone { filter: none; opacity: 1; }
.cyear {
  display: block; font-family: var(--tm-sys-type-data-family);
  font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .1em; color: var(--tm-sys-color-on-surface-faint); margin-top: 5px; font-weight: 400;
}
</style>
