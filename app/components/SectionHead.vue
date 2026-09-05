<script setup lang="ts">
/* Eyebrow, headline, optional lede. `wide` removes the 70ch cap for a
   head that shares its row with an action. */
withDefaults(defineProps<{
  eyebrow?: string
  copper?: boolean
  title: string
  id?: string
  level?: 'h1' | 'h2'
  wide?: boolean
}>(), { level: 'h2' })
</script>

<template>
  <div class="sechead" :class="{ 'sechead--wide': wide }">
    <div class="sechead__text">
      <Eyebrow v-if="eyebrow" :copper="copper">{{ eyebrow }}</Eyebrow>
      <component :is="level" :id="id" class="display" :class="level === 'h1' ? 'h1' : 'h2'">{{ title }}</component>
      <p v-if="$slots.default" class="lede sechead__lede"><slot /></p>
    </div>
    <div v-if="$slots.aside" class="sechead__aside"><slot name="aside" /></div>
  </div>
</template>

<style scoped>
.sechead { margin-bottom: var(--tm-sys-space-7); max-width: 70ch; }
.sechead--wide {
  max-width: none; display: flex; justify-content: space-between; align-items: flex-end;
  gap: var(--tm-sys-space-5); flex-wrap: wrap;
}
.sechead--wide .sechead__text { max-width: 56ch; }
.sechead__lede { margin-top: var(--tm-sys-space-4); margin-bottom: 0; }
</style>
