/**
 * Gallery Manager
 * Add, edit, and delete gallery items
 */
import { useState, useEffect } from 'react';
import { fetchSection, updateSection, addItem, deleteItem, uploadImage } from '../../api/client';
import '../styles/editor.css';

interface GalleryItem {
    id: string;
    title: string;
    description: string;
    image: string;
    videoUrl?: string;
    embedCode?: string;
    platform?: 'instagram' | 'youtube';
    gradient: [string, string];
    aspect: string;
    type?: 'image' | 'video';
}

const emptyItem: Omit<GalleryItem, 'id'> = {
    title: '',
    description: '',
    image: '',
    videoUrl: '',
    embedCode: '',
    platform: 'instagram',
    gradient: ['#667eea', '#764ba2'],
    aspect: 'square',
    type: 'image'
};

const getYouTubeEmbedUrl = (url: string) => {
    try {
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)([^&?/]+)|youtu\.be\/([^&?/]+))/)
        const videoId = match?.[1] || match?.[2]
        if (videoId) return `https://www.youtube.com/embed/${videoId}`
    } catch { /* ignore */ }
    return ''
}

const renderGalleryPreview = (item: Partial<GalleryItem>) => {
    const aspect = item.aspect || '1/1'
    const ytEmbed = item.type === 'video' && item.platform === 'youtube' && item.videoUrl
        ? getYouTubeEmbedUrl(item.videoUrl) : ''

    return (
        <div style={{ background: '#0d0d0d', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Site Preview</p>
            <div style={{ maxWidth: '260px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                {ytEmbed ? (
                    <div style={{ aspectRatio: aspect }}>
                        <iframe src={ytEmbed} width="100%" height="100%"
                            style={{ border: 'none', display: 'block' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen title={item.title || 'Preview'} />
                    </div>
                ) : item.type === 'video' && item.platform === 'instagram' ? (
                    <div style={{ aspectRatio: aspect, background: 'linear-gradient(135deg,#E1306C,#F77737)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#fff' }}>📷</div>
                ) : item.image ? (
                    <img src={item.image} alt={item.title || ''} style={{ width: '100%', aspectRatio: aspect, objectFit: 'cover', display: 'block' }} />
                ) : (
                    <div style={{ aspectRatio: aspect, background: `linear-gradient(135deg, ${item.gradient?.[0] || '#667eea'}, ${item.gradient?.[1] || '#764ba2'})` }} />
                )}
                {/* overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '1rem 0.75rem 0.75rem' }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{item.title || <span style={{ color: '#666' }}>Title</span>}</div>
                    {item.description && <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', marginTop: '2px' }}>{item.description}</div>}
                </div>
            </div>
        </div>
    );
};

export default function GalleryManager() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState(emptyItem);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const confirmDelete = (item: GalleryItem) => {
        console.log('Delete button clicked for item:', item.id);
        handleDelete(item.id);
    };

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await fetchSection('gallery');
            // Auto-repair: Check for missing IDs and fix
            if (data && Array.isArray(data)) {
                let hasChanges = false;
                const repairedData = data.map((item: any) => {
                    if (!item.id) {
                        hasChanges = true;
                        return { ...item, id: crypto.randomUUID() };
                    }
                    return item;
                });

                if (hasChanges) {
                    console.log('Repaired missing IDs:', repairedData);
                    await updateSection('gallery', repairedData);
                    setItems(repairedData);
                    setMessage({ type: 'success', text: 'Repaired legacy items (IDs assigned)' });
                } else {
                    setItems(data);
                }
            } else {
                setItems([]);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load gallery' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const isImageType = !newItem.type || newItem.type === 'image';

        if (isImageType) {
            const imageCount = items.filter(i => i.type !== 'video').length;
            if (imageCount >= 12) {
                setMessage({ type: 'error', text: 'Image limit reached (12 max). Please delete some images to add new ones.' });
                return;
            }
            if (!newItem.image) {
                setMessage({ type: 'error', text: 'Please upload an image or provide an image URL before adding.' });
                return;
            }
        }

        setSaving(true);
        try {
            await addItem('gallery', newItem);
            setNewItem(emptyItem);
            setIsAdding(false);
            await loadItems();
            setMessage({ type: 'success', text: 'Gallery item added!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add item' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;

        setSaving(true);
        try {
            const updatedItems = items.map(i =>
                i.id === editingItem.id ? editingItem : i
            );
            await updateSection('gallery', updatedItems);
            setEditingItem(null);
            await loadItems();
            setMessage({ type: 'success', text: 'Gallery item updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update item' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        console.log('Delete function called with ID:', id);
        console.log('ID type:', typeof id);
        console.log('ID value:', id);

        if (!id) {
            console.error('Delete failed: No ID provided');
            setMessage({ type: 'error', text: 'Error: Item has no ID' });
            return;
        }

        console.log('Sending DELETE request to /api/content/gallery/items/' + id);

        try {
            console.log('Calling deleteItem API...');
            const response = await deleteItem('gallery', id);
            console.log('Delete API response:', JSON.stringify(response, null, 2));

            console.log('Reloading gallery items...');
            await loadItems();
            console.log('Items reloaded successfully');

            setMessage({ type: 'success', text: 'Item deleted successfully!' });
            console.log('Delete operation completed');
        } catch (err) {
            console.error('Delete failed with error:', err);
            console.error('Error details:', JSON.stringify(err, null, 2));
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
            setMessage({ type: 'error', text: `Delete failed: ${errorMessage}` });
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const reordered = [...items];
        [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        setItems(reordered);
        try {
            await updateSection('gallery', reordered);
            setMessage({ type: 'success', text: 'Order updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update order' });
            await loadItems(); // Reload on error
        }
    };

    const handleMoveDown = async (index: number) => {
        if (index === items.length - 1) return;
        const reordered = [...items];
        [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        setItems(reordered);
        try {
            await updateSection('gallery', reordered);
            setMessage({ type: 'success', text: 'Order updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update order' });
            await loadItems(); // Reload on error
        }
    };

    // Add test button temporarily
    useEffect(() => {
        console.log('GalleryManager loaded. Items count:', items.length);
        console.log('Available items:', items.map(item => ({ id: item.id, title: item.title })));
    }, [items]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (item: any) => void, currentItem: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image too large (max 4MB). Please compress or resize the image before uploading.' });
            e.target.value = '';
            return;
        }

        setSaving(true);
        try {
            const result = await uploadImage(file);
            onChange({ ...currentItem, image: result.data.url });
            setMessage({ type: 'success', text: 'Image uploaded successfully!' });
        } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            setMessage({ type: 'error', text: msg || 'Failed to upload image. Please try again.' });
            e.target.value = '';
        } finally {
            setSaving(false);
        }
    };

    const renderForm = (item: Partial<GalleryItem>, onChange: (item: any) => void) => {
        const gradient = item.gradient || ['#667eea', '#764ba2'];
        const aspect = item.aspect || 'square';
        const type = item.type || 'image';
        const platform = item.platform || 'instagram';

        return (
            <div className="editor-form">
                <div className="editor-row editor-row--2">
                    <div className="editor-field">
                        <label>Type</label>
                        <select
                            value={type}
                            onChange={(e) => onChange({ ...item, type: e.target.value as 'image' | 'video' })}
                        >
                            <option value="image">Image</option>
                            <option value="video">Video (Instagram/YouTube)</option>
                        </select>
                    </div>
                    {type === 'video' && (
                        <div className="editor-field">
                            <label>Platform</label>
                            <select
                                value={platform}
                                onChange={(e) => onChange({ ...item, platform: e.target.value as 'instagram' | 'youtube' })}
                            >
                                <option value="instagram">Instagram</option>
                                <option value="youtube">YouTube</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="editor-field">
                    <label>Title</label>
                    <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => onChange({ ...item, title: e.target.value })}
                        placeholder="Performance Title"
                    />
                </div>


                {type === 'video' && platform === 'instagram' ? (
                    <div className="editor-field">
                        <label>Instagram URL (simpler)</label>
                        <input
                            type="text"
                            value={item.videoUrl || ''}
                            onChange={(e) => onChange({ ...item, videoUrl: e.target.value })}
                            placeholder="https://www.instagram.com/p/... or https://www.instagram.com/reel/..."
                        />
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>Paste the Instagram post/reel URL - works better than embed codes</p>
                        <div style={{ marginTop: '8px', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>OR use embed code:</label>
                            <textarea
                                value={item.embedCode || ''}
                                onChange={(e) => onChange({ ...item, embedCode: e.target.value })}
                                placeholder='Paste the full embed code from Instagram (the <blockquote> snippet)'
                                rows={4}
                                style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '4px', width: '100%' }}
                            />
                        </div>
                    </div>
                ) : type === 'video' && platform === 'youtube' ? (
                    <div className="editor-field">
                        <label>YouTube Video URL</label>
                        <input
                            type="text"
                            value={item.videoUrl || ''}
                            onChange={(e) => onChange({ ...item, videoUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>Paste the YouTube video URL</p>
                    </div>
                ) : type === 'image' ? (
                    <div className="editor-field">
                        <label>Image</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, onChange, item)}
                                disabled={saving}
                                style={{ width: 'auto' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                            <input
                                type="text"
                                value={item.image || ''}
                                onChange={(e) => onChange({ ...item, image: e.target.value })}
                                placeholder="Image URL"
                                style={{ flex: 1 }}
                            />
                        </div>
                        {item.image && (
                            <div className="editor-preview">
                                <img src={item.image} alt="Preview" />
                            </div>
                        )}
                    </div>
                ) : null}

                <div className="editor-field">
                    <label>Description</label>
                    <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => onChange({ ...item, description: e.target.value })}
                        placeholder="Brief description"
                    />
                </div>

                <div className="editor-row editor-row--3">
                    <div className="editor-field">
                        <label>Aspect Ratio</label>
                        <input
                            type="text"
                            value={aspect}
                            onChange={(e) => onChange({ ...item, aspect: e.target.value })}
                            placeholder="e.g. 16/9 or 4/5"
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {[
                                { label: '1/1', title: 'Square' },
                                { label: '4/5', title: 'Portrait (Instagram)' },
                                { label: '3/4', title: 'Portrait photo' },
                                { label: '2/3', title: 'Portrait 35mm' },
                                { label: '9/16', title: 'Story / Reel' },
                                { label: '4/3', title: 'Landscape' },
                                { label: '3/2', title: 'Landscape 35mm' },
                                { label: '16/9', title: 'Widescreen' },
                                { label: '21/9', title: 'Cinematic' },
                            ].map(preset => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    title={preset.title}
                                    onClick={() => onChange({ ...item, aspect: preset.label })}
                                    style={{
                                        padding: '3px 8px',
                                        fontSize: '0.78rem',
                                        border: aspect === preset.label ? '2px solid #764ba2' : '1px solid #ccc',
                                        borderRadius: '4px',
                                        background: aspect === preset.label ? '#f3ecff' : '#fff',
                                        cursor: 'pointer',
                                        fontWeight: aspect === preset.label ? 600 : 400,
                                    }}
                                >
                                    {preset.label}
                                    <span style={{ fontSize: '0.68rem', color: '#888', marginLeft: '4px' }}>{preset.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="editor-field">
                        <label>Gradient Start</label>
                        <input
                            type="color"
                            value={gradient[0]}
                            onChange={(e) => onChange({ ...item, gradient: [e.target.value, gradient[1]] })}
                        />
                    </div>
                    <div className="editor-field">
                        <label>Gradient End</label>
                        <input
                            type="color"
                            value={gradient[1]}
                            onChange={(e) => onChange({ ...item, gradient: [gradient[0], e.target.value] })}
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="editor-loading">
                <div className="editor-spinner"></div>
                <p>Loading gallery...</p>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Gallery</h1>
                    <p>Manage your photo gallery</p>
                </div>
                {!isAdding && (
                    <button
                        className="editor-button editor-button--primary"
                        onClick={() => setIsAdding(true)}
                    >
                        + Add Gallery Item
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {isAdding && (
                <div className="editor-card">
                    <h3>Add New Gallery Item</h3>
                    {renderForm(newItem, setNewItem)}
                    {showPreview && renderGalleryPreview(newItem)}
                    <div className="editor-actions" style={{ marginTop: '1rem' }}>
                        <button className="editor-button editor-button--primary" onClick={handleAdd} disabled={saving}>
                            {saving ? 'Adding...' : 'Add to Gallery'}
                        </button>
                        <button className="editor-button" onClick={() => { setIsAdding(false); setNewItem(emptyItem); setShowPreview(false); }}>
                            Cancel
                        </button>
                        <button className="editor-button" onClick={() => setShowPreview(p => !p)} style={{ marginLeft: 'auto' }}>
                            {showPreview ? 'Hide Preview' : '👁 Preview'}
                        </button>
                    </div>
                </div>
            )}

            <div className="editor-list">
                {items.length === 0 ? (
                    <div className="editor-empty">
                        <p>No gallery items yet. Add your first item!</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id} className="editor-list-item">
                            {editingItem?.id === item.id ? (
                                <div style={{ width: '100%' }}>
                                    {renderForm(editingItem, setEditingItem as any)}
                                    {showPreview && renderGalleryPreview(editingItem)}
                                    <div className="editor-actions" style={{ marginTop: '1rem' }}>
                                        <button className="editor-button editor-button--primary" onClick={handleUpdate} disabled={saving}>
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button className="editor-button" onClick={() => { setEditingItem(null); setShowPreview(false); }}>
                                            Cancel
                                        </button>
                                        <button className="editor-button" onClick={() => setShowPreview(p => !p)} style={{ marginLeft: 'auto' }}>
                                            {showPreview ? 'Hide Preview' : '👁 Preview'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="editor-list-item__content">
                                        {item.type === 'video' ? (
                                            <div
                                                className="editor-list-item__image"
                                                style={{
                                                    background: item.platform === 'youtube'
                                                        ? `linear-gradient(135deg, #FF0000, #CC0000)`
                                                        : `linear-gradient(135deg, #E1306C, #F77737)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '2rem'
                                                }}
                                            >
                                                {item.platform === 'youtube' ? '▶️' : '🎥'}
                                            </div>
                                        ) : item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="editor-list-item__image"
                                            />
                                        ) : (
                                            <div
                                                className="editor-list-item__image"
                                                style={{
                                                    background: `linear-gradient(135deg, ${item.gradient?.[0] || '#667eea'}, ${item.gradient?.[1] || '#764ba2'})`
                                                }}
                                            />
                                        )}
                                        <div className="editor-list-item__info">
                                            <h4>{item.title}</h4>
                                            <p>
                                                {item.type === 'video' ? (item.platform === 'youtube' ? 'YouTube Video' : 'Instagram Reel') : 'Image'} • {item.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="editor-list-item__actions">
                                        <button
                                            className="editor-button editor-button--small"
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            title="Move up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            className="editor-button editor-button--small"
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === items.length - 1}
                                            title="Move down"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            className="editor-button editor-button--small"
                                            onClick={() => setEditingItem({ ...item })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="editor-button editor-button--small editor-button--danger"
                                            onClick={() => confirmDelete(item)}
                                        >
                                            Delete
                                        </button>
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
