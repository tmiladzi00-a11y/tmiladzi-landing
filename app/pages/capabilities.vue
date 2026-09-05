<script setup lang="ts">
import { CAPS } from '~/content/capabilities'
useSeoMeta({ title: 'Capabilities', description: 'What we do, what you receive, and the technical standard it arrives at. Photography, film, documentary and retainers for organisations in Zambia.' })

const anchors: [string, string][] = [
  ['Photography, half day (1–4 hrs)', 'from 7,500'],
  ['Photography, full day (4–8 hrs)', 'from 9,250'],
  ['Photo + video, half day', 'from 27,500'],
  ['Photo + video, full day', 'from 34,250'],
  ['Drone coverage, per day', 'from 7,000'],
  ['Testimonial film, per piece', 'from 3,000'],
  ['Documentary, full pipeline', 'from 44,500'],
  ['Travel, within Copperbelt', '2,500 / day'],
  ['Travel, outside Copperbelt', '12,000 / day'],
]
const spec: [string, string][] = [
  ['Video resolution', '4K minimum, all cameras'],
  ['Interview setup', 'Two-camera with lighting; single camera in the field where 4K is maintained'],
  ['Primary audio', 'Lavalier, with shotgun as backup channel'],
  ['Master codec', 'ProRes 422 HQ (.mov)'],
  ['Audio files', 'WAV, 24-bit / 48 kHz'],
  ['Dialogue levels', 'Peaking −12 to −6 dBFS'],
  ['Framing', 'Rule of thirds on interviews; centre frame for direct-to-camera'],
  ['Lighting', 'Moderate three-point; naturalistic, not dramatic, unless briefed'],
  ['Stills', 'Full-resolution JPEG and RAW on request; unlimited edited selects'],
  ['Folder structure', 'Separate interview and b-roll directories, shoot-day dated'],
  ['Transfer', "Client gallery, Google Drive or physical drive — client's choice"],
  ['Watermarks', 'None applied to client masters'],
  ['Archive', 'Held and backed up for at least 12 months post-delivery; re-supply on request'],
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
            <SpecTable class="mt-5" :rows="anchors" bare />
            <p class="note mt-4">Multi-day and package engagements are discounted. Quotations are valid 30 days.</p>
          </SurfaceCard>
        </div>
      </div>
    </PageBand>

    <PageBand labelledby="spec-h">
      <SectionHead id="spec-h" eyebrow="Delivery specification" copper title="Written down, so procurement does not have to ask.">
        Our standard technical delivery. Where a client has its own spec — as
        global mining and media clients usually do — we shoot to theirs and confirm it in
        the proposal.
      </SectionHead>
      <SpecTable :rows="spec" caption="Standard technical delivery" />
    </PageBand>

    <PageBand dark>
      <ul class="grid g4 comp">
        <SurfaceCard tag="li" k="Site access"><h3 class="h4">Induction ready</h3><p>Crew complete site safety induction and PPE requirements before filming on operating plant or mine sites.</p></SurfaceCard>
        <SurfaceCard tag="li" k="Confidentiality"><h3 class="h4">NDA as standard</h3><p>We sign client NDAs and treat unreleased footage as restricted. Nothing is published without written clearance.</p></SurfaceCard>
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
