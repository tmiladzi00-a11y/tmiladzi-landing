import { describe, it, expect } from 'vitest'
import { SERVICES, SLOTS, DAY_END, BOOKING_DEFAULTS } from '~/content/services'
import { hourlySlots, checkPackage, checkSettings, blankPackage } from '~/utils/catalog'
import { packageFromRow } from '../server/utils/cms'

const record = (i = 0) => ({ ...SERVICES[i]!, published: true, sort: i })

describe('hourlySlots', () => {
  it('reproduces the built-in day', () => {
    expect(hourlySlots(BOOKING_DEFAULTS.dayStart, BOOKING_DEFAULTS.dayEnd)).toEqual([...SLOTS])
    expect(BOOKING_DEFAULTS.dayEnd).toBe(DAY_END)
  })
  it('is empty when the day has no length', () => {
    expect(hourlySlots('09:00', '09:00')).toEqual([])
  })
})

describe('checkPackage', () => {
  it('accepts every built-in service unchanged, so the seed is valid', () => {
    SERVICES.forEach((s, i) => {
      const r = checkPackage(record(i))
      expect(r.ok).toBe(true)
      if (r.ok) expect(r.value).toEqual(record(i))
    })
  })

  it('reads an empty price as "on request" and form strings as numbers', () => {
    const r = checkPackage({ ...record(), price: '', hours: '4', addons: [{ id: 'reel', name: 'Reel', type: 'qty', price: '', max: '' }] })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.price).toBeNull()
    expect(r.value.hours).toBe(4)
    expect(r.value.addons[0]).toEqual({ id: 'reel', name: 'Reel', unit: '', type: 'qty', price: null, d: '' })
  })

  it('drops blank lines from includes and notes', () => {
    const r = checkPackage({ ...record(), includes: ['One', '  ', 'Two '], notes: [''] })
    expect(r.ok && r.value.includes).toEqual(['One', 'Two'])
    expect(r.ok && r.value.notes).toEqual([])
  })

  it('names each bad field, including inside add-ons', () => {
    const r = checkPackage({
      ...blankPackage(), id: 'Bad Id', name: '', price: -5, dep: 2, tier: 'gold',
      addons: [{ id: 'x', name: 'A', type: 'qty', price: 1 }, { id: 'x', name: '', type: 'nope', price: 'ten' }],
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(Object.keys(r.errors).sort()).toEqual(
      ['addons.1.id', 'addons.1.name', 'addons.1.price', 'addons.1.type', 'dep', 'id', 'name', 'price', 'tier'].sort())
  })

  it('ignores max on an on/off add-on', () => {
    const r = checkPackage({ ...record(), addons: [{ id: 'raws', name: 'Raws', type: 'toggle', price: 100, max: 3 }] })
    expect(r.ok && r.value.addons[0]!.max).toBeUndefined()
  })
})

describe('checkSettings', () => {
  it('accepts the defaults', () => {
    expect(checkSettings(BOOKING_DEFAULTS)).toEqual({ ok: true, value: BOOKING_DEFAULTS })
  })
  it('refuses a day that ends before it starts, and empty choice lists', () => {
    const r = checkSettings({ ...BOOKING_DEFAULTS, dayStart: '18:00', dayEnd: '07:00', regions: [' '], heard: [] })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['dayEnd', 'heard', 'regions'])
  })
})

describe('packageFromRow', () => {
  it('maps database rows back to the service the booking engine prices from', () => {
    const p = packageFromRow(
      { id: 'sessions', tier: 'basic', name: 'Photoshoot Sessions', tag: 'Studio', price: 2000, deposit_pct: 50, hours: 1,
        coverage: '1 hour', delivery: 48, delivery_unit: 'hours', live: 1, blurb: '', includes: '["15 edited pictures"]',
        notes: 'not json', sort: 2, published: 0, updated_at: '2026-10-22 10:00:00', updated_by: null },
      [
        { package_id: 'sessions', id: 'express', name: 'Next-day', unit: 'day', type: 'qty', price: 500, max: 1, description: '', affects: 'delivery', sort: 1 },
        { package_id: 'sessions', id: 'raws', name: 'Raws', unit: '', type: 'toggle', price: null, max: null, description: 'All', affects: null, sort: 0 },
        { package_id: 'wedding', id: 'time', name: 'Time', unit: 'hour', type: 'qty', price: 1500, max: null, description: '', affects: null, sort: 0 },
      ],
    )
    expect(p.dep).toBe(0.5)
    expect(p.published).toBe(false)
    expect(p.includes).toEqual(['15 edited pictures'])
    expect(p.notes).toEqual([])
    expect(p.addons.map((a) => a.id)).toEqual(['raws', 'express'])
    expect(p.addons[0]).toEqual({ id: 'raws', name: 'Raws', unit: '', type: 'toggle', price: null, d: 'All' })
    expect(p.addons[1]).toMatchObject({ max: 1, affects: 'delivery' })
  })
})
