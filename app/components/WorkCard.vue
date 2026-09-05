<script setup lang="ts">
import type { Project } from '~/content/types'
withDefaults(defineProps<{ project: Project; level?: 'h2' | 'h3' }>(), { level: 'h3' })
</script>

<template>
  <NuxtLink class="work" :to="`/work/${project.id}`" :data-cat="project.cat">
    <PlateFrame ratio="3-2" :pa="project.pa" :pb="project.pb" :src="project.image" :alt="project.imageAlt" :tag="project.catLabel" :vt-name="`plate-${project.id}`" thumb lift />
    <div class="work__cap">
      <component :is="level" class="h4 h4--tight">{{ project.title }}</component>
      <span class="mono">{{ project.year }}</span>
    </div>
    <div class="mono work__meta">{{ project.kind }} · {{ project.place }}</div>
  </NuxtLink>
</template>

<style scoped>
.work { position: relative; text-decoration: none; display: block; }
.work__cap { display: flex; justify-content: space-between; gap: var(--tm-sys-space-3); margin-top: var(--tm-sys-space-3); align-items: baseline; }
.work__cap .mono { flex: none; }
.work__meta { margin-top: 2px; }
.work:hover .h4 { color: var(--tm-sys-color-primary-hover); }
.h4 { transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
</style>
