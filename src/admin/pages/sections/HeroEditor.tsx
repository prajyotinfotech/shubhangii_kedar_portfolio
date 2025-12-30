import React, { useState, useEffect } from 'react';
import { fetchSection, updateSection } from '../../api/client';
import '../styles/editor.css';

interface Slide {
    id: string;
    image: string;
    alt: string;
    heading: string[];
    subtitle: string;
    mobileImage?: string;
}

interface PillStat {
    kind: 'youtube' | 'tracks' | 'instagram';
    top?: string;
    sub?: string;
    value: number;
    color: string;
}

interface HeroContent {
    slides: Slide[];
    pills: PillStat[];
}

export default function HeroEditor() {
    const [content, setContent] = useState<HeroContent>({
        slides: [],
        pills: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const data = await fetchSection('hero');
            setContent(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load hero content' });
        } finally {
            setLoading(false);
        }
    };

    const handleSlideChange = (index: number, field: keyof Slide, value: any) => {
        const newSlides = [...content.slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setContent(prev => ({ ...prev, slides: newSlides }));
    };

    const handleHeadingChange = (slideIndex: number, lineIndex: number, value: string) => {
        const newSlides = [...content.slides];
        const newHeading = [...newSlides[slideIndex].heading];
        newHeading[lineIndex] = value;
        newSlides[slideIndex] = { ...newSlides[slideIndex], heading: newHeading };
        setContent(prev => ({ ...prev, slides: newSlides }));
    };

    const addSlide = () => {
        setContent(prev => ({
            ...prev,
            slides: [...prev.slides, {
                id: `slide-${Date.now()}`,
                image: '',
                alt: 'New slide',
                heading: ['New Heading'],
                subtitle: 'New subtitle'
            }]
        }));
    };

    const removeSlide = (index: number) => {
        setContent(prev => ({
            ...prev,
            slides: prev.slides.filter((_, i) => i !== index)
        }));
    };

    const handlePillChange = (index: number, field: keyof PillStat, value: any) => {
        const newPills = [...content.pills];
        newPills[index] = { ...newPills[index], [field]: value };
        setContent(prev => ({ ...prev, pills: newPills }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateSection('hero', content);
            setMessage({ type: 'success', text: 'Hero section updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update hero section' });
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
                <h1>Hero Section Editor</h1>
                <p>Manage home page slides and platform stats.</p>
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            <form className="editor-form" onSubmit={handleSubmit}>
                <div className="editor-section">
                    <h3>Slides</h3>
                    {content.slides.map((slide, idx) => (
                        <div key={slide.id} className="editor-item-box">
                            <div className="editor-field">
                                <label>Alt Text</label>
                                <input value={slide.alt} onChange={(e) => handleSlideChange(idx, 'alt', e.target.value)} />
                            </div>
                            <div className="editor-field">
                                <label>Image Path/URL</label>
                                <input value={slide.image} onChange={(e) => handleSlideChange(idx, 'image', e.target.value)} />
                            </div>
                            <div className="editor-field">
                                <label>Heading Lines</label>
                                {slide.heading.map((line, lIdx) => (
                                    <input
                                        key={lIdx}
                                        value={line}
                                        onChange={(e) => handleHeadingChange(idx, lIdx, e.target.value)}
                                        style={{ marginBottom: '8px' }}
                                    />
                                ))}
                            </div>
                            <div className="editor-field">
                                <label>Subtitle</label>
                                <textarea
                                    value={slide.subtitle}
                                    onChange={(e) => handleSlideChange(idx, 'subtitle', e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <button type="button" className="editor-button editor-button--danger" onClick={() => removeSlide(idx)}>Remove Slide</button>
                        </div>
                    ))}
                    <button type="button" className="editor-button" onClick={addSlide}>+ Add Slide</button>
                </div>

                <div className="editor-section">
                    <h3>Platform Stats (Pills)</h3>
                    {content.pills.map((pill, idx) => (
                        <div key={idx} className="editor-item-box">
                            <div className="editor-row">
                                <div className="editor-field">
                                    <label>Platform (youtube/tracks/instagram)</label>
                                    <input value={pill.kind} onChange={(e) => handlePillChange(idx, 'kind', e.target.value)} />
                                </div>
                                <div className="editor-field">
                                    <label>Top Label</label>
                                    <input value={pill.top} onChange={(e) => handlePillChange(idx, 'top', e.target.value)} />
                                </div>
                                <div className="editor-field">
                                    <label>Value</label>
                                    <input type="number" value={pill.value} onChange={(e) => handlePillChange(idx, 'value', parseInt(e.target.value))} />
                                </div>
                            </div>
                            <div className="editor-row">
                                <div className="editor-field">
                                    <label>Color</label>
                                    <input type="color" value={pill.color} onChange={(e) => handlePillChange(idx, 'color', e.target.value)} />
                                </div>
                                <div className="editor-field">
                                    <label>Sub Label</label>
                                    <input value={pill.sub} onChange={(e) => handlePillChange(idx, 'sub', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
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

