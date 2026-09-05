<script setup lang="ts">
import { SITE } from '~/content/site'
/* The studio's public channels as a row of round hairline buttons. Icons
   are hand-drawn strokes so they sit with the site's other line marks; the
   accessible name is the network, the title carries the handle. */
withDefaults(defineProps<{ size?: 'md' | 'lg' }>(), { size: 'md' })

const links = [
  { id: 'instagram', label: 'Instagram', title: '@tmiladzi on Instagram', href: SITE.instagram },
  { id: 'youtube', label: 'YouTube', title: '@tmiladzi on YouTube', href: SITE.youtube },
  { id: 'linkedin', label: 'LinkedIn', title: `${SITE.founder} on LinkedIn`, href: SITE.linkedin },
  { id: 'whatsapp', label: 'WhatsApp', title: `WhatsApp ${SITE.phone}`, href: SITE.whatsapp },
]
</script>

<template>
  <ul class="social" :class="`social--${size}`" aria-label="Tmiladzi Media on social media">
    <li v-for="l in links" :key="l.id">
      <a :href="l.href" target="_blank" rel="noopener" :title="l.title" class="social__btn">
        <svg v-if="l.id === 'instagram'" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none" />
        </svg>
        <svg v-else-if="l.id === 'youtube'" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.2v5.6L15 12z" fill="currentColor" stroke="none" />
        </svg>
        <svg v-else-if="l.id === 'linkedin'" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.5V17M8 7.6v.1M12 17v-3.6a2.4 2.4 0 0 1 4.8 0V17M12 10.5V17" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.2 19.8l1.1-3.9A8.5 8.5 0 1 1 8.3 18.9z" /><path d="M9.3 8.6c.3-.6.9-.7 1.2-.2l.7 1.3c.2.3.1.6-.1.8l-.5.6c.6 1.2 1.5 2.1 2.7 2.7l.6-.5c.2-.2.6-.3.8-.1l1.3.7c.5.3.4.9-.2 1.2-.9.6-2 .6-3.3-.3a9.6 9.6 0 0 1-3.5-3.5c-.8-1.3-.8-2.4-.2-3.3z" />
        </svg>
        <span class="sr-only">{{ l.label }}</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.social { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-2); }
.social__btn {
  --_s: 38px;
  width: var(--_s); height: var(--_s); border-radius: 50%; border: 1px solid var(--tm-sys-color-outline);
  display: grid; place-items: center; color: var(--tm-sys-color-on-surface-variant); text-decoration: none;
  transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.social--lg .social__btn { --_s: 44px; }
.social__btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.social--lg .social__btn svg { width: 20px; height: 20px; }
.social__btn:hover, .social__btn:focus-visible {
  color: var(--tm-sys-color-primary-hover); border-color: var(--tm-sys-color-primary-container);
  background: color-mix(in srgb, var(--tm-sys-color-primary) 12%, transparent);
}
</style>
