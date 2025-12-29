import React from 'react'
import portraitImg from '../assets/6.png'
import { CountUp } from './CountUp'
import instagramIcon from '../assets/icons/instagram.svg'
import facebookIcon from '../assets/icons/facebook.svg'
import youtubeIcon from '../assets/icons/youtube.svg'
import spotifyIcon from '../assets/icons/spotify.svg'
import { useContentContext } from '../contexts/ContentContext'

const ICON_MAP: Record<string, string> = {
  instagram: instagramIcon,
  facebook: facebookIcon,
  youtube: youtubeIcon,
  spotify: spotifyIcon,
}

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
            <p className="about-text">
              {about.description}
            </p>
            {about.descriptionSecondary && (
              <p className="about-text">
                {about.descriptionSecondary}
              </p>
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

        {/* The Show description */}
        {about.show?.title && (
          <div className="about-show reveal-scale">
            <h3 className="about-subtitle">{about.show.title}</h3>
            <p>{about.show.description}</p>
          </div>
        )}

        {/* Social presence metrics */}
        <div className="about-metrics reveal-scale">
          {about.metrics?.map((metric: any) => (
            <div className="about-metric-card" key={metric.id}>
              <div className="about-metric-icon" style={{ backgroundColor: `${metric.accent}22` }}>
                <img src={ICON_MAP[metric.icon] || metric.icon} alt="" />
              </div>
              <div className="about-metric-body">
                <span className="about-metric-category">{metric.category}</span>
                <CountUp
                  value={metric.value || 0}
                  className="about-metric-value"
                  formatter={() => metric.display || metric.value?.toString() || '0'}
                />
                <span className="about-metric-label">{metric.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        {about.achievements && about.achievements.length > 0 && (
          <div className="about-achievements reveal-scale">
            <h3 className="about-subtitle">Achievements</h3>
            <ul className="about-list">
              {about.achievements.map((achievement: string, idx: number) => (
                <li key={idx}><strong>{achievement}</strong></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default About
