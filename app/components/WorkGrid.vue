<script setup lang="ts">
import type { Project } from '~/content/types'
withDefaults(defineProps<{ projects: Project[]; label?: string; level?: 'h2' | 'h3' }>(), { level: 'h3' })
</script>

<template>
  <div>
    <TransitionGroup name="wg" tag="div" class="workgrid" role="list" :aria-label="label">
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
/* a filter applying: survivors slide to their new place, arrivals settle in,
   departures step out of the flow so nothing waits on them */
.wg-move, .wg-enter-active { transition: transform var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-emphasized), opacity var(--tm-sys-motion-duration-medium-1) var(--tm-sys-motion-easing-decelerate); }
.wg-enter-from { opacity: 0; transform: translateY(8px); }
.wg-leave-active { position: absolute; opacity: 0; transition: none; pointer-events: none; }
.workgrid__empty { padding: var(--tm-sys-space-6) 0; }
</style>
