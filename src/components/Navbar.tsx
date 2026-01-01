import { useEffect, useRef, useState } from 'react'
import { useContentContext } from '../contexts/ContentContext'

const links = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#playlist', label: 'Playlist' },
  { href: '#music', label: 'Music' },
  { href: '#events', label: 'Events' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
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
          {links.map((link) => (
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
