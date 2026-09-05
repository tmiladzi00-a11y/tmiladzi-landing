<script setup lang="ts">
import { PROJECTS, WORK_CATEGORIES, type ProjectFilter } from '~/content/projects'

useSeoMeta({ title: 'Work', description: 'Photography, film and documentary projects for mining, agribusiness, development, banking and private clients across Zambia.' })

const route = useRoute()
const router = useRouter()
const valid = new Set<string>(WORK_CATEGORIES.map((c) => c[0]))
const filter = computed<ProjectFilter>({
  get: () => (valid.has(String(route.query.cat)) ? (route.query.cat as ProjectFilter) : 'all'),
  set: (v) => router.replace({ query: v === 'all' ? {} : { cat: v } }),
})
const shown = computed(() => (filter.value === 'all' ? PROJECTS : PROJECTS.filter((p) => p.cat === filter.value)))
</script>

<template>
  <div>
    <PageBand tight>
      <Eyebrow>Portfolio</Eyebrow>
      <h1 class="display h1 work__h1">Work</h1>
      <p class="lede mt-5">
        Projects are grouped by the kind of problem they solved, not by the medium.
        Most carry both stills and film — that is usually the point.
      </p>
    </PageBand>
    <PageBand tight flush>
      <FilterBar v-model="filter" :options="WORK_CATEGORIES" label="Filter projects" />
      <p class="sr-only" aria-live="polite">{{ shown.length }} projects shown</p>
      <WorkGrid :projects="shown" label="Projects" level="h2" />
      <p class="note mt-6">Some client work is covered by non-disclosure agreements and is shown on request only.</p>
    </PageBand>
  </div>
</template>

<style scoped>
.work__h1 { max-width: 14ch; }
</style>
