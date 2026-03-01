'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, storeAuth } from '../../lib/api';

// ── Google icon ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
);

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (cfg: {
                        client_id: string;
                        scope: string;
                        callback: (r: { access_token: string; error?: string }) => void;
                    }) => { requestAccessToken: () => void };
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function AuthPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [subState, setSubState] = useState<'default' | 'forgot' | 'reset'>('default');
    const [resetToken, setResetToken] = useState('');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Load Google Identity Services SDK
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        if (document.getElementById('google-gsi')) return;
        const script = document.createElement('script');
        script.id = 'google-gsi';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        document.head.appendChild(script);
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
        setSuccessMsg('');
    }

    // ── Google OAuth ──────────────────────────────────────────────────────────
    function handleGoogleLogin() {
        if (!GOOGLE_CLIENT_ID) {
            setError('Google login is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local');
            return;
        }
        if (!window.google) {
            setError('Google SDK not loaded yet. Please wait a moment and try again.');
            return;
        }
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: async (response) => {
                if (response.error) { setError('Google sign-in was cancelled.'); return; }
                setGoogleLoading(true);
                try {
                    const res = await api.post<{ token: string; user: { id: string; username: string; email: string } }>(
                        '/api/auth/oauth',
                        { provider: 'google', accessToken: response.access_token }
                    );
                    storeAuth(res.token, res.user);
                    router.push('/');
                    router.refresh();
                } catch (err: any) {
                    setError(err.message || 'Google sign-in failed. Try again.');
                } finally {
                    setGoogleLoading(false);
                }
            },
        });
        client.requestAccessToken();
    }

    // ── Email / password ──────────────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            if (subState === 'forgot') {
                const res = await api.post<{ message: string; debugToken?: string }>('/api/auth/forgot-password', { email: form.email });
                setSuccessMsg(res.message);
                if (res.debugToken) {
                    // For development convenience, we pre-fill the token if returned
                    setResetToken(res.debugToken);
                    setSubState('reset');
                }
            } else if (subState === 'reset') {
                await api.post('/api/auth/reset-password', { token: resetToken, password: form.password });
                setSuccessMsg('Password reset successful! You can now log in.');
                setSubState('default');
                setTab('login');
            } else if (tab === 'login') {
                const res = await api.post<{ token: string; user: { id: string; username: string; email: string } }>(
                    '/api/auth/login',
                    { email: form.email, password: form.password }
                );
                storeAuth(res.token, res.user);
                router.push('/');
                router.refresh();
            } else {
                const res = await api.post<{ token: string; user: { id: string; username: string; email: string } }>(
                    '/api/auth/signup',
                    { username: form.username, email: form.email, password: form.password }
                );
                storeAuth(res.token, res.user);
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '11px 14px',
        color: 'var(--text-primary)',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: 20,
        }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: '32px 28px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: 'var(--bg-card)', border: '2px solid var(--accent-yellow)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26, fontWeight: 800, color: 'var(--accent-yellow)', marginBottom: 12,
                    }}>G</div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>GameOn</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                        {subState === 'forgot' ? 'Reset your password' : subState === 'reset' ? 'Choose a new password' : 'Join the gaming conversation'}
                    </p>
                </div>

                {subState === 'default' && (
                    <>
                        {/* Tabs */}
                        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
                            {(['login', 'register'] as const).map((t) => (
                                <button key={t} onClick={() => { setTab(t); setError(''); setSuccessMsg(''); }}
                                    style={{
                                        flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                                        background: tab === t ? 'var(--accent-yellow)' : 'transparent',
                                        color: tab === t ? '#111' : 'var(--text-muted)',
                                        fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                                    }}>
                                    {t === 'login' ? 'Log In' : 'Sign Up'}
                                </button>
                            ))}
                        </div>

                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={googleLoading}
                            style={{
                                width: '100%',
                                padding: '12px 0',
                                borderRadius: 10,
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: googleLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                opacity: googleLoading ? 0.7 : 1,
                                transition: 'all 0.2s',
                                marginBottom: 16,
                            }}
                            onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.borderColor = '#4285F4'; }}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <GoogleIcon />
                            {googleLoading ? 'Signing in…' : 'Continue with Google'}
                        </button>

                        <Divider />
                    </>
                )}

                {/* Email form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {subState === 'reset' && (
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Reset Token</label>
                            <input value={resetToken} onChange={e => setResetToken(e.target.value)}
                                placeholder="Paste token from email" required style={inputStyle} />
                        </div>
                    )}

                    {tab === 'register' && subState === 'default' && (
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Username</label>
                            <input name="username" value={form.username} onChange={handleChange}
                                placeholder="e.g. GamerX42" required style={inputStyle} />
                        </div>
                    )}

                    {subState !== 'reset' && (
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Email</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange}
                                placeholder="you@example.com" required style={inputStyle} />
                        </div>
                    )}

                    {subState !== 'forgot' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {subState === 'reset' ? 'New Password' : 'Password'}
                                </label>
                                {tab === 'login' && subState === 'default' && (
                                    <button type="button" onClick={() => { setSubState('forgot'); setError(''); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent-yellow)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <input name="password" type="password" value={form.password} onChange={handleChange}
                                placeholder="Min. 8 characters" required minLength={8} style={inputStyle} />
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
                            borderRadius: 8, padding: '10px 14px', color: '#ff6b6b', fontSize: 13,
                        }}>
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div style={{
                            background: 'rgba(0,180,100,0.1)', border: '1px solid rgba(0,180,100,0.3)',
                            borderRadius: 8, padding: '10px 14px', color: '#00cc77', fontSize: 13,
                        }}>
                            {successMsg}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-yellow yellow-glow"
                        style={{
                            width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 700,
                            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                        }}>
                        {loading ? '…' : subState === 'forgot' ? 'Send Reset Link' : subState === 'reset' ? 'Update Password' : tab === 'login' ? 'Log In' : 'Create Account'}
                    </button>

                    {subState !== 'default' && (
                        <button type="button" onClick={() => { setSubState('default'); setError(''); setSuccessMsg(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, marginTop: 4 }}>
                            Back to Login
                        </button>
                    )}
                </form>

                {subState === 'default' && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 20 }}>
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-yellow)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                            {tab === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
