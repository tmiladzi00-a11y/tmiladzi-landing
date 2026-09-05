<script setup lang="ts">
/* A technical spec laid out in the order a job runs: numbered stage
   columns, each a short term/value list. Values are set in the body face
   so a procurement reader can read them, not decode them. */
defineProps<{ groups: { k: string; lead?: string; rows: [term: string, value: string][] }[]; label?: string }>()
</script>

<template>
  <div class="specgrid" role="list" :aria-label="label">
    <section v-for="(g, i) in groups" :key="g.k" class="specgrid__col" role="listitem">
      <header class="specgrid__head">
        <span class="mono specgrid__n">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3 class="h4 h4--tight specgrid__k">{{ g.k }}</h3>
        <p v-if="g.lead" class="specgrid__lead">{{ g.lead }}</p>
      </header>
      <dl class="specgrid__list">
        <div v-for="[t, v] in g.rows" :key="t" class="specgrid__row">
          <dt class="mono">{{ t }}</dt>
          <dd>{{ v }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.specgrid { display: grid; gap: var(--tm-sys-space-4); }
@media (min-width: 900px) { .specgrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--tm-sys-space-5); } }
.specgrid__col {
  border: 1px solid var(--tm-sys-elevation-2-line); border-radius: var(--tm-sys-shape-corner);
  background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-5); display: flex; flex-direction: column;
}
.specgrid__head { padding-bottom: var(--tm-sys-space-4); border-bottom: 1px solid var(--tm-sys-color-outline); }
.specgrid__n { color: var(--tm-sys-color-secondary-hover); display: block; margin-bottom: var(--tm-sys-space-2); }
.specgrid__k { margin: 0; }
.specgrid__lead { margin: 4px 0 0; font-size: 14px; color: var(--tm-sys-color-on-surface-faint); }
.specgrid__list { margin: 0; }
.specgrid__row { padding: var(--tm-sys-space-3) 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant); }
.specgrid__row:last-child { border-bottom: 0; padding-bottom: 0; }
.specgrid__row dt { font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.specgrid__row dd { margin: 4px 0 0; font-size: 15px; line-height: 1.5; color: var(--tm-sys-color-on-surface-variant); }
</style>
