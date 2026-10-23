import type { Addon, BookingSettings, PackageRecord, Tier } from '~/content/types'

/* Shared by the booking page, the admin forms and the server: the admin shows
   the same errors the API would answer with, and the API never trusts the
   form to have checked. */

export const TIERS: Tier[] = ['premium', 'basic']
export const TIER_LABEL: Record<Tier, string> = { premium: 'Premium', basic: 'Basic' }

const SLUG = /^[a-z0-9][a-z0-9-]{0,39}$/
const HOUR = /^([01]\d|2[0-3]):00$/

/** One-hour blocks from start up to (not including) end: '07:00'..'17:00' for a 07–18 day. */
export function hourlySlots(start: string, end: string): string[] {
  const a = Number(start.slice(0, 2))
  const b = Number(end.slice(0, 2))
  const out: string[] = []
  for (let h = a; h < b; h++) out.push(String(h).padStart(2, '0') + ':00')
  return out
}

export type Errors = Record<string, string>
export type Checked<T> = { ok: true; value: T } | { ok: false; errors: Errors }

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const lines = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : [])
const int = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) ? v : typeof v === 'string' && /^\d+$/.test(v.trim()) ? Number(v) : NaN)
/** null, '' and undefined mean "no value"; anything else must be a whole number. */
const optInt = (v: unknown) => (v == null || v === '' ? null : int(v))

export function blankPackage(): PackageRecord {
  return {
    id: '', tier: 'basic', name: '', tag: '', price: 0, dep: 0.5, hours: 1, cov: '1 hour',
    delivery: 48, deliveryUnit: 'hours', live: true, blurb: '', includes: [], notes: [], addons: [],
    published: false, sort: 0,
  }
}

export function checkPackage(input: unknown): Checked<PackageRecord> {
  const p = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const e: Errors = {}

  const id = str(p.id)
  if (!SLUG.test(id)) e.id = 'Lowercase letters, numbers and dashes, up to 40 characters'
  const tier = p.tier === 'premium' || p.tier === 'basic' ? p.tier : null
  if (!tier) e.tier = 'Choose basic or premium'
  const name = str(p.name)
  if (!name) e.name = 'Required'
  else if (name.length > 80) e.name = 'Keep it under 80 characters'
  const price = optInt(p.price)
  if (Number.isNaN(price) || (price != null && (price < 0 || price > 10_000_000))) e.price = 'A whole number of Kwacha, or empty for "on request"'
  const dep = typeof p.dep === 'number' ? p.dep : NaN
  if (!(dep >= 0 && dep <= 1)) e.dep = 'Between 0% and 100%'
  const hours = int(p.hours)
  if (!(hours >= 1 && hours <= 24)) e.hours = 'Between 1 and 24'
  const cov = str(p.cov)
  if (!cov) e.cov = 'Required, e.g. "10 hours"'
  const delivery = int(p.delivery)
  if (!(delivery >= 0 && delivery <= 1000)) e.delivery = 'A whole number'
  const deliveryUnit = p.deliveryUnit === 'weeks' || p.deliveryUnit === 'hours' ? p.deliveryUnit : null
  if (!deliveryUnit) e.deliveryUnit = 'Weeks or hours'
  const blurb = str(p.blurb)
  if (blurb.length > 400) e.blurb = 'Keep it under 400 characters'
  const includes = lines(p.includes)
  const notes = lines(p.notes)
  if (includes.length > 20) e.includes = 'At most 20 lines'
  if (notes.length > 20) e.notes = 'At most 20 lines'

  const rawAddons = Array.isArray(p.addons) ? p.addons : []
  if (rawAddons.length > 20) e.addons = 'At most 20 add-ons'
  const seen = new Set<string>()
  const addons: Addon[] = rawAddons.map((raw, i) => {
    const a = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const k = `addons.${i}.`
    const aid = str(a.id)
    if (!SLUG.test(aid)) e[k + 'id'] = 'Lowercase slug'
    else if (seen.has(aid)) e[k + 'id'] = 'Used twice'
    seen.add(aid)
    const aname = str(a.name)
    if (!aname) e[k + 'name'] = 'Required'
    const type = a.type === 'qty' || a.type === 'toggle' ? a.type : null
    if (!type) e[k + 'type'] = 'Quantity or on/off'
    const aprice = optInt(a.price)
    if (Number.isNaN(aprice) || (aprice != null && aprice < 0)) e[k + 'price'] = 'Whole Kwacha, or empty for "quoted separately"'
    const max = type === 'qty' ? optInt(a.max) : null
    if (Number.isNaN(max) || (max != null && (max < 1 || max > 99))) e[k + 'max'] = 'Between 1 and 99, or empty'
    const out: Addon = { id: aid, name: aname, unit: str(a.unit), type: type ?? 'toggle', price: aprice, d: str(a.d) }
    if (max != null && !Number.isNaN(max)) out.max = max
    if (a.affects === 'delivery') out.affects = 'delivery'
    return out
  })

  if (Object.keys(e).length) return { ok: false, errors: e }
  return {
    ok: true,
    value: {
      id, tier: tier!, name, tag: str(p.tag), price, dep: Math.round(dep * 100) / 100, hours, cov,
      delivery, deliveryUnit: deliveryUnit!, live: p.live !== false, blurb, includes, notes, addons,
      published: p.published === true, sort: Number.isInteger(p.sort) ? (p.sort as number) : 0,
    },
  }
}

export function checkSettings(input: unknown): Checked<BookingSettings> {
  const s = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const e: Errors = {}
  const eyebrow = str(s.eyebrow)
  const title = str(s.title)
  const lede = str(s.lede)
  if (!title) e.title = 'Required'
  if (lede.length > 600) e.lede = 'Keep it under 600 characters'
  const dayStart = str(s.dayStart)
  const dayEnd = str(s.dayEnd)
  if (!HOUR.test(dayStart)) e.dayStart = 'On the hour, e.g. 07:00'
  if (!HOUR.test(dayEnd)) e.dayEnd = 'On the hour, e.g. 18:00'
  else if (!e.dayStart && dayEnd <= dayStart) e.dayEnd = 'Must be after the first hour'
  const regions = lines(s.regions)
  const heard = lines(s.heard)
  if (!regions.length) e.regions = 'At least one'
  if (!heard.length) e.heard = 'At least one'
  if (Object.keys(e).length) return { ok: false, errors: e }
  return { ok: true, value: { eyebrow, title, lede, dayStart, dayEnd, regions, heard } }
}
