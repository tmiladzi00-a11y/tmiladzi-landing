<script setup lang="ts">
import { PROJECTS } from '~/content/projects'
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

    <PageBand dark labelledby="wed-h">
      <SectionHead id="wed-h" eyebrow="The wedding package" copper title="Ten hours, unlimited edited photos.">
        One price for the whole day. Everything else on this page is optional
        and priced openly, so you can build the day you want without a quotation ping-pong.
      </SectionHead>
      <div class="split">
        <div>
          <PricingCard title="Weddings" :price="7000" unit="10 hours" blurb="Unlimited edited photos — all the best frames from the day, not a capped number.">
            <h4 class="h4">Covers</h4>
            <TickList tone="cop" :items="['Bride’s preparations', 'Ceremony', 'Photoshoot', 'Reception']" />
            <h4 class="h4">Delivery</h4>
            <TickList tone="cop" :items="['Six weeks as standard — express options below', 'Private online gallery for downloading', 'Weddings outside the Copperbelt carry a travel charge only']" />
          </PricingCard>
        </div>
        <div>
          <h3 class="h4 addons__h">Optional add-ons</h3>
          <ul class="addons">
            <ProcessItem n="+" tone="cop" title="Additional time">Coverage beyond the standard ten hours. <b>K250 per hour</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Pre-wedding photoshoot">10 photos and a 30-second save-the-date reel. <b>K2,500</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Extra photographer">Best for large weddings — two angles on every moment. <b>K5,000 each</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Wedding reel">A one-minute film shot for social media on the day. <b>K5,500 each</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Highlight video">A 3–5 minute highlight film of the whole day. <b>Price on request</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Express delivery" last>Each week you buy takes a week off the six-week delivery. <b>K2,500 per week</b></ProcessItem>
          </ul>
          <BaseButton variant="copper" to="/booking" arrow class="mt-6">Build your booking</BaseButton>
        </div>
      </div>
    </PageBand>

    <PageBand labelledby="small-h">
      <SectionHead id="small-h" eyebrow="Also for private clients" copper title="Smaller days, same standard." />
      <div class="split">
        <div>
          <PricingCard title="Small Events & Family Shoots" :price="4000" unit="4 hours" blurb="Birthdays, graduations, dinners, kitchen parties and family gatherings.">
            <h4 class="h4">What you get</h4>
            <TickList tone="cop" :items="['50–150 edited photos', '48-hour delivery', 'Private online gallery for downloading']" />
            <h4 class="h4">Worth knowing</h4>
            <TickList tone="cop" :items="['An assistant photographer shoots most small events', 'Team logistics are not covered for events outside Kitwe']" />
          </PricingCard>
        </div>
        <div>
          <h3 class="h4 addons__h">Optional add-ons</h3>
          <ul class="addons">
            <ProcessItem n="+" tone="cop" title="Additional time">Coverage beyond the standard four hours. <b>K1,000 per hour</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Reel">A 30–60 second highlight reel. <b>K2,800 each</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Highlight video">3–5 minutes, to music of your choice. <b>K5,500</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Express delivery" last>Brings the video deliverables forward by a week each. <b>K2,500 per week</b></ProcessItem>
          </ul>
          <BaseButton variant="copper" to="/booking" arrow class="mt-6">Build your booking</BaseButton>
        </div>
      </div>

      <hr class="hr">

      <div class="split">
        <div>
          <PricingCard title="Photoshoot Sessions" :price="2000" unit="1 hour" blurb="Portraits, maternity, graduation and studio-at-your-home sessions.">
            <h4 class="h4">What you get</h4>
            <TickList tone="cop" :items="['15 edited pictures', '48-hour delivery', 'Studio, home studio or outdoor — your choice']" />
            <h4 class="h4">Worth knowing</h4>
            <TickList tone="cop" :items="['Team transport is included within Kitwe only']" />
          </PricingCard>
        </div>
        <div>
          <h3 class="h4 addons__h">Optional add-ons</h3>
          <ul class="addons">
            <ProcessItem n="+" tone="cop" title="Additional time">More time in front of the camera. <b>K1,250 per hour</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Additional photo">Each extra fully edited picture beyond the 15. <b>K80 each</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Reel">A 30–45 second video reel from the session. <b>K2,000 each</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="All unedited photos">Every frame, straight off the camera. <b>K1,500</b></ProcessItem>
            <ProcessItem n="+" tone="cop" title="Next-day delivery" last>Your photos back in 24 hours instead of 48. <b>K500</b></ProcessItem>
          </ul>
          <BaseButton variant="copper" to="/booking" arrow class="mt-6">Build your booking</BaseButton>
        </div>
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
.addons { list-style: none; padding: 0; margin: 0; }
.addons__h { margin: 0 0 var(--tm-sys-space-4); }
</style>
