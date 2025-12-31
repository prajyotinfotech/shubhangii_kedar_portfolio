import { useState, useEffect } from 'react';
import { fetchSection, updateSection, addItem, deleteItem } from '../../api/client';
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
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
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
            setSteps(stepsData || []);
            setMilestones(milestonesData || []);
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
                                                <button type="button" className="editor-button editor-button--danger editor-button--small" onClick={() => removeHighlight(idx, hIdx)}>×</button>
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
                                <div className="editor-field"><label>Image URL</label><input value={newMilestone.image} onChange={(e) => setNewMilestone({ ...newMilestone, image: e.target.value })} /></div>
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
                        <div key={m.id} className="editor-list-item">
                            <div className="editor-list-item__content">
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>{m.year}</div>
                                <div className="editor-list-item__info">
                                    <h4>{m.title}</h4>
                                    <p>{m.description?.slice(0, 100)}...</p>
                                </div>
                            </div>
                            <div className="editor-list-item__actions">
                                <button className="editor-button editor-button--small editor-button--danger" onClick={() => handleDeleteMilestone(m.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

