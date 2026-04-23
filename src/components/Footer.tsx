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
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#music">Music</a>
            <a href="#songlist">Discography</a>
            <a href="#events">Events</a>
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
      <div className="footer-dev-credit" data-tooltip="Raviraj Gardi">
        <span>Developed by</span>
        <a href="https://www.instagram.com/raviraj_gardi/" target="_blank" rel="noopener noreferrer" aria-label="Developer Instagram">
          <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 2H6.5C4.015 2 2 4.015 2 6.5v7c0 2.485 2.015 4.5 4.5 4.5h7c2.485 0 4.5-2.015 4.5-4.5v-7C18 4.015 15.985 2 13.5 2Zm3 11.5c0 1.654-1.346 3-3 3h-7c-1.654 0-3-1.346-3-3v-7c0-1.654 1.346-3 3-3h7c1.654 0 3 1.346 3 3v7Z" />
            <path d="M10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0 5.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
            <circle cx="14" cy="6" r="1" />
          </svg>
        </a>
        <a href="https://www.linkedin.com/in/raviraj-gardi/" target="_blank" rel="noopener noreferrer" aria-label="Developer LinkedIn">
          <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.389 0-1.601 1.086-1.601 2.207v4.248H8.014V7.867h2.561v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.597ZM5.005 6.575a1.548 1.548 0 1 1 0-3.096 1.548 1.548 0 0 1 0 3.096Zm1.337 9.763H3.667V7.867h2.675v8.471ZM17.668 2H2.328C1.595 2 1 2.581 1 3.298v13.403C1 17.418 1.595 18 2.328 18h15.34C18.406 18 19 17.418 19 16.701V3.298C19 2.581 18.406 2 17.668 2Z" />
          </svg>
        </a>
      </div>
    </footer>
  )
}

export default Footer
