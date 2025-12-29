import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import JourneyPage from './pages/JourneyPage'

// Content provider for dynamic content
import { ContentProvider } from './contexts/ContentContext'

// Admin imports
import { AdminAuthProvider } from './admin/context/AdminAuthContext'
import AdminLogin from './admin/pages/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import HeroEditor from './admin/pages/sections/HeroEditor'
import AboutEditor from './admin/pages/sections/AboutEditor'
import EventsManager from './admin/pages/sections/EventsManager'
import GalleryManager from './admin/pages/sections/GalleryManager'
import MusicManager from './admin/pages/sections/MusicManager'
import TestimonialsManager from './admin/pages/sections/TestimonialsManager'
import ContactEditor from './admin/pages/sections/ContactEditor'
import SocialLinksEditor from './admin/pages/sections/SocialLinksEditor'
import JourneyManager from './admin/pages/sections/JourneyManager'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <ContentProvider>
        <AdminAuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<App />} />
            <Route path="/callback" element={<App />} />
            <Route path="/journey" element={<JourneyPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/hero" element={<HeroEditor />} />
              <Route path="/admin/about" element={<AboutEditor />} />
              <Route path="/admin/events" element={<EventsManager />} />
              <Route path="/admin/gallery" element={<GalleryManager />} />
              <Route path="/admin/music" element={<MusicManager />} />
              <Route path="/admin/testimonials" element={<TestimonialsManager />} />
              <Route path="/admin/contact" element={<ContactEditor />} />
              <Route path="/admin/social" element={<SocialLinksEditor />} />
              <Route path="/admin/journey" element={<JourneyManager />} />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </ContentProvider>
    </Router>
  </StrictMode>,
)

