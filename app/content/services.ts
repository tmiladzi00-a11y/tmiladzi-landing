import type { BookingSettings, Service } from './types'

/* The built-in catalogue. With the CMS database bound (DB), the booking
   page reads packages from there instead and this file is only the seed
   (scripts/cms-seed.ts) and the fallback when the database is absent or
   empty.

   PRICING lives here and is mirrored in the Apps Script backend. Change
   both together — the backend recomputes every total from its own copy
   and ignores whatever the browser sends, so a tampered request cannot
   lower a price or a deposit.

   Add-on types:
     'qty'    — stepper, priced per unit, up to max
     'toggle' — on or off
   price:null renders as "quoted separately" rather than inventing
   a number, and flags the line for a manual quote.

   ADDITIONAL TIME: K1,250 on the two short jobs, K1,500 on a wedding.
   On a wedding the extra hour is the worst hour of the day — tired crew,
   a reception overrunning, more footage to cut — so it costs more than
   the average hour already bought. On a 1-hour session the first hour
   carries all the setup, travel and delivery overhead, so the second
   hour is genuinely cheaper to give than the first: K1,250 against a
   K2,000 opening hour. All three sit below the K2,500/hr corporate
   overtime rate, which keeps the two markets distinct.                  */
export const SERVICES: Service[] = [
  {
    id: 'wedding', tier: 'premium', name: 'Weddings', tag: 'Full day', price: 7000, dep: 0.5,
    hours: 10, cov: '10 hours', delivery: 6, deliveryUnit: 'weeks', live: true,
    blurb: 'Unlimited edited photos — all the best frames from the day, not a capped number.',
    includes: ["Bride's preparations", 'Ceremony', 'Photoshoot', 'Reception',
      'Unlimited edited photos', 'Online gallery for downloading'],
    notes: ['6 weeks delivery as standard', 'Weddings outside the Copperbelt carry a travel charge only'],
    addons: [
      { id: 'time', name: 'Additional time', unit: 'hour', type: 'qty', price: 1500,
        d: 'Coverage beyond the standard 10 hours.' },
      { id: 'prewed', name: 'Pre-wedding photoshoot', unit: '', type: 'toggle', price: 2500,
        d: '10 photos plus a 30-second save-the-date reel.' },
      { id: 'second', name: 'Extra photographer', unit: 'each', type: 'qty', price: 5000, max: 3,
        d: 'Best for covering large weddings — two angles on every moment.' },
      { id: 'reel', name: 'Wedding reel', unit: 'each', type: 'qty', price: 5500, max: 3,
        d: 'A 1-minute film shot for social media on the day.' },
      { id: 'highlight', name: 'Highlight video', unit: '', type: 'toggle', price: null,
        d: 'A 3–5 minute highlight film of the whole day.' },
      { id: 'express', name: 'Express delivery', unit: 'week', type: 'qty', price: 2500, max: 3,
        d: 'Each week you buy takes a week off the 6-week delivery.', affects: 'delivery' },
    ],
  },
  {
    id: 'events', tier: 'basic', name: 'Small Events & Family Shoots', tag: 'Half day', price: 4000, dep: 0.5,
    hours: 4, cov: '4 hours', delivery: 48, deliveryUnit: 'hours', live: true,
    blurb: 'Birthdays, graduations, dinners, kitchen parties and family gatherings.',
    includes: ['50–150 edited photos', '48-hour delivery', 'Online gallery for downloading'],
    notes: ['An assistant photographer shoots most small events',
      'Team logistics are not covered for events outside Kitwe'],
    addons: [
      { id: 'time', name: 'Additional time', unit: 'hour', type: 'qty', price: 1250,
        d: 'Coverage beyond the standard 4 hours.' },
      { id: 'reel', name: 'Reel', unit: 'each', type: 'qty', price: 2800, max: 3,
        d: 'A 30–60 second highlight reel.' },
      { id: 'highlight', name: 'Highlight video', unit: '', type: 'toggle', price: 5500,
        d: 'A 3–5 minute highlight video, to music of your choice.' },
      { id: 'express', name: 'Next-day delivery', unit: 'day', type: 'qty', price: 1000, max: 1,
        d: 'Your photos back in 24 hours instead of 48.', affects: 'delivery' },
    ],
  },
  {
    id: 'sessions', tier: 'basic', name: 'Photoshoot Sessions', tag: 'Studio or outdoor', price: 2000, dep: 0.5,
    hours: 1, cov: '1 hour', delivery: 48, deliveryUnit: 'hours', live: true,
    blurb: 'Portraits, maternity, graduation and studio-at-your-home sessions.',
    includes: ['15 edited pictures', '48-hour delivery', 'Studio, home studio or outdoor'],
    notes: ['Team transport included within Kitwe only'],
    addons: [
      { id: 'time', name: 'Additional time', unit: 'hour', type: 'qty', price: 1250,
        d: 'More time in front of the camera, and more frames to choose from. The 15 edited pictures stay the same — add more below.' },
      { id: 'photo', name: 'Additional photo', unit: 'each', type: 'qty', price: 80, max: 35,
        d: 'Each extra fully edited picture beyond the 15 included.' },
      { id: 'reel', name: 'Reel', unit: 'each', type: 'qty', price: 2000, max: 3,
        d: 'A 30–45 second video reel from the session.' },
      { id: 'raws', name: 'All unedited photos', unit: '', type: 'toggle', price: 1500,
        d: 'Every frame from the session, straight off the camera and unretouched.' },
      { id: 'express', name: 'Next-day delivery', unit: 'day', type: 'qty', price: 500, max: 1,
        d: 'Your photos back in 24 hours instead of 48.', affects: 'delivery' },
    ],
  },
]

/** Booking page copy and form choices, as shipped. The CMS overrides them. */
export const BOOKING_DEFAULTS: BookingSettings = {
  eyebrow: 'Weddings, events & sessions',
  title: 'Book a date',
  lede: 'Choose your coverage, pick a date that is open, add anything extra you want, and tell us about the day. You see the full price as you build it — nothing is hidden until a quote arrives.',
  dayStart: '07:00',
  dayEnd: '18:00',
  regions: ['Within the Copperbelt', 'Outside the Copperbelt', 'Outside Zambia'],
  heard: ['Referred by a venue or vendor', 'Referred by a friend or family', 'Instagram', 'Facebook', 'Google', 'Saw your work at an event', 'Other'],
}

/** The bookable day: one-hour blocks starting 07:00, the last ending at DAY_END. */
export const SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] as const
export const DAY_END = '18:00'

export function findService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id)
}
