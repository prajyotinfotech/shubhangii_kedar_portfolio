import { useEffect } from 'react'
import JourneyTimeline from '../components/Journey/JourneyTimeline'
import { useContentContext } from '../contexts/ContentContext'

export default function JourneyPage() {
    const { content } = useContentContext()

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

    return <JourneyTimeline />
}
