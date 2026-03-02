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
    user: { id?: string; username: string; displayName?: string; avatarUrl?: string };
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
function Avatar({ name, image, color = '#555', size = 40 }: { name: string; image?: string; color?: string; size?: number }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: image ? 'var(--bg-card)' : `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: size * 0.38,
                color: '#fff',
                flexShrink: 0,
                overflow: 'hidden',
                border: '1px solid var(--border)',
            }}
        >
            {image ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name[0].toUpperCase()}
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

interface Comment {
    id: string;
    postId: string;
    userId: string;
    parentCommentId: string | null;
    content: string;
    score: number;
    createdAt: string;
    user: { id: string; username: string; displayName?: string; avatarUrl?: string };
    userVote: number | null;
    children: Comment[];
    depth: number;
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
    const [postError, setPostError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [commentText, setCommentText] = useState<Record<string, string>>({});
    const [showComments, setShowComments] = useState<Record<string, boolean>>({});
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
    const sentinelRef = useRef<HTMLDivElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
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
        if (usingFallback) return; // fallback posts can't be liked
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

    async function toggleComments(postId: string) {
        const next = !showComments[postId];
        setShowComments((prev) => ({ ...prev, [postId]: next }));
        if (next && !comments[postId]) {
            setCommentLoading((prev) => ({ ...prev, [postId]: true }));
            try {
                const res = await api.get<any[]>(`/api/posts/${postId}/comments`);
                setComments((prev) => ({ ...prev, [postId]: res }));
            } catch {
                setComments((prev) => ({ ...prev, [postId]: [] }));
            } finally {
                setCommentLoading((prev) => ({ ...prev, [postId]: false }));
            }
        }
    }

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'gameon_unsigned');

        try {
            const isVideo = file.type.startsWith('video/');
            const endpoint = isVideo ? 'video' : 'image';
            setMediaType(isVideo ? 'video' : 'image');

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${endpoint}/upload`,
                { method: 'POST', body: formData }
            );
            const data = await res.json();
            if (data.secure_url) {
                setMediaUrl(data.secure_url);
            }
        } catch (err) {
            setPostError('Upload failed. Try again.');
        } finally {
            setUploading(false);
        }
    };

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        if (!user) { router.push('/auth'); return; }
        if (!newPost.trim() && !mediaUrl) return;
        setSubmitting(true);
        setPostError('');
        try {
            const games = await api.get<{ games: Array<{ slug: string }> }>('/api/games');
            const slug = games.games[0]?.slug;
            if (!slug) { setPostError('No games found. The database may not be seeded yet.'); return; }
            const created = await api.post<Post>(`/api/games/${slug}/posts`, {
                title: newPost.slice(0, 80),
                content: newPost,
                image: mediaUrl || undefined,
            });
            setPosts((prev) => [created, ...prev]);
            setNewPost('');
            setMediaUrl('');
            setMediaType(null);
            setUsingFallback(false);
        } catch (err: any) {
            setPostError(err.message || 'Failed to create post. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
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
            <form onSubmit={handleCreatePost} className="card fade-in" style={{ animationDelay: '0.06s', flexShrink: 0, gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Avatar
                        name={user?.displayName || user?.username || '?'}
                        image={user?.avatarUrl}
                        color="#f5d000"
                        size={42}
                    />
                    <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder={user ? "What's on your mind, gamer?" : "Log in to share your clips..."}
                        disabled={!user}
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: 15,
                            outline: 'none',
                            resize: 'none',
                            minHeight: 60,
                            padding: '8px 0',
                        }}
                    />
                </div>

                {mediaUrl && (
                    <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
                        {mediaType === 'video' ? (
                            <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 300, background: '#000' }} />
                        ) : (
                            <img src={mediaUrl} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                        )}
                        <button
                            type="button"
                            onClick={() => { setMediaUrl(''); setMediaType(null); }}
                            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 14 }}
                        >✕</button>
                    </div>
                )}

                {postError && (
                    <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, padding: '8px 12px', color: '#ff6b6b', fontSize: 12 }}>
                        {postError}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <input type="file" ref={mediaInputRef} onChange={handleMediaUpload} style={{ display: 'none' }} accept="image/*,video/*" />
                    {[
                        { icon: <ImageIcon />, label: uploading && mediaType !== 'video' ? 'Uploading...' : 'Photo', onClick: () => mediaInputRef.current?.click() },
                        { icon: <VideoIcon />, label: uploading && mediaType === 'video' ? 'Uploading...' : 'Video', onClick: () => mediaInputRef.current?.click() },
                        { icon: <SmileIcon />, label: 'Feeling' },
                    ].map((btn, i) => (
                        <button
                            key={i}
                            type="button"
                            className="btn-outline-small"
                            onClick={btn.onClick}
                            disabled={uploading || !user}
                            style={{ gap: 6, fontSize: 12, padding: '6px 12px', opacity: !user ? 0.5 : 1 }}
                        >
                            {btn.icon} {btn.label}
                        </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button
                        type="submit"
                        className="btn-yellow yellow-glow"
                        disabled={submitting || uploading || (!newPost.trim() && !mediaUrl)}
                        style={{ padding: '7px 24px', opacity: submitting || uploading ? 0.6 : 1, fontSize: 13, fontWeight: 700 }}
                    >
                        {submitting ? 'Posting...' : 'Post it!'}
                    </button>
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
                                <Avatar
                                    name={post.user.displayName || post.user.username}
                                    image={post.user.avatarUrl}
                                    color={['#4facfe', '#ff6b35', '#f5a623', '#20c997', '#e83e8c'][idx % 5]}
                                    size={42}
                                />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{post.user.displayName || post.user.username}</span>
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

                        {/* Post image (from seed or fallback) or video */}
                        {post.image && (
                            <div
                                style={{
                                    width: '100%',
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    marginBottom: 12,
                                    background: 'var(--bg-card)',
                                }}
                            >
                                {post.image.includes('/video/upload') ? (
                                    <video src={post.image} controls style={{ width: '100%', maxHeight: 400 }} />
                                ) : (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
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
                                onClick={() => toggleComments(post.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: showComments[post.id] ? 'var(--accent-yellow)' : 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <MessageIcon /> {post._count.comments}
                            </button>
                            <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <ShareIcon /> Share
                            </button>
                        </div>

                        {/* Comments Section */}
                        {showComments[post.id] && (
                            <div style={{ marginTop: 12, marginBottom: 4 }}>
                                {commentLoading[post.id] ? (
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '4px 0' }}>Loading comments…</div>
                                ) : (comments[post.id] || []).length === 0 ? (
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '4px 0' }}>No comments yet. Be the first!</div>
                                ) : (
                                    (comments[post.id] || []).map((c: any) => (
                                        <div key={c.id} style={{ display: 'flex', gap: 8, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                                            <Avatar
                                                name={c.user.displayName || c.user.username}
                                                image={c.user.avatarUrl}
                                                color="#4facfe"
                                                size={28}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                                                    <span style={{ fontWeight: 700, fontSize: 12 }}>{c.user.displayName || c.user.username}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{timeAgo(c.createdAt)}</span>
                                                </div>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>{c.content}</p>
                                                {c.children?.map((child: any) => (
                                                    <div key={child.id} style={{ display: 'flex', gap: 8, marginTop: 8, paddingLeft: 16, borderLeft: '2px solid var(--border)' }}>
                                                        <Avatar
                                                            name={child.user.displayName || child.user.username}
                                                            image={child.user.avatarUrl}
                                                            color="#20c997"
                                                            size={22}
                                                        />
                                                        <div>
                                                            <span style={{ fontWeight: 700, fontSize: 11 }}>{child.user.displayName || child.user.username}</span>
                                                            <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 6 }}>{timeAgo(child.createdAt)}</span>
                                                            <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: '2px 0 0' }}>{child.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Comment Box */}
                        <hr className="sep" style={{ margin: '10px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar
                                name={user?.displayName || user?.username || '?'}
                                image={user?.avatarUrl}
                                color="#f5d000"
                                size={30}
                            />
                            <input
                                value={commentText[post.id] || ''}
                                onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && commentText[post.id]?.trim()) {
                                        if (!user) { router.push('/auth'); return; }
                                        try {
                                            const newComment = await api.post<any>(`/api/posts/${post.id}/comments`, { content: commentText[post.id] });
                                            setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, _count: { comments: p._count.comments + 1 } } : p));
                                            setComments((prev) => ({ ...prev, [post.id]: [newComment, ...(prev[post.id] || [])] }));
                                            setShowComments((prev) => ({ ...prev, [post.id]: true }));
                                        } catch { /* ignore */ }
                                        setCommentText((prev) => ({ ...prev, [post.id]: '' }));
                                    }
                                }}
                                placeholder={user ? 'Write a comment…' : 'Log in to comment…'}
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
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!commentText[post.id]?.trim()) return;
                                    if (!user) { router.push('/auth'); return; }
                                    try {
                                        const newComment = await api.post<any>(`/api/posts/${post.id}/comments`, { content: commentText[post.id] });
                                        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, _count: { comments: p._count.comments + 1 } } : p));
                                        setComments((prev) => ({ ...prev, [post.id]: [newComment, ...(prev[post.id] || [])] }));
                                        setShowComments((prev) => ({ ...prev, [post.id]: true }));
                                    } catch { /* ignore */ }
                                    setCommentText((prev) => ({ ...prev, [post.id]: '' }));
                                }}
                                style={{
                                    background: 'var(--accent-yellow)', border: 'none',
                                    borderRadius: 8, padding: '8px 14px',
                                    color: '#111', fontWeight: 700, fontSize: 12,
                                    cursor: 'pointer', flexShrink: 0,
                                }}
                            >
                                Send
                            </button>
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
        </>
    );
}
