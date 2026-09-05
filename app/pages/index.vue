<script setup lang="ts">
import { PROJECTS } from '~/content/projects'
import { CAPS } from '~/content/capabilities'
import { PROCESS } from '~/content/process'
import { CLIENTS } from '~/content/clients'
import { SITE } from '~/content/site'

useSeoMeta({
  title: 'Tmiladzi Media',
  description: 'Tmiladzi Media — photography, film and documentary production for mining, banking, development, government and agribusiness organisations. Kitwe, Copperbelt, Zambia.',
  ogTitle: 'Tmiladzi Media — Visual storytelling, Zambia',
  ogDescription: SITE.description,
  ogUrl: SITE.url + '/',
})

const stripEl = ref<{ page: (dir: -1 | 1) => void } | null>(null)
const strip = [...PROJECTS.filter((p) => p.featured), ...PROJECTS.filter((p) => !p.featured)].slice(0, 6)
const stats: [string, string][] = [
  ['8', 'Years in production'],
  ['3&nbsp;+&nbsp;8', 'Core team + crew at scale'],
  ['4K&nbsp;/&nbsp;ProRes', 'Broadcast-spec delivery'],
  ['Next&nbsp;day', 'Event stills turnaround'],
  ['Nationwide', 'Copperbelt base, ZM-wide reach'],
]
</script>

<template>
  <div>
    <HomeHero />
    <StatStrip :stats="stats" />

    <PageBand tight dark labelledby="clients-h">
      <Eyebrow tag="h2" id="clients-h" class="mb-6">Trusted by</Eyebrow>
      <ClientRoster :groups="CLIENTS" />
    </PageBand>

    <PageBand labelledby="diff-h">
      <div class="split">
        <div>
          <Eyebrow>The difference</Eyebrow>
          <h2 id="diff-h" class="display h2">Most production companies hand you footage. We hand you an argument.</h2>
          <p class="lede mt-5">
            A mine's community programme, an NGO's water project, a bank's SME portfolio —
            these are stories with a burden of proof. Before we pick up a camera we settle the
            same five things every time: the cinematic approach, the audience, the goal,
            whose voice it is spoken in, and the time we actually have.
          </p>
          <p class="lede">
            That is why our work survives a board presentation, a donor report and a
            social feed without being re-cut three times.
          </p>
          <BaseButton to="/capabilities" arrow class="mt-5">How we work</BaseButton>
        </div>
        <div class="grid diff__cards">
          <SurfaceCard k="01 · Documentary discipline">
            <h3 class="h4">Story before spectacle</h3>
            <p>Long-form documentary is our home ground. Interviews, field b-roll and a real
               narrative spine — not a montage with music over it.</p>
          </SurfaceCard>
          <SurfaceCard k="02 · Production at scale">
            <h3 class="h4">Multi-day, multi-site, remote</h3>
            <p>Five-day shoots across sites, a crew of up to eleven, transport and logistics
               handled. Starlink on location means rushes back-up and upload the same day.</p>
          </SurfaceCard>
          <SurfaceCard k="03 · Colour consistency">
            <h3 class="h4">One look, every quarter</h3>
            <p>A single Canon-based colour workflow across every shoot, so a retainer client's
               library still matches eighteen months in.</p>
          </SurfaceCard>
        </div>
      </div>
    </PageBand>

    <PageBand dark labelledby="work-h">
      <SectionHead id="work-h" eyebrow="Selected work" title="Recent frames" wide>
        <template #aside>
          <div class="work__actions">
            <StripNav label="Scroll recent frames" @page="stripEl?.page($event)" />
            <BaseButton to="/work" size="sm" arrow>All projects</BaseButton>
          </div>
        </template>
      </SectionHead>
      <FrameStrip ref="stripEl" :projects="strip" />
    </PageBand>

    <PageBand labelledby="make-h">
      <div class="split">
        <div>
          <Eyebrow>What we make</Eyebrow>
          <h2 id="make-h" class="display h2">Six things, done properly.</h2>
          <p class="lede mt-5">Every engagement is scoped from a brief, quoted in writing, and delivered
            against a named spec. No surprises on either side.</p>
          <BaseButton to="/capabilities" arrow class="mt-4">What each one includes</BaseButton>
        </div>
        <ul class="caplist">
          <li v-for="c in CAPS" :key="c.k"><span class="caplist__k">{{ c.k }}</span><span class="caplist__t">{{ c.t }}</span></li>
        </ul>
      </div>
    </PageBand>

    <PageBand dark labelledby="process-h">
      <div class="split">
        <div>
          <Eyebrow>Process</Eyebrow>
          <h2 id="process-h" class="display h2">Nine steps from first call to archive.</h2>
          <p class="lede mt-5">
            The same pipeline runs on a one-hour portrait session and a five-day mine
            documentary. It is what makes a large production predictable.
          </p>
          <BaseButton to="/studio#pipeline" arrow class="mt-4">The pipeline, in full</BaseButton>
        </div>
        <div>
          <ol class="stepnames">
            <li v-for="(s, i) in PROCESS" :key="s[0]"><span class="stepnames__n">{{ String(i + 1).padStart(2, '0') }}</span>{{ s[0] }}</li>
          </ol>
          <SurfaceCard k="Payment terms" tone="mal" class="mt-6">
            <p class="fg mt-0">Invoices are issued on delivery with payment expected
              15–20 days from issue. Established accounts run on 21- or 30-day terms by agreement.</p>
          </SurfaceCard>
        </div>
      </div>
    </PageBand>

    <PageBand labelledby="start-h">
      <SectionHead id="start-h" eyebrow="Start here" title="Two ways in." />
      <div class="lanes">
        <LaneCta tone="mal" pill="Organisations" title="Corporate, NGO & documentary">
          <p class="muted">Tell us the organisation, the scope, the dates and a budget band.
            You get a scoped proposal and a quotation — usually within two working days —
            rather than a price list that does not fit your project.</p>
          <TickList :items="['Site, event, plant and field photography', 'Documentary and impact films, 10–40 minutes', 'Monthly content retainers with a fixed library', 'NDA and site-induction ready']" />
          <template #action><BaseButton variant="primary" to="/brief" arrow>Start a project brief</BaseButton></template>
        </LaneCta>
        <LaneCta tone="cop" pill="Private clients" title="Weddings & portraits">
          <p class="muted">Sessions and wedding coverage run on published packages with a
            live booking calendar. Pick a date, see exactly what is included, and hold it.</p>
          <TickList tone="cop" :items="['Full-day wedding coverage with second shooter', 'Family, legacy and studio-at-your-home portraits', 'Private online gallery, unlimited edited images', 'Packages can be mixed — take the parts you want']" />
          <template #action><BaseButton variant="copper" to="/celebrations" arrow>See packages &amp; dates</BaseButton></template>
        </LaneCta>
      </div>
    </PageBand>

    <section class="tagline-strip">
      <div class="wrap tagline-strip__in">
        <p class="kicker">Have a shoot coming up? Send the brief and we will tell you honestly whether we are the right studio for it.</p>
        <BaseButton variant="primary" to="/brief" arrow>Start a brief</BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.work__actions { display: flex; align-items: center; gap: var(--tm-sys-space-3); }
.diff__cards { gap: var(--tm-sys-space-4); }
.caplist { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--tm-sys-color-outline-variant); }
.caplist li { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--tm-sys-space-4); padding: 14px 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant); align-items: baseline; }
.caplist__k { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.caplist__t { font-family: var(--tm-sys-type-body-family); font-weight: 650; font-size: 17px; color: var(--tm-sys-color-on-surface); }
.stepnames { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr; border-top: 1px solid var(--tm-sys-color-outline-variant); }
@media (min-width: 600px) { .stepnames { grid-template-columns: 1fr 1fr; column-gap: var(--tm-sys-space-6); } }
.stepnames li { display: grid; grid-template-columns: auto 1fr; gap: var(--tm-sys-space-4); align-items: baseline; padding: 12px 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant); font-family: var(--tm-sys-type-body-family); font-weight: 650; font-size: 17px; }
.stepnames__n { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .1em; color: var(--tm-sys-color-primary); }
.lanes { display: grid; gap: var(--tm-sys-space-5); grid-template-columns: 1fr; }
@media (min-width: 860px) { .lanes { grid-template-columns: repeat(2, 1fr); } }
.lanes :deep(p.muted) { margin: 0; }
.tagline-strip {
  border-top: 1px solid var(--tm-sys-color-outline-variant); border-bottom: 1px solid var(--tm-sys-color-outline-variant);
  background: var(--tm-sys-elevation-1-bg); padding: var(--tm-sys-space-5) 0;
}
.tagline-strip__in { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-5); align-items: center; justify-content: space-between; }
</style>
