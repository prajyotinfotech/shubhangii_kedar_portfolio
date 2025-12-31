/**
 * Content Context
 * Provides content data to all components in the app
 */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchContent, clearContentCache } from '../services/contentService';
import type { ContentData } from '../services/contentService';

// Import static content as fallback
import * as staticContent from '../data/content';

interface ContentContextType {
    content: ContentData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    isStatic: boolean; // true if using static fallback
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

/**
 * Convert static content to ContentData format
 */
function getStaticContent(): ContentData {
    return {
        hero: {
            slides: [
                {
                    id: 'static-hero',
                    image: '',
                    alt: 'Shubhangii Kedar',
                    heading: ['Shubhangii Kedar'],
                    subtitle: 'Singer | Performer | Playback Artist'
                }
            ],
            pills: []
        },
        about: {
            title: 'About Me',
            description: 'A soulful voice from Maharashtra...',
            descriptionSecondary: '',
            image: '',
            stats: [],
            show: {
                title: 'The Show',
                description: 'A personally designed musical experience.'
            },
            performanceBanner: {
                cities: '50+',
                footfall: '1M+'
            },
            metrics: [
                {
                    id: 'youtube-subs',
                    category: 'YouTube',
                    label: 'Subscribers',
                    value: 408000,
                    display: '408K+',
                    accent: '#FF0033',
                    icon: 'youtube'
                },
                {
                    id: 'spotify-streams',
                    category: 'Spotify',
                    label: 'Streams',
                    value: 65000000,
                    display: '65M+',
                    accent: '#1DB954',
                    icon: 'spotify'
                },
                {
                    id: 'instagram-followers',
                    category: 'Instagram',
                    label: 'Followers',
                    value: 120000,
                    display: '120K+',
                    accent: '#E1306C',
                    icon: 'instagram'
                }
            ],
            achievements: []
        },
        featureStats: staticContent.featureStats || [],
        musicReleases: (staticContent.musicReleases || []).map((r, i) => ({
            id: `music-${i}`,
            title: r.title,
            meta: r.meta,
            gradient: r.gradient,
            coverImage: '',
            links: r.links
        })),
        events: (staticContent.events || []).map((e, i) => ({
            id: `event-${i}`,
            day: e.day,
            month: e.month,
            year: '2024',
            title: e.title,
            venue: e.meta.split(' • ')[1] || '',
            city: e.meta.split(' • ')[0]?.split(', ')[0] || '',
            country: e.meta.split(' • ')[0]?.split(', ')[1] || '',
            ticketUrl: e.ticketUrl
        })),
        gallery: (staticContent.galleryItems || []).map((g, i) => ({
            id: `gallery-${i}`,
            title: g.title,
            description: g.description,
            image: '',
            gradient: g.gradient,
            aspect: (g.aspect as any) || 'square'
        })),
        testimonials: (staticContent.testimonials || []).map((t, i) => ({
            id: `testimonial-${i}`,
            quote: t.quote,
            author: t.author
        })),
        contact: {
            email: staticContent.contactItems?.find(c => c.icon === 'mail')?.value || '',
            phone: staticContent.contactItems?.find(c => c.icon === 'phone')?.value || '',
            location: staticContent.contactItems?.find(c => c.icon === 'location')?.value || ''
        },
        socialLinks: (staticContent.socialLinks || []).map((s, i) => ({
            id: `social-${i}`,
            label: s.label,
            href: s.href,
            icon: s.icon
        })),
        journeySteps: ((staticContent as any).journeySteps || []).map((s: any) => ({
            ...s,
            highlights: s.highlights || []
        })),
        journeyMilestones: (staticContent.journeyMilestones || []).map(m => ({
            ...m,
            image: typeof m.image === 'string' ? m.image : '',
            side: m.side as 'left' | 'right'
        }))
    };
}

export function ContentProvider({ children }: { children: ReactNode }) {
    const [content, setContent] = useState<ContentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStatic, setIsStatic] = useState(false);

    const loadContent = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchContent();
            setContent(data);
            setIsStatic(false);
        } catch (err) {
            console.warn('API unavailable, using static content');
            setContent(getStaticContent());
            setIsStatic(true);
            setError(null); // Don't show error to users when falling back
        } finally {
            setLoading(false);
        }
    };

    const refetch = () => {
        clearContentCache();
        loadContent();
    };

    useEffect(() => {
        loadContent();
    }, []);

    return (
        <ContentContext.Provider value={{ content, loading, error, refetch, isStatic }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContentContext() {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error('useContentContext must be used within a ContentProvider');
    }
    return context;
}
