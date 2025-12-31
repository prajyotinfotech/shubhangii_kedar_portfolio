import { useEffect, useRef, useState } from 'react'
import './JourneyTimeline.css'
import { Link } from 'react-router-dom'
import { useContentContext } from '../../contexts/ContentContext'
import { journeyMilestones as STATIC_MILESTONES } from '../../data/content'

export default function JourneyTimeline() {
    const { content } = useContentContext()
    const containerRef = useRef<HTMLDivElement>(null)
    const [progressHeight, setProgressHeight] = useState(0)

    const milestones = content?.journeyMilestones?.length ? content.journeyMilestones : STATIC_MILESTONES

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
                    <h1 className="journey-title">The Tracklist</h1>
                    <p className="journey-subtitle">Milestones that defined the sound</p>
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
