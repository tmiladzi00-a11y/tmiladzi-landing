import type { Booking } from '../../app/utils/booking'
import { momoLine, paymentLines, sessionRange } from '../../app/utils/booking'
import { SITE } from '../../app/content/site'
import { fmtDate } from '../../app/utils/dates'
import { fmtMoney } from '../../app/utils/money'
import { renderEmail, type EmailBlock } from './emailLayout'

/* The emails a booking sends: the studio hears of every request, the client
   gets a receipt at once and hears again when staff accept, decline or cancel
   it. Each is HTML in the site's look plus a plain-text twin, written from
   the stored record, never from anything the browser composed. */

export interface BookingMail { subject: string; text: string; html: string }

const k = (n: number) => 'K' + fmtMoney(n)
const hoursLabel = (n: number) => `${n} hour${n === 1 ? '' : 's'}`

/** Package, add-ons and money, as label/value rows and as text lines. */
function money(b: Booking): { rows: [string, string][]; lines: string[] } {
  const rows: [string, string][] = [['Package', `${b.packageName} · ${b.package.cov ?? ''}`.replace(/ · $/, '')]]
  for (const [id, q] of Object.entries(b.addons)) {
    const a = b.package.addons?.find((x) => x.id === id)
    if (a) rows.push([`+ ${a.name}${q > 1 ? ' × ' + q : ''}`, a.price == null ? 'Quoted separately' : k(a.price * q)])
  }
  rows.push(['Total', (b.total ? k(b.total) : 'On request') + (b.tbq ? ' plus items quoted separately' : '')])
  if (b.total) rows.push(['Deposit', `${k(b.deposit)} (${b.depositPct}%)`])
  return { rows, lines: rows.map(([l, v]) => `${l.padEnd(10)}: ${v}`) }
}

/** The mobile money panel: amount, number, reference. */
function paymentPanel(b: Booking, lead: string): EmailBlock {
  return {
    panel: {
      label: b.total ? `Deposit ${k(b.deposit)} by mobile money` : 'Deposit by mobile money',
      lines: [lead, `Pay to ${momoLine(SITE.momo)}`, `Reference: ${b.ref}`, 'Your date is held for 72 hours after we confirm it; the balance is due on delivery.'],
    },
  }
}

const whatsapp: EmailBlock = { button: { href: SITE.whatsapp, label: 'Message us on WhatsApp' } }
const signoff = (t: string[]) => [...t, '', `Questions? Reply to this email or WhatsApp ${SITE.phone}.`, '', 'Tmiladzi Media']

export function studioNewBookingMail(b: Booking, adminUrl: string): BookingMail {
  const m = money(b)
  const when = `${fmtDate(b.date)}, from ${b.start}`
  const rows: [string, string][] = [
    ['Reference', b.ref], ['Date', when], ['Asked for', `About ${hoursLabel(b.requestedHours)}`],
    ['Client', b.name + (b.partner ? ' & ' + b.partner : '')], ['Email', b.email], ['Phone', b.phone],
    ['Venue', `${b.venue || '—'} (${b.region || '—'})`], ['Guests', b.guests || '—'], ...m.rows,
  ]
  return {
    subject: `New booking request ${b.ref}: ${b.packageName}, ${fmtDate(b.date)}`,
    text: [`A booking request is waiting for approval: ${adminUrl}`, '', ...rows.map(([l, v]) => `${l.padEnd(10)}: ${v}`), '', 'NOTES', b.notes || '-'].join('\n'),
    html: renderEmail({
      eyebrow: 'New booking request', tone: 'copper',
      title: `${b.name} · ${b.packageName}`,
      preheader: `${when}. Waiting for you to accept or decline.`,
      blocks: [
        { p: 'A booking request is waiting for you. It holds no time on the calendar until you accept it.' },
        { button: { href: adminUrl, label: 'Accept or decline' } },
        { rows },
        { quote: { label: 'What matters to them', text: b.notes || 'No notes.' } },
      ],
    }),
  }
}

export function clientReceivedMail(b: Booking): BookingMail {
  const m = money(b)
  const rows: [string, string][] = [['Reference', b.ref], ['Date', fmtDate(b.date)], ['Time', b.start], ...m.rows]
  const lead = 'Nothing to pay yet. Once we confirm your date, pay the deposit to:'
  return {
    subject: `We have your booking request ${b.ref}`,
    text: signoff([
      `Dear ${b.name},`, '',
      'Thank you. We have your booking request and will confirm the date, and how long your session runs, within one working day.', '',
      ...rows.map(([l, v]) => `${l.padEnd(10)}: ${v}`), '',
      ...paymentLines(SITE.momo, b.ref, b.total ? b.deposit : null),
    ]).join('\n'),
    html: renderEmail({
      eyebrow: 'Request received', tone: 'copper',
      title: 'We have your booking request.',
      preheader: `Reference ${b.ref}. We confirm within one working day.`,
      blocks: [
        { p: `Dear ${b.name},` },
        { p: 'Thank you. We will confirm the date, and how long your session runs, within one working day. Keep your reference handy.' },
        { rows },
        paymentPanel(b, lead),
        whatsapp,
      ],
    }),
  }
}

export function clientApprovedMail(b: Booking): BookingMail {
  const hours = b.approvedHours ?? b.requestedHours
  const m = money(b)
  const rows: [string, string][] = [['Reference', b.ref], ['Date', fmtDate(b.date)], ['Time', `${sessionRange(b.date, b.start, hours)} (${hoursLabel(hours)})`], ...m.rows]
  const lead = 'Your date is confirmed. Pay the deposit to hold it:'
  return {
    subject: `Your booking ${b.ref} is confirmed: ${fmtDate(b.date)}`,
    text: signoff([
      `Dear ${b.name},`, '',
      `We are free and would love to cover it. Your booking ${b.ref} is confirmed:`, '',
      ...rows.map(([l, v]) => `${l.padEnd(10)}: ${v}`), '',
      ...paymentLines(SITE.momo, b.ref, b.total ? b.deposit : null),
      ...(b.decisionNote ? ['', b.decisionNote] : []),
    ]).join('\n'),
    html: renderEmail({
      eyebrow: 'Booking confirmed', tone: 'green',
      title: `See you on ${fmtDate(b.date)}.`,
      preheader: `${sessionRange(b.date, b.start, hours)}. Deposit details inside.`,
      blocks: [
        { p: `Dear ${b.name},` },
        { p: 'We are free and would love to cover it. Your booking is confirmed:' },
        { rows },
        ...(b.decisionNote ? [{ quote: { label: 'A note from the studio', text: b.decisionNote } } as EmailBlock] : []),
        paymentPanel(b, lead),
        whatsapp,
      ],
    }),
  }
}

export function clientClosedMail(b: Booking): BookingMail {
  const declined = b.status === 'declined'
  const lead = declined
    ? `Thank you for your request for ${fmtDate(b.date)}. Unfortunately we cannot take it on.`
    : `Your booking for ${fmtDate(b.date)} (${b.ref}) has been cancelled.`
  const after = 'If another date would work, or you would like to talk it through, WhatsApp us or reply to this email.'
  return {
    subject: declined ? `Your booking request ${b.ref}` : `Your booking ${b.ref} has been cancelled`,
    text: signoff([`Dear ${b.name},`, '', lead, ...(b.decisionNote ? ['', b.decisionNote] : []), '', after]).join('\n'),
    html: renderEmail({
      eyebrow: declined ? 'Booking request' : 'Booking cancelled', tone: 'grey',
      title: declined ? 'We cannot take this one on.' : 'Your booking is cancelled.',
      preheader: lead,
      blocks: [
        { p: `Dear ${b.name},` },
        { p: lead },
        ...(b.decisionNote ? [{ quote: { label: 'A note from the studio', text: b.decisionNote } } as EmailBlock] : []),
        { p: after },
        { button: { href: `${SITE.url}/booking`, label: 'Choose another date' } },
      ],
    }),
  }
}

/** A brief, or (with no bookings database) a booking request, composed by the site's forms. */
export function formMail(kind: 'brief' | 'booking', subject: string, text: string): string {
  return renderEmail({
    eyebrow: kind === 'brief' ? 'New project brief' : 'New booking request', tone: 'copper',
    title: subject,
    preheader: text.split('\n').find((l) => l.trim()) ?? subject,
    blocks: [{ p: 'Sent from the website. Reply to this email to answer the sender directly.' }, { pre: text }],
  })
}
