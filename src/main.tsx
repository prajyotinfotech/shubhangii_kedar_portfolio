import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import JourneyPage from './pages/JourneyPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/callback" element={<App />} />
        <Route path="/journey" element={<JourneyPage />} />
      </Routes>
    </Router>
  </StrictMode>,
)
