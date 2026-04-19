import React, { useEffect, useRef, useState } from 'react'
import portraitImg from '../assets/6.png'
import { useContentContext } from '../contexts/ContentContext'

function AchievementsCarousel({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const total = items.length

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, total - 1))
    setCurrent(clamped)
    const track = trackRef.current
    if (!track) return
    const slide = track.children[clamped] as HTMLElement
    if (slide) slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const slideWidth = (track.children[0] as HTMLElement)?.offsetWidth || 1
      setCurrent(Math.max(0, Math.min(Math.round(track.scrollLeft / (slideWidth + 16)), total - 1)))
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [total])

  return (
    <div className="hscroll-carousel hscroll-carousel--achievements">
      <div className="hscroll-track" ref={trackRef}>
        {items.map((achievement, idx) => (
          <div className="hscroll-slide" key={idx}>
            <div className="achievement-card" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              height: '100%',
            }}>
              <span style={{ fontSize: '1.5rem', color: '#ff0033', flexShrink: 0 }}>🏆</span>
              <span style={{ fontSize: '1.1rem', color: '#e0e0e0', fontWeight: 500 }}>{achievement}</span>
            </div>
          </div>
        ))}
      </div>
      {total > 1 && (
        <>
          <button className="gallery-carousel-arrow gallery-carousel-arrow--prev" onClick={() => scrollTo(current - 1)} disabled={current === 0} aria-label="Previous">‹</button>
          <button className="gallery-carousel-arrow gallery-carousel-arrow--next" onClick={() => scrollTo(current + 1)} disabled={current === total - 1} aria-label="Next">›</button>
          <div className="gallery-carousel-dots">
            {items.map((_, i) => (
              <button key={i} className={`gallery-carousel-dot${i === current ? ' active' : ''}`} onClick={() => scrollTo(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function FootfallDisplay({ value }: { value: string }) {
  // Grab everything up to and including the last "0" in the string
  const idx = value.lastIndexOf('0')
  if (idx === -1) return <>{value}</>
  return (
    <>
      {value.slice(0, idx)}
      <span className="dancing-zero">0</span>
      {value.slice(idx + 1)}
    </>
  )
}

export const About: React.FC = () => {
  const { content, loading } = useContentContext()
  const about = content?.about

  if (loading) return <div className="about-loading-placeholder" style={{ minHeight: '400px' }}></div>
  if (!about) return null

  return (
    <section id="about" className="about">
      <div className="container">
        {/* Hero split: image + intro */}
        <div className="about-grid">
          <div className="about-image reveal-left">
            <div className="image-wrapper">
              <div className="image-placeholder" style={{ aspectRatio: (about as any).imageAspect || '4/5' }}>
                <img src={about.image || portraitImg} alt={about.title || 'Shubhangii Kedar'} />
              </div>
              <div className="image-decoration"></div>
            </div>
          </div>
          <div className="about-content reveal-right">
            <h2 className="section-title">{about.title || 'About'}</h2>
            <div className="title-decoration"></div>
            <div
              className="about-text"
              dangerouslySetInnerHTML={{ __html: about.description }}
            />
            {about.descriptionSecondary && (
              <div
                className="about-text"
                dangerouslySetInnerHTML={{ __html: about.descriptionSecondary }}
              />
            )}
          </div>
        </div>

        {/* Performance banner */}
        {about.performanceBanner?.cities && (
          <div className="about-banner reveal-scale" style={{
            fontSize: about.performanceBanner.fontSize || undefined,
            fontFamily: about.performanceBanner.fontFamily || undefined,
          }}>
            <p>
              <strong>PERFORMED ACROSS <span className="accent">{about.performanceBanner.cities}</span> WITH</strong>
              <br />
              <strong className="accent">
                <FootfallDisplay value={about.performanceBanner.footfall} />
              </strong>
            </p>
          </div>
        )}

        {/* Achievements */}
        {about.achievements && about.achievements.length > 0 && (
          <div className="about-achievements reveal-scale" style={{ marginTop: '4rem' }}>
            <h3 className="about-subtitle" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span className="achievements-liquid-title">Achievements</span>
            </h3>
            <AchievementsCarousel items={about.achievements} />
          </div>
        )}
      </div>
    </section>
  )
}

export default About
