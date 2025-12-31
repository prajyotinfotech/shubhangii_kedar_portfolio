import { useRef, useEffect, useState } from 'react'
import { CountUp } from './CountUp'
import instagramIcon from '../assets/icons/instagram.svg'
import facebookIcon from '../assets/icons/facebook.svg'
import youtubeIcon from '../assets/icons/youtube.svg'
import spotifyIcon from '../assets/icons/spotify.svg'
import { useContentContext } from '../contexts/ContentContext'
import './StatsShowcase.css'

const ICON_MAP: Record<string, string> = {
    instagram: instagramIcon,
    facebook: facebookIcon,
    youtube: youtubeIcon,
    spotify: spotifyIcon,
}

export default function StatsShowcase() {
    const { content } = useContentContext()
    const sectionRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    const metrics = content?.about?.metrics || []

    // Sort metrics: YouTube -> Spotify -> Instagram -> Facebook
    const sortOrder = ['youtube', 'spotify', 'instagram', 'facebook']
    const sortedMetrics = [...metrics].sort((a: any, b: any) => {
        const indexA = sortOrder.indexOf(a.icon?.toLowerCase() || '')
        const indexB = sortOrder.indexOf(b.icon?.toLowerCase() || '')

        // If both are in the list, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        // If only A is in the list, it comes first
        if (indexA !== -1) return -1
        // If only B is in the list, it comes first
        if (indexB !== -1) return 1
        // Neither in list, keep original order
        return 0
    })

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.2 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        // Fallback: Force visible after delay if observer misses
        const timer = setTimeout(() => setIsVisible(true), 1000)

        return () => {
            observer.disconnect()
            clearTimeout(timer)
        }
    }, [])

    if (!metrics.length) return null

    return (
        <section ref={sectionRef} className="stats-showcase" id="stats">
            {/* Animated background */}
            <div className="stats-bg">
                <div className="stats-bg-gradient" />
                <div className="stats-bg-particles" />
            </div>

            <div className="container">
                <h2 className="stats-title">Social Impact</h2>
                <p className="stats-subtitle">Numbers that tell our story</p>

                <div className="stats-grid">
                    {sortedMetrics.map((metric: any, idx: number) => (
                        <div
                            key={metric.id}
                            className={`stats-card ${isVisible ? 'visible' : ''}`}
                            style={{
                                '--delay': `${idx * 150}ms`,
                                '--accent': metric.accent,
                            } as React.CSSProperties}
                        >
                            <div className="stats-card-icon" style={{ backgroundColor: `${metric.accent}22` }}>
                                <img src={ICON_MAP[metric.icon] || metric.icon} alt="" />
                            </div>
                            <div className="stats-card-content">
                                <span className="stats-card-category">{metric.category}</span>
                                <div className="stats-card-value">
                                    {isVisible ? (
                                        <CountUp
                                            value={metric.value}
                                            duration={2000}
                                            delay={idx * 150}
                                            formatter={() => metric.display || metric.value?.toLocaleString()}
                                        />
                                    ) : (
                                        '0'
                                    )}
                                </div>
                                <span className="stats-card-label">{metric.label}</span>
                            </div>
                            <div className="stats-card-glow" style={{ background: `radial-gradient(circle, ${metric.accent}30 0%, transparent 70%)` }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
