import { SITE } from '../../app/content/site'

/* The site's emails as HTML: the dark ink header and wordmark from the site,
   then a light body that every mail app renders faithfully (Outlook and
   Gmail's dark mode mangle fully dark emails). Tables and inline styles only,
   since mail clients ignore most CSS. Web fonts do not load in mail, so the
   site's faces fall back to their nearest system relatives: Archivo to a
   heavy sans, Newsreader to Georgia, IBM Plex Mono to a monospace.

   Every string is escaped here: names and notes are typed by visitors and
   must never become markup in the studio's inbox. */

const C = {
  page: '#EEF1EE', card: '#FFFFFF', ink: '#0B0F0D', ink2: '#141A17', onInk: '#E9EFEA', onInkDim: '#A9B6AF',
  text: '#17201C', muted: '#5A6660', line: '#E2E7E3',
  green: '#43BE8B', greenFill: '#2E9B6E', onGreen: '#04140D',
  // darker than the site's copper, so it keeps AA contrast on white
  copper: '#9A5A2C', copperBright: '#E09A63', copperTint: '#FBF3EC', copperLine: '#E8C9AE',
}
const SANS = "'Archivo', 'Helvetica Neue', Arial, sans-serif"
const SERIF = "'Newsreader', Georgia, 'Times New Roman', serif"
const MONO = "'IBM Plex Mono', 'SFMono-Regular', Menlo, Consolas, monospace"

export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

export type EmailBlock =
  | { p: string }
  | { rows: [label: string, value: string][] }
  | { panel: { label: string; lines: string[]; tone?: 'copper' | 'grey' } }
  | { quote: { label: string; text: string } }
  | { pre: string }
  | { button: { href: string; label: string } }

export interface EmailContent {
  /** Small line above the title, e.g. 'Booking confirmed'. */
  eyebrow: string
  title: string
  /** Inbox preview text. */
  preheader: string
  /** The eyebrow's colour: green for good news, copper for action needed, grey otherwise. */
  tone?: 'green' | 'copper' | 'grey'
  blocks: EmailBlock[]
}

const label = (s: string, color = C.muted) =>
  `<span style="font-family:${MONO};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${color};">${esc(s)}</span>`

function block(b: EmailBlock): string {
  if ('p' in b) return `<p style="margin:0 0 16px;font-family:${SERIF};font-size:17px;line-height:1.55;color:${C.text};">${esc(b.p)}</p>`
  if ('rows' in b) {
    const rows = b.rows.map(([k, v], i) => `<tr>
      <td valign="top" style="padding:10px 12px 10px 0;width:130px;${i ? `border-top:1px solid ${C.line};` : ''}">${label(k)}</td>
      <td valign="top" style="padding:9px 0;font-family:${SERIF};font-size:16px;line-height:1.45;color:${C.text};${i ? `border-top:1px solid ${C.line};` : ''}">${esc(v)}</td>
    </tr>`).join('')
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;border-collapse:collapse;">${rows}</table>`
  }
  if ('panel' in b) {
    const copper = b.panel.tone !== 'grey'
    const lines = b.panel.lines.map((l) => `<div style="font-family:${SERIF};font-size:16px;line-height:1.5;color:${C.text};margin-top:6px;">${esc(l)}</div>`).join('')
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;"><tr>
      <td style="padding:16px 18px;background:${copper ? C.copperTint : C.page};border:1px solid ${copper ? C.copperLine : C.line};border-radius:4px;">
        ${label(b.panel.label, copper ? C.copper : C.muted)}${lines}
      </td></tr></table>`
  }
  if ('quote' in b) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;"><tr>
      <td style="padding:4px 0 4px 16px;border-left:3px solid ${C.greenFill};">
        ${label(b.quote.label)}
        <div style="font-family:${SERIF};font-size:16px;line-height:1.55;color:${C.text};margin-top:6px;white-space:pre-wrap;">${esc(b.quote.text)}</div>
      </td></tr></table>`
  }
  if ('pre' in b) {
    return `<div style="margin:0 0 20px;padding:16px 18px;background:${C.page};border:1px solid ${C.line};border-radius:4px;font-family:${MONO};font-size:13px;line-height:1.6;color:${C.text};white-space:pre-wrap;word-break:break-word;">${esc(b.pre)}</div>`
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr>
    <td style="background:${C.greenFill};border-radius:4px;">
      <a href="${esc(b.button.href)}" style="display:inline-block;padding:13px 22px;font-family:${MONO};font-size:13px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:${C.onGreen};text-decoration:none;">${esc(b.button.label)} &rarr;</a>
    </td></tr></table>`
}

export function renderEmail(e: EmailContent): string {
  const eyebrowColor = e.tone === 'green' ? C.green : e.tone === 'copper' ? C.copperBright : C.onInkDim
  const site = SITE.url.replace(/^https?:\/\//, '')
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${esc(e.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(e.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:collapse;">
    <tr><td style="background:${C.ink};padding:26px 32px 30px;border-radius:6px 6px 0 0;">
      <div style="font-family:${SANS};font-size:20px;font-weight:900;letter-spacing:.5px;color:${C.onInk};">TMILADZI <span style="font-family:${MONO};font-size:10px;font-weight:400;letter-spacing:2.4px;color:${C.green};vertical-align:3px;">MEDIA &middot; ZM</span></div>
      <div style="margin-top:28px;font-family:${MONO};font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:${eyebrowColor};">&mdash;&mdash; ${esc(e.eyebrow)}</div>
      <h1 style="margin:10px 0 0;font-family:${SANS};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-.3px;color:${C.onInk};">${esc(e.title)}</h1>
    </td></tr>
    <tr><td style="background:${C.card};padding:30px 32px 14px;">
      ${e.blocks.map(block).join('\n')}
    </td></tr>
    <tr><td style="background:${C.ink2};padding:20px 32px;border-radius:0 0 6px 6px;font-family:${MONO};font-size:11px;line-height:1.8;letter-spacing:.6px;color:${C.onInkDim};">
      ${esc(SITE.name)} &middot; ${esc(SITE.street)}, ${esc(SITE.suburb)}, ${esc(SITE.city)}<br>
      <a href="${esc(SITE.whatsapp)}" style="color:${C.onInkDim};">WhatsApp ${esc(SITE.phone)}</a> &middot;
      <a href="mailto:${esc(SITE.email)}" style="color:${C.onInkDim};">${esc(SITE.email)}</a> &middot;
      <a href="${esc(SITE.url)}" style="color:${C.green};">${esc(site)}</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`
}
