/**
 * Brands Manager — "Brands we've worked with"
 * No sliders or size controls: the grid is fixed and every logo is
 * normalised into one square canvas on upload (services/logoNormalize.ts).
 */
import { useState, useEffect } from 'react';
import { fetchSection, addItem, deleteItem, updateSection, uploadImage } from '../../api/client';
import { toBrand, isHttpUrl, type Brand, type StoredBrand } from '../../../data/brands';
import { normalizeLogoFile } from '../../../services/logoNormalize';
import { BrandsGrid } from '../../../components/Brands';
import '../../../components/Brands.css';
import '../styles/editor.css';

type Draft = Omit<Brand, 'id'>;

const emptyBrand: Draft = { name: '', image: '', url: '' };

// Pure: strip blanks; a non-http(s) link is never written to the draft.
const cleanDraft = (d: Draft): Draft => ({
    name: d.name.trim(),
    ...(d.image ? { image: d.image } : {}),
    ...(d.url && isHttpUrl(d.url) ? { url: d.url.trim() } : {}),
});

export default function BrandsManager() {
    const [items, setItems] = useState<Brand[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<Draft>(emptyBrand);
    const [editingItem, setEditingItem] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => { loadItems(); }, []);

    const loadItems = async () => {
        try {
            const data: StoredBrand[] = await fetchSection('brands');
            setItems((data || []).map(toBrand));
        } catch {
            setItems([]); // section doesn't exist yet
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.name.trim()) { setMessage({ type: 'error', text: 'Brand name is required' }); return; }
        setSaving(true);
        try {
            await addItem('brands', cleanDraft(newItem));
            setNewItem(emptyBrand);
            setIsAdding(false);
            await loadItems();
            setMessage({ type: 'success', text: 'Brand added!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to add brand' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        if (!editingItem.name.trim()) { setMessage({ type: 'error', text: 'Brand name is required' }); return; }
        setSaving(true);
        try {
            const updated = items.map(i => i.id === editingItem.id ? { ...cleanDraft(editingItem), id: editingItem.id } : i);
            await updateSection('brands', updated);
            setEditingItem(null);
            await loadItems();
            setMessage({ type: 'success', text: 'Brand updated!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update brand' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        if (!confirm('Remove this brand?')) return;
        try {
            await deleteItem('brands', id);
            await loadItems();
            setMessage({ type: 'success', text: 'Brand removed' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to remove brand' });
        }
    };

    const move = async (from: number, to: number) => {
        if (to < 0 || to >= items.length) return;
        const reordered = [...items];
        [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
        setItems(reordered);
        try { await updateSection('brands', reordered); }
        catch { await loadItems(); }
    };

    // Upload: normalise to the square canvas, then send the PNG to Cloudinary.
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (d: Draft) => void, current: Draft) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setSaving(true);
        try {
            const png = await normalizeLogoFile(file);
            const result = await uploadImage(png);
            onChange({ ...current, image: result.data.url });
            setMessage({ type: 'success', text: 'Logo uploaded and normalised!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to process logo — use a PNG/JPG/WebP file' });
        } finally {
            setSaving(false);
        }
    };

    const renderForm = (item: Draft, onChange: (d: Draft) => void) => {
        const badUrl = !!item.url && !isHttpUrl(item.url);
        return (
            <div className="editor-form">
                <div className="editor-field">
                    <label>Name *</label>
                    <input type="text" value={item.name} onChange={e => onChange({ ...item, name: e.target.value })} placeholder="e.g. Zee Marathi" />
                </div>
                <div className="editor-field">
                    <label>Link (optional)</label>
                    <input type="url" value={item.url || ''} onChange={e => onChange({ ...item, url: e.target.value })} placeholder="https://..." />
                    {badUrl && <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '4px' }}>Must start with http:// or https:// — it will not be saved until it does.</p>}
                </div>
                <div className="editor-field">
                    <label>Logo</label>
                    <input type="file" accept="image/*" onChange={e => handleLogoUpload(e, onChange, item)} disabled={saving} />
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                        Transparent PNG works best. It is auto-cropped and centred into a square so all logos match.
                    </p>
                    {item.image && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                            <div style={{ width: 96, height: 96, background: 'transparent', borderRadius: 12, overflow: 'hidden' }}>
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <button type="button" className="editor-button editor-button--small" onClick={() => onChange({ ...item, image: '' })}>Remove logo</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) return <div className="editor-loading"><div className="editor-spinner"></div><p>Loading...</p></div>;

    return (
        <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Brands</h1>
                    <p>Logos shown under Achievements. Order here is the order on the site.</p>
                </div>
                {!isAdding && !editingItem && (
                    <button className="editor-button editor-button--primary" onClick={() => setIsAdding(true)}>+ Add Brand</button>
                )}
            </div>

            {message.text && <div className={`editor-message editor-message--${message.type}`}>{message.text}</div>}

            {isAdding && (
                <div className="editor-card">
                    <h3>Add Brand</h3>
                    {renderForm(newItem, setNewItem)}
                    <div className="editor-actions">
                        <button className="editor-button editor-button--primary" onClick={handleAdd} disabled={saving}>{saving ? 'Working...' : 'Add Brand'}</button>
                        <button className="editor-button" onClick={() => { setIsAdding(false); setNewItem(emptyBrand); }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="editor-list">
                {items.length === 0 ? (
                    <div className="editor-empty"><p>No brands yet. Add your first one.</p></div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id || index} className="editor-list-item">
                            {editingItem && editingItem.id === item.id ? (
                                <div style={{ width: '100%' }}>
                                    {renderForm(editingItem, updated => setEditingItem({ ...updated, id: item.id }))}
                                    <div className="editor-actions" style={{ marginTop: '1rem' }}>
                                        <button className="editor-button editor-button--primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                                        <button className="editor-button" onClick={() => setEditingItem(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="editor-list-item__content" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: 56, height: 56, flex: '0 0 auto', background: 'transparent', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.7rem' }}>
                                            {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : 'no logo'}
                                        </div>
                                        <div className="editor-list-item__info">
                                            <h4>{item.name}</h4>
                                            <p>{item.url ? item.url : 'No link'}</p>
                                        </div>
                                    </div>
                                    <div className="editor-list-item__actions">
                                        <button className="editor-button editor-button--small" onClick={() => move(index, index - 1)} disabled={index === 0} title="Move up">↑</button>
                                        <button className="editor-button editor-button--small" onClick={() => move(index, index + 1)} disabled={index === items.length - 1} title="Move down">↓</button>
                                        <button className="editor-button editor-button--small" onClick={() => setEditingItem({ ...item })}>Edit</button>
                                        <button className="editor-button editor-button--small editor-button--danger" onClick={() => handleDelete(item.id)}>Delete</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {items.length > 0 && (
                <div className="editor-card" style={{ marginTop: '1.5rem' }}>
                    <h3>Site preview</h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: '0 0 12px' }}>Desktop (6 per row) and phone (3 per row) as visitors will see it.</p>
                    <div className="brands" style={{ padding: 0, background: 'transparent' }}>
                        <div className="container" style={{ maxWidth: 'none', padding: 0 }} data-testid="brands-preview-desktop">
                            <BrandsGrid brands={items} />
                        </div>
                    </div>
                    <div className="brands" style={{ padding: 0, background: 'transparent', marginTop: '1.5rem' }}>
                        <div className="container" style={{ maxWidth: 297, padding: 0, margin: 0 }} data-testid="brands-preview-phone">
                            <BrandsGrid brands={items} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
