import { useState } from 'react'
import { useContentContext } from '../contexts/ContentContext'
import { contactItems as staticContactItems, socialLinks as staticSocialLinks } from '../data/content'
import type { IconName } from '../data/content'
import Icon from './Icon'

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || ''

export const Contact: React.FC = () => {
  const { content } = useContentContext()
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  // Transform API contact content to match expected format
  const contactItems = content?.contact ? [
    { icon: 'mail' as IconName, label: 'Email', value: content.contact.email },
    { icon: 'phone' as IconName, label: 'Phone', value: content.contact.phone },
    { icon: 'location' as IconName, label: 'Location', value: content.contact.location }
  ].filter(item => item.value) : staticContactItems

  const socialLinks = content?.socialLinks?.map(link => ({
    ...link,
    icon: link.icon as IconName
  })) || staticSocialLinks

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    if (!WEB3FORMS_ACCESS_KEY) {
      setStatus('error')
      setStatusMsg('Contact form is not configured yet. Please email directly.')
      return
    }

    formData.append('access_key', WEB3FORMS_ACCESS_KEY)

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setStatusMsg('Message sent successfully! We\'ll get back to you soon.')
        form.reset()
      } else {
        setStatus('error')
        setStatusMsg(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setStatusMsg('Failed to send message. Please try again later.')
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-content">
          <div className="contact-info reveal-left">
            <h2 className="section-title">Let's Connect</h2>
            <div className="title-decoration"></div>
            <p className="contact-text">
              Interested in booking me for your event or collaboration? I'd love to hear from you.
              Let's create something beautiful together.
            </p>
            <div className="contact-details">
              {contactItems.map((item) => (
                <div className="contact-item" key={item.label}>
                  <div className="contact-icon" aria-hidden="true">
                    <Icon name={item.icon} className="contact-icon-svg" />
                  </div>
                  <div>
                    <h4>{item.label}</h4>
                    <p>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="social-links">
              {socialLinks.map((link) => (
                <a
                  className="social-link"
                  href={link.href}
                  key={link.label}
                  aria-label={link.label}
                >
                  <Icon name={link.icon} className="social-icon" />
                  <span className="sr-only">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="contact-form-wrapper reveal-right">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" name="name" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <input type="email" name="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <input type="text" name="subject" placeholder="Subject" />
              </div>
              <div className="form-group">
                <textarea name="message" placeholder="Your Message" rows={5} required></textarea>
              </div>
              {statusMsg && (
                <p style={{
                  color: status === 'success' ? '#00ff99' : status === 'error' ? '#ff4444' : '#fff',
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem'
                }}>
                  {statusMsg}
                </p>
              )}
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
