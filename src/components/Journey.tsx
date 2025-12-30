import { useEffect, useMemo, useState } from 'react'
import { useContentContext } from '../contexts/ContentContext'

type JourneyStep = {
  id: string
  label: string
  heading: string
  subheading: string
  body: string
  highlights: string[]
}

const STATIC_STEPS: JourneyStep[] = [
  {
    id: 'roots',
    label: 'Chapter 01',
    heading: 'Namaskar, I’m Shubhangii Kedar',
    subheading: 'A voice rooted in Maharashtra, resonating around the world',
    body:
      'My journey began in the small towns of Maharashtra, where devotional songs and folk melodies filled the air. Singing started as something I did for family and friends, but my dream was always bigger: to share our stories and sounds with the world.',
    highlights: [] as string[],
  },
  {
    id: 'mission',
    label: 'Chapter 02',
    heading: 'Marathi Worldwide Mission',
    subheading: 'Join our journey to take Marathi music across oceans',
    body:
      'Today, I’m humbled to see that dream becoming reality. Our community has grown from a handful of listeners to a family that spans continents.',
    highlights: [
      '540M+ total views across YouTube',
      '65M+ Spotify streams with 750K monthly listeners',
      '480K+ Instagram followers • 487K+ on Facebook',
      '408K subscribers in our YouTube family',
    ],
  },
  {
    id: 'stories',
    label: 'Chapter 03',
    heading: 'Experience the Story behind every Song',
    subheading: 'From devotional abhangs to contemporary originals, each melody holds a story',
    body:
      'Hits like “Govyachya Kinaryav” and “Ishkkachi Nauka” have together crossed more than 43 million streams. Along the way I’ve released over 50 original songs and collaborated with films in Marathi, Kannada, and Hindi.',
    highlights: [
      'Mirchi Music Award for Upcoming Playback Singer',
      'One of the most-viewed songs in the Marathi language',
      '43M+ streams from audience favourites “Govyachya Kinaryav” & “Ishkkachi Nauka”',
    ],
  },
  {
    id: 'future',
    label: 'Chapter 04',
    heading: 'Welcome to my world',
    subheading: 'Let’s write the next chapter together',
    body:
      'Through every performance I remain devoted to preserving the soul of Marathi music while embracing modern influences. Thank you for being here—together, we carry this sound to every stage and every soul.',
    highlights: ['50+ original releases, countless stages, and a future we create together'],
  },
]

export const Journey: React.FC = () => {
  const { content } = useContentContext()
  const journeySteps = content?.journeySteps?.length ? content.journeySteps : STATIC_STEPS
  const [activeStepId, setActiveStepId] = useState(journeySteps[0]?.id ?? '')

  const activeStep = useMemo(
    () => journeySteps.find((step) => step.id === activeStepId) ?? journeySteps[0],
    [activeStepId],
  )

  useEffect(() => {
    const stepElements = Array.from(document.querySelectorAll<HTMLElement>('.journey-step'))
    if (!stepElements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepId = entry.target.getAttribute('data-step-id')
            if (stepId) {
              setActiveStepId(stepId)
            }
          }
        })
      },
      {
        root: null,
        threshold: 0.45,
        rootMargin: '-30% 0px -30% 0px',
      },
    )

    stepElements.forEach((el) => observer.observe(el))

    return () => {
      stepElements.forEach((el) => observer.unobserve(el))
      observer.disconnect()
    }
  }, [])

  return (
    <section id="journey" className="journey">
      <div className="container journey-layout">
        <aside className="journey-sticky">
          <span className="journey-tag">Singer’s Journey</span>
          <h2 className="journey-heading">{activeStep.heading}</h2>
          <p className="journey-subheading">{activeStep.subheading}</p>
          <div className="journey-progress" role="presentation">
            {journeySteps.map((step) => (
              <span
                key={step.id}
                className={`journey-progress-dot${step.id === activeStep.id ? ' is-active' : ''}`}
              >
                <span className="sr-only">{step.label}</span>
              </span>
            ))}
          </div>
        </aside>
        <div className="journey-timeline">
          <div className="journey-track" aria-hidden="true" />
          {journeySteps.map((step, index) => (
            <article
              key={step.id}
              className={`journey-step${step.id === activeStep.id ? ' is-active' : ''}`}
              data-step-id={step.id}
            >
              <header className="journey-step-header">
                <span className="journey-step-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="journey-step-label">{step.label}</span>
              </header>
              <div className="journey-step-body">
                {/* <h3>{step.heading}</h3> */}
                <p className="journey-step-subtitle">{step.subheading}</p>
                <p className="journey-step-text">{step.body}</p>
                {step.highlights.length > 0 && (
                  <ul className="journey-step-highlights">
                    {step.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Journey
