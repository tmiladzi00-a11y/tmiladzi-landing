<script setup lang="ts">
import { SITE } from '~/content/site'
withDefaults(defineProps<{
  title: string
  titleMax?: string
  version?: string
  toc: [string, string][]
  tocLabel: string
  /** Show the sole-trader footer line. */
  footer?: boolean
}>(), { titleMax: '14ch', footer: true })
</script>

<template>
  <div>
    <PageBand tight>
      <Eyebrow>Legal</Eyebrow>
      <h1 class="display h1" :style="{ maxWidth: titleMax }">{{ title }}</h1>
      <p class="lede legal__lede"><slot name="lede" /></p>
      <p v-if="version" class="mono mt-5">{{ version }}</p>
    </PageBand>
    <PageBand tight flush>
      <div class="split">
        <div class="legal">
          <slot />
          <template v-if="footer">
            <hr class="hr">
            <p class="note">
              <slot name="footer">
                Tmiladzi Media is a business name of {{ SITE.founder }}, sole trader.
                {{ SITE.street }}, {{ SITE.suburb }}, {{ SITE.city }}, {{ SITE.region }} {{ SITE.postcode }}, {{ SITE.country }}. TPIN {{ SITE.tpin }}.
                {{ version }}.
              </slot>
            </p>
          </template>
        </div>
        <aside class="legal__aside">
          <LegalToc :items="toc" :label="tocLabel" />
          <slot name="aside" />
        </aside>
      </div>
    </PageBand>
  </div>
</template>

<style scoped>
.legal__lede { margin-top: var(--tm-sys-space-5); max-width: 62ch; }
/* The rail (contents plus the side card) rides along with the reader. The
   grid row is as tall as the clauses, so a sticky aside has the whole
   column to travel; if the rail is taller than the viewport it scrolls
   inside itself rather than being cut off. */
@media (min-width: 900px) {
  .legal__aside {
    position: sticky; top: calc(var(--tm-sys-layout-header-h) + var(--tm-sys-space-5)); align-self: start;
    max-height: calc(100dvh - var(--tm-sys-layout-header-h) - var(--tm-sys-space-6)); overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: var(--tm-sys-color-outline) transparent;
  }
}
</style>
