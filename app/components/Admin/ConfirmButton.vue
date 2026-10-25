<script setup lang="ts">
/* A button for actions that cannot be taken back (decline, cancel, delete).
   The first press asks, in place, with the consequence spelled out; the second
   does it. Replaces the browser's confirm(), which is easy to click through
   by reflex and cannot say much. Escape or "Keep it" backs out. */
const props = withDefaults(defineProps<{
  label: string
  /** What will happen, in a sentence. */
  question: string
  confirmLabel: string
  size?: 'md' | 'sm'
  disabled?: boolean
}>(), { size: 'md' })
const emit = defineEmits<{ confirm: [] }>()

const armed = ref(false)
const id = useId()
const box = ref<HTMLElement | null>(null)

function arm() {
  armed.value = true
  nextTick(() => box.value?.querySelector<HTMLElement>('.btn')?.focus())
}
function yes() { armed.value = false; emit('confirm') }
function no() { armed.value = false }
</script>

<template>
  <BaseButton v-if="!armed" :size="props.size" :disabled="disabled" class="cb__trigger" @click="arm">{{ label }}</BaseButton>
  <div v-else ref="box" class="cb" role="alertdialog" :aria-labelledby="id" @keydown.esc="no">
    <p :id="id" class="cb__q">{{ question }}</p>
    <div class="cb__btns">
      <BaseButton variant="copper" size="sm" @click="yes">{{ confirmLabel }}</BaseButton>
      <BaseButton size="sm" @click="no">Keep it</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.cb {
  display: grid; gap: var(--tm-sys-space-2); padding: 12px 14px; max-width: 460px;
  border: 1px solid var(--tm-sys-color-secondary-container); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-color-secondary-tint);
}
.cb__q { margin: 0; font-size: 14.5px; line-height: 1.45; color: var(--tm-sys-color-on-surface); }
.cb__btns { display: flex; flex-wrap: wrap; gap: var(--tm-sys-space-2); }
.cb__trigger:hover { --_line-hover: var(--tm-sys-color-error); --_fg-hover: var(--tm-sys-color-error); }
</style>
