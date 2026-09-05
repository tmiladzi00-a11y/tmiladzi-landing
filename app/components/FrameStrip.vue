<script setup lang="ts">
import type { Project } from '~/content/types'
/* A contact strip: larger frames in a horizontal row the reader scrolls or
   pages through. Scroll-snap does the work; the parent renders a StripNav
   beside its section-head action and calls page() through a template ref. */
defineProps<{ projects: Project[] }>()
const strip = ref<HTMLElement | null>(null)
function page(dir: number) {
  const el = strip.value; if (!el) return
  el.scrollBy({ left: dir * Math.round(el.clientWidth * .8), behavior: 'smooth' })
}
defineExpose({ page })
</script>

<template>
  <div>
    <div ref="strip" class="strip" role="list" aria-label="Recent frames" tabindex="0">
      <NuxtLink v-for="p in projects" :key="p.id" class="strip__item" role="listitem" :to="`/work/${p.id}`">
        <PlateFrame ratio="3-2" :pa="p.pa" :pb="p.pb" :src="p.image" :alt="p.imageAlt" :tag="p.catLabel" :vt-name="`plate-${p.id}`" thumb lift sizes="(min-width: 900px) 520px, 78vw" />
        <div class="strip__cap"><h3 class="h4 h4--tight">{{ p.title }}</h3><span class="mono">{{ p.year }}</span></div>
        <div class="mono strip__meta">{{ p.kind }} · {{ p.place }}</div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.strip {
  display: flex; gap: var(--tm-sys-space-4); overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-left: var(--tm-sys-space-5);
  padding: 0 var(--tm-sys-space-5) var(--tm-sys-space-3); margin: 0 calc(-1 * var(--tm-sys-space-5));
  scrollbar-width: thin; scrollbar-color: var(--tm-sys-color-outline) transparent;
  -webkit-overflow-scrolling: touch;
}
@media (min-width: 900px) { .strip { padding-left: var(--tm-sys-space-7); padding-right: var(--tm-sys-space-7); margin: 0 calc(-1 * var(--tm-sys-space-7)); scroll-padding-left: var(--tm-sys-space-7); } }
.strip__item { flex: 0 0 78vw; max-width: 520px; scroll-snap-align: start; text-decoration: none; display: block; }
@media (min-width: 900px) { .strip__item { flex-basis: 520px; } }
.strip__cap { display: flex; justify-content: space-between; gap: var(--tm-sys-space-3); margin-top: var(--tm-sys-space-3); align-items: baseline; }
.strip__meta { margin-top: 2px; }
.strip__item:hover .h4 { color: var(--tm-sys-color-primary-hover); }
</style>
