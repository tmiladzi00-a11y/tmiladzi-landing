<script setup lang="ts">
defineProps<{ stats: [value: string, label: string][] }>()
</script>

<template>
  <div class="strip">
    <dl class="wrap strip__in">
      <div v-for="[v, l] in stats" :key="l" class="stat">
        <dt class="sr-only">{{ l }}</dt>
        <dd><b class="num" v-html="v" /><span aria-hidden="true">{{ l }}</span></dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.strip { position: relative; z-index: 2; border-top: 1px solid var(--tm-sys-color-outline); background: rgba(11, 15, 13, .6); }
.strip__in {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--tm-sys-space-5) var(--tm-sys-space-6);
  padding-top: var(--tm-sys-space-4); padding-bottom: var(--tm-sys-space-4);
  align-items: center; margin-top: 0; margin-bottom: 0;
}
.stat { min-width: 0; }
dd { margin: 0; }
.stat b {
  display: block; font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-stat-axes);
  font-size: 26px; line-height: 1; letter-spacing: -.02em;
}
.stat span { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
</style>
