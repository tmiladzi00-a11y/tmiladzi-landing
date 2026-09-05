<script setup lang="ts">
import { SITE } from '~/content/site'
useSeoMeta({ title: 'Contact', description: 'Email, phone, WhatsApp and studio address for Tmiladzi Media, Kitwe, Copperbelt. Available Monday to Sunday.' })
</script>

<template>
  <div>
    <PageBand tight>
      <Eyebrow>Contact</Eyebrow>
      <h1 class="display h1 contact__h1">Let's talk about the shoot.</h1>
      <p class="lede mt-5">
        Available Monday to Sunday. For anything with a scope and a budget, the brief
        form gets you a faster and better answer than an email will.
      </p>
    </PageBand>

    <PageBand tight flush>
      <div class="split">
        <dl class="contact__list">
          <ContactRow term="Email"><a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a></ContactRow>
          <ContactRow term="Phone"><a :href="SITE.phoneHref">{{ SITE.phone }}</a></ContactRow>
          <ContactRow term="WhatsApp"><a :href="SITE.whatsapp" target="_blank" rel="noopener">{{ SITE.whatsappDisplay }}</a></ContactRow>
          <ContactRow term="Studio">{{ SITE.street }}, {{ SITE.suburb }},<br>{{ SITE.city }}, {{ SITE.region }} {{ SITE.postcode }}, {{ SITE.country }}</ContactRow>
          <ContactRow term="Hours">Monday – Sunday</ContactRow>
          <ContactRow term="Instagram"><a :href="SITE.instagram" target="_blank" rel="noopener">@tmiladzi</a></ContactRow>
          <ContactRow term="YouTube"><a :href="SITE.youtube" target="_blank" rel="noopener">@tmiladzi</a></ContactRow>
          <ContactRow term="LinkedIn"><a :href="SITE.linkedin" target="_blank" rel="noopener">{{ SITE.founder }}</a></ContactRow>
        </dl>
        <div>
          <LaneCta tone="mal" pill="Fastest route" title="Organisations" compact>
            <p class="muted">Six questions, a scoped proposal back within two working days.</p>
            <template #action><BaseButton variant="primary" to="/brief" arrow>Start a brief</BaseButton></template>
          </LaneCta>
          <LaneCta tone="cop" pill="Live calendar" title="Weddings & sessions" compact class="mt-5">
            <p class="muted">See packages, pick a date and hold it.</p>
            <template #action><BaseButton variant="copper" to="/booking" arrow>Booking calendar</BaseButton></template>
          </LaneCta>
        </div>
      </div>
    </PageBand>
  </div>
</template>

<style scoped>
.contact__h1 { max-width: 14ch; }
.contact__list { margin: 0; }
</style>
