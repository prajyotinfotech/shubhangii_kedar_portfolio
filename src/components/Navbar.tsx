import { useEffect, useRef, useState } from 'react'
import { useContentContext } from '../contexts/ContentContext'
import { visibleSectionIds, type SectionId } from '../data/sectionLayout'

// `section` ties a link to the admin-managed section layout; links whose
// section is hidden are dropped. Home has no section: the hero is always shown.
const links: { href: string; label: string; section?: SectionId }[] = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About', section: 'about' },
  { href: '#music', label: 'Music', section: 'music' },
  { href: '#songlist', label: 'Discography', section: 'songlist' },
  { href: '#events', label: 'Events', section: 'events' },
  { href: '#gallery', label: 'Gallery', section: 'gallery' },
  { href: '#contact', label: 'Contact', section: 'contact' },
]

export const Navbar: React.FC = () => {
  const { content } = useContentContext()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('#home')
  const navRef = useRef<HTMLDivElement | null>(null)

  const logoImage = content?.theme?.logoImage
  const logoSize = content?.theme?.logoSize || 48
  const logoPosition = content?.theme?.logoPosition ?? -20
  const visibleSections = visibleSectionIds(content?.sectionLayout)
  const visibleLinks = links.filter((link) => !link.section || visibleSections.has(link.section))

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80)

      const sections = document.querySelectorAll<HTMLElement>('section[id]')
      const scrollY = window.pageYOffset

      sections.forEach((section) => {
        const sectionHeight = section.offsetHeight
        const sectionTop = section.offsetTop - 120
        const sectionId = `#${section.getAttribute('id')}`
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          setActive(sectionId)
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on outside click (mobile)
  useEffect(() => {
    if (!menuOpen) return
    const onOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (navRef.current && !navRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [menuOpen])

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-container" ref={navRef}>
        {logoImage ? (
          <div className="logo logo-image" style={{ paddingLeft: `${logoPosition}px` }}>
            <a href="#home">
              <img
                src={logoImage}
                alt="Shubhangii Kedar"
                style={{ height: `${logoSize}px` }}
              />
            </a>
          </div>
        ) : (
          <div className="logo">Shubhangii Kedar</div>
        )}
        <ul className={`nav-menu${menuOpen ? ' active' : ''}`}>
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`nav-link${active === link.href ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className={`hamburger${menuOpen ? ' is-active' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {/* overlay for mobile close-on-click */}
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}

export default Navbar
