import React, { useState, useEffect } from 'react';
import { fetchSection, updateSection } from '../../api/client';
import '../styles/editor.css';

interface BookingSettings {
    web3formsKey: string;
}

export default function BookingSettingsEditor() {
    const [settings, setSettings] = useState<BookingSettings>({ web3formsKey: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await fetchSection('bookingSettings' as any);
            if (data && typeof data === 'object') {
                setSettings({ web3formsKey: (data as any).web3formsKey || '' });
            }
        } catch {
            // Section may not exist yet — start with empty state
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await updateSection('bookingSettings' as any, settings);
            setMessage({ type: 'success', text: 'Booking settings saved!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setSaving(false);
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
                <h1>Booking Settings</h1>
                <p>Configure where booking requests are delivered</p>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '24px',
                fontSize: '14px',
                lineHeight: '1.7',
                color: 'rgba(255,255,255,0.7)'
            }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>How it works</strong>
                Booking form submissions are sent via <strong style={{ color: '#fff' }}>Web3Forms</strong> — a free email service.
                Each access key is linked to one email address. When you paste your key here,
                all booking requests go to that email automatically.
                <br /><br />
                To get a free key:
                <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
                    <li>Go to <strong style={{ color: '#fff' }}>web3forms.com</strong></li>
                    <li>Enter the email address where you want to receive bookings</li>
                    <li>Copy the access key they send you and paste it below</li>
                </ol>
                To change the destination email, simply repeat the steps above with the new email and update the key here.
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            <form className="editor-form" onSubmit={handleSubmit}>
                <div className="editor-field">
                    <label htmlFor="web3formsKey">Web3Forms Access Key</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            id="web3formsKey"
                            name="web3formsKey"
                            type={showKey ? 'text' : 'password'}
                            value={settings.web3formsKey}
                            onChange={e => setSettings({ web3formsKey: e.target.value })}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            style={{ paddingRight: '48px', width: '100%' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(v => !v)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'rgba(255,255,255,0.5)',
                                padding: '4px',
                                lineHeight: 1,
                            }}
                            aria-label={showKey ? 'Hide key' : 'Show key'}
                        >
                            {showKey ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {settings.web3formsKey && (
                        <p style={{ marginTop: '6px', fontSize: '13px', color: '#00ff99' }}>
                            Key set — booking requests will be delivered to the email linked to this key.
                        </p>
                    )}
                    {!settings.web3formsKey && (
                        <p style={{ marginTop: '6px', fontSize: '13px', color: 'rgba(255,200,80,0.9)' }}>
                            No key set. Booking form will not deliver emails until a key is added.
                        </p>
                    )}
                </div>

                <div className="editor-actions">
                    <button type="submit" className="editor-button editor-button--primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button type="button" className="editor-button" onClick={loadSettings}>
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
}
