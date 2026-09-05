<script setup lang="ts">
/* A checkbox with its full-sentence label, bordered so the act of ticking
   is visible. `bad` shows the error border. `quiet` is the optional variant. */
withDefaults(defineProps<{ id: string; modelValue: boolean; bad?: boolean; quiet?: boolean; tone?: 'mal' | 'cop' }>(), { tone: 'cop' })
defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>

<template>
  <div class="accept" :class="[`accept--${tone}`, { bad, 'accept--quiet': quiet }]">
    <input :id="id" type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)">
    <label :for="id"><slot /></label>
  </div>
</template>

<style scoped>
.accept {
  --_accent: var(--tm-sys-color-secondary);
  --_link: var(--tm-sys-color-secondary-hover);
  --_link-line: var(--tm-sys-color-secondary-container);
  display: grid; grid-template-columns: auto 1fr; gap: var(--tm-sys-space-3); align-items: start;
  padding: var(--tm-sys-space-4); border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner);
  background: var(--tm-sys-elevation-2-bg); margin-top: var(--tm-sys-space-2);
  transition: border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.accept--mal { --_accent: var(--tm-sys-color-primary); --_link: var(--tm-sys-color-primary-hover); --_link-line: var(--tm-sys-color-primary-container); }
.accept--quiet { border-color: var(--tm-sys-color-outline-variant); background: transparent; }
.accept.bad { border-color: var(--tm-sys-color-error); }
input[type=checkbox] { width: 20px; height: 20px; margin: 2px 0 0; accent-color: var(--_accent); cursor: pointer; flex: none; }
label { font-size: 14.5px; color: var(--tm-sys-color-on-surface-variant); line-height: 1.6; cursor: pointer; }
label :deep(a) { color: var(--_link); border-bottom: 1px solid var(--_link-line); text-decoration: none; }
label :deep(a:hover) { border-bottom-color: var(--_link); }
label :deep(strong) { color: var(--tm-sys-color-on-surface); }
</style>
