import { useEffect, useMemo, useRef, useState } from 'react'
import './JourneyTimeline.css'
import { Link } from 'react-router-dom'
import { useContentContext } from '../../contexts/ContentContext'
import { journeyMilestones as STATIC_MILESTONES } from '../../data/content'

export default function JourneyTimeline() {
    const { content } = useContentContext()
    const containerRef = useRef<HTMLDivElement>(null)
    const [progressHeight, setProgressHeight] = useState(0)

    const raw = content?.journeyMilestones?.length ? content.journeyMilestones : STATIC_MILESTONES
    const milestones = useMemo(
        () => [...raw].sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0)),
        [raw]
    )

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return

            // Calculate progress based on how far we've scrolled into the container
            const container = containerRef.current
            const rect = container.getBoundingClientRect()
            const windowHeight = window.innerHeight

            // Start filling when container top hits middle of screen
            const startOffset = windowHeight * 0.5
            const scrolled = startOffset - rect.top

            // Max height is container height
            const progress = Math.max(0, Math.min(scrolled, rect.height))
            setProgressHeight(progress)

            // Activate items
            const items = document.querySelectorAll('.timeline-item')
            items.forEach((item) => {
                const itemRect = item.getBoundingClientRect()
                if (itemRect.top < windowHeight * 0.85) {
                    item.classList.add('active')
                } else {
                    item.classList.remove('active')
                }
            })
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll() // Init
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="journey-container">
            <div className="journey-bg" />

            <div className="container timeline-wrapper" ref={containerRef}>
                <div className="journey-header">
                    <Link to="/" className="nav-back-button" style={{
                        display: 'inline-block',
                        marginBottom: '20px',
                        color: 'var(--text-dim)',
                        textDecoration: 'none',
                        fontSize: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '8px 16px',
                        borderRadius: '20px'
                    }}>
                        ← Back to Home
                    </Link>
                    {((content as any)?.journeyPage?.title ?? 'The Tracklist') && (
                        <h1 className="journey-title">
                            {(content as any)?.journeyPage?.title || 'The Tracklist'}
                        </h1>
                    )}
                    {(content as any)?.journeyPage?.subtitle !== '' && (
                        <p className="journey-subtitle">
                            {(content as any)?.journeyPage?.subtitle ?? 'Milestones that defined the sound'}
                        </p>
                    )}
                </div>

                <div className="timeline">
                    <div className="timeline-progress" style={{ height: `${progressHeight}px` }} />

                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="timeline-item">
                            <div className="timeline-dot" />
                            <div className="timeline-content">
                                <div className="timeline-year">{milestone.year}</div>
                                <div className="timeline-card">
                                    <div className="card-image">
                                        <img src={milestone.image} alt={milestone.title} loading="lazy" />
                                    </div>
                                    <div className="card-body">
                                        <h3 className="card-title" style={{ color: milestone.color }}>{milestone.title}</h3>
                                        <div className="card-desc" dangerouslySetInnerHTML={{ __html: milestone.description }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
