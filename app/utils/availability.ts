import type { Service } from '~/content/types'
import { addDays, iso } from '~/utils/dates'

/* Slot logic for the booking calendar. Pure functions over a list of busy
   intervals (epoch ms) that the studio's calendar produced. A start time is
   offered when the service's hours fit before the next booking; a full-day
   service is offered when a clear run of its hours exists inside the working
   day. One booking takes its own time, not the whole date. */

export interface Busy { s: number; e: number }

/** Zambia is UTC+2 all year. Every slot on the site is studio time. */
export const STUDIO_UTC_OFFSET_MIN = 120
export const STUDIO_TZ_LABEL = 'Zambia time (CAT)'
/** The span inside which a full-day service has to find its clear hours. */
export const WORKDAY = { from: '06:00', to: '22:00' } as const

const HOUR = 3_600_000

/** A studio-local date and time as a real instant. */
export function studioMs(dateIso: string, hhmm: string, offsetMin = STUDIO_UTC_OFFSET_MIN): number {
  const [y, m, d] = dateIso.split('-').map(Number)
  const [hh, mm] = hhmm.split(':').map(Number)
  return Date.UTC(y!, m! - 1, d!, hh!, mm!) - offsetMin * 60_000
}

/** True when any busy interval intersects [s, e). Touching ends do not clash. */
export function overlaps(busy: Busy[], s: number, e: number): boolean {
  for (const b of busy) if (b.s < e && b.e > s) return true
  return false
}

export function slotFree(busy: Busy[], dateIso: string, time: string, hours: number): boolean {
  const s = studioMs(dateIso, time)
  return !overlaps(busy, s, s + hours * HOUR)
}

/** Is there a clear run of `hours` between WORKDAY.from and WORKDAY.to? */
export function freeWindowFits(busy: Busy[], dateIso: string, hours: number): boolean {
  const from = studioMs(dateIso, WORKDAY.from)
  const to = studioMs(dateIso, WORKDAY.to)
  const need = hours * HOUR
  let cursor = from
  for (const b of [...busy].sort((a, c) => a.s - c.s)) {
    if (b.e <= cursor) continue
    if (b.s >= to) break
    if (b.s - cursor >= need) return true
    cursor = Math.max(cursor, b.e)
  }
  return to - cursor >= need
}

export type DayState = 'open' | 'partial' | 'full'
export interface DayAvailability { state: DayState; free: string[]; taken: string[] }

type Shape = Pick<Service, 'hours' | 'times'>

export function dayAvailability(busy: Busy[], dateIso: string, svc: Shape, slots: readonly string[]): DayAvailability {
  const dayStart = studioMs(dateIso, '00:00')
  const today = busy.filter((b) => b.s < dayStart + 24 * HOUR && b.e > dayStart)
  if (!today.length) return { state: 'open', free: svc.times ? [...slots] : [], taken: [] }

  if (!svc.times) {
    return { state: freeWindowFits(today, dateIso, svc.hours) ? 'partial' : 'full', free: [], taken: [] }
  }
  const free: string[] = []
  const taken: string[] = []
  for (const t of slots) (slotFree(today, dateIso, t, svc.hours) ? free : taken).push(t)
  return { state: free.length === 0 ? 'full' : taken.length ? 'partial' : 'open', free, taken }
}

/** No booking runs past a day: the most extra hours ever worth testing. */
export const MAX_EXTRA_HOURS = 24

/** How many whole extra hours can follow the booking before the next clash. */
export function maxExtraHours(busy: Busy[], dateIso: string, time: string | null, svc: Shape, cap: number): number {
  const limit = Number.isFinite(cap) ? Math.min(Math.max(0, Math.floor(cap)), MAX_EXTRA_HOURS) : MAX_EXTRA_HOURS
  let n = 0
  for (let h = 1; h <= limit; h++) {
    const ok = svc.times
      ? !!time && slotFree(busy, dateIso, time, svc.hours + h)
      : freeWindowFits(busy, dateIso, svc.hours + h)
    if (!ok) break
    n = h
  }
  return n
}

/** Preview mode only: a believable scatter of bookings so the flow can be walked. */
export function sampleBusy(now = new Date()): Busy[] {
  const out: Busy[] = []
  for (let i = 2; i < 150; i++) {
    const d = addDays(now, i)
    const day = iso(d)
    const dow = d.getDay()
    if ((dow === 6 && i % 3 === 0) || i % 17 === 0) out.push({ s: studioMs(day, '00:00'), e: studioMs(day, '00:00') + 24 * HOUR }) // a whole day gone
    else if (dow === 6 || (dow === 0 && i % 2 === 0)) out.push({ s: studioMs(day, '09:00'), e: studioMs(day, '13:00') }) // a morning event
    else if (i % 5 === 0) out.push({ s: studioMs(day, '15:00'), e: studioMs(day, '16:00') }) // an afternoon session
  }
  return out
}
