export type FeatureStat = {
  label: string
  value: number
}

export type MusicLink = {
  label: string
  href: string
}

export type MusicRelease = {
  title: string
  meta: string
  gradient: [string, string]
  links: MusicLink[]
}

export type EventItem = {
  day: string
  month: string
  title: string
  meta: string
  ticketUrl: string
}

export type PlaylistTrack = {
  title: string
  artist: string
  album: string
  dateAdded: string
  duration: string
  color: string
  src: string
}

export type IconName =
  | 'spotify'
  | 'youtube'
  | 'instagram'
  | 'twitter'
  | 'mail'
  | 'phone'
  | 'location'

export type GalleryItem = {
  title: string
  description: string
  gradient: [string, string]
  aspect?: 'tall' | 'wide' | 'square'
}

export type Testimonial = {
  quote: string
  author: string
}

export type ContactItem = {
  icon: IconName
  label: string
  value: string
}

export type SocialLink = {
  label: string
  href: string
  icon: IconName
}

export const featureStats: FeatureStat[] = [
  { label: 'Followers', value: 120000 },
  { label: 'Tracks', value: 58 },
  { label: 'Awards', value: 32 },
]

export const aboutStats: FeatureStat[] = [
  { label: 'Performances', value: 500 },
  { label: 'Singles Released', value: 15 },
  { label: 'Awards', value: 50 },
]

export const musicReleases: MusicRelease[] = [
  {
    title: 'Midnight Dreams',
    meta: 'Single • 2024',
    gradient: ['#667eea', '#764ba2'],
    links: [
      { label: 'Spotify', href: '#' },
      { label: 'Apple Music', href: '#' },
      { label: 'YouTube', href: '#' },
    ],
  },
  {
    title: 'Echoes of You',
    meta: 'Single • 2024',
    gradient: ['#f093fb', '#f5576c'],
    links: [
      { label: 'Spotify', href: '#' },
      { label: 'Apple Music', href: '#' },
      { label: 'YouTube', href: '#' },
    ],
  },
  {
    title: 'Golden Hour',
    meta: 'Single • 2023',
    gradient: ['#4facfe', '#00f2fe'],
    links: [
      { label: 'Spotify', href: '#' },
      { label: 'Apple Music', href: '#' },
      { label: 'YouTube', href: '#' },
    ],
  },
]

export const events: EventItem[] = [
  {
    day: '12',
    month: 'DEC',
    title: 'Winter Lights Festival',
    meta: 'Berlin, Germany • Tempodrom',
    ticketUrl: '#',
  },
  {
    day: '23',
    month: 'JAN',
    title: 'Acoustic Night',
    meta: 'Paris, France • Olympia',
    ticketUrl: '#',
  },
  {
    day: '04',
    month: 'FEB',
    title: 'Golden Hour Live',
    meta: 'London, UK • Royal Albert Hall',
    ticketUrl: '#',
  },
]

export const playlistTracks: PlaylistTrack[] = [
  {
    title: 'GoVyachya Kinaryav',
    artist: 'Shubhangii Kedar',
    album: '',
    dateAdded: '',
    duration: '',
    color: '#1DB954',
    src: '',
  },
  {
    title: '',
    artist: 'Shubhangii Kedar',
    album: '',
    dateAdded: '',
    duration: '',
    color: '#1DB954',
    src: '',
  },
  {
    title: '',
    artist: 'Shubhangii Kedar',
    album: '',
    dateAdded: '',
    duration: '',
    color: '#1DB954',
    src: '',
  },
]

export const galleryItems: GalleryItem[] = [
  {
    title: 'Performance 1',
    description: 'Live at Madison Square',
    gradient: ['#fa709a', '#fee140'],
    aspect: 'tall',
  },
  {
    title: 'Studio Session',
    description: 'Recording Studio',
    gradient: ['#a8edea', '#fed6e3'],
    aspect: 'wide',
  },
  {
    title: 'Backstage',
    description: 'Behind the Scenes',
    gradient: ['#d299c2', '#fef9d7'],
    aspect: 'wide',
  },
  {
    title: 'Concert Tour',
    description: 'World Tour 2024',
    gradient: ['#ff9a9e', '#fecfef'],
    aspect: 'tall',
  },
  {
    title: 'Music Video',
    description: 'Music Video Shoot',
    gradient: ['#ffecd2', '#fcb69f'],
    aspect: 'square',
  },
]

export const testimonials: Testimonial[] = [
  {
    quote: '“A voice that lingers long after the last note. Captivating and soulful.”',
    author: '— SoundWave Magazine',
  },
  {
    quote: '“Her live shows are pure magic. An unforgettable experience.”',
    author: '— City Arts Weekly',
  },
  {
    quote: '“A rising star redefining modern pop with elegance.”',
    author: '— The Music Journal',
  },
]

export const contactItems: ContactItem[] = [
  {
    icon: 'mail',
    label: 'Email',
    value: 'aria.rose@music.com',
  },
  {
    icon: 'phone',
    label: 'Phone',
    value: '+1 (555) 123-4567',
  },
  {
    icon: 'location',
    label: 'Location',
    value: 'Los Angeles, CA',
  },
]

export const socialLinks: SocialLink[] = [
  { label: 'Spotify', href: 'https://open.spotify.com/artist/5egpRukgysKxUuzH5Iu1ae', icon: 'spotify' },
  { label: 'YouTube', href: 'https://www.youtube.com/@ShubhangiiKedar', icon: 'youtube' },
  { label: 'Instagram', href: 'https://www.instagram.com/shubhangikedarofficial?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', icon: 'instagram' },
  { label: 'Twitter', href: '#', icon: 'twitter' },
]
