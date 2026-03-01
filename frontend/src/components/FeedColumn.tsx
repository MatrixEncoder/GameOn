'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, getStoredUser } from '../lib/api';
import { useRouter } from 'next/navigation';

declare global {
    interface CSSStyleDeclaration {
        animationDelay: string;
    }
}

// ── Icons ────────────────────────────────────────────────────────────────────
const ImageIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
const VideoIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>;
const PollIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>;
const CalendarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>;
const SmileIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
const MessageIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const ShareIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>;
const MoreIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>;

// ── Static stories (avatar showcase) ─────────────────────────────────────────
const stories = [
    { name: 'Karan', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format', color: '#f5a623' },
    { name: 'Priya', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format', color: '#e83e8c' },
    { name: 'Rahul', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format', color: '#6c757d' },
    { name: 'Ananya', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format', color: '#20c997' },
    { name: 'Vikram', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format', color: '#ff6b35' },
    { name: 'Neha', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format', color: '#6610f2' },
];

// ── Fallback posts if backend is not up yet ───────────────────────────────────
const FALLBACK_POSTS = [
    {
        id: 'fallback-1',
        user: { username: 'XeroDrift' },
        game: { name: 'Valorant' },
        title: 'Just hit Diamond rank!',
        content: 'Just hit Diamond rank in Valorant — solo queue only. The grind never stops. 💎 Who else is pushing ranked this season?',
        score: 142,
        _count: { comments: 38 },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userVote: null,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'fallback-2',
        user: { username: 'NovaStar' },
        game: { name: 'Elden Ring' },
        title: 'Shadow of the Erdtree is a MASTERPIECE',
        content: "Elden Ring DLC dropped and I genuinely haven't slept. Shadow of the Erdtree is a MASTERPIECE. FromSoft can't stop winning.",
        score: 318,
        _count: { comments: 74 },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        userVote: null,
        image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'fallback-3',
        user: { username: 'KaranPlays' },
        game: { name: 'Minecraft' },
        title: 'Built this entire castle in survival mode!',
        content: 'Minecraft with shaders hits different. Built this entire castle in survival mode! Thoughts?',
        score: 540,
        _count: { comments: 120 },
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        userVote: null,
        image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=800&auto=format&fit=crop',
    },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Post {
    id: string;
    user: { id?: string; username: string };
    game: { id?: string; slug?: string; name: string };
    title: string;
    content: string;
    score: number;
    _count: { comments: number };
    createdAt: string;
    userVote: number | null;
    image?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Avatar({ name, color = '#555', size = 40 }: { name: string; color?: string; size?: number }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: size * 0.38,
                color: '#fff',
                flexShrink: 0,
            }}
        >
            {name[0].toUpperCase()}
        </div>
    );
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function SkeletonPost() {
    return (
        <div className="card" style={{ gap: 12 }}>
            {[40, 80, 180, 28].map((h, i) => (
                <div key={i} style={{ height: h, borderRadius: 8, background: 'var(--bg-card)', opacity: 0.5 }} />
            ))}
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', gap: 6 }}>
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--accent-yellow)',
                        opacity: 0.7,
                        animation: 'pulse 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                    }}
                />
            ))}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FeedColumn() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [commentText, setCommentText] = useState<Record<string, string>>({});
    const [showComments, setShowComments] = useState<Record<string, boolean>>({});
    const sentinelRef = useRef<HTMLDivElement>(null);
    const user = getStoredUser();

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        async function loadPosts() {
            setLoading(true);
            try {
                const res = await api.get<{ posts: Post[]; nextCursor: string | null }>('/api/feed?limit=10');
                if (res.posts.length > 0) {
                    setPosts(res.posts);
                    setNextCursor(res.nextCursor);
                    setHasMore(!!res.nextCursor);
                } else {
                    setPosts(FALLBACK_POSTS);
                    setHasMore(false);
                    setUsingFallback(true);
                }
            } catch {
                setPosts(FALLBACK_POSTS);
                setHasMore(false);
                setUsingFallback(true);
            } finally {
                setLoading(false);
            }
        }
        loadPosts();
    }, []);

    // ── Load more (infinite scroll) ───────────────────────────────────────────
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || usingFallback || !nextCursor) return;
        setLoadingMore(true);
        try {
            const res = await api.get<{ posts: Post[]; nextCursor: string | null }>(
                `/api/feed?limit=10&cursor=${nextCursor}`
            );
            setPosts((prev) => [
                ...prev,
                ...res.posts.filter((p) => !prev.some((existing) => existing.id === p.id)),
            ]);
            setNextCursor(res.nextCursor);
            setHasMore(!!res.nextCursor);
        } catch { /* ignore */ } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, usingFallback, nextCursor]);

    // ── IntersectionObserver sentinel ─────────────────────────────────────────
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    async function handleVote(postId: string, voteType: number) {
        if (!user) { router.push('/auth'); return; }
        try {
            await api.post('/api/votes', { postId, voteType });
            setPosts((prev) =>
                prev.map((p) => {
                    if (p.id !== postId) return p;
                    const prev_vote = p.userVote;
                    const delta = prev_vote === voteType ? -voteType : (prev_vote ? voteType * 2 : voteType);
                    return { ...p, score: p.score + delta, userVote: prev_vote === voteType ? null : voteType };
                })
            );
        } catch { /* ignore */ }
    }

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        if (!user) { router.push('/auth'); return; }
        if (!newPost.trim()) return;
        setSubmitting(true);
        try {
            // Post to default game (general); in MVP we pick first available game
            const games = await api.get<{ games: Array<{ slug: string }> }>('/api/games');
            const slug = games.games[0]?.slug || 'general';
            const created = await api.post<Post>(`/api/games/${slug}/posts`, {
                title: newPost.slice(0, 80),
                content: newPost,
            });
            setPosts((prev) => [created, ...prev]);
            setNewPost('');
        } catch { /* ignore */ } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                overflowY: 'auto',
                height: '100%',
                paddingBottom: 20,
                minWidth: 0,
            }}
        >
            {/* ── Stories Row ─────────────────────────────────────────────── */}
            <div
                className="card fade-in"
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 18, overflowX: 'auto', flexShrink: 0 }}
            >
                {stories.map((s, i) => (
                    <div
                        key={s.name}
                        className="hover-lift"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 5,
                            cursor: 'pointer',
                            flexShrink: 0,
                            animationDelay: `${i * 0.04}s`,
                        }}
                    >
                        <div
                            style={{
                                width: 54,
                                height: 54,
                                borderRadius: 14,
                                backgroundImage: `url(${s.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 20%',
                                border: i === 0 ? '2px solid var(--accent-yellow)' : '2px solid var(--border)',
                                flexShrink: 0,
                            }}
                        />
                        <span style={{ fontSize: 11, color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: i === 0 ? 600 : 400, whiteSpace: 'nowrap' }}>
                            {s.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Create Post ──────────────────────────────────────────────── */}
            <form onSubmit={handleCreatePost} className="card fade-in" style={{ animationDelay: '0.06s', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar
                        name={user?.username || '?'}
                        color={user ? '#f5d000' : '#555'}
                        size={38}
                    />
                    <input
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder={user ? 'Share what\'s happening in gaming…' : 'Log in to post…'}
                        disabled={!user}
                        style={{
                            flex: 1,
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            color: 'var(--text-secondary)',
                            fontSize: 13,
                            outline: 'none',
                            cursor: user ? 'text' : 'not-allowed',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {[
                        { icon: <ImageIcon />, label: 'Photo' },
                        { icon: <VideoIcon />, label: 'Video' },
                        { icon: <PollIcon />, label: 'Poll' },
                        { icon: <CalendarIcon />, label: 'Schedule' },
                    ].map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            className="btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px' }}
                        >
                            <span>{action.icon}</span>
                            <span style={{ fontSize: 12 }}>{action.label}</span>
                        </button>
                    ))}
                    {newPost.trim() && user && (
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-yellow"
                            style={{ marginLeft: 'auto', padding: '6px 18px', fontSize: 12, fontWeight: 600 }}
                        >
                            {submitting ? '...' : 'Post'}
                        </button>
                    )}
                </div>
            </form>

            {/* ── Feed Posts ───────────────────────────────────────────────── */}
            {loading ? (
                <>
                    <SkeletonPost />
                    <SkeletonPost />
                    <SkeletonPost />
                </>
            ) : (
                posts.map((post, idx) => (
                    <div
                        key={post.id}
                        className="card fade-in hover-lift"
                        style={{ animationDelay: `${0.1 + idx * 0.07}s`, gap: 0 }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar name={post.user.username} color={['#4facfe', '#ff6b35', '#f5a623', '#20c997', '#e83e8c'][idx % 5]} size={42} />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{post.user.username}</span>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 4,
                                                padding: '1px 6px',
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            {post.game.name}
                                        </span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                        {timeAgo(post.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 4 }}>
                                <MoreIcon />
                            </button>
                        </div>

                        {/* Title + Content */}
                        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text-primary)' }}>{post.title}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{post.content}</p>

                        {/* Post image (from seed or fallback) */}
                        {post.image && (
                            <div
                                style={{
                                    width: '100%',
                                    height: 220,
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    marginBottom: 12,
                                    position: 'relative',
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    className="btn-yellow yellow-glow"
                                    style={{ position: 'absolute', bottom: 14, right: 14, padding: '7px 20px', fontSize: 13 }}
                                >
                                    Join Game
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 0 }}>
                            <button
                                onClick={() => handleVote(post.id, 1)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    color: post.userVote === 1 ? 'var(--red-heart)' : 'var(--text-muted)',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    transform: post.userVote === 1 ? 'scale(1.05)' : 'scale(1)',
                                }}
                            >
                                <HeartIcon filled={post.userVote === 1} /> {post.score}
                            </button>
                            <button
                                onClick={() => setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <MessageIcon /> {post._count.comments}
                            </button>
                            <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <ShareIcon /> Share
                            </button>
                        </div>

                        {/* Comment Box */}
                        <hr className="sep" style={{ margin: '10px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={user?.username || '?'} color="#f5d000" size={30} />
                            <input
                                value={commentText[post.id] || ''}
                                onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && commentText[post.id]?.trim()) {
                                        if (!user) { router.push('/auth'); return; }
                                        try {
                                            await api.post(`/api/posts/${post.id}/comments`, { content: commentText[post.id] });
                                            setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, _count: { comments: p._count.comments + 1 } } : p));
                                        } catch { /* ignore */ }
                                        setCommentText((prev) => ({ ...prev, [post.id]: '' }));
                                        setShowComments((prev) => ({ ...prev, [post.id]: true }));
                                    }
                                }}
                                placeholder={user ? 'Write a comment and press Enter…' : 'Log in to comment…'}
                                style={{
                                    flex: 1,
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    color: 'var(--text-secondary)',
                                    outline: 'none',
                                    fontSize: 13,
                                }}
                            />
                            <button className="icon-btn" title="Add Emoji"><SmileIcon /></button>
                        </div>
                    </div>
                ))
            )}

            {/* ── Infinite scroll sentinel ─────────────────────────────────── */}
            {!loading && (
                <>
                    {loadingMore && <LoadingSpinner />}
                    {!hasMore && !usingFallback && posts.length > 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '12px 0 4px' }}>
                            ✓ You&apos;re all caught up
                        </div>
                    )}
                    {/* The sentinel — goes out of view → triggers loadMore */}
                    <div ref={sentinelRef} style={{ height: 1 }} />
                </>
            )}
        </div>
    );
}
