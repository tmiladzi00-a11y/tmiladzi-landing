export type ProjectCategory = 'mining' | 'industry' | 'ngo' | 'agri' | 'weddings'

export type PlateRatio = '3-2' | '2-3' | '16-9' | '1-1' | '4-5' | '21-9'

export interface Project {
  id: string
  cat: ProjectCategory
  catLabel: string
  /** The real client. Published only when `cleared` is not false. */
  client: string
  /** False while an agreement is unsigned or an NDA applies. */
  cleared?: boolean
  /** Neutral sector descriptor shown in place of the client while uncleared. */
  anonClient?: string
  title: string
  kind: string
  year: string
  place: string
  /** Duotone ground for the plate slot: --pa (top-left), --pb (bottom-right). */
  pa: string
  pb: string
  ar: PlateRatio
  featured?: boolean
  summary: string
  body: string[]
  stats: [label: string, value: string][]
  /** Real photography, when it lands. Absent means the plate renders as a slot. */
  image?: string
  imageAlt?: string
  /** Frames from the shoot, shown in the case study gallery and lightbox. */
  frames?: Frame[]
}

export interface Frame {
  /** What was shot: "Interview · two-camera", "Aerial · site". Truthful to the job. */
  tag: string
  ratio: PlateRatio
  pa?: string
  pb?: string
  image?: string
  alt?: string
}

export interface Film {
  title: string
  client: string
  meta: string
  pa: string
  pb: string
  note: string
  /** YouTube or Vimeo URL (or bare ID), when available. */
  embed?: string
}

export interface Capability {
  k: string
  t: string
  d: string
}

export type ProcessStep = [title: string, body: string]

export type AddonType = 'qty' | 'toggle'

export interface Addon {
  id: string
  name: string
  unit: string
  type: AddonType
  /** null renders as "quoted separately" and flags the line for a manual quote. */
  price: number | null
  max?: number
  d: string
  affects?: 'delivery'
}

export type DeliveryUnit = 'weeks' | 'hours'

export interface Service {
  id: string
  name: string
  tag: string
  price: number | null
  /** Deposit fraction of the subtotal. */
  dep: number
  hours: number
  cov: string
  delivery: number
  deliveryUnit: DeliveryUnit
  /** Days' notice required before the earliest bookable date. */
  notice: number
  /** Whether a start time is chosen; false means a full-day booking. */
  times: boolean
  live: boolean
  blurb: string
  includes: string[]
  notes: string[]
  addons: Addon[]
}

export interface ClientEntry {
  name: string
  years?: string
  /** Path under public/. Absent: the name renders as text. */
  logo?: string
  /** Intrinsic pixel size of the logo file, for width/height attributes. */
  w?: number
  h?: number
  /** Rendered height in px. Wordmarks and seals need different heights to
      carry the same visual weight; default 26. */
  height?: number
  /** 'silhouette' (default) flattens the mark to the text colour. 'tone'
      keeps internal contrast in greyscale, for marks whose identity is a
      dark figure on a coloured ground (FNB's tree, Stanbic's shield). */
  mode?: 'silhouette' | 'tone'
}

export interface ClientGroup {
  sector: string
  names: ClientEntry[]
}
