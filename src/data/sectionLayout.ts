/**
 * Home page section registry.
 *
 * Single source of truth for which sections exist on the home page, the
 * default top-to-bottom order, and how a saved admin layout is merged with
 * that default. The hero is NOT in this list: it is always first and always
 * visible, so the admin cannot hide or move it.
 *
 * The saved layout lives in content.json under `sectionLayout` as an ordered
 * array of `{ id, visible }`. Sections added to the code later (not present in
 * a saved layout) are appended at the end as visible, so a stale layout never
 * silently drops a section.
 */

export type SectionId =
    | 'about'
    | 'brands'
    | 'stats'
    | 'the-show'
    | 'music'
    | 'songlist'
    | 'performed-at'
    | 'events'
    | 'gallery'
    | 'testimonials'
    | 'contact';

export interface SectionLayoutEntry {
    id: SectionId;
    visible: boolean;
}

export interface SectionMeta {
    id: SectionId;
    label: string;
    description: string;
    /** DOM id of the <section> element, used by navbar anchors. */
    anchor: string;
}

/** Default order matches the original hard-coded order in App.tsx. */
export const SECTION_REGISTRY: SectionMeta[] = [
    { id: 'about', label: 'About & Impact', description: 'Bio, stats, metrics and achievements', anchor: 'about' },
    { id: 'brands', label: 'Brands', description: "Logo grid of brands we've worked with", anchor: 'brands' },
    { id: 'stats', label: 'Social Showcase', description: 'Follower counts and social links', anchor: 'stats' },
    { id: 'the-show', label: 'The Show', description: 'Live show description and image', anchor: 'the-show' },
    { id: 'music', label: 'Music Releases', description: 'Latest releases with streaming links', anchor: 'music' },
    { id: 'songlist', label: 'Song List', description: 'Discography list', anchor: 'songlist' },
    { id: 'performed-at', label: 'Performed At', description: 'Venues and cities performed at', anchor: 'performed-at' },
    { id: 'events', label: 'Upcoming Shows', description: 'Event dates and ticket links', anchor: 'events' },
    { id: 'gallery', label: 'Gallery', description: 'Photos and video embeds', anchor: 'gallery' },
    { id: 'testimonials', label: 'Testimonials', description: 'Quotes and video testimonials', anchor: 'testimonials' },
    { id: 'contact', label: 'Contact & Booking', description: 'Booking form and contact details', anchor: 'contact' },
];

const KNOWN_IDS = new Set<string>(SECTION_REGISTRY.map(s => s.id));

export function isSectionId(value: unknown): value is SectionId {
    return typeof value === 'string' && KNOWN_IDS.has(value);
}

export function defaultSectionLayout(): SectionLayoutEntry[] {
    return SECTION_REGISTRY.map(s => ({ id: s.id, visible: true }));
}

/**
 * Merge a saved layout (possibly missing, partial, or containing ids that no
 * longer exist) with the registry. Pure; never throws on bad input.
 */
export function resolveSectionLayout(saved: unknown): SectionLayoutEntry[] {
    const result: SectionLayoutEntry[] = [];
    const seen = new Set<SectionId>();

    if (Array.isArray(saved)) {
        for (const entry of saved) {
            const id = entry && typeof entry === 'object' ? (entry as { id?: unknown }).id : undefined;
            if (!isSectionId(id) || seen.has(id)) continue;
            const visible = (entry as { visible?: unknown }).visible !== false;
            result.push({ id, visible });
            seen.add(id);
        }
    }

    for (const meta of SECTION_REGISTRY) {
        if (!seen.has(meta.id)) result.push({ id: meta.id, visible: true });
    }

    return result;
}

/** Set of visible section ids, for quick lookups (navbar, etc.). */
export function visibleSectionIds(saved: unknown): Set<SectionId> {
    return new Set(resolveSectionLayout(saved).filter(e => e.visible).map(e => e.id));
}

export function sectionMeta(id: SectionId): SectionMeta {
    return SECTION_REGISTRY.find(s => s.id === id)!;
}
