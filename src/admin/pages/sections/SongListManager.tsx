/**
 * Song List Manager
 * Manually manage a list of songs with platform links
 */
import { useState, useEffect } from 'react';
import { fetchSection, addItem, deleteItem, updateSection, uploadImage } from '../../api/client';
import '../styles/editor.css';

interface SongItem {
    id: string;
    title: string;
    artist?: string;
    thumbnail?: string;
    spotifyUrl?: string;
    youtubeUrl?: string;
    instaUrl?: string;
}

const emptyItem: Omit<SongItem, 'id'> = {
    title: '',
    artist: '',
    thumbnail: '',
    spotifyUrl: '',
    youtubeUrl: '',
    instaUrl: '',
};

export default function SongListManager() {
    const [items, setItems] = useState<SongItem[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState(emptyItem);
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
            await loadItems();
            setMessage({ type: 'success', text: 'Song added!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to add song' });
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

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const result = await uploadImage(file);
            setNewItem(prev => ({ ...prev, thumbnail: result.data.url }));
            setMessage({ type: 'success', text: 'Thumbnail uploaded!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload thumbnail' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="editor-loading"><div className="editor-spinner"></div><p>Loading...</p></div>;
    }

    return (
        <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Song List</h1>
                    <p>Manage your discography — shown as a compact track list on the site</p>
                </div>
                {!isAdding && (
                    <button className="editor-button editor-button--primary" onClick={() => setIsAdding(true)}>
                        + Add Song
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>{message.text}</div>
            )}

            {isAdding && (
                <div className="editor-card">
                    <h3>Add Song</h3>
                    <div className="editor-form">
                        <div className="editor-row">
                            <div className="editor-field">
                                <label>Song Title *</label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="Song name"
                                />
                            </div>
                            <div className="editor-field">
                                <label>Artist / Credit</label>
                                <input
                                    type="text"
                                    value={newItem.artist || ''}
                                    onChange={(e) => setNewItem({ ...newItem, artist: e.target.value })}
                                    placeholder="Shubhangii Kedar"
                                />
                            </div>
                        </div>
                        <div className="editor-field">
                            <label>Thumbnail</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={saving} style={{ width: 'auto' }} />
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                                <input
                                    type="text"
                                    value={newItem.thumbnail || ''}
                                    onChange={(e) => setNewItem({ ...newItem, thumbnail: e.target.value })}
                                    placeholder="Image URL"
                                    style={{ flex: 1, minWidth: '180px' }}
                                />
                            </div>
                            {newItem.thumbnail && (
                                <img src={newItem.thumbnail} alt="thumb" style={{ marginTop: '8px', width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                            )}
                        </div>
                        <div className="editor-row editor-row--3">
                            <div className="editor-field">
                                <label>Spotify URL</label>
                                <input
                                    type="text"
                                    value={newItem.spotifyUrl || ''}
                                    onChange={(e) => setNewItem({ ...newItem, spotifyUrl: e.target.value })}
                                    placeholder="https://open.spotify.com/..."
                                />
                            </div>
                            <div className="editor-field">
                                <label>YouTube URL</label>
                                <input
                                    type="text"
                                    value={newItem.youtubeUrl || ''}
                                    onChange={(e) => setNewItem({ ...newItem, youtubeUrl: e.target.value })}
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                            <div className="editor-field">
                                <label>Instagram URL</label>
                                <input
                                    type="text"
                                    value={newItem.instaUrl || ''}
                                    onChange={(e) => setNewItem({ ...newItem, instaUrl: e.target.value })}
                                    placeholder="https://instagram.com/p/..."
                                />
                            </div>
                        </div>
                        <div className="editor-actions">
                            <button className="editor-button editor-button--primary" onClick={handleAdd} disabled={saving}>
                                {saving ? 'Adding...' : 'Add Song'}
                            </button>
                            <button className="editor-button" onClick={() => { setIsAdding(false); setNewItem(emptyItem); }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="editor-list">
                {items.length === 0 ? (
                    <div className="editor-empty"><p>No songs yet. Add your first song!</p></div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id} className="editor-list-item">
                            <div className="editor-list-item__content">
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.title} className="editor-list-item__image" style={{ borderRadius: '6px' }} />
                                ) : (
                                    <div className="editor-list-item__image" style={{ background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>♪</div>
                                )}
                                <div className="editor-list-item__info">
                                    <h4>{index + 1}. {item.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                        {item.artist && <span>{item.artist} &nbsp;</span>}
                                        {item.spotifyUrl && <span style={{ color: '#1DB954' }}>Spotify </span>}
                                        {item.youtubeUrl && <span style={{ color: '#FF0000' }}>YouTube </span>}
                                        {item.instaUrl && <span style={{ color: '#E1306C' }}>Instagram</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="editor-list-item__actions">
                                <button className="editor-button editor-button--small" onClick={() => handleMoveUp(index)} disabled={index === 0} title="Move up">↑</button>
                                <button className="editor-button editor-button--small" onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} title="Move down">↓</button>
                                <button className="editor-button editor-button--small editor-button--danger" onClick={() => handleDelete(item.id)}>Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
