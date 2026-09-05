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
    <!-- the grid is the page: one compact bar of title, filters and a line of intro, then frames -->
    <PageBand tight>
      <div class="work__bar">
        <div>
          <Eyebrow>Portfolio</Eyebrow>
          <h1 class="display h1 work__h1">Work</h1>
        </div>
        <div class="work__side">
          <p class="muted work__note">Grouped by the kind of problem they solved, not by the medium. Most carry both stills and film — that is usually the point.</p>
          <FilterBar v-model="filter" :options="WORK_CATEGORIES" label="Filter projects" class="work__filters" />
        </div>
      </div>
      <p class="sr-only" aria-live="polite">{{ shown.length }} projects shown</p>
    </PageBand>
    <PageBand tight flush>
      <div class="bleed">
        <WorkGrid :projects="shown" label="Projects" level="h2" dense />
      </div>
      <p class="note mt-6">Some client work is covered by non-disclosure agreements and is shown on request only.</p>
    </PageBand>
  </div>
</template>

<style scoped>
.work__h1 { max-width: 14ch; }
.work__bar { display: grid; gap: var(--tm-sys-space-5); align-items: end; }
@media (min-width: 900px) { .work__bar { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: var(--tm-sys-space-8); } }
.work__side { display: grid; gap: var(--tm-sys-space-4); }
.work__note { font-size: 15.5px; margin: 0; max-width: 52ch; }
.work__filters { margin-bottom: 0; }
</style>
