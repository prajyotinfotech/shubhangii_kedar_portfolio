/**
 * Home page section registry.
 *
 * Single source of truth for which sections exist on the home page, the
 * default top-to-bottom order, and how a saved admin layout is merged with
 * that default. The hero is NOT in this list: it is always first and always
 * visible, so the admin cannot hide or move it.
 *
 * Some sections are made of independently hideable *parts* (About: bio,
 * footfall banner, achievements; Gallery: photos, videos). Parts cannot be
 * reordered, only shown or hidden, and a hidden section hides all its parts.
 *
 * The saved layout lives in content.json under `sectionLayout` as an ordered
 * array of `{ id, visible, parts?: [{ id, visible }] }`. Sections or parts
 * added to the code later (not present in a saved layout) are treated as
 * visible, so a stale layout never silently drops anything.
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

export type AboutPartId = 'bio' | 'footfall' | 'achievements';
export type GalleryPartId = 'photos' | 'videos';
export type SectionPartId = AboutPartId | GalleryPartId;

export interface SectionPartLayoutEntry {
    id: SectionPartId;
    visible: boolean;
}

export interface SectionLayoutEntry {
    id: SectionId;
    visible: boolean;
    /** Only present for sections that declare parts in the registry. */
    parts?: SectionPartLayoutEntry[];
}

export interface SectionPartMeta {
    id: SectionPartId;
    label: string;
    description: string;
}

export interface SectionMeta {
    id: SectionId;
    label: string;
    description: string;
    /** DOM id of the <section> element, used by navbar anchors. */
    anchor: string;
    /** Independently hideable parts, in page order. */
    parts?: SectionPartMeta[];
}

/** Default order matches the original hard-coded order in App.tsx. */
export const SECTION_REGISTRY: SectionMeta[] = [
    {
        id: 'about', label: 'About & Impact', description: 'Bio, footfall banner and achievements', anchor: 'about',
        parts: [
            { id: 'bio', label: 'About info', description: 'Portrait, title and the bio text' },
            { id: 'footfall', label: 'Footfall banner', description: '"Performed across N cities with X footfall"' },
            { id: 'achievements', label: 'Achievements', description: 'Achievement cards carousel' },
        ],
    },
    { id: 'brands', label: 'Brands', description: "Logo grid of brands we've worked with", anchor: 'brands' },
    { id: 'stats', label: 'Social Showcase', description: 'Follower counts and social links', anchor: 'stats' },
    { id: 'the-show', label: 'The Show', description: 'Live show description and image', anchor: 'the-show' },
    { id: 'music', label: 'Music Releases', description: 'Latest releases with streaming links', anchor: 'music' },
    { id: 'songlist', label: 'Song List', description: 'Discography list', anchor: 'songlist' },
    { id: 'performed-at', label: 'Performed At', description: 'Venues and cities performed at', anchor: 'performed-at' },
    { id: 'events', label: 'Upcoming Shows', description: 'Event dates and ticket links', anchor: 'events' },
    {
        id: 'gallery', label: 'Gallery', description: 'Photos and video embeds', anchor: 'gallery',
        parts: [
            { id: 'photos', label: 'Photos', description: 'Photo grid (carousel on phones)' },
            { id: 'videos', label: 'Videos', description: 'YouTube and Instagram embeds' },
        ],
    },
    { id: 'testimonials', label: 'Testimonials', description: 'Quotes and video testimonials', anchor: 'testimonials' },
    { id: 'contact', label: 'Contact & Booking', description: 'Booking form and contact details', anchor: 'contact' },
];

const KNOWN_IDS = new Set<string>(SECTION_REGISTRY.map(s => s.id));

export function isSectionId(value: unknown): value is SectionId {
    return typeof value === 'string' && KNOWN_IDS.has(value);
}

function defaultParts(meta: SectionMeta): SectionPartLayoutEntry[] | undefined {
    return meta.parts?.map(p => ({ id: p.id, visible: true }));
}

function entryFor(meta: SectionMeta, visible: boolean, savedParts: unknown): SectionLayoutEntry {
    const entry: SectionLayoutEntry = { id: meta.id, visible };
    if (meta.parts) entry.parts = resolveParts(meta, savedParts);
    return entry;
}

/** Merge saved part flags with the registry; unknown ids dropped, missing ids visible. */
function resolveParts(meta: SectionMeta, saved: unknown): SectionPartLayoutEntry[] {
    const savedVisible = new Map<string, boolean>();
    if (Array.isArray(saved)) {
        for (const p of saved) {
            if (!p || typeof p !== 'object') continue;
            const id = (p as { id?: unknown }).id;
            if (typeof id !== 'string') continue;
            savedVisible.set(id, (p as { visible?: unknown }).visible !== false);
        }
    }
    return (meta.parts ?? []).map(p => ({ id: p.id, visible: savedVisible.get(p.id) ?? true }));
}

export function defaultSectionLayout(): SectionLayoutEntry[] {
    return SECTION_REGISTRY.map(s => entryFor(s, true, defaultParts(s)));
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
            result.push(entryFor(sectionMeta(id), visible, (entry as { parts?: unknown }).parts));
            seen.add(id);
        }
    }

    for (const meta of SECTION_REGISTRY) {
        if (!seen.has(meta.id)) result.push(entryFor(meta, true, undefined));
    }

    return result;
}

/**
 * A section is shown on the page only when its own switch is on AND, if it
 * has parts, at least one part is on. A section whose parts are all hidden
 * would otherwise render as an empty heading with a dangling navbar link.
 */
export function isSectionShown(entry: SectionLayoutEntry): boolean {
    if (!entry.visible) return false;
    if (!entry.parts || entry.parts.length === 0) return true;
    return entry.parts.some(p => p.visible);
}

/** Set of shown section ids, for quick lookups (navbar, footer, App). */
export function visibleSectionIds(saved: unknown): Set<SectionId> {
    return new Set(resolveSectionLayout(saved).filter(isSectionShown).map(e => e.id));
}

/** Set of visible part ids for one section (empty if the section itself is hidden). */
export function visiblePartIds(saved: unknown, sectionId: SectionId): Set<SectionPartId> {
    const entry = resolveSectionLayout(saved).find(e => e.id === sectionId);
    if (!entry || !entry.visible) return new Set();
    return new Set((entry.parts ?? []).filter(p => p.visible).map(p => p.id));
}

export function sectionMeta(id: SectionId): SectionMeta {
    return SECTION_REGISTRY.find(s => s.id === id)!;
}
