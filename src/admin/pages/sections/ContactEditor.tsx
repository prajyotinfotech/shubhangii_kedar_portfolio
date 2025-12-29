/**
 * Contact Editor
 */
import React, { useState, useEffect } from 'react';
import { fetchSection, updateSection } from '../../api/client';
import '../styles/editor.css';

interface ContactContent {
    email: string;
    phone: string;
    location: string;
}

export default function ContactEditor() {
    const [content, setContent] = useState<ContactContent>({
        email: '',
        phone: '',
        location: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const data = await fetchSection('contact');
            setContent(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load contact info' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateSection('contact', content);
            setMessage({ type: 'success', text: 'Contact info updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update contact info' });
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
                <h1>Contact Info</h1>
                <p>Update your contact details</p>
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            <form className="editor-form" onSubmit={handleSubmit}>
                <div className="editor-field">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={content.email}
                        onChange={handleChange}
                        placeholder="contact@example.com"
                    />
                </div>

                <div className="editor-field">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={content.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                    />
                </div>

                <div className="editor-field">
                    <label htmlFor="location">Location</label>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        value={content.location}
                        onChange={handleChange}
                        placeholder="Los Angeles, CA"
                    />
                </div>

                <div className="editor-actions">
                    <button type="submit" className="editor-button editor-button--primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="editor-button" onClick={loadContent}>
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
}
