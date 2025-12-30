import React from 'react'
import { socialLinks as staticSocialLinks, type IconName } from '../data/content'
import Icon from './Icon'
import { useContentContext } from '../contexts/ContentContext'

export const Footer: React.FC = () => {
  const { content } = useContentContext()
  const socialLinks = content?.socialLinks || staticSocialLinks

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">Shubhangii Kedar</div>
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#events">Events</a>
            <a href="#playlist">Playlist</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-social">
            {socialLinks.map((social) => (
              <a
                href={social.href}
                key={social.label}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name={social.icon as IconName} className="footer-social-icon" />
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Shubhangii Kedar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
