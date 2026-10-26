/**
 * Page Sections Manager
 * Lets the admin show/hide each home-page section and reorder them by
 * holding the handle and dragging vertically. Hero is pinned at the top.
 * Sections with parts (About, Gallery) show a sub-tree of switches so each
 * part can be hidden on its own; a hidden section hides all its parts.
 */
import React, { useEffect, useRef, useState } from 'react';
import { fetchSection, updateSection } from '../../api/client';
import {
    defaultSectionLayout,
    isSectionShown,
    resolveSectionLayout,
    sectionMeta,
    type SectionLayoutEntry,
    type SectionPartId,
} from '../../../data/sectionLayout';
import '../styles/editor.css';
import './SectionsManager.css';

const DRAG_THRESHOLD_PX = 4;

interface DragState {
    pointerId: number;
    fromIndex: number;
    overIndex: number;
    startY: number;
    offsetY: number;
    rowHeight: number;
    active: boolean; // becomes true after the pointer moves past the threshold
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
    if (from === to) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

export default function SectionsManager() {
    const [layout, setLayout] = useState<SectionLayoutEntry[]>(defaultSectionLayout());
    const [savedLayout, setSavedLayout] = useState<SectionLayoutEntry[]>(defaultSectionLayout());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [drag, setDrag] = useState<DragState | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchSection('sectionLayout');
                const resolved = resolveSectionLayout(data);
                setLayout(resolved);
                setSavedLayout(resolved);
            } catch {
                // 404 = never saved yet; the default order applies.
                const resolved = defaultSectionLayout();
                setLayout(resolved);
                setSavedLayout(resolved);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const dirty = JSON.stringify(layout) !== JSON.stringify(savedLayout);
    const hiddenCount = layout.filter(e => !e.visible).length;
    // Parts switched off inside sections that are themselves still shown.
    const hiddenPartCount = layout
        .filter(e => e.visible)
        .reduce((n, e) => n + (e.parts ?? []).filter(p => !p.visible).length, 0);
    // Shown sections whose parts are all off: they will not appear on the page.
    const emptySections = layout.filter(e => e.visible && !isSectionShown(e)).map(e => sectionMeta(e.id).label);

    const toggleVisible = (index: number) => {
        setLayout(prev => prev.map((entry, i) => (i === index ? { ...entry, visible: !entry.visible } : entry)));
    };

    const togglePart = (index: number, partId: SectionPartId) => {
        setLayout(prev => prev.map((entry, i) => {
            if (i !== index || !entry.parts) return entry;
            return { ...entry, parts: entry.parts.map(p => (p.id === partId ? { ...p, visible: !p.visible } : p)) };
        }));
    };

    const nudge = (index: number, delta: -1 | 1) => {
        const to = index + delta;
        if (to < 0 || to >= layout.length) return;
        setLayout(prev => moveItem(prev, index, to));
    };

    // ---- Pointer drag (mouse, touch and pen all arrive as pointer events) ----
    const onHandlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, index: number) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        const row = e.currentTarget.closest<HTMLLIElement>('.sections-row');
        const rowHeight = row ? row.getBoundingClientRect().height : 56;
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
        setDrag({ pointerId: e.pointerId, fromIndex: index, overIndex: index, startY: e.clientY, offsetY: 0, rowHeight, active: false });
    };

    const onHandlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        const offsetY = e.clientY - drag.startY;
        const active = drag.active || Math.abs(offsetY) > DRAG_THRESHOLD_PX;
        if (!active) return;

        // Decide which slot the pointer is over using the rows' midpoints.
        const rows = Array.from(listRef.current?.querySelectorAll<HTMLLIElement>('.sections-row') ?? []);
        let overIndex = drag.fromIndex;
        const draggedRect = rows[drag.fromIndex]?.getBoundingClientRect();
        if (draggedRect) {
            const draggedMidY = draggedRect.top + draggedRect.height / 2; // transform-free position
            const pointerMidY = draggedMidY + offsetY;
            overIndex = rows.reduce((acc, row, i) => {
                if (i === drag.fromIndex) return acc;
                const r = row.getBoundingClientRect();
                const mid = r.top + r.height / 2;
                if (i < drag.fromIndex && pointerMidY < mid) return Math.min(acc, i);
                if (i > drag.fromIndex && pointerMidY > mid) return Math.max(acc, i);
                return acc;
            }, drag.fromIndex);
        }
        setDrag({ ...drag, offsetY, overIndex, active: true });
    };

    const endDrag = (e: React.PointerEvent<HTMLButtonElement>, commit: boolean) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
        if (commit && drag.active && drag.overIndex !== drag.fromIndex) {
            setLayout(prev => moveItem(prev, drag.fromIndex, drag.overIndex));
        }
        setDrag(null);
    };

    const onHandleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); nudge(index, -1); }
        if (e.key === 'ArrowDown') { e.preventDefault(); nudge(index, 1); }
    };

    /** Visual shift for non-dragged rows so a gap opens where the item will land. */
    const rowStyle = (index: number): React.CSSProperties | undefined => {
        if (!drag || !drag.active) return undefined;
        if (index === drag.fromIndex) {
            return { transform: `translateY(${drag.offsetY}px)`, zIndex: 2, transition: 'none' };
        }
        if (drag.fromIndex < drag.overIndex && index > drag.fromIndex && index <= drag.overIndex) {
            return { transform: `translateY(-${drag.rowHeight}px)` };
        }
        if (drag.fromIndex > drag.overIndex && index >= drag.overIndex && index < drag.fromIndex) {
            return { transform: `translateY(${drag.rowHeight}px)` };
        }
        return undefined;
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await updateSection('sectionLayout', layout);
            setSavedLayout(layout);
            setMessage({ type: 'success', text: 'Section layout saved. Open or reload the home page in this browser to see it; other visitors see it within about 5 minutes.' });
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save section layout' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setLayout(defaultSectionLayout());
        setMessage({ type: '', text: '' });
    };

    if (loading) {
        return <div className="editor-loading">Loading...</div>;
    }

    return (
        <div className="editor-page sections-page">
            <div className="editor-header">
                <h1>Page Sections</h1>
                <p>Choose which sections appear on the home page and in what order. Hold the ⋮⋮ handle and drag up or down to reorder.</p>
            </div>

            <div className={`editor-message editor-message--${message.type}`}>
                {message.text}
            </div>

            <div className="editor-section">
                <ul className="sections-list" ref={listRef} aria-label="Home page sections, top to bottom">
                    <li className="sections-row sections-row--pinned" aria-label="Hero (always shown, always first)">
                        <span className="sections-row__handle sections-row__handle--locked" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="5" y="11" width="14" height="10" rx="2" />
                                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                            </svg>
                        </span>
                        <div className="sections-row__body">
                            <span className="sections-row__label">Hero</span>
                            <span className="sections-row__desc">Always first and always visible. Edit it under Hero Section.</span>
                        </div>
                        <span className="sections-row__pinned-tag">Pinned</span>
                    </li>

                    {layout.map((entry, index) => {
                        const meta = sectionMeta(entry.id);
                        const isDragging = drag?.active && drag.fromIndex === index;
                        return (
                            <li
                                key={entry.id}
                                className={`sections-row${entry.visible ? '' : ' sections-row--hidden'}${isDragging ? ' sections-row--dragging' : ''}`}
                                style={rowStyle(index)}
                            >
                                <button
                                    type="button"
                                    className="sections-row__handle"
                                    aria-label={`Drag to reorder ${meta.label}. Use arrow keys to move.`}
                                    title="Hold and drag to reorder"
                                    onPointerDown={(e) => onHandlePointerDown(e, index)}
                                    onPointerMove={onHandlePointerMove}
                                    onPointerUp={(e) => endDrag(e, true)}
                                    onPointerCancel={(e) => endDrag(e, false)}
                                    onKeyDown={(e) => onHandleKeyDown(e, index)}
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                                        <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
                                        <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
                                        <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
                                    </svg>
                                </button>

                                <span className="sections-row__index" aria-hidden="true">{index + 2}</span>

                                <div className="sections-row__body">
                                    <span className="sections-row__label">{meta.label}</span>
                                    <span className="sections-row__desc">{meta.description}</span>
                                </div>

                                <div className="sections-row__nudge" aria-hidden="true">
                                    <button type="button" className="sections-row__nudge-btn" onClick={() => nudge(index, -1)} disabled={index === 0} tabIndex={-1} title="Move up">▲</button>
                                    <button type="button" className="sections-row__nudge-btn" onClick={() => nudge(index, 1)} disabled={index === layout.length - 1} tabIndex={-1} title="Move down">▼</button>
                                </div>

                                <label className="sections-switch">
                                    <input
                                        type="checkbox"
                                        role="switch"
                                        checked={entry.visible}
                                        onChange={() => toggleVisible(index)}
                                        aria-label={`${entry.visible ? 'Hide' : 'Show'} ${meta.label}`}
                                    />
                                    <span className="sections-switch__track"><span className="sections-switch__thumb" /></span>
                                    <span className="sections-switch__text">{entry.visible ? 'Shown' : 'Hidden'}</span>
                                </label>

                                {meta.parts && entry.parts && (
                                    <ul
                                        className={`sections-parts${entry.visible ? '' : ' sections-parts--disabled'}`}
                                        aria-label={`Parts of ${meta.label}`}
                                    >
                                        {meta.parts.map((partMeta) => {
                                            const part = entry.parts!.find(p => p.id === partMeta.id);
                                            const partVisible = part?.visible !== false;
                                            return (
                                                <li
                                                    key={partMeta.id}
                                                    className={`sections-part${partVisible ? '' : ' sections-part--hidden'}`}
                                                >
                                                    <span className="sections-part__branch" aria-hidden="true" />
                                                    <div className="sections-row__body">
                                                        <span className="sections-part__label">{partMeta.label}</span>
                                                        <span className="sections-row__desc">{partMeta.description}</span>
                                                    </div>
                                                    <label className="sections-switch sections-switch--small">
                                                        <input
                                                            type="checkbox"
                                                            role="switch"
                                                            checked={partVisible}
                                                            disabled={!entry.visible}
                                                            onChange={() => togglePart(index, partMeta.id)}
                                                            aria-label={`${partVisible ? 'Hide' : 'Show'} ${partMeta.label} in ${meta.label}`}
                                                        />
                                                        <span className="sections-switch__track"><span className="sections-switch__thumb" /></span>
                                                        <span className="sections-switch__text">{partVisible ? 'Shown' : 'Hidden'}</span>
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <p className="editor-hint" style={{ marginTop: '1rem' }}>
                    {hiddenCount === 0 && hiddenPartCount === 0
                        ? 'All sections and parts are shown.'
                        : [
                            hiddenCount > 0 ? `${hiddenCount} section${hiddenCount === 1 ? '' : 's'} hidden` : '',
                            hiddenPartCount > 0 ? `${hiddenPartCount} part${hiddenPartCount === 1 ? '' : 's'} hidden` : '',
                        ].filter(Boolean).join(', ') + '. Hidden sections also disappear from the top navigation bar.'}
                    {emptySections.length > 0 && (
                        <>
                            {' '}
                            <strong>{emptySections.join(', ')}</strong>
                            {emptySections.length === 1 ? ' has' : ' have'} every part hidden, so the whole section stays off the page until a part is switched on.
                        </>
                    )}
                </p>
            </div>

            <div className="editor-actions">
                <button type="button" className="editor-button" onClick={handleReset} disabled={saving}>
                    Reset to default order
                </button>
                <button type="button" className="editor-button editor-button--primary" onClick={handleSave} disabled={saving || !dirty}>
                    {saving ? 'Saving...' : dirty ? 'Save Layout' : 'Saved'}
                </button>
            </div>
        </div>
    );
}
