<script setup lang="ts">
import { CAPS } from '~/content/capabilities'
useSeoMeta({ title: 'Capabilities', description: 'What we do, what you receive, and the technical standard it arrives at. Photography, film, documentary and retainers for organisations in Zambia.' })

import type { Rate } from '~/components/RateList.vue'
/* The same nine anchors as before, grouped so the list scans by service. */
const anchors: { k: string; rows: Rate[] }[] = [
  { k: 'Photography', rows: [
    { name: 'Photography', qual: 'Half day · 1–4 hrs', price: '7,500', from: true },
    { name: 'Photography', qual: 'Full day · 4–8 hrs', price: '9,250', from: true },
  ] },
  { k: 'Photo + video', rows: [
    { name: 'Photo + video', qual: 'Half day', price: '27,500', from: true },
    { name: 'Photo + video', qual: 'Full day', price: '34,250', from: true },
  ] },
  { k: 'Film', rows: [
    { name: 'Testimonial film', qual: 'Per piece', price: '6,000', from: true },
    { name: 'Documentary', qual: 'Full pipeline', price: '45,000', from: true },
  ] },
  { k: 'Day rates', rows: [
    { name: 'Drone coverage', qual: 'Per day', price: '10,000', from: true },
    { name: 'Travel', qual: 'Within Copperbelt', price: '2,500', unit: '/ day' },
    { name: 'Travel', qual: 'Outside Copperbelt', price: '12,000', unit: '/ day' },
  ] },
]
/* Twelve lines of spec, in the order a job runs: how it is shot, what the
   masters are, how they reach the client. */
const spec: { k: string; lead: string; rows: [string, string][] }[] = [
  { k: 'Capture', lead: 'How it is shot', rows: [
    ['Video resolution', '4K minimum, all cameras'],
    ['Interview setup', 'Two-camera with lighting; single camera in the field where 4K is maintained'],
    ['Primary audio', 'Lavalier, with shotgun as backup channel'],
    ['Framing', 'Rule of thirds on interviews; centre frame for direct-to-camera'],
    ['Lighting', 'Moderate three-point; naturalistic, not dramatic, unless briefed'],
  ] },
  { k: 'Masters', lead: 'What the files are', rows: [
    ['Master codec', 'H.264 (MP4), 10-bit'],
    ['Audio files', 'WAV, 32-bit / 48 kHz'],
    ['Dialogue levels', 'Peaking −12 to −6 dBFS'],
    ['Stills', 'Full-resolution JPEG and RAW on request; unlimited edited selects'],
    ['Watermarks', 'None applied to client masters'],
  ] },
  { k: 'Handover', lead: 'How you receive it', rows: [
    ['Transfer', "Client gallery or physical drive — client's choice"],
    ['Archive', 'Held and backed up for at least 12 months post-delivery; re-supply on request'],
  ] },
]
</script>

<template>
  <div>
    <PageBand tight>
      <Eyebrow>Services</Eyebrow>
      <h1 class="display h1 cap__h1">Capabilities</h1>
      <p class="lede mt-5">What we do, what you receive, and the technical standard it arrives at.</p>
    </PageBand>

    <PageBand tight flush>
      <ul class="grid g3 caps"><CapabilityCard v-for="c in CAPS" :key="c.k" :cap="c" /></ul>
    </PageBand>

    <PageBand dark labelledby="ret-h">
      <div class="split">
        <div>
          <Eyebrow>Retainers</Eyebrow>
          <h2 id="ret-h" class="display h2">The case for a standing arrangement.</h2>
          <p class="lede mt-5">
            Most organisations buy production reactively — a launch, a visit, an annual
            report — and end up with a visual library that does not match itself. A retainer
            fixes the shoot days, the look and the cost for the year.
          </p>
          <TickList class="mt-5" :items="['An agreed number of shoot days per month or quarter', 'A consistent, colour-matched image library that grows', 'Priority scheduling ahead of ad-hoc bookings', 'Content cut to the formats your channels actually use', 'One point of contact who already knows your sites and people']" />
          <BaseButton variant="primary" to="/brief" arrow class="mt-6">Discuss a retainer</BaseButton>
        </div>
        <div>
          <SurfaceCard k="Indicative starting points" tone="mal">
            <p class="mt-0">Every project is quoted from a brief. These are
              the anchors, in Zambian Kwacha, before travel and scope.</p>
            <RateList class="mt-5" :groups="anchors" />
            <p class="note mt-4">Multi-day and package engagements are discounted. Quotations are valid 30 days.</p>
          </SurfaceCard>
        </div>
      </div>
    </PageBand>

    <PageBand id="delivery-spec" labelledby="spec-h">
      <SectionHead id="spec-h" eyebrow="Delivery specification" copper title="Written down, so procurement does not have to ask.">
        Our standard technical delivery. Where a client has its own spec — as
        global mining and media clients usually do — we shoot to theirs and confirm it in
        the proposal.
      </SectionHead>
      <SpecGrid :groups="spec" label="Standard technical delivery" />
    </PageBand>

    <PageBand dark>
      <ul class="grid g4 comp">
        <SurfaceCard tag="li" k="Site access"><h3 class="h4">Induction ready</h3><p>Crew complete site safety induction and PPE requirements before filming on operating plant or mine sites.</p></SurfaceCard>
        <SurfaceCard tag="li" k="Confidentiality"><h3 class="h4">NDA</h3><p>We sign client NDAs and treat unreleased footage as restricted. Nothing is published without written clearance.</p></SurfaceCard>
        <SurfaceCard tag="li" k="Aerial"><h3 class="h4">Drone coverage</h3><p>Aerial coverage of site, plant and landscape, available on request. Flights are subject to airspace permissions, your site rules and the required civil aviation authorisation being in place for the location.</p></SurfaceCard>
        <SurfaceCard tag="li" k="Connectivity"><h3 class="h4">Starlink on location</h3><p>Rushes backed up and transferred from remote sites the same day, not a week later in town.</p></SurfaceCard>
      </ul>
    </PageBand>
  </div>
</template>

<style scoped>
.cap__h1 { max-width: 15ch; }
.caps, .comp { list-style: none; padding: 0; margin: 0; }
</style>
