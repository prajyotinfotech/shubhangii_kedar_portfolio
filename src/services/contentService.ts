/**
 * Content Service
 * Fetches content from backend API with fallback to static data
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
        gradient: [string, string];
        aspect: 'tall' | 'wide' | 'square';
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
}

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

    // DIRECT GIST FETCH (Zero Cost)
    // We use the "Raw" URL to fetch content directly from GitHub's CDN.
    // This bypasses the Vercel backend entirely for public visitors.
    const GIST_RAW_URL = import.meta.env.VITE_GIST_RAW_URL || 'https://gist.githubusercontent.com/prajyotinfotech/9edd7314a8b2f69a855037af01072b7e/raw/content.json';

    try {
        const response = await fetch(GIST_RAW_URL);

        if (!response.ok) {
            throw new Error(`Gist fetch error: ${response.status}`);
        }

        const data = await response.json();
        contentCache = data;
        cacheTimestamp = now;
        return data;
    } catch (error) {
        console.error('Failed to fetch content from API:', error);
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
