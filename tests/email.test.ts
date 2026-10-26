import { describe, it, expect } from 'vitest'
import { SERVICES } from '~/content/services'
import type { Booking } from '~/utils/booking'
import { esc, renderEmail } from '../server/utils/emailLayout'
import { studioNewBookingMail, clientReceivedMail, clientApprovedMail, clientClosedMail, formMail } from '../server/utils/bookingMail'

const wedding = SERVICES.find((s) => s.id === 'wedding')!
const booking = (over: Partial<Booking> = {}): Booking => ({
  ref: 'TM-KE6WCW', status: 'pending', packageId: 'wedding', packageName: 'Weddings', package: wedding,
  date: '2026-11-11', start: '09:00', requestedHours: 11, approvedHours: null, addons: { time: 1 },
  total: 8500, deposit: 4250, depositPct: 50, tbq: false, deliveryText: '6 weeks',
  name: 'Mutale Banda', partner: '', email: 'mutale@example.com', phone: '0966 000 000', venue: '', region: 'Within the Copperbelt',
  guests: '', heard: '', notes: '', termsVersion: 'v1', privacyVersion: 'v1', termsFingerprint: '', marketingConsent: false,
  acceptedAt: '', createdAt: '', decidedAt: null, decidedBy: null, decisionNote: '', ...over,
})

describe('email layout', () => {
  it('escapes everything a visitor typed', () => {
    expect(esc('<b onload="x">Tom & Jerry\'s</b>')).toBe('&lt;b onload=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/b&gt;')
    const html = studioNewBookingMail(booking({ name: '<script>alert(1)</script>', notes: '<img src=x onerror=alert(1)>' }), 'https://tmiladzi.com/admin/bookings/TM-KE6WCW').html
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;script&gt;')
  })
  it('carries the logo (with alt text), preheader and footer', () => {
    const html = renderEmail({ eyebrow: 'Test', title: 'Hello', preheader: 'Preview line', blocks: [{ p: 'Body' }] })
    expect(html).toContain('https://tmiladzi.com/brand/tmiladzi-logo-email.png')
    expect(html).toContain('alt="Tmiladzi Media"')
    expect(html).toContain('Preview line')
    expect(html).toContain('3 Chitambo Road')
  })
})

describe('booking emails', () => {
  it('the receipt carries the reference and mobile money details, in HTML and text', () => {
    const m = clientReceivedMail(booking())
    for (const part of [m.html, m.text]) {
      expect(part).toContain('TM-KE6WCW')
      expect(part).toContain('0974 901 668')
      expect(part).toContain('K4,250')
    }
  })
  it('the confirmation shows the session the studio set', () => {
    const m = clientApprovedMail(booking({ status: 'approved', approvedHours: 13, total: 11500, deposit: 5750, addons: { time: 3 } }))
    expect(m.subject).toContain('confirmed')
    expect(m.html).toContain('09:00 – 22:00 (13 hours)')
    expect(m.html).toContain('K5,750')
  })
  it('a decline offers another date and carries the note', () => {
    const m = clientClosedMail(booking({ status: 'declined', decisionNote: 'We are away that weekend.' }))
    expect(m.html).toContain('We are away that weekend.')
    expect(m.html).toContain('/booking')
    expect(m.text).toContain('cannot take it on')
  })
  it('the studio email links to the admin', () => {
    expect(studioNewBookingMail(booking(), 'https://tmiladzi.com/admin/bookings/TM-KE6WCW').html).toContain('href="https://tmiladzi.com/admin/bookings/TM-KE6WCW"')
  })
  it('a brief keeps its text, escaped', () => {
    expect(formMail('brief', 'Project brief', 'Org: A & B <Ltd>')).toContain('Org: A &amp; B &lt;Ltd&gt;')
  })
})
