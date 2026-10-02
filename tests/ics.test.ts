import { describe, it, expect } from 'vitest'
import { parseIcs, mergeBusy } from '../server/utils/ics'

const OFFSET = 120 // Africa/Lusaka, UTC+2
const utc = (s: string) => Date.parse(s)
const opts = { from: utc('2026-01-01T00:00:00Z'), to: utc('2027-12-31T00:00:00Z'), offsetMin: OFFSET }
const cal = (...events: string[]) => ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events, 'END:VCALENDAR'].join('\r\n')
const ev = (...lines: string[]) => ['BEGIN:VEVENT', ...lines, 'END:VEVENT'].join('\r\n')

describe('single events', () => {
  it('reads a UTC event', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20261010T070000Z', 'DTEND:20261010T080000Z', 'SUMMARY:Private')), opts)
    expect(b).toEqual([{ s: utc('2026-10-10T07:00:00Z'), e: utc('2026-10-10T08:00:00Z') }])
  })
  it('never returns anything but start and end', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20261010T070000Z', 'DTEND:20261010T080000Z', 'SUMMARY:Katebe wedding', 'DESCRIPTION:secret', 'LOCATION:Lusaka')), opts)
    expect(Object.keys(b[0]!).sort()).toEqual(['e', 's'])
  })
  it('converts a TZID time: 09:00 in Lusaka is 07:00 UTC', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART;TZID=Africa/Lusaka:20261010T090000', 'DTEND;TZID=Africa/Lusaka:20261010T100000')), opts)
    expect(b[0]).toEqual({ s: utc('2026-10-10T07:00:00Z'), e: utc('2026-10-10T08:00:00Z') })
  })
  it('follows daylight saving in other zones', () => {
    const summer = parseIcs(cal(ev('UID:a', 'DTSTART;TZID=America/New_York:20260707T090000', 'DTEND;TZID=America/New_York:20260707T100000')), opts)
    const winter = parseIcs(cal(ev('UID:b', 'DTSTART;TZID=America/New_York:20260112T090000', 'DTEND;TZID=America/New_York:20260112T100000')), opts)
    expect(summer[0]!.s).toBe(utc('2026-07-07T13:00:00Z'))
    expect(winter[0]!.s).toBe(utc('2026-01-12T14:00:00Z'))
  })
  it('places a floating time and an unknown zone in studio time', () => {
    const floating = parseIcs(cal(ev('UID:a', 'DTSTART:20261010T090000', 'DTEND:20261010T100000')), opts)
    const unknown = parseIcs(cal(ev('UID:b', 'DTSTART;TZID=Not/AZone:20261010T090000', 'DTEND;TZID=Not/AZone:20261010T100000')), opts)
    expect(floating[0]!.s).toBe(utc('2026-10-10T07:00:00Z'))
    expect(unknown[0]!.s).toBe(utc('2026-10-10T07:00:00Z'))
  })
  it('treats an all-day event as studio midnight to midnight', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART;VALUE=DATE:20261017', 'DTEND;VALUE=DATE:20261018')), opts)
    expect(b[0]).toEqual({ s: utc('2026-10-16T22:00:00Z'), e: utc('2026-10-17T22:00:00Z') })
  })
  it('gives an all-day event with no end one day', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART;VALUE=DATE:20261017')), opts)
    expect(b[0]!.e - b[0]!.s).toBe(86_400_000)
  })
  it('honours DURATION', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20261010T070000Z', 'DURATION:PT4H30M')), opts)
    expect(b[0]!.e).toBe(utc('2026-10-10T11:30:00Z'))
  })
  it('skips cancelled events and events with no length', () => {
    const b = parseIcs(cal(
      ev('UID:a', 'DTSTART:20261010T070000Z', 'DTEND:20261010T080000Z', 'STATUS:CANCELLED'),
      ev('UID:b', 'DTSTART:20261011T070000Z'),
    ), opts)
    expect(b).toEqual([])
  })
  it('counts events marked free as busy: on the calendar means taken', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART;VALUE=DATE:20261017', 'DTEND;VALUE=DATE:20261018', 'TRANSP:TRANSPARENT')), opts)
    expect(b).toHaveLength(1)
  })
  it('unfolds long lines and ignores alarms inside an event', () => {
    const text = cal(['BEGIN:VEVENT', 'UID:a', 'DTSTART:20261010T0700', ' 00Z', 'DTEND:20261010T080000Z', 'BEGIN:VALARM', 'TRIGGER:-PT15M', 'DTSTART:19990101T000000Z', 'END:VALARM', 'END:VEVENT'].join('\r\n'))
    expect(parseIcs(text, opts)).toEqual([{ s: utc('2026-10-10T07:00:00Z'), e: utc('2026-10-10T08:00:00Z') }])
  })
  it('drops events outside the window', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20250101T070000Z', 'DTEND:20250101T080000Z')), opts)
    expect(b).toEqual([])
  })
})

describe('repeating events', () => {
  it('expands a weekly rule with BYDAY and COUNT', () => {
    // Tuesdays and Thursdays 15:00 Lusaka, four occurrences from Tue 6 Oct 2026
    const b = parseIcs(cal(ev('UID:a', 'DTSTART;TZID=Africa/Lusaka:20261006T150000', 'DTEND;TZID=Africa/Lusaka:20261006T160000', 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=4')), opts)
    expect(b.map((x) => new Date(x.s).toISOString())).toEqual([
      '2026-10-06T13:00:00.000Z', '2026-10-08T13:00:00.000Z', '2026-10-13T13:00:00.000Z', '2026-10-15T13:00:00.000Z',
    ])
  })
  it('respects INTERVAL and UNTIL', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20261003T070000Z', 'DTEND:20261003T080000Z', 'RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=20261101T000000Z')), opts)
    expect(b.map((x) => new Date(x.s).toISOString().slice(0, 10))).toEqual(['2026-10-03', '2026-10-17', '2026-10-31'])
  })
  it('removes EXDATE instances', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20261005T070000Z', 'DTEND:20261005T080000Z', 'RRULE:FREQ=DAILY;COUNT=4', 'EXDATE:20261006T070000Z,20261007T070000Z')), opts)
    expect(b.map((x) => new Date(x.s).toISOString().slice(0, 10))).toEqual(['2026-10-05', '2026-10-08'])
  })
  it('lets a RECURRENCE-ID override move one instance', () => {
    const b = parseIcs(cal(
      ev('UID:a', 'DTSTART:20261005T070000Z', 'DTEND:20261005T080000Z', 'RRULE:FREQ=WEEKLY;COUNT=3'),
      ev('UID:a', 'RECURRENCE-ID:20261012T070000Z', 'DTSTART:20261012T140000Z', 'DTEND:20261012T150000Z'),
    ), opts)
    expect(b.map((x) => new Date(x.s).toISOString())).toEqual(['2026-10-05T07:00:00.000Z', '2026-10-12T14:00:00.000Z', '2026-10-19T07:00:00.000Z'])
  })
  it('handles the second Saturday of each month', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20261010T070000Z', 'DTEND:20261010T080000Z', 'RRULE:FREQ=MONTHLY;BYDAY=2SA;COUNT=3')), opts)
    expect(b.map((x) => new Date(x.s).toISOString().slice(0, 10))).toEqual(['2026-10-10', '2026-11-14', '2026-12-12'])
  })
  it('reads the second Saturday the way Outlook writes it: BYDAY=SA;BYSETPOS=2', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20261010T070000Z', 'DTEND:20261010T080000Z', 'RRULE:FREQ=MONTHLY;BYDAY=SA;BYSETPOS=2;COUNT=3')), opts)
    expect(b.map((x) => new Date(x.s).toISOString().slice(0, 10))).toEqual(['2026-10-10', '2026-11-14', '2026-12-12'])
  })
  it('keeps a daily rule to its BYDAY weekdays', () => {
    // Fri 9 Oct 2026, every weekday, three times: Fri, Mon, Tue
    const b = parseIcs(cal(ev('UID:a', 'DTSTART:20261009T070000Z', 'DTEND:20261009T080000Z', 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;COUNT=3')), opts)
    expect(b.map((x) => new Date(x.s).toISOString().slice(0, 10))).toEqual(['2026-10-09', '2026-10-12', '2026-10-13'])
  })
  it('skips months that lack the day without spending the count', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART;VALUE=DATE:20260131', 'RRULE:FREQ=MONTHLY;COUNT=3')), opts)
    expect(b.map((x) => new Date(x.s + OFFSET * 60_000).toISOString().slice(0, 10))).toEqual(['2026-01-31', '2026-03-31', '2026-05-31'])
  })
  it('repeats yearly and stops at the window', () => {
    const b = parseIcs(cal(ev('UID:a', 'DTSTART;VALUE=DATE:20200524', 'RRULE:FREQ=YEARLY')), opts)
    expect(b.map((x) => new Date(x.s + OFFSET * 60_000).toISOString().slice(0, 10))).toEqual(['2026-05-24', '2027-05-24'])
  })
})

describe('merging', () => {
  it('fuses overlapping and touching intervals', () => {
    expect(mergeBusy([{ s: 10, e: 20 }, { s: 20, e: 30 }, { s: 25, e: 40 }, { s: 50, e: 60 }])).toEqual([{ s: 10, e: 40 }, { s: 50, e: 60 }])
  })
})
