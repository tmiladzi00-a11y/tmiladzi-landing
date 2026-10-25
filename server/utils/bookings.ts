import type { Service } from '../../app/content/types'
import type { Block, Booking, BookingStatus, CalendarEntry, ValidBooking } from '../../app/utils/booking'
import { busyFrom } from '../../app/utils/booking'
import type { Busy } from '../../app/utils/availability'

/* Bookings and blocks in D1 (tables in server/database/migrations/0003). */

interface BookingRow {
  ref: string; status: BookingStatus; package_id: string; package_name: string; package_snapshot: string
  date: string; start: string; requested_hours: number; approved_hours: number | null; addons: string
  total: number; deposit: number; deposit_pct: number; tbq: number; delivery_text: string
  name: string; partner: string; email: string; phone: string; venue: string; region: string; guests: string
  heard: string; notes: string; terms_version: string; privacy_version: string; terms_fingerprint: string
  marketing_consent: number; accepted_at: string; created_at: string; decided_at: string | null
  decided_by: string | null; decision_note: string; deposit_paid_at: string | null; deposit_paid_by: string | null
}
interface BlockRow { id: number; date: string; start: string; end: string; reason: string; created_by: string | null }

const parse = <T>(s: string, fallback: T): T => { try { return JSON.parse(s) as T } catch { return fallback } }

export function bookingFromRow(r: BookingRow): Booking {
  return {
    ref: r.ref, status: r.status, packageId: r.package_id, packageName: r.package_name,
    package: parse<Service>(r.package_snapshot, { id: r.package_id, name: r.package_name } as Service),
    date: r.date, start: r.start, requestedHours: r.requested_hours, approvedHours: r.approved_hours,
    addons: parse(r.addons, {}), total: r.total, deposit: r.deposit, depositPct: r.deposit_pct, tbq: !!r.tbq,
    deliveryText: r.delivery_text, name: r.name, partner: r.partner, email: r.email, phone: r.phone,
    venue: r.venue, region: r.region, guests: r.guests, heard: r.heard, notes: r.notes,
    termsVersion: r.terms_version, privacyVersion: r.privacy_version, termsFingerprint: r.terms_fingerprint,
    marketingConsent: !!r.marketing_consent, acceptedAt: r.accepted_at, createdAt: r.created_at,
    decidedAt: r.decided_at, decidedBy: r.decided_by, decisionNote: r.decision_note,
    depositPaidAt: r.deposit_paid_at ?? null, depositPaidBy: r.deposit_paid_by ?? null,
  }
}

export async function insertBooking(db: D1, ref: string, b: ValidBooking): Promise<void> {
  const c = b.contact
  await db.prepare(`
    INSERT INTO bookings (ref, package_id, package_name, package_snapshot, date, start, requested_hours, addons,
      total, deposit, deposit_pct, tbq, delivery_text, name, partner, email, phone, venue, region, guests, heard,
      notes, terms_version, privacy_version, terms_fingerprint, marketing_consent, accepted_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27)`)
    .bind(ref, b.service.id, b.service.name, JSON.stringify(b.service), b.date, b.start, b.requestedHours,
      JSON.stringify(b.addons), b.quote.total, b.quote.deposit, b.quote.depositPct, b.quote.tbc ? 1 : 0, b.delivery,
      c.name, c.partner, c.email, c.phone, c.venue, c.region, c.guests, c.heard, c.notes,
      b.terms.version, b.terms.privacyVersion, b.terms.fingerprint, b.terms.marketingConsent ? 1 : 0, new Date().toISOString())
    .run()
}

export async function getBooking(db: D1, ref: string): Promise<Booking | null> {
  const r = await db.prepare('SELECT * FROM bookings WHERE ref = ?1').bind(ref).first<BookingRow>()
  return r ? bookingFromRow(r) : null
}

export type BookingView = 'pending' | 'deposit' | 'upcoming' | 'past' | 'closed'

/** Pending: oldest request first. Upcoming and past: approved, by date. Closed: declined and cancelled. */
export async function listBookings(db: D1, view: BookingView, today: string): Promise<Booking[]> {
  const QUERIES: Record<BookingView, [where: string, order: string]> = {
    pending: [`status = 'pending'`, 'created_at'],
    // accepted, money expected, not recorded: oldest acceptance (soonest to lapse) first
    deposit: [`status = 'approved' AND deposit > 0 AND deposit_paid_at IS NULL AND date >= ?1`, 'decided_at'],
    upcoming: [`status = 'approved' AND date >= ?1`, 'date, start'],
    past: [`status = 'approved' AND date < ?1`, 'date DESC, start DESC'],
    closed: [`status IN ('declined', 'cancelled')`, 'decided_at DESC'],
  }
  const [where, order] = QUERIES[view]
  const stmt = db.prepare(`SELECT * FROM bookings WHERE ${where} ORDER BY ${order} LIMIT 200`)
  const { results } = await (where.includes('?1') ? stmt.bind(today) : stmt).all<BookingRow>()
  return results.map(bookingFromRow)
}

export async function countPending(db: D1): Promise<number> {
  const r = await db.prepare(`SELECT COUNT(*) AS n FROM bookings WHERE status = 'pending'`).first<{ n: number }>()
  return r?.n ?? 0
}

/** What needs staff: requests to decide, and deposits not yet recorded (and how many of those are past their hold). */
export async function bookingCounts(db: D1, today: string): Promise<{ pending: number; deposit: number; overdue: number }> {
  const r = await db.prepare(`SELECT
      SUM(status = 'pending') AS pending,
      SUM(status = 'approved' AND deposit > 0 AND deposit_paid_at IS NULL AND date >= ?1) AS deposit,
      SUM(status = 'approved' AND deposit > 0 AND deposit_paid_at IS NULL AND date >= ?1
          AND datetime(decided_at, '+72 hours') < datetime('now')) AS overdue
    FROM bookings`).bind(today).first<{ pending: number | null; deposit: number | null; overdue: number | null }>()
  return { pending: r?.pending ?? 0, deposit: r?.deposit ?? 0, overdue: r?.overdue ?? 0 }
}

/** Record the deposit as received, or undo that. Only an accepted booking. */
export async function setDepositPaid(db: D1, ref: string, paid: boolean, by: string): Promise<boolean> {
  const r = paid
    ? await db.prepare(`UPDATE bookings SET deposit_paid_at = datetime('now'), deposit_paid_by = ?2 WHERE ref = ?1 AND status = 'approved'`).bind(ref, by).run()
    : await db.prepare(`UPDATE bookings SET deposit_paid_at = NULL, deposit_paid_by = NULL WHERE ref = ?1 AND status = 'approved'`).bind(ref).run()
  return !!r.meta?.changes
}

/** Bookings whose name, email, phone or reference contains the search, newest first. */
export async function searchBookings(db: D1, q: string): Promise<Booking[]> {
  const like = '%' + q.trim().replace(/[%_\\]/g, (c) => '\\' + c) + '%'
  const { results } = await db.prepare(`SELECT * FROM bookings
    WHERE name LIKE ?1 ESCAPE '\\' OR partner LIKE ?1 ESCAPE '\\' OR email LIKE ?1 ESCAPE '\\'
       OR phone LIKE ?1 ESCAPE '\\' OR ref LIKE ?1 ESCAPE '\\'
    ORDER BY date DESC LIMIT 50`).bind(like).all<BookingRow>()
  return results.map(bookingFromRow)
}

export async function listBlocks(db: D1, fromDate: string): Promise<Block[]> {
  const { results } = await db.prepare('SELECT * FROM blocks WHERE date >= ?1 ORDER BY date, start').bind(fromDate).all<BlockRow>()
  return results.map((r) => ({ id: r.id, date: r.date, start: r.start, end: r.end, reason: r.reason, createdBy: r.created_by }))
}

/** A busy interval with what took it, for staff to see. */
export interface BusyEntry extends Busy { kind: 'booking' | 'block'; key: string; label: string }

/** Everything that holds time from a date onward: approved bookings and blocks. */
export async function readBusy(db: D1, fromDate: string): Promise<BusyEntry[]> {
  const [bookings, blocks] = await Promise.all([
    db.prepare(`SELECT * FROM bookings WHERE status = 'approved' AND date >= ?1`).bind(fromDate).all<BookingRow>(),
    listBlocks(db, fromDate),
  ])
  const approved = bookings.results.map(bookingFromRow)
  const out: BusyEntry[] = []
  approved.forEach((b) => out.push({ ...busyFrom([b], [])[0]!, kind: 'booking', key: b.ref, label: `${b.ref} · ${b.packageName} · ${b.name}` }))
  blocks.forEach((k) => out.push({ ...busyFrom([], [k])[0]!, kind: 'block', key: String(k.id), label: `Blocked${k.reason ? ': ' + k.reason : ''}` }))
  return out
}

/** Record a decision. Only a pending request can be approved or declined; only an approved one cancelled. */
export async function decideBooking(db: D1, ref: string, d: {
  status: 'approved' | 'declined' | 'cancelled'; by: string; note?: string
  start?: string; approvedHours?: number; addons?: object; total?: number; deposit?: number; tbq?: boolean
}): Promise<boolean> {
  const from = d.status === 'cancelled' ? 'approved' : 'pending'
  const r = d.status === 'approved'
    ? await db.prepare(`
        UPDATE bookings SET status = 'approved', start = ?2, approved_hours = ?3, addons = ?4, total = ?5, deposit = ?6,
          tbq = ?7, decided_at = datetime('now'), decided_by = ?8, decision_note = ?9
        WHERE ref = ?1 AND status = 'pending'`)
      .bind(ref, d.start, d.approvedHours, JSON.stringify(d.addons ?? {}), d.total, d.deposit, d.tbq ? 1 : 0, d.by, d.note ?? '').run()
    : await db.prepare(`
        UPDATE bookings SET status = ?2, decided_at = datetime('now'), decided_by = ?3, decision_note = ?4
        WHERE ref = ?1 AND status = ?5`)
      .bind(ref, d.status, d.by, d.note ?? '', from).run()
  return !!r.meta?.changes
}

export async function calendarEntries(db: D1, from: string, to: string): Promise<CalendarEntry[]> {
  const [bookings, blocks] = await Promise.all([
    db.prepare(`SELECT ref, status, date, start, requested_hours, approved_hours, name, package_name, deposit, deposit_paid_at FROM bookings
      WHERE status IN ('pending', 'approved') AND date BETWEEN ?1 AND ?2`).bind(from, to)
      .all<Pick<BookingRow, 'ref' | 'status' | 'date' | 'start' | 'requested_hours' | 'approved_hours' | 'name' | 'package_name' | 'deposit' | 'deposit_paid_at'>>(),
    db.prepare('SELECT * FROM blocks WHERE date BETWEEN ?1 AND ?2').bind(from, to).all<BlockRow>(),
  ])
  const minutes = (t: string) => (t === '24:00' ? 1440 : Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)))
  return [
    ...bookings.results.map((b): CalendarEntry => ({
      kind: 'booking', key: b.ref, status: b.status, date: b.date, start: b.start,
      hours: b.approved_hours ?? b.requested_hours, label: `${b.name} · ${b.package_name}`,
      depositDue: b.status === 'approved' && b.deposit > 0 && !b.deposit_paid_at,
    })),
    ...blocks.results.map((k): CalendarEntry => ({
      kind: 'block', key: String(k.id), status: 'blocked', date: k.date, start: k.start,
      hours: (minutes(k.end) - minutes(k.start)) / 60, label: k.reason || 'Blocked',
    })),
  ].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
}
