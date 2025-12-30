import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import JourneyPage from './pages/JourneyPage'

import { ContentProvider } from './contexts/ContentContext'

import { AdminAuthProvider } from './admin/context/AdminAuthContext'

const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'))
const HeroEditor = lazy(() => import('./admin/pages/sections/HeroEditor'))
const AboutEditor = lazy(() => import('./admin/pages/sections/AboutEditor'))
const EventsManager = lazy(() => import('./admin/pages/sections/EventsManager'))
const GalleryManager = lazy(() => import('./admin/pages/sections/GalleryManager'))
const MusicManager = lazy(() => import('./admin/pages/sections/MusicManager'))
const TestimonialsManager = lazy(() => import('./admin/pages/sections/TestimonialsManager'))
const ContactEditor = lazy(() => import('./admin/pages/sections/ContactEditor'))
const SocialLinksEditor = lazy(() => import('./admin/pages/sections/SocialLinksEditor'))
const JourneyManager = lazy(() => import('./admin/pages/sections/JourneyManager'))

const AdminLoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#121212',
    color: '#fff',
    fontSize: '18px'
  }}>
    Loading Admin Panel...
  </div>
)

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

            {/* Admin Routes - Lazy Loaded */}
            <Route path="/admin" element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminLogin />
              </Suspense>
            } />
            <Route element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminLayout />
              </Suspense>
            }>
              <Route path="/admin/dashboard" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="/admin/hero" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <HeroEditor />
                </Suspense>
              } />
              <Route path="/admin/about" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AboutEditor />
                </Suspense>
              } />
              <Route path="/admin/events" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <EventsManager />
                </Suspense>
              } />
              <Route path="/admin/gallery" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <GalleryManager />
                </Suspense>
              } />
              <Route path="/admin/music" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <MusicManager />
                </Suspense>
              } />
              <Route path="/admin/testimonials" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <TestimonialsManager />
                </Suspense>
              } />
              <Route path="/admin/contact" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ContactEditor />
                </Suspense>
              } />
              <Route path="/admin/social" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <SocialLinksEditor />
                </Suspense>
              } />
              <Route path="/admin/journey" element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <JourneyManager />
                </Suspense>
              } />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </ContentProvider>
    </Router>
  </StrictMode>,
)

