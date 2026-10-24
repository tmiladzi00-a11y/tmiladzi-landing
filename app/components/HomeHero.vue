<script setup lang="ts">
import { SITE } from '~/content/site'

/* The one orchestrated moment on the site: eyebrow, title, lede and
   actions arrive in sequence on first load. Nothing else on the page
   animates on scroll. */

/* Background film: 30 seconds of the Barloworld golf day, muted and looping.
   It starts only after the page has rendered; reduced motion, Save-Data or a
   slow connection keep the still poster (the visitor can still press play).
   It pauses while scrolled out of view, and the button pauses it for good:
   looping motion longer than five seconds needs a way to stop it (WCAG 2.2.2).

   Four encodes, chosen by VMAF against the source (October 2026): AV1 where
   the browser decodes it smoothly, H.264 everywhere else; 1080p from 900px
   up, 720p below. Desktop AV1 8.6MB (VMAF 90), H.264 9.0MB (84); phone AV1
   3.7MB (phone VMAF 93), H.264 4.2MB (88). Lightly denoised before encoding:
   sensor noise and grass shimmer were costing bits without reading as detail. */
const FILM = {
  poster: '/hero/golf-day-poster.webp',
  av1: { wide: '/hero/golf-day-1080.av1.mp4', narrow: '/hero/golf-day-720.av1.mp4' },
  h264: { wide: '/hero/golf-day-1080.h264.mp4', narrow: '/hero/golf-day-720.h264.mp4' },
}
const AV1 = 'video/mp4; codecs="av01.0.08M.08"'
const film = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
let stopped = false
let visible = true
let observer: IntersectionObserver | undefined
let source: Promise<void> | undefined

/* canPlayType alone says yes to AV1 a slow phone would decode in software and
   stutter; mediaCapabilities knows whether it will be smooth */
async function smoothAv1(el: HTMLVideoElement, wide: boolean): Promise<boolean> {
  if (!el.canPlayType(AV1)) return false
  if (!navigator.mediaCapabilities) return true
  try {
    const r = await navigator.mediaCapabilities.decodingInfo({
      type: 'file',
      video: { contentType: AV1, width: wide ? 1920 : 1280, height: wide ? 1080 : 720, bitrate: wide ? 2_400_000 : 1_000_000, framerate: 30 },
    })
    return r.supported && r.smooth
  } catch {
    return true
  }
}
async function startFilm() {
  const el = film.value
  if (!el) return
  source ??= (async () => {
    const wide = innerWidth >= 900
    const set = (await smoothAv1(el, wide)) ? FILM.av1 : FILM.h264
    el.src = wide ? set.wide : set.narrow
  })()
  await source
  // the visitor may have paused, or scrolled away, while the source was chosen
  if (stopped || !visible) return
  el.play().catch(() => {}) // autoplay refused: the poster stays
}
function toggleFilm() {
  stopped = playing.value
  if (stopped) film.value?.pause()
  else startFilm()
}
onMounted(() => {
  const el = film.value
  if (!el) return
  el.muted = true // as a property, before play(), or browsers refuse to autoplay
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  const lean = !!conn?.saveData || /2g|3g/.test(conn?.effectiveType ?? '')
  stopped = lean || matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!stopped) startFilm()
  observer = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting
    if (!visible) el.pause()
    else if (!stopped) startFilm()
  })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__bg" aria-hidden="true">
      <video
        ref="film" class="hero__film" :poster="FILM.poster" muted loop playsinline preload="none"
        disablepictureinpicture disableremoteplayback
        @playing="playing = true" @pause="playing = false"
      />
    </div>
    <div class="hero__scrim" aria-hidden="true" />
    <button class="mono hero__filmbtn" type="button" :aria-pressed="!playing" @click="toggleFilm">
      <svg v-if="playing" width="10" height="12" viewBox="0 0 10 12" aria-hidden="true"><path d="M1.5 1v10M8.5 1v10" stroke="currentColor" stroke-width="1.6" /></svg>
      <svg v-else width="10" height="12" viewBox="0 0 10 12" aria-hidden="true"><path d="M1 1l8 5-8 5z" fill="currentColor" /></svg>
      {{ playing ? 'Pause' : 'Play' }}<span class="sr-only"> background video</span>
    </button>

    <!-- appears once SITE.showreel holds the published reel's YouTube or Vimeo link -->
    <div v-if="SITE.showreel" class="reel-slot">
      <div class="mono reel-slot__meta">Showreel</div>
      <a class="reel-slot__btn" :href="SITE.showreel" target="_blank" rel="noopener" aria-label="Watch the showreel (opens in a new tab)">
        <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true"><path d="M1 1l14 8-14 8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
      </a>
    </div>

    <div class="hero__in">
      <div class="wrap">
        <Eyebrow class="hero__step hero__step--1">Visual storytelling · Kitwe, Copperbelt · Since 2018</Eyebrow>
        <h1 id="hero-title" class="display h1 hero__title hero__step hero__step--2">We film the work that <em>actually</em> changes something.</h1>
        <p class="lede hero__lede hero__step hero__step--3">
          Tmiladzi Media is a Zambian photography, film and documentary studio built for
          organisations that have to prove their impact — mines, development partners,
          banks, agribusiness and the institutions behind them.
        </p>
        <div class="row hero__step hero__step--4">
          <BaseButton variant="primary" to="/brief" arrow>Start a project brief</BaseButton>
          <BaseButton to="/capabilities">Capabilities</BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative; min-height: min(92dvh, 860px); display: flex; align-items: flex-end;
  border-bottom: 1px solid var(--tm-sys-color-outline-variant); overflow: hidden;
}
.hero__bg { position: absolute; inset: 0; z-index: 0; }
.hero__bg::before {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(90% 70% at 22% 18%, #1F6B4E 0%, transparent 58%),
    radial-gradient(80% 80% at 88% 82%, #6A3A1C 0%, transparent 55%),
    linear-gradient(170deg, #0A100E 0%, #101815 55%, #0B0F0D 100%);
}
.hero__film { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero__filmbtn {
  position: absolute; z-index: 3; top: var(--tm-sys-space-5); right: var(--tm-sys-space-5);
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; min-height: 36px; cursor: pointer;
  font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .14em; text-transform: uppercase;
  color: var(--tm-sys-color-on-surface); background: rgba(11, 15, 13, .55);
  border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  transition: border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.hero__filmbtn:hover { border-color: var(--tm-sys-color-primary); }
.hero__filmbtn:focus-visible { outline: 2px solid var(--tm-sys-color-focus); outline-offset: 2px; }
.hero__bg::after {
  content: ""; position: absolute; inset: 0; opacity: .42; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n2'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/></filter><rect width='200' height='200' filter='url(%23n2)' opacity='.5'/></svg>");
}
.hero__scrim {
  position: absolute; inset: 0; z-index: 1;
  /* bright daylight footage: shade the side the words sit on, leave the far side to the film */
  background:
    linear-gradient(90deg, rgba(11, 15, 13, .86) 0%, rgba(11, 15, 13, .6) 42%, rgba(11, 15, 13, .12) 78%, rgba(11, 15, 13, 0) 100%),
    linear-gradient(to top, rgba(11, 15, 13, .94) 0%, rgba(11, 15, 13, .5) 45%, rgba(11, 15, 13, .3) 100%);
}
.hero__in { position: relative; z-index: 2; width: 100%; padding: var(--tm-sys-space-9) 0 var(--tm-sys-space-7); }
.hero__title { max-width: 16ch; }
.hero__title em { font-style: normal; color: var(--tm-sys-color-primary-hover); }
.hero__lede { margin-top: var(--tm-sys-space-5); margin-bottom: 0; }

/* entrance: one sequence, once */
.hero__step { animation: enter var(--tm-sys-motion-duration-long-1) var(--tm-sys-motion-easing-emphasized) both; }
.hero__step--1 { animation-delay: 60ms; }
.hero__step--2 { animation-delay: 160ms; }
.hero__step--3 { animation-delay: 300ms; }
.hero__step--4 { animation-delay: 420ms; }
@keyframes enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .hero__step { animation: none; } }

.reel-slot { position: absolute; z-index: 2; right: var(--tm-sys-space-7); bottom: var(--tm-sys-space-8); display: none; align-items: center; gap: 14px; }
@media (min-width: 1000px) { .reel-slot { display: flex; } }
.reel-slot__meta { text-align: right; line-height: 1.5; }
.reel-slot__btn {
  width: 62px; height: 62px; border-radius: 50%; border: 1px solid var(--tm-sys-color-primary);
  background: color-mix(in srgb, var(--tm-sys-color-primary) 12%, transparent);
  color: var(--tm-sys-color-primary-hover); display: grid; place-items: center; cursor: pointer;
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.reel-slot__btn:hover { background: color-mix(in srgb, var(--tm-sys-color-primary) 28%, transparent); transform: scale(1.05); }

</style>
