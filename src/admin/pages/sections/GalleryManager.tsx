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
    aspect: 'tall' | 'wide' | 'square';
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

export default function GalleryManager() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState(emptyItem);
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
        if (!newItem.title) {
            setMessage({ type: 'error', text: 'Please enter a title' });
            return;
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

        // Check if user is logged in
        const token = localStorage.getItem('admin_token');
        console.log('Admin token exists:', !!token);
        if (!token) {
            console.error('No authentication token found');
            setMessage({ type: 'error', text: 'Please login again' });
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

        setSaving(true);
        try {
            const result = await uploadImage(file);
            onChange({ ...currentItem, image: result.data.url });
            setMessage({ type: 'success', text: 'Image uploaded successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
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
                    <label>Title *</label>
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
                        <select
                            value={aspect}
                            onChange={(e) => onChange({ ...item, aspect: e.target.value as 'tall' | 'extra-tall' | 'wide' | 'square' })}
                        >
                            <option value="square">Square</option>
                            <option value="tall">Tall</option>
                            <option value="extra-tall">Extra Tall (Best for Instagram Posts)</option>
                            <option value="wide">Wide</option>
                        </select>
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
                    <div className="editor-actions" style={{ marginTop: '1rem' }}>
                        <button
                            className="editor-button editor-button--primary"
                            onClick={handleAdd}
                            disabled={saving}
                        >
                            {saving ? 'Adding...' : 'Add to Gallery'}
                        </button>
                        <button
                            className="editor-button"
                            onClick={() => { setIsAdding(false); setNewItem(emptyItem); }}
                        >
                            Cancel
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
                                    <div className="editor-actions" style={{ marginTop: '1rem' }}>
                                        <button
                                            className="editor-button editor-button--primary"
                                            onClick={handleUpdate}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            className="editor-button"
                                            onClick={() => setEditingItem(null)}
                                        >
                                            Cancel
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
