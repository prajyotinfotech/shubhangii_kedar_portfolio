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
    gradient: [string, string];
    aspect: 'tall' | 'wide' | 'square';
}

const emptyItem: Omit<GalleryItem, 'id'> = {
    title: '',
    description: '',
    image: '',
    gradient: ['#667eea', '#764ba2'],
    aspect: 'square'
};

export default function GalleryManager() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState(emptyItem);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await fetchSection('gallery');
            setItems(data || []);
        } catch (err) {
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
        try {
            await deleteItem('gallery', id);
            await loadItems();
            setMessage({ type: 'success', text: 'Item deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete item' });
        }
    };

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

        return (
            <div className="editor-form">
                <div className="editor-field">
                    <label>Title *</label>
                    <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => onChange({ ...item, title: e.target.value })}
                        placeholder="Performance Title"
                    />
                </div>
                <div className="editor-field">
                    <label>Description</label>
                    <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => onChange({ ...item, description: e.target.value })}
                        placeholder="Brief description"
                    />
                </div>
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
                <div className="editor-row editor-row--3">
                    <div className="editor-field">
                        <label>Aspect Ratio</label>
                        <select
                            value={aspect}
                            onChange={(e) => onChange({ ...item, aspect: e.target.value as 'tall' | 'wide' | 'square' })}
                        >
                            <option value="square">Square</option>
                            <option value="tall">Tall</option>
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
                        + Add Photo
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
                    <h3>Add Photo</h3>
                    {renderForm(newItem, setNewItem)}
                    <div className="editor-actions" style={{ marginTop: '1rem' }}>
                        <button
                            className="editor-button editor-button--primary"
                            onClick={handleAdd}
                            disabled={saving}
                        >
                            {saving ? 'Adding...' : 'Add Photo'}
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
                        <p>No gallery items yet. Add your first photo!</p>
                    </div>
                ) : (
                    items.map((item) => (
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
                                        {item.image ? (
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
                                            <p>{item.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <div className="editor-list-item__actions">
                                        <button
                                            className="editor-button editor-button--small"
                                            onClick={() => setEditingItem({ ...item })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="editor-button editor-button--small editor-button--danger"
                                            onClick={() => {
                                                if (window.confirm('Delete this gallery item?')) {
                                                    handleDelete(item.id);
                                                }
                                            }}
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
