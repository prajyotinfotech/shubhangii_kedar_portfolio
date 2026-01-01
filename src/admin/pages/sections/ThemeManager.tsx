import React, { useState, useEffect } from 'react';
import { fetchSection, updateSection, uploadImage } from '../../api/client';

interface ThemeData {
    logoImage?: string;
    logoSize?: number;
    logoPosition?: number;
    primaryColor?: string;
    fonts?: {
        heading?: { family: string; size?: string; weight?: number; style?: string };
        body?: { family: string; size?: string; weight?: number; style?: string };
        availableFonts?: string[];
    };
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
        dark: string;
        light: string;
    };
}

const emptyTheme: ThemeData = {
    logoImage: '',
    logoSize: 48,
    logoPosition: -20,
    primaryColor: '#1DB954',
    fonts: {
        heading: { family: 'Playfair Display', size: '2.5rem', weight: 700 },
        body: { family: 'Poppins', size: '1rem', weight: 400 },
        availableFonts: ['Playfair Display', 'Poppins', 'Montserrat', 'Dancing Script', 'Pacifico']
    },
    colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#ff6b35',
        dark: '#1a1a1a',
        light: '#ffffff'
    }
};

export default function ThemeManager() {
    const [theme, setTheme] = useState<ThemeData>(emptyTheme);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const data = await fetchSection('theme');
            if (data) {
                setTheme(data);
            }
        } catch (err) {
            console.log('Theme not found, using defaults');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateSection('theme', theme);
            setMessage({ type: 'success', text: 'Theme settings saved successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save theme settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const result = await uploadImage(file);
            setTheme(prev => ({ ...prev, logoImage: result.data.url }));
            setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload logo' });
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveLogo = () => {
        setTheme(prev => ({ ...prev, logoImage: '' }));
        setMessage({ type: 'success', text: 'Logo removed' });
    };

    if (loading) {
        return (
            <div className="editor-loading">
                <div className="editor-spinner"></div>
                <p>Loading theme settings...</p>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                `}
            </style>
            <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Theme Settings</h1>
                    <p>Manage logo image and theme customization</p>
                </div>
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="editor-card glow-card">
                <h3>Brand Colors</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Customize your site's primary theme color</p>

                <div className="editor-field">
                    <label>Primary Theme Color</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            position: 'relative',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}>
                            <input
                                type="color"
                                value={theme.primaryColor || '#1DB954'}
                                onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                                style={{
                                    width: '80px',
                                    height: '50px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                value={theme.primaryColor || '#1DB954'}
                                onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                                placeholder="#1DB954"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                                Used for buttons, links, highlights, and accents throughout the site
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '1rem',
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h4 style={{
                        margin: '0 0 1rem 0',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: '600'
                    }}>
                        Color Preview
                    </h4>
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <button
                            style={{
                                padding: '0.875rem 1.75rem',
                                background: theme.primaryColor || '#1DB954',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 4px 15px ${theme.primaryColor || '#1DB954'}40`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 6px 20px ${theme.primaryColor || '#1DB954'}60`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 4px 15px ${theme.primaryColor || '#1DB954'}40`;
                            }}
                        >
                            Primary Button
                        </button>
                        <div style={{
                            padding: '0.875rem 1.75rem',
                            border: `2px solid ${theme.primaryColor || '#1DB954'}`,
                            color: theme.primaryColor || '#1DB954',
                            borderRadius: '10px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            background: 'transparent',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${theme.primaryColor || '#1DB954'}10`;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >
                            Outlined Button
                        </div>
                        <span style={{
                            color: theme.primaryColor || '#1DB954',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${theme.primaryColor || '#1DB954'}10`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                        >
                            Link Text
                        </span>
                    </div>
                </div>
            </div>

            <div className="editor-card glow-card">
                <h3>Logo Configuration</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Upload and customize your navbar logo</p>

                <div className="editor-field">
                    <label>Upload Logo Image</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={saving}
                            style={{ flex: '1', minWidth: '200px' }}
                        />
                        {theme.logoImage && (
                            <button
                                type="button"
                                onClick={handleRemoveLogo}
                                className="editor-button editor-button--danger editor-button--small"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#f87171',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Remove Logo
                            </button>
                        )}
                    </div>
                </div>

                {theme.logoImage && (
                    <>
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '0.95rem' }}>Logo Settings</h4>

                            <div className="editor-field" style={{ marginBottom: '1.5rem' }}>
                                <label>Logo Height: {theme.logoSize || 48}px</label>
                                <input
                                    type="range"
                                    value={theme.logoSize || 48}
                                    onChange={(e) => setTheme(prev => ({ ...prev, logoSize: parseInt(e.target.value) || 48 }))}
                                    min="20"
                                    max="200"
                                    step="2"
                                    style={{ width: '100%' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                                    <span>20px</span>
                                    <span>Recommended: 40-80px</span>
                                    <span>200px</span>
                                </div>
                            </div>

                            <div className="editor-field">
                                <label>Horizontal Position: {theme.logoPosition ?? -20}px from left</label>
                                <input
                                    type="range"
                                    value={theme.logoPosition ?? -20}
                                    onChange={(e) => setTheme(prev => ({ ...prev, logoPosition: parseInt(e.target.value) }))}
                                    min="-100"
                                    max="500"
                                    step="5"
                                    style={{ width: '100%' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                                    <span>-100px</span>
                                    <span>0px (edge)</span>
                                    <span>500px</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                    Tip: Use negative values to move logo closer to the left edge
                                </p>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '0.95rem' }}>Live Preview</h4>
                            <div style={{
                                position: 'relative',
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.9) 100%)',
                                borderRadius: '8px',
                                minHeight: '80px',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={theme.logoImage}
                                    alt="Logo Preview"
                                    style={{
                                        height: `${theme.logoSize || 48}px`,
                                        width: 'auto',
                                        objectFit: 'contain',
                                        maxWidth: '100%',
                                        position: 'absolute',
                                        left: `${theme.logoPosition ?? -20}px`,
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', textAlign: 'center' }}>
                                This is how your logo will appear in the navbar
                            </p>
                        </div>
                    </>
                )}
            </div>

            <div className="editor-actions">
                <button
                    className="editor-button editor-button--primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        background: saving ? 'rgba(255,255,255,0.1)' : theme.primaryColor || '#1DB954',
                        border: `1px solid ${theme.primaryColor || '#1DB954'}`,
                        boxShadow: saving ? 'none' : `0 4px 15px ${theme.primaryColor || '#1DB954'}40`,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {saving && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: `linear-gradient(90deg, transparent, ${theme.primaryColor || '#1DB954'}20, transparent)`,
                            animation: 'shimmer 1.5s infinite'
                        }} />
                    )}
                    {saving ? 'Saving...' : 'Save Theme Settings'}
                </button>
            </div>
            </div>
        </>
    );
}
