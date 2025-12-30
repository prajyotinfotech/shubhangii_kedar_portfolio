import img1 from '../assets/1.png'
import img2 from '../assets/2.png'
import img3 from '../assets/3.png'
import img4 from '../assets/4.png'
import img5 from '../assets/5.png'
import img6 from '../assets/6.png'
import imgA from '../assets/3a.png'
import imgB from '../assets/6a.png'
import imgC from '../assets/consert1.png'
import heroBg from '../assets/backofthelatestR.png'
import portrait from '../assets/PWP09949.png'

import { useContentContext } from '../contexts/ContentContext'

type Aspect = 'tall' | 'wide' | 'square'

const aspectClass = (aspect?: Aspect) => {
  switch (aspect) {
    case 'wide':
      return 'gallery-item wide'
    case 'square':
      return 'gallery-item square'
    case 'tall':
    default:
      return 'gallery-item tall'
  }
}

const STATIC_PHOTOS: { src: string; alt: string; aspect: Aspect }[] = [
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

export const Gallery: React.FC = () => {
  const { content } = useContentContext()

  const photos = content?.gallery?.length ? content.gallery.map(item => ({
    src: item.image,
    alt: item.title,
    aspect: item.aspect as Aspect
  })) : STATIC_PHOTOS
  return (
    <section id="gallery" className="gallery">
      <div className="container-fluid">
        <h2 className="section-title center">Gallery</h2>
        <div className="title-decoration center"></div>
        <div className="gallery-grid">
          {photos.map((item, index) => (
            <div
              className={`reveal-scale ${aspectClass(item.aspect)}`}
              style={{ ['--delay' as any]: `${index * 0.1}s` }}
              key={`${item.alt}-${index}`}
            >
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery
