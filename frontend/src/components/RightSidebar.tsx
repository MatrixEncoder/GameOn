'use client';
import React from 'react';

const activities = [
    {
        id: 1,
        user: 'Vikram A.',
        image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop',
        color: '#f5a623',
        action: 'subscribed to you',
        time: '3 min ago',
        amount: '$10.00',
        unit: '/tip',
        btnLabel: 'Thanks',
        btnStyle: 'yellow',
        online: true,
    },
    {
        id: 2,
        user: 'Neha K.',
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop',
        color: '#e83e8c',
        action: 'bought your clip',
        time: '6 hrs ago',
        amount: '$90.00',
        unit: '/purchase',
        btnLabel: 'Thanked',
        btnStyle: 'outline',
        online: false,
    },
    {
        id: 3,
        user: 'Rahul A.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
        color: '#6610f2',
        action: 'sent you a tip',
        time: '7 hrs ago',
        amount: '$30.00',
        unit: '/purchase',
        btnLabel: 'Thanks',
        btnStyle: 'yellow',
        online: false,
    },
    {
        id: 4,
        user: 'Priya K.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
        color: '#20c997',
        action: 'sent you a job request',
        time: '1 hr ago',
        amount: '$20.00',
        unit: '/purchase',
        btnLabel: 'Thanks',
        btnStyle: 'yellow',
        online: true,
    },
    {
        id: 5,
        user: 'Team Alpha',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=150&auto=format&fit=crop',
        color: '#ff6b35',
        action: 'group activity',
        time: '12 hrs ago',
        amount: null,
        unit: null,
        btnLabel: 'Join',
        btnStyle: 'yellow',
        discardLabel: 'Discard',
        online: true,
    },
];

export default function RightSidebar() {
    return (
        <aside
            style={{
                width: 240,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                overflowY: 'auto',
                height: '100%',
                paddingBottom: 20,
            }}
        >
            <div className="card fade-in" style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent Activity</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {activities.map((a, i) => (
                        <div
                            key={a.id}
                            className="fade-in"
                            style={{
                                animationDelay: `${i * 0.06}s`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                                paddingBottom: 14,
                                borderBottom: i < activities.length - 1 ? '1px solid var(--border)' : 'none',
                            }}
                        >
                            {/* User row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}88 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: '#fff',
                                            backgroundImage: a.image ? `url(${a.image})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            border: '1px solid var(--border)',
                                        }}
                                    >
                                        {a.image ? '' : a.user[0]}
                                    </div>
                                    {a.online && (
                                        <div
                                            className="pulse-dot"
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                width: 9,
                                                height: 9,
                                                borderRadius: '50%',
                                                background: 'var(--green-online)',
                                                border: '2px solid var(--bg-surface)',
                                            }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.user}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                        {a.action} • {a.time}
                                    </div>
                                </div>
                            </div>

                            {/* Amount + action buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {a.amount ? (
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: 15 }}>{a.amount}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> {a.unit}</span>
                                    </div>
                                ) : (
                                    <div style={{ width: 1 }} />
                                )}
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {a.discardLabel && (
                                        <button className="btn-outline" style={{ padding: '5px 12px', fontSize: 12 }}>
                                            {a.discardLabel}
                                        </button>
                                    )}
                                    <button
                                        className={a.btnStyle === 'yellow' ? 'btn-yellow' : 'btn-outline'}
                                        style={{
                                            padding: '5px 16px',
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {a.btnLabel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
