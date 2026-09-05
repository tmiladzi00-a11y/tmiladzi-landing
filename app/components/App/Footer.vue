<script setup lang="ts">
import { SITE } from '~/content/site'

const studio = [
  { to: '/work', label: 'Work' },
  { to: '/films', label: 'Films' },
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/studio', label: 'About' },
]
const book = [
  { to: '/brief', label: 'Project brief' },
  { to: '/celebrations', label: 'Weddings' },
  { to: '/booking', label: 'Booking calendar' },
  { to: '/contact', label: 'Contact' },
]
const legal = [
  { to: '/terms', label: 'Terms of business' },
  { to: '/commercial', label: 'Commercial terms' },
  { to: '/privacy', label: 'Privacy notice' },
  { to: '/copyright', label: 'Image use' },
]
</script>

<template>
  <footer class="foot">
    <div class="wrap">
      <div class="foot__grid">
        <div class="foot__brand">
          <NuxtLink class="brand" to="/">
            <span class="brand__mark">TMILADZI</span>
            <span class="brand__sub">Media&nbsp;·&nbsp;ZM</span>
          </NuxtLink>
          <p class="muted foot__blurb">
            Photography, film and documentary production for organisations that have to
            prove their impact. Kitwe, Copperbelt — working Zambia-wide.
          </p>
          <SocialLinks class="foot__social" />
        </div>
        <nav class="foot__col" aria-labelledby="f-studio">
          <h2 id="f-studio" class="foot__h">Studio</h2>
          <ul><li v-for="l in studio" :key="l.to"><NuxtLink :to="l.to">{{ l.label }}</NuxtLink></li></ul>
        </nav>
        <nav class="foot__col" aria-labelledby="f-book">
          <h2 id="f-book" class="foot__h">Book</h2>
          <ul><li v-for="l in book" :key="l.to"><NuxtLink :to="l.to">{{ l.label }}</NuxtLink></li></ul>
        </nav>
        <div class="foot__col foot__col--direct" aria-labelledby="f-direct">
          <h2 id="f-direct" class="foot__h">Direct</h2>
          <ul class="foot__direct">
            <li><a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a></li>
            <li><a :href="SITE.phoneHref">{{ SITE.phone }}</a></li>
            <li><a :href="SITE.whatsapp" target="_blank" rel="noopener">WhatsApp {{ SITE.phone }}</a></li>
          </ul>
        </div>
      </div>

      <div class="foot__base">
        <address class="foot__legal">
          <span>Tmiladzi Media is a business name of <strong>{{ SITE.founder }}</strong>, sole trader.</span>
          <span>{{ SITE.street }}, {{ SITE.suburb }}, {{ SITE.city }}, {{ SITE.region }} {{ SITE.postcode }}, {{ SITE.country }}</span>
          <span>TPIN {{ SITE.tpin }} · Not registered for VAT</span>
        </address>
        <div class="foot__meta">
          <ul class="foot__links">
            <li v-for="l in legal" :key="l.to"><NuxtLink :to="l.to">{{ l.label }}</NuxtLink></li>
          </ul>
          <p class="foot__copy">© 2026 Tmiladzi Media. Our photographs and films may not be reproduced without permission.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.foot {
  border-top: 1px solid var(--tm-sys-color-outline); background: var(--tm-sys-elevation-1-bg);
  padding: var(--tm-sys-space-8) 0 var(--tm-sys-space-6);
}

/* top: brand + three link columns. Phones get the columns two-up so the
   footer is a block, not a scroll. */
.foot__grid { display: grid; gap: var(--tm-sys-space-6) var(--tm-sys-space-5); grid-template-columns: repeat(2, 1fr); }
.foot__brand { grid-column: 1 / -1; }
@media (min-width: 820px) {
  .foot__grid { grid-template-columns: 2fr 1fr 1fr 1.4fr; }
  .foot__brand { grid-column: auto; }
}
.brand { display: inline-flex; align-items: baseline; gap: 10px; text-decoration: none; }
.brand__mark {
  font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-brand-axes);
  font-size: 20px; letter-spacing: -.03em;
}
.brand__sub {
  font-family: var(--tm-sys-type-data-family); font-size: 9.5px; letter-spacing: .22em;
  text-transform: uppercase; color: var(--tm-sys-color-primary-hover);
}
.foot__blurb { font-size: 15px; margin: var(--tm-sys-space-4) 0 0; max-width: 38ch; }
.foot__social { margin-top: var(--tm-sys-space-5); }
.foot__h {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .18em;
  text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); margin: 0 0 var(--tm-sys-space-4); font-weight: 400;
}
.foot__col ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
/* on phones the direct lines span the row; social channels live as icons under the brand */
.foot__col--direct { grid-column: 1 / -1; }
@media (min-width: 820px) { .foot__col--direct { grid-column: auto; } }
.foot a { text-decoration: none; color: var(--tm-sys-color-on-surface-variant); font-size: 14.5px;
  transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.foot a:hover { color: var(--tm-sys-color-primary-hover); }

/* base: who you are dealing with on the left, the legal links and the
   copyright line on the right. Each line breaks where it should. */
.foot__base {
  margin-top: var(--tm-sys-space-7); padding-top: var(--tm-sys-space-5); border-top: 1px solid var(--tm-sys-color-outline-variant);
  display: grid; gap: var(--tm-sys-space-5); grid-template-columns: 1fr;
}
@media (min-width: 820px) { .foot__base { grid-template-columns: 1fr auto; align-items: start; } }
.foot__legal {
  font-style: normal; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm);
  letter-spacing: .04em; color: var(--tm-sys-color-on-surface-faint); line-height: 1.8; display: grid;
}
.foot__legal strong { color: var(--tm-sys-color-on-surface-variant); font-weight: 500; }
.foot__meta { display: grid; gap: var(--tm-sys-space-3); }
@media (min-width: 820px) { .foot__meta { justify-items: end; text-align: right; } }
.foot__links { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px var(--tm-sys-space-5); }
@media (min-width: 820px) { .foot__links { justify-content: flex-end; } }
.foot__links a {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .04em;
  color: var(--tm-sys-color-on-surface-variant); border-bottom: 1px solid var(--tm-sys-color-outline); padding-bottom: 1px;
}
.foot__links a:hover { border-bottom-color: var(--tm-sys-color-primary-hover); }
.foot__copy {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .04em;
  color: var(--tm-sys-color-on-surface-faint); margin: 0; max-width: 44ch; line-height: 1.7;
}
</style>
