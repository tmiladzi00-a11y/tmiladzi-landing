import { describe, it, expect } from 'vitest'
import { studioMs, overlaps, slotFree, freeWindowFits, dayAvailability, maxExtraHours, sampleBusy } from '~/utils/availability'
import { SLOTS } from '~/content/services'

const D = '2026-10-10'
const at = (from: string, to: string, date = D) => ({ s: studioMs(date, from), e: studioMs(date, to) })
const session = { hours: 1, times: true }
const event = { hours: 4, times: true }
const wedding = { hours: 10, times: false }

describe('studio time', () => {
  it('09:00 in Kitwe is 07:00 UTC', () => {
    expect(new Date(studioMs(D, '09:00')).toISOString()).toBe('2026-10-10T07:00:00.000Z')
  })
})

describe('slots', () => {
  const busy = [at('09:00', '10:00')]
  it('a booking takes its own slot, not the day', () => {
    expect(slotFree(busy, D, '09:00', 1)).toBe(false)
    expect(slotFree(busy, D, '07:00', 1)).toBe(true)
    expect(slotFree(busy, D, '11:00', 1)).toBe(true)
  })
  it('a longer service is blocked by a booking inside its span', () => {
    expect(slotFree(busy, D, '07:00', 4)).toBe(false)
    expect(slotFree(busy, D, '11:00', 4)).toBe(true)
  })
  it('back-to-back bookings do not clash', () => {
    expect(overlaps(busy, studioMs(D, '10:00'), studioMs(D, '11:00'))).toBe(false)
    expect(overlaps(busy, studioMs(D, '08:00'), studioMs(D, '09:00'))).toBe(false)
  })
})

describe('day states', () => {
  it('open when nothing is on the calendar', () => {
    expect(dayAvailability([], D, session, SLOTS)).toEqual({ state: 'open', free: [...SLOTS], taken: [] })
  })
  it('partial when some start times are taken', () => {
    const r = dayAvailability([at('09:00', '10:00')], D, session, SLOTS)
    expect(r.state).toBe('partial')
    expect(r.taken).toEqual(['09:00'])
    expect(r.free).toEqual(['07:00', '11:00', '13:00', '15:00', '16:30'])
  })
  it('the same booking removes more start times for a longer service', () => {
    const r = dayAvailability([at('09:00', '10:00')], D, event, SLOTS)
    expect(r.taken).toEqual(['07:00', '09:00'])
  })
  it('full when every start time clashes', () => {
    expect(dayAvailability([at('07:00', '20:00')], D, session, SLOTS).state).toBe('full')
  })
  it('an all-day block fills the day for every service', () => {
    const all = [at('00:00', '23:59'), { s: studioMs(D, '00:00'), e: studioMs(D, '00:00') + 86_400_000 }]
    expect(dayAvailability(all, D, session, SLOTS).state).toBe('full')
    expect(dayAvailability(all, D, wedding, SLOTS).state).toBe('full')
  })
  it('ignores bookings on other days', () => {
    expect(dayAvailability([at('09:00', '10:00', '2026-10-11')], D, session, SLOTS).state).toBe('open')
  })
})

describe('full-day services', () => {
  it('still offers a wedding when ten clear hours remain', () => {
    expect(freeWindowFits([at('06:30', '07:30')], D, 10)).toBe(true)
    expect(dayAvailability([at('06:30', '07:30')], D, wedding, SLOTS).state).toBe('partial')
  })
  it('withholds a wedding when a midday booking splits the day', () => {
    // 06:00–12:00 is 6h, 13:00–22:00 is 9h: neither holds ten
    expect(freeWindowFits([at('12:00', '13:00')], D, 10)).toBe(false)
    expect(dayAvailability([at('12:00', '13:00')], D, wedding, SLOTS).state).toBe('full')
  })
  it('counts the gap between two bookings', () => {
    expect(freeWindowFits([at('06:00', '07:00'), at('17:00', '22:00')], D, 10)).toBe(true)
    expect(freeWindowFits([at('06:00', '08:00'), at('17:00', '22:00')], D, 10)).toBe(false)
  })
})

describe('extra hours', () => {
  it('caps additional time at the next booking', () => {
    // session 13:00–14:00, next booking at 16:00: two more hours fit
    expect(maxExtraHours([at('16:00', '17:00')], D, '13:00', session, 4)).toBe(2)
  })
  it('allows the full cap on a clear day and none without a time', () => {
    expect(maxExtraHours([], D, '13:00', session, 4)).toBe(4)
    expect(maxExtraHours([], D, null, session, 4)).toBe(0)
  })
  it('stays bounded whatever cap it is given', () => {
    expect(maxExtraHours([], D, '07:00', session, Infinity)).toBeLessThanOrEqual(24)
    expect(maxExtraHours([], D, '07:00', session, Number.NaN)).toBeLessThanOrEqual(24)
    expect(maxExtraHours([], D, '13:00', session, -3)).toBe(0)
  })
  it('for a wedding, measures against the working day', () => {
    expect(maxExtraHours([], D, null, wedding, 6)).toBe(6)
    expect(maxExtraHours([at('06:00', '08:00')], D, null, wedding, 6)).toBe(4)
  })
})

describe('preview data', () => {
  it('produces ordered, positive intervals', () => {
    const b = sampleBusy(new Date(2026, 9, 1))
    expect(b.length).toBeGreaterThan(10)
    for (const x of b) expect(x.e).toBeGreaterThan(x.s)
  })
})

describe('public booking address', () => {
  it('accepts an Apps Script web app and nothing else', async () => {
    const { appsScriptUrl } = await import('~/composables/useBookingApi')
    expect(appsScriptUrl('https://script.google.com/macros/s/abc123/exec')).toBe('https://script.google.com/macros/s/abc123/exec')
    expect(appsScriptUrl('https://calendar.google.com/calendar/ical/someone%40gmail.com/private-xyz/basic.ics')).toBe('')
    expect(appsScriptUrl('webcal://example.com/cal.ics')).toBe('')
    expect(appsScriptUrl('')).toBe('')
    expect(appsScriptUrl(undefined)).toBe('')
  })
})
