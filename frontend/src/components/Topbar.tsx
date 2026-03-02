'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearAuth } from '../lib/api';

const HomeIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const MessageIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const BellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
const UserIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;

function getInitials(name: string) { return name.slice(0, 2).toUpperCase(); }

export default function Topbar() {
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);

    useEffect(() => { setUser(getStoredUser()); }, []);

    function handleLogout() {
        clearAuth();
        setUser(null);
        router.refresh();
    }

    return (
        <>
            <header
                style={{
                    height: 56,
                    background: 'var(--bg-primary)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    position: 'fixed',
                    top: 0, left: 0, right: 0,
                    zIndex: 100,
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div
                        style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'var(--bg-card)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, fontWeight: 800, color: 'var(--accent-yellow)',
                            flexShrink: 0, border: '1px solid var(--border)',
                        }}
                    >G</div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>GameOn</span>

                    {/* Search — hidden on mobile via CSS class */}
                    <div
                        className="topbar-search"
                        style={{
                            display: 'flex', alignItems: 'center',
                            background: 'var(--bg-card)', borderRadius: 10,
                            padding: '7px 14px', gap: 8, maxWidth: 200, width: '100%',
                            border: '1px solid var(--border)', marginLeft: 8,
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}><SearchIcon /></span>
                        <input
                            placeholder="Search"
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-secondary)', fontSize: 13, width: '100%' }}
                        />
                    </div>
                </div>

                {/* Center nav — hidden on mobile */}
                <nav className="topbar-nav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {[{ icon: <HomeIcon />, label: 'Home', active: true }, { icon: <MessageIcon />, label: 'Messages' }, { icon: <BellIcon />, label: 'Notifications' }].map((item) => (
                        <button
                            key={item.label}
                            title={item.label}
                            style={{
                                width: 40, height: 40, borderRadius: 10, border: 'none',
                                background: item.active ? 'var(--bg-card)' : 'transparent',
                                color: item.active ? 'var(--accent-yellow)' : 'var(--text-muted)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            {item.icon}
                            {item.active && <span style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-yellow)' }} />}
                        </button>
                    ))}
                </nav>

                {/* Right: user */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingLeft: 8 }}>
                    {user ? (
                        <>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-yellow) 0%, #f5a623 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#111', flexShrink: 0, border: '2px solid var(--accent-yellow)' }}>
                                {getInitials(user.username)}
                            </div>
                            <span className="hide-on-mobile" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>{user.username}</span>
                            <button
                                onClick={handleLogout}
                                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => router.push('/auth')} className="btn-yellow yellow-glow" style={{ padding: '7px 16px', fontSize: 13, fontWeight: 600 }}>
                            Log In
                        </button>
                    )}
                </div>
            </header>

            {/* Mobile bottom navigation */}
            <nav className="mobile-bottom-nav">
                <button className="active" onClick={() => router.push('/')}>
                    <HomeIcon /><span>Home</span>
                </button>
                <button onClick={() => router.push('/auth')}>
                    <SearchIcon /><span>Search</span>
                </button>
                <button>
                    <BellIcon /><span>Alerts</span>
                </button>
                <button onClick={() => user ? null : router.push('/auth')}>
                    <UserIcon /><span>{user ? user.username.slice(0, 8) : 'Profile'}</span>
                </button>
            </nav>
        </>
    );
}
