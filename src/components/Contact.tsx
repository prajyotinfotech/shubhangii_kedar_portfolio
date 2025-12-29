import { useContentContext } from '../contexts/ContentContext'
import { contactItems as staticContactItems, socialLinks as staticSocialLinks } from '../data/content'
import type { IconName } from '../data/content'
import Icon from './Icon'

export const Contact: React.FC = () => {
  const { content } = useContentContext()

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
            <form className="contact-form">
              <div className="form-group">
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Subject" />
              </div>
              <div className="form-group">
                <textarea placeholder="Your Message" rows={5} required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

