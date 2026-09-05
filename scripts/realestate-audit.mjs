import { chromium } from 'playwright-core'
const S = process.argv[2]
const ROUTES = ['/', '/work', '/work/zambeef-mpongwe', '/films', '/capabilities', '/studio', '/celebrations', '/booking', '/contact']
const VIEWPORTS = [[390, 844, 'phone'], [1440, 900, 'laptop'], [1920, 1080, 'desktop']]
const b = await chromium.launch({ channel: 'chrome' })
const rows = []
for (const [w, h, label] of VIEWPORTS) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  for (const r of ROUTES) {
    await p.goto('http://localhost:3211' + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
    const m = await p.evaluate((vh) => {
      const vw = innerWidth
      const total = document.documentElement.scrollHeight
      const inter = (r) => { const x = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)); const y = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)); return x * y }
      const area = (sel) => [...document.querySelectorAll(sel)].reduce((a, e) => a + inter(e.getBoundingClientRect()), 0)
      const first = vw * vh
      const wrap = document.querySelector('.wrap'); const wrapW = wrap ? wrap.getBoundingClientRect().width - 2 * parseFloat(getComputedStyle(wrap).paddingLeft) : vw
      // text coverage: union-ish of text-bearing leaf blocks in first viewport
      const textEls = [...document.querySelectorAll('h1,h2,h3,h4,p,li,dt,dd,a.btn,button,span.plate__title')]
      const textArea = textEls.reduce((a, e) => a + inter(e.getBoundingClientRect()), 0)
      const media = area('.plate, img.clogo, video, iframe')
      const ctas = [...document.querySelectorAll('a.btn, button.btn')].filter(e => { const r = e.getBoundingClientRect(); return r.top < vh && r.bottom > 0 }).length
      const h1 = document.querySelector('h1'); const h1r = h1 ? h1.getBoundingClientRect() : null
      // largest vertical gap between block elements in the page (empty band)
      const blocks = [...document.querySelectorAll('h1,h2,h3,h4,p,li,.plate,img,table,.btn,dt,dd')].map(e => e.getBoundingClientRect()).filter(r => r.height > 0).map(r => [r.top + scrollY, r.bottom + scrollY]).sort((a, b) => a[0] - b[0])
      let maxGap = 0, cur = 0; for (const [t, bo] of blocks) { if (t - cur > maxGap) maxGap = t - cur; cur = Math.max(cur, bo) }
      return { total, screens: +(total / vh).toFixed(1), contentWidthPct: +((wrapW / vw) * 100).toFixed(0), mediaPct: +((media / first) * 100).toFixed(0), textPct: +((Math.min(textArea, first) / first) * 100).toFixed(0), ctas, h1Visible: !!(h1r && h1r.bottom < vh), maxGap: Math.round(maxGap), plates: document.querySelectorAll('.plate').length, realImages: document.querySelectorAll('.plate img').length }
    }, h)
    rows.push({ vp: label, route: r, ...m })
    if (label !== 'phone') await p.screenshot({ path: `${S}/audit/${label}-${r.replace(/\//g, '_') || 'home'}.png` })
  }
  await p.close()
}
await b.close()
console.log(['vp', 'route', 'screens', 'content%', 'media%1st', 'text%1st', 'ctas1st', 'h1', 'maxGap', 'plates', 'realImgs'].join('\t'))
for (const r of rows) console.log([r.vp, r.route, r.screens, r.contentWidthPct, r.mediaPct, r.textPct, r.ctas, r.h1Visible, r.maxGap, r.plates, r.realImages].join('\t'))
