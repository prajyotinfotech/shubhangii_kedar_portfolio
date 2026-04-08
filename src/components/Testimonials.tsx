import { useEffect, useRef } from 'react'
import { useContentContext } from '../contexts/ContentContext'
import { testimonials as staticTestimonials } from '../data/content'

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

const InstagramTestimonialEmbed = ({ url }: { url: string }) => {
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
  const permalink = isReel ? `https://www.instagram.com/reel/${postId}/` : `https://www.instagram.com/p/${postId}/`
  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: `<blockquote class="instagram-media" data-instgrm-permalink="${permalink}" data-instgrm-version="14" style="max-width:540px;width:100%;margin:0 auto;"></blockquote>` }}
    />
  )
}

export const Testimonials: React.FC = () => {
  const { content } = useContentContext()
  const testimonials = content?.testimonials?.length ? content.testimonials : staticTestimonials

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title">What They Say</h2>
          <div className="title-decoration"></div>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item) => {
            const isVideo = (item as any).type === 'video'
            const platform = (item as any).platform as 'youtube' | 'instagram' | undefined
            const videoUrl = (item as any).videoUrl as string | undefined
            const ytEmbed = isVideo && videoUrl && platform === 'youtube' ? getYouTubeEmbedUrl(videoUrl) : ''

            return (
              <div
                className={`testimonial-card${isVideo ? ' testimonial-card--video' : ''}`}
                key={(item as any).id || item.author}
              >
                {isVideo && videoUrl && ytEmbed && (
                  <div className="testimonial-video-wrap">
                    <iframe
                      src={ytEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 'none', borderRadius: '10px' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={item.author}
                    />
                  </div>
                )}
                {isVideo && videoUrl && platform === 'instagram' && !ytEmbed && (
                  <div style={{ marginBottom: '1rem' }}>
                    <InstagramTestimonialEmbed url={videoUrl} />
                  </div>
                )}
                {item.quote && (
                  <p className="quote" style={{ textAlign: 'center' }}>{item.quote}</p>
                )}
                <p className="author" style={{ textAlign: 'center' }}>{item.author}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
