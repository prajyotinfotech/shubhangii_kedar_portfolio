/**
 * Performed At Manager
 */
import { useState, useEffect } from 'react';
import { fetchSection, addItem, deleteItem, updateSection, uploadImage } from '../../api/client';
import '../styles/editor.css';

interface PerformedAtItem {
    id: string;
    venue: string;
    city: string;
    month?: string;
    year?: string;
    quote?: string;
    type?: 'text' | 'video' | 'image';
    platform?: 'youtube' | 'instagram';
    videoUrl?: string;
    embedCode?: string;
    image?: string;
    aspect?: string;
}

const emptyItem: Omit<PerformedAtItem, 'id'> = {
    venue: '',
    city: '',
    month: '',
    year: '',
    quote: '',
    type: 'text',
    platform: 'youtube',
    videoUrl: '',
    embedCode: '',
    image: '',
    aspect: '16/9',
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const getYouTubeEmbedUrl = (url: string) => {
    try {
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)([^&?/]+)|youtu\.be\/([^&?/]+))/)
        const videoId = match?.[1] || match?.[2]
        if (videoId) return `https://www.youtube.com/embed/${videoId}`
    } catch { /* ignore */ }
    return ''
}

const renderPreview = (item: Omit<PerformedAtItem, 'id'>) => {
    const aspect = item.aspect || '16/9';
    const ytEmbed = item.type === 'video' && item.platform === 'youtube' && item.videoUrl
        ? getYouTubeEmbedUrl(item.videoUrl) : '';

    return (
        <div style={{ background: '#0d0d0d', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Site Preview</p>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                {item.type === 'video' && ytEmbed && (
                    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto 1rem', aspectRatio: aspect }}>
                        <iframe
                            src={ytEmbed}
                            width="100%"
                            height="100%"
                            style={{ border: 'none', borderRadius: '8px' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Preview"
                        />
                    </div>
                )}
                {item.type === 'video' && item.platform === 'instagram' && !ytEmbed && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg,#E1306C,#F77737)', borderRadius: '10px', padding: '12px 20px', marginBottom: '1rem', color: '#fff', fontSize: '0.9rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>📷</span>
                        <span>Instagram preview</span>
                    </div>
                )}
                {item.type === 'image' && item.image && (
                    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto 1rem', aspectRatio: aspect, overflow: 'hidden', borderRadius: '8px' }}>
                        <img src={item.image} alt={item.venue} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
                {item.quote && (
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.6, margin: '1rem 0', maxWidth: '560px', marginInline: 'auto' }}>
                        "{item.quote}"
                    </p>
                )}
                <p style={{ color: '#ccc', fontWeight: 600, margin: '0 0 4px' }}>{item.venue || <span style={{ color: '#444' }}>Venue name</span>}</p>
                <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
                    {item.city || <span style={{ color: '#444' }}>City</span>}
                    {(item.month || item.year) && (
                        <span style={{ color: '#666' }}> · {[item.month, item.year].filter(Boolean).join(' ')}</span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default function PerformedAtManager() {
    const [items, setItems] = useState<PerformedAtItem[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<Omit<PerformedAtItem, 'id'>>(emptyItem);
    const [editingItem, setEditingItem] = useState<PerformedAtItem | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => { loadItems(); }, []);

    const loadItems = async () => {
        try {
            const data = await fetchSection('performedAt');
            setItems(data || []);
        } catch {
            // Section doesn't exist yet — start empty
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.venue) { setMessage({ type: 'error', text: 'Venue is required' }); return; }
        if (!newItem.city) { setMessage({ type: 'error', text: 'City is required' }); return; }
        if (newItem.type === 'video' && !newItem.videoUrl) { setMessage({ type: 'error', text: 'Video URL is required' }); return; }
        setSaving(true);
        try {
            await addItem('performedAt', newItem);
            setNewItem(emptyItem);
            setIsAdding(false);
            setShowPreview(false);
            await loadItems();
            setMessage({ type: 'success', text: 'Entry added!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to add entry' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        setSaving(true);
        try {
            const updated = items.map(i => i.id === editingItem.id ? editingItem : i);
            await updateSection('performedAt', updated);
            setEditingItem(null);
            setShowPreview(false);
            await loadItems();
            setMessage({ type: 'success', text: 'Entry updated!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update entry' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry?')) return;
        try {
            await deleteItem('performedAt', id);
            await loadItems();
            setMessage({ type: 'success', text: 'Entry deleted!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to delete entry' });
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const reordered = [...items];
        [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        setItems(reordered);
        try { await updateSection('performedAt', reordered); }
        catch { await loadItems(); }
    };

    const handleMoveDown = async (index: number) => {
        if (index === items.length - 1) return;
        const reordered = [...items];
        [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        setItems(reordered);
        try { await updateSection('performedAt', reordered); }
        catch { await loadItems(); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (item: any) => void, currentItem: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const result = await uploadImage(file);
            onChange({ ...currentItem, image: result.data.url });
            setMessage({ type: 'success', text: 'Image uploaded!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setSaving(false);
        }
    };

    const renderForm = (item: Omit<PerformedAtItem, 'id'>, onChange: (item: Omit<PerformedAtItem, 'id'>) => void) => {
        const type = item.type || 'text';
        const platform = item.platform || 'youtube';
        const aspect = item.aspect || '16/9';

        return (
            <div className="editor-form">
                {/* Venue + City */}
                <div className="editor-field">
                    <label>Venue / Event Name *</label>
                    <input type="text" value={item.venue} onChange={e => onChange({ ...item, venue: e.target.value })} placeholder="e.g. Sawai Gandharva Festival" />
                </div>

                <div className="editor-field">
                    <label>City *</label>
                    <input type="text" value={item.city} onChange={e => onChange({ ...item, city: e.target.value })} placeholder="e.g. Pune" />
                </div>

                {/* Month + Year */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="editor-field">
                        <label>Month</label>
                        <select value={item.month || ''} onChange={e => onChange({ ...item, month: e.target.value })}>
                            <option value="">— select —</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="editor-field">
                        <label>Year</label>
                        <input type="text" value={item.year || ''} onChange={e => onChange({ ...item, year: e.target.value })} placeholder="e.g. 2024" maxLength={4} />
                    </div>
                </div>

                {/* Media type */}
                <div className="editor-field">
                    <label>Media Type</label>
                    <select value={type} onChange={e => onChange({ ...item, type: e.target.value as 'text' | 'video' | 'image' })}>
                        <option value="text">Text only</option>
                        <option value="video">Video (YouTube / Instagram)</option>
                        <option value="image">Image</option>
                    </select>
                </div>

                {type === 'video' && (
                    <div className="editor-field">
                        <label>Platform</label>
                        <select value={platform} onChange={e => onChange({ ...item, platform: e.target.value as 'youtube' | 'instagram' })}>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>
                        </select>
                    </div>
                )}

                {type === 'video' && platform === 'youtube' && (
                    <div className="editor-field">
                        <label>YouTube URL *</label>
                        <input type="text" value={item.videoUrl || ''} onChange={e => onChange({ ...item, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                )}

                {type === 'video' && platform === 'instagram' && (
                    <div className="editor-field">
                        <label>Instagram URL</label>
                        <input type="text" value={item.videoUrl || ''} onChange={e => onChange({ ...item, videoUrl: e.target.value })} placeholder="https://www.instagram.com/p/... or /reel/..." />
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>Or paste embed code below:</p>
                        <textarea value={item.embedCode || ''} onChange={e => onChange({ ...item, embedCode: e.target.value })} placeholder='<blockquote class="instagram-media" ...' rows={3} style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '4px', width: '100%' }} />
                    </div>
                )}

                {type === 'image' && (
                    <div className="editor-field">
                        <label>Image *</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, onChange, item)} disabled={saving} style={{ width: 'auto' }} />
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                            <input type="text" value={item.image || ''} onChange={e => onChange({ ...item, image: e.target.value })} placeholder="Image URL" style={{ flex: 1 }} />
                        </div>
                        {item.image && (
                            <div className="editor-preview" style={{ maxWidth: '300px' }}>
                                <img src={item.image} alt="Preview" style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                            </div>
                        )}
                    </div>
                )}

                {(type === 'video' || type === 'image') && (
                    <div className="editor-field">
                        <label>Aspect Ratio</label>
                        <input type="text" value={aspect} onChange={e => onChange({ ...item, aspect: e.target.value })} placeholder="e.g. 16/9" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {[
                                { label: '1/1', title: 'Square' },
                                { label: '4/5', title: 'Portrait' },
                                { label: '9/16', title: 'Story/Reel' },
                                { label: '4/3', title: 'Landscape' },
                                { label: '16/9', title: 'Widescreen' },
                            ].map(p => (
                                <button key={p.label} type="button" title={p.title}
                                    onClick={() => onChange({ ...item, aspect: p.label })}
                                    style={{ padding: '3px 8px', fontSize: '0.78rem', border: aspect === p.label ? '2px solid #764ba2' : '1px solid #ccc', borderRadius: '4px', background: aspect === p.label ? '#f3ecff' : '#fff', cursor: 'pointer', fontWeight: aspect === p.label ? 600 : 400 }}>
                                    {p.label} <span style={{ fontSize: '0.68rem', color: '#888', marginLeft: '4px' }}>{p.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="editor-field">
                    <label>Caption (optional)</label>
                    <textarea value={item.quote || ''} onChange={e => onChange({ ...item, quote: e.target.value })} placeholder="Optional caption shown on the card" rows={2} />
                </div>
            </div>
        );
    };

    if (loading) return <div className="editor-loading"><div className="editor-spinner"></div><p>Loading...</p></div>;

    return (
        <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Performed At</h1>
                    <p>Manage venues and performance entries</p>
                </div>
                {!isAdding && !editingItem && (
                    <button className="editor-button editor-button--primary" onClick={() => setIsAdding(true)}>+ Add Entry</button>
                )}
            </div>

            {message.text && <div className={`editor-message editor-message--${message.type}`}>{message.text}</div>}

            {isAdding && (
                <div className="editor-card">
                    <h3>Add Performance Entry</h3>
                    {renderForm(newItem, setNewItem)}
                    {showPreview && renderPreview(newItem)}
                    <div className="editor-actions">
                        <button className="editor-button editor-button--primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Entry'}</button>
                        <button className="editor-button" onClick={() => { setIsAdding(false); setNewItem(emptyItem); setShowPreview(false); }}>Cancel</button>
                        <button className="editor-button" onClick={() => setShowPreview(p => !p)} style={{ marginLeft: 'auto' }}>{showPreview ? 'Hide Preview' : '👁 Preview'}</button>
                    </div>
                </div>
            )}

            <div className="editor-list">
                {items.length === 0 ? (
                    <div className="editor-empty"><p>No entries yet. Add your first performance.</p></div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id} className="editor-list-item">
                            {editingItem?.id === item.id ? (
                                <div style={{ width: '100%' }}>
                                    {renderForm(editingItem, updated => setEditingItem({ ...updated, id: item.id }))}
                                    {showPreview && renderPreview(editingItem)}
                                    <div className="editor-actions" style={{ marginTop: '1rem' }}>
                                        <button className="editor-button editor-button--primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                                        <button className="editor-button" onClick={() => { setEditingItem(null); setShowPreview(false); }}>Cancel</button>
                                        <button className="editor-button" onClick={() => setShowPreview(p => !p)} style={{ marginLeft: 'auto' }}>{showPreview ? 'Hide Preview' : '👁 Preview'}</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="editor-list-item__content">
                                        <div className="editor-list-item__info">
                                            {item.type === 'video' && (
                                                <p style={{ fontSize: '0.78rem', color: item.platform === 'youtube' ? '#c00' : '#c13584', fontWeight: 600, marginBottom: '4px' }}>
                                                    {item.platform === 'youtube' ? '▶ YouTube' : '📷 Instagram'} Video
                                                </p>
                                            )}
                                            <h4>{item.venue}</h4>
                                            <p style={{ color: '#888', fontSize: '0.85rem', margin: '2px 0 0' }}>
                                                {item.city}
                                                {(item.month || item.year) && ` · ${[item.month, item.year].filter(Boolean).join(' ')}`}
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
