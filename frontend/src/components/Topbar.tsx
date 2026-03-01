'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearAuth } from '../lib/api';

const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const MessageIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
const HeartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;

const navItems = [
    { icon: <HomeIcon />, label: 'Home', active: true },
    { icon: <MessageIcon />, label: 'Messages' },
    { icon: <BellIcon />, label: 'Notifications' },
    { icon: <HeartIcon />, label: 'Favorites' },
];

function getInitials(name: string) {
    return name.slice(0, 2).toUpperCase();
}

export default function Topbar() {
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);

    useEffect(() => {
        setUser(getStoredUser());
    }, []);

    function handleLogout() {
        clearAuth();
        setUser(null);
        router.refresh();
    }

    return (
        <header
            style={{
                height: 56,
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
            }}
        >
            {/* Left: Logo + Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 800,
                        color: 'var(--accent-yellow)',
                        flexShrink: 0,
                        border: '1px solid var(--border)',
                    }}
                >
                    G
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--bg-card)',
                        borderRadius: 10,
                        padding: '7px 14px',
                        gap: 8,
                        maxWidth: 200,
                        width: '100%',
                        border: '1px solid var(--border)',
                        minWidth: 0,
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}><SearchIcon /></span>
                    <input
                        placeholder="# Explore"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: 13,
                            width: '100%',
                            minWidth: 0,
                        }}
                    />
                </div>
            </div>

            {/* Center: Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        title={item.label}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            border: 'none',
                            background: item.active ? 'var(--bg-card)' : 'transparent',
                            color: item.active ? 'var(--accent-yellow)' : 'var(--text-muted)',
                            fontSize: 18,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}
                    >
                        {item.icon}
                        {item.active && (
                            <span
                                style={{
                                    position: 'absolute',
                                    bottom: 3,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    background: 'var(--accent-yellow)',
                                }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* Right: User or Login */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingLeft: 12 }}>
                {user ? (
                    <>
                        {/* Avatar with initials */}
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent-yellow) 0%, #f5a623 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 13,
                                color: '#111',
                                flexShrink: 0,
                                border: '2px solid var(--accent-yellow)',
                            }}
                        >
                            {getInitials(user.username)}
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
                            {user.username}
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                padding: '4px 10px',
                                color: 'var(--text-muted)',
                                fontSize: 12,
                                cursor: 'pointer',
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => router.push('/auth')}
                        className="btn-yellow yellow-glow"
                        style={{ padding: '7px 18px', fontSize: 13, fontWeight: 600 }}
                    >
                        Log In / Sign Up
                    </button>
                )}
            </div>
        </header>
    );
}
