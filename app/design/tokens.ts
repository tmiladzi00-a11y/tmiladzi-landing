/**
 * Typed mirror of app/assets/css/tokens.css.
 * Only what JavaScript needs: durations for timers, breakpoints for
 * media-query composables, the palette for the plate slots and JSON-LD.
 * The CSS file is the source of truth; keep the two in step.
 */
export const color = {
  ink: '#0B0F0D',
  ink2: '#101614',
  surf: '#141A17',
  surf2: '#1B2320',
  line: '#26302C',
  lineSoft: '#1C2521',
  fg: '#E9EFEA',
  fg2: '#A9B6AF',
  fg3: '#808E88',
  mal: '#2E9B6E',
  malHi: '#43BE8B',
  malDim: '#1B5C43',
  cop: '#C87A45',
  copHi: '#E09A63',
  copDim: '#3A2A1E',
  error: '#C05A4A',
  onMal: '#04140D',
  onCop: '#180A02',
} as const

export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 140] as const

export const radius = { base: 2, pill: 999 } as const

export const layout = { maxw: 1280, rail: 56, touch: 48, headerH: 62 } as const

/** Breakpoints used by the prototype, in px. Min-width queries. */
export const breakpoint = {
  xs: 520,
  sm: 620,
  work2: 680,
  md: 720,
  foot: 820,
  lanes: 860,
  lg: 900,
  nav: 1000,
  work3: 1040,
  clients: 1060,
  rail: 1100,
  pk: 1100,
} as const

export const motion = {
  duration: {
    short1: 100,
    short2: 200,
    medium1: 300,
    medium2: 400,
    long1: 500,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  },
} as const

export const stateLayer = { hover: 0.08, focus: 0.1, pressed: 0.1, dragged: 0.16 } as const

export type ColorToken = keyof typeof color
