/* A small iCalendar reader. It reduces a calendar feed to busy intervals:
   start and end instants, nothing else. Titles, attendees and notes are
   never kept, so nothing private can leave the worker.

   Handles what real calendars emit: folded lines, UTC / TZID / floating
   times, all-day events, DURATION, repeating events (DAILY, WEEKLY, MONTHLY,
   YEARLY with INTERVAL, COUNT, UNTIL, BYDAY, BYMONTHDAY, BYSETPOS), EXDATE, and
   RECURRENCE-ID overrides. Cancelled events are skipped. Everything else on
   the calendar counts as busy, including events marked "free": the rule for
   the studio is simply "if it is on the calendar, that time is taken". */

export interface Busy { s: number; e: number }
export interface IcsOptions {
  /** Window of interest, epoch ms. Intervals outside it are dropped. */
  from: number
  to: number
  /** Studio offset from UTC in minutes; places all-day and floating times. */
  offsetMin: number
}

const DAY = 86_400_000
const WD = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const MAX_STEPS = 20_000

interface Prop { name: string; params: Record<string, string>; value: string }
/** A wall-clock reading: ms is Date.UTC() of its components, not an instant. */
interface Wall { ms: number; isDate: boolean; utc: boolean; tz?: string }
interface Rule { freq: string; interval: number; count?: number; until?: number; byday: { ord: number; day: number }[]; bymonthday: number[]; bysetpos: number[]; wkst: number }
interface RawEvent { uid: string; start?: Wall; end?: Wall; duration?: number; rule?: Rule; exdates: Wall[]; recurrenceId?: Wall; cancelled: boolean }

function unfold(text: string): string[] {
  return text.replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '').split('\n')
}

function parseLine(line: string): Prop | null {
  let inQuote = false
  let colon = -1
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') inQuote = !inQuote
    else if (c === ':' && !inQuote) { colon = i; break }
  }
  if (colon < 1) return null
  const head = line.slice(0, colon).split(';')
  const params: Record<string, string> = {}
  for (const p of head.slice(1)) {
    const eq = p.indexOf('=')
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, '')
  }
  return { name: head[0]!.toUpperCase(), params, value: line.slice(colon + 1) }
}

function parseWall(value: string, params: Record<string, string>): Wall | null {
  const m = value.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/)
  if (!m) return null
  const isDate = m[4] === undefined
  return {
    ms: Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, isDate ? 0 : +m[4]!, isDate ? 0 : +m[5]!, isDate ? 0 : +m[6]!),
    isDate, utc: !!m[7], tz: params.TZID,
  }
}

const dtfCache = new Map<string, Intl.DateTimeFormat | null>()
function tzOffsetMs(utcMs: number, tz: string): number | null {
  let dtf = dtfCache.get(tz)
  if (dtf === undefined) {
    try {
      dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch { dtf = null } // unknown zone name (some Outlook feeds)
    dtfCache.set(tz, dtf)
  }
  if (!dtf) return null
  const p: Record<string, number> = {}
  for (const part of dtf.formatToParts(new Date(utcMs))) if (part.type !== 'literal') p[part.type] = +part.value
  return Date.UTC(p.year!, p.month! - 1, p.day!, p.hour! % 24, p.minute!, p.second!) - utcMs
}

/** Wall-clock reading to a real instant, by the zone rule the event carries. */
function toInstant(wallMs: number, zone: Pick<Wall, 'isDate' | 'utc' | 'tz'>, offsetMin: number): number {
  if (zone.utc && !zone.isDate) return wallMs
  if (!zone.isDate && zone.tz) {
    const off = tzOffsetMs(wallMs, zone.tz)
    if (off != null) {
      const guess = wallMs - off
      const off2 = tzOffsetMs(guess, zone.tz)
      return off2 != null && off2 !== off ? wallMs - off2 : guess
    }
  }
  return wallMs - offsetMin * 60_000 // all-day, floating, or unknown zone: studio time
}

function parseDuration(v: string): number | undefined {
  const m = v.trim().match(/^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/)
  if (!m) return undefined
  const ms = (+(m[2] || 0)) * 7 * DAY + (+(m[3] || 0)) * DAY + (+(m[4] || 0)) * 3_600_000 + (+(m[5] || 0)) * 60_000 + (+(m[6] || 0)) * 1000
  return m[1] === '-' ? -ms : ms
}

function parseRule(v: string, offsetMin: number): Rule | undefined {
  const kv: Record<string, string> = {}
  for (const part of v.split(';')) { const [k, val] = part.split('='); if (k && val) kv[k.toUpperCase()] = val }
  if (!kv.FREQ) return undefined
  const rule: Rule = { freq: kv.FREQ.toUpperCase(), interval: Math.max(1, +(kv.INTERVAL || 1) || 1), byday: [], bymonthday: [], bysetpos: [], wkst: Math.max(0, WD.indexOf((kv.WKST || 'MO').toUpperCase())) }
  if (kv.COUNT) rule.count = +kv.COUNT
  if (kv.UNTIL) { const w = parseWall(kv.UNTIL, {}); if (w) rule.until = w.isDate ? toInstant(w.ms, w, offsetMin) + DAY - 1 : toInstant(w.ms, w, offsetMin) }
  if (kv.BYDAY) for (const d of kv.BYDAY.split(',')) { const m = d.trim().toUpperCase().match(/^([+-]?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/); if (m) rule.byday.push({ ord: m[1] ? +m[1] : 0, day: WD.indexOf(m[2]!) }) }
  if (kv.BYMONTHDAY) rule.bymonthday = kv.BYMONTHDAY.split(',').map(Number).filter((n) => n && Math.abs(n) <= 31)
  // Outlook writes "second Saturday" as BYDAY=SA;BYSETPOS=2 rather than BYDAY=2SA
  if (kv.BYSETPOS) rule.bysetpos = kv.BYSETPOS.split(',').map(Number).filter((n) => n && Math.abs(n) <= 366)
  return rule
}

const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate()

/** Occurrence start times as wall-clock ms, in order, from the series start. */
function* occurrences(startWall: number, rule: Rule, limitWall: number): Generator<number> {
  const s = new Date(startWall)
  const tod = ((startWall % DAY) + DAY) % DAY
  const dayStart = startWall - tod
  let steps = 0
  if (rule.freq === 'DAILY') {
    // Outlook's "every weekday" is FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR: BYDAY narrows the days
    const days = rule.byday.map((b) => b.day)
    for (let n = 0; ; n++) {
      const t = startWall + n * rule.interval * DAY
      if (t > limitWall || ++steps > MAX_STEPS) return
      if (days.length && !days.includes(new Date(t).getUTCDay())) continue
      yield t
    }
  } else if (rule.freq === 'WEEKLY') {
    const days = rule.byday.length ? rule.byday.map((b) => b.day) : [s.getUTCDay()]
    const offs = [...new Set(days.map((d) => (d - rule.wkst + 7) % 7))].sort((a, b) => a - b)
    const weekStart = dayStart - ((s.getUTCDay() - rule.wkst + 7) % 7) * DAY
    for (let w = 0; ; w++) {
      const base = weekStart + w * rule.interval * 7 * DAY
      if (base > limitWall || ++steps > MAX_STEPS) return
      for (const o of offs) { const t = base + o * DAY + tod; if (t < startWall) continue; if (t > limitWall) return; yield t }
    }
  } else if (rule.freq === 'MONTHLY' || rule.freq === 'YEARLY') {
    const stepMonths = rule.freq === 'YEARLY' ? 12 * rule.interval : rule.interval
    for (let n = 0; ; n++) {
      const idx = s.getUTCFullYear() * 12 + s.getUTCMonth() + n * stepMonths
      const y = Math.floor(idx / 12), m = idx % 12
      if (Date.UTC(y, m, 1) > limitWall || ++steps > MAX_STEPS) return
      const dim = daysIn(y, m)
      const picks: number[] = []
      if (rule.byday.length && rule.freq === 'MONTHLY') {
        for (const { ord, day } of rule.byday) {
          const matches: number[] = []
          for (let d = 1; d <= dim; d++) if (new Date(Date.UTC(y, m, d)).getUTCDay() === day) matches.push(d)
          if (ord === 0) picks.push(...matches)
          else { const pick = ord > 0 ? matches[ord - 1] : matches[matches.length + ord]; if (pick) picks.push(pick) }
        }
      } else if (rule.bymonthday.length) {
        for (const d of rule.bymonthday) { const day = d > 0 ? d : dim + d + 1; if (day >= 1 && day <= dim) picks.push(day) }
      } else if (s.getUTCDate() <= dim) picks.push(s.getUTCDate())
      let chosen = [...new Set(picks)].sort((a, b) => a - b)
      if (rule.bysetpos.length) {
        chosen = rule.bysetpos.map((p) => (p > 0 ? chosen[p - 1] : chosen[chosen.length + p]))
          .filter((d): d is number => d != null).sort((a, b) => a - b)
      }
      for (const d of chosen) {
        const t = Date.UTC(y, m, d) + tod
        if (t < startWall) continue
        if (t > limitWall) return
        yield t
      }
    }
  }
}

/** Sort and fuse overlapping or touching intervals. */
export function mergeBusy(list: Busy[]): Busy[] {
  const sorted = [...list].sort((a, b) => a.s - b.s)
  const out: Busy[] = []
  for (const b of sorted) {
    const last = out[out.length - 1]
    if (last && b.s <= last.e) last.e = Math.max(last.e, b.e)
    else out.push({ s: b.s, e: b.e })
  }
  return out
}

export function parseIcs(text: string, opts: IcsOptions): Busy[] {
  const events: RawEvent[] = []
  let cur: RawEvent | null = null
  let nested = 0
  for (const line of unfold(text)) {
    if (!line) continue
    const p = parseLine(line)
    if (!p) continue
    if (p.name === 'BEGIN') {
      if (p.value.toUpperCase() === 'VEVENT') { cur = { uid: '', exdates: [], cancelled: false }; nested = 0 }
      else if (cur) nested++ // VALARM and friends inside an event
      continue
    }
    if (p.name === 'END') {
      if (p.value.toUpperCase() === 'VEVENT') { if (cur) events.push(cur); cur = null }
      else if (cur && nested > 0) nested--
      continue
    }
    if (!cur || nested > 0) continue
    switch (p.name) {
      case 'UID': cur.uid = p.value.trim(); break
      case 'DTSTART': cur.start = parseWall(p.value, p.params) ?? undefined; break
      case 'DTEND': cur.end = parseWall(p.value, p.params) ?? undefined; break
      case 'DURATION': cur.duration = parseDuration(p.value); break
      case 'RRULE': cur.rule = parseRule(p.value, opts.offsetMin); break
      case 'EXDATE': for (const v of p.value.split(',')) { const w = parseWall(v, p.params); if (w) cur.exdates.push(w) } break
      case 'RECURRENCE-ID': cur.recurrenceId = parseWall(p.value, p.params) ?? undefined; break
      case 'STATUS': cur.cancelled = p.value.trim().toUpperCase() === 'CANCELLED'; break
    }
  }

  // an override (RECURRENCE-ID) replaces one instance of its series
  const replaced = new Map<string, Set<number>>()
  for (const ev of events) {
    if (!ev.recurrenceId || !ev.uid) continue
    const set = replaced.get(ev.uid) ?? new Set<number>()
    set.add(toInstant(ev.recurrenceId.ms, ev.recurrenceId, opts.offsetMin))
    replaced.set(ev.uid, set)
  }

  const out: Busy[] = []
  const push = (s: number, len: number) => { const e = s + len; if (len > 0 && e > opts.from && s < opts.to) out.push({ s, e }) }

  for (const ev of events) {
    if (ev.cancelled || !ev.start) continue
    const s0 = toInstant(ev.start.ms, ev.start, opts.offsetMin)
    let len = 0
    if (ev.end) len = toInstant(ev.end.ms, ev.end, opts.offsetMin) - s0
    else if (ev.duration != null) len = ev.duration
    else if (ev.start.isDate) len = DAY
    if (len <= 0) continue

    if (!ev.rule || ev.recurrenceId) { push(s0, len); continue }

    const skip = new Set<number>(ev.exdates.map((w) => toInstant(w.ms, w, opts.offsetMin)))
    for (const t of replaced.get(ev.uid) ?? []) skip.add(t)
    let n = 0
    for (const wall of occurrences(ev.start.ms, ev.rule, opts.to + 2 * DAY)) {
      const s = toInstant(wall, ev.start, opts.offsetMin)
      if (ev.rule.until != null && s > ev.rule.until) break
      if (ev.rule.count != null && ++n > ev.rule.count) break
      if (s >= opts.to) break
      if (!skip.has(s)) push(s, len)
    }
  }
  return mergeBusy(out)
}
