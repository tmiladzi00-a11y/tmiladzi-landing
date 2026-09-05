<script setup lang="ts">
/* Two-column key/value table. `prose` switches the value cells to the body
   face for the legal pages' cancellation scales. */
withDefaults(defineProps<{
  rows: [string, string][]
  caption?: string
  prose?: boolean
  bare?: boolean
}>(), {})
</script>

<template>
  <div class="tablewrap" :class="{ 'tablewrap--bare': bare }">
    <table class="spec" :class="{ 'spec--prose': prose }">
      <caption v-if="caption" class="mono spec__cap">{{ caption }}</caption>
      <tbody>
        <tr v-for="[k, v] in rows" :key="k"><th scope="row">{{ k }}</th><td>{{ v }}</td></tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tablewrap { overflow-x: auto; border: 1px solid var(--tm-sys-elevation-2-line); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); }
.tablewrap--bare { background: transparent; border: 0; }
.spec { width: 100%; border-collapse: collapse; font-size: 14.5px; }
.spec th, .spec td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--tm-sys-color-outline-variant); vertical-align: top; }
.spec tr:last-child th, .spec tr:last-child td { border-bottom: 0; }
.spec th {
  font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track);
  text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); font-weight: 400; width: 38%;
}
.spec td { color: var(--tm-sys-color-on-surface-variant); font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-md); letter-spacing: .02em; }
.spec__cap { text-align: left; padding: 14px; border-bottom: 1px solid var(--tm-sys-color-outline-variant); }
.spec--prose th { width: 42%; text-transform: none; letter-spacing: .02em; font-size: 13px; color: var(--tm-sys-color-on-surface); }
.spec--prose td { font-family: var(--tm-sys-type-body-family); font-size: 15px; letter-spacing: 0; }
</style>
