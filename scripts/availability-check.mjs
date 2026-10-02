// Walks the booking wizard against a live calendar and reports what each
// date and start time looks like. Run the dev server (default port 3210,
// or BASE=http://localhost:3000) with
// NUXT_CALENDAR_ICS_URL set, then: node scripts/availability-check.mjs <outdir>
import { chromium } from 'playwright-core'
const S = process.argv[2] || '.'
const b = await chromium.launch({ channel: 'chrome' })
const errs = []
const open = async (w) => { const p = await b.newPage({ viewport: { width: w, height: 1000 } }); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) }); await p.goto((process.env.BASE || 'http://localhost:3210') + '/booking', { waitUntil: 'networkidle' }); return p }
const days = (p) => p.evaluate(() => [...document.querySelectorAll('button.calday')].map((e) => e.textContent.trim() + (e.classList.contains('blocked') ? ':full' : e.classList.contains('partial') ? ':part' : e.disabled ? ':soon' : ':open')).join(' '))
const month = async (p) => (await p.locator('.calmonth').textContent()).trim()
// the first date that can be picked, whatever today is; a fixed day would
// fall inside the notice period as the month goes on
const firstOpen = (p) => p.locator('button.calday:not(:disabled)').first()

// --- a one-hour session
let p = await open(1440)
console.log('mode note:', (await p.locator('.preview-note').count()) ? (await p.locator('.preview-note').textContent()).trim() : 'none (live)')
await p.getByLabel('Photoshoot Sessions', { exact: false }).first().check({ force: true })
await p.getByRole('button', { name: 'Choose a date' }).click(); await p.waitForTimeout(500)
console.log(`SESSION ${await month(p)}:`, await days(p))
const picked = await firstOpen(p).textContent()
await firstOpen(p).click(); await p.waitForTimeout(300)
console.log(`  ${picked.trim()} ${await month(p)} slots:`, await p.evaluate(() => [...document.querySelectorAll('.slot')].map((e) => e.textContent.trim().slice(0, 5) + (e.classList.contains('slot--taken') ? ':taken' : ':free')).join(' ')))
await p.locator('.slot:not(.slot--taken) input').first().check({ force: true }); await p.waitForTimeout(200)
await p.screenshot({ path: `${S}/session-date.png` })
await p.getByRole('button', { name: 'Add-ons' }).click(); await p.waitForTimeout(600)
console.log('  extra-time note:', (await p.locator('.addon__cap').first().textContent().catch(() => 'none')).trim())
await p.getByRole('button', { name: 'More Additional time' }).click(); await p.waitForTimeout(250)
console.log('  after one extra hour, + disabled:', await p.getByRole('button', { name: 'More Additional time' }).isDisabled(), '| total', (await p.locator('.sumtotal__b').textContent()).trim())
await p.screenshot({ path: `${S}/session-addons.png` })
await p.close()

// --- a four-hour event: the same bookings remove more start times
p = await open(1440)
await p.getByLabel('Small Events', { exact: false }).first().check({ force: true })
await p.getByRole('button', { name: 'Choose a date' }).click(); await p.waitForTimeout(500)
console.log(`EVENT ${await month(p)}:`, await days(p))
await p.close()

// --- a wedding: needs ten clear hours
p = await open(1440)
await p.getByLabel('Weddings', { exact: false }).first().check({ force: true })
await p.getByRole('button', { name: 'Choose a date' }).click(); await p.waitForTimeout(500)
console.log(`WEDDING ${await month(p)}:`, await days(p))
await p.screenshot({ path: `${S}/wedding-date.png` })
await p.close()

// --- phone
p = await open(390)
await p.getByLabel('Photoshoot Sessions', { exact: false }).first().check({ force: true })
await p.getByRole('button', { name: 'Choose a date' }).click(); await p.waitForTimeout(500)
await firstOpen(p).click(); await p.waitForTimeout(300)
await p.locator('.calwrap').scrollIntoViewIfNeeded(); await p.screenshot({ path: `${S}/session-390.png` })
await p.close()
console.log('errors:', errs.length ? errs : 'none')
await b.close()
