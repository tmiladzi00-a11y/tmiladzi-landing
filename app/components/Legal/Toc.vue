<script setup lang="ts">
const props = defineProps<{ items: [href: string, label: string][]; label: string }>()

/* Scroll-spy: the clause under the reading line is marked in the rail. An
   IntersectionObserver on the headings, no scroll listener. */
const active = ref<string | null>(null)
let io: IntersectionObserver | undefined
onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  const heads = props.items.map(([h]) => document.getElementById(h.slice(1))).filter((e): e is HTMLElement => !!e)
  const visible = new Set<string>()
  io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) visible.add(en.target.id); else visible.delete(en.target.id)
    }
    const first = heads.find((h) => visible.has(h.id))
    if (first) active.value = '#' + first.id
  }, { rootMargin: '-88px 0px -60% 0px', threshold: 0 })
  heads.forEach((h) => io!.observe(h))
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div class="toc-wrap">
    <span class="toc__k">On this page</span>
    <nav class="toc" :aria-label="label">
      <a v-for="[href, text] in items" :key="href" :href="href" :class="{ 'is-active': active === href }" :aria-current="active === href ? 'true' : undefined">{{ text }}</a>
    </nav>
  </div>
</template>

<style scoped>
.toc-wrap {
  border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner);
  background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-5); position: sticky; top: 88px;
}
.toc__k {
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em;
  text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); margin-bottom: var(--tm-sys-space-3); display: block;
}
.toc { display: grid; gap: 2px; margin-top: var(--tm-sys-space-3); max-height: 60vh; overflow: auto; }
.toc a {
  --_layer: var(--tm-sys-color-on-surface);
  font-family: var(--tm-sys-type-data-family); font-size: 11.5px; color: var(--tm-sys-color-on-surface-faint); text-decoration: none;
  padding: 6px 8px; border-radius: var(--tm-sys-shape-corner); border-left: 1px solid transparent;
  transition: color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.toc a:hover { color: var(--tm-sys-color-primary-hover); background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); border-left-color: var(--tm-sys-color-primary); }
.toc a.is-active { color: var(--tm-sys-color-on-surface); border-left-color: var(--tm-sys-color-primary); }
</style>
