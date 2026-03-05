import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UploadModal from '../components/community/UploadModal';
import PostCard from '../components/community/PostCard';

export default function Community() {
    const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    // Pagination refs (useRef avoids dependency loops in effects)
    const pageRef = useRef(0);
    const hasMoreRef = useRef(true);
    const loadingMoreRef = useRef(false);
    const observerTarget = useRef(null);

    /* ── Fetch Posts (Initial & Pagination) ── */
    const fetchPosts = useCallback(async (reset = false) => {
        if (!reset && (!hasMoreRef.current || loadingMoreRef.current)) return;

        const currentPage = reset ? 0 : pageRef.current;
        if (reset) {
            setLoading(true);
            hasMoreRef.current = true;
        } else {
            loadingMoreRef.current = true;
            setIsLoadingMore(true);
        }

        const start = currentPage * 10;
        const end = start + 9; // Fetch 10 posts

        const { data, error } = await supabase
            .from('posts').select('*')
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            console.error('Fetch error:', error);
            if (reset) setLoading(false);
            else { loadingMoreRef.current = false; setIsLoadingMore(false); }
            return;
        }

        if (data?.length) {
            const postIds = data.map(p => p.id);
            const { data: commentCounts } = await supabase.from('comments').select('post_id').is('parent_id', null).in('post_id', postIds);
            const countMap = {};
            (commentCounts || []).forEach(c => { countMap[c.post_id] = (countMap[c.post_id] || 0) + 1; });
            data.forEach(p => p.comment_count = countMap[p.id] || 0);

            if (user) {
                const { data: userLikes } = await supabase
                    .from('likes').select('post_id')
                    .eq('user_id', user.id).in('post_id', postIds);
                const likedSet = new Set((userLikes || []).map(l => l.post_id));
                data.forEach(p => p.user_liked = likedSet.has(p.id));
            }
        }

        hasMoreRef.current = data?.length === 10;

        setPosts(prev => {
            if (reset) return data || [];
            // Prevent duplicates (e.g., if realtime inserted it)
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = (data || []).filter(p => !existingIds.has(p.id));
            return [...prev, ...newPosts];
        });

        pageRef.current = currentPage + 1;
        setLoading(false);
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
    }, [user]);

    // Initial load when user changes
    useEffect(() => { fetchPosts(true); }, [fetchPosts]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    fetchPosts(false);
                }
            },
            { threshold: 0.1, rootMargin: '200px' } // Trigger 200px before bottom
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [fetchPosts]);

    /* ── Realtime: live posts feed ── */
    useEffect(() => {
        const channel = supabase
            .channel('community-posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                const newPost = { ...payload.new, comment_count: 0, user_liked: false };
                setPosts(prev => [newPost, ...prev]);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
                setPosts(prev => prev.filter(p => p.id !== payload.old.id));
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
                setPosts(prev => prev.map(p => p.id === payload.new.id
                    ? { ...p, likes_count: payload.new.likes_count, caption: payload.new.caption }
                    : p
                ));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    /* ── Like / Delete handlers ── */
    const handleLike = async (postId, liked) => {
        if (!user) return;
        if (liked) {
            await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
            await supabase.from('posts').update({ likes_count: posts.find(p => p.id === postId).likes_count + 1 }).eq('id', postId);
        } else {
            await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId);
            await supabase.from('posts').update({ likes_count: Math.max(0, posts.find(p => p.id === postId).likes_count - 1) }).eq('id', postId);
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('Delete this post?')) return;
        await supabase.from('likes').delete().eq('post_id', postId);
        await supabase.from('posts').delete().eq('id', postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    return (
        <PageTransition>
            <div style={{
                backgroundColor: '#000000', color: '#ffffff',
                minHeight: '100vh', position: 'relative',
                paddingTop: 'clamp(6rem, 12vw, 10rem)',
                paddingBottom: '6rem'
            }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>
                    {/* ─── Header ─── */}
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="sans"
                        style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)', letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '1.2rem' }}
                    >From Our Visitors</motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="serif"
                        style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: 300, letterSpacing: '1.5px', margin: '0 0 1.5rem 0' }}
                    >Community</motion.h1>

                    <motion.div
                        initial={{ width: 0 }} animate={{ width: '60px' }}
                        transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: '2rem' }}
                    />

                    {/* ─── Auth + Upload Row ─── */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: 'clamp(2rem, 6vw, 4rem)' }}
                    >
                        <p className="sans" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.7, maxWidth: '500px', margin: 0 }}>
                            Share your visit, your favorite painting, or the moment that moved you.
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {authLoading ? null : user ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {user.user_metadata?.avatar_url && (
                                            <img src={user.user_metadata.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                        )}
                                        <span className="sans" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
                                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <button onClick={() => setShowUpload(true)} className="sans"
                                        style={{ background: '#ffffff', color: '#000000', border: 'none', borderRadius: '50px', padding: '10px 24px', cursor: 'pointer', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 500, transition: 'all 0.3s ease' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >+ Share</button>
                                    <button onClick={signOut} className="sans"
                                        style={{ background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', padding: '10px 18px', cursor: 'pointer', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'all 0.3s ease' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                                    >Sign Out</button>
                                </>
                            ) : (
                                <button onClick={signInWithGoogle} className="sans"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '12px 24px', cursor: 'pointer', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '3px', transition: 'all 0.4s ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign in to Share
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* ─── Posts Grid ─── */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <motion.p animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                                className="sans" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', letterSpacing: '2px' }}>
                                Loading moments...
                            </motion.p>
                        </div>
                    ) : !posts.length ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
                            style={{ textAlign: 'center', padding: 'clamp(3rem, 10vw, 6rem) 0' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                            <h3 className="serif" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 300, color: 'rgba(255,255,255,0.3)', margin: '0 0 0.8rem 0' }}>No moments yet</h3>
                            <p className="sans" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>Be the first to share your experience.</p>
                        </motion.div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'clamp(1rem, 3vw, 1.5rem)' }}>
                                <AnimatePresence mode="popLayout">
                                    {posts.map(post => (
                                        <PostCard key={post.id} post={post} user={user} onLike={handleLike} onDelete={handleDelete} />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Infinite Scroll Observer Target */}
                            <div ref={observerTarget} style={{ padding: '3rem 0', textAlign: 'center', height: '60px' }}>
                                {isLoadingMore && (
                                    <motion.p animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                                        className="sans" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', letterSpacing: '2px' }}>
                                        Loading more...
                                    </motion.p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <AnimatePresence>
                    {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={() => fetchPosts(true)} />}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
