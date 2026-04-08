/**
 * Song List Manager
 * Manually manage a list of songs with platform links
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSection, addItem, deleteItem, updateSection, uploadImage } from '../../api/client';
import '../styles/editor.css';

interface FocalPoint { x: number; y: number }

interface SongItem {
    id: string;
    title: string;
    artist?: string;
    thumbnail?: string;
    thumbnailPosition?: FocalPoint;
    spotifyUrl?: string;
    youtubeUrl?: string;
    instaUrl?: string;
}

const emptyItem: Omit<SongItem, 'id'> = {
    title: '',
    artist: '',
    thumbnail: '',
    thumbnailPosition: { x: 50, y: 50 },
    spotifyUrl: '',
    youtubeUrl: '',
    instaUrl: '',
};

const SpotifyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
);
const YouTubeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);
const InstaIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
);

/** Interactive focal-point picker — click or drag on the image to choose crop center */
function FocalPointPicker({
    image,
    position,
    onChange,
}: {
    image: string;
    position: FocalPoint;
    onChange: (pos: FocalPoint) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const posFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
        const rect = containerRef.current!.getBoundingClientRect();
        const x = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
        const y = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
        return { x, y };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        onChange(posFromEvent(e));

        const onMove = (ev: MouseEvent) => {
            if (isDragging.current) onChange(posFromEvent(ev));
        };
        const onUp = () => {
            isDragging.current = false;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const pos = position ?? { x: 50, y: 50 };

    return (
        <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '8px' }}>
                Click or drag on the image to set the square crop center
            </p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Full image with focal-point overlay */}
                <div
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    style={{
                        position: 'relative',
                        cursor: 'crosshair',
                        userSelect: 'none',
                        flexShrink: 0,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        maxWidth: '260px',
                        border: '2px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <img
                        src={image}
                        draggable={false}
                        style={{ width: '260px', display: 'block', pointerEvents: 'none' }}
                        alt="focal point source"
                    />
                    {/* Crosshair lines */}
                    <div style={{
                        position: 'absolute', left: `${pos.x}%`, top: 0, bottom: 0,
                        width: '1px', background: 'rgba(255,255,255,0.5)', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', top: `${pos.y}%`, left: 0, right: 0,
                        height: '1px', background: 'rgba(255,255,255,0.5)', pointerEvents: 'none',
                    }} />
                    {/* Marker dot */}
                    <div style={{
                        position: 'absolute',
                        left: `${pos.x}%`, top: `${pos.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '18px', height: '18px',
                        borderRadius: '50%',
                        background: 'rgba(118,75,162,0.9)',
                        border: '2px solid #fff',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.5)',
                        pointerEvents: 'none',
                    }} />
                </div>

                {/* Live square preview */}
                <div style={{ flexShrink: 0 }}>
                    <p style={{ fontSize: '0.72rem', color: '#666', marginBottom: '6px' }}>Square preview</p>
                    <div style={{
                        width: '96px', height: '96px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.12)',
                    }}>
                        <img
                            src={image}
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'cover',
                                objectPosition: `${pos.x}% ${pos.y}%`,
                                display: 'block',
                            }}
                            alt="crop preview"
                        />
                    </div>
                    <p style={{ fontSize: '0.68rem', color: '#555', marginTop: '6px', textAlign: 'center' }}>
                        {pos.x}% / {pos.y}%
                    </p>
                    <button
                        type="button"
                        onClick={() => onChange({ x: 50, y: 50 })}
                        style={{
                            marginTop: '6px', width: '100%', fontSize: '0.7rem',
                            padding: '4px 0', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.04)', color: '#888', cursor: 'pointer',
                        }}
                    >
                        Reset to center
                    </button>
                </div>
            </div>
        </div>
    );
}

const renderPreview = (item: Omit<SongItem, 'id'>, index = 1) => {
    const pos = item.thumbnailPosition ?? { x: 50, y: 50 };
    return (
        <div style={{ background: '#0d0d0d', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', margin: '0 0 12px' }}>Site Preview</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#555', fontSize: '0.85rem', minWidth: '22px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{index}</span>
                {item.thumbnail ? (
                    <img
                        src={item.thumbnail}
                        alt=""
                        style={{
                            width: '48px', height: '48px',
                            objectFit: 'cover',
                            objectPosition: `${pos.x}% ${pos.y}%`,
                            borderRadius: '6px', flexShrink: 0,
                        }}
                    />
                ) : (
                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '1.3rem', flexShrink: 0 }}>♪</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem' }}>{item.title || <span style={{ color: '#555' }}>Song Title</span>}</div>
                    {item.artist && <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>{item.artist}</div>}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    {item.spotifyUrl && <span style={{ color: '#1DB954' }}><SpotifyIcon /></span>}
                    {item.youtubeUrl && <span style={{ color: '#FF4444' }}><YouTubeIcon /></span>}
                    {item.instaUrl && <span style={{ color: '#E1306C' }}><InstaIcon /></span>}
                </div>
            </div>
        </div>
    );
};

export default function SongListManager() {
    const [items, setItems] = useState<SongItem[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState(emptyItem);
    const [editingItem, setEditingItem] = useState<SongItem | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => { loadItems(); }, []);

    const loadItems = async () => {
        try {
            const data = await fetchSection('songList');
            setItems(data || []);
        } catch {
            setMessage({ type: 'error', text: 'Failed to load song list' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.title) {
            setMessage({ type: 'error', text: 'Please enter a song title' });
            return;
        }
        setSaving(true);
        try {
            await addItem('songList', newItem);
            setNewItem(emptyItem);
            setIsAdding(false);
            setShowPreview(false);
            await loadItems();
            setMessage({ type: 'success', text: 'Song added!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to add song' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        setSaving(true);
        try {
            const updated = items.map(i => i.id === editingItem.id ? editingItem : i);
            await updateSection('songList', updated);
            setEditingItem(null);
            setShowPreview(false);
            await loadItems();
            setMessage({ type: 'success', text: 'Song updated!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update song' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this song?')) return;
        try {
            await deleteItem('songList', id);
            await loadItems();
            setMessage({ type: 'success', text: 'Song deleted!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to delete song' });
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const reordered = [...items];
        [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        setItems(reordered);
        await updateSection('songList', reordered);
    };

    const handleMoveDown = async (index: number) => {
        if (index === items.length - 1) return;
        const reordered = [...items];
        [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        setItems(reordered);
        await updateSection('songList', reordered);
    };

    const handleThumbnailUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (item: any) => void,
        current: any
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const result = await uploadImage(file);
            onChange({ ...current, thumbnail: result.data.url, thumbnailPosition: { x: 50, y: 50 } });
            setMessage({ type: 'success', text: 'Thumbnail uploaded!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload thumbnail' });
        } finally {
            setSaving(false);
        }
    };

    const renderForm = (item: Omit<SongItem, 'id'>, onChange: (item: any) => void) => (
        <div className="editor-form">
            <div className="editor-row">
                <div className="editor-field">
                    <label>Song Title *</label>
                    <input type="text" value={item.title} onChange={e => onChange({ ...item, title: e.target.value })} placeholder="Song name" />
                </div>
                <div className="editor-field">
                    <label>Artist / Credit</label>
                    <input type="text" value={item.artist || ''} onChange={e => onChange({ ...item, artist: e.target.value })} placeholder="Shubhangii Kedar" />
                </div>
            </div>
            <div className="editor-field">
                <label>Thumbnail</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="file" accept="image/*" onChange={e => handleThumbnailUpload(e, onChange, item)} disabled={saving} style={{ width: 'auto' }} />
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                    <input
                        type="text"
                        value={item.thumbnail || ''}
                        onChange={e => onChange({ ...item, thumbnail: e.target.value })}
                        placeholder="Image URL"
                        style={{ flex: 1, minWidth: '180px' }}
                    />
                </div>
                {/* Focal point picker — only shown when image is set */}
                {item.thumbnail && (
                    <FocalPointPicker
                        image={item.thumbnail}
                        position={item.thumbnailPosition ?? { x: 50, y: 50 }}
                        onChange={pos => onChange({ ...item, thumbnailPosition: pos })}
                    />
                )}
            </div>
            <div className="editor-row editor-row--3">
                <div className="editor-field">
                    <label>Spotify URL</label>
                    <input type="text" value={item.spotifyUrl || ''} onChange={e => onChange({ ...item, spotifyUrl: e.target.value })} placeholder="https://open.spotify.com/..." />
                </div>
                <div className="editor-field">
                    <label>YouTube URL</label>
                    <input type="text" value={item.youtubeUrl || ''} onChange={e => onChange({ ...item, youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="editor-field">
                    <label>Instagram URL</label>
                    <input type="text" value={item.instaUrl || ''} onChange={e => onChange({ ...item, instaUrl: e.target.value })} placeholder="https://instagram.com/p/..." />
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="editor-loading"><div className="editor-spinner"></div><p>Loading...</p></div>;

    return (
        <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Song List</h1>
                    <p>Manage your discography — shown as a compact track list on the site</p>
                </div>
                {!isAdding && !editingItem && (
                    <button className="editor-button editor-button--primary" onClick={() => setIsAdding(true)}>+ Add Song</button>
                )}
            </div>

            {message.text && <div className={`editor-message editor-message--${message.type}`}>{message.text}</div>}

            {isAdding && (
                <div className="editor-card">
                    <h3>Add Song</h3>
                    {renderForm(newItem, setNewItem)}
                    {showPreview && renderPreview(newItem, items.length + 1)}
                    <div className="editor-actions">
                        <button className="editor-button editor-button--primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Song'}</button>
                        <button className="editor-button" onClick={() => { setIsAdding(false); setNewItem(emptyItem); setShowPreview(false); }}>Cancel</button>
                        <button className="editor-button" onClick={() => setShowPreview(p => !p)} style={{ marginLeft: 'auto' }}>
                            {showPreview ? 'Hide Preview' : '👁 Preview'}
                        </button>
                    </div>
                </div>
            )}

            <div className="editor-list">
                {items.length === 0 ? (
                    <div className="editor-empty"><p>No songs yet. Add your first song!</p></div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id} className="editor-list-item">
                            {editingItem?.id === item.id ? (
                                <div style={{ width: '100%' }}>
                                    {renderForm(editingItem, (updated) => setEditingItem({ ...updated, id: item.id }))}
                                    {showPreview && renderPreview(editingItem, index + 1)}
                                    <div className="editor-actions" style={{ marginTop: '1rem' }}>
                                        <button className="editor-button editor-button--primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                                        <button className="editor-button" onClick={() => { setEditingItem(null); setShowPreview(false); }}>Cancel</button>
                                        <button className="editor-button" onClick={() => setShowPreview(p => !p)} style={{ marginLeft: 'auto' }}>
                                            {showPreview ? 'Hide Preview' : '👁 Preview'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="editor-list-item__content">
                                        {item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="editor-list-item__image"
                                                style={{
                                                    borderRadius: '6px',
                                                    objectPosition: item.thumbnailPosition
                                                        ? `${item.thumbnailPosition.x}% ${item.thumbnailPosition.y}%`
                                                        : 'center',
                                                }}
                                            />
                                        ) : (
                                            <div className="editor-list-item__image" style={{ background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>♪</div>
                                        )}
                                        <div className="editor-list-item__info">
                                            <h4>{index + 1}. {item.title}</h4>
                                            <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                                {item.artist && <span>{item.artist} &nbsp;</span>}
                                                {item.spotifyUrl && <span style={{ color: '#1DB954' }}><SpotifyIcon /></span>}
                                                {item.youtubeUrl && <span style={{ color: '#FF4444', marginLeft: 4 }}><YouTubeIcon /></span>}
                                                {item.instaUrl && <span style={{ color: '#E1306C', marginLeft: 4 }}><InstaIcon /></span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="editor-list-item__actions">
                                        <button className="editor-button editor-button--small" onClick={() => handleMoveUp(index)} disabled={index === 0} title="Move up">↑</button>
                                        <button className="editor-button editor-button--small" onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} title="Move down">↓</button>
                                        <button className="editor-button editor-button--small" onClick={() => { setEditingItem({ ...item }); setShowPreview(false); }}>Edit</button>
                                        <button className="editor-button editor-button--small editor-button--danger" onClick={() => handleDelete(item.id)}>Delete</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
