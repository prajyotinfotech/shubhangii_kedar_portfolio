import React, { useState, useEffect } from 'react';
import { fetchSection, updateSection, uploadImage } from '../../api/client';
import RichTextField from '../../components/RichTextField';
import '../styles/editor.css';

interface Metric {
    id: string;
    category: string;
    label: string;
    value: number;
    display: string;
    accent: string;
    icon: string;
}

interface AboutContent {
    title: string;
    description: string;
    descriptionSecondary: string;
    image: string;
    imageAspect?: string;
    stats: { label: string; value: number }[];
    show: {
        title: string;
        description: string;
    };
    performanceBanner: {
        cities: string;
        footfall: string;
        fontSize?: string;
        fontFamily?: string;
    };
    metrics: Metric[];
    achievements: string[];
}

export default function AboutEditor() {
    const [content, setContent] = useState<AboutContent>({
        title: '',
        description: '',
        descriptionSecondary: '',
        image: '',
        imageAspect: '4/5',
        stats: [],
        show: { title: '', description: '' },
        performanceBanner: { cities: '', footfall: '', fontSize: '1.4rem', fontFamily: '' },
        metrics: [],
        achievements: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const data = await fetchSection('about');
            setContent(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load about content' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setContent(prev => ({
                ...prev,
                [parent]: { ...((prev as any)[parent]), [child]: value }
            }));
        } else {
            setContent(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMetricChange = (index: number, field: keyof Metric, value: string | number) => {
        const newMetrics = [...content.metrics];
        newMetrics[index] = { ...newMetrics[index], [field]: value };
        setContent(prev => ({ ...prev, metrics: newMetrics }));
    };

    const handleAchievementChange = (index: number, value: string) => {
        const newAchievements = [...content.achievements];
        newAchievements[index] = value;
        setContent(prev => ({ ...prev, achievements: newAchievements }));
    };

    const addAchievement = () => {
        setContent(prev => ({
            ...prev,
            achievements: [...prev.achievements, 'New Achievement']
        }));
    };

    const removeAchievement = (index: number) => {
        setContent(prev => ({
            ...prev,
            achievements: prev.achievements.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const result = await uploadImage(file);
            setContent(prev => ({ ...prev, image: result.data.url }));
            setMessage({ type: 'success', text: 'Image uploaded!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateSection('about', content);
            setMessage({ type: 'success', text: 'About section updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update about section' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="editor-loading">Loading...</div>;
    }

    return (
        <div className="editor-page">
            <div className="editor-header">
                <h1>About Section Editor</h1>
                <p>Manage your biography, performance metrics, and achievements.</p>
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            <form className="editor-form" onSubmit={handleSubmit}>
                <div className="editor-section">
                    <h3>General Info</h3>
                    <div className="editor-field">
                        <label>Section Title</label>
                        <input name="title" value={content.title} onChange={handleChange} />
                    </div>
                    <RichTextField
                        label="Bio Paragraph 1"
                        value={content.description}
                        onChange={(val: string) => handleChange({ target: { name: 'description', value: val } } as any)}
                        rows={4}
                    />
                    <RichTextField
                        label="Bio Paragraph 2"
                        value={content.descriptionSecondary}
                        onChange={(val: string) => handleChange({ target: { name: 'descriptionSecondary', value: val } } as any)}
                        rows={4}
                    />
                </div>

                <div className="editor-section">
                    <h3>Profile Image</h3>
                    <div className="editor-field">
                        <label>Upload Image</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={saving}
                                style={{ width: 'auto' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                            <input
                                type="text"
                                name="image"
                                value={content.image}
                                onChange={handleChange}
                                placeholder="Image URL"
                                style={{ flex: 1, minWidth: '200px' }}
                            />
                        </div>
                        {content.image && (
                            <div className="editor-preview" style={{ marginTop: '0.75rem' }}>
                                <img src={content.image} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px' }} />
                            </div>
                        )}
                    </div>
                    <div className="editor-field">
                        <label>Aspect Ratio</label>
                        <input
                            type="text"
                            name="imageAspect"
                            value={content.imageAspect || '4/5'}
                            onChange={handleChange}
                            placeholder="e.g. 4/5 or 1/1"
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {[
                                { label: '1/1', title: 'Square' },
                                { label: '4/5', title: 'Portrait (Instagram)' },
                                { label: '3/4', title: 'Portrait photo' },
                                { label: '2/3', title: 'Portrait 35mm' },
                                { label: '9/16', title: 'Story / Reel' },
                                { label: '4/3', title: 'Landscape' },
                                { label: '3/2', title: 'Landscape 35mm' },
                                { label: '16/9', title: 'Widescreen' },
                            ].map(preset => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    title={preset.title}
                                    onClick={() => setContent(prev => ({ ...prev, imageAspect: preset.label }))}
                                    style={{
                                        padding: '3px 8px',
                                        fontSize: '0.78rem',
                                        border: (content.imageAspect || '4/5') === preset.label ? '2px solid #764ba2' : '1px solid #ccc',
                                        borderRadius: '4px',
                                        background: (content.imageAspect || '4/5') === preset.label ? '#f3ecff' : '#fff',
                                        cursor: 'pointer',
                                        fontWeight: (content.imageAspect || '4/5') === preset.label ? 600 : 400,
                                        color: '#333',
                                    }}
                                >
                                    {preset.label}
                                    <span style={{ fontSize: '0.68rem', color: '#888', marginLeft: '4px' }}>{preset.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="editor-section">
                    <h3>Performance Banner</h3>
                    <div className="editor-row">
                        <div className="editor-field">
                            <label>Cities Text</label>
                            <input name="performanceBanner.cities" value={content.performanceBanner.cities} onChange={handleChange} placeholder="e.g. 25+ CITIES" />
                        </div>
                        <div className="editor-field">
                            <label>Footfall Text</label>
                            <input name="performanceBanner.footfall" value={content.performanceBanner.footfall} onChange={handleChange} placeholder="e.g. 30,000+ FOOTFALL" />
                        </div>
                    </div>
                    <div className="editor-row">
                        <div className="editor-field">
                            <label>Font Size</label>
                            <select name="performanceBanner.fontSize" value={content.performanceBanner.fontSize || '1.4rem'} onChange={handleChange as any}>
                                <option value="1rem">Small (1rem)</option>
                                <option value="1.2rem">Medium (1.2rem)</option>
                                <option value="1.4rem">Large (1.4rem)</option>
                                <option value="1.8rem">X-Large (1.8rem)</option>
                                <option value="2.2rem">XX-Large (2.2rem)</option>
                                <option value="2.8rem">Huge (2.8rem)</option>
                            </select>
                        </div>
                        <div className="editor-field">
                            <label>Font Family</label>
                            <select name="performanceBanner.fontFamily" value={content.performanceBanner.fontFamily || ''} onChange={handleChange as any}>
                                <option value="">Default (inherit)</option>
                                <option value="'Georgia', serif">Georgia (Serif)</option>
                                <option value="'Playfair Display', serif">Playfair Display</option>
                                <option value="'Oswald', sans-serif">Oswald</option>
                                <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
                                <option value="'Montserrat', sans-serif">Montserrat</option>
                                <option value="'Poppins', sans-serif">Poppins</option>
                            </select>
                        </div>
                    </div>
                    {content.performanceBanner.cities && (
                        <div style={{ marginTop: '1rem', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                            <label style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginBottom: 8 }}>Preview</label>
                            <p style={{ fontSize: content.performanceBanner.fontSize || '1.4rem', fontFamily: content.performanceBanner.fontFamily || 'inherit', margin: 0 }}>
                                <strong>PERFORMED ACROSS <span style={{ color: '#1DB954' }}>{content.performanceBanner.cities}</span> WITH</strong>
                                <br />
                                <strong style={{ color: '#1DB954' }}>{content.performanceBanner.footfall}</strong>
                            </p>
                        </div>
                    )}
                </div>

                <div className="editor-section">
                    <h3>The Show</h3>
                    <div className="editor-field">
                        <label>Show Title</label>
                        <input name="show.title" value={content.show.title} onChange={handleChange} />
                    </div>
                    <div className="editor-field">
                        <label>Show Description</label>
                        <textarea name="show.description" value={content.show.description} onChange={handleChange} rows={3} />
                    </div>
                </div>

                <div className="editor-section">
                    <h3>Social Metrics</h3>
                    {content.metrics.map((metric, idx) => (
                        <div key={metric.id} className="editor-item-box">
                            <div className="editor-row">
                                <div className="editor-field">
                                    <label>Category</label>
                                    <input value={metric.category} onChange={(e) => handleMetricChange(idx, 'category', e.target.value)} />
                                </div>
                                <div className="editor-field">
                                    <label>Label</label>
                                    <input value={metric.label} onChange={(e) => handleMetricChange(idx, 'label', e.target.value)} />
                                </div>
                                <div className="editor-field">
                                    <label>Value</label>
                                    <input type="number" value={metric.value} onChange={(e) => handleMetricChange(idx, 'value', parseInt(e.target.value))} />
                                </div>
                            </div>
                            <div className="editor-row">
                                <div className="editor-field">
                                    <label>Display String</label>
                                    <input value={metric.display} onChange={(e) => handleMetricChange(idx, 'display', e.target.value)} />
                                </div>
                                <div className="editor-field">
                                    <label>Accent Color</label>
                                    <input type="color" value={metric.accent} onChange={(e) => handleMetricChange(idx, 'accent', e.target.value)} />
                                </div>
                                <div className="editor-field">
                                    <label>Icon (Slug)</label>
                                    <input value={metric.icon} onChange={(e) => handleMetricChange(idx, 'icon', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="editor-section">
                    <h3>Achievements</h3>
                    {content.achievements.map((achievement, idx) => (
                        <div key={idx} className="editor-row editor-item-row">
                            <input value={achievement} onChange={(e) => handleAchievementChange(idx, e.target.value)} />
                            <button type="button" className="editor-button editor-button--danger" onClick={() => removeAchievement(idx)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" className="editor-button" onClick={addAchievement}>+ Add Achievement</button>
                </div>

                <div className="editor-actions">
                    <button type="submit" className="editor-button editor-button--primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
