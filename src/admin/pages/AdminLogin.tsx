/**
 * Admin Login Page
 * Secure login for admin panel access
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AdminLogin.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleCredentialResponse {
    credential?: string;
}

interface GoogleIdentityApi {
    accounts: {
        id: {
            initialize: (config: {
                client_id: string;
                callback: (response: GoogleCredentialResponse) => void;
                auto_select?: boolean;
                ux_mode?: 'popup';
            }) => void;
            renderButton: (
                parent: HTMLElement,
                options: {
                    theme: 'outline' | 'filled_blue' | 'filled_black';
                    size: 'large' | 'medium' | 'small';
                    type: 'standard' | 'icon';
                    shape: 'rectangular' | 'pill' | 'circle' | 'square';
                    text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
                    width: number;
                }
            ) => void;
        };
    };
}

declare global {
    interface Window {
        google?: GoogleIdentityApi;
    }
}

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement | null>(null);
    const { login, loginWithGoogle, isAuthenticated, isLoading: isAuthLoading } = useAdminAuth();
    const navigate = useNavigate();

    const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
        if (!response.credential) {
            setError('Google did not return a valid credential. Please try again.');
            return;
        }

        setError('');
        setIsGoogleLoading(true);

        try {
            const result = await loginWithGoogle(response.credential);
            if (result.success) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                setError(result.error || 'Google sign-in failed');
            }
        } catch {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setIsGoogleLoading(false);
        }
    }, [loginWithGoogle, navigate]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) {
            return;
        }

        let isCancelled = false;
        let script: HTMLScriptElement | null = null;

        const initializeGoogleButton = () => {
            const buttonHost = googleButtonRef.current;
            if (isCancelled || !buttonHost || !window.google?.accounts?.id) {
                return;
            }

            buttonHost.innerHTML = '';
            const buttonWidth = Math.max(220, Math.min(320, Math.floor(buttonHost.getBoundingClientRect().width || 320)));

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCredential,
                auto_select: false,
                ux_mode: 'popup'
            });

            window.google.accounts.id.renderButton(buttonHost, {
                theme: 'filled_blue',
                size: 'large',
                type: 'standard',
                shape: 'rectangular',
                text: 'continue_with',
                width: buttonWidth
            });
        };

        const handleScriptError = () => {
            if (!isCancelled) {
                setError('Google sign-in could not be loaded. Please refresh and try again.');
            }
        };

        if (window.google?.accounts?.id) {
            initializeGoogleButton();
        } else {
            script = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
            if (!script) {
                script = document.createElement('script');
                script.src = GOOGLE_SCRIPT_SRC;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }

            script.addEventListener('load', initializeGoogleButton);
            script.addEventListener('error', handleScriptError);
        }

        return () => {
            isCancelled = true;
            script?.removeEventListener('load', initializeGoogleButton);
            script?.removeEventListener('error', handleScriptError);
        };
    }, [handleGoogleCredential]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate('/admin/dashboard');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login__container">
                <div className="admin-login__header">
                    <div className="admin-login__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M20 21a8 8 0 10-16 0" />
                        </svg>
                    </div>
                    <h1 className="admin-login__title">Admin Panel</h1>
                    <p className="admin-login__subtitle">Sign in to manage your portfolio</p>
                </div>

                <form className="admin-login__form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="admin-login__error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {GOOGLE_CLIENT_ID ? (
                        <div className="admin-login__google-slot" ref={googleButtonRef} aria-busy={isGoogleLoading || isAuthLoading} />
                    ) : (
                        <button type="button" className="admin-login__google-button" disabled>
                            Google login is not configured
                        </button>
                    )}

                    {(isGoogleLoading || isAuthLoading) && (
                        <div className="admin-login__google-status">
                            <span className="admin-login__spinner admin-login__spinner--dark"></span>
                            Connecting...
                        </div>
                    )}

                    <div className="admin-login__divider">
                        <span>or use admin password</span>
                    </div>

                    <div className="admin-login__field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            disabled={isGoogleLoading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="admin-login__field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={isGoogleLoading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-login__button"
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="admin-login__spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="admin-login__footer">
                    <a href="/" className="admin-login__back">
                        ← Back to Website
                    </a>
                </div>
            </div>
        </div>
    );
}
