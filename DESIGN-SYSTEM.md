# Tmiladzi Media — design system

This is the reference for anyone extending the site. It explains how the
pieces fit, what a component is allowed to read, and where the numbers came
from. The prototype at `reference/tmiladzi-com-v2-2.html` is the visual
source of truth; this document is the engineering behind it.

The site is a photographer's contact sheet: registration marks, frame
metadata, slug lines, a hairline rail down the page edge, a green-biased
near-black ground and two accents named after what comes out of the
Copperbelt. Malachite (the ore) carries primary actions and corporate work.
Copper (the metal) carries the weddings and private-client lane. That split
is the only colour semantics the site relies on. Keep it.

## 1. Token tiers

Tokens live in `app/assets/css/tokens.css`, with a typed mirror of what
JavaScript needs in `app/design/tokens.ts`. Prefix is `tm`.

| Tier | Prefix | Holds | Who reads it |
|---|---|---|---|
| Reference | `--tm-ref-*` | Raw values: hex, px, ms, cubic-beziers, font stacks | Only the system tier |
| System | `--tm-sys-*` | Roles: `surface`, `primary`, `on-surface-faint`, elevation levels, motion, density, type roles | Components, base.css |
| Component | `--_*` inside a component's scoped style | Per-component bindings (`--_bg`, `--_line`, `--_layer`) that resolve to system roles | That component only |

A component never reads a `--tm-ref-*` token and never writes a hex value.
If a component needs a colour that has no role, add the role to the system
tier first.

### Reference values

```
ground     ink #0B0F0D · ink-2 #101614 · surf #141A17 · surf-2 #1B2320
lines      line #26302C · line-soft #1C2521
text       fg #E9EFEA · fg-2 #A9B6AF · fg-3 #808E88 (was #6F7D77, see §7)
malachite  mal #2E9B6E · mal-hi #43BE8B · mal-dim #1B5C43
copper     cop #C87A45 · cop-hi #E09A63 · cop-dim #3A2A1E
error      #C05A4A (border) · #E08878 (text on dark)
on-mal     #04140D   on-cop #180A02
space      4 8 12 16 24 32 48 64 96 140
radius     2px · pill 999px
maxw       1440px (prototype 1280; raised for large monitors) · bleed 1760px · rail 56px · touch 48px
```

### System colour roles

| Role | Resolves to | Use |
|---|---|---|
| `surface` | ink | Page ground |
| `surface-sunken` | ink-2 | Dark bands, drawer, footer |
| `surface-raised` | surf | Cards, inputs' container, calendar cells |
| `surface-raised-2` | surf-2 | Hovered/selected cards, toast |
| `outline` | line | Strong hairlines, input borders |
| `outline-variant` | line-soft | Soft hairlines, row dividers |
| `on-surface` | fg | Headings, primary text |
| `on-surface-variant` | fg-2 | Body prose, ledes |
| `on-surface-faint` | fg-3 | Mono labels, metadata |
| `primary` / `primary-hover` / `primary-container` / `on-primary` | mal / mal-hi / mal-dim / on-mal | Malachite lane |
| `secondary` / `secondary-hover` / `secondary-container` / `on-secondary` | cop / cop-hi / cop-dim / on-cop | Copper lane |
| `primary-tint`, `secondary-tint` | 7%/6% washes | Confirmation and key-terms panels |
| `error`, `on-error-surface` | #C05A4A / #E08878 | Invalid borders, error text |
| `focus` | mal-hi | Focus ring |
| `scrim` | rgba(ink, .82) | Header |

## 2. Elevation ladder

Elevation is hierarchy, not shadow. In this palette it is expressed as a
surface-colour shift plus a hairline shift. There are no drop shadows.

| Level | Background | Hairline | Where |
|---|---|---|---|
| 0 | `surface` | none | Page |
| 1 | `surface-sunken` | `outline-variant` | `PageBand dark`, drawer, footer |
| 2 | `surface-raised` | `outline-variant` | Cards, plates, tables, calendar cells |
| 3 | `surface-raised-2` | `outline` | Hovered/selected cards, toast |
| 4 | `surface-raised-2` | `primary-container` | Hovered link cards |
| 5 | `scrim` + `blur(14px) saturate(140%)` | `outline-variant` | Sticky header |

Tokens: `--tm-sys-elevation-N-bg`, `--tm-sys-elevation-N-line`, and
`--tm-sys-elevation-5-filter`.

## 3. State layers

Interaction on a surface is a translucent overlay of the content colour,
composed with `color-mix()`, never a colour swap:

```css
.thing { --_layer: var(--tm-sys-color-on-surface); }
.thing:hover  { background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-hover),   transparent); }
.thing:active { background: color-mix(in srgb, var(--_layer) var(--tm-sys-state-pressed), transparent); }
```

| State | Opacity |
|---|---|
| hover | 8% |
| focus | 10% |
| pressed | 10% |
| dragged | 16% |

One deliberate exception: filled accent buttons (`primary`, `copper`) swap
to their `-hover` role on hover, because an 8% white layer over malachite
reads as a duller green, and the prototype's brightening is the approved
look. Everything ghost, outlined or bare uses the state layer.

## 4. Motion

Every transition names a duration and an easing token. No inline
`.18s` anywhere.

| Token | Value |
|---|---|
| `duration-short-1` | 100ms |
| `duration-short-2` | 200ms (the default for hover/colour) |
| `duration-medium-1` | 300ms (step changes, plate lift, panel reveal) |
| `duration-medium-2` | 400ms |
| `duration-long-1` | 500ms (hero entrance) |
| `easing-standard` | cubic-bezier(0.2, 0, 0, 1) |
| `easing-emphasized` | cubic-bezier(0.05, 0.7, 0.1, 1) |
| `easing-decelerate` | cubic-bezier(0, 0, 0, 1) |
| `easing-accelerate` | cubic-bezier(0.3, 0, 1, 1) |

Policy: one orchestrated moment (the hero entrance on first load), then
motion only in response to what the user did. Nothing reveals on scroll,
nothing loops. `prefers-reduced-motion` collapses everything to instant in
`base.css`, and Nuxt skips View Transitions under it.

The full inventory, each with the action it answers:

| Motion | Answers | Where |
|---|---|---|
| Hero entrance, four steps, once | First load | `HomeHero` |
| Page crossfade + 6px rise | Navigation | View Transitions in `base.css`; Vue `page-*` fallback via `NuxtPage :transition` |
| Plate morphs grid thumbnail to case-study hero | Opening or leaving a project | `PlateFrame vtName="plate-<id>"` on `WorkCard` and `/work/[slug]` |
| Registration marks and slug brighten, 3px lift | Hovering a frame | `PlateFrame lift` |
| Survivors slide, arrivals settle, departures leave the flow | Applying a filter | `WorkGrid` TransitionGroup (FLIP) |
| Step slides from the right going forward, from the left going back | Advancing or returning in the wizard | `BookingWizard` |
| Month grid slides the way paged | Prev/next month | `BookingAvailabilityCalendar` |
| Digit rolls up or down | Stepper change | `BookingAddonStepper` |
| Total and deposit count to the new value over 300ms | Any price change | `BookingSummary` (`useTransition`) |
| Line items slide in and out | Add-on added or removed | `BookingSummary` |
| Drawer links drop in, 30ms stagger | Opening the menu | `AppDrawer` |
| Contents rail marks the clause under the reading line | Reading a legal page | `LegalToc` (IntersectionObserver) |
| Focus ring eases its offset in | Keyboard focus | `base.css` |

Tempting and deliberately absent: drifting hero grain, a pulsing reel
button, count-up stats on load, a header that condenses on scroll.

## 5. Type

Three families, three roles, self-hosted from `public/fonts` with
`font-display: swap`, latin + latin-ext subsets. The display, body and mono
latin files are preloaded. Each large face has a metric-matched fallback
(`Archivo Fallback` over Arial, `Newsreader Fallback` over Georgia) generated
by `scripts/font-fallbacks.mjs` with Capsize, so a late swap does not move
the layout. Regenerate those rules if a font file changes.

| Role | Family | Axes carried | Token |
|---|---|---|---|
| Display | Archivo | `wdth` 62–125, `wght` 100–900 | `--tm-sys-type-display-family` |
| Body | Newsreader | `opsz` 6–72, `wght` 200–800 | `--tm-sys-type-body-family` |
| Data | IBM Plex Mono | 400, 500 | `--tm-sys-type-data-family` |

Axis settings are tokens because the widths do real work:

| Class / use | Axes |
|---|---|
| `.display` (h1, h2) | `wdth 112, wght 700` |
| `.h3` | `wdth 105, wght 650` |
| `.h4` | `wght 650` in the **body** face (see below) |
| Brand mark | `wdth 118, wght 800` |
| Kicker | `wdth 92, wght 600` |
| Plate title, calendar month | `wdth 108, wght 650` |
| Stat numerals | `wdth 110, wght 700` |
| Prices, totals | `wdth 108, wght 700` |
| Drawer links | `wdth 105, wght 600` |
| Client names | `wdth 100, wght 600` |

`.h4` deserves a note. The prototype never sets a family on `.h4`, so it
renders in Newsreader at weight 650 with the browser's default 24px heading
margins. That is what was approved, so `base.css` encodes it explicitly:
body face, `margin: var(--tm-sys-space-5) 0`. Use `.h4--tight` where the
layout owns the spacing (work card captions, add-on rows).

Scale: `h1 clamp(42px, 7.2vw, 92px)`, `h2 clamp(30px, 4.4vw, 54px)`,
`h3 clamp(21px, 2.2vw, 29px)`, `h4 18px`, lede `clamp(18px, 1.9vw, 22px)`,
body 17px / 1.65, data 10–14px with `.06em` tracking (labels `.14em`,
eyebrows `.18em`).

## 6. Space, shape, density

The 4dp baseline: `--tm-sys-space-1` (4px) through `-10` (140px). Radius is
2px on everything and 999px on pills; nothing is rounder. Breakpoints match
the prototype: 520, 620, 680, 720, 760, 820, 860, 900, 1000, 1040, 1060, 1100.

Density has two levels. Default control height is 44px. The booking
calendar and add-on rows set `data-density="compact"`, which drops
`--tm-sys-density-control-h` to 38px and the gap to 8px. Every control still
sits inside a 48px touch target through padding or grid gap.

## 7. Contrast

`fg-3` was #6F7D77 in the prototype: 4.09:1 on `surf`, which fails AA for
small mono text and that colour is used for a great deal of small mono
text. It is now #808E88: 5.16:1 on `surf`, 4.70:1 on `surf-2`, 6.35:1 on
`ink`. Same hue, one step brighter. All other pairs pass: `mal` on `ink`
5.5:1, `on-mal` on `mal` 5.6:1, `fg-2` on `surf` 8.3:1.

Focus is `2px solid var(--tm-sys-color-focus)` with `3px` offset, set once
on `:focus-visible` in `base.css`. Radio cards (service picker, slots) show
it through `:has(input:focus-visible)`.

## 8. Components

Each is a Vue SFC with scoped styles bound to component tokens. Nuxt
auto-imports them by file name (`components/Booking/Summary.vue` is
`BookingSummary`).

**AppHeader** — sticky, elevation 5. Primary nav is hidden below 1000px
and replaced by a 44px hamburger button: three hairlines in the text colour
whose outer two fold into a cross while the drawer is open. It carries
`aria-expanded`, `aria-controls` and a label that switches between "Open
menu" and "Close menu". NuxtLink sets `aria-current="page"`. The CTA is a
`BaseButton primary sm`.

**AppDrawer** — mobile list, elevation 1, `hidden` when closed, closes on
route change. Links are the display face at `wdth 105`.

**AppFooter** — brand blurb plus three link columns (`2fr 1fr 1fr 1.4fr`
at ≥820px; two-up on phones, with the Direct list itself two-up so it stays
three rows deep). The base is a two-column grid: an `<address>` on the left
with three deliberate lines (trading identity, street address, TPIN and VAT
status), and on the right the legal links as a flex list with even gaps
above the copyright line, ranged right. No dot separators; spacing does the
separating. Links use the colour hover only.

**PageBand** — section wrapper. Props `tight` (64px padding instead of
96px), `dark` (elevation 1), `flush` (no top padding, for a band that
continues a page head), `labelledby`. Consecutive bands get a top hairline.

**SheetRail** — the 1px registration rail at ≥1100px, `aria-hidden`.

**Eyebrow** — mono, `.18em` tracking, 22px rule before it. `copper` flips
to the secondary role. Renders a `<p>` by default; pass `tag`.

**SectionHead** — eyebrow + h2 (or h1) + optional lede, capped at 70ch.
`wide` lays it out against an `aside` slot for a trailing action.

**Pill** — bordered mono chip with a leading dot; `tone` mal or cop. The dot
is decorative and hidden from AT.

**MonoMeta**, **Lede** — thin wrappers over the `.mono` and `.lede` roles.

**BaseButton** — variants `primary`, `copper`, `ghost`; size `sm`. Renders
NuxtLink for `to`, an anchor for `href` (with `external` for target/rel),
otherwise a `<button>` with `appearance: none` so it does not pick up the UA
button face. `arrow` appends the `→` that translates 3px on hover. Filled
variants swap to their hover role; ghost uses the state layer. Disabled is
45% opacity. Label text does not wrap.

**PlateFrame** — the labelled image slot. Props: `ratio` (3-2, 2-3, 16-9,
1-1, 4-5, 21-9), `pa`/`pb` (duotone ground), `src`/`alt` (real image via
NuxtImg), `tag`, `title`, `sub`, `thumb` (caption lives outside, so only the
tag and an "Image slot · 3:2" line render), `lift` (hover translate when
inside a link). Without `src`: radial duotone, feTurbulence grain at
`mix-blend-mode: overlay`, a 135° hairline hatch, malachite registration
marks. With `src`: the photograph, faint grain, a bottom scrim so the
metadata stays legible. It is a `<figure>` with a `<figcaption>`.

**WorkCard / WorkGrid / FilterBar** — card is a NuxtLink around a `thumb`
plate and a caption. Grid is a `role="list"` at 1/2/3 columns (680, 1040).
FilterBar is a `role="group"` of `aria-pressed` buttons; the work page keeps
the active filter in the URL query and announces the count to a live region.

**CapabilityCard** — `SurfaceCard` with key, h4 and body, rendered as `<li>`.

**SurfaceCard** — the raised surface (elevation 2). Props `k` (mono key),
`tone` (mal/cop border), `to` (becomes a link card at elevation 4 on hover),
`tag`.

**ProcessItem / ProcessList** — numbered row with a marker, heading and
body. ProcessList numbers a `ProcessStep[]` from an `offset`. Markers are
`aria-hidden`; the sequence is conveyed by the `<ol>`. When a list runs far
taller than the column introducing it (the nine steps on the home page),
the introduction is `position: sticky` at ≥900px so it travels with the
reader rather than leaving the column empty.

**ClientRoster** — grouped by sector, 2/3/5 columns (720, 1060). Sector
heads are `<h3>` in the mono face. An entry with a `logo` renders the mark
as a silhouette in the text colour (`brightness(0) invert(.86)`), coming up
to full white on hover; colour on hover was tried and fails for black-ink
wordmarks on this ground. A mark whose identity is a dark figure on a
coloured ground (FNB's acacia, Stanbic's shield) sets `mode: 'tone'` and is
shown in lifted greyscale instead, with its true colours on hover. `w`/`h` are the file's intrinsic pixels for a
CLS-free box; `height` is the rendered size, tuned per mark so a heavy
wordmark and a small seal carry the same weight. An entry without a logo
renders its name in the display face, so the roster degrades one client at
a time. Raster logos are stored as WebP in `public/logos` (converted once with
Pillow); SVGs as they are. No runtime image pipeline is involved. Every mark is a client's trademark: add one only where that client
has agreed to appear.

**LogoWall** — flat uppercase display-face list for a short run of names.

**SpecTable** — real `<table>` with `<th scope="row">`. `caption`, `bare`
(no container), `prose` (body face in the value cell, used for the legal
cancellation scales).

**PricingCard / TickList** — copper-bordered card with title, price in the
display face and a `ZMW · unit` label; TickList takes `items` or slot
`<li>`s, `tone`, and `size="lg"` for legal pages.

**LaneCta** — two-up pill/title/body/action panel; `tone` picks the lane.

**ContactRow** — one `<dt>/<dd>` pair inside a caller-supplied `<dl>`.
`first`, `last`, `flush` control the hairlines.

**StatStrip** — the hero's five stats as a `<dl>` with visually hidden
terms; values may carry `&nbsp;`.

**FormField / FormRow / AcceptBox** — label above, control in the slot,
hint or error below with `aria-describedby` wiring; invalid controls get the
error border. AcceptBox is a bordered checkbox with a sentence label; `bad`
turns the border red, `quiet` is the optional variant, `tone` picks the link
colour.

**BriefForm** — validates organisation, name, email and consent, then
renders a plain-text brief in a `<pre>` with copy-to-clipboard (and a
selection fallback) and an edit path back.

**Lightbox** — a native `<dialog>` for a project's frames: focus trapped by
the element, Escape closes, arrow keys and swipe move, a counter reads
"3 of 6", and the frame is sized to the viewport by its ratio. Body scroll is
locked while open. Rendered client-only.

**FrameGallery** — the frames from a shoot at their own ratios, packed in
CSS columns (1/2/3 at 600 and 1000), each a button that opens the lightbox
at its index. Frame tags name what was shot.

**VideoEmbed** — a poster plate that becomes a YouTube (no-cookie) or Vimeo
player on click; nothing third-party loads before that. Accepts a full URL
or a bare ID. Without an `embed` it renders the plate alone.

**FrameStrip** — the home page's "Recent frames" as a horizontal scroll-snap
strip of 520px plates with slug lines, paging buttons for mouse users,
native scroll for everyone else.

**PackageTable** — the three private-client packages side by side plus an
add-on price matrix, both derived from `SERVICES`, so the marketing page and
the booking engine cannot disagree.

**Bleed** — `.bleed` in `base.css` lets an image grid or hero plate run to
`--tm-sys-layout-bleed` (1760px) while the text container stays at 1440px
and prose is capped in ch. Used on the
Work grid, case-study hero and gallery, and the showreel.

**Booking wizard** — `BookingWizard` orchestrates six steps with
`BookingStepIndicator` (an `<ol>` with `aria-current="step"`),
`BookingServicePicker` (radio cards in a `<fieldset>`),
`BookingAvailabilityCalendar` (Monday-first month grid of buttons with
full-date labels, notice-period floor, blocked hatch, 13-month horizon,
compact density), `BookingSlotList` (radio chips), `BookingAddonStepper`
(stepper or toggle per add-on, per-add-on max, compact density) and
`BookingSummary` (sticky rail; line items animate in and the total ticks
when it changes; the total is a live region). A visually hidden live region
announces each step. The terms checkbox gates submission; the accepted
version strings and a fingerprint of the rendered `/terms` text travel with
the request. The page wraps the wizard in `ClientOnly` and carries a
`<noscript>` fallback.

## 8a. Forms and delivery

Both forms post to `/api/send` (`server/api/send.post.ts`), an edge
function that relays through Resend when `NUXT_RESEND_API_KEY` is set and
otherwise answers "not configured". The brief shows a "Brief sent"
confirmation when delivery succeeds and the copy-and-WhatsApp panel when it
does not; the wizard does the same and words its confirmation accordingly.
A hidden honeypot field drops bot submissions silently. The brief is laid
out as six numbered `<fieldset>`s because the copy promises six questions.

## 9. Pricing engine

`app/composables/useBookingQuote.ts` is pure functions plus a thin reactive
wrapper, tested in `tests/useBookingQuote.test.ts`. Rates live in
`app/content/services.ts` with the rationale from the prototype above them.
Change a rate there, and only there; the Apps Script backend recomputes
every total from its own copy.

## 10. Content model

`app/content/*.ts` holds projects, films, capabilities, process, clients,
services, site details and terms versions, all typed in `types.ts`. A
project with `cleared: false` publishes its `anonClient` descriptor instead
of the client name everywhere, through `utils/clientName.ts`. That is a
legal control. Do not read `project.client` directly in a template.

## 11. Delivery

Component styles are inlined into each prerendered page
(`features.inlineStyles`), the build emits one stylesheet for client-side
navigation (`cssCodeSplit: false`), and a Nitro plugin
(`server/plugins/async-css.ts`) turns that stylesheet's link into a
non-blocking preload with a `<noscript>` copy. First paint depends on the
HTML alone. `scripts/serve-static.mjs` serves `dist/` with gzip
for a fair Lighthouse run; `scripts/shoot.mjs` screenshots every route
beside the prototype.

## 12. Adding a page

1. Create `app/pages/<route>.vue`, call `useSeoMeta` with a title and
   description. The title template appends " — Tmiladzi Media".
2. Open with `<PageBand tight>` carrying an `Eyebrow`, an `h1.display.h1`
   and a `.lede`. Continue with `<PageBand tight flush>` if the content
   runs straight on, or `<PageBand dark>` for the next section.
3. Compose from the components above. If you need a new colour, add a
   system role. If you need a new spacing value, you probably do not.
4. Screenshot at 390px and 1440px next to the prototype before calling it
   done.
