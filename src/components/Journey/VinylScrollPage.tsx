import { useEffect, useRef, useState } from 'react'
import './VinylScrollPage.css'
import { journeyMilestones } from '../../data/content'
import { Link } from 'react-router-dom'

export default function VinylScrollPage() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current
            if (!container) return

            const scrollPosition = container.scrollTop
            const sectionHeight = window.innerHeight
            const index = Math.round(scrollPosition / sectionHeight)
            setCurrentIndex(index)
        }

        const container = containerRef.current
        container?.addEventListener('scroll', handleScroll)
        return () => container?.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="vinyl-scroll-container" ref={containerRef}>
            {/* Navigation */}
            <Link to="/" className="nav-back-button">
                ← Back
            </Link>

            {/* Dust particles */}
            <div className="dust-particles">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="dust-particle" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${5 + Math.random() * 10}s`
                    }} />
                ))}
            </div>

            {/* Full-screen sections */}
            {journeyMilestones.map((milestone, index) => (
                <section
                    key={milestone.id}
                    className={`vinyl-section ${currentIndex === index ? 'active' : ''}`}
                >
                    {/* Parallax background */}
                    <div className="parallax-bg">
                        <div
                            className="bg-layer bg-layer-1"
                            style={{ backgroundImage: `url(${milestone.image})` }}
                        />
                        <div
                            className="bg-layer bg-layer-2"
                            style={{ backgroundImage: `url(${milestone.image})` }}
                        />
                        <div className="bg-gradient" />
                    </div>

                    {/* Left side - Info */}
                    <div className="vinyl-left">
                        <div className="info-content">
                            <div className="year-badge" style={{
                                backgroundColor: milestone.color,
                                boxShadow: `0 0 20px ${milestone.color}40`
                            }}>
                                {milestone.year}
                            </div>
                            <h2 className="milestone-title">{milestone.title}</h2>
                            <p className="milestone-desc">{milestone.description}</p>

                            {/* Decorative line */}
                            <div className="deco-line" style={{ backgroundColor: milestone.color }} />
                        </div>
                    </div>

                    {/* Right side - Vinyl with drop-in animation */}
                    <div className="vinyl-right">
                        <div className={`vinyl-container ${currentIndex === index ? 'drop-in' : ''}`}>
                            {/* Glow effect */}
                            <div className="vinyl-glow" style={{
                                boxShadow: `0 0 60px ${milestone.color}30`
                            }} />

                            <div className="vinyl-assembly">
                                {/* Rotating Vinyl Disc */}
                                <div className="vinyl-disc">
                                    {/* Light glint */}
                                    <div className="vinyl-glint" />

                                    {/* Grooves */}
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={`groove groove-${i + 1}`} />
                                    ))}
                                </div>

                                {/* Static Center Label (Does not rotate) */}
                                <div className="vinyl-center-static" style={{ backgroundColor: milestone.color }}>
                                    <div className="label-highlight" />
                                    <div className="center-image">
                                        <img src={milestone.image} alt={milestone.title} />
                                    </div>
                                    <div className="center-ring" style={{ borderColor: milestone.color }} />
                                    <div className="center-dot" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    {index < journeyMilestones.length - 1 && (
                        <div className="scroll-indicator">
                            <div className="scroll-line" />
                            <div className="scroll-text">Scroll</div>
                        </div>
                    )}
                </section>
            ))}
        </div>
    )
}
