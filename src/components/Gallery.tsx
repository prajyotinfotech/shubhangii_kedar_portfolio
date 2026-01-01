// import { InstagramEmbed } from 'react-social-media-embed' // Replaced with custom implementation
import { useEffect, useRef } from 'react'
import img1 from '../assets/1.png'
import img2 from '../assets/2.png'
import img3 from '../assets/3.png'
import img4 from '../assets/4.png'
import img5 from '../assets/5.png'
import img6 from '../assets/6.png'
import imgA from '../assets/3.png'
import imgB from '../assets/6.png'
import imgC from '../assets/consert1.png'
import heroBg from '../assets/backofthelatestR.png'
import portrait from '../assets/PWP09949.png'

import { useContentContext } from '../contexts/ContentContext'

type Aspect = 'tall' | 'extra-tall' | 'wide' | 'square'

const aspectClass = (aspect?: Aspect) => {
  switch (aspect) {
    case 'wide':
      return 'gallery-item wide'
    case 'square':
      return 'gallery-item square'
    case 'extra-tall':
      return 'gallery-item extra-tall'
    case 'tall':
    default:
      return 'gallery-item tall'
  }
}

const STATIC_PHOTOS: { src: string; alt: string; aspect: Aspect; type?: 'image' | 'video'; videoUrl?: string; embedCode?: string; platform?: 'instagram' | 'youtube' }[] = [
  { src: img1, alt: 'Live performance', aspect: 'wide' },
  { src: portrait, alt: 'Portrait', aspect: 'tall' },
  { src: img2, alt: 'Studio session', aspect: 'square' },
  { src: heroBg, alt: 'Backdrop', aspect: 'wide' },
  { src: imgA, alt: 'Backstage', aspect: 'square' },
  { src: img3, alt: 'Concert moment', aspect: 'tall' },
  { src: img4, alt: 'On stage', aspect: 'wide' },
  { src: imgB, alt: 'Recording', aspect: 'square' },
  { src: img5, alt: 'Audience vibe', aspect: 'tall' },
  { src: img6, alt: 'Show highlight', aspect: 'wide' },
  { src: imgC, alt: 'Concert crowd', aspect: 'wide' },
]

const getYouTubeEmbedUrl = (url: string) => {
  try {
    // Support regular videos, shorts, and youtu.be links
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)([^&?/]+)|youtu\.be\/([^&?/]+))/);
    const videoId = match?.[1] || match?.[2];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    console.warn('Invalid YouTube URL', e);
  }
  return '';
}

const getInstagramPostId = (url: string) => {
  try {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    return match?.[1] || '';
  } catch (e) {
    console.warn('Invalid Instagram URL', e);
    return '';
  }
}

const isInstagramReel = (url: string) => {
  return url.includes('/reel/');
}

const InstagramEmbed = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const postId = getInstagramPostId(url);

  useEffect(() => {
    if (!postId) return;

    const processEmbeds = () => {
      if ((window as any).instgrm) {
        setTimeout(() => {
          (window as any).instgrm.Embeds.process();
        }, 100);
      }
    };

    // Load Instagram embed script if not already loaded
    if (!(window as any).instgrm) {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => processEmbeds();
      document.body.appendChild(script);
    } else {
      processEmbeds();
    }
  }, [postId]);
  
  if (!postId) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        Invalid Instagram URL
      </div>
    );
  }

  // Determine if this is a reel or post
  const isReel = isInstagramReel(url);
  const permalink = isReel 
    ? `https://www.instagram.com/reel/${postId}/`
    : `https://www.instagram.com/p/${postId}/`;

  // Generate Instagram blockquote embed HTML
  const embedHtml = `
    <blockquote 
      class="instagram-media" 
      data-instgrm-captioned 
      data-instgrm-permalink="${permalink}" 
      data-instgrm-version="14" 
      style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
    </blockquote>
  `;

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: embedHtml }}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};
const InstagramEmbedBlock = ({ embedCode }: { embedCode: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to process embeds
    const processEmbeds = () => {
      if ((window as any).instgrm) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          (window as any).instgrm.Embeds.process();
        }, 100);
      }
    };

    // Load Instagram embed script if not already loaded
    if (!(window as any).instgrm) {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => processEmbeds();
      document.body.appendChild(script);
    } else {
      // If script already loaded, process embeds
      processEmbeds();
    }
  }, [embedCode]);

  // Process embed code to remove external links and improve behavior
  const processEmbedCode = (code: string) => {
    return code
      // Remove target="_blank" to prevent external redirects
      .replace(/target="_blank"/g, 'target="_self"')
      // Add CSS to disable external links but allow play buttons
      .replace('<blockquote', '<blockquote style="position: relative;"')
      // Add overlay to catch clicks on external links
      .replace(/<\/blockquote>/, '<style>.instagram-media a[href*="instagram.com"] { pointer-events: none; } .instagram-media .instagram-media__link { pointer-events: auto !important; }</style></blockquote>');
  };

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: processEmbedCode(embedCode) }}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        // Prevent external redirects
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' && (target as HTMLAnchorElement).href?.includes('instagram.com')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    />
  );
};

export const Gallery: React.FC = () => {
  const { content } = useContentContext()

  const photos = content?.gallery?.length ? content.gallery.map(item => ({
    src: item.image,
    alt: item.title,
    aspect: item.aspect as Aspect,
    type: item.type || 'image',
    videoUrl: item.videoUrl,
    embedCode: item.embedCode,
    platform: item.platform
  })) : STATIC_PHOTOS

  return (
    <section id="gallery" className="gallery">
      <div className="container-fluid">
        <h2 className="section-title center">Gallery</h2>
        <div className="title-decoration center"></div>
        <div className="gallery-grid">
          {photos.map((item, index) => {
            const youtubeEmbedUrl = item.platform === 'youtube' && item.videoUrl ? getYouTubeEmbedUrl(item.videoUrl) : '';
            const instagramPostId = item.platform === 'instagram' && item.videoUrl ? getInstagramPostId(item.videoUrl) : '';

            // Determine what to render
            let content = null;

            if (item.type === 'video' && item.platform === 'instagram') {
              if (item.embedCode) {
                // Instagram Reel with embed code
                content = (
                  <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InstagramEmbedBlock embedCode={item.embedCode} />
                  </div>
                );
              } else if (instagramPostId && item.videoUrl) {
                // Instagram embed using blockquote + embed.js
                content = (
                  <div style={{ width: '100%', height: '100%', background: '#000' }}>
                    <InstagramEmbed url={item.videoUrl} />
                  </div>
                );
              } else {
                // Fallback for missing embed info
                content = (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    Instagram content not available
                  </div>
                );
              }
            } else if (item.type === 'video' && item.platform === 'youtube' && youtubeEmbedUrl) {
              // YouTube video
              content = (
                <div style={{ width: '100%', height: '100%', background: '#000' }}>
                  <iframe
                    src={youtubeEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', borderRadius: '0px' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={item.alt}
                  />
                </div>
              );
            } else if (item.src) {
              // Regular image
              content = (
                <>
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding={index < 2 ? 'sync' : 'async'}
                    draggable={false}
                  />
                  <div className="gallery-overlay">
                    <p>{item.alt}</p>
                  </div>
                </>
              );
            }

            return (
              <div
                className={`reveal-scale ${aspectClass(item.aspect)}`}
                style={{ ['--delay' as any]: `${index * 0.1}s`, position: 'relative' }}
                key={`${item.alt}-${index}`}
              >


                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Gallery
