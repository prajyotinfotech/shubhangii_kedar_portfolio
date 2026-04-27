/**
 * Admin Authentication Context
 * Manages JWT token and admin authentication state
 */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { normalizeApiBaseUrl } from '../../utils/apiUrl';

interface Admin {
    email: string;
}

interface AdminAuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    admin: Admin | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    token: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL, 'http://localhost:3001');

type AuthResponseData = {
    success?: boolean;
    message?: string;
    admin?: Admin;
};

async function parseAuthResponse(response: Response): Promise<AuthResponseData> {
    const text = await response.text();

    if (!text.trim()) {
        return {};
    }

    try {
        return JSON.parse(text) as AuthResponseData;
    } catch {
        return {
            message: response.ok
                ? 'Unexpected response from the authentication server.'
                : `Authentication request failed with status ${response.status}.`
        };
    }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem('admin_token')
    );
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verify password fallback token or HttpOnly cookie on mount.
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const storedToken = localStorage.getItem('admin_token');
                const response = await fetch(`${API_URL}/api/auth/verify`, {
                    credentials: 'include',
                    headers: {
                        ...(storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {})
                    }
                });

                if (response.ok) {
                    const data = await parseAuthResponse(response);
                    setAdmin(data.admin ?? null);
                } else {
                    // Token/cookie invalid, clear local fallback token
                    localStorage.removeItem('admin_token');
                    setToken(null);
                    setAdmin(null);
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                localStorage.removeItem('admin_token');
                setToken(null);
                setAdmin(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await parseAuthResponse(response);

            if (response.ok && data.success && data.admin) {
                localStorage.removeItem('admin_token');
                setToken(null);
                setAdmin(data.admin);
                return { success: true };
            } else {
                return { success: false, error: data.message || `Login failed with status ${response.status}` };
            }
        } catch (error) {
            console.error('Login error:', error);
            const errMsg = error instanceof Error ? error.message : String(error);
            // If the error message typically indicates network issues
            if (errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('network error')) {
                return { success: false, error: 'Network error: The backend server might not be running.' };
            }
            return { success: false, error: `Login error: ${errMsg}` };
        }
    };

    const loginWithGoogle = async (credential: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/google/credential`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credential })
            });

            const data = await parseAuthResponse(response);

            if (response.ok && data.success && data.admin) {
                localStorage.removeItem('admin_token');
                setToken(null);
                setAdmin(data.admin);
                return { success: true };
            }

            return { success: false, error: data.message || `Google sign-in failed with status ${response.status}` };
        } catch (error) {
            console.error('Google login error:', error);
            const errMsg = error instanceof Error ? error.message : String(error);
            if (errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('network error')) {
                return { success: false, error: 'Network error: The backend server might not be running.' };
            }
            return { success: false, error: `Google login error: ${errMsg}` };
        }
    };

    const logout = async () => {
        const storedToken = localStorage.getItem('admin_token');
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    ...(storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {})
                }
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }

        localStorage.removeItem('admin_token');
        setToken(null);
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider
            value={{
                isAuthenticated: !!admin,
                isLoading,
                admin,
                login,
                loginWithGoogle,
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
