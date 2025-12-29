/**
 * Music Manager
 * Manage music releases
 */
import { useState, useEffect } from 'react';
import { fetchSection, addItem, deleteItem } from '../../api/client';
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
}

const emptyRelease: Omit<MusicRelease, 'id'> = {
    title: '',
    meta: '',
    gradient: ['#667eea', '#764ba2'],
    coverImage: '',
    links: []
};

export default function MusicManager() {
    const [releases, setReleases] = useState<MusicRelease[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newRelease, setNewRelease] = useState(emptyRelease);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadReleases();
    }, []);

    const loadReleases = async () => {
        try {
            const data = await fetchSection('musicReleases');
            setReleases(data || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load music' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newRelease.title) {
            setMessage({ type: 'error', text: 'Please enter a title' });
            return;
        }

        setSaving(true);
        try {
            await addItem('musicReleases', newRelease);
            setNewRelease(emptyRelease);
            setIsAdding(false);
            await loadReleases();
            setMessage({ type: 'success', text: 'Release added!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add release' });
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
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete release' });
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
                    <h1>Music Releases</h1>
                    <p>Manage your music catalog</p>
                </div>
                {!isAdding && (
                    <button
                        className="editor-button editor-button--primary"
                        onClick={() => setIsAdding(true)}
                    >
                        + Add Release
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
                    <h3>Add Music Release</h3>
                    <div className="editor-form">
                        <div className="editor-row">
                            <div className="editor-field">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={newRelease.title}
                                    onChange={(e) => setNewRelease({ ...newRelease, title: e.target.value })}
                                    placeholder="Song Title"
                                />
                            </div>
                            <div className="editor-field">
                                <label>Meta Info</label>
                                <input
                                    type="text"
                                    value={newRelease.meta}
                                    onChange={(e) => setNewRelease({ ...newRelease, meta: e.target.value })}
                                    placeholder="Single • 2024"
                                />
                            </div>
                        </div>
                        <div className="editor-field">
                            <label>Cover Image URL</label>
                            <input
                                type="text"
                                value={newRelease.coverImage}
                                onChange={(e) => setNewRelease({ ...newRelease, coverImage: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="editor-row">
                            <div className="editor-field">
                                <label>Gradient Start</label>
                                <input
                                    type="color"
                                    value={newRelease.gradient[0]}
                                    onChange={(e) => setNewRelease({ ...newRelease, gradient: [e.target.value, newRelease.gradient[1]] })}
                                />
                            </div>
                            <div className="editor-field">
                                <label>Gradient End</label>
                                <input
                                    type="color"
                                    value={newRelease.gradient[1]}
                                    onChange={(e) => setNewRelease({ ...newRelease, gradient: [newRelease.gradient[0], e.target.value] })}
                                />
                            </div>
                        </div>
                        <div className="editor-actions">
                            <button
                                className="editor-button editor-button--primary"
                                onClick={handleAdd}
                                disabled={saving}
                            >
                                {saving ? 'Adding...' : 'Add Release'}
                            </button>
                            <button
                                className="editor-button"
                                onClick={() => { setIsAdding(false); setNewRelease(emptyRelease); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="editor-list">
                {releases.length === 0 ? (
                    <div className="editor-empty">
                        <p>No music releases yet.</p>
                    </div>
                ) : (
                    releases.map((release) => (
                        <div key={release.id} className="editor-list-item">
                            <div className="editor-list-item__content">
                                <div
                                    className="editor-list-item__image"
                                    style={{
                                        background: release.coverImage
                                            ? `url(${release.coverImage}) center/cover`
                                            : `linear-gradient(135deg, ${release.gradient[0]}, ${release.gradient[1]})`
                                    }}
                                />
                                <div className="editor-list-item__info">
                                    <h4>{release.title}</h4>
                                    <p>{release.meta}</p>
                                </div>
                            </div>
                            <div className="editor-list-item__actions">
                                <button
                                    className="editor-button editor-button--small editor-button--danger"
                                    onClick={() => handleDelete(release.id)}
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
