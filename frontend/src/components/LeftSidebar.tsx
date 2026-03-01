'use client';
import React from 'react';

const ControllerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 12h4" /><path d="M8 10v4" /><circle cx="15" cy="13" r="1" /><circle cx="18" cy="11" r="1" /></svg>;
const CrosshairIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="22" x2="18" y1="12" y2="12" /><line x1="6" x2="2" y1="12" y2="12" /><line x1="12" x2="12" y1="6" y2="2" /><line x1="12" x2="12" y1="22" y2="18" /></svg>;
const PickaxeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9" /><path d="M15 13 9 7l4-4 6 6h3a8 8 0 0 1-7 7z" /></svg>;
const SwordsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" x2="19" y1="19" y2="13" /><line x1="16" x2="20" y1="16" y2="20" /><line x1="19" x2="21" y1="21" y2="19" /></svg>;
const TargetIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const TrophyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>;

const games = [
    { name: 'Fortnite', icon: <ControllerIcon />, members: '2.4M', color: '#4facfe' },
    { name: 'Valorant', icon: <CrosshairIcon />, members: '1.8M', color: '#ff4655' },
    { name: 'Minecraft', icon: <PickaxeIcon />, members: '3.1M', color: '#5cb85c' },
    { name: 'Elden Ring', icon: <SwordsIcon />, members: '890K', color: '#f0ad4e' },
    { name: 'CS2', icon: <TargetIcon />, members: '1.2M', color: '#e8b04b' },
    { name: 'League', icon: <TrophyIcon />, members: '2.9M', color: '#c89b3c' },
];

const skills = ['FPS', 'Strategy', 'RPG', 'Mobile', 'Esports', 'Modding'];

export default function LeftSidebar() {
    return (
        <aside
            style={{
                width: 230,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                overflowY: 'auto',
                height: '100%',
                paddingBottom: 20,
            }}
        >
            {/* Profile Card */}
            <div
                className="card fade-in"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0,
                    padding: 0,
                    overflow: 'hidden',
                }}
            >
                {/* Cover with concentric circles */}
                <div
                    style={{
                        width: '100%',
                        height: 80,
                        background: 'var(--bg-card)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {/* Concentric rings (yellow/gold like reference) */}
                    {[76, 60, 44, 30, 18].map((size, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: size,
                                height: size,
                                borderRadius: '50%',
                                border: `3px solid hsl(${47 - i * 5}, ${80 - i * 5}%, ${62 - i * 5}%)`,
                                opacity: 1 - i * 0.07,
                            }}
                        />
                    ))}
                    {/* 3-dots menu */}
                    <button
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: 16,
                        }}
                    >
                        ···
                    </button>
                </div>

                {/* Avatar + stats */}
                <div style={{ padding: '0 14px 14px', width: '100%' }}>
                    {/* Avatar overlapping cover */}
                    <img
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop"
                        alt="GamerX"
                        style={{
                            marginTop: -22,
                            width: 54,
                            height: 54,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid var(--bg-surface)',
                            flexShrink: 0,
                            marginBottom: 8,
                        }}
                    />

                    {/* Follower counts */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>1,984</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Followers</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>1,002</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Following</div>
                        </div>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>GamerX Pro</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>@gamerx</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
                        🎮 Hardcore gamer. Open to collabs & tournaments. ⚡
                    </div>
                    <button
                        className="btn-outline"
                        style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
                    >
                        My Profile
                    </button>
                </div>
            </div>

            {/* Game Tags / Skills */}
            <div className="card fade-in" style={{ animationDelay: '0.05s' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Game Genres</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {skills.map((s) => (
                        <span key={s} className="tag">
                            {s}
                        </span>
                    ))}
                </div>
            </div>

            {/* Communities */}
            <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                    }}
                >
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Communities</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><SearchIcon /></button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><PlusIcon /></button>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {games.map((g) => (
                        <div
                            key={g.name}
                            className="hover-lift"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                cursor: 'pointer',
                                borderRadius: 10,
                                padding: '6px 8px',
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 11,
                                    background: 'var(--bg-card)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    border: `2px solid ${g.color}30`,
                                }}
                            >
                                {g.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{g.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                    <span
                                        className="pulse-dot"
                                        style={{
                                            display: 'inline-block',
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: 'var(--green-online)',
                                            marginRight: 4,
                                        }}
                                    />
                                    {g.members} members
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
