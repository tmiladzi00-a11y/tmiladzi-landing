import { chromium } from 'playwright-core'
const S = process.argv[2]
const REF = 'file://' + process.cwd() + '/reference/tmiladzi-com-v2-2.html'
const ROUTES = [['home','/'],['work','/work'],['case','/work/zambeef-mpongwe'],['films','/films'],['capabilities','/capabilities'],['studio','/studio'],['celebrations','/celebrations'],['brief','/brief'],['contact','/contact'],['booking','/booking'],['terms','/terms'],['privacy','/privacy'],['commercial','/commercial'],['copyright','/copyright']]
const REFHASH = { home:'#/', work:'#/work', case:'#/case/zambeef-mpongwe', films:'#/films', capabilities:'#/capabilities', studio:'#/studio', celebrations:'#/celebrations', brief:'#/brief', contact:'#/contact', booking:'#/booking', terms:'#/terms', privacy:'#/privacy', commercial:'#/commercial-terms', copyright:'#/copyright' }
const browser = await chromium.launch({ channel: 'chrome', headless: true })
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
  const page = await ctx.newPage()
  for (const [name, path] of ROUTES) {
    await page.goto('http://localhost:3210' + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${S}/shots2/${name}-${w}.png`, fullPage: true })
    await page.goto(REF + REFHASH[name], { waitUntil: 'load' })
    await page.waitForTimeout(700)
    // reveal-on-scroll elements in the prototype: force them in
    await page.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')))
    await page.screenshot({ path: `${S}/shots2/ref-${name}-${w}.png`, fullPage: true })
  }
  await ctx.close()
}
// wizard flow at 1440 and 390
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto('http://localhost:3210/booking', { waitUntil: 'networkidle' })
  await page.getByLabel('Weddings', { exact: false }).first().check({ force: true })
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${S}/shots2/wiz1-${w}.png`, fullPage: true })
  await page.getByRole('button', { name: 'Choose a date' }).click()
  await page.waitForTimeout(500)
  // pick the first enabled date
  const day = page.locator('button.calday:not([disabled])').first()
  if (await day.count() === 0) { await page.getByRole('button', { name: 'Next month' }).click(); await page.waitForTimeout(300) }
  await page.locator('button.calday:not([disabled])').first().click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${S}/shots2/wiz2-${w}.png`, fullPage: true })
  await page.getByRole('button', { name: 'Add-ons' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'More Additional time' }).click()
  await page.getByRole('button', { name: 'More Additional time' }).click()
  await page.getByRole('button', { name: 'Add', exact: true }).first().click()
  await page.getByRole('button', { name: 'More Express delivery' }).click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${S}/shots2/wiz3-${w}.png`, fullPage: true })
  await page.getByRole('button', { name: 'Your details' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Review request' }).click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${S}/shots2/wiz4-err-${w}.png`, fullPage: true })
  await page.fill('#k-name', 'Chanda Mwila')
  await page.fill('#k-partner', 'Bwalya Mwila')
  await page.fill('#k-email', 'chanda@example.com')
  await page.fill('#k-phone', '+260 977 123 456')
  await page.fill('#k-venue', 'Nsobe Game Camp, Ndola')
  await page.fill('#k-guests', '180')
  await page.fill('#k-notes', 'Grandparents travelling from Mansa. Family groups before the reception, please.')
  await page.check('#k-terms')
  await page.getByRole('button', { name: 'Review request' }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${S}/shots2/wiz5-${w}.png`, fullPage: true })
  await page.getByRole('button', { name: 'Send booking request' }).click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${S}/shots2/wiz6-${w}.png`, fullPage: true })
  const txt = await page.locator('pre.request').textContent()
  console.log(`--- wizard ${w} request text:\n` + txt)
  console.log(`--- wizard ${w} errors:`, errors)
  await ctx.close()
}
// mobile drawer open + hover states + keyboard focus
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
const page = await ctx.newPage()
await page.goto('http://localhost:3210/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Menu' }).click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${S}/shots2/drawer-390.png` })
await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
await page.screenshot({ path: `${S}/shots2/focus-390.png` })
await ctx.close()
await browser.close()
console.log('shots done')
