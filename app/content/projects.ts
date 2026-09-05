import type { Project } from './types'

/* A client's name is published only where clearance exists. Projects under a
   live but unsigned agreement, or under an NDA, carry cleared:false and show a
   neutral descriptor instead. Flip the flag when the portfolio carve-out is
   signed and the name appears everywhere at once. */
export const PROJECTS: Project[] = [
  {
    id: 'mingomba-exploration', cat: 'mining', catLabel: 'Mining & Industry',
    client: 'Mingomba Mining Limited', cleared: true,
    anonClient: 'Copper exploration programme, Copperbelt',
    title: 'Under the Copperbelt',
    kind: 'Documentary + stills', year: '2026', place: 'Mingomba, Copperbelt',
    pa: '#1F6B4E', pb: '#7A4420', ar: '3-2', featured: true,
    summary: 'Exploration documentary and site photography shot to an international client technical specification.',
    body: [
      'A deep exploration programme is difficult to photograph honestly. The work is underground, the timelines are geological, and the audience — investors, regulators, host communities — each need a different thing from the same material.',
      'We built the coverage around interviews with the people running the programme, cut against field b-roll of the drilling, core handling and surrounding community. Two-camera interviews with lit setups, single-camera 4K in the field where a second body was not practical.',
      "Delivered to the client's own specification rather than ours: ProRes 422 HQ masters, 24-bit/48 kHz WAV, dialogue held between −12 and −6 dBFS, and rushes handed over in separated interview and b-roll directories with no watermarking of any kind.",
    ],
    frames: [
      { tag: 'Interview · two-camera', ratio: '16-9' },
      { tag: 'Drill rig · b-roll', ratio: '3-2' },
      { tag: 'Core handling', ratio: '2-3' },
      { tag: 'Community · Mingomba', ratio: '3-2' },
      { tag: 'Aerial · site', ratio: '21-9' },
      { tag: 'Stills · portrait', ratio: '4-5' },
    ],
    stats: [['Format', '4K · ProRes 422 HQ'], ['Setup', 'Two-camera interviews'], ['Delivery', 'Structured rushes + cut'], ['Access', 'NDA · site induction']],
  },
  {
    id: 'zambeef-mpongwe', cat: 'agri', catLabel: 'Agribusiness',
    client: 'Zambeef', title: 'Mpongwe Launch',
    kind: 'Event film + photography', year: '2026', place: 'Mpongwe, Copperbelt',
    pa: '#2A6E3C', pb: '#8A5A22', ar: '3-2', featured: true,
    summary: 'Full video and photographic coverage of a project launch event, delivered for both press and internal use.',
    body: [
      "A launch happens once and everyone senior is in the room. There is no second take of the minister's arrival, and no reshoot of the moment the first crop goes through.",
      'We covered the day with a crew sized to run stills and video in parallel — arrivals, speeches, the site tour and the operational detail that internal comms always needs and nobody remembers to ask for on the day.',
      'Selects went out fast for press and social while the event still had momentum, with the full edited library and the event film following on the agreed date.',
    ],
    frames: [
      { tag: 'Arrivals', ratio: '3-2' },
      { tag: 'Speeches', ratio: '16-9' },
      { tag: 'Site tour', ratio: '3-2' },
      { tag: 'First crop', ratio: '2-3' },
      { tag: 'Detail · operations', ratio: '1-1' },
      { tag: 'Stills · press select', ratio: '3-2' },
    ],
    stats: [['Coverage', 'Full event day'], ['Outputs', 'Event film + stills library'], ['Turnaround', 'Selects next day'], ['Terms', '30-day account']],
  },
  {
    id: 'barloworld-programme', cat: 'industry', catLabel: 'Corporate & Industrial',
    client: 'Barloworld Zambia', title: 'The Standing Account',
    kind: 'Recurring coverage', year: '2024 – present', place: 'Copperbelt & Lusaka',
    pa: '#1E5F5C', pb: '#6B4420', ar: '3-2', featured: true,
    summary: 'An ongoing programme of event, workshop and equipment coverage across sites, under a package arrangement.',
    body: [
      'This is what a working relationship looks like rather than a one-off shoot: repeated coverage across sites and events, on a package rate with agreed overtime, so the client can plan the year without re-quoting every job.',
      'The advantage compounds. Two years in, the image library matches itself — same colour science, same treatment of plant and people — so material from different quarters can sit on the same page without a re-grade.',
      'Scheduling is held ahead of ad-hoc bookings, which for a business with equipment deliveries and customer events on short notice is most of the value.',
    ],
    frames: [
      { tag: 'Customer event', ratio: '3-2' },
      { tag: 'Workshop', ratio: '16-9' },
      { tag: 'Equipment · delivery', ratio: '3-2' },
      { tag: 'People · technicians', ratio: '2-3' },
      { tag: 'Detail · plant', ratio: '1-1' },
    ],
    stats: [['Arrangement', 'Package + overtime rate'], ['Scope', 'Events · workshop · equipment'], ['Consistency', 'Single colour workflow'], ['Terms', '21-day account']],
  },
  {
    id: 'novatek-production', cat: 'agri', catLabel: 'Agribusiness',
    client: 'Novatek', title: 'Five Days on the Line',
    kind: 'Multi-day photography', year: '2026', place: 'Multi-site, Zambia',
    pa: '#28603F', pb: '#7A4A1E', ar: '3-2', featured: true,
    summary: 'A five-day photographic production across multiple sites, with a dedicated recce day ahead of the shoot.',
    body: [
      'Large photographic productions fail on logistics, not photography. We scoped this one with a travel and recce day before the first frame so the shoot days ran to a plan rather than a hope.',
      "Five shoot days across sites, covering production, people and product, building a single library the client's marketing and internal teams could both work from.",
      'Backup and organisation happened nightly on location, which on a multi-site production is the difference between a delivery date and an apology.',
    ],
    frames: [
      { tag: 'Line · production', ratio: '16-9' },
      { tag: 'People', ratio: '2-3' },
      { tag: 'Product', ratio: '1-1' },
      { tag: 'Site · exterior', ratio: '3-2' },
      { tag: 'Recce day', ratio: '3-2' },
    ],
    stats: [['Duration', '5 shoot days + recce'], ['Sites', 'Multiple'], ['Backup', 'Nightly, on location'], ['Output', 'Unified image library']],
  },
  {
    id: 'impact-documentary', cat: 'ngo', catLabel: 'NGO & Development',
    client: 'Development partner', title: 'Proof of Work',
    kind: 'Impact documentary', year: '2025', place: 'Rural Zambia',
    pa: '#1B6650', pb: '#6E4A1C', ar: '3-2',
    summary: 'A long-form impact film built around beneficiary testimony rather than programme narration.',
    body: [
      'Development films default to a narrator explaining a programme over footage of it. That reassures head office and convinces nobody else.',
      'We built this one the other way round: the people the programme served carry the story, and the organisation appears where it earned the right to. Pre-production established the question the film had to answer before travel was booked.',
      'Subtitled and versioned for donor reporting, conference screening and social cut-downs from a single master.',
    ],
    frames: [
      { tag: 'Testimony · interview', ratio: '16-9' },
      { tag: 'Field b-roll', ratio: '3-2' },
      { tag: 'Community', ratio: '3-2' },
      { tag: 'Portrait', ratio: '4-5' },
      { tag: 'Landscape', ratio: '21-9' },
    ],
    stats: [['Length', 'Long form'], ['Structure', 'Testimony-led'], ['Versions', 'Donor · screening · social'], ['Audio', 'Lav primary, shotgun backup']],
  },
  {
    id: 'cat-milestones', cat: 'industry', catLabel: 'Corporate & Industrial',
    client: 'Caterpillar', title: 'Company Milestones',
    kind: 'Corporate photography', year: '2024', place: 'Copperbelt',
    pa: '#255C48', pb: '#8A6220', ar: '3-2',
    summary: "Milestone and anniversary coverage for a global equipment brand's Zambian operation.",
    body: [
      'Milestone photography has to do two jobs at once — record the occasion for the people who were there, and produce material a global brand team will actually approve.',
      'Coverage was shot to brand guidelines with a clean, naturalistic lighting approach, delivered as a structured library rather than an undifferentiated dump of frames.',
    ],
    frames: [
      { tag: 'Ceremony', ratio: '3-2' },
      { tag: 'Team', ratio: '16-9' },
      { tag: 'Detail · brand', ratio: '1-1' },
      { tag: 'Portraits', ratio: '2-3' },
    ],
    stats: [['Scope', 'Milestone event'], ['Delivery', 'Structured library'], ['Standard', 'Brand-guideline compliant']],
  },
  {
    id: 'leadership-portraits', cat: 'industry', catLabel: 'Corporate & Industrial',
    client: 'Banking & corporate clients', title: 'The Boardroom Set',
    kind: 'Leadership portraiture', year: 'Ongoing', place: 'Kitwe · Lusaka',
    pa: '#1D5750', pb: '#5E3E1E', ar: '2-3',
    summary: 'Consistent executive and team portraiture, shot on location so nobody has to travel to a studio.',
    body: [
      'Executive portraits go stale the moment one person is shot differently from the rest. We bring the studio to the office and light every subject the same way, so the leadership page holds together as people join and leave.',
      'Turnaround is fast because the setup is fixed: consistent background treatment, consistent crop, retouching to an agreed level.',
    ],
    frames: [
      { tag: 'Executive · seated', ratio: '4-5' },
      { tag: 'Executive · standing', ratio: '2-3' },
      { tag: 'Team', ratio: '16-9' },
      { tag: 'Setup · lighting', ratio: '3-2' },
    ],
    stats: [['Location', 'On-site, your offices'], ['Consistency', 'Fixed lighting + crop'], ['Retouch', 'To agreed level']],
  },
  {
    id: 'katebe-wedding', cat: 'weddings', catLabel: 'Weddings',
    client: 'Mrs Katebe', title: 'Katebe, Lusaka',
    kind: 'Wedding coverage', year: '2025', place: 'Lusaka',
    pa: '#5E3A5C', pb: '#8A5A2A', ar: '2-3',
    summary: 'Full-day wedding coverage with photography, film and aerial.',
    body: [
      'A full day, covered end to end — preparations through to the last dance — with a run sheet agreed with the family a week in advance so the group portraits happened without anyone hunting for uncles.',
      'Highlight film and an unlimited gallery of edited stills, delivered to a private online gallery.',
    ],
    frames: [
      { tag: 'Preparations', ratio: '2-3' },
      { tag: 'Ceremony', ratio: '3-2' },
      { tag: 'Family groups', ratio: '16-9' },
      { tag: 'Reception', ratio: '3-2' },
      { tag: 'Aerial · venue', ratio: '21-9' },
      { tag: 'Portrait', ratio: '4-5' },
    ],
    stats: [['Coverage', 'Full day'], ['Crew', 'Photo + video, second shooter'], ['Aerial', 'Drone, subject to permissions'], ['Delivery', 'Private gallery']],
  },
  {
    id: 'family-legacy', cat: 'weddings', catLabel: 'Portraits',
    client: 'Private client', title: 'Family Legacy',
    kind: 'Legacy portraiture', year: '2025', place: 'Kitwe',
    pa: '#4A4A2E', pb: '#7A4A28', ar: '4-5',
    summary: 'Multi-generation family portraiture shot at home.',
    body: [
      'Three generations, one afternoon, at the house where the family actually lives. Planned wardrobe and timing in advance so the light and the people arrived together.',
      'Delivered print-ready with an album design option.',
    ],
    frames: [
      { tag: 'Three generations', ratio: '16-9' },
      { tag: 'Grandparents', ratio: '4-5' },
      { tag: 'Children', ratio: '3-2' },
      { tag: 'Detail · hands', ratio: '1-1' },
    ],
    stats: [['Format', 'Studio at your home'], ['Scope', 'Multi-generation'], ['Output', 'Print-ready + album option']],
  },
  {
    id: 'studio-at-home', cat: 'weddings', catLabel: 'Portraits',
    client: 'Private clients', title: 'Studio at Your Home',
    kind: 'Portrait sessions', year: 'Ongoing', place: 'Copperbelt',
    pa: '#3E4A5C', pb: '#7A5230', ar: '1-1',
    summary: "A portable studio setup brought to the client's own space.",
    body: [
      'Full studio lighting, carried in and set up in a living room, a garden or an office. People photograph better where they are comfortable, and nobody has to drive anywhere.',
      'Pre-shoot consultation, posing guidance throughout, unlimited edited images.',
    ],
    frames: [
      { tag: 'Setup · living room', ratio: '3-2' },
      { tag: 'Portrait', ratio: '4-5' },
      { tag: 'Portrait', ratio: '1-1' },
      { tag: 'Family', ratio: '16-9' },
    ],
    stats: [['Setup', 'Portable studio'], ['Session', '1–4 hours'], ['Images', 'Unlimited edited']],
  },
]

export const WORK_CATEGORIES: [ProjectFilter, string][] = [
  ['all', 'All work'],
  ['mining', 'Mining & industry'],
  ['industry', 'Corporate'],
  ['ngo', 'NGO & development'],
  ['agri', 'Agribusiness'],
  ['weddings', 'Weddings & portraits'],
]
export type ProjectFilter = 'all' | Project['cat']

export function findProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id)
}

/** Previous and next project in roster order, wrapping at the ends. */
export function neighbours(id: string): { prev: Project; next: Project } {
  const i = Math.max(0, PROJECTS.findIndex((p) => p.id === id))
  const n = PROJECTS.length
  return { prev: PROJECTS[(i - 1 + n) % n]!, next: PROJECTS[(i + 1) % n]! }
}
