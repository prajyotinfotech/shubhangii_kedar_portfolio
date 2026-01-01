/**
 * Admin Dashboard Page
 * Overview of content sections with quick edit links
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchContent } from '../api/client';
import './AdminDashboard.css';

interface ContentStats {
    events: number;
    gallery: number;
    musicReleases: number;
    testimonials: number;
    socialLinks: number;
    journeyMilestones: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<ContentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const content = await fetchContent();
            setStats({
                events: content.events?.length || 0,
                gallery: content.gallery?.length || 0,
                musicReleases: content.musicReleases?.length || 0,
                testimonials: content.testimonials?.length || 0,
                socialLinks: content.socialLinks?.length || 0,
                journeyMilestones: content.journeyMilestones?.length || 0
            });
        } catch (err) {
            setError('Failed to load content stats');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Events', value: stats?.events || 0, path: '/admin/events', color: '#667eea' },
        { label: 'Gallery Items', value: stats?.gallery || 0, path: '/admin/gallery', color: '#f093fb' },
        { label: 'Testimonials', value: stats?.testimonials || 0, path: '/admin/testimonials', color: '#43e97b' },
        { label: 'Social Links', value: stats?.socialLinks || 0, path: '/admin/social', color: '#fa709a' },
        { label: 'Journey Milestones', value: stats?.journeyMilestones || 0, path: '/admin/journey', color: '#ffd700' }
    ];

    const quickLinks = [
        { label: 'Edit Hero Section', path: '/admin/hero', icon: '🎯' },
        { label: 'Update About Info', path: '/admin/about', icon: '👤' },
        { label: 'Manage Events', path: '/admin/events', icon: '📅' },
        { label: 'Update Gallery', path: '/admin/gallery', icon: '🖼️' },
        { label: 'Edit Contact Info', path: '/admin/contact', icon: '📧' },
        { label: 'Manage Theme', path: '/admin/theme', icon: '🎨' }
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__header">
                <h1>Dashboard</h1>
                <p>Welcome to your portfolio admin panel</p>
            </div>

            {error && (
                <div className="admin-dashboard__error">{error}</div>
            )}

            {loading ? (
                <div className="admin-dashboard__loading">
                    <div className="admin-dashboard__spinner"></div>
                    <p>Loading stats...</p>
                </div>
            ) : (
                <>
                    <section className="admin-dashboard__section">
                        <h2>Content Overview</h2>
                        <div className="admin-dashboard__stats">
                            {statCards.map((card) => (
                                <Link
                                    key={card.label}
                                    to={card.path}
                                    className="admin-dashboard__stat-card"
                                    style={{ '--accent-color': card.color } as React.CSSProperties}
                                >
                                    <span className="admin-dashboard__stat-value">{card.value}</span>
                                    <span className="admin-dashboard__stat-label">{card.label}</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="admin-dashboard__section">
                        <h2>Quick Actions</h2>
                        <div className="admin-dashboard__quick-links">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.path}
                                    className="admin-dashboard__quick-link"
                                >
                                    <span className="admin-dashboard__quick-link-icon">{link.icon}</span>
                                    <span>{link.label}</span>
                                    <svg className="admin-dashboard__quick-link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="admin-dashboard__section">
                        <h2>Quick Tips</h2>
                        <div className="admin-dashboard__tips">
                            <div className="admin-dashboard__tip">
                                <strong>💡 Safe Editing</strong>
                                <p>All changes create an automatic backup. You can always restore if needed.</p>
                            </div>
                            <div className="admin-dashboard__tip">
                                <strong>🖼️ Images</strong>
                                <p>Upload images through the Gallery section. They'll be stored locally.</p>
                            </div>
                            <div className="admin-dashboard__tip">
                                <strong>🔄 Live Updates</strong>
                                <p>Changes are reflected on the website immediately after saving.</p>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
