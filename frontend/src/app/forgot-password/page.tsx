'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

// ── Password helpers ──────────────────────────────────────────────────────────
const CONDITIONS = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number (0–9)', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function getStrength(pw: string): number {
    return CONDITIONS.filter(c => c.test(pw)).length;
}

const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

const ADJECTIVES = ['Storm', 'Pixel', 'Neon', 'Shadow', 'Turbo', 'Hyper', 'Blaze', 'Frost', 'Dark', 'Cyber'];
const NOUNS = ['Gamer', 'Wolf', 'Rage', 'Drift', 'Hawk', 'Titan', 'Knight', 'Viper', 'Craft', 'Byte'];
const SYMBOLS = ['!', '@', '#', '$', '%', '&', '*'];

function generateSuggestion(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    return `${adj}${sym}${noun}${num}`;
}

// ── OTP Input component ───────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(6, '').split('').slice(0, 6);

    function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    }

    function handleChange(i: number, v: string) {
        const d = v.replace(/\D/g, '').slice(-1);
        const next = digits.map((c, idx) => idx === i ? d : c).join('').replace(/ /g, '');
        onChange(next);
        if (d && i < 5) inputs.current[i + 1]?.focus();
    }

    function handlePaste(e: React.ClipboardEvent) {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
        e.preventDefault();
    }

    return (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={el => { inputs.current[i] = el; }}
                    value={digits[i] === ' ' ? '' : digits[i]}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    onPaste={handlePaste}
                    maxLength={1}
                    inputMode="numeric"
                    style={{
                        width: 48, height: 56, textAlign: 'center',
                        fontSize: 24, fontWeight: 700,
                        background: 'var(--bg-input)', border: `2px solid ${digits[i] && digits[i] !== ' ' ? 'var(--accent-yellow)' : 'var(--border)'}`,
                        borderRadius: 12, color: 'var(--text-primary)', outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                />
            ))}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Refresh suggestions on step 3
    useEffect(() => {
        if (step === 3) setSuggestions([generateSuggestion(), generateSuggestion(), generateSuggestion()]);
    }, [step]);

    // Resend countdown
    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    const strength = getStrength(newPassword);
    const allConditionsMet = strength === 5;

    // ── Step 1: Send OTP ──────────────────────────────────────────────────────
    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/api/auth/send-otp', { email });
            setStep(2);
            setResendTimer(60);
            setSuccessMsg(`OTP sent to ${email}. Check your inbox (and spam folder).`);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally { setLoading(false); }
    }

    // ── Step 2: Verify OTP ────────────────────────────────────────────────────
    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault();
        if (otp.length < 6) { setError('Please enter the full 6-digit code.'); return; }
        setLoading(true); setError('');
        try {
            const res = await api.post<{ resetToken: string }>('/api/auth/verify-otp', { email, otp });
            setResetToken(res.resetToken);
            setStep(3);
            setSuccessMsg('');
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally { setLoading(false); }
    }

    async function handleResend() {
        if (resendTimer > 0) return;
        setLoading(true); setError('');
        try {
            await api.post('/api/auth/send-otp', { email });
            setResendTimer(60);
            setOtp('');
            setSuccessMsg('A new OTP has been sent.');
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP.');
        } finally { setLoading(false); }
    }

    // ── Step 3: Set new password ──────────────────────────────────────────────
    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!allConditionsMet) { setError('Password does not meet all requirements.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true); setError('');
        try {
            await api.post('/api/auth/reset-password-otp', { resetToken, newPassword });
            setSuccessMsg('Password reset! Redirecting to login…');
            setTimeout(() => router.push('/auth'), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Please start again.');
        } finally { setLoading(false); }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)',
        fontSize: 14, outline: 'none', boxSizing: 'border-box',
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 20 }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: '32px 28px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--bg-card)', border: '2px solid var(--accent-yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'var(--accent-yellow)', marginBottom: 12 }}>G</div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'New Password'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                        {step === 1 ? "We'll send a 6-digit code to your email" : step === 2 ? `Code sent to ${email}` : 'Choose a strong password'}
                    </p>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step >= s ? 'var(--accent-yellow)' : 'var(--border)', transition: 'background 0.3s' }} />
                    ))}
                </div>

                {/* Error / success */}
                {error && <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff6b6b', fontSize: 13, marginBottom: 14 }}>{error}</div>}
                {successMsg && <div style={{ background: 'rgba(0,180,100,0.1)', border: '1px solid rgba(0,180,100,0.3)', borderRadius: 8, padding: '10px 14px', color: '#00cc77', fontSize: 13, marginBottom: 14 }}>{successMsg}</div>}

                {/* ── Step 1 ── */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Email Address</label>
                            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com" required style={inputStyle} />
                        </div>
                        <button type="submit" disabled={loading} className="btn-yellow yellow-glow" style={{ width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                            {loading ? 'Sending…' : 'Send OTP'}
                        </button>
                        <button type="button" onClick={() => router.push('/auth')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, marginTop: 4 }}>
                            ← Back to Login
                        </button>
                    </form>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <OtpInput value={otp} onChange={v => { setOtp(v); setError(''); }} />
                        <button type="submit" disabled={loading || otp.length < 6} className="btn-yellow yellow-glow" style={{ width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 700, opacity: (loading || otp.length < 6) ? 0.6 : 1, cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Verifying…' : 'Verify Code'}
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button type="button" onClick={handleResend} disabled={resendTimer > 0 || loading} style={{ background: 'none', border: 'none', color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--accent-yellow)', cursor: resendTimer > 0 ? 'default' : 'pointer', fontSize: 12, fontWeight: 600 }}>
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                            <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                                Change email
                            </button>
                        </div>
                    </form>
                )}

                {/* ── Step 3 ── */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Suggestions */}
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>💡 Suggested strong passwords (click to use):</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {suggestions.map((s, i) => (
                                    <button key={i} type="button" onClick={() => { setNewPassword(s); setConfirmPassword(s); }}
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--accent-yellow)', fontFamily: 'monospace', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', letterSpacing: 1 }}>
                                        {s}
                                    </button>
                                ))}
                                <button type="button" onClick={() => setSuggestions([generateSuggestion(), generateSuggestion(), generateSuggestion()])}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, marginTop: 2 }}>
                                    🔄 Regenerate suggestions
                                </button>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

                        {/* Password input */}
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} placeholder="Enter or pick a suggestion" style={{ ...inputStyle, paddingRight: 44 }} />
                                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>
                                    {showPw ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Strength bar */}
                        {newPassword && (
                            <div>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: strength >= s ? STRENGTH_COLORS[strength] : 'var(--border)', transition: 'background 0.3s' }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: 11, color: STRENGTH_COLORS[strength], fontWeight: 600 }}>{STRENGTH_LABELS[strength]}</span>
                            </div>
                        )}

                        {/* Conditions checklist */}
                        <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {CONDITIONS.map((c) => {
                                const met = c.test(newPassword);
                                return (
                                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                        <span style={{ color: met ? '#22c55e' : 'var(--text-muted)', fontSize: 14, flexShrink: 0 }}>{met ? '✅' : '○'}</span>
                                        <span style={{ color: met ? 'var(--text-primary)' : 'var(--text-muted)' }}>{c.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Confirm Password</label>
                            <input type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }} placeholder="Re-enter password" style={{ ...inputStyle, borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : 'var(--border)' }} />
                            {confirmPassword && confirmPassword !== newPassword && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>Passwords don't match</p>}
                        </div>

                        <button type="submit" disabled={loading || !allConditionsMet || newPassword !== confirmPassword} className="btn-yellow yellow-glow"
                            style={{ width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 700, opacity: (loading || !allConditionsMet || newPassword !== confirmPassword) ? 0.5 : 1, cursor: (loading || !allConditionsMet || newPassword !== confirmPassword) ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                            {loading ? 'Saving…' : 'Set New Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
