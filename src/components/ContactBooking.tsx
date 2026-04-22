import { useState } from 'react'
import { useContentContext } from '../contexts/ContentContext'

const sanitize = (value: string, maxLen = 1000) =>
  value.replace(/<[^>]*>/g, '').trim().slice(0, maxLen)

const ContactBooking: React.FC = () => {
  const { content } = useContentContext()
  const web3formsKey =
    content?.bookingSettings?.web3formsKey ||
    import.meta.env.VITE_WEB3FORMS_KEY ||
    ''

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')

    const form = e.currentTarget
    const raw = new FormData(form)

    if (!web3formsKey) {
      setStatus('error')
      setErrorMsg('Booking form is not configured yet. Please email us directly.')
      return
    }

    const payload = new FormData()
    payload.append('access_key', web3formsKey)
    payload.append('subject', 'New booking inquiry — Shubhangii Kedar')
    payload.append('from_name', 'Shubhangii Kedar Portfolio')
    payload.append('fullName', sanitize(raw.get('fullName') as string || ''))
    payload.append('email',    sanitize(raw.get('email')    as string || '', 200))
    payload.append('phone',    sanitize(raw.get('phone')    as string || '', 50))
    payload.append('message',  sanitize(raw.get('message')  as string || ''))

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: payload,
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
        setErrorMsg(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Failed to send request. Please try again later.')
    }
  }

  return (
    <section id="contact" className="booking">
      <div className="container">
        <h2 className="section-title">Book Shubhangii Kedar</h2>
        <div className="title-decoration" />
        <p className="booking-intro">
          Let's create an unforgettable experience together. For concerts, festivals, corporate events or private performances, please contact our management team.
          Tell us about your event and we'll tailor a set that fits your audience.
        </p>

        {status === 'success' ? (
          <div className="booking-success">Thank you! We have received your request and will get back to you soon.</div>
        ) : (
          <form name="booking" onSubmit={handleSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" type="text" required placeholder="Your full name" maxLength={200} />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" required placeholder="you@example.com" maxLength={200} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="phone">Phone (optional)</label>
                <input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" maxLength={50} />
              </div>
              <div className="form-field full">
                <label htmlFor="message">Event Details / Message</label>
                <textarea id="message" name="message" required rows={5} placeholder="Event type, date, venue, audience size, budget, any other details" maxLength={1000} />
              </div>
            </div>

            {errorMsg && (
              <p style={{ color: '#ff4444', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{errorMsg}</p>
            )}

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Send Booking Request'}
              </button>
            </div>

            <p className="privacy-note">
              We respect your privacy. Your information will be used solely for event coordination and will not be shared with third parties.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}

export default ContactBooking
