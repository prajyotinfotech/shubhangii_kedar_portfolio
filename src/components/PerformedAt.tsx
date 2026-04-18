import { useEffect, useRef } from 'react'
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
}

const staticPerformedAt: PerformedAtItem[] = []

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

        <div className="testimonials-grid">
          {items.map((item) => {
            const isVideo = item.type === 'video'
            const isImage = item.type === 'image'
            const platform = item.platform
            const videoUrl = item.videoUrl
            const imageUrl = item.image
            const aspect = item.aspect || '16/9'
            const embedCode = item.embedCode
            const ytEmbed =
              isVideo && videoUrl && platform === 'youtube'
                ? getYouTubeEmbedUrl(videoUrl)
                : ''

            return (
              <div
                className={`testimonial-card${isVideo ? ' testimonial-card--video' : ''}${isImage ? ' testimonial-card--image' : ''}`}
                key={item.id || item.venue}
              >
                {isVideo && videoUrl && ytEmbed && (
                  <div className="testimonial-video-wrap" style={{ aspectRatio: aspect }}>
                    <iframe
                      src={ytEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 'none', borderRadius: '10px' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={item.venue}
                    />
                  </div>
                )}
                {isVideo && platform === 'instagram' && !ytEmbed && (
                  <div style={{ marginBottom: '1rem', width: '100%' }}>
                    {embedCode ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: embedCode }}
                        style={{ display: 'flex', justifyContent: 'center' }}
                      />
                    ) : (
                      videoUrl && <InstagramPerformedEmbed url={videoUrl} />
                    )}
                  </div>
                )}
                {isImage && imageUrl && (
                  <div
                    style={{
                      width: '100%',
                      marginBottom: '1rem',
                      aspectRatio: aspect,
                      overflow: 'hidden',
                      borderRadius: '10px',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={item.venue}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {item.quote && (
                  <p className="quote" style={{ textAlign: 'center' }}>
                    {item.quote}
                  </p>
                )}
                <p className="author" style={{ textAlign: 'center' }}>
                  {item.venue}
                </p>
                <p className="performed-at-city" style={{ textAlign: 'center' }}>
                  {item.city}
                  {(item.month || item.year) && (
                    <span className="performed-at-date">
                      {' '}
                      &middot;{' '}
                      {[item.month, item.year].filter(Boolean).join(' ')}
                    </span>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PerformedAt
