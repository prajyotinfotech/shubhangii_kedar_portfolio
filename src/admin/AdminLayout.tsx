/**
 * Admin Layout Component
 * Wraps admin pages with sidebar and header
 */

import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';
import AdminSidebar from './components/AdminSidebar';
import './AdminLayout.css';

export default function AdminLayout() {
    const { isAuthenticated, isLoading } = useAdminAuth();
    // Under 768px the sidebar is an off-canvas drawer opened from the top bar.
    const [menuOpen, setMenuOpen] = useState(false);

    // Escape closes the drawer; body scroll is locked while it is open.
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [menuOpen]);

    if (isLoading) {
        return (
            <div className="admin-layout__loading">
                <div className="admin-layout__spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className={`admin-layout${menuOpen ? ' admin-layout--menu-open' : ''}`}>
            <header className="admin-topbar">
                <button
                    type="button"
                    className={`admin-topbar__menu${menuOpen ? ' is-open' : ''}`}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    aria-controls="admin-sidebar"
                    onClick={() => setMenuOpen(o => !o)}
                >
                    <span /><span /><span />
                </button>
                <span className="admin-topbar__title">
                    <span className="admin-sidebar__logo-icon">SK</span>
                    Admin
                </span>
            </header>
            <AdminSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
            {menuOpen && <div className="admin-layout__overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
            <main className="admin-layout__main">
                <Outlet />
            </main>
        </div>
    );
}
