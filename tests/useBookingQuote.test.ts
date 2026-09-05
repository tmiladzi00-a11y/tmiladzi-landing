import { describe, it, expect } from 'vitest'
import { SERVICES, findService } from '~/content/services'
import {
  lineItems, totals, deliveryValue, deliveryText, nextQuantity, unitLabel, formatTotal, formatDeposit,
} from '~/composables/useBookingQuote'
import { fmtMoney } from '~/utils/money'

const wedding = findService('wedding')!
const events = findService('events')!
const sessions = findService('sessions')!

describe('the numbers the prototype documents', () => {
  it('ships three live services with 50% deposits', () => {
    expect(SERVICES).toHaveLength(3)
    for (const s of SERVICES) expect(s.dep).toBe(0.5)
  })
  it('prices additional time so the wedding hour costs more than the short-job hour', () => {
    // "On a wedding the extra hour is the worst hour of the day" -> K1,500.
    // "the second hour is genuinely cheaper to give than the first" -> K1,250.
    const w = wedding.addons.find((a) => a.id === 'time')!
    const e = events.addons.find((a) => a.id === 'time')!
    const s = sessions.addons.find((a) => a.id === 'time')!
    expect(w.price).toBe(1500)
    expect(e.price).toBe(1250)
    expect(s.price).toBe(1250)
    expect(s.price!).toBeLessThan(sessions.price!)
    // All three sit below the K2,500/hr corporate overtime rate.
    for (const p of [w.price!, e.price!, s.price!]) expect(p).toBeLessThan(2500)
  })
})

describe('line items', () => {
  it('starts with the service and its coverage', () => {
    expect(lineItems(wedding, {})).toEqual([{ label: 'Weddings · 10 hours', amount: 7000 }])
  })
  it('ignores zero quantities', () => {
    expect(lineItems(wedding, { time: 0, prewed: 0 })).toHaveLength(1)
  })
  it('multiplies qty add-ons and labels them with the unit', () => {
    const items = lineItems(wedding, { time: 2 })
    expect(items[1]).toEqual({ label: 'Additional time × 2 hours', amount: 3000, tbc: false })
  })
  it('keeps "each" invariant and pluralises count nouns only above 1', () => {
    expect(unitLabel('each', 3)).toBe(' each')
    expect(unitLabel('hour', 1)).toBe(' hour')
    expect(unitLabel('hour', 2)).toBe(' hours')
    expect(unitLabel('', 4)).toBe('')
    const items = lineItems(wedding, { second: 2 })
    expect(items[1]!.label).toBe('Extra photographer × 2 each')
  })
  it('does not append a quantity to toggles', () => {
    const items = lineItems(wedding, { prewed: 1 })
    expect(items[1]).toEqual({ label: 'Pre-wedding photoshoot', amount: 2500, tbc: false })
  })
})

describe('totals and deposit', () => {
  it('sums the service and add-ons', () => {
    const t = totals(sessions, { photo: 10, raws: 1 })
    expect(t.total).toBe(2000 + 800 + 1500)
    expect(t.tbc).toBe(false)
  })
  it('deposit is round(subtotal × dep)', () => {
    const t = totals(events, { time: 1 })
    expect(t.total).toBe(5250)
    expect(t.deposit).toBe(2625)
    expect(t.depositPct).toBe(50)
  })
  it('rounds the deposit rather than truncating', () => {
    const svc = { ...sessions, dep: 0.33 }
    const t = totals(svc, {})
    expect(t.deposit).toBe(Math.round(2000 * 0.33))
  })
  it('a null-priced add-on poisons the total to TBC instead of summing as zero', () => {
    const t = totals(wedding, { highlight: 1 })
    expect(t.tbc).toBe(true)
    expect(t.total).toBe(7000)
    expect(formatTotal(t, wedding)).toBe('K7,000 +')
  })
  it('a null-priced service shows on request and no deposit', () => {
    const svc = { ...sessions, price: null }
    const t = totals(svc, { photo: 5 })
    expect(t.tbc).toBe(true)
    expect(formatTotal(t, svc)).toBe('On request')
    expect(formatDeposit(t, svc)).toBe('—')
  })
  it('formats money as en-ZM with grouping', () => {
    expect(fmtMoney(7000)).toBe('7,000')
    expect(fmtMoney(34250)).toBe('34,250')
    expect(formatDeposit(totals(wedding, {}), wedding)).toBe('K3,500  (50%)')
  })
  it('returns empty numbers with no service', () => {
    expect(totals(null, {})).toEqual({ items: [], total: 0, tbc: false, deposit: 0, depositPct: 0 })
    expect(formatTotal(totals(null, {}), null)).toBe('—')
  })
})

describe('delivery clock', () => {
  it('weddings sell express in weeks off six weeks', () => {
    expect(deliveryValue(wedding, {})).toBe(6)
    expect(deliveryValue(wedding, { express: 2 })).toBe(4)
    expect(deliveryText(wedding, { express: 2 })).toBe('4 weeks')
  })
  it('never reaches zero: floor is one week', () => {
    expect(deliveryValue(wedding, { express: 3 })).toBe(3)
    expect(deliveryValue(wedding, { express: 9 })).toBe(1)
    expect(deliveryText(wedding, { express: 9 })).toBe('1 week')
  })
  it('short services sell express in 24-hour blocks off 48 hours', () => {
    expect(deliveryValue(sessions, {})).toBe(48)
    expect(deliveryValue(sessions, { express: 1 })).toBe(24)
    expect(deliveryText(events, { express: 1 })).toBe('24 hours')
  })
  it('never reaches zero: floor is 24 hours', () => {
    expect(deliveryValue(sessions, { express: 5 })).toBe(24)
  })
  it('only delivery-affecting add-ons move the clock', () => {
    expect(deliveryValue(wedding, { time: 3, second: 1 })).toBe(6)
  })
  it('reads as a dash with no service', () => {
    expect(deliveryText(null, {})).toBe('—')
  })
})

describe('quantity rules', () => {
  const time = wedding.addons.find((a) => a.id === 'time')!
  const prewed = wedding.addons.find((a) => a.id === 'prewed')!
  it('steppers clamp to [0, max]', () => {
    expect(nextQuantity(time, 0, -1)).toBe(0)
    expect(nextQuantity(time, 6, 1)).toBe(6)
    expect(nextQuantity(time, 2, 1)).toBe(3)
  })
  it('toggles flip regardless of delta', () => {
    expect(nextQuantity(prewed, 0, 0)).toBe(1)
    expect(nextQuantity(prewed, 1, 0)).toBe(0)
    expect(nextQuantity(prewed, 1, 1)).toBe(0)
  })
})
