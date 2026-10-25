# Tmiladzi Media — site

Nuxt 4 rebuild of the approved prototype at `reference/tmiladzi-com-v2-2.html`.
The prototype is the visual specification; `DESIGN-SYSTEM.md` is the
engineering behind it. Read both before changing anything visual.

## Run

```bash
bun install          # npm's resolver currently chokes on this tree; bun works
npm run dev          # http://localhost:3000
npm run test         # pricing engine
npm run typecheck
npm run build        # static pages + edge worker in dist/ (Cloudflare Pages preset)
npm run og           # regenerate public/og.jpg
```

On this machine Node's happy-eyeballs autoselection hangs on the network;
if `fetch` inside node tools times out, export
`NODE_OPTIONS=--no-network-family-autoselection`.

## Deploy

Hosting is Cloudflare Pages, deployed by GitHub Actions from
`.github/workflows/deploy.yml`. A push to `master` runs the tests and
typecheck, builds with `nuxt build` on the Cloudflare Pages preset (every page
prerendered to static HTML, plus a small worker for `/api`), and publishes
`dist/` as the production deployment. Pull requests against
`master` get a preview deployment on their branch alias. The workflow can
also be run by hand from the Actions tab.

Repository settings it needs:

| Where | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | API token with the "Cloudflare Pages: Edit" permission |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | The account that owns the Pages project |
| Variable | `CLOUDFLARE_PAGES_PROJECT` | Pages project name; defaults to `tmiladzi` if unset |
| Variable | `NUXT_ACCESS_TEAM_DOMAIN` | Cloudflare Access team for admin sign-in, e.g. `xxx.cloudflareaccess.com` |
| Variable | `NUXT_ACCESS_AUD` | The Access application's Application Audience (AUD) tag |
| Variable | `CLOUDFLARE_D1_DATABASE_ID` | Id of the `tmiladzi-cms` D1 database. Unset: no CMS, the site serves its built-in prices. Set: the token above also needs "D1: Edit" |

Form delivery runs in the worker and needs three environment variables set
on the Pages project itself (Cloudflare dashboard, the project, Settings,
Variables and Secrets, for Production and Preview):

| Name | Value |
|---|---|
| `NUXT_RESEND_API_KEY` | A [Resend](https://resend.com) API key. Free tier covers this site many times over. Verify `tmiladzi.com` as a sending domain there first. |
| `NUXT_MAIL_TO` | Where briefs and bookings land. Defaults to `tmiladzi@gmail.com`. |
| `NUXT_MAIL_FROM` | Sender, e.g. `Tmiladzi site <site@tmiladzi.com>`. Must be on the verified domain. |

Without the key, both forms fall back to copy-and-WhatsApp exactly as before.

Create the Pages project once in the Cloudflare dashboard (Workers & Pages,
Create, Pages, "Direct Upload") with that name, then attach the custom
domain there. `public/_headers` sets long-lived caching for hashed assets
and fonts plus the security headers; Cloudflare reads it from the output.

## Bookings

Bookings live in the CMS database, not in a calendar.

1. A client picks a package, a date and a **start time** on `/booking`. Any
   hour not already taken can be picked; how long the session runs is the
   studio's decision.
2. Sending stores a **pending** booking (`POST /api/bookings`) with
   everything the client entered and a reference such as `TM-7KQ2PX`. The
   server re-prices it from the catalogue and ignores any total the browser
   sends. The studio is emailed a link to it, and the client gets a receipt
   with their reference and the deposit details.
3. In `/admin/bookings` staff **accept** it, setting the start and the number
   of hours, or **decline** it. Hours beyond the package's own are billed at
   its extra-hours price. Accepting takes that time off the calendar;
   pending and declined requests take nothing. The client is emailed either
   way, with the deposit's mobile money details on acceptance.
4. **Deposits:** an accepted booking is held 72 hours. Staff press **Mark
   deposit received** when the mobile money arrives; the **Awaiting deposit**
   tab lists the rest, and those past the hold turn red (here and on the
   menu badge). Pages cannot run scheduled jobs, so nothing is sent
   automatically: the booking page has a one-tap WhatsApp reminder.
5. **Block time** in the same screen covers phone bookings and days off.
6. The **Calendar** tab (the default) shows the month at a glance: confirmed
   bookings, waiting requests and blocked time in their own colours. Pick a
   day for its schedule, with links to each booking.

Every email is HTML in the site's look (dark header, light body) with a
plain-text copy: the layout is `server/utils/emailLayout.ts`, the wording
`server/utils/bookingMail.ts`. Mobile money details for the deposit are `SITE.momo` in
`app/content/site.ts`; set the registered `name` and `network` there and
they print in every booking message and email. Emails need
`NUXT_RESEND_API_KEY` (see Deploy); without it nothing is lost, the request
is still stored and the admin says the email could not be sent. With no
database bound, the booking page falls back to emailing the request.

## CMS (proof of concept, local only)

Packages (Premium / Basic), their add-ons, the booking page heading, bookable
hours and the details-form choices can be edited at `/admin`. Data lives in
Cloudflare D1; `/booking` renders from it per request via
`/api/catalog`.

```bash
npm run cms:migrate  # create + seed the local D1 (.wrangler/state) from app/content/services.ts
npm run dev          # then open http://localhost:3000/admin
npm run cms:reset    # wipe local edits back to the seed
```

- **Sign-in** is Cloudflare Zero Trust Access on `/admin*` and `/api/admin*`;
  the API also verifies the Access token (`server/utils/access.ts`) against
  `NUXT_ACCESS_TEAM_DOMAIN` and `NUXT_ACCESS_AUD`. Set them as GitHub repo
  variables (the deploy workflow passes them to the build); plain Pages
  dashboard variables do not reach the worker because the build ships its
  own wrangler config, though Pages *secrets* do. Without them, a deployment
  refuses every admin request. Locally you are signed in as `dev@localhost`.
- **No database bound** (today's production): the site uses the built-in
  prices in `app/content/services.ts`, exactly as before.
- **Local binding** is in `wrangler.dev.jsonc`, deliberately not
  `wrangler.jsonc`, so the placeholder database id never reaches a deploy.
- **Production database:** create a D1 database named `tmiladzi-cms`
  (dashboard: Storage & Databases, D1), set its id as the repo variable
  `CLOUDFLARE_D1_DATABASE_ID` and add "D1: Edit" to the API token. The build
  then binds it as `DB`, and each production deploy applies
  `server/database/migrations` before publishing (the first run loads the
  current prices; later runs only add new migrations). Make sure the Access
  application covers both `tmiladzi.com/admin` and `tmiladzi.com/api/admin`.

## Where things are

| Path | What |
|---|---|
| `app/assets/css/tokens.css` | Reference, system and density tokens (`--tm-*`) |
| `app/assets/css/base.css` | Reset, type roles, layout primitives |
| `app/design/tokens.ts` | Typed mirror for JavaScript |
| `app/content/` | Projects, films, capabilities, process, clients, services, site, terms versions |
| `app/composables/useBookingQuote.ts` | Pure pricing engine + reactive wrapper |
| `app/components/` | Every component, scoped styles bound to tokens |
| `app/pages/` | One file per route |
| `tests/` | Vitest |
| `scripts/serve-static.mjs` | Gzip static server for `dist/` on port 3211, for Lighthouse |
| `scripts/font-fallbacks.mjs` | Regenerates the metric-matched fallback `@font-face` rules in `fonts.css` |
| `scripts/motion-check.mjs` | Drives the wizard, calendar, terms contents and mobile menu against the dev server on 3210 and reports console errors |
| `scripts/shoot.mjs` | Screenshots every route at 1440 and 390 next to the prototype, and walks the wizard. `node scripts/shoot.mjs <outdir>` with the dev server on port 3210 |

## Client logos

`app/content/clients.ts` lists each client with an optional `logo` under
`public/logos/`. Thirteen are in place: Caterpillar, Standard Chartered and
USAID from Wikimedia Commons; FNB (the FirstRand acacia mark) and Zambeef
from Wikipedia; the Zambian coat of arms (standing for the Office of the
President) from Commons; KoBold Metals, Barloworld, ZIMEC, Zambia Airports,
Stanbic Bank and Novatek from the companies' own sites; Dialogue Earth from
the Wayback Machine's copy of their own SVG, since their CDN blocks scripted
downloads. Only Mingomba Mining renders as text, because no public mark
exists. Each mark is that client's trademark; confirm they are happy to be
shown before publishing.

## Publishing a client name

A project with `cleared: false` in `app/content/projects.ts` shows its
`anonClient` descriptor everywhere. Flip the flag once the portfolio carve-out
is signed; nothing else needs touching.

## Real photography

Add `image` (and `imageAlt`) to a project and `PlateFrame` renders the
photograph with the frame metadata over it. Without one it renders the
labelled slot. Drop files under `public/images/` and reference them by path.
