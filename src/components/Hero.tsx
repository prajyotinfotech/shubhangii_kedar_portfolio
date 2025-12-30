import { useEffect, useRef, useState } from 'react'
import CountUp from './CountUp'
import youtubeIcon from '../assets/icons/youtube.svg'
import instagramIcon from '../assets/icons/instagram.svg'
import spotifyIcon from '../assets/icons/spotify.svg'
import slidePrimary from '../assets/3.png'
import slideStudio from '../assets/6.png'
import slideLive from '../assets/backofthelatestR.png'
import slidePrimaryMobile from '../assets/mobile1stslide.png'
import { useContentContext } from '../contexts/ContentContext'

const HERO_VIDEO = '' // Provide a video URL if available

type HeroAction = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}

type HeroSlide = {
  id: string
  image: string
  alt: string
  heading: string[]
  subtitle: string
  actions?: HeroAction[]
  mobileImage?: string
}

type PillKind = 'youtube' | 'tracks' | 'instagram'
type PillStat = { kind: PillKind; top?: string; sub?: string; value: number; color: string; delta?: string }

const STATIC_PILLS: PillStat[] = [
  { kind: 'instagram', top: 'Instagram', sub: 'followers', value: 480_000, color: '#B84DFF' },
  { kind: 'youtube', top: 'YouTube', sub: 'Views', value: 540_000_000, color: '#FF0000' },
  { kind: 'tracks', top: 'Streaming', sub: 'Views', value: 65_000_000, color: '#1DB954' },
]

const staticHeroSlides: HeroSlide[] = [
  {
    id: 'live-neon-stage',
    image: slidePrimary,
    alt: 'Shubhangi Kedar performing live',
    heading: ['Namaskar, I’m Shubhangii Kedar'],
    subtitle: 'A voice rooted in Maharashtra, resonating around the world',
    mobileImage: slidePrimaryMobile,
  },
  {
    id: 'studio-microphone',
    image: slideStudio,
    alt: 'Shubhangi Kedar recording in studio',
    heading: ['#Marathi Worldwide Mission'],
    subtitle: 'Join our journey to take Marathi music across oceans',
  },
  {
    id: 'crowd-concert',
    image: slideLive,
    alt: 'Shubhangi Kedar on stage with vibrant crowd',
    heading: ['Experience the Story behind every Song'],
    subtitle: 'From devotional abhangs to contemporary originals, each melody holds a story',
  },
]

export const Hero: React.FC = () => {
  const { content } = useContentContext()
  const [activeSlide, setActiveSlide] = useState(0)

  const heroSlides = content?.hero?.slides?.length ? content.hero.slides.map(s => ({
    ...s,
    // Use local assets if the image path matches what we expect, or the path itself
    image: s.image.includes('/assets/') ? s.image : s.image,
  })) : staticHeroSlides

  const heroPills = (content?.hero?.pills as PillStat[]) || STATIC_PILLS

  const currentSlide = heroSlides[activeSlide] || heroSlides[0]
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)
  const [typedSubtitle, setTypedSubtitle] = useState('')
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [subtitleComplete, setSubtitleComplete] = useState(false)

  const goToSlide = (index: number) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length)
  }

  // Autoplay every 6 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((s) => (s + 1) % heroSlides.length)
    }, 12000)
    return () => clearInterval(id)
  }, [])

  const nextSlide = () => goToSlide(activeSlide + 1)
  const prevSlide = () => goToSlide(activeSlide - 1)

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null) return
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }

  const onTouchEnd = () => {
    const delta = touchDeltaX.current
    touchStartX.current = null
    touchDeltaX.current = 0
    const threshold = 48
    if (Math.abs(delta) < threshold) return
    if (delta < 0) nextSlide()
    else prevSlide()
  }

  useEffect(() => {
    const subtitle = heroSlides[activeSlide]?.subtitle ?? ''
    let startDelay: ReturnType<typeof setTimeout> | null = null
    let typingTimer: ReturnType<typeof setTimeout> | null = null

    setTypedSubtitle('')
    setSubtitleVisible(false)
    setSubtitleComplete(false)

    if (!subtitle) return

    const typeChar = (index: number) => {
      setTypedSubtitle(subtitle.slice(0, index + 1))
      if (index + 1 < subtitle.length) {
        typingTimer = setTimeout(() => typeChar(index + 1), 35)
      } else {
        setSubtitleComplete(true)
      }
    }

    startDelay = setTimeout(() => {
      setSubtitleVisible(true)
      typeChar(0)
    }, 1100)

    return () => {
      if (startDelay) clearTimeout(startDelay)
      if (typingTimer) clearTimeout(typingTimer)
    }
  }, [activeSlide])

  return (
    <section id="home" className="hero" style={{ ['--hero-slide-duration' as any]: '6s' }}>
      <div
        className="hero-slider"
        aria-hidden="true"
        onClick={nextSlide}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide${index === activeSlide ? ' is-active' : ''}`}
          >
            {slide.mobileImage ? (
              <picture>
                <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                <img
                  src={slide.image}
                  alt={slide.alt}
                  draggable={false}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding={index === 0 ? 'sync' : 'async'}
                />
              </picture>
            ) : (
              <img
                src={slide.image}
                alt={slide.alt}
                draggable={false}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding={index === 0 ? 'sync' : 'async'}
              />
            )}
          </div>
        ))}
      </div>
      <div className="hero-background" />
      {HERO_VIDEO && (
        <div className="hero-video-wrap">
          <video className="hero-video" autoPlay muted loop playsInline preload="none">
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        </div>
      )}

      <button className="hero-nav hero-nav-prev" onClick={prevSlide} aria-label="Previous slide">
        <span aria-hidden="true">‹</span>
      </button>
      <button className="hero-nav hero-nav-next" onClick={nextSlide} aria-label="Next slide">
        <span aria-hidden="true">›</span>
      </button>

      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            {currentSlide.heading.map((line) => (
              <span className="line" key={line}>
                {line}
              </span>
            ))}
          </h1>
          <p
            className={`hero-subtitle${subtitleVisible ? ' is-visible' : ''}${subtitleComplete ? ' is-complete' : ''
              }`}
            aria-live="polite"
          >
            {typedSubtitle}
            <span className="typing-caret" aria-hidden="true" />
          </p>
          <div className="hero-pills">
            {heroPills.map((p: PillStat, idx: number) => (
              <div className={`hero-pill ${p.kind}`} key={`${p.kind}-${idx}`}>
                <span className="pill-icon" aria-hidden="true">
                  {p.kind === 'youtube' && <img src={youtubeIcon} alt="" />}
                  {p.kind === 'tracks' && <img src={spotifyIcon} alt="" />}
                  {p.kind === 'instagram' && <img src={instagramIcon} alt="" />}
                </span>
                <div className="pill-body">
                  {p.top && <span className="pill-top">{p.top}</span>}
                  <span className="pill-value" style={{ color: '#fff' }}>
                    <CountUp value={p.value} duration={3000} />
                  </span>
                  {p.sub && <span className="pill-sub">{p.sub}</span>}
                </div>
                {p.kind === 'instagram' && p.delta && (
                  <span className="pill-delta">{p.delta}</span>
                )}
              </div>
            ))}
          </div>
          {currentSlide.actions && (
            <div className="hero-buttons">
              {currentSlide.actions.map((action) => (
                <a
                  key={`${currentSlide.id}-${action.label}`}
                  href={action.href}
                  className={`btn btn-${action.variant ?? 'primary'}`}
                >
                  {action.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hero-indicators" role="tablist" aria-label="Hero slides">
        {heroSlides.map((slide, index) => (
          <button
            key={`indicator-${slide.id}`}
            type="button"
            className={`hero-indicator${index === activeSlide ? ' active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-pressed={index === activeSlide}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero
