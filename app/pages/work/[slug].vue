<script setup lang="ts">
import { PROJECTS, findProject } from '~/content/projects'
import { clientName } from '~/utils/clientName'

const route = useRoute()
const project = findProject(String(route.params.slug))
if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })

useSeoMeta({ title: project.title, description: project.summary, ogTitle: `${project.title} — Tmiladzi Media`, ogDescription: project.summary })

const others = PROJECTS.filter((p) => p.id !== project.id).slice(0, 3)
</script>

<template>
  <div v-if="project">
    <PageBand tight>
      <NuxtLink class="mono back" to="/work">← Back to work</NuxtLink>
      <div class="mt-5">
        <Eyebrow>{{ project.catLabel }}</Eyebrow>
        <h1 class="display h1 case__h1">{{ project.title }}</h1>
        <p class="lede mt-5">{{ project.summary }}</p>
        <div class="mt-7">
          <PlateFrame ratio="21-9" :pa="project.pa" :pb="project.pb" :src="project.image" :alt="project.imageAlt" :tag="project.catLabel" :title="project.title" :sub="`${clientName(project)} · ${project.year}`" loading="eager" sizes="(min-width: 1280px) 1184px, 100vw" :vt-name="`plate-${project.id}`" />
        </div>
        <div class="split mt-7">
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
        <hr class="hr">
        <Eyebrow tag="h2">More work</Eyebrow>
        <WorkGrid :projects="others" label="More projects" />
      </div>
    </PageBand>
  </div>
</template>

<style scoped>
.back { text-decoration: none; }
.back:hover { color: var(--tm-sys-color-primary-hover); }
.case__h1 { max-width: 13ch; }
.case__facts { margin: 0; }
</style>
