import type { H3Event } from 'h3'
import type { Addon, BookingSettings, Catalog, PackageRecord } from '../../app/content/types'
import { SERVICES, BOOKING_DEFAULTS } from '../../app/content/services'

/* The CMS store: Cloudflare D1, bound as DB (wrangler.dev.jsonc locally, the
   Pages project's bindings in production). Every reader falls back to the
   built-in catalogue in app/content/services.ts when the binding is absent,
   so a deployment without the database renders exactly as before. */

/* The slice of the D1 API used here; avoids pulling in @cloudflare/workers-types. */
interface D1Stmt {
  bind(...values: unknown[]): D1Stmt
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<{ meta?: { changes?: number } }>
}
export interface D1 {
  prepare(sql: string): D1Stmt
  batch(statements: D1Stmt[]): Promise<unknown[]>
}

export function useDb(event: H3Event): D1 | null {
  const env = (event.context as { cloudflare?: { env?: { DB?: D1 } } }).cloudflare?.env
    ?? (globalThis as { __env__?: { DB?: D1 } }).__env__
  return env?.DB ?? null
}

/** 503 for admin routes when no database is bound: there is nothing to edit. */
export function requireDb(event: H3Event): D1 {
  const db = useDb(event)
  if (!db) throw createError({ statusCode: 503, statusMessage: 'CMS database is not configured' })
  return db
}

/* ---------- rows ---------- */

interface PackageRow {
  id: string; tier: 'basic' | 'premium'; name: string; tag: string; price: number | null
  deposit_pct: number; hours: number; coverage: string; delivery: number; delivery_unit: 'weeks' | 'hours'
  live: number; blurb: string; includes: string; notes: string; sort: number; published: number
  updated_at: string; updated_by: string | null
}
interface AddonRow {
  package_id: string; id: string; name: string; unit: string; type: 'qty' | 'toggle'
  price: number | null; max: number | null; description: string; affects: 'delivery' | null; sort: number
}

const jsonList = (s: string): string[] => {
  try { const v = JSON.parse(s); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [] } catch { return [] }
}

export function addonFromRow(r: AddonRow): Addon {
  const a: Addon = { id: r.id, name: r.name, unit: r.unit, type: r.type, price: r.price, d: r.description }
  if (r.max != null) a.max = r.max
  if (r.affects) a.affects = r.affects
  return a
}

export function packageFromRow(r: PackageRow, addons: AddonRow[]): PackageRecord {
  return {
    id: r.id, tier: r.tier, name: r.name, tag: r.tag, price: r.price, dep: r.deposit_pct / 100,
    hours: r.hours, cov: r.coverage, delivery: r.delivery, deliveryUnit: r.delivery_unit, live: !!r.live,
    blurb: r.blurb, includes: jsonList(r.includes), notes: jsonList(r.notes),
    addons: addons.filter((a) => a.package_id === r.id).sort((a, b) => a.sort - b.sort).map(addonFromRow),
    published: !!r.published, sort: r.sort, updatedAt: r.updated_at, updatedBy: r.updated_by ?? undefined,
  }
}

/* ---------- reads ---------- */

export async function readPackages(db: D1, opts: { publishedOnly?: boolean; id?: string } = {}): Promise<PackageRecord[]> {
  const where = opts.id ? 'WHERE id = ?1' : opts.publishedOnly ? 'WHERE published = 1' : ''
  const pkgs = db.prepare(`SELECT * FROM packages ${where} ORDER BY sort, name`)
  const adds = db.prepare(opts.id ? 'SELECT * FROM addons WHERE package_id = ?1' : 'SELECT * FROM addons')
  const [p, a] = await Promise.all([
    (opts.id ? pkgs.bind(opts.id) : pkgs).all<PackageRow>(),
    (opts.id ? adds.bind(opts.id) : adds).all<AddonRow>(),
  ])
  return p.results.map((r) => packageFromRow(r, a.results))
}

export async function readSettings(db: D1): Promise<BookingSettings> {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?1').bind('booking').first<{ value: string }>()
  if (!row) return { ...BOOKING_DEFAULTS }
  try { return { ...BOOKING_DEFAULTS, ...JSON.parse(row.value) } } catch { return { ...BOOKING_DEFAULTS } }
}

export function staticCatalog(): Catalog {
  return { source: 'static', services: SERVICES, settings: BOOKING_DEFAULTS }
}

/* Published packages and the booking settings, or the built-in catalogue when
   there is no database, it has no published packages yet, or it cannot be
   read: a CMS outage degrades to the shipped prices rather than an empty
   page. The booking API prices requests from this same answer. */
export async function loadCatalog(db: D1 | null): Promise<Catalog> {
  if (!db) return staticCatalog()
  try {
    const [packages, settings] = await Promise.all([readPackages(db, { publishedOnly: true }), readSettings(db)])
    if (!packages.length) return { ...staticCatalog(), settings }
    const services = packages.map(({ published: _p, sort: _s, updatedAt: _u, updatedBy: _b, ...service }) => service)
    return { source: 'cms', services, settings }
  } catch (e) {
    console.error('catalog read failed', e instanceof Error ? e.message : e)
    return staticCatalog()
  }
}

/** 409 when another package already uses this name (any case): two "Weddings" would confuse clients. */
export async function assertNameFree(db: D1, name: string, exceptId: string): Promise<void> {
  const clash = await db.prepare('SELECT id FROM packages WHERE lower(name) = lower(?1) AND id != ?2').bind(name, exceptId).first()
  if (clash) throw createError({ statusCode: 409, statusMessage: 'That name is taken', data: { name: 'Another package already has this name. Choose a different one.' } })
}

/* ---------- writes ---------- */

/** Package and its add-ons in one transaction: the add-on list is replaced wholesale. */
export async function writePackage(db: D1, p: PackageRecord, by: string): Promise<void> {
  const upsert = db.prepare(`
    INSERT INTO packages (id, tier, name, tag, price, deposit_pct, hours, coverage, delivery, delivery_unit,
      live, blurb, includes, notes, sort, published, updated_at, updated_by)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, datetime('now'), ?17)
    ON CONFLICT(id) DO UPDATE SET tier = ?2, name = ?3, tag = ?4, price = ?5, deposit_pct = ?6, hours = ?7,
      coverage = ?8, delivery = ?9, delivery_unit = ?10, live = ?11, blurb = ?12, includes = ?13, notes = ?14,
      sort = ?15, published = ?16, updated_at = datetime('now'), updated_by = ?17`)
    .bind(p.id, p.tier, p.name, p.tag, p.price, Math.round(p.dep * 100), p.hours, p.cov, p.delivery, p.deliveryUnit,
      p.live ? 1 : 0, p.blurb, JSON.stringify(p.includes), JSON.stringify(p.notes), p.sort, p.published ? 1 : 0, by)
  const clear = db.prepare('DELETE FROM addons WHERE package_id = ?1').bind(p.id)
  const inserts = p.addons.map((a, i) => db.prepare(`
    INSERT INTO addons (package_id, id, name, unit, type, price, max, description, affects, sort)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`)
    .bind(p.id, a.id, a.name, a.unit, a.type, a.price, a.max ?? null, a.d, a.affects ?? null, i))
  await db.batch([upsert, clear, ...inserts])
}

export async function writeSettings(db: D1, s: BookingSettings, by: string): Promise<void> {
  await db.prepare(`
    INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('booking', ?1, datetime('now'), ?2)
    ON CONFLICT(key) DO UPDATE SET value = ?1, updated_at = datetime('now'), updated_by = ?2`)
    .bind(JSON.stringify(s), by).run()
}
