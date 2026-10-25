import { describe, it, expect } from 'vitest'
import { studioMs, overlaps, dayAvailability, bookedRanges, sampleBusy } from '~/utils/availability'
import { SLOTS, DAY_END } from '~/content/services'

const D = '2026-10-10'
const at = (from: string, to: string, date = D) => ({ s: studioMs(date, from), e: studioMs(date, to) })

describe('studio time', () => {
  it('09:00 in Kitwe is 07:00 UTC', () => {
    expect(new Date(studioMs(D, '09:00')).toISOString()).toBe('2026-10-10T07:00:00.000Z')
  })
})

describe('hour blocks', () => {
  const busy = [at('09:00', '10:00')]
  it('back-to-back bookings do not clash', () => {
    expect(overlaps(busy, studioMs(D, '10:00'), studioMs(D, '11:00'))).toBe(false)
    expect(overlaps(busy, studioMs(D, '08:00'), studioMs(D, '09:00'))).toBe(false)
  })
  it('the day runs in hours from 07:00 to 18:00', () => {
    expect(SLOTS[0]).toBe('07:00')
    expect(SLOTS.length).toBe(11)
    expect(DAY_END).toBe('18:00')
  })
})

describe('day states', () => {
  const before = studioMs('2026-10-01', '00:00')
  it('open when nothing is on the calendar', () => {
    expect(dayAvailability([], D, SLOTS, before)).toEqual({ state: 'open', free: [...SLOTS], taken: [] })
  })
  it('a booking takes every hour it touches, and only those', () => {
    const r = dayAvailability([at('09:00', '12:00')], D, SLOTS, before)
    expect(r.state).toBe('partial')
    expect(r.taken).toEqual(['09:00', '10:00', '11:00'])
    expect(dayAvailability([at('16:30', '20:30')], D, SLOTS, before).taken).toEqual(['16:00', '17:00'])
  })
  it('a booking outside the bookable day marks the date but takes no hour', () => {
    const r = dayAvailability([at('19:00', '21:00')], D, SLOTS, before)
    expect(r.state).toBe('partial')
    expect(r.taken).toEqual([])
  })
  it('full when every hour is taken', () => {
    expect(dayAvailability([at('07:00', '18:00')], D, SLOTS, before).state).toBe('full')
    expect(dayAvailability([at('00:00', '23:59')], D, SLOTS, before).state).toBe('full')
  })
  it('a booking on another day leaves this one open', () => {
    expect(dayAvailability([at('09:00', '10:00', '2026-10-11')], D, SLOTS, before).state).toBe('open')
  })
  it('hours that have already begun today are taken', () => {
    const r = dayAvailability([], D, SLOTS, studioMs(D, '09:30'))
    expect(r.taken).toEqual(['07:00', '08:00', '09:00'])
    expect(dayAvailability([], D, SLOTS, studioMs(D, '17:00')).state).toBe('full')
  })
})

describe('booked ranges', () => {
  it('lists the day\'s bookings in studio time, clipped to the day', () => {
    const overnight = { s: studioMs(D, '20:00'), e: studioMs('2026-10-11', '02:00') }
    expect(bookedRanges([at('14:00', '15:00'), overnight], D)).toEqual([{ from: '14:00', to: '15:00' }, { from: '20:00', to: '24:00' }])
    expect(bookedRanges([overnight], '2026-10-11')).toEqual([{ from: '00:00', to: '02:00' }])
  })
})

describe('preview data', () => {
  it('produces ordered, positive intervals', () => {
    const b = sampleBusy(new Date(2026, 9, 1))
    expect(b.length).toBeGreaterThan(10)
    for (const x of b) expect(x.e).toBeGreaterThan(x.s)
  })
})
