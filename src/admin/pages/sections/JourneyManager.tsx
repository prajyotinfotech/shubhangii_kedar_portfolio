import { useState, useEffect } from 'react';
import { fetchSection, updateSection, addItem, updateItem, deleteItem, uploadImage } from '../../api/client';
import RichTextField from '../../components/RichTextField';
import '../styles/editor.css';

interface JourneyStep {
    id: string;
    label: string;
    heading: string;
    subheading: string;
    body: string;
    highlights: string[];
}

interface JourneyMilestone {
    id: number;
    title: string;
    description: string;
    year: string;
    side: 'left' | 'right';
    color: string;
    image: string;
}

export default function JourneyManager() {
    const [steps, setSteps] = useState<JourneyStep[]>([]);
    const [milestones, setMilestones] = useState<JourneyMilestone[]>([]);
    const [pageHeader, setPageHeader] = useState({ title: 'The Tracklist', subtitle: 'Milestones that defined the sound' });
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
    const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
    const [editMilestone, setEditMilestone] = useState<Omit<JourneyMilestone, 'id'>>({
        title: '', description: '', year: '', side: 'left', color: '#667eea', image: ''
    });
    const [newMilestone, setNewMilestone] = useState({
        title: '',
        description: '',
        year: '',
        side: 'left' as 'left' | 'right',
        color: '#667eea',
        image: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const stepsData = await fetchSection('journeySteps');
            const milestonesData = await fetchSection('journeyMilestones');
            const pageData = await fetchSection('journeyPage').catch(() => null);
            if (pageData) setPageHeader(pageData);
            setSteps(stepsData || []);
            // Sort milestones by year ascending (earliest first)
            const sorted = (milestonesData || []).sort((a: JourneyMilestone, b: JourneyMilestone) => {
                const yearA = parseInt(a.year) || 0;
                const yearB = parseInt(b.year) || 0;
                return yearA - yearB;
            });
            setMilestones(sorted);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load journey content' });
        } finally {
            setLoading(false);
        }
    };

    const handleStepChange = (index: number, field: keyof JourneyStep, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const handleHighlightChange = (stepIdx: number, hIdx: number, value: string) => {
        const newSteps = [...steps];
        const newHighlights = [...newSteps[stepIdx].highlights];
        newHighlights[hIdx] = value;
        newSteps[stepIdx] = { ...newSteps[stepIdx], highlights: newHighlights };
        setSteps(newSteps);
    };

    const addHighlight = (stepIdx: number) => {
        const newSteps = [...steps];
        newSteps[stepIdx] = { ...newSteps[stepIdx], highlights: [...newSteps[stepIdx].highlights, 'New Highlight'] };
        setSteps(newSteps);
    };

    const removeHighlight = (stepIdx: number, hIdx: number) => {
        const newSteps = [...steps];
        newSteps[stepIdx] = { ...newSteps[stepIdx], highlights: newSteps[stepIdx].highlights.filter((_, i) => i !== hIdx) };
        setSteps(newSteps);
    };

    const handleSavePageHeader = async () => {
        setSaving(true);
        try {
            await updateSection('journeyPage', pageHeader);
            setMessage({ type: 'success', text: 'Page header saved!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to save page header' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSteps = async () => {
        setSaving(true);
        try {
            await updateSection('journeySteps', steps);
            setMessage({ type: 'success', text: 'Journey steps updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update steps' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddMilestone = async () => {
        if (!newMilestone.title || !newMilestone.year) {
            setMessage({ type: 'error', text: 'Title and year are required' });
            return;
        }
        setSaving(true);
        try {
            await addItem('journeyMilestones', { ...newMilestone, id: Date.now() });
            setNewMilestone({ title: '', description: '', year: '', side: 'left', color: '#667eea', image: '' });
            setIsAddingMilestone(false);
            await loadContent();
            setMessage({ type: 'success', text: 'Milestone added!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add milestone' });
        } finally {
            setSaving(false);
        }
    };

    const startEditMilestone = (m: JourneyMilestone) => {
        setEditingMilestoneId(m.id);
        setEditMilestone({
            title: m.title,
            description: m.description,
            year: m.year,
            side: m.side,
            color: m.color,
            image: m.image
        });
    };

    const handleSaveEditMilestone = async () => {
        if (editingMilestoneId === null) return;
        if (!editMilestone.title || !editMilestone.year) {
            setMessage({ type: 'error', text: 'Title and year are required' });
            return;
        }
        setSaving(true);
        try {
            await updateItem('journeyMilestones', editingMilestoneId.toString(), editMilestone);
            setEditingMilestoneId(null);
            await loadContent();
            setMessage({ type: 'success', text: 'Milestone updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update milestone' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const result = await uploadImage(file);
            const url = result.data.url;
            if (target === 'new') {
                setNewMilestone(prev => ({ ...prev, image: url }));
            } else {
                setEditMilestone(prev => ({ ...prev, image: url }));
            }
            setMessage({ type: 'success', text: 'Image uploaded!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMilestone = async (id: number | string) => {
        if (!confirm('Delete this milestone?')) return;
        try {
            await deleteItem('journeyMilestones', id.toString());
            await loadContent();
            setMessage({ type: 'success', text: 'Milestone deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete milestone' });
        }
    };

    if (loading) return <div className="editor-loading">Loading...</div>;

    return (
        <div className="editor-page">
            <div className="editor-header">
                <h1>Journey Management</h1>
                <p>Edit your home page story and detailed career milestones.</p>
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="editor-section">
                <h2>Journey Page Header</h2>
                <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: '1rem' }}>Title and subtitle shown at the top of the /journey page. Leave blank to hide.</p>
                <div className="editor-form">
                    <div className="editor-row">
                        <div className="editor-field">
                            <label>Page Title</label>
                            <input
                                value={pageHeader.title}
                                onChange={e => setPageHeader(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. The Tracklist"
                            />
                        </div>
                        <div className="editor-field">
                            <label>Page Subtitle</label>
                            <input
                                value={pageHeader.subtitle}
                                onChange={e => setPageHeader(p => ({ ...p, subtitle: e.target.value }))}
                                placeholder="e.g. Milestones that defined the sound"
                            />
                        </div>
                    </div>
                </div>
                <div className="editor-actions">
                    <button className="editor-button editor-button--primary" onClick={handleSavePageHeader} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Header'}
                    </button>
                </div>
            </div>

            <div className="editor-section">
                <h2>Home Page Journey (Chapters)</h2>
                <div className="editor-list">
                    {steps.map((step, idx) => (
                        <details key={step.id} className="editor-card" open={idx === 0}>
                            <summary style={{ cursor: 'pointer', outline: 'none', listStyle: 'none' }} className="editor-accordion-header">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <h3>{step.label || `Chapter ${idx + 1}`} - {step.heading || 'Untitled'}</h3>
                                    <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)' }}>▼</span>
                                </div>
                            </summary>

                            <div className="editor-form" style={{ marginTop: '1.5rem' }}>
                                <div className="editor-row">
                                    <div className="editor-field">
                                        <label>Chapter Label</label>
                                        <input value={step.label} onChange={(e) => handleStepChange(idx, 'label', e.target.value)} placeholder="e.g. Chapter 01" />
                                    </div>
                                    <div className="editor-field">
                                        <label>Heading</label>
                                        <input value={step.heading} onChange={(e) => handleStepChange(idx, 'heading', e.target.value)} />
                                    </div>
                                </div>

                                <div className="editor-field">
                                    <label>Subheading</label>
                                    <input value={step.subheading} onChange={(e) => handleStepChange(idx, 'subheading', e.target.value)} />
                                </div>

                                <RichTextField
                                    label="Body Text"
                                    value={step.body}
                                    onChange={(val) => handleStepChange(idx, 'body', val)}
                                />

                                <div className="editor-field">
                                    <label>Highlights (Bullet Points)</label>
                                    <div className="editor-list" style={{ gap: '0.5rem' }}>
                                        {step.highlights.map((h, hIdx) => (
                                            <div key={hIdx} className="editor-row" style={{ gridTemplateColumns: '1fr auto', gap: '8px' }}>
                                                <input value={h} onChange={(e) => handleHighlightChange(idx, hIdx, e.target.value)} />
                                                <button type="button" className="editor-button editor-button--danger editor-button--small" onClick={() => removeHighlight(idx, hIdx)}>x</button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="editor-button editor-button--small" style={{ marginTop: '8px', alignSelf: 'flex-start' }} onClick={() => addHighlight(idx)}>+ Add Highlight</button>
                                </div>
                            </div>
                        </details>
                    ))}
                </div>
                <div className="editor-actions">
                    <button className="editor-button editor-button--primary" onClick={handleSaveSteps} disabled={saving}>
                        {saving ? 'Saving...' : 'Save All Chapters'}
                    </button>
                </div>
            </div>

            <div className="editor-section" style={{ marginTop: '3rem' }}>
                <div className="editor-header">
                    <h2>Detailed Career Milestones (Vinyl Page)</h2>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Milestones are automatically sorted by year (earliest first).</p>
                    <button className="editor-button editor-button--primary" onClick={() => setIsAddingMilestone(true)}>+ Add Milestone</button>
                </div>

                {isAddingMilestone && (
                    <div className="editor-card">
                        <h3>New Milestone</h3>
                        <div className="editor-form">
                            <div className="editor-row">
                                <div className="editor-field"><label>Title*</label><input value={newMilestone.title} onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} /></div>
                                <div className="editor-field"><label>Year*</label><input value={newMilestone.year} onChange={(e) => setNewMilestone({ ...newMilestone, year: e.target.value })} /></div>
                            </div>
                            <RichTextField
                                label="Description"
                                value={newMilestone.description}
                                onChange={(val) => setNewMilestone({ ...newMilestone, description: val })}
                                rows={2}
                            />
                            <div className="editor-row">
                                <div className="editor-field"><label>Side</label><select value={newMilestone.side} onChange={(e) => setNewMilestone({ ...newMilestone, side: e.target.value as any })}><option value="left">Left</option><option value="right">Right</option></select></div>
                                <div className="editor-field"><label>Color</label><input type="color" value={newMilestone.color} onChange={(e) => setNewMilestone({ ...newMilestone, color: e.target.value })} /></div>
                                <div className="editor-field">
                                    <label>Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'new')} disabled={saving} style={{ marginBottom: '0.5rem' }} />
                                    <input value={newMilestone.image} onChange={(e) => setNewMilestone({ ...newMilestone, image: e.target.value })} placeholder="Or paste URL" />
                                    {newMilestone.image && <img src={newMilestone.image} alt="preview" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 6, marginTop: 4 }} />}
                                </div>
                            </div>
                            <div className="editor-actions">
                                <button className="editor-button editor-button--primary" onClick={handleAddMilestone} disabled={saving}>Add</button>
                                <button className="editor-button" onClick={() => setIsAddingMilestone(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="editor-list">
                    {milestones.map((m) => (
                        <div key={m.id} className="editor-card" style={{ marginBottom: '1rem' }}>
                            {editingMilestoneId === m.id ? (
                                /* ---- Edit Mode ---- */
                                <div className="editor-form">
                                    <h3 style={{ marginBottom: '1rem' }}>Editing: {m.title}</h3>
                                    <div className="editor-row">
                                        <div className="editor-field"><label>Title*</label><input value={editMilestone.title} onChange={(e) => setEditMilestone({ ...editMilestone, title: e.target.value })} /></div>
                                        <div className="editor-field"><label>Year*</label><input value={editMilestone.year} onChange={(e) => setEditMilestone({ ...editMilestone, year: e.target.value })} /></div>
                                    </div>
                                    <RichTextField
                                        label="Description"
                                        value={editMilestone.description}
                                        onChange={(val) => setEditMilestone({ ...editMilestone, description: val })}
                                        rows={3}
                                    />
                                    <div className="editor-row">
                                        <div className="editor-field"><label>Side</label><select value={editMilestone.side} onChange={(e) => setEditMilestone({ ...editMilestone, side: e.target.value as any })}><option value="left">Left</option><option value="right">Right</option></select></div>
                                        <div className="editor-field"><label>Color</label><input type="color" value={editMilestone.color} onChange={(e) => setEditMilestone({ ...editMilestone, color: e.target.value })} /></div>
                                        <div className="editor-field">
                                            <label>Image</label>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'edit')} disabled={saving} style={{ marginBottom: '0.5rem' }} />
                                            <input value={editMilestone.image} onChange={(e) => setEditMilestone({ ...editMilestone, image: e.target.value })} placeholder="Or paste URL" />
                                            {editMilestone.image && <img src={editMilestone.image} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 4 }} />}
                                        </div>
                                    </div>
                                    <div className="editor-actions">
                                        <button className="editor-button editor-button--primary" onClick={handleSaveEditMilestone} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                                        <button className="editor-button" onClick={() => setEditingMilestoneId(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                /* ---- View Mode ---- */
                                <div className="editor-list-item" style={{ border: 'none', padding: 0 }}>
                                    <div className="editor-list-item__content">
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>{m.year}</div>
                                        {m.image && <img src={m.image} alt={m.title} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                                        <div className="editor-list-item__info">
                                            <h4>{m.title}</h4>
                                            <p>{m.description?.slice(0, 100)}...</p>
                                        </div>
                                    </div>
                                    <div className="editor-list-item__actions">
                                        <button className="editor-button editor-button--small" onClick={() => startEditMilestone(m)}>Edit</button>
                                        <button className="editor-button editor-button--small editor-button--danger" onClick={() => handleDeleteMilestone(m.id)}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
