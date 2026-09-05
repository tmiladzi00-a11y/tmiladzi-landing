<script setup lang="ts">
/* Small data-face text: metadata, captions, frame slugs. */
withDefaults(defineProps<{ tag?: 'span' | 'p' | 'div' | 'dt' | 'dd' }>(), { tag: 'span' })
</script>

<template>
  <component :is="tag" class="mono"><slot /></component>
</template>
