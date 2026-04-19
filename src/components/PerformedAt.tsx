import { useEffect, useRef, useState } from 'react'
import { useContentContext } from '../contexts/ContentContext'

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)([^&?/]+)|youtu\.be\/([^&?/]+))/)
    const videoId = match?.[1] || match?.[2]
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  } catch (e) { /* ignore */ }
  return ''
}

const getInstagramPostId = (url: string) => {
  try {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
    return match?.[1] || ''
  } catch (e) { return '' }
}

const InstagramPerformedEmbed = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const postId = getInstagramPostId(url)

  useEffect(() => {
    if (!postId) return
    const process = () => {
      if ((window as any).instgrm) setTimeout(() => (window as any).instgrm.Embeds.process(), 100)
    }
    if (!(window as any).instgrm) {
      const s = document.createElement('script')
      s.src = '//www.instagram.com/embed.js'
      s.async = true
      s.onload = process
      document.body.appendChild(s)
    } else {
      process()
    }
  }, [postId])

  if (!postId) return null
  const isReel = url.includes('/reel/')
  const permalink = isReel
    ? `https://www.instagram.com/reel/${postId}/`
    : `https://www.instagram.com/p/${postId}/`
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{
        __html: `<blockquote class="instagram-media" data-instgrm-permalink="${permalink}" data-instgrm-version="14" style="max-width:540px;width:100%;margin:0 auto;"></blockquote>`,
      }}
    />
  )
}

export type PerformedAtItem = {
  id?: string
  venue: string
  city: string
  month?: string
  year?: string
  quote?: string
  type?: 'text' | 'video' | 'image'
  platform?: 'youtube' | 'instagram'
  videoUrl?: string
  embedCode?: string
  image?: string
  aspect?: string
  cityFont?: string
  cityColor?: string
}

const staticPerformedAt: PerformedAtItem[] = []

function PerformedAtCard({ item }: { item: PerformedAtItem }) {
  const isVideo = item.type === 'video'
  const isImage = item.type === 'image'
  const platform = item.platform
  const videoUrl = item.videoUrl
  const imageUrl = item.image
  const aspect = item.aspect || '16/9'
  const embedCode = item.embedCode
  const ytEmbed = isVideo && videoUrl && platform === 'youtube' ? getYouTubeEmbedUrl(videoUrl) : ''

  return (
    <div className={`testimonial-card${isVideo ? ' testimonial-card--video' : ''}${isImage ? ' testimonial-card--image' : ''}`}>
      {isVideo && videoUrl && ytEmbed && (
        <div className="testimonial-video-wrap" style={{ aspectRatio: aspect }}>
          <iframe src={ytEmbed} width="100%" height="100%" style={{ border: 'none', borderRadius: '10px' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen title={item.venue} />
        </div>
      )}
      {isVideo && platform === 'instagram' && !ytEmbed && (
        <div style={{ marginBottom: '1rem', width: '100%' }}>
          {embedCode
            ? <div dangerouslySetInnerHTML={{ __html: embedCode }} style={{ display: 'flex', justifyContent: 'center' }} />
            : videoUrl && <InstagramPerformedEmbed url={videoUrl} />}
        </div>
      )}
      {isImage && imageUrl && (
        <div style={{ width: '100%', marginBottom: '1rem', aspectRatio: aspect, overflow: 'hidden', borderRadius: '10px' }}>
          <img src={imageUrl} alt={item.venue} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      {item.quote && <p className="quote" style={{ textAlign: 'center' }}>{item.quote}</p>}
      <p className="author" style={{ textAlign: 'center' }}>{item.venue}</p>
      <p className="performed-at-city" style={{ textAlign: 'center', fontFamily: item.cityFont || undefined, color: item.cityColor || undefined }}>
        {item.city}
        {(item.month || item.year) && (
          <span className="performed-at-date"> &middot; {[item.month, item.year].filter(Boolean).join(' ')}</span>
        )}
      </p>
    </div>
  )
}

function HScrollCarousel({ children, className }: { children: React.ReactNode[]; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const total = children.length

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
    <div className={`hscroll-carousel ${className || ''}`}>
      <div className="hscroll-track" ref={trackRef}>
        {children.map((child, i) => (
          <div className="hscroll-slide" key={i}>{child}</div>
        ))}
      </div>
      {total > 1 && (
        <>
          <button className="gallery-carousel-arrow gallery-carousel-arrow--prev" onClick={() => scrollTo(current - 1)} disabled={current === 0} aria-label="Previous">‹</button>
          <button className="gallery-carousel-arrow gallery-carousel-arrow--next" onClick={() => scrollTo(current + 1)} disabled={current === total - 1} aria-label="Next">›</button>
          <div className="gallery-carousel-dots">
            {children.map((_, i) => (
              <button key={i} className={`gallery-carousel-dot${i === current ? ' active' : ''}`} onClick={() => scrollTo(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const PerformedAt: React.FC = () => {
  const { content } = useContentContext()
  const items: PerformedAtItem[] =
    content?.performedAt?.length ? content.performedAt : staticPerformedAt

  if (!items.length) return null

  return (
    <section id="performed-at" className="testimonials performed-at">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title">Performed At</h2>
          <div className="title-decoration"></div>
        </div>

        <HScrollCarousel>
          {items.map((item) => (
            <PerformedAtCard key={item.id || item.venue} item={item} />
          ))}
        </HScrollCarousel>
      </div>
    </section>
  )
}

export default PerformedAt
