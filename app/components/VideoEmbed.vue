<script setup lang="ts">
/* A poster plate that becomes the player on click. Nothing from YouTube or
   Vimeo loads until someone asks for it, so the page stays fast. */
const props = defineProps<{ embed?: string; title: string; sub?: string; tag?: string; pa: string; pb: string; ratio?: '16-9' | '21-9'; sizes?: string }>()
const playing = ref(false)
const src = computed(() => {
  const e = props.embed?.trim()
  if (!e) return ''
  const yt = e.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/) || (/^[\w-]{11}$/.test(e) ? [e, e] : null)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1`
  const vm = e.match(/vimeo\.com\/(?:video\/)?(\d+)/) || (/^\d{6,}$/.test(e) ? [e, e] : null)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&dnt=1`
  return e
})
</script>

<template>
  <div class="vid" :class="`vid--${ratio || '16-9'}`">
    <iframe v-if="playing && src" class="vid__frame" :src="src" :title="title" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" />
    <button v-else-if="src" type="button" class="vid__poster" :aria-label="`Play ${title}`" @click="playing = true">
      <PlateFrame :ratio="ratio || '16-9'" :pa="pa" :pb="pb" :tag="tag" :title="title" :sub="sub" :sizes="sizes" lift />
      <span class="vid__play" aria-hidden="true"><svg width="18" height="20" viewBox="0 0 16 18"><path d="M1 1l14 8-14 8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg></span>
    </button>
    <PlateFrame v-else :ratio="ratio || '16-9'" :pa="pa" :pb="pb" :tag="tag" :title="title" :sub="sub" :sizes="sizes" />
  </div>
</template>

<style scoped>
.vid { position: relative; }
.vid__frame { display: block; width: 100%; aspect-ratio: 16 / 9; border: 1px solid var(--tm-sys-color-outline-variant); background: var(--tm-sys-elevation-2-bg); }
.vid--21-9 .vid__frame { aspect-ratio: 21 / 9; }
.vid__poster { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; text-align: left; color: inherit; position: relative; }
.vid__play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 72px; height: 72px; border-radius: 50%; border: 1px solid var(--tm-sys-color-primary); background: color-mix(in srgb, var(--tm-sys-color-primary) 14%, rgba(11, 15, 13, .5)); color: var(--tm-sys-color-primary-hover); display: grid; place-items: center; transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.vid__poster:hover .vid__play { background: color-mix(in srgb, var(--tm-sys-color-primary) 30%, rgba(11, 15, 13, .5)); transform: translate(-50%, -50%) scale(1.05); }
</style>
