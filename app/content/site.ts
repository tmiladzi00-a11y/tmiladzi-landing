export const SITE = {
  name: 'Tmiladzi Media',
  url: 'https://tmiladzi.com',
  description: 'Photography, film and documentary production for organisations that have to prove their impact.',
  email: 'tmiladzi@gmail.com',
  phone: '+260 974 901 668',
  phoneHref: 'tel:+260974901668',
  whatsapp: 'https://wa.me/260974901668',
  whatsappDisplay: 'wa.me/260974901668',
  instagram: 'https://instagram.com/tmiladzi',
  youtube: 'https://youtube.com/@tmiladzi',
  linkedin: 'https://www.linkedin.com/in/tsolofelo-miladzi-23b1a5117',
  founder: 'Tsolofelo Miladzi',
  street: '3 Chitambo Road',
  suburb: 'Riverside',
  city: 'Kitwe',
  region: 'Copperbelt',
  postcode: '10101',
  country: 'Zambia',
  tpin: '1017396972',
  founded: '2018',
  /** YouTube or Vimeo URL for the showreel. Empty until the reel is published. */
  showreel: '',
  legalVersion: 'Version 1.0 · 3 September 2026',
} as const

/* Page titles, lifted from the prototype's route map. */
export const TITLES = {
  home: 'Tmiladzi Media',
  work: 'Work',
  films: 'Films',
  capabilities: 'Capabilities',
  studio: 'Studio',
  celebrations: 'Weddings',
  brief: 'Project brief',
  booking: 'Book a date',
  terms: 'Terms of business',
  privacy: 'Privacy notice',
  commercial: 'Commercial services terms',
  copyright: 'Image use',
  contact: 'Contact',
  case: 'Case study',
} as const

export const NAV = [
  { to: '/work', label: 'Work' },
  { to: '/films', label: 'Films' },
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/studio', label: 'Studio' },
  { to: '/celebrations', label: 'Weddings' },
] as const

export const DRAWER = [
  { to: '/work', label: 'Work' },
  { to: '/films', label: 'Films' },
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/studio', label: 'Studio' },
  { to: '/celebrations', label: 'Weddings & Portraits' },
  { to: '/brief', label: 'Start a brief' },
  { to: '/contact', label: 'Contact' },
] as const
