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
npm run generate     # static build in .output/public
```

On this machine Node's happy-eyeballs autoselection hangs on the network;
if `fetch` inside node tools times out, export
`NODE_OPTIONS=--no-network-family-autoselection`.

## Deploy

Hosting is Cloudflare Pages, deployed by GitHub Actions from
`.github/workflows/deploy.yml`. A push to `master` runs the tests and
typecheck, builds the static site with `nuxt generate`, and publishes
`.output/public` as the production deployment. Pull requests against
`master` get a preview deployment on their branch alias. The workflow can
also be run by hand from the Actions tab.

Repository settings it needs:

| Where | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | API token with the "Cloudflare Pages: Edit" permission |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | The account that owns the Pages project |
| Secret | `NUXT_PUBLIC_BOOKING_API` | Apps Script `/exec` URL; leave unset for preview mode |
| Variable | `CLOUDFLARE_PAGES_PROJECT` | Pages project name; defaults to `tmiladzi` if unset |

Create the Pages project once in the Cloudflare dashboard (Workers & Pages,
Create, Pages, "Direct Upload") with that name, then attach the custom
domain there. `public/_headers` sets long-lived caching for hashed assets
and fonts plus the security headers; Cloudflare reads it from the output.

## Booking backend

Copy `.env.example` to `.env` and set `NUXT_PUBLIC_BOOKING_API` to the Google
Apps Script `/exec` URL. Left blank, `/booking` runs in preview mode on sample
availability and shows a notice; submissions still produce a reference and a
copy-to-WhatsApp fallback. Rates live in `app/content/services.ts` and must be
mirrored in the Apps Script, which recomputes every total itself.

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
| `scripts/serve-static.mjs` | Gzip static server for `.output/public` on port 3211, for Lighthouse |
| `scripts/font-fallbacks.mjs` | Regenerates the metric-matched fallback `@font-face` rules in `fonts.css` |
| `scripts/motion-check.mjs` | Drives every interaction (filter, case-study morph, wizard, calendar, rail) against the dev server on 3210 and reports console errors |
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
