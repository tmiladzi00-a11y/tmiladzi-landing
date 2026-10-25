import { addDays, iso } from '~/utils/dates'

/* Slot logic for the booking calendar. Pure functions over a list of busy
   intervals (epoch ms): approved bookings and staff blocks from the bookings
   database. The studio decides how long each booking runs when it approves
   it, so the site shows the same thing whichever package is chosen. The day
   is a row of one-hour start times; one is taken when a booking overlaps its
   hour (or it has already begun), and a date is full when every one is. */

export interface Busy { s: number; e: number }

/** Zambia is UTC+2 all year. Every slot on the site is studio time. */
export const STUDIO_UTC_OFFSET_MIN = 120
export const STUDIO_TZ_LABEL = 'Zambia time (CAT)'

const HOUR = 3_600_000

/** A studio-local date and time as a real instant. */
export function studioMs(dateIso: string, hhmm: string, offsetMin = STUDIO_UTC_OFFSET_MIN): number {
  const [y, m, d] = dateIso.split('-').map(Number)
  const [hh, mm] = hhmm.split(':').map(Number)
  return Date.UTC(y!, m! - 1, d!, hh!, mm!) - offsetMin * 60_000
}

/** An instant as studio-local HH:MM. */
export function studioHhmm(ms: number, offsetMin = STUDIO_UTC_OFFSET_MIN): string {
  return new Date(ms + offsetMin * 60_000).toISOString().slice(11, 16)
}

/** True when any busy interval intersects [s, e). Touching ends do not clash. */
export function overlaps(busy: Busy[], s: number, e: number): boolean {
  for (const b of busy) if (b.s < e && b.e > s) return true
  return false
}

/** The day's bookings in studio time, clipped to the day: what the calendar shows. */
export function bookedRanges(busy: Busy[], dateIso: string): { from: string; to: string }[] {
  const start = studioMs(dateIso, '00:00')
  const end = start + 24 * HOUR
  return busy.filter((b) => b.s < end && b.e > start).map((b) => ({
    from: studioHhmm(Math.max(b.s, start)),
    to: b.e >= end ? '24:00' : studioHhmm(b.e),
  }))
}

export type DayState = 'open' | 'partial' | 'full'
export interface DayAvailability { state: DayState; free: string[]; taken: string[] }

/** `slots` are the start of each one-hour block; `now` takes blocks that have already begun. */
export function dayAvailability(busy: Busy[], dateIso: string, slots: readonly string[], now = Date.now()): DayAvailability {
  const dayStart = studioMs(dateIso, '00:00')
  const today = busy.filter((b) => b.s < dayStart + 24 * HOUR && b.e > dayStart)
  const free: string[] = []
  const taken: string[] = []
  for (const t of slots) {
    const at = studioMs(dateIso, t)
    ;(at <= now || overlaps(today, at, at + HOUR) ? taken : free).push(t)
  }
  const state: DayState = free.length === 0 ? 'full' : today.length || taken.length ? 'partial' : 'open'
  return { state, free, taken }
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
