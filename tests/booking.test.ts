import { describe, it, expect } from 'vitest'
import { SERVICES, BOOKING_DEFAULTS } from '~/content/services'
import type { Catalog } from '~/content/types'
import { studioMs } from '~/utils/availability'
import {
  checkBookingRequest, approvalQuote, busyFrom, cleanAddons, sessionRange, newRef, paymentLines, momoLine, studioToday,
} from '~/utils/booking'

const catalog: Catalog = { source: 'static', services: SERVICES, settings: BOOKING_DEFAULTS }
const wedding = SERVICES.find((s) => s.id === 'wedding')!
const sessions = SERVICES.find((s) => s.id === 'sessions')!
// 06:00 in Kitwe on 24 October 2026
const NOW = Date.UTC(2026, 9, 24, 4)
const DATE = '2026-11-14'

const request = (over: Record<string, unknown> = {}) => ({
  serviceId: 'sessions', date: DATE, start: '09:00', addons: {},
  name: 'Mutale Banda', email: 'mutale@example.com', phone: '+260 96 000 0000',
  termsAccepted: true, termsVersion: 'v1', privacyVersion: 'v1', ...over,
})

describe('checkBookingRequest', () => {
  it('prices from the catalogue and ignores any total the browser sends', () => {
    const r = checkBookingRequest(request({ total: 1, deposit: 1 }), catalog, [], NOW)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.quote.total).toBe(sessions.price)
    expect(r.value.quote.deposit).toBe(Math.round(sessions.price! * sessions.dep))
  })

  it('ignores extra time sent by a client: the studio sets the length', () => {
    const r = checkBookingRequest(request({ serviceId: 'wedding', addons: { time: 2 } }), catalog, [], NOW)
    expect(r.ok && r.value.requestedHours).toBe(wedding.hours)
    expect(r.ok && r.value.addons).toEqual({})
    expect(r.ok && r.value.quote.total).toBe(wedding.price)
  })

  it('caps add-ons at their maximum and drops unknown ones', () => {
    expect(cleanAddons(sessions, { reel: 99, raws: 5, hacked: 3, photo: -2 })).toEqual({ reel: 3, raws: 1 })
  })

  it('refuses a start time an approved booking already holds', () => {
    const busy = busyFrom([{ date: DATE, start: '08:00', approvedHours: 3, requestedHours: 1 }], [])
    const r = checkBookingRequest(request({ start: '10:00' }), catalog, busy, NOW)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.start).toMatch(/taken/)
    // the hour after it ends is free
    expect(checkBookingRequest(request({ start: '11:00' }), catalog, busy, NOW).ok).toBe(true)
  })

  it('refuses a blocked day, a past date, a start outside the day, and bad details', () => {
    const day = busyFrom([], [{ date: DATE, start: '00:00', end: '24:00' }])
    expect(checkBookingRequest(request(), catalog, day, NOW).ok).toBe(false)
    const r = checkBookingRequest(request({ date: '2026-10-01', start: '05:00', email: 'nope', termsAccepted: false, serviceId: 'x' }), catalog, [], NOW)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['date', 'email', 'serviceId', 'start', 'terms'])
  })
})

describe('approvalQuote', () => {
  it('bills hours beyond the package as extra time', () => {
    const { addons, quote } = approvalQuote(wedding, { reel: 1 }, wedding.hours + 2)
    const time = wedding.addons.find((a) => a.id === 'time')!
    const reel = wedding.addons.find((a) => a.id === 'reel')!
    expect(addons).toEqual({ reel: 1, time: 2 })
    expect(quote.total).toBe(wedding.price! + reel.price! + 2 * time.price!)
  })
  it('drops extra time the client asked for when staff approve the package length', () => {
    expect(approvalQuote(wedding, { time: 3 }, wedding.hours).addons).toEqual({})
  })
})

describe('busy time and labels', () => {
  it('an all-day block covers the whole studio day', () => {
    const [b] = busyFrom([], [{ date: DATE, start: '00:00', end: '24:00' }])
    expect(b).toEqual({ s: studioMs(DATE, '00:00'), e: studioMs('2026-11-15', '00:00') })
  })
  it('a session past midnight says so', () => {
    expect(sessionRange(DATE, '09:00', 10)).toBe('09:00 – 19:00')
    expect(sessionRange(DATE, '18:00', 8)).toBe('18:00 – 02:00 (+1 day)')
  })
  it('studio today is Zambian time', () => {
    expect(studioToday(Date.UTC(2026, 9, 24, 22, 30))).toBe('2026-10-25') // 00:30 in Kitwe
  })
  it('references are easy to read out', () => {
    for (let i = 0; i < 50; i++) expect(newRef()).toMatch(/^TM-[A-HJKMNP-Z2-9]{6}$/)
  })
  it('payment lines carry the number, the reference and the deposit', () => {
    const text = paymentLines({ number: '0974 901 668', name: '', network: '' }, 'TM-ABC234', 3500).join('\n')
    expect(text).toContain('0974 901 668')
    expect(text).toContain('TM-ABC234')
    expect(text).toContain('K3,500')
    expect(momoLine({ number: '0974 901 668', name: 'Tmiladzi Media', network: 'Airtel' })).toBe('0974 901 668 (Airtel Money · Tmiladzi Media)')
  })
})
