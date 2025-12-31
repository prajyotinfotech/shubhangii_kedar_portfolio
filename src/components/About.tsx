import React from 'react'
import portraitImg from '../assets/6.png'
import { useContentContext } from '../contexts/ContentContext'

export const About: React.FC = () => {
  const { content, loading } = useContentContext()
  const about = content?.about

  if (loading) return <div className="about-loading-placeholder" style={{ minHeight: '400px' }}></div>
  if (!about) return null

  return (
    <section id="about" className="about">
      <div className="container">
        {/* Hero split: image + intro */}
        <div className="about-grid">
          <div className="about-image reveal-left">
            <div className="image-wrapper">
              <div className="image-placeholder">
                <img src={about.image || portraitImg} alt={about.title || 'Shubhangii Kedar'} />
              </div>
              <div className="image-decoration"></div>
            </div>
          </div>
          <div className="about-content reveal-right">
            <h2 className="section-title">{about.title || 'About'}</h2>
            <div className="title-decoration"></div>
            <div
              className="about-text"
              dangerouslySetInnerHTML={{ __html: about.description }}
            />
            {about.descriptionSecondary && (
              <div
                className="about-text"
                dangerouslySetInnerHTML={{ __html: about.descriptionSecondary }}
              />
            )}
          </div>
        </div>

        {/* Performance banner */}
        {about.performanceBanner?.cities && (
          <div className="about-banner reveal-scale">
            <p>
              <strong>PERFORMED ACROSS <span className="accent">{about.performanceBanner.cities}</span> WITH</strong>
              <br />
              <strong className="accent">{about.performanceBanner.footfall}</strong>
            </p>
          </div>
        )}



        {/* Achievements */}
        {about.achievements && about.achievements.length > 0 && (
          <div className="about-achievements reveal-scale" style={{ marginTop: '4rem' }}>
            <h3 className="about-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>Achievements</h3>
            <div className="achievements-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {about.achievements.map((achievement: string, idx: number) => (
                <div key={idx} className="achievement-card" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{ fontSize: '1.5rem', color: '#ff0033' }}>🏆</span>
                  <span style={{ fontSize: '1.1rem', color: '#e0e0e0', fontWeight: 500 }}>{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default About
