<script setup lang="ts">
import { findProject, neighbours } from '~/content/projects'
import { clientName } from '~/utils/clientName'

const route = useRoute()
const project = findProject(String(route.params.slug))
if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })

useSeoMeta({ title: project.title, description: project.summary, ogTitle: `${project.title} — Tmiladzi Media`, ogDescription: project.summary })

const { prev, next } = neighbours(project.id)
const frames = computed(() => project.frames ?? [])
const lbOpen = ref(false)
const lbIndex = ref(0)
function openFrame(i: number) { lbIndex.value = i; lbOpen.value = true }
</script>

<template>
  <div v-if="project">
    <!-- the frame first: title and lede sit above it, compact -->
    <PageBand tight>
      <NuxtLink class="mono back" to="/work">← Back to work</NuxtLink>
      <div class="case__head">
        <div>
          <Eyebrow class="mt-5">{{ project.catLabel }}</Eyebrow>
          <h1 class="display h1 case__h1">{{ project.title }}</h1>
        </div>
        <p class="lede case__lede">{{ project.summary }}</p>
      </div>
    </PageBand>

    <div class="bleed">
      <PlateFrame ratio="21-9" :pa="project.pa" :pb="project.pb" :src="project.image" :alt="project.imageAlt" :tag="project.catLabel" :title="project.title" :sub="`${clientName(project)} · ${project.year}`" loading="eager" sizes="(min-width: 1760px) 1660px, 100vw" :vt-name="`plate-${project.id}`" />
    </div>

    <PageBand tight>
      <div class="split">
        <div>
          <p v-for="(b, i) in project.body" :key="i" class="lede">{{ b }}</p>
          <div class="row"><BaseButton variant="primary" to="/brief" arrow>Brief a similar project</BaseButton></div>
        </div>
        <dl class="case__facts">
          <ContactRow term="Client">{{ clientName(project) }}</ContactRow>
          <ContactRow term="Scope">{{ project.kind }}</ContactRow>
          <ContactRow term="Location">{{ project.place }}</ContactRow>
          <ContactRow term="Year"><span class="num">{{ project.year }}</span></ContactRow>
          <ContactRow v-for="[k, v] in project.stats" :key="k" :term="k">{{ v }}</ContactRow>
        </dl>
      </div>
    </PageBand>

    <PageBand v-if="frames.length" dark labelledby="frames-h">
      <SectionHead id="frames-h" eyebrow="Frames from the shoot" :title="`${frames.length} frames`" wide>
        <template #aside><span class="mono">Open any frame · arrows to move · Esc to close</span></template>
      </SectionHead>
      <div class="bleed">
        <FrameGallery :frames="frames" :pa="project.pa" :pb="project.pb" @open="openFrame" />
      </div>
      <ClientOnly>
        <Lightbox v-model:open="lbOpen" v-model:index="lbIndex" :frames="frames" :pa="project.pa" :pb="project.pb" :project="project.title" />
      </ClientOnly>
    </PageBand>

    <!-- no dead end: the neighbouring projects, large -->
    <PageBand tight labelledby="next-h">
      <h2 id="next-h" class="sr-only">Previous and next project</h2>
      <div class="neigh">
        <NuxtLink class="neigh__item" :to="`/work/${prev.id}`">
          <span class="mono neigh__k">← Previous project</span>
          <PlateFrame ratio="16-9" :pa="prev.pa" :pb="prev.pb" :src="prev.image" :alt="prev.imageAlt" :tag="prev.catLabel" thumb lift sizes="(min-width: 900px) 50vw, 100vw" />
          <span class="h4 h4--tight neigh__t">{{ prev.title }}</span>
          <span class="mono">{{ prev.kind }} · {{ prev.year }}</span>
        </NuxtLink>
        <NuxtLink class="neigh__item neigh__item--next" :to="`/work/${next.id}`">
          <span class="mono neigh__k">Next project →</span>
          <PlateFrame ratio="16-9" :pa="next.pa" :pb="next.pb" :src="next.image" :alt="next.imageAlt" :tag="next.catLabel" thumb lift sizes="(min-width: 900px) 50vw, 100vw" />
          <span class="h4 h4--tight neigh__t">{{ next.title }}</span>
          <span class="mono">{{ next.kind }} · {{ next.year }}</span>
        </NuxtLink>
      </div>
    </PageBand>
  </div>
</template>

<style scoped>
.back { text-decoration: none; }
.back:hover { color: var(--tm-sys-color-primary-hover); }
.case__head { display: grid; gap: var(--tm-sys-space-5); align-items: end; }
@media (min-width: 900px) { .case__head { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: var(--tm-sys-space-8); } }
.case__h1 { max-width: 13ch; }
.case__lede { margin: 0; }
.case__facts { margin: 0; }
.neigh { display: grid; gap: var(--tm-sys-space-5); grid-template-columns: 1fr; }
@media (min-width: 720px) { .neigh { grid-template-columns: 1fr 1fr; } }
.neigh__item { text-decoration: none; display: grid; gap: var(--tm-sys-space-3); }
.neigh__item--next { text-align: right; }
.neigh__item--next .neigh__k { justify-self: end; }
.neigh__k { color: var(--tm-sys-color-primary-hover); }
.neigh__t { display: block; transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.neigh__item:hover .neigh__t { color: var(--tm-sys-color-primary-hover); }
</style>
