<script setup lang="ts">
import { PROJECTS } from '~/content/projects'
import { SERVICES } from '~/content/services'
useSeoMeta({ title: 'Weddings', description: 'Wedding coverage, small events and portrait sessions on published packages with a live booking calendar. Kitwe, Copperbelt and Zambia-wide.' })
const weddings = PROJECTS.filter((p) => p.cat === 'weddings')
</script>

<template>
  <div>
    <PageBand tight>
      <Eyebrow copper>Private clients</Eyebrow>
      <h1 class="display h1 cel__h1">Weddings &amp; portraits</h1>
      <p class="lede mt-5">
        The same crew, the same cameras, the same colour — pointed at the day your family
        will talk about for thirty years. Prices are published, dates are live, and session
        types can be adjusted to your liking: take the parts of a service you like from a
        different package.
      </p>
      <div class="row">
        <BaseButton variant="copper" to="/booking" arrow>Check available dates</BaseButton>
        <BaseButton to="/contact">Ask a question first</BaseButton>
      </div>
    </PageBand>

    <PageBand tight flush>
      <WorkGrid :projects="weddings" label="Wedding and portrait work" level="h2" />
    </PageBand>

    <PageBand dark labelledby="pkg-h">
      <SectionHead id="pkg-h" eyebrow="The packages" copper title="Three packages, side by side.">
        One price for the day, or the hour. Everything else is optional and priced openly,
        so you can build the coverage you want without a quotation ping-pong. These are the
        same numbers the booking calendar quotes from.
      </SectionHead>
      <PackageTable :services="SERVICES" />
      <div class="row mt-7">
        <BaseButton variant="copper" to="/booking" arrow>Build your booking</BaseButton>
        <BaseButton to="/contact">Ask a question first</BaseButton>
      </div>
    </PageBand>

    <PageBand dark labelledby="before-h">
      <div class="split">
        <div>
          <Eyebrow copper>Before you book</Eyebrow>
          <h2 id="before-h" class="display h2">The thing that goes wrong is expectations, not cameras.</h2>
          <p class="lede mt-5">
            Almost every difficult wedding we have shot went sideways for one reason: nobody
            agreed in advance what the day's photography actually was. So we do that first,
            in writing, with whoever is really making the decisions.
          </p>
        </div>
        <ol class="addons">
          <ProcessItem n="01" title="One conversation with the family">Not just the couple. We ask who else has a say, and we bring them into the plan before the day.</ProcessItem>
          <ProcessItem n="02" title="A written run sheet">Times, locations, the group shots that matter, and who gathers people. Agreed a week out.</ProcessItem>
          <ProcessItem n="03" title="Named deliverables and dates">What you get, in what format, by when. Six weeks as standard, sooner if you have bought express.</ProcessItem>
        </ol>
      </div>
      <div class="row mt-7">
        <BaseButton variant="copper" to="/booking" arrow>Check available dates</BaseButton>
      </div>
    </PageBand>
  </div>
</template>

<style scoped>
.cel__h1 { max-width: 16ch; }

</style>
