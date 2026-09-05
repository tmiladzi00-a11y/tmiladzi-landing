// Renders public/og.jpg (1200x630) in the plate treatment. Run after the
// fonts are in public/fonts. Replace with a photograph when one is chosen.
import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Archivo;src:url(file://${process.cwd()}/public/fonts/archivo-latin-full-normal.woff2) format('woff2-variations');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:"IBM Plex Mono";src:url(file://${process.cwd()}/public/fonts/ibm-plex-mono-latin-400-normal.woff2) format('woff2');font-weight:400}
html,body{margin:0}body{width:1200px;height:630px;position:relative;overflow:hidden;background:#0B0F0D;color:#E9EFEA;font-family:Archivo,Arial,sans-serif}
.bg{position:absolute;inset:0;background:radial-gradient(90% 70% at 22% 18%,#1F6B4E 0%,transparent 58%),radial-gradient(80% 80% at 88% 82%,#6A3A1C 0%,transparent 55%),linear-gradient(170deg,#0A100E 0%,#101815 55%,#0B0F0D 100%)}
.grain{position:absolute;inset:0;opacity:.42;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='.5'/></svg>")}
.scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(11,15,13,.92) 0%,rgba(11,15,13,.45) 55%,rgba(11,15,13,.2) 100%)}
.reg{position:absolute;width:26px;height:26px;opacity:.7}.tl{top:28px;left:28px;border-top:2px solid #43BE8B;border-left:2px solid #43BE8B}.br{bottom:28px;right:28px;border-bottom:2px solid #43BE8B;border-right:2px solid #43BE8B}
.in{position:absolute;left:72px;right:72px;bottom:64px}
.brand{font-variation-settings:"wdth" 118,"wght" 800;font-size:34px;letter-spacing:-.03em;display:flex;align-items:baseline;gap:14px}
.brand span{font-family:"IBM Plex Mono";font-size:15px;letter-spacing:.22em;color:#43BE8B}
.eye{font-family:"IBM Plex Mono";font-size:16px;letter-spacing:.18em;text-transform:uppercase;color:#43BE8B;margin:60px 0 22px;display:flex;gap:16px;align-items:center}.eye i{width:34px;height:2px;background:#2E9B6E}
h1{margin:0;font-variation-settings:"wdth" 112,"wght" 700;font-size:84px;line-height:.95;letter-spacing:-.02em;max-width:16ch}h1 em{font-style:normal;color:#43BE8B}
</style><div class="bg"></div><div class="grain"></div><div class="scrim"></div><i class="reg tl"></i><i class="reg br"></i>
<div class="in"><div class="brand">TMILADZI <span>MEDIA · ZM</span></div><div class="eye"><i></i>Visual storytelling · Kitwe, Copperbelt</div><h1>We film the work that <em>actually</em> changes something.</h1></div>`
writeFileSync('/tmp/og.html', html)
const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await p.goto('file:///tmp/og.html'); await p.waitForTimeout(800)
await p.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 82 })
await b.close(); console.log('public/og.jpg written')
