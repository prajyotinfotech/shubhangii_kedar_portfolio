import { useEffect, useState } from 'react'
import { useContentContext } from '../contexts/ContentContext'
import { testimonials as staticTestimonials } from '../data/content'

export const Testimonials: React.FC = () => {
  const { content } = useContentContext()
  const [index, setIndex] = useState(0)

  // Use API content or fallback to static
  const testimonials = content?.testimonials || staticTestimonials

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  const next = () => setIndex((prev) => (prev + 1) % testimonials.length)

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title">What They Say</h2>
          <div className="title-decoration"></div>
        </div>
        <div className="testimonial-slider">
          {testimonials.map((item, idx) => (
            <div className={`testimonial-slide${idx === index ? ' active' : ''}`} key={item.author}>
              <p className="quote">{item.quote}</p>
              <p className="author">{item.author}</p>
            </div>
          ))}
        </div>
        <div className="slider-controls">
          <button className="slider-prev" onClick={prev} aria-label="Previous testimonial">
            ‹
          </button>
          <button className="slider-next" onClick={next} aria-label="Next testimonial">
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

