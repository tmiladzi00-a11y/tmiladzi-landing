<script setup lang="ts">
import type { ProcessStep } from '~/content/types'
withDefaults(defineProps<{ steps: ProcessStep[]; offset?: number }>(), { offset: 0 })
</script>

<template>
  <ol class="process">
    <ProcessItem
      v-for="(s, i) in steps"
      :key="s[0]"
      :n="String(i + 1 + offset).padStart(2, '0')"
      :title="s[0]"
      :first="i === 0"
    >{{ s[1] }}</ProcessItem>
  </ol>
</template>

<style scoped>
.process { list-style: none; padding: 0; margin: 0; }
</style>
