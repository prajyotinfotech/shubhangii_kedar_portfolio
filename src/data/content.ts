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

export type JourneyMilestone = {
  id: number
  title: string
  description: string
  year: string
  side: 'left' | 'right'
  color: string
  image: string
}

export const journeyMilestones: JourneyMilestone[] = [
  {
    id: 1,
    title: 'Roots in Maharashtra',
    description: 'My journey began in the small towns of Maharashtra, where devotional songs and folk melodies filled the air. Singing started as something I did for family and friends, immersed in the rich tradition of abhangs and Marathi folk music.',
    year: '2010',
    side: 'left',
    color: '#ff6b35',
    image: '/src/assets/1.png',
  },
  {
    id: 2,
    title: 'First Competition',
    description: 'Won the State Vocal Championship, marking the first step into professional music. This victory ignited my dream to share our stories and sounds with the world.',
    year: '2015',
    side: 'right',
    color: '#00ccff',
    image: '/src/assets/2.png',
  },
  {
    id: 3,
    title: 'Debut Single',
    description: 'Released "Midnight Dreams", which garnered 100k+ streams in the first month. The beginning of building a family that would span continents.',
    year: '2018',
    side: 'left',
    color: '#ffd700',
    image: '/src/assets/3.png',
  },
  {
    id: 4,
    title: 'Govyachya Kinaryav & Ishkkachi Nauka',
    description: 'These breakthrough hits together crossed 43 million+ streams, becoming anthems for Marathi music lovers worldwide. The songs blended traditional folk with contemporary sounds, resonating across generations.',
    year: '2020',
    side: 'right',
    color: '#cc00ff',
    image: '/src/assets/4.png',
  },
  {
    id: 5,
    title: 'Mirchi Music Award',
    description: 'Earned the prestigious Mirchi Music Award for Upcoming Playback Singer. Recognition for preserving the soul of Marathi music while embracing modern influences, and lending my voice to films in Marathi, Kannada, and Hindi.',
    year: '2022',
    side: 'left',
    color: '#00ff99',
    image: '/src/assets/5.png',
  },
  {
    id: 6,
    title: 'Global Marathi Icon',
    description: 'Today, I\'m humbled to see my dream becoming reality: 540M+ YouTube views, 65M+ Spotify streams, 750k monthly listeners, 408k YouTube subscribers, 480k+ Instagram followers, and 50+ original songs. Our mission continues: taking Marathi music across oceans.',
    year: '2024',
    side: 'right',
    color: '#ff0055',
    image: '/src/assets/6.png',
  },
]
