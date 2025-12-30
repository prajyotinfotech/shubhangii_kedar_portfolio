/**
 * Admin Layout Component
 * Wraps admin pages with sidebar and header
 */

import { Outlet, Navigate } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';
import AdminSidebar from './components/AdminSidebar';
import './AdminLayout.css';

export default function AdminLayout() {
    const { isAuthenticated, isLoading } = useAdminAuth();

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
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-layout__main">
                <Outlet />
            </main>
        </div>
    );
}
