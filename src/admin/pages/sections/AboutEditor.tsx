import React, { useState, useEffect } from 'react';
import { fetchSection, updateSection } from '../../api/client';
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
    stats: { label: string; value: number }[];
    show: {
        title: string;
        description: string;
    };
    performanceBanner: {
        cities: string;
        footfall: string;
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
        stats: [],
        show: { title: '', description: '' },
        performanceBanner: { cities: '', footfall: '' },
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
                    <h3>Performance Banner</h3>
                    <div className="editor-row">
                        <div className="editor-field">
                            <label>Cities Text</label>
                            <input name="performanceBanner.cities" value={content.performanceBanner.cities} onChange={handleChange} />
                        </div>
                        <div className="editor-field">
                            <label>Footfall Text</label>
                            <input name="performanceBanner.footfall" value={content.performanceBanner.footfall} onChange={handleChange} />
                        </div>
                    </div>
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
