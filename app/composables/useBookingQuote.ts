import { computed, ref, type Ref } from 'vue'
import type { Addon, Service } from '~/content/types'
import { fmtMoney } from '~/utils/money'

export interface LineItem {
  label: string
  /** null means quoted separately; it poisons the total to TBC. */
  amount: number | null
  tbc?: boolean
}

export interface QuoteTotals {
  items: LineItem[]
  /** Sum of priced lines. Lines with no price are excluded, not zeroed. */
  total: number
  /** True when any line has no price and needs a manual quote. */
  tbc: boolean
  deposit: number
  depositPct: number
}

export type AddonQuantities = Record<string, number>

/* ---------- pure functions: the engine ---------- */

/** "each" is already invariant; only count nouns take the plural. */
export function unitLabel(unit: string, qty: number): string {
  if (!unit) return ''
  return ' ' + unit + (qty > 1 && unit !== 'each' ? 's' : '')
}

export function lineItems(svc: Service | null, add: AddonQuantities): LineItem[] {
  if (!svc) return []
  const out: LineItem[] = []
  if (svc.price != null) out.push({ label: svc.name + ' · ' + svc.cov, amount: svc.price })
  else out.push({ label: svc.name, amount: null, tbc: true })

  for (const a of svc.addons) {
    const q = add[a.id] || 0
    if (!q) continue
    const label = a.name + (a.type === 'qty' ? ' × ' + q + unitLabel(a.unit, q) : '')
    out.push({ label, amount: a.price == null ? null : a.price * q, tbc: a.price == null })
  }
  return out
}

export function totals(svc: Service | null, add: AddonQuantities): QuoteTotals {
  const items = lineItems(svc, add)
  let sum = 0
  let tbc = false
  for (const i of items) {
    if (i.amount == null) tbc = true
    else sum += i.amount
  }
  const deposit = svc ? Math.round(sum * svc.dep) : 0
  return { items, total: sum, tbc, deposit, depositPct: svc ? Math.round(svc.dep * 100) : 0 }
}

/* Delivery is quoted in weeks on a wedding and in hours on the shorter
   services, so express is sold in whatever unit that service's clock runs
   in — weeks off six weeks, a day off forty-eight hours. Each has a floor
   it cannot go below, so no amount of buying reaches zero. */
export const DELIVERY_FLOOR = { weeks: 1, hours: 24 } as const

export function deliveryValue(svc: Service | null, add: AddonQuantities): number | null {
  if (!svc) return null
  let bought = 0
  for (const a of svc.addons) if (a.affects === 'delivery') bought += add[a.id] || 0
  if (svc.deliveryUnit === 'weeks') return Math.max(DELIVERY_FLOOR.weeks, svc.delivery - bought)
  return Math.max(DELIVERY_FLOOR.hours, svc.delivery - bought * 24)
}

export function deliveryText(svc: Service | null, add: AddonQuantities): string {
  if (!svc) return '—'
  const v = deliveryValue(svc, add)!
  if (svc.deliveryUnit === 'weeks') return v + (v === 1 ? ' week' : ' weeks')
  return v + ' hours'
}

/** Clamp a new quantity for an add-on: toggles flip, steppers step within [0, max]. */
export function nextQuantity(a: Addon, current: number, delta: number): number {
  if (a.type === 'toggle') return current ? 0 : 1
  const max = a.max ?? Infinity
  return Math.max(0, Math.min(max, current + delta))
}

export function formatTotal(t: QuoteTotals, svc: Service | null): string {
  if (!svc) return '—'
  // With no base price set, the add-ons alone are not a total — saying
  // "K2,000" when the session fee is still unknown would mislead.
  if (svc.price == null) return 'On request'
  return 'K' + fmtMoney(t.total) + (t.tbc ? ' +' : '')
}

export function formatDeposit(t: QuoteTotals, svc: Service | null): string {
  if (!svc || svc.price == null || !t.total) return '—'
  return 'K' + fmtMoney(t.deposit) + '  (' + t.depositPct + '%)'
}

/* ---------- reactive wrapper for the wizard ---------- */

export function useBookingQuote(service: Ref<Service | null>) {
  const add = ref<AddonQuantities>({})

  const quote = computed(() => totals(service.value, add.value))
  const delivery = computed(() => deliveryText(service.value, add.value))
  const deliveryNumber = computed(() => deliveryValue(service.value, add.value))
  const totalText = computed(() => formatTotal(quote.value, service.value))
  const depositText = computed(() => formatDeposit(quote.value, service.value))

  function bump(id: string, delta: number) {
    const svc = service.value
    if (!svc) return
    const a = svc.addons.find((x) => x.id === id)
    if (!a) return
    add.value = { ...add.value, [id]: nextQuantity(a, add.value[id] || 0, delta) }
  }
  function reset() { add.value = {} }
  function qty(id: string) { return add.value[id] || 0 }

  return { add, quote, delivery, deliveryNumber, totalText, depositText, bump, reset, qty }
}
