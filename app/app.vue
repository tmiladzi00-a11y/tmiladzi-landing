<script setup lang="ts">
import { SITE } from '~/content/site'

// Route changes use the View Transitions API where the browser has it (see
// base.css). Elsewhere, a plain Vue crossfade does the same job.
const pageTransition = import.meta.client && !('startViewTransition' in document)
  ? { name: 'page', mode: 'out-in' as const }
  : false

const config = useRuntimeConfig()
const base = config.public.siteUrl || SITE.url

useSeoMeta({
  ogImage: `${base}/og.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Tmiladzi Media. We film the work that actually changes something.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Tmiladzi Media',
  twitterDescription: SITE.description,
  twitterImage: `${base}/og.jpg`,
})

useHead({
  titleTemplate: (t) => (t && t !== 'Tmiladzi Media' ? `${t} — Tmiladzi Media` : 'Tmiladzi Media'),
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${base}/#org`,
            name: SITE.name,
            url: base,
            email: SITE.email,
            telephone: SITE.phone,
            foundingDate: SITE.founded,
            founder: { '@type': 'Person', name: SITE.founder },
            sameAs: [SITE.instagram, SITE.youtube, SITE.linkedin],
          },
          {
            '@type': 'LocalBusiness',
            '@id': `${base}/#studio`,
            name: SITE.name,
            image: `${base}/og.jpg`,
            logo: `${base}/og.jpg`,
            url: base,
            telephone: SITE.phone,
            email: SITE.email,
            priceRange: 'ZMW',
            foundingDate: SITE.founded,
            parentOrganization: { '@id': `${base}/#org` },
            address: {
              '@type': 'PostalAddress',
              streetAddress: `${SITE.street}, ${SITE.suburb}`,
              addressLocality: SITE.city,
              addressRegion: SITE.region,
              postalCode: SITE.postcode,
              addressCountry: 'ZM',
            },
            areaServed: { '@type': 'Country', name: 'Zambia' },
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              opens: '08:00',
              closes: '18:00',
            },
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
</template>
