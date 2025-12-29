/**
 * Admin Authentication Context
 * Manages JWT token and admin authentication state
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
    email: string;
}

interface AdminAuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    admin: Admin | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    token: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem('admin_token')
    );
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAdmin(data.admin);
                } else {
                    // Token invalid, clear it
                    localStorage.removeItem('admin_token');
                    setToken(null);
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                localStorage.removeItem('admin_token');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('admin_token', data.token);
                setToken(data.token);
                setAdmin(data.admin);
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider
            value={{
                isAuthenticated: !!token && !!admin,
                isLoading,
                admin,
                login,
                logout,
                token
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
