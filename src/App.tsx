import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HangingMic from './components/HangingMic'
import About from './components/About'
import StatsShowcase from './components/StatsShowcase'
import TheShow from './components/TheShow'
import Music from './components/Music'
import Events from './components/Events'
import Playlist from './components/Playlist'
import Gallery from './components/Gallery'
// import Testimonials from './components/Testimonials'
// import Newsletter from './components/Newsletter'
import ContactBooking from './components/ContactBooking'
import Footer from './components/Footer'
import MiniPlayer from './components/MiniPlayer'
import ErrorBoundary from './components/ErrorBoundary'
import { useScrollReveal } from './hooks/useScrollReveal'
import { useScrollToExpandPlayer } from './hooks/useScrollToExpandPlayer'
import { SpotifyProvider } from './contexts/SpotifyContext'
import { SPOTIFY_ARTIST_ID } from './config/spotify'
import { AuthProvider } from './contexts/AuthContext'
import { SpotifyWebPlaybackProvider } from './contexts/SpotifyWebPlaybackContext'

import { useContentContext } from './contexts/ContentContext'

function App() {
  const { content } = useContentContext()
  useScrollReveal([content])
  useScrollToExpandPlayer()

  const [showJourney, setShowJourney] = useState(false)

  useEffect(() => {
    if (content?.theme?.primaryColor) {
      const root = document.documentElement
      const color = content.theme.primaryColor
      root.style.setProperty('--primary-color', color)
      root.style.setProperty('--secondary-color', color)
      root.style.setProperty('--accent-color', color)
      root.style.setProperty('--spotify-green', color)

      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null
      }

      const rgb = hexToRgb(color)
      if (rgb) {
        root.style.setProperty('--ring', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`)
        root.style.setProperty('--ring-strong', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`)
      }
    }
  }, [content?.theme?.primaryColor])

  useEffect(() => {
    const handleScroll = () => {
      setShowJourney(window.scrollY > window.innerHeight * 0.8)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SpotifyWebPlaybackProvider>
          <SpotifyProvider artistId={SPOTIFY_ARTIST_ID}>
            <div className="app">
              <Navbar />
              <HangingMic />
              <main>
                <Hero />
                <About />
                <StatsShowcase />
                <TheShow />
                <Playlist />
                <Music />
                <Events />
                <Gallery />
                {/* <Testimonials />
                <Newsletter /> */}
                <ContactBooking />
              </main>
              <Footer />
              <MiniPlayer style={{
                opacity: showJourney ? 1 : 0,
                pointerEvents: showJourney ? 'auto' : 'none',
                transform: showJourney ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
                transition: 'all 0.3s ease'
              }}
              />
              <a
                href="/journey"
                className="follow-journey-button follow-fab"
                aria-label="Follow My Journey"
                style={{
                  opacity: showJourney ? 1 : 0,
                  pointerEvents: showJourney ? 'auto' : 'none',
                  transform: showJourney ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.3s ease'
                }}
              >
                Follow My Journey
              </a>
            </div>
          </SpotifyProvider>
        </SpotifyWebPlaybackProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
