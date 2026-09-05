<script setup lang="ts">
withDefaults(defineProps<{
  tight?: boolean
  dark?: boolean
  /** Removes the top padding: for a band that continues a page head. */
  flush?: boolean
  tag?: 'section' | 'div'
  labelledby?: string
}>(), { tag: 'section' })
</script>

<template>
  <component :is="tag" class="band" :class="{ 'band--tight': tight, 'band--dark': dark, 'band--flush': flush }" :aria-labelledby="labelledby">
    <div class="wrap"><slot /></div>
  </component>
</template>

<style scoped>
.band { position: relative; padding: var(--tm-sys-space-9) 0; }
.band--tight { padding: var(--tm-sys-space-8) 0; }
.band--dark { background: var(--tm-sys-elevation-1-bg); }
.band--flush { padding-top: 0; }
.band + .band { border-top: 1px solid var(--tm-sys-color-outline-variant); }
.band--flush + .band, .band + .band--flush { border-top: 0; }
</style>
