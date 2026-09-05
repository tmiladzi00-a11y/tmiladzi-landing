<script setup lang="ts">
/* Label above, control, error below. The control is a slot so the field
   stays one component for input, select and textarea alike. */
withDefaults(defineProps<{
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
}>(), {})
</script>

<template>
  <div class="field" :class="{ 'field--bad': error }">
    <label :for="id">{{ label }}<span v-if="required" class="field__req" aria-hidden="true"> *</span></label>
    <slot :aria="{ 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined }" />
    <p v-if="hint && !error" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-err`" class="err field__err">{{ error }}</p>
  </div>
</template>

<style scoped>
.field { display: grid; gap: 6px; }
label { font-family: var(--tm-sys-type-data-family); font-size: 10.5px; letter-spacing: var(--tm-sys-type-label-track); text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); }
.field__req { color: var(--tm-sys-color-secondary-hover); }
.field :deep(input), .field :deep(select), .field :deep(textarea) {
  width: 100%; background: var(--tm-sys-color-surface); border: 1px solid var(--tm-sys-color-outline);
  border-radius: var(--tm-sys-shape-corner); padding: 12px 13px; min-height: var(--tm-sys-density-control-h);
  color: var(--tm-sys-color-on-surface); font-family: var(--tm-sys-type-body-family); font-size: 16px;
  transition: border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.field :deep(input::placeholder), .field :deep(textarea::placeholder) { color: var(--tm-sys-color-on-surface-faint); opacity: 1; }
.field :deep(textarea) { min-height: 120px; resize: vertical; line-height: 1.55; }
.field :deep(input:focus), .field :deep(select:focus), .field :deep(textarea:focus) { border-color: var(--tm-sys-color-primary); outline: none; }
.field :deep(select) {
  font-family: var(--tm-sys-type-data-family); font-size: 13px; appearance: none; -webkit-appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--tm-sys-color-on-surface-faint) 50%), linear-gradient(135deg, var(--tm-sys-color-on-surface-faint) 50%, transparent 50%);
  background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%;
  background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; padding-right: 38px;
}
.field--bad :deep(input), .field--bad :deep(select), .field--bad :deep(textarea) { border-color: var(--tm-sys-color-error); }
.field__hint { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); color: var(--tm-sys-color-on-surface-faint); margin: 0; line-height: 1.6; }
.field__err { margin-top: 0; }
</style>
