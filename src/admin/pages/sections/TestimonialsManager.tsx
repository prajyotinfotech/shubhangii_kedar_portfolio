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
}

export default function TestimonialsManager() {
    const [items, setItems] = useState<Testimonial[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ quote: '', author: '' });
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
        if (!newItem.quote || !newItem.author) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
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
                            <label>Quote *</label>
                            <textarea
                                value={newItem.quote}
                                onChange={(e) => setNewItem({ ...newItem, quote: e.target.value })}
                                placeholder='"A voice that lingers..."'
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
                                    <h4 style={{ fontStyle: 'italic', fontWeight: 400 }}>{item.quote}</h4>
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
