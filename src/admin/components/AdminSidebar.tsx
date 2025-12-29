/**
 * Admin Sidebar Component
 * Navigation sidebar for admin panel sections
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AdminSidebar.css';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        )
    },
    {
        path: '/admin/hero',
        label: 'Hero Section',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
            </svg>
        )
    },
    {
        path: '/admin/about',
        label: 'About',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 10-16 0" />
            </svg>
        )
    },
    {
        path: '/admin/events',
        label: 'Events',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        )
    },
    {
        path: '/admin/gallery',
        label: 'Gallery',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        )
    },
    {
        path: '/admin/testimonials',
        label: 'Testimonials',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    {
        path: '/admin/social',
        label: 'Social Links',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        )
    },
    {
        path: '/admin/contact',
        label: 'Contact',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        )
    },
    {
        path: '/admin/journey',
        label: 'Journey',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        )
    }
];

export default function AdminSidebar() {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar__header">
                <div className="admin-sidebar__logo">
                    <span className="admin-sidebar__logo-icon">SK</span>
                    <span className="admin-sidebar__logo-text">Admin</span>
                </div>
            </div>

            <nav className="admin-sidebar__nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                        }
                    >
                        <span className="admin-sidebar__link-icon">{item.icon}</span>
                        <span className="admin-sidebar__link-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="admin-sidebar__footer">
                <div className="admin-sidebar__user">
                    <div className="admin-sidebar__user-avatar">
                        {admin?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="admin-sidebar__user-info">
                        <span className="admin-sidebar__user-email">{admin?.email}</span>
                        <span className="admin-sidebar__user-role">Administrator</span>
                    </div>
                </div>
                <button className="admin-sidebar__logout" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
}
