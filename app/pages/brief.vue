<script setup lang="ts">
import { SITE } from '~/content/site'
useSeoMeta({ title: 'Project brief', description: 'Six questions. Answer them here and the proposal you get back is scoped and priced rather than a request for another meeting.' })
</script>

<template>
  <div>
    <PageBand tight>
      <div class="split">
        <div>
          <Eyebrow>Corporate, NGO &amp; documentary</Eyebrow>
          <h1 class="display h1 brief__h1">Start a project brief</h1>
          <p class="lede mt-5">
            Six questions. They are the same six we would ask on a call, and answering them
            here means the proposal you get back is scoped and priced rather than a
            request for another meeting.
          </p>
          <BriefForm class="mt-6" />
        </div>

        <aside>
          <SurfaceCard tone="mal">
            <h2 class="card__k-h">What happens next</h2>
            <ol class="brief__steps">
              <ProcessItem n="01" title="We read it properly">Within one working day, with a question or two if the scope is unclear.</ProcessItem>
              <ProcessItem n="02" title="A scoped proposal">Approach, crew, shoot days, deliverables and a written quotation.</ProcessItem>
              <ProcessItem n="03" title="A held date" last>On acceptance we lock the dates and start logistics and permissions.</ProcessItem>
            </ol>
          </SurfaceCard>
          <SurfaceCard k="Direct" class="mt-5">
            <dl class="brief__dl">
              <ContactRow term="Email"><a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a></ContactRow>
              <ContactRow term="Phone"><a :href="SITE.phoneHref">{{ SITE.phone }}</a></ContactRow>
              <ContactRow term="Studio" last>{{ SITE.street }},<br>{{ SITE.suburb }}, {{ SITE.city }} {{ SITE.postcode }}</ContactRow>
            </dl>
          </SurfaceCard>
          <SurfaceCard k="Not a corporate project?" class="mt-5">
            <p class="mt-0">Weddings, portraits and family sessions book on a live calendar.</p>
            <BaseButton variant="copper" size="sm" to="/celebrations" arrow class="mt-4">Go to packages</BaseButton>
          </SurfaceCard>
        </aside>
      </div>
    </PageBand>
  </div>
</template>

<style scoped>
.brief__h1 { max-width: 13ch; }
.card__k-h { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); margin: 0 0 var(--tm-sys-space-3); font-weight: 400; }
.brief__steps { list-style: none; padding: 0; margin: 0; }
.brief__dl { margin: 0; }
</style>
