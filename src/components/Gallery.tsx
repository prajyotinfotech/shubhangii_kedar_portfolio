import { useEffect, useRef, useState } from 'react'
import img1 from '../assets/1.webp'
import img2 from '../assets/2.webp'
import img3 from '../assets/3.webp'
import img4 from '../assets/4.webp'
import img5 from '../assets/5.webp'
import img6 from '../assets/6.webp'
import imgC from '../assets/consert1.webp'
import heroBg from '../assets/backofthelatestR.webp'
import portrait from '../assets/PWP09949.webp'

import { useContentContext } from '../contexts/ContentContext'

const legacyAspectMap: Record<string, string> = {
  square: '1/1',
  tall: '4/5',
  'extra-tall': '9/16',
  wide: '4/3',
}

const resolveAspect = (aspect?: string): string => {
  if (!aspect) return '4/5'
  return legacyAspectMap[aspect] ?? aspect
}

const STATIC_PHOTOS: {
  src: string
  alt: string
  aspect: string
  type?: 'image' | 'video'
  videoUrl?: string
  embedCode?: string
  platform?: 'instagram' | 'youtube'
}[] = [
  { src: img1, alt: 'Live performance', aspect: 'wide' },
  { src: portrait, alt: 'Portrait', aspect: 'tall' },
  { src: img2, alt: 'Studio session', aspect: 'square' },
  { src: heroBg, alt: 'Backdrop', aspect: 'wide' },
  { src: img3, alt: 'Concert moment', aspect: 'tall' },
  { src: img4, alt: 'On stage', aspect: 'wide' },
  { src: img5, alt: 'Audience vibe', aspect: 'tall' },
  { src: img6, alt: 'Show highlight', aspect: 'wide' },
  { src: imgC, alt: 'Concert crowd', aspect: 'wide' },
]

const GALLERY_MAX = 12

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)([^&?/]+)|youtu\.be\/([^&?/]+))/)
    const videoId = match?.[1] || match?.[2]
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  } catch { /* ignore */ }
  return ''
}

const getInstagramPostId = (url: string) => {
  try {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
    return match?.[1] || ''
  } catch { return '' }
}

const InstagramEmbed = ({ url }: { url: string }) => {
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
    } else { process() }
  }, [postId])

  if (!postId) return null
  const isReel = url.includes('/reel/')
  const permalink = isReel
    ? `https://www.instagram.com/reel/${postId}/`
    : `https://www.instagram.com/p/${postId}/`
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{
        __html: `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${permalink}" data-instgrm-version="14" style="max-width:540px;width:100%;margin:0 auto;"></blockquote>`,
      }}
    />
  )
}

const InstagramEmbedBlock = ({ embedCode }: { embedCode: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const process = () => {
      if ((window as any).instgrm) setTimeout(() => (window as any).instgrm.Embeds.process(), 100)
    }
    if (!(window as any).instgrm) {
      const s = document.createElement('script')
      s.src = '//www.instagram.com/embed.js'
      s.async = true
      s.onload = process
      document.body.appendChild(s)
    } else { process() }
  }, [embedCode])

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: embedCode }}
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    />
  )
}

type GalleryItem = {
  src: string
  alt: string
  aspect: string
  type?: 'image' | 'video'
  videoUrl?: string
  embedCode?: string
  platform?: 'instagram' | 'youtube'
}

function GalleryItemContent({ item, index }: { item: GalleryItem; index: number }) {
  const ytEmbed = item.platform === 'youtube' && item.videoUrl ? getYouTubeEmbedUrl(item.videoUrl) : ''
  const igId = item.platform === 'instagram' && item.videoUrl ? getInstagramPostId(item.videoUrl) : ''

  if (item.type === 'video' && item.platform === 'instagram') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.embedCode
          ? <InstagramEmbedBlock embedCode={item.embedCode} />
          : igId && item.videoUrl
            ? <InstagramEmbed url={item.videoUrl} />
            : <span style={{ color: '#666', fontSize: 14 }}>Instagram content not available</span>}
      </div>
    )
  }
  if (item.type === 'video' && item.platform === 'youtube' && ytEmbed) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#000' }}>
        <iframe src={ytEmbed} width="100%" height="100%" style={{ border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={item.alt} />
      </div>
    )
  }
  if (item.src) {
    return (
      <>
        <img src={item.src} alt={item.alt} loading={index < 2 ? 'eager' : 'lazy'} decoding={index < 2 ? 'sync' : 'async'} draggable={false} />
        <div className="gallery-overlay"><p>{item.alt}</p></div>
      </>
    )
  }
  return null
}

// Mobile horizontal carousel
function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const [current, setCurrent] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const total = items.length

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, total - 1))
    setCurrent(clamped)
    if (!trackRef.current) return
    const slide = trackRef.current.children[clamped] as HTMLElement
    if (slide) slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  // Sync dot indicator when user swipes freely
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const slideWidth = (track.children[0] as HTMLElement)?.offsetWidth || 1
      const idx = Math.round(track.scrollLeft / (slideWidth + 12))
      setCurrent(Math.max(0, Math.min(idx, total - 1)))
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [total])

  return (
    <div className="gallery-carousel">
      <div className="gallery-carousel-track" ref={trackRef}>
        {items.map((item, i) => (
          <div
            className="gallery-carousel-slide"
            key={`${item.alt}-${i}`}
            style={{ aspectRatio: resolveAspect(item.aspect) }}
          >
            <GalleryItemContent item={item} index={i} />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            className="gallery-carousel-arrow gallery-carousel-arrow--prev"
            onClick={() => scrollTo(current - 1)}
            aria-label="Previous"
            disabled={current === 0}
          >‹</button>
          <button
            className="gallery-carousel-arrow gallery-carousel-arrow--next"
            onClick={() => scrollTo(current + 1)}
            aria-label="Next"
            disabled={current === total - 1}
          >›</button>
          <div className="gallery-carousel-dots">
            {items.map((_, i) => (
              <button
                key={i}
                className={`gallery-carousel-dot${i === current ? ' active' : ''}`}
                onClick={() => scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Desktop grid (existing style, max 12)
function GalleryGrid({ items, offset = 0 }: { items: GalleryItem[]; offset?: number }) {
  return (
    <div className="gallery-grid">
      {items.map((item, i) => (
        <div
          className="reveal-scale gallery-item"
          style={{
            ['--delay' as any]: `${(offset + i) * 0.1}s`,
            position: 'relative',
            aspectRatio: item.type === 'video' ? resolveAspect(item.aspect || '16/9') : resolveAspect(item.aspect),
          }}
          key={`${item.alt}-${offset + i}`}
        >
          <GalleryItemContent item={item} index={offset + i} />
        </div>
      ))}
    </div>
  )
}

export const Gallery: React.FC = () => {
  const { content } = useContentContext()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const allItems: GalleryItem[] = content?.gallery?.length
    ? content.gallery.map(item => ({
        src: item.image,
        alt: item.title,
        aspect: item.aspect,
        type: item.type || 'image',
        videoUrl: item.videoUrl,
        embedCode: item.embedCode,
        platform: item.platform,
      }))
    : STATIC_PHOTOS

  const photoItems = allItems.filter(item => item.type !== 'video').slice(0, GALLERY_MAX)
  const videoItems = allItems.filter(item => item.type === 'video')

  return (
    <section id="gallery" className="gallery">
      <div className="container-fluid">
        <h2 className="section-title center">Gallery</h2>
        <div className="title-decoration center"></div>

        {photoItems.length > 0 && (
          <>
            {videoItems.length > 0 && <h3 className="gallery-sub-title">Photos</h3>}
            {isMobile
              ? <GalleryCarousel items={photoItems} />
              : <GalleryGrid items={photoItems} offset={0} />}
          </>
        )}

        {videoItems.length > 0 && (
          <>
            <h3 className="gallery-sub-title">Videos</h3>
            {isMobile
              ? <GalleryCarousel items={videoItems} />
              : <div className="gallery-grid gallery-grid--videos">
                  {videoItems.map((item, i) => (
                    <div
                      className="reveal-scale gallery-item"
                      style={{
                        ['--delay' as any]: `${(photoItems.length + i) * 0.1}s`,
                        position: 'relative',
                        aspectRatio: resolveAspect(item.aspect || '16/9'),
                      }}
                      key={`${item.alt}-${photoItems.length + i}`}
                    >
                      <GalleryItemContent item={item} index={photoItems.length + i} />
                    </div>
                  ))}
                </div>}
          </>
        )}
      </div>
    </section>
  )
}

export default Gallery
