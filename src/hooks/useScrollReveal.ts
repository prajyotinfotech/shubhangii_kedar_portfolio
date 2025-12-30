import { useEffect } from 'react'

const selectors = ['.reveal-left', '.reveal-right', '.reveal-scale']

export const useScrollReveal = (deps: any[] = []) => {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(selectors.join(', '))
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px',
      },
    )

    elements.forEach((el) => {
      // If it's already active, don't observe it again
      if (el.classList.contains('active')) return
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, deps)
}

export default useScrollReveal
