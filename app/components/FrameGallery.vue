<script setup lang="ts">
import type { Frame } from '~/content/types'
/* Frames from a shoot at their own ratios, packed in columns, each opening
   the lightbox at its index. */
defineProps<{ frames: Frame[]; pa: string; pb: string }>()
const emit = defineEmits<{ open: [i: number] }>()
</script>

<template>
  <div class="gal">
    <button v-for="(f, i) in frames" :key="i" type="button" class="gal__item" :aria-label="`${f.tag}, frame ${i + 1} of ${frames.length}, open full screen`" @click="emit('open', i)">
      <PlateFrame :ratio="f.ratio" :pa="f.pa || pa" :pb="f.pb || pb" :src="f.image" :alt="f.alt" :tag="f.tag" lift sizes="(min-width: 1000px) 33vw, (min-width: 600px) 50vw, 100vw">
        <span class="mono gal__n">{{ String(i + 1).padStart(2, '0') }} · {{ f.ratio.replace('-', ':') }}</span>
      </PlateFrame>
    </button>
  </div>
</template>

<style scoped>
.gal { column-count: 1; column-gap: var(--tm-sys-space-4); }
@media (min-width: 600px) { .gal { column-count: 2; } }
@media (min-width: 1000px) { .gal { column-count: 3; } }
.gal__item { display: block; width: 100%; break-inside: avoid; margin: 0 0 var(--tm-sys-space-4); padding: 0; border: 0; background: none; cursor: zoom-in; text-align: left; color: inherit; }
.gal__n { color: rgba(233, 239, 234, .62); }
</style>
