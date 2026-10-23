<script setup lang="ts">
import type { Addon } from '~/content/types'
import { fmtMoney } from '~/utils/money'
defineProps<{ addons: Addon[]; qty: (id: string) => number }>()
const emit = defineEmits<{ bump: [id: string, delta: number] }>()
/* remember which way each counter last moved so the digit rolls that way */
const lastDir = reactive<Record<string, number>>({})
function bump(id: string, delta: number) { lastDir[id] = delta >= 0 ? 1 : -1; emit('bump', id, delta) }
</script>

<template>
  <ul class="addons" data-density="compact">
    <li v-for="a in addons" :key="a.id" class="addon" :class="{ on: qty(a.id) > 0 }">
      <div>
        <h3 class="h4 h4--tight" :id="`addon-${a.id}`">{{ a.name }}</h3>
        <p class="addon__d">{{ a.d }}</p>
        <span v-if="a.price == null" class="mono cop-hi">Quoted separately</span>
        <span v-else class="mono fg">K{{ fmtMoney(a.price) }}<template v-if="a.unit"> / {{ a.unit }}</template></span>
      </div>
      <div class="addon__ctrl">
        <div v-if="a.type === 'qty'" class="stepper" role="group" :aria-labelledby="`addon-${a.id}`">
          <button type="button" class="stepbtn" :aria-label="`Fewer ${a.name}`" :disabled="qty(a.id) <= 0" @click="bump(a.id, -1)">−</button>
          <span class="stepval num" aria-live="polite"><Transition :name="(lastDir[a.id] ?? 1) > 0 ? 'odo-up' : 'odo-down'" mode="out-in"><span :key="qty(a.id)" class="stepval__d">{{ qty(a.id) }}</span></Transition></span>
          <button type="button" class="stepbtn" :aria-label="`More ${a.name}`" :disabled="qty(a.id) >= (a.max ?? Infinity)" @click="bump(a.id, 1)">+</button>
        </div>
        <button v-else type="button" class="addtoggle" :aria-pressed="qty(a.id) > 0" :aria-describedby="`addon-${a.id}`" @click="bump(a.id, 0)">{{ qty(a.id) ? 'Added' : 'Add' }}</button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.addons { list-style: none; padding: 0; margin: var(--tm-sys-space-5) 0 0; }
.addon {
  --_line: var(--tm-sys-elevation-2-line); --_bg: var(--tm-sys-elevation-2-bg);
  display: grid; grid-template-columns: 1fr auto; gap: var(--tm-sys-space-4); align-items: center;
  padding: var(--tm-sys-space-4); border: 1px solid var(--_line); border-radius: var(--tm-sys-shape-corner);
  background: var(--_bg); margin-bottom: var(--tm-sys-space-3);
  transition: border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.addon.on { --_line: var(--tm-sys-color-secondary); --_bg: var(--tm-sys-elevation-3-bg); }
.addon__d { font-size: 14px; color: var(--tm-sys-color-on-surface-variant); margin: 5px 0 8px; }
.addon__ctrl { flex: none; }
.stepper { display: flex; align-items: center; gap: 2px; border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); }
.stepbtn {
  --_layer: var(--tm-sys-color-on-surface);
  width: var(--tm-sys-density-control-h); height: var(--tm-sys-density-control-h); background: none; border: 0; cursor: pointer;
  color: var(--tm-sys-color-on-surface); font-size: 17px; line-height: 1;
  transition: background var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-standard), color var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-standard);
}
.stepbtn:hover:not(:disabled) { background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); color: var(--tm-sys-color-secondary-hover); }
.stepbtn:active:not(:disabled) { background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-pressed), transparent); }
.stepbtn:disabled { opacity: .28; cursor: not-allowed; }
.stepval {
  min-width: 34px; text-align: center; font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-lg);
  border-left: 1px solid var(--tm-sys-color-outline); border-right: 1px solid var(--tm-sys-color-outline);
  height: var(--tm-sys-density-control-h); line-height: var(--tm-sys-density-control-h);
  overflow: hidden; display: grid; place-items: center;
}
.stepval__d { display: block; }
/* the digit rolls like an odometer, in the direction it changed */
.odo-up-enter-active, .odo-down-enter-active, .odo-up-leave-active, .odo-down-leave-active { transition: transform var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-standard), opacity var(--tm-sys-motion-duration-short-1) var(--tm-sys-motion-easing-standard); }
.odo-up-enter-from { transform: translateY(10px); opacity: 0; }
.odo-up-leave-to { transform: translateY(-10px); opacity: 0; }
.odo-down-enter-from { transform: translateY(-10px); opacity: 0; }
.odo-down-leave-to { transform: translateY(10px); opacity: 0; }
.addtoggle {
  --_layer: var(--tm-sys-color-on-surface);
  font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-sm); letter-spacing: .12em; text-transform: uppercase;
  padding: 11px 18px; min-height: var(--tm-sys-density-control-h); border: 1px solid var(--tm-sys-color-outline); background: none; border-radius: var(--tm-sys-shape-corner);
  cursor: pointer; color: var(--tm-sys-color-on-surface-variant);
  transition: background var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), border-color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), color var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard);
}
.addtoggle:hover { border-color: var(--tm-sys-color-secondary); color: var(--tm-sys-color-secondary-hover); background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover), transparent); }
.addtoggle[aria-pressed="true"] { background: var(--tm-sys-color-secondary); border-color: var(--tm-sys-color-secondary); color: var(--tm-sys-color-on-secondary); font-weight: 500; }
@media (max-width: 520px) { .addon { grid-template-columns: 1fr; gap: var(--tm-sys-space-3); } .addon__ctrl { justify-self: start; } }
</style>
