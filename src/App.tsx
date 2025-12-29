import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HangingMic from './components/HangingMic'
// import FeatureBar from './components/FeatureBar'
import About from './components/About'
import Music from './components/Music'
import Events from './components/Events'
import Playlist from './components/Playlist'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Newsletter from './components/Newsletter'
import ContactBooking from './components/ContactBooking'
import Footer from './components/Footer'
import MiniPlayer from './components/MiniPlayer'
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
  return (
    <AuthProvider>
      <SpotifyWebPlaybackProvider>
        <SpotifyProvider artistId={SPOTIFY_ARTIST_ID}>
          <div className="app">
            <Navbar />
            <HangingMic />
            <main>
              <Hero />
              {/* <FeatureBar /> */}
              <About />
              <Playlist />
              <Music />
              <Events />

              <Gallery />
              <Testimonials />
              <Newsletter />
              <ContactBooking />
            </main>
            <Footer />
            <MiniPlayer />
            <a href="/journey" className="follow-journey-button follow-fab" aria-label="Follow My Journey">
              Follow My Journey
            </a>
          </div>
        </SpotifyProvider>
      </SpotifyWebPlaybackProvider>
    </AuthProvider>
  )
}

export default App
