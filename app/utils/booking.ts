import type { Catalog, Service } from '~/content/types'
import { totals, deliveryText, nextQuantity, type AddonQuantities, type QuoteTotals } from '~/composables/useBookingQuote'
import { dayAvailability, studioMs, studioHhmm, STUDIO_UTC_OFFSET_MIN, type Busy } from '~/utils/availability'
import { hourlySlots, type Errors, type Checked } from '~/utils/catalog'

/* Booking requests, shared by the wizard, the API and the admin. The client
   picks a start time only; how long the session runs is the studio's call,
   made when a member of staff approves the request. Until then it holds no
   time: availability is approved bookings and staff blocks, nothing else.
   The server re-prices every request from the catalogue and never trusts a
   total sent by the browser. */

export type BookingStatus = 'pending' | 'approved' | 'declined' | 'cancelled'

/** What the wizard sends. Prices are not part of it. */
export interface BookingRequest {
  serviceId: string
  date: string
  start: string
  addons: AddonQuantities
  name: string
  partner?: string
  email: string
  phone: string
  venue?: string
  region?: string
  guests?: string
  heard?: string
  notes?: string
  termsAccepted: boolean
  termsVersion: string
  privacyVersion: string
  termsFingerprint?: string
  marketingConsent?: boolean
  /** Honeypot: real browsers leave this empty. */
  website?: string
}

/** A request that passed every check, priced. */
export interface ValidBooking {
  service: Service
  date: string
  start: string
  addons: AddonQuantities
  requestedHours: number
  quote: QuoteTotals
  delivery: string
  contact: { name: string; partner: string; email: string; phone: string; venue: string; region: string; guests: string; heard: string; notes: string }
  terms: { version: string; privacyVersion: string; fingerprint: string; marketingConsent: boolean }
}

/** A booking as staff see it. */
export interface Booking {
  ref: string
  status: BookingStatus
  packageId: string
  packageName: string
  package: Service
  date: string
  start: string
  requestedHours: number
  approvedHours: number | null
  addons: AddonQuantities
  total: number
  deposit: number
  depositPct: number
  tbq: boolean
  deliveryText: string
  name: string
  partner: string
  email: string
  phone: string
  venue: string
  region: string
  guests: string
  heard: string
  notes: string
  termsVersion: string
  privacyVersion: string
  termsFingerprint: string
  marketingConsent: boolean
  acceptedAt: string
  createdAt: string
  decidedAt: string | null
  decidedBy: string | null
  decisionNote: string
  /** When staff recorded the deposit as received; null while it is due. */
  depositPaidAt: string | null
  depositPaidBy: string | null
}

/** What the admin calendar draws: a booking that holds or asks for time, or a block. */
export interface CalendarEntry {
  kind: 'booking' | 'block'
  /** Booking reference, or the block's id. */
  key: string
  status: BookingStatus | 'blocked'
  date: string
  start: string
  /** Approved hours, else the hours asked for; for a block, its length. */
  hours: number
  /** 'Mutale Banda · Weddings', or the block's note. */
  label: string
  /** A confirmed booking whose deposit has not been recorded yet. */
  depositDue?: boolean
}

/** Time the studio has taken by hand: a phone booking, a day off. */
export interface Block {
  id: number
  date: string
  start: string
  /** 'HH:MM', or '24:00' for the rest of the day. */
  end: string
  reason: string
  createdBy?: string | null
}

const HOUR = 3_600_000
const DAY = 24 * HOUR
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** How far ahead a date may be booked: a little over fourteen months. */
export const HORIZON_DAYS = 430

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Studio-local today, 'YYYY-MM-DD'. */
export function studioToday(now = Date.now()): string {
  return new Date(now + STUDIO_UTC_OFFSET_MIN * 60_000).toISOString().slice(0, 10)
}

/** The extra-hours add-on is the one with id 'time'. */
export function extraHoursAddon(svc: Service) {
  return svc.addons.find((a) => a.id === 'time')
}

/** Hours asked for: the package's own plus any extra time the client added. */
export function requestedHoursFor(svc: Service, add: AddonQuantities): number {
  return svc.hours + (extraHoursAddon(svc) ? add.time || 0 : 0)
}

/** Every add-on the package has, clamped to what it allows; anything else dropped. */
export function cleanAddons(svc: Service, input: unknown): AddonQuantities {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const out: AddonQuantities = {}
  for (const a of svc.addons) {
    const n = Math.floor(Number(raw[a.id]) || 0)
    if (n <= 0) continue
    // nextQuantity from 0 by n gives the same clamp the wizard's stepper applies
    const q = a.type === 'toggle' ? 1 : nextQuantity(a, 0, n)
    if (q) out[a.id] = q
  }
  return out
}

/** Busy time from approved bookings and blocks, as epoch-ms intervals. */
export function busyFrom(approved: Pick<Booking, 'date' | 'start' | 'approvedHours' | 'requestedHours'>[], blocks: Pick<Block, 'date' | 'start' | 'end'>[]): Busy[] {
  const out: Busy[] = []
  for (const b of approved) {
    const s = studioMs(b.date, b.start)
    out.push({ s, e: s + (b.approvedHours ?? b.requestedHours) * HOUR })
  }
  for (const k of blocks) {
    const s = studioMs(k.date, k.start)
    out.push({ s, e: k.end === '24:00' ? studioMs(k.date, '00:00') + DAY : studioMs(k.date, k.end) })
  }
  return out
}

export function checkBookingRequest(input: unknown, catalog: Catalog, busy: Busy[], now = Date.now()): Checked<ValidBooking> {
  const r = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const e: Errors = {}

  const service = catalog.services.find((s) => s.id === r.serviceId)
  if (!service) e.serviceId = 'Choose a package'

  const date = str(r.date, 10)
  const today = studioToday(now)
  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) e.date = 'Choose a date'
  else if (date < today) e.date = 'That date has passed'
  else if (Date.parse(date) - Date.parse(today) > HORIZON_DAYS * DAY) e.date = 'That date is too far ahead to book online'

  const start = str(r.start, 5)
  const slots = hourlySlots(catalog.settings.dayStart, catalog.settings.dayEnd)
  if (!TIME.test(start) || !slots.includes(start)) e.start = 'Choose a start time'
  else if (!e.date && !dayAvailability(busy, date, [start], now).free.includes(start)) e.start = 'That start time has just been taken. Choose another.'

  const name = str(r.name, 120)
  const email = str(r.email, 160)
  const phone = str(r.phone, 40)
  if (!name) e.name = 'Required'
  if (!EMAIL.test(email)) e.email = 'A valid email address is required'
  if (!phone) e.phone = 'Required'
  if (r.termsAccepted !== true) e.terms = 'The terms must be accepted'
  const termsVersion = str(r.termsVersion, 60)
  const privacyVersion = str(r.privacyVersion, 60)
  if (!termsVersion || !privacyVersion) e.terms = 'The terms must be accepted'

  if (Object.keys(e).length || !service) return { ok: false, errors: e }

  // the studio sets the length on approval: extra time is never the client's to buy
  const { time: _ignored, ...addons } = cleanAddons(service, r.addons)
  return {
    ok: true,
    value: {
      service, date, start, addons,
      requestedHours: requestedHoursFor(service, addons),
      quote: totals(service, addons),
      delivery: deliveryText(service, addons),
      contact: {
        name, email, phone,
        partner: str(r.partner, 120), venue: str(r.venue, 200), region: str(r.region, 120),
        guests: str(r.guests, 40), heard: str(r.heard, 120), notes: str(r.notes, 3000),
      },
      terms: { version: termsVersion, privacyVersion, fingerprint: str(r.termsFingerprint, 128), marketingConsent: r.marketingConsent === true },
    },
  }
}

/** The price once staff set the length: hours past the package's own are billed as extra time. */
export function approvalQuote(pkg: Service, addons: AddonQuantities, approvedHours: number): { addons: AddonQuantities; quote: QuoteTotals } {
  const add = { ...addons }
  if (extraHoursAddon(pkg)) {
    const extra = Math.max(0, approvedHours - pkg.hours)
    if (extra) add.time = extra
    else delete add.time
  }
  return { addons: add, quote: totals(pkg, add) }
}

/** Busy intervals that overlap [start, start + hours) on a date. */
export function clashes<T extends Busy>(busy: T[], date: string, start: string, hours: number): T[] {
  const s = studioMs(date, start)
  const e = s + hours * HOUR
  return busy.filter((b) => b.s < e && b.e > s)
}

/** "09:00 – 19:00" for a session of hours; past midnight it reads "+1 day". */
export function sessionRange(date: string, start: string, hours: number): string {
  const s = studioMs(date, start)
  const e = s + hours * HOUR
  const nextDay = e - studioMs(date, '00:00') > DAY
  return `${start} – ${studioHhmm(e)}${nextDay ? ' (+1 day)' : ''}`
}

/** How long an accepted booking's date is held while the deposit is paid. */
export const HOLD_HOURS = 72

export type DepositState = 'none' | 'due' | 'overdue' | 'paid'

/** Where an accepted booking's deposit stands. Pending, declined and cancelled bookings have none. */
export function depositState(b: Pick<Booking, 'status' | 'deposit' | 'depositPaidAt' | 'decidedAt'>, now = Date.now()): DepositState {
  if (b.status !== 'approved' || !b.deposit) return 'none'
  if (b.depositPaidAt) return 'paid'
  return holdEndsAt(b) < now ? 'overdue' : 'due'
}

/** When the 72-hour hold on an accepted booking runs out (epoch ms). */
export function holdEndsAt(b: Pick<Booking, 'decidedAt'>): number {
  const decided = b.decidedAt ? Date.parse(b.decidedAt.includes('T') ? b.decidedAt : b.decidedAt.replace(' ', 'T') + 'Z') : Date.now()
  return decided + HOLD_HOURS * 3_600_000
}

/** Booking references: no 0/O or 1/I/L to misread over the phone. */
export function newRef(): string {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'TM-' + [...bytes].map((b) => A[b % A.length]).join('')
}

/** "0974 901 668 (Airtel Money · Tmiladzi Media)", with whatever of name and network is known. */
export function momoLine(momo: { number: string; name: string; network: string }): string {
  const who = [momo.network && `${momo.network} Money`, momo.name].filter(Boolean).join(' · ')
  return momo.number + (who ? ` (${who})` : '')
}

/** The payment instructions every booking message carries. */
export function paymentLines(momo: { number: string; name: string; network: string }, ref: string, deposit: number | null): string[] {
  return [
    'PAYMENT',
    'Once we confirm your date, pay the deposit' + (deposit ? ` of K${new Intl.NumberFormat('en-ZM').format(deposit)}` : '') + ' by mobile money to:',
    '  ' + momoLine(momo),
    `Use ${ref} as the payment reference. Your date is held for 72 hours after we confirm it.`,
  ]
}
