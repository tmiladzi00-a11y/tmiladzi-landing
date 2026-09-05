<script setup lang="ts">
/* The one orchestrated moment on the site: eyebrow, title, lede and
   actions arrive in sequence on first load. Nothing else on the page
   animates on scroll. */
const showreelNote = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function playReel() {
  showreelNote.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { showreelNote.value = false }, 2600)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__bg" aria-hidden="true" />
    <div class="hero__scrim" aria-hidden="true" />

    <div class="reel-slot">
      <div class="mono reel-slot__meta">
        Showreel 2026<br><span class="reel-slot__dim">2 min 40 s · 4K</span>
      </div>
      <button class="reel-slot__btn" type="button" aria-label="Play the 2026 showreel" @click="playReel">
        <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true"><path d="M1 1l14 8-14 8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
      </button>
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
          <BaseButton to="/work">See the work</BaseButton>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="showreelNote" class="mono toast" role="status">Showreel embed slot — drop the YouTube or Vimeo ID here.</div>
    </Transition>
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
.hero__bg::after {
  content: ""; position: absolute; inset: 0; opacity: .42; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n2'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/></filter><rect width='200' height='200' filter='url(%23n2)' opacity='.5'/></svg>");
}
.hero__scrim {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(to top, rgba(11, 15, 13, .94) 0%, rgba(11, 15, 13, .55) 45%, rgba(11, 15, 13, .25) 100%);
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
.reel-slot__dim { color: var(--tm-sys-color-on-surface-faint); }
.reel-slot__btn {
  width: 62px; height: 62px; border-radius: 50%; border: 1px solid var(--tm-sys-color-primary);
  background: color-mix(in srgb, var(--tm-sys-color-primary) 12%, transparent);
  color: var(--tm-sys-color-primary-hover); display: grid; place-items: center; cursor: pointer;
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard),
              transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.reel-slot__btn:hover { background: color-mix(in srgb, var(--tm-sys-color-primary) 28%, transparent); transform: scale(1.05); }

.toast {
  position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 99;
  background: var(--tm-sys-elevation-3-bg); border: 1px solid var(--tm-sys-color-primary-container);
  padding: 12px 18px; border-radius: var(--tm-sys-shape-corner); color: var(--tm-sys-color-on-surface);
  white-space: nowrap; max-width: calc(100vw - 32px); white-space: normal; text-align: center;
}
.toast-enter-active, .toast-leave-active { transition: opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 6px); }
</style>
