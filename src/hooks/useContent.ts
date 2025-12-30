/**
 * useContent Hook
 * React hook for fetching and managing content state
 */
import { useState, useEffect } from 'react';
import { fetchContent, fetchSection } from '../services/contentService';
import type { ContentData } from '../services/contentService';

interface UseContentResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch all content
 */
export function useContent(): UseContentResult<ContentData> {
    const [data, setData] = useState<ContentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadContent = async () => {
        setLoading(true);
        setError(null);
        try {
            const content = await fetchContent();
            setData(content);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContent();
    }, []);

    return { data, loading, error, refetch: loadContent };
}

/**
 * Hook to fetch a specific section
 */
export function useContentSection<K extends keyof ContentData>(
    section: K
): UseContentResult<ContentData[K]> {
    const [data, setData] = useState<ContentData[K] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSection = async () => {
        setLoading(true);
        setError(null);
        try {
            const content = await fetchSection(section);
            setData(content);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSection();
    }, [section]);

    return { data, loading, error, refetch: loadSection };
}
