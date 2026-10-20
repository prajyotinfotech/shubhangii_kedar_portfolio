import React, { useState, useEffect } from 'react';
import { fetchSection, updateSection, uploadImage, uploadVideo, probeVideoFile, VIDEO_RECOMMENDED_MAX_BYTES, VIDEO_MAX_BYTES } from '../../api/client';

type MediaMode = 'image' | 'video';
const MB = 1024 * 1024;
import RichTextField from '../../components/RichTextField';
import '../styles/editor.css';

interface Slide {
    id: string;
    image: string;
    alt: string;
    heading: string[];
    subtitle: string;
    mobileImage?: string;
    video?: string;
}

interface PillStat {
    kind: 'youtube' | 'tracks' | 'instagram';
    top?: string;
    sub?: string;
    value: number;
    color: string;
    desktopSize?: string;
    mobileSize?: string;
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
    const [videoProgress, setVideoProgress] = useState<{ index: number; fraction: number } | null>(null);
    // Per-slide "Image or Video" choice. Derived from saved data on load; a slide
    // with a video URL is in video mode. Switching back to Image clears the video.
    const [mediaMode, setMediaMode] = useState<Record<string, MediaMode>>({});
    const modeFor = (slide: Slide): MediaMode => mediaMode[slide.id] ?? (slide.video ? 'video' : 'image');
    const setModeFor = (index: number, slide: Slide, mode: MediaMode) => {
        setMediaMode(prev => ({ ...prev, [slide.id]: mode }));
        if (mode === 'image' && slide.video) handleSlideChange(index, 'video', '');
    };

    useEffect(() => {
        loadContent();
    }, []);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        // Pre-flight in the browser: type, size and (if decodable) length, before any upload starts.
        if (!file.type.startsWith('video/')) {
            setMessage({ type: 'error', text: 'That is not a video file. Please choose an MP4.' });
            return;
        }
        if (file.size > VIDEO_MAX_BYTES) {
            setMessage({ type: 'error', text: `Video is ${(file.size / MB).toFixed(1)} MB. The maximum is ${Math.round(VIDEO_MAX_BYTES / MB)} MB; please compress it (HandBrake or ffmpeg) and try again.` });
            return;
        }
        const probe = await probeVideoFile(file);
        const dims = probe.width && probe.height ? `${probe.width}×${probe.height}` : '';
        const secs = probe.duration ? `${probe.duration.toFixed(1)} s` : '';

        setSaving(true);
        setMessage({ type: '', text: `Uploading ${[`${(file.size / MB).toFixed(1)} MB`, dims, secs].filter(Boolean).join(' · ')}…` });
        setVideoProgress({ index, fraction: 0 });
        try {
            const result = await uploadVideo(file, (fraction) => setVideoProgress({ index, fraction }));
            handleSlideChange(index, 'video', result.url);
            setMediaMode(prev => ({ ...prev, [content.slides[index].id]: 'video' }));
            const mb = (result.bytes / MB).toFixed(1);
            const heavy = result.bytes > VIDEO_RECOMMENDED_MAX_BYTES;
            const long = probe.duration != null && probe.duration > 20;
            const notes = [
                heavy ? `it is heavier than the recommended 8 MB, so phones will wait longer before the video replaces the poster` : '',
                long ? `it is ${probe.duration!.toFixed(0)} s long; a 8–15 s loop feels smoother` : ''
            ].filter(Boolean);
            setMessage({
                type: notes.length ? 'error' : 'success',
                text: notes.length
                    ? `Video uploaded (${mb} MB) but ${notes.join(', and ')}. It will work; consider re-exporting. Remember to Save.`
                    : `Video uploaded (${mb} MB${dims ? `, ${dims}` : ''}${secs ? `, ${secs}` : ''}). Remember to Save All Changes.`
            });
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to upload video' });
        } finally {
            setVideoProgress(null);
            setSaving(false);
        }
    };

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, field: 'image' | 'mobileImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const result = await uploadImage(file);
            handleSlideChange(index, field, result.data.url);
            setMessage({ type: 'success', text: 'Image uploaded successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setSaving(false);
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

            <div className={`editor-message editor-message--${message.type}`}>
                {message.text}
            </div>


            <form className="editor-form" onSubmit={handleSubmit}>
                <div className="editor-section">
                    <h3>Slides</h3>
                    <div className="editor-list">
                        {content.slides.map((slide, idx) => (
                            <details key={slide.id} className="editor-card" open={idx === 0}>
                                <summary style={{ cursor: 'pointer', outline: 'none', listStyle: 'none' }} className="editor-accordion-header">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {slide.image && <img src={slide.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                                            <h3>{slide.heading[0]?.replace(/<[^>]*>/g, '') || 'New Slide'}</h3>
                                        </div>
                                        <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)' }}>▼</span>
                                    </div>
                                </summary>

                                <div className="editor-form" style={{ marginTop: '1.5rem' }}>
                                    <div className="editor-field">
                                        <label>Alt Text</label>
                                        <input value={slide.alt} onChange={(e) => handleSlideChange(idx, 'alt', e.target.value)} />
                                    </div>

                                    <div className="editor-field">
                                        <label>Background</label>
                                        <div className="hero-media-toggle" role="radiogroup" aria-label="Background type">
                                            {(['image', 'video'] as MediaMode[]).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={modeFor(slide) === mode}
                                                    className={`hero-media-toggle__btn${modeFor(slide) === mode ? ' is-active' : ''}`}
                                                    onClick={() => setModeFor(idx, slide, mode)}
                                                    disabled={saving}
                                                >
                                                    {mode === 'image' ? '🖼 Image' : '🎬 Video'}
                                                </button>
                                            ))}
                                            <span className="editor-hint" style={{ margin: 0 }}>
                                                {modeFor(slide) === 'image'
                                                    ? 'Still photo. Max 4 MB per image.'
                                                    : 'Looping muted clip. MP4, max 25 MB (2–5 MB ideal).'}
                                            </span>
                                        </div>
                                    </div>

                                    {modeFor(slide) === 'video' && (
                                        <div className="editor-field hero-media-video">
                                            <label>Video file</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <input
                                                    type="file"
                                                    accept="video/mp4,video/webm,video/quicktime"
                                                    onChange={(e) => handleVideoUpload(e, idx)}
                                                    disabled={saving}
                                                    id={`slide-video-${idx}`}
                                                    hidden
                                                />
                                                <label htmlFor={`slide-video-${idx}`} className="editor-button editor-button--small" style={{ margin: 0 }}>
                                                    {videoProgress?.index === idx
                                                        ? `Uploading ${Math.round(videoProgress.fraction * 100)}%`
                                                        : slide.video ? 'Replace Video' : 'Upload Video'}
                                                </label>
                                                <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                                                <input
                                                    value={slide.video || ''}
                                                    onChange={(e) => handleSlideChange(idx, 'video', e.target.value)}
                                                    placeholder="Video URL (.mp4)"
                                                    style={{ flex: 1, minWidth: '200px' }}
                                                />
                                                {slide.video && (
                                                    <button
                                                        type="button"
                                                        className="editor-button editor-button--danger editor-button--small"
                                                        style={{ margin: 0 }}
                                                        onClick={() => handleSlideChange(idx, 'video', '')}
                                                    >
                                                        Remove video
                                                    </button>
                                                )}
                                            </div>
                                            {videoProgress?.index === idx && (
                                                <div className="hero-media-progress" aria-hidden="true">
                                                    <span style={{ width: `${Math.round(videoProgress.fraction * 100)}%` }} />
                                                </div>
                                            )}
                                            <p className="editor-hint" style={{ marginTop: '0.5rem' }}>
                                                Best: MP4 (H.264), 1920×1080 or 1280×720, 8–15 s, no audio, <strong>2–5 MB</strong>. Recommended max 8 MB; hard limit 25 MB.
                                                Uploads go straight to Cloudinary, which also compresses it for delivery.
                                            </p>
                                            {slide.video && (
                                                <video
                                                    src={slide.video}
                                                    poster={slide.image || undefined}
                                                    muted
                                                    loop
                                                    playsInline
                                                    controls
                                                    preload="metadata"
                                                    style={{ marginTop: '0.75rem', width: '100%', maxWidth: '360px', borderRadius: '8px', background: '#000' }}
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className="editor-row">
                                        <div className="editor-field">
                                            <label>{modeFor(slide) === 'video' ? 'Poster Image (shown while the video loads)' : 'Desktop Image'}</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, idx, 'image')}
                                                    disabled={saving}
                                                    style={{ width: 'auto' }}
                                                    id={`slide-img-${idx}`}
                                                    hidden
                                                />
                                                <label htmlFor={`slide-img-${idx}`} className="editor-button editor-button--small" style={{ margin: 0 }}>Upload</label>
                                                <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                                                <input
                                                    value={slide.image}
                                                    onChange={(e) => handleSlideChange(idx, 'image', e.target.value)}
                                                    placeholder="Image URL"
                                                    style={{ flex: 1 }}
                                                />
                                            </div>
                                        </div>
                                        {modeFor(slide) === 'image' && (
                                            <div className="editor-field">
                                                <label>Mobile Image (Optional)</label>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, idx, 'mobileImage')}
                                                        disabled={saving}
                                                        style={{ width: 'auto' }}
                                                        id={`slide-mob-${idx}`}
                                                        hidden
                                                    />
                                                    <label htmlFor={`slide-mob-${idx}`} className="editor-button editor-button--small" style={{ margin: 0 }}>Upload</label>
                                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>OR</span>
                                                    <input
                                                        value={slide.mobileImage || ''}
                                                        onChange={(e) => handleSlideChange(idx, 'mobileImage', e.target.value)}
                                                        placeholder="URL"
                                                        style={{ flex: 1 }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="editor-field">
                                        <label>Heading Lines</label>
                                        <div className="editor-list" style={{ gap: '1rem' }}>
                                            {slide.heading.map((line, lIdx) => (
                                                <div key={lIdx} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'start' }}>
                                                    <RichTextField
                                                        label={`Line ${lIdx + 1}`}
                                                        value={line}
                                                        onChange={(val) => handleHeadingChange(idx, lIdx, val)}
                                                        rows={2}
                                                        defaultStyles={{
                                                            fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
                                                            fontSize: '60px',
                                                            fontWeight: '700'
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="editor-button editor-button--danger editor-button--small"
                                                        style={{ marginTop: '28px' }}
                                                        onClick={() => {
                                                            const newHeading = slide.heading.filter((_, i) => i !== lIdx);
                                                            handleSlideChange(idx, 'heading', newHeading);
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className="editor-button editor-button--small"
                                                onClick={() => handleSlideChange(idx, 'heading', [...slide.heading, 'New Line'])}
                                            >
                                                + Add Line
                                            </button>
                                        </div>
                                    </div>

                                    <RichTextField
                                        label="Subtitle (Note: Styles disable typing animation)"
                                        value={slide.subtitle}
                                        onChange={(val) => handleSlideChange(idx, 'subtitle', val)}
                                        rows={2}
                                    />

                                    <div className="editor-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button type="button" className="editor-button editor-button--danger" onClick={() => removeSlide(idx)}>Remove Slide</button>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <button type="button" className="editor-button" onClick={addSlide}>+ Add New Slide</button>
                    </div>
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
                                    <label>Desktop Font Size (e.g. 2rem)</label>
                                    <input value={pill.desktopSize || ''} onChange={(e) => handlePillChange(idx, 'desktopSize', e.target.value)} placeholder="Default: 2rem" />
                                </div>
                                <div className="editor-field">
                                    <label>Mobile Font Size (e.g. 1.5rem)</label>
                                    <input value={pill.mobileSize || ''} onChange={(e) => handlePillChange(idx, 'mobileSize', e.target.value)} placeholder="Default: 1.5rem" />
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
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

