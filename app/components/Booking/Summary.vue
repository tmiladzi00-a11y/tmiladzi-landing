<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core'
import type { LineItem } from '~/composables/useBookingQuote'
import { fmtMoney } from '~/utils/money'
const props = defineProps<{
  service: string
  date: string
  time: string
  delivery: string
  items: LineItem[]
  /** Display text when the amount is not a plain number ("—", "On request"). */
  total: string
  deposit: string
  /** Numeric amounts, when they exist, so they can count to their new value. */
  totalValue?: number | null
  depositValue?: number | null
  tbc?: boolean
  depositPct?: number
}>()
/* the number counts to where it is going: feedback for the add-on just changed */
const totalN = computed(() => props.totalValue ?? 0)
const depositN = computed(() => props.depositValue ?? 0)
const opts = { duration: 300, transition: TransitionPresets.easeOutCubic }
const totalAnim = useTransition(totalN, opts)
const depositAnim = useTransition(depositN, opts)
const totalText = computed(() => props.totalValue == null ? props.total : 'K' + fmtMoney(Math.round(totalAnim.value)) + (props.tbc ? ' +' : ''))
const depositText = computed(() => props.depositValue == null ? props.deposit : 'K' + fmtMoney(Math.round(depositAnim.value)) + '  (' + (props.depositPct ?? 0) + '%)')
</script>

<template>
  <div class="summary">
    <span class="card__k">Your booking</span>
    <dl class="summary__dl">
      <div class="sumrow"><dt>Coverage</dt><dd>{{ service }}</dd></div>
      <div class="sumrow"><dt>Date</dt><dd>{{ date }}</dd></div>
      <div class="sumrow"><dt>Time</dt><dd>{{ time }}</dd></div>
      <div class="sumrow"><dt>Delivery</dt><dd>{{ delivery }}</dd></div>
    </dl>
    <TransitionGroup name="line" tag="div" class="sumlines">
      <div v-for="i in items" :key="i.label" class="sumline">
        <span>{{ i.label }}</span><span>{{ i.amount == null ? 'TBQ' : 'K' + fmtMoney(i.amount) }}</span>
      </div>
    </TransitionGroup>
    <div class="sumtotal">
      <span class="mono">Total</span>
      <b class="num sumtotal__b" aria-live="polite">{{ totalText }}</b>
    </div>
    <div class="deposit">
      <div class="mono cop-hi">Deposit to hold the date</div>
      <b class="num">{{ depositText }}</b>
      <div class="mono deposit__note">Balance due on delivery</div>
    </div>
    <p class="note mt-4">
      Prices are in Zambian Kwacha. Work outside the Copperbelt carries a travel
      charge, quoted with your confirmation.
    </p>
  </div>
</template>

<style scoped>
.summary { border: 1px solid var(--tm-sys-color-outline); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-elevation-2-bg); padding: var(--tm-sys-space-5); position: sticky; top: 88px; }
.card__k { font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-xs); letter-spacing: .16em; text-transform: uppercase; color: var(--tm-sys-color-on-surface-faint); display: block; }
.summary__dl { margin: var(--tm-sys-space-3) 0 0; }
.sumrow { display: flex; justify-content: space-between; gap: var(--tm-sys-space-4); padding: 10px 0; border-bottom: 1px solid var(--tm-sys-color-outline-variant); font-family: var(--tm-sys-type-data-family); font-size: var(--tm-sys-type-data-size-md); }
.sumrow:last-of-type { border-bottom: 0; }
.sumrow dt { color: var(--tm-sys-color-on-surface-faint); letter-spacing: .06em; }
.sumrow dd { margin: 0; text-align: right; color: var(--tm-sys-color-on-surface); }
.sumline { display: flex; justify-content: space-between; gap: var(--tm-sys-space-3); font-family: var(--tm-sys-type-data-family); font-size: 11.5px; color: var(--tm-sys-color-on-surface-variant); padding: 7px 0; border-bottom: 1px dotted var(--tm-sys-color-outline-variant); }
.sumline:first-child { margin-top: var(--tm-sys-space-4); border-top: 1px solid var(--tm-sys-color-outline-variant); padding-top: 12px; }
.sumline span:last-child { flex: none; color: var(--tm-sys-color-on-surface); }
/* a line item arriving or leaving is feedback for an add-on the user just changed */
.line-enter-active, .line-leave-active { transition: opacity var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard), transform var(--tm-sys-motion-duration-short-2) var(--tm-sys-motion-easing-standard); }
.line-enter-from, .line-leave-to { opacity: 0; transform: translateX(-4px); }
.sumtotal { display: flex; justify-content: space-between; align-items: baseline; gap: var(--tm-sys-space-4); margin-top: var(--tm-sys-space-4); padding-top: var(--tm-sys-space-4); border-top: 1px solid var(--tm-sys-color-outline); }
.sumtotal__b { font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes); font-size: 24px; letter-spacing: -.02em; }
.deposit { margin-top: var(--tm-sys-space-4); padding: var(--tm-sys-space-4); border: 1px solid var(--tm-sys-color-secondary-container); border-radius: var(--tm-sys-shape-corner); background: var(--tm-sys-color-secondary-tint); }
.deposit b { display: block; font-family: var(--tm-sys-type-display-family); font-variation-settings: var(--tm-sys-type-price-axes); font-size: 22px; color: var(--tm-sys-color-secondary-hover); letter-spacing: -.02em; }
.deposit__note { margin-top: 6px; }
</style>
