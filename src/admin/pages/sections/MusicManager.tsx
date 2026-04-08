/**
 * Music Manager
 * Manage music releases
 */
import { useState, useEffect } from 'react';
import { fetchSection, addItem, deleteItem, updateSection, uploadImage } from '../../api/client';
import '../styles/editor.css';

interface MusicLink {
    label: string;
    href: string;
}

interface MusicRelease {
    id: string;
    title: string;
    meta: string;
    gradient: [string, string];
    coverImage: string;
    links: MusicLink[];
    videoUrl?: string;
    videoPlatform?: 'youtube' | 'instagram';
    youtubeUrl?: string;
    instaUrl?: string;
    aspect?: string;
}

const emptyRelease: Omit<MusicRelease, 'id'> = {
    title: '',
    meta: '',
    gradient: ['#667eea', '#764ba2'],
    coverImage: '',
    links: [],
    videoUrl: '',
    videoPlatform: undefined,
    youtubeUrl: '',
    instaUrl: '',
    aspect: '1/1',
};

const ASPECT_PRESETS = [
    { label: '1/1', title: 'Square' },
    { label: '4/5', title: 'Portrait' },
    { label: '3/4', title: 'Tall' },
    { label: '9/16', title: 'Story' },
    { label: '4/3', title: 'Landscape' },
    { label: '16/9', title: 'Widescreen' },
];

const getYouTubeEmbedUrl = (url: string) => {
    try {
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)([^&?/]+)|youtu\.be\/([^&?/]+))/)
        const videoId = match?.[1] || match?.[2]
        if (videoId) return `https://www.youtube.com/embed/${videoId}`
    } catch { /* ignore */ }
    return ''
}

const renderPreview = (release: Omit<MusicRelease, 'id'>) => {
    const aspect = release.aspect || '1/1'
    const ytEmbed = release.videoPlatform === 'youtube' && release.videoUrl
        ? getYouTubeEmbedUrl(release.videoUrl) : ''
    const spotifyLink = release.links.find(l => l.label === 'Spotify')?.href

    return (
        <div style={{ background: '#0d0d0d', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Site Preview</p>
            <div style={{ maxWidth: '220px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', background: '#1a1a1a' }}>
                {/* Album art */}
                <div style={{ position: 'relative', aspectRatio: aspect, overflow: 'hidden', background: `linear-gradient(135deg, ${release.gradient[0]}, ${release.gradient[1]})` }}>
                    {ytEmbed ? (
                        <iframe src={ytEmbed} width="100%" height="100%"
                            style={{ border: 'none', display: 'block', position: 'absolute', inset: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen title={release.title} />
                    ) : release.videoPlatform === 'instagram' && release.videoUrl ? (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#E1306C,#F77737)', fontSize: '2.5rem' }}>📷</div>
                    ) : release.coverImage ? (
                        <img src={release.coverImage} alt={release.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 120 120" style={{ width: '60%', opacity: 0.3 }}>
                                <circle cx="60" cy="60" r="40" fill="rgba(255,255,255,0.2)" />
                                <circle cx="60" cy="60" r="10" fill="rgba(255,255,255,0.4)" />
                            </svg>
                        </div>
                    )}
                </div>
                {/* Info */}
                <div style={{ padding: '12px 14px' }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {release.title || <span style={{ color: '#444' }}>Song Title</span>}
                    </div>
                    {release.meta && <div style={{ color: '#888', fontSize: '0.78rem', marginTop: '2px' }}>{release.meta}</div>}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {spotifyLink && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(29,185,84,0.15)', color: '#1DB954', border: '1px solid rgba(29,185,84,0.3)' }}>Spotify</span>}
                        {release.youtubeUrl && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,68,68,0.15)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.3)' }}>YouTube</span>}
                        {release.instaUrl && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(225,48,108,0.15)', color: '#E1306C', border: '1px solid rgba(225,48,108,0.3)' }}>Instagram</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MusicManager() {
    const [releases, setReleases] = useState<MusicRelease[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newRelease, setNewRelease] = useState(emptyRelease);
    const [editingItem, setEditingItem] = useState<MusicRelease | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => { loadReleases(); }, []);

    const loadReleases = async () => {
        try {
            const data = await fetchSection('musicReleases');
            setReleases(data || []);
        } catch {
            setMessage({ type: 'error', text: 'Failed to load music' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newRelease.title) { setMessage({ type: 'error', text: 'Please enter a title' }); return; }
        setSaving(true);
        try {
            await addItem('musicReleases', newRelease);
            setNewRelease(emptyRelease);
            setIsAdding(false);
            setShowPreview(false);
            await loadReleases();
            setMessage({ type: 'success', text: 'Release added!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to add release' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        setSaving(true);
        try {
            const updated = releases.map(r => r.id === editingItem.id ? editingItem : r);
            await updateSection('musicReleases', updated);
            setEditingItem(null);
            setShowPreview(false);
            await loadReleases();
            setMessage({ type: 'success', text: 'Release updated!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update release' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this release?')) return;
        try {
            await deleteItem('musicReleases', id);
            await loadReleases();
            setMessage({ type: 'success', text: 'Release deleted!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to delete release' });
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const reordered = [...releases];
        [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        setReleases(reordered);
        try { await updateSection('musicReleases', reordered); }
        catch { await loadReleases(); }
    };

    const handleMoveDown = async (index: number) => {
        if (index === releases.length - 1) return;
        const reordered = [...releases];
        [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        setReleases(reordered);
        try { await updateSection('musicReleases', reordered); }
        catch { await loadReleases(); }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (r: any) => void,
        current: any
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const result = await uploadImage(file);
            onChange({ ...current, coverImage: result.data.url });
            setMessage({ type: 'success', text: 'Image uploaded!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setSaving(false);
        }
    };

    const renderForm = (release: Omit<MusicRelease, 'id'>, onChange: (r: any) => void) => {
        const aspect = release.aspect || '1/1';
        return (
            <div className="editor-form">
                <div className="editor-row">
                    <div className="editor-field">
                        <label>Title *</label>
                        <input type="text" value={release.title} onChange={e => onChange({ ...release, title: e.target.value })} placeholder="Song Title" />
                    </div>
                    <div className="editor-field">
                        <label>Meta Info</label>
                        <input type="text" value={release.meta} onChange={e => onChange({ ...release, meta: e.target.value })} placeholder="Single • 2024" />
                    </div>
                </div>
                <div className="editor-field">
                    <label>Cover Image</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, onChange, release)} disabled={saving} style={{ width: 'auto' }} />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                        <input type="text" value={release.coverImage} onChange={e => onChange({ ...release, coverImage: e.target.value })} placeholder="Image URL" style={{ flex: 1 }} />
                    </div>
                    {release.coverImage && (
                        <img src={release.coverImage} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', marginTop: '4px' }} />
                    )}
                </div>
                <div className="editor-field">
                    <label>Aspect Ratio (cover image)</label>
                    <input type="text" value={aspect} onChange={e => onChange({ ...release, aspect: e.target.value })} placeholder="e.g. 1/1 or 16/9" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {ASPECT_PRESETS.map(p => (
                            <button key={p.label} type="button" title={p.title} onClick={() => onChange({ ...release, aspect: p.label })}
                                style={{ padding: '3px 8px', fontSize: '0.78rem', border: aspect === p.label ? '2px solid #764ba2' : '1px solid #ccc', borderRadius: '4px', background: aspect === p.label ? '#f3ecff' : '#fff', cursor: 'pointer', fontWeight: aspect === p.label ? 600 : 400 }}>
                                {p.label} <span style={{ fontSize: '0.68rem', color: '#888' }}>{p.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="editor-row">
                    <div className="editor-field">
                        <label>Embed Video Platform (optional)</label>
                        <select value={release.videoPlatform || ''} onChange={e => onChange({ ...release, videoPlatform: (e.target.value as any) || undefined })}>
                            <option value="">None (show image)</option>
                            <option value="youtube">YouTube embed</option>
                            <option value="instagram">Instagram link</option>
                        </select>
                    </div>
                    {release.videoPlatform && (
                        <div className="editor-field">
                            <label>Video URL</label>
                            <input type="text" value={release.videoUrl || ''} onChange={e => onChange({ ...release, videoUrl: e.target.value })}
                                placeholder={release.videoPlatform === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://instagram.com/reel/...'} />
                        </div>
                    )}
                </div>
                <div className="editor-row">
                    <div className="editor-field">
                        <label>Spotify Link</label>
                        <input type="text" value={release.links.find(l => l.label === 'Spotify')?.href || ''}
                            onChange={e => {
                                const others = release.links.filter(l => l.label !== 'Spotify');
                                onChange({ ...release, links: e.target.value ? [...others, { label: 'Spotify', href: e.target.value }] : others });
                            }} placeholder="https://open.spotify.com/..." />
                    </div>
                    <div className="editor-field">
                        <label>YouTube Link</label>
                        <input type="text" value={release.youtubeUrl || ''} onChange={e => onChange({ ...release, youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                    </div>
                    <div className="editor-field">
                        <label>Instagram Link</label>
                        <input type="text" value={release.instaUrl || ''} onChange={e => onChange({ ...release, instaUrl: e.target.value })} placeholder="https://instagram.com/p/..." />
                    </div>
                </div>
                <div className="editor-row">
                    <div className="editor-field">
                        <label>Gradient Start</label>
                        <input type="color" value={release.gradient[0]} onChange={e => onChange({ ...release, gradient: [e.target.value, release.gradient[1]] })} />
                    </div>
                    <div className="editor-field">
                        <label>Gradient End</label>
                        <input type="color" value={release.gradient[1]} onChange={e => onChange({ ...release, gradient: [release.gradient[0], e.target.value] })} />
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="editor-loading"><div className="editor-spinner"></div><p>Loading...</p></div>;

    return (
        <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Music Releases</h1>
                    <p>Manage your music catalog</p>
                </div>
                {!isAdding && !editingItem && (
                    <button className="editor-button editor-button--primary" onClick={() => setIsAdding(true)}>+ Add Release</button>
                )}
            </div>

            {message.text && <div className={`editor-message editor-message--${message.type}`}>{message.text}</div>}

            {isAdding && (
                <div className="editor-card">
                    <h3>Add Music Release</h3>
                    {renderForm(newRelease, setNewRelease)}
                    {showPreview && renderPreview(newRelease)}
                    <div className="editor-actions">
                        <button className="editor-button editor-button--primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Release'}</button>
                        <button className="editor-button" onClick={() => { setIsAdding(false); setNewRelease(emptyRelease); setShowPreview(false); }}>Cancel</button>
                        <button className="editor-button" onClick={() => setShowPreview(p => !p)} style={{ marginLeft: 'auto' }}>
                            {showPreview ? 'Hide Preview' : '👁 Preview'}
                        </button>
                    </div>
                </div>
            )}

            <div className="editor-list">
                {releases.length === 0 ? (
                    <div className="editor-empty"><p>No music releases yet.</p></div>
                ) : (
                    releases.map((release, index) => (
                        <div key={release.id} className="editor-list-item">
                            {editingItem?.id === release.id ? (
                                <div style={{ width: '100%' }}>
                                    {renderForm(editingItem, (updated) => setEditingItem({ ...updated, id: release.id }))}
                                    {showPreview && renderPreview(editingItem)}
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
                                        <div className="editor-list-item__image"
                                            style={{ background: release.coverImage ? `url(${release.coverImage}) center/cover` : `linear-gradient(135deg, ${release.gradient[0]}, ${release.gradient[1]})` }} />
                                        <div className="editor-list-item__info">
                                            <h4>{release.title}</h4>
                                            <p>{release.meta}</p>
                                            {release.aspect && <p style={{ fontSize: '0.75rem', color: '#888' }}>Aspect: {release.aspect}</p>}
                                        </div>
                                    </div>
                                    <div className="editor-list-item__actions">
                                        <button className="editor-button editor-button--small" onClick={() => handleMoveUp(index)} disabled={index === 0} title="Move up">↑</button>
                                        <button className="editor-button editor-button--small" onClick={() => handleMoveDown(index)} disabled={index === releases.length - 1} title="Move down">↓</button>
                                        <button className="editor-button editor-button--small" onClick={() => { setEditingItem({ ...release }); setShowPreview(false); }}>Edit</button>
                                        <button className="editor-button editor-button--small editor-button--danger" onClick={() => handleDelete(release.id)}>Delete</button>
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
