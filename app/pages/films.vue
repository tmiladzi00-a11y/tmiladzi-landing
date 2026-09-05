<script setup lang="ts">
import { FILMS } from '~/content/films'
import { SITE } from '~/content/site'
useSeoMeta({ title: 'Films', description: 'Documentary, corporate film and testimony. Shot 4K minimum, two-camera on interviews, cut for the room it will actually be played in.' })
</script>

<template>
  <div>
    <PageBand tight>
      <Eyebrow>Motion</Eyebrow>
      <h1 class="display h1 films__h1">Films</h1>
      <p class="lede mt-5">
        Documentary, corporate film and testimony. Shot 4K minimum, two-camera on
        interviews, cut for the room it will actually be played in.
      </p>
      <div class="row">
        <BaseButton variant="primary" to="/brief" arrow>Commission a film</BaseButton>
        <BaseButton to="/capabilities">Delivery specification</BaseButton>
      </div>
    </PageBand>

    <PageBand tight flush>
      <div class="bleed">
        <VideoEmbed :embed="SITE.showreel" ratio="21-9" pa="#1F6B4E" pb="#7A4420" tag="Showreel · 2026" title="Tmiladzi Media — Reel 2026" :sub="SITE.showreel ? '2:40 · 4K · Press play' : '2:40 · 4K · Reel publishing soon'" sizes="(min-width: 1760px) 1660px, 100vw" />
      </div>
    </PageBand>

    <PageBand dark labelledby="films-h">
      <SectionHead id="films-h" eyebrow="Recent films" title="In the cut" />
      <ul class="grid g2 films">
        <li v-for="f in FILMS" :key="f.title">
          <VideoEmbed :embed="f.embed" ratio="16-9" :pa="f.pa" :pb="f.pb" :tag="f.embed ? 'Film · press play' : f.note" :title="f.title" :sub="f.client" sizes="(min-width: 720px) 50vw, 100vw" />
          <div class="mono mt-3">{{ f.meta }}</div>
        </li>
      </ul>
    </PageBand>

    <PageBand labelledby="doc-h">
      <div class="split">
        <div>
          <Eyebrow>Documentary</Eyebrow>
          <h2 id="doc-h" class="display h2">Long form is where we are strongest.</h2>
          <p class="lede mt-5">
            A 10–40 minute documentary is a different animal from a highlight video. It needs
            pre-production — research, access, a question worth asking — before anyone
            travels. We price it in three stages so you can commit to it in three stages.
          </p>
        </div>
        <ol class="stages">
          <ProcessItem n="01" title="Pre-production">Research, story architecture, access and permissions, shoot schedule, interview guides, shot list.</ProcessItem>
          <ProcessItem n="02" title="Filming">Two to three shoot days. Two-camera interviews with lighting and lav-primary audio; field b-roll single-camera at 4K.</ProcessItem>
          <ProcessItem n="03" title="Post-production">Assembly, edit, grade, sound mix, subtitles and versioning. Voice artist available for scripted narration.</ProcessItem>
        </ol>
      </div>
    </PageBand>
  </div>
</template>

<style scoped>
.films__h1 { max-width: 16ch; }
.films, .stages { list-style: none; padding: 0; margin: 0; }
</style>
