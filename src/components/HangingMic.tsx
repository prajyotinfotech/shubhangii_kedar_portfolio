import { useEffect, useRef, useState } from 'react'
import concertMic from '../assets/microphone.png'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const HangingMic: React.FC = () => {
  const [progress, setProgress] = useState(0)
  const draggingRef = useRef(false)
  const startYRef = useRef(0)
  const startScrollRef = useRef(0)
  const maxScrollableRef = useRef(0)
  const lastYRef = useRef(0)
  const lastTRef = useRef(0)
  const velocityRef = useRef(0)
  const inertiaRafRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const maxScrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const next = clamp(scrollTop / maxScrollable, 0, 1)
      // Update immediately for a more instant feel
      setProgress(next)
    }

    const onScroll = () => updateProgress()
    const onResize = () => updateProgress()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    updateProgress()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  const baseWire = 110
  const extraWire = 380
  const wireLength = baseWire + extraWire * progress
  const swing = Math.sin(progress * Math.PI) * 5
  const bob = Math.sin(progress * Math.PI * 1.5) * 3

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    startYRef.current = e.clientY
    startScrollRef.current = window.scrollY
    maxScrollableRef.current = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    lastYRef.current = e.clientY
    lastTRef.current = performance.now()
    velocityRef.current = 0
    setIsDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    e.preventDefault()
    const dy = e.clientY - startYRef.current
    const k = maxScrollableRef.current / extraWire
    const nextScroll = clamp(startScrollRef.current + dy * k, 0, maxScrollableRef.current)
    window.scrollTo({ top: nextScroll, behavior: 'auto' })

    // velocity tracking for inertia
    const now = performance.now()
    const dt = Math.max(1, now - lastTRef.current)
    const vy = (e.clientY - lastYRef.current) / dt // px per ms
    velocityRef.current = vy
    lastYRef.current = e.clientY
    lastTRef.current = now
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch {}
    setIsDragging(false)
    startInertia()
  }

  const snapToNearest = () => {
    // Snap to nearest section anchor if within a threshold or after inertia ends
    const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[]
    if (!sections.length) return
    const scrollY = window.scrollY
    const offsets = sections.map((el) => el.offsetTop)
    let nearest = offsets[0]
    for (const off of offsets) {
      if (Math.abs(off - scrollY) < Math.abs(nearest - scrollY)) nearest = off
    }
    const threshold = Math.max(80, window.innerHeight * 0.08)
    if (Math.abs(nearest - scrollY) <= threshold) smoothScrollTo(nearest)
  }

  const smoothScrollTo = (targetTop: number) => {
    const start = window.scrollY
    const delta = targetTop - start
    const dur = 420
    const t0 = performance.now()
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / dur)
      const y = start + delta * easeOutCubic(t)
      window.scrollTo(0, y)
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const startInertia = () => {
    // Momentum scrolling after release
    let v = velocityRef.current * (maxScrollableRef.current / extraWire) * 12 // convert to px per frame approx
    const friction = 0.86
    const step = () => {
      v *= friction
      if (Math.abs(v) < 0.8) {
        inertiaRafRef.current = 0
        snapToNearest()
        return
      }
      const next = clamp(window.scrollY + v, 0, maxScrollableRef.current)
      window.scrollTo(0, next)
      inertiaRafRef.current = requestAnimationFrame(step)
    }
    if (inertiaRafRef.current) cancelAnimationFrame(inertiaRafRef.current)
    inertiaRafRef.current = requestAnimationFrame(step)
  }

  return (
    <div
      className="hanging-mic"
      aria-hidden="true"
      style={{ right: 8, left: 'auto', cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' as any }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Subtle vertical guide */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: -8,
          width: 1,
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 60%, rgba(255,255,255,0))',
          pointerEvents: 'none',
        }}
      />
      <div className="mic-wire" style={{ height: `${wireLength}px` }}>
        <div className="mic-wire-glow" />
      </div>
      <div
        className="mic-body"
        style={{ transform: `translateY(${bob}px) rotate(${swing * 0.4}deg)` }}
      >
        <img src={concertMic} alt="" className="mic-image" draggable={false} style={{ pointerEvents: 'none', userSelect: 'none' }} />
      </div>
    </div>
  )
}

export default HangingMic
