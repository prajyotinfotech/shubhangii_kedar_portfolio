/**
 * Content Context
 * Provides content data to all components in the app
 */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchContent, clearContentCache } from '../services/contentService';
import type { ContentData } from '../services/contentService';

interface ContentContextType {
    content: ContentData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    isStatic: boolean; // true if using static fallback
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

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
            console.error('Content fetch failed:', err);
            // "if it is not able to fetch from gist file it should show a decent massage"
            // "it should not be rely on any local harcoded content file"
            setError(err instanceof Error ? err.message : 'An error occurred while loading content.');
            setIsStatic(false);
            // Do NOT fall back to static content.
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
