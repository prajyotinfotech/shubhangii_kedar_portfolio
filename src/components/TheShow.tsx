import React from 'react'
import { useContentContext } from '../contexts/ContentContext'

const TheShow: React.FC = () => {
    const { content } = useContentContext()
    const show = content?.about?.show

    if (!show || !show.title) return null

    return (
        <section id="the-show" className="the-show-section" style={{ padding: '80px 0', background: 'var(--dark-200)' }}>
            <div className="container">
                <div className="about-show reveal-scale" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <h2 className="section-title" style={{ marginBottom: '1.5rem', color: '#fff' }}>{show.title}</h2>
                    <div className="title-decoration" style={{ margin: '0 auto 2rem' }}></div>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-dim)' }}>
                        {show.description}
                    </p>
                </div>
            </div>
        </section>
    )
}

export default TheShow
