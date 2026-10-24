<script setup lang="ts">
import type { Project, RecentFrame } from '~/content/types'
/* A contact strip: larger frames in a horizontal row the reader scrolls or
   pages through. Scroll-snap does the work; the parent renders a StripNav
   beside its section-head action and calls page() through a template ref.
   Frames are photographs only: there are no project pages to open. */
defineProps<{ frames: (Omit<RecentFrame, 'project'> & { project: Project })[] }>()
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
      <div v-for="f in frames" :key="f.src" class="strip__item" role="listitem">
        <PlateFrame ratio="3-2" :pa="f.project.pa" :pb="f.project.pb" :src="f.src" :alt="f.alt" :tag="f.project.catLabel" thumb sizes="sm:78vw md:78vw lg:520px" />
        <div class="strip__cap"><h3 class="h4 h4--tight">{{ f.project.title }}</h3><span class="mono">{{ f.project.year }}</span></div>
        <div class="mono strip__meta">{{ f.project.kind }} · {{ f.project.place }}</div>
      </div>
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
.strip__item { flex: 0 0 78vw; max-width: 520px; scroll-snap-align: start; }
@media (min-width: 900px) { .strip__item { flex-basis: 520px; } }
.strip__cap { display: flex; justify-content: space-between; gap: var(--tm-sys-space-3); margin-top: var(--tm-sys-space-3); align-items: baseline; }
.strip__meta { margin-top: 2px; }
</style>
