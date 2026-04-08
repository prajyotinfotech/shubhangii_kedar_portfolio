import React from 'react'
import { useContentContext } from '../contexts/ContentContext'

const TheShow: React.FC = () => {
    const { content } = useContentContext()
    const show = content?.about?.show as any

    if (!show || !show.title) return null

    const hasImage = Boolean(show.image)
    const aspect = show.imageAspect || '4/3'

    return (
        <section id="the-show" className="the-show-section">
            <div className="container">
                {hasImage ? (
                    <div className="the-show-grid">
                        <div className="the-show-image reveal-left">
                            <div style={{ aspectRatio: aspect, overflow: 'hidden', borderRadius: '16px', width: '100%' }}>
                                <img
                                    src={show.image}
                                    alt={show.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            </div>
                        </div>
                        <div className="the-show-text reveal-right">
                            <h2 className="section-title">{show.title}</h2>
                            <div className="title-decoration"></div>
                            <p className="the-show-desc">{show.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className="about-show reveal-scale" style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
                        <h2 className="section-title" style={{ marginBottom: '1.5rem', color: '#fff' }}>{show.title}</h2>
                        <div className="title-decoration" style={{ margin: '0 auto 2rem' }}></div>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.9', color: 'var(--text-dim)' }}>
                            {show.description}
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}

export default TheShow
