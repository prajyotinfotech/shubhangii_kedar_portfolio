/**
 * Testimonials Manager
 */
import { useState, useEffect } from 'react';
import { fetchSection, addItem, deleteItem } from '../../api/client';
import '../styles/editor.css';

interface Testimonial {
    id: string;
    quote: string;
    author: string;
    type?: 'text' | 'video';
    platform?: 'youtube' | 'instagram';
    videoUrl?: string;
}

export default function TestimonialsManager() {
    const [items, setItems] = useState<Testimonial[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<Omit<Testimonial, 'id'>>({ quote: '', author: '', type: 'text', platform: 'youtube', videoUrl: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await fetchSection('testimonials');
            setItems(data || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load testimonials' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.author) {
            setMessage({ type: 'error', text: 'Please fill in the author field' });
            return;
        }
        if (newItem.type === 'video' && !newItem.videoUrl) {
            setMessage({ type: 'error', text: 'Please enter a video URL' });
            return;
        }
        if (newItem.type !== 'video' && !newItem.quote) {
            setMessage({ type: 'error', text: 'Please fill in the quote field' });
            return;
        }

        setSaving(true);
        try {
            await addItem('testimonials', newItem);
            setNewItem({ quote: '', author: '' });
            setIsAdding(false);
            await loadItems();
            setMessage({ type: 'success', text: 'Testimonial added!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add testimonial' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this testimonial?')) return;
        try {
            await deleteItem('testimonials', id);
            await loadItems();
            setMessage({ type: 'success', text: 'Testimonial deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete testimonial' });
        }
    };

    if (loading) {
        return (
            <div className="editor-loading">
                <div className="editor-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Testimonials</h1>
                    <p>Manage reviews and quotes</p>
                </div>
                {!isAdding && (
                    <button
                        className="editor-button editor-button--primary"
                        onClick={() => setIsAdding(true)}
                    >
                        + Add Testimonial
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
                    <h3>Add Testimonial</h3>
                    <div className="editor-form">
                        <div className="editor-field">
                            <label>Type</label>
                            <select
                                value={newItem.type || 'text'}
                                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'text' | 'video' })}
                            >
                                <option value="text">Text Review</option>
                                <option value="video">Video Review (YouTube / Instagram)</option>
                            </select>
                        </div>
                        {newItem.type === 'video' && (
                            <>
                                <div className="editor-field">
                                    <label>Platform</label>
                                    <select
                                        value={newItem.platform || 'youtube'}
                                        onChange={(e) => setNewItem({ ...newItem, platform: e.target.value as 'youtube' | 'instagram' })}
                                    >
                                        <option value="youtube">YouTube</option>
                                        <option value="instagram">Instagram</option>
                                    </select>
                                </div>
                                <div className="editor-field">
                                    <label>Video URL *</label>
                                    <input
                                        type="text"
                                        value={newItem.videoUrl || ''}
                                        onChange={(e) => setNewItem({ ...newItem, videoUrl: e.target.value })}
                                        placeholder={newItem.platform === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://www.instagram.com/reel/...'}
                                    />
                                </div>
                            </>
                        )}
                        <div className="editor-field">
                            <label>{newItem.type === 'video' ? 'Caption (optional)' : 'Quote *'}</label>
                            <textarea
                                value={newItem.quote}
                                onChange={(e) => setNewItem({ ...newItem, quote: e.target.value })}
                                placeholder={newItem.type === 'video' ? 'Optional caption shown below the video' : '"A voice that lingers..."'}
                                rows={3}
                            />
                        </div>
                        <div className="editor-field">
                            <label>Author *</label>
                            <input
                                type="text"
                                value={newItem.author}
                                onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
                                placeholder="SoundWave Magazine"
                            />
                        </div>
                        <div className="editor-actions">
                            <button
                                className="editor-button editor-button--primary"
                                onClick={handleAdd}
                                disabled={saving}
                            >
                                {saving ? 'Adding...' : 'Add Testimonial'}
                            </button>
                            <button
                                className="editor-button"
                                onClick={() => setIsAdding(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="editor-list">
                {items.length === 0 ? (
                    <div className="editor-empty">
                        <p>No testimonials yet.</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="editor-list-item">
                            <div className="editor-list-item__content">
                                <div className="editor-list-item__info">
                                    {item.type === 'video' && (
                                        <p style={{ fontSize: '0.78rem', color: item.platform === 'youtube' ? '#c00' : '#c13584', fontWeight: 600, marginBottom: '4px' }}>
                                            {item.platform === 'youtube' ? '▶ YouTube' : '📷 Instagram'} Video
                                        </p>
                                    )}
                                    {item.quote && <h4 style={{ fontStyle: 'italic', fontWeight: 400 }}>{item.quote}</h4>}
                                    {item.type === 'video' && item.videoUrl && (
                                        <p style={{ fontSize: '0.8rem', color: '#888', wordBreak: 'break-all' }}>{item.videoUrl}</p>
                                    )}
                                    <p>— {item.author}</p>
                                </div>
                            </div>
                            <div className="editor-list-item__actions">
                                <button
                                    className="editor-button editor-button--small editor-button--danger"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
