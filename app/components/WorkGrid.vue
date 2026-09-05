<script setup lang="ts">
import type { Project } from '~/content/types'
/* `dense`: the portfolio page. Two-up from the smallest phone, four across
   on large screens, inside a bleed wrapper. */
withDefaults(defineProps<{ projects: Project[]; label?: string; level?: 'h2' | 'h3'; dense?: boolean }>(), { level: 'h3' })
</script>

<template>
  <div>
    <TransitionGroup name="wg" tag="div" class="workgrid" :class="{ 'workgrid--dense': dense }" role="list" :aria-label="label">
      <div v-for="p in projects" :key="p.id" role="listitem" class="workgrid__item">
        <WorkCard :project="p" :level="level" />
      </div>
    </TransitionGroup>
    <p v-if="!projects.length" class="mono workgrid__empty">Nothing in this category yet. Work under NDA is shown on request.</p>
  </div>
</template>

<style scoped>
.workgrid { display: grid; gap: var(--tm-sys-space-4); grid-template-columns: 1fr; position: relative; }
@media (min-width: 680px) { .workgrid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1040px) { .workgrid { grid-template-columns: repeat(3, 1fr); } }
.workgrid--dense { grid-template-columns: repeat(2, 1fr); gap: var(--tm-sys-space-3); }
@media (min-width: 680px) { .workgrid--dense { gap: var(--tm-sys-space-4); } }
@media (min-width: 1040px) { .workgrid--dense { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1440px) { .workgrid--dense { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 679px) { .workgrid--dense :deep(.h4) { font-size: 15px; } .workgrid--dense :deep(.work__meta) { display: none; } .workgrid--dense :deep(.plate__tag--dim) { display: none; } .workgrid--dense :deep(.work__cap) { flex-direction: column; align-items: flex-start; gap: 2px; } }
/* a filter applying: survivors slide to their new place, arrivals settle in,
   departures step out of the flow so nothing waits on them */
.wg-move, .wg-enter-active { transition: transform var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-emphasized), opacity var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-decelerate); }
.wg-enter-from { opacity: 0; transform: translateY(8px); }
.wg-leave-active { position: absolute; opacity: 0; transition: none; pointer-events: none; }
.workgrid__empty { padding: var(--tm-sys-space-6) 0; }
</style>
