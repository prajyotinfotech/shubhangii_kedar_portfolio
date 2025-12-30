/**
 * Admin Login Page
 * Secure login for admin panel access
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAdminAuth();
    const navigate = useNavigate();

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
        } catch (err) {
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

                    <div className="admin-login__field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
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
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-login__button"
                        disabled={isLoading}
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
