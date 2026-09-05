<script setup lang="ts">
import type { Capability } from '~/content/types'
defineProps<{ cap: Capability }>()
</script>

<template>
  <SurfaceCard :k="cap.k" tag="li">
    <h3 class="h4">{{ cap.t }}</h3>
    <p>{{ cap.d }}</p>
  </SurfaceCard>
</template>
