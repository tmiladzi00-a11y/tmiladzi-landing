<script setup lang="ts">
useSeoMeta({ title: 'Book a date', description: 'Choose your coverage, pick a date that is open, add anything extra you want, and tell us about the day. You see the full price as you build it.' })

/* Browsers parse <noscript> contents as raw text when scripting is on, so
   Vue cannot hydrate its children. v-html hands it over as a string and
   hydration skips inside. */
const nojs = `<p class="note book__nojs">The booking calendar needs JavaScript. Without it, message
  <a href="https://wa.me/260974901668">+260 974 901 668</a> on WhatsApp or email
  <a href="mailto:tmiladzi@gmail.com">tmiladzi@gmail.com</a> with the date and the coverage you want.</p>`
</script>

<template>
  <div>
    <PageBand tight>
      <Eyebrow copper>Weddings, events &amp; sessions</Eyebrow>
      <h1 class="display h1 book__h1">Book a date</h1>
      <p class="lede mt-5 book__lede">
        Choose your coverage, pick a date that is open, add anything extra you want,
        and tell us about the day. You see the full price as you build it — nothing is
        hidden until a quote arrives.
      </p>
    </PageBand>
    <PageBand tight flush>
      <noscript v-html="nojs" />
      <BookingWizard />
    </PageBand>
  </div>
</template>

<style scoped>
.book__h1 { max-width: 13ch; }
.book__lede { max-width: 56ch; }
:deep(.book__nojs) { border: 1px dashed var(--tm-sys-color-secondary-container); padding: var(--tm-sys-space-4); margin-bottom: var(--tm-sys-space-5); }
</style>
