/**
 * Content Service
 * Fetches content from backend API with fallback to static data
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

export interface ContentData {
    hero: {
        slides: {
            id: string;
            image: string;
            alt: string;
            heading: string[];
            subtitle: string;
            actions?: { label: string; href: string; variant?: string }[];
            mobileImage?: string;
        }[];
        pills: {
            kind: 'youtube' | 'tracks' | 'instagram';
            top?: string;
            sub?: string;
            value: number;
            color: string;
            delta?: string;
        }[];
    };
    about: {
        title: string;
        description: string;
        descriptionSecondary: string;
        image: string;
        stats: { label: string; value: number }[];
        show: {
            title: string;
            description: string;
        };
        metrics: {
            id: string;
            category: string;
            label: string;
            value: number;
            display: string;
            accent: string;
            icon: string;
        }[];
        achievements: string[];
        performanceBanner: {
            cities: string;
            footfall: string;
        };
    };
    featureStats: { label: string; value: number }[];
    musicReleases: {
        id: string;
        title: string;
        meta: string;
        gradient: [string, string];
        coverImage: string;
        links: { label: string; href: string }[];
    }[];
    events: {
        id: string;
        day: string;
        month: string;
        year: string;
        title: string;
        venue: string;
        city: string;
        country: string;
        ticketUrl: string;
    }[];
    gallery: {
        id: string;
        title: string;
        description: string;
        image: string;
        videoUrl?: string;
        embedCode?: string;
        platform?: 'instagram' | 'youtube';
        gradient: [string, string];
        aspect: 'tall' | 'wide' | 'square';
        type?: 'image' | 'video';
    }[];
    testimonials: {
        id: string;
        quote: string;
        author: string;
    }[];
    contact: {
        email: string;
        phone: string;
        location: string;
    };
    socialLinks: {
        id: string;
        label: string;
        href: string;
        icon: string;
    }[];
    journeySteps: {
        id: string;
        label: string;
        heading: string;
        subheading: string;
        body: string;
        highlights: string[];
    }[];
    journeyMilestones: {
        id: number;
        title: string;
        description: string;
        year: string;
        side: 'left' | 'right';
        color: string;
        image: string;
    }[];
    theme?: {
        logoImage?: string;
        logoSize?: number;
        logoPosition?: number;
        primaryColor?: string;
        fonts?: {
            heading?: { family: string; size?: string; weight?: number; style?: string };
            body?: { family: string; size?: string; weight?: number; style?: string };
            availableFonts?: string[];
        };
        colors?: {
            primary: string;
            secondary: string;
            accent: string;
            dark: string;
            light: string;
        };
    };
}

// Professional Color Presets
export const COLOR_PRESETS = [
    {
        id: 'vibrant-gradient',
        name: 'Vibrant Gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        isGradient: true,
        category: 'gradient',
        preview: ['#667eea', '#764ba2']
    },
    {
        id: 'sunset-gradient',
        name: 'Sunset Gradient',
        value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        isGradient: true,
        category: 'gradient',
        preview: ['#f093fb', '#f5576c']
    },
    {
        id: 'ocean-gradient',
        name: 'Ocean Gradient',
        value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        isGradient: true,
        category: 'gradient',
        preview: ['#4facfe', '#00f2fe']
    },
    {
        id: 'soft-pink',
        name: 'Soft Pink',
        value: '#ffc1cc',
        isGradient: false,
        category: 'pastel',
        preview: ['#ffc1cc']
    },
    {
        id: 'mint-pastel',
        name: 'Mint Green',
        value: '#b5ead7',
        isGradient: false,
        category: 'pastel',
        preview: ['#b5ead7']
    },
    {
        id: 'lavender-pastel',
        name: 'Lavender',
        value: '#c7ceea',
        isGradient: false,
        category: 'pastel',
        preview: ['#c7ceea']
    },
    {
        id: 'cyber-neon',
        name: 'Cyber Neon',
        value: '#00ff88',
        isGradient: false,
        category: 'neon',
        preview: ['#00ff88']
    },
    {
        id: 'electric-neon',
        name: 'Electric Magenta',
        value: '#ff00ff',
        isGradient: false,
        category: 'neon',
        preview: ['#ff00ff']
    },
    {
        id: 'corporate-blue',
        name: 'Corporate Blue',
        value: '#2563eb',
        isGradient: false,
        category: 'professional',
        preview: ['#2563eb']
    },
    {
        id: 'elegant-purple',
        name: 'Elegant Purple',
        value: '#7c3aed',
        isGradient: false,
        category: 'professional',
        preview: ['#7c3aed']
    }
] as const;


// Cache for content
let contentCache: ContentData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Fetch all content from API
 * Uses cache to avoid repeated requests
 */
export async function fetchContent(): Promise<ContentData> {
    // Return cached content if still valid
    const now = Date.now();
    if (contentCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return contentCache;
    }

    // HYBRID STRATEGY:
    // PROD: Fetch from Gist (Serverless/Static behavior)
    // DEV: Fetch from Local API (Instant updates from Admin Panel)
    const useGist = import.meta.env.PROD || import.meta.env.VITE_USE_GIST === 'true';
    const GIST_RAW_URL = import.meta.env.VITE_GIST_RAW_URL || 'https://gist.githubusercontent.com/prajyotinfotech/9edd7314a8b2f69a855037af01072b7e/raw/content.json';

    if (useGist) {
        try {
            const response = await fetch(GIST_RAW_URL);
            if (!response.ok) throw new Error(`Gist fetch error: ${response.status}`);
            const data = await response.json();
            contentCache = data;
            cacheTimestamp = now;
            return data;
        } catch (error) {
            console.warn('Gist fetch failed, attempting fallback to API:', error);
        }
    }

    // Fallback or Dev Mode: Use Local API
    const contentUrl = `${API_URL}/api/content`;

    try {
        const response = await fetch(contentUrl);

        if (!response.ok) {
            throw new Error(`API fetch error: ${response.status}`);
        }

        const data = await response.json();
        contentCache = data;
        cacheTimestamp = now;
        return data;
    } catch (error) {
        console.error('Failed to fetch content:', error);
        // Return cached content if available, even if expired
        if (contentCache) {
            console.log('Using stale cache');
            return contentCache;
        }
        throw error;
    }
}

/**
 * Fetch a specific section
 */
export async function fetchSection<K extends keyof ContentData>(
    section: K
): Promise<ContentData[K]> {
    const content = await fetchContent();
    return content[section];
}

/**
 * Clear the content cache
 * Call this after admin updates content
 */
export function clearContentCache(): void {
    contentCache = null;
    cacheTimestamp = 0;
}

/**
 * Get API base URL
 */
export function getApiUrl(): string {
    return API_URL;
}
