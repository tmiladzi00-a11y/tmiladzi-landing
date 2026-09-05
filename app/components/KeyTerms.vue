<script setup lang="ts">
/* The clauses that cost money, pulled forward so nobody can say they were
   buried. Copper-bordered because it sits in the private-client lane. */
defineProps<{ title: string }>()
</script>

<template>
  <div class="keyterms">
    <h3 class="h4 keyterms__h">{{ title }}</h3>
    <ul class="keyterms__list"><slot /></ul>
    <div v-if="$slots.action" class="mt-4"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.keyterms {
  border: 1px solid var(--tm-sys-color-secondary-container); background: var(--tm-sys-color-secondary-tint);
  border-radius: var(--tm-sys-shape-corner); padding: var(--tm-sys-space-5); margin-top: var(--tm-sys-space-5);
}
.keyterms__h { margin: 0 0 var(--tm-sys-space-3); }
.keyterms__list { list-style: none; padding: 0; margin: 0; display: grid; gap: 9px; }
.keyterms__list :deep(li) { position: relative; padding-left: 18px; font-size: 14.5px; color: var(--tm-sys-color-on-surface-variant); line-height: 1.55; }
.keyterms__list :deep(li)::before { content: ""; position: absolute; left: 0; top: .6em; width: 8px; height: 1px; background: var(--tm-sys-color-secondary); }
.keyterms__list :deep(strong) { color: var(--tm-sys-color-on-surface); }
</style>
