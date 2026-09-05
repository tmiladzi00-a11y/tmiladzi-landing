<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: notFound.value ? 'Frame not found' : 'Something went wrong', robots: 'noindex' })
function home() { clearError({ redirect: '/' }) }
</script>

<template>
  <NuxtLayout>
    <PageBand tight>
      <Eyebrow copper>{{ error.statusCode }}</Eyebrow>
      <h1 class="display h1 err__h1">{{ notFound ? 'That frame is not on the sheet.' : 'Something went wrong on our side.' }}</h1>
      <p class="lede mt-5">
        <template v-if="notFound">The page you asked for has moved, been renamed, or never existed. The work, the films and the booking calendar are all one step away.</template>
        <template v-else>The page failed to render. Try again in a moment; if it keeps happening, message us on WhatsApp and we will sort it.</template>
      </p>
      <div class="row">
        <BaseButton variant="primary" type="button" arrow @click="home">Back to the start</BaseButton>
        <BaseButton to="/work">See the work</BaseButton>
        <BaseButton to="/contact">Contact</BaseButton>
      </div>
      <PlateFrame class="mt-7 err__plate" ratio="21-9" pa="#3A2A1E" pb="#1F6B4E" tag="Missing frame" :title="String(error.statusCode)" :sub="notFound ? 'No frame at this address' : 'Render failed'" sizes="(min-width: 1440px) 1344px, 100vw" />
    </PageBand>
  </NuxtLayout>
</template>

<style scoped>
.err__h1 { max-width: 16ch; }
.err__plate { max-width: 100%; }
</style>
