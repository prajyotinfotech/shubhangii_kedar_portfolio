/**
 * Social Links Editor
 */
import { useState, useEffect } from 'react';
import { fetchSection, addItem, deleteItem } from '../../api/client';
import '../styles/editor.css';

interface SocialLink {
    id: string;
    label: string;
    href: string;
    icon: string;
}

const iconOptions = ['spotify', 'youtube', 'instagram', 'twitter', 'facebook', 'mail'];

export default function SocialLinksEditor() {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newLink, setNewLink] = useState({ label: '', href: '', icon: 'spotify' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        try {
            const data = await fetchSection('socialLinks');
            setLinks(data || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load social links' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newLink.label || !newLink.href) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        setSaving(true);
        try {
            await addItem('socialLinks', newLink);
            setNewLink({ label: '', href: '', icon: 'spotify' });
            setIsAdding(false);
            await loadLinks();
            setMessage({ type: 'success', text: 'Link added!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add link' });
        } finally {
            setSaving(false);
        }
    };


    const handleDelete = async (id: string) => {
        if (!confirm('Delete this link?')) return;
        try {
            await deleteItem('socialLinks', id);
            await loadLinks();
            setMessage({ type: 'success', text: 'Link deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete link' });
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
                    <h1>Social Links</h1>
                    <p>Manage your social media links</p>
                </div>
                {!isAdding && (
                    <button
                        className="editor-button editor-button--primary"
                        onClick={() => setIsAdding(true)}
                    >
                        + Add Link
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
                    <h3>Add Social Link</h3>
                    <div className="editor-form">
                        <div className="editor-row editor-row--3">
                            <div className="editor-field">
                                <label>Icon</label>
                                <select
                                    value={newLink.icon}
                                    onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                                >
                                    {iconOptions.map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="editor-field">
                                <label>Label *</label>
                                <input
                                    type="text"
                                    value={newLink.label}
                                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                                    placeholder="Spotify"
                                />
                            </div>
                            <div className="editor-field">
                                <label>URL *</label>
                                <input
                                    type="text"
                                    value={newLink.href}
                                    onChange={(e) => setNewLink({ ...newLink, href: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="editor-actions">
                            <button
                                className="editor-button editor-button--primary"
                                onClick={handleAdd}
                                disabled={saving}
                            >
                                {saving ? 'Adding...' : 'Add Link'}
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
                {links.length === 0 ? (
                    <div className="editor-empty">
                        <p>No social links yet.</p>
                    </div>
                ) : (
                    links.map((link) => (
                        <div key={link.id} className="editor-list-item">
                            <div className="editor-list-item__content">
                                <div className="editor-list-item__info">
                                    <h4>{link.label}</h4>
                                    <p>{link.href}</p>
                                </div>
                            </div>
                            <div className="editor-list-item__actions">
                                <button
                                    className="editor-button editor-button--small editor-button--danger"
                                    onClick={() => handleDelete(link.id)}
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
