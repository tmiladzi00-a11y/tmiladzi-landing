<script setup lang="ts">
/* One button, three variants, one size step. Renders a NuxtLink for
   internal routes, an anchor for external hrefs, a <button> otherwise. */
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'copper' | 'ghost'
  size?: 'md' | 'sm'
  to?: string
  href?: string
  type?: 'button' | 'submit'
  arrow?: boolean
  disabled?: boolean
  external?: boolean
}>(), { variant: 'ghost', size: 'md', type: 'button' })

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))
</script>

<template>
  <component
    :is="tag"
    class="btn"
    :class="[`btn--${variant}`, { 'btn--sm': size === 'sm' }]"
    :to="to"
    :href="href"
    :type="!to && !href ? type : undefined"
    :disabled="!to && !href ? disabled : undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
  >
    <slot />
    <span v-if="arrow" class="btn__arrow" aria-hidden="true">→</span>
  </component>
</template>

<style scoped>
.btn {
  /* component tokens */
  --_bg: transparent;
  --_fg: var(--tm-sys-color-on-surface);
  --_line: var(--tm-sys-color-outline);
  --_bg-hover: var(--_bg);
  --_fg-hover: var(--_fg);
  --_line-hover: var(--_line);
  --_layer: var(--tm-sys-color-on-surface);

  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size);
  letter-spacing: .12em; text-transform: uppercase;
  padding: 13px 20px; min-height: var(--tm-sys-density-control-h);
  border-radius: var(--tm-sys-shape-corner); text-decoration: none; cursor: pointer;
  border: 1px solid var(--_line); color: var(--_fg);
  /* a <button> otherwise picks up the UA's light buttonface fill and
     renders pale text on pale grey */
  background: var(--_bg); -webkit-appearance: none; appearance: none;
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
  white-space: nowrap;
}
.btn:hover { background: var(--_bg-hover); border-color: var(--_line-hover); color: var(--_fg-hover); }
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }

/* filled accents swap to their hover role; ghost uses a state layer */
.btn--primary {
  --_bg: var(--tm-sys-color-primary); --_fg: var(--tm-sys-color-on-primary); --_line: var(--tm-sys-color-primary);
  --_bg-hover: var(--tm-sys-color-primary-hover); --_line-hover: var(--tm-sys-color-primary-hover);
  font-weight: 500;
}
.btn--copper {
  --_bg: var(--tm-sys-color-secondary); --_fg: var(--tm-sys-color-on-secondary); --_line: var(--tm-sys-color-secondary);
  --_bg-hover: var(--tm-sys-color-secondary-hover); --_line-hover: var(--tm-sys-color-secondary-hover);
  font-weight: 500;
}
.btn--ghost {
  --_line-hover: var(--tm-sys-color-primary); --_fg-hover: var(--tm-sys-color-primary-hover);
  --_bg-hover: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent);
}
.btn--sm { padding: 9px 14px; font-size: var(--tm-sys-type-data-size-sm); min-height: 38px; }
.btn__arrow { transition: transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.btn:hover .btn__arrow { transform: translateX(3px); }
</style>
