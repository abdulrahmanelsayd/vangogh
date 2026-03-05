import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PostCard from '../components/community/PostCard';
import EditProfileModal from '../components/community/EditProfileModal';

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Pagination refs
    const pageRef = useRef(0);
    const hasMoreRef = useRef(true);
    const loadingMoreRef = useRef(false);
    const observerTarget = useRef(null);

    /* ── Fetch Profile User Info & Posts ── */
    const fetchProfileData = useCallback(async (reset = false) => {
        if (!reset && (!hasMoreRef.current || loadingMoreRef.current)) return;

        const currentPage = reset ? 0 : pageRef.current;
        if (reset) {
            setLoading(true);
            hasMoreRef.current = true;
        } else {
            loadingMoreRef.current = true;
            setIsLoadingMore(true);
        }

        const start = currentPage * 12;
        const end = start + 11; // Fetch 12 posts per page for profile grid

        const { data, error } = await supabase
            .from('posts').select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            console.error('Fetch error:', error);
            if (reset) setLoading(false);
            else { loadingMoreRef.current = false; setIsLoadingMore(false); }
            return;
        }

        if (reset) {
            // 1. Try to fetch from proper profiles table (gets bio)
            const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', id).single();

            if (profileRow) {
                setProfileUser({
                    id: profileRow.id,
                    name: profileRow.full_name,
                    avatar: profileRow.avatar_url,
                    bio: profileRow.bio
                });
            } else if (id === user?.id) {
                // 2. Fallback to auth context if viewing own profile but no row exists yet
                setProfileUser({
                    id: user.id,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Visitor',
                    avatar: user.user_metadata?.avatar_url,
                    bio: ''
                });
            } else if (data?.length > 0) {
                // 3. Fallback to post metadata for backwards compatibility
                setProfileUser({
                    id: data[0].user_id,
                    name: data[0].user_name,
                    avatar: data[0].user_avatar,
                    bio: ''
                });
            }
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

        hasMoreRef.current = data?.length === 12;

        setPosts(prev => {
            if (reset) return data || [];
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = (data || []).filter(p => !existingIds.has(p.id));
            return [...prev, ...newPosts];
        });

        pageRef.current = currentPage + 1;
        setLoading(false);
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
    }, [id, user]);

    // Initial load
    useEffect(() => { fetchProfileData(true); }, [fetchProfileData]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting) fetchProfileData(false); },
            { threshold: 0.1, rootMargin: '400px' }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [fetchProfileData]);

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

                    {/* ─── Back Button ─── */}
                    <button
                        onClick={() => navigate('/community')}
                        className="sans"
                        style={{
                            background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                            fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px',
                            marginBottom: '3rem', padding: 0, transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Community
                    </button>

                    {/* ─── Profile Header ─── */}
                    {loading && !posts.length ? (
                        <div style={{ height: '120px' }}></div> // Spacer while loading
                    ) : profileUser ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: 'clamp(3rem, 8vw, 5rem)',
                                paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {profileUser.avatar ? (
                                <img src={profileUser.avatar} alt={profileUser.name} referrerPolicy="no-referrer" style={{ width: 'clamp(80px, 12vw, 120px)', height: 'clamp(80px, 12vw, 120px)', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                            ) : (
                                <div style={{
                                    width: 'clamp(80px, 12vw, 120px)', height: 'clamp(80px, 12vw, 120px)', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'rgba(255,255,255,0.4)', border: '2px solid rgba(255,255,255,0.1)'
                                }}>
                                    {profileUser.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                    <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, letterSpacing: '1px', margin: 0 }}>
                                        {profileUser.name}
                                    </h1>
                                    {user && user.id === profileUser.id && (
                                        <button onClick={() => setIsEditing(true)} aria-label="Edit Profile"
                                            className="sans" style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'all 0.3s ease' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {profileUser.bio && (
                                    <p className="sans" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 1rem 0', lineHeight: 1.6, maxWidth: '600px' }}>
                                        {profileUser.bio}
                                    </p>
                                )}

                                <p className="sans" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {posts.length === 0 ? 'No posts yet' : `${posts.length > 0 && !hasMoreRef.current ? posts.length : posts.length + '+'} Posts Shared`}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 'clamp(3rem, 8vw, 5rem)' }}>
                            <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                                User Not Found
                            </h1>
                        </div>
                    )}

                    {/* ─── Posts Grid ─── */}
                    {loading && !posts.length ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <motion.p animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                                className="sans" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', letterSpacing: '2px' }}>
                                Loading gallery...
                            </motion.p>
                        </div>
                    ) : !posts.length && profileUser ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <p className="sans" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>This space is empty.</p>
                        </motion.div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'clamp(1rem, 3vw, 1.5rem)' }}>
                                <AnimatePresence mode="popLayout">
                                    {posts.map(post => (
                                        <PostCard key={post.id} post={post} user={user} onLike={handleLike} onDelete={handleDelete} isProfileView={true} />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Infinite Scroll target */}
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
            </div>

            <EditProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                user={user}
                currentProfile={profileUser}
                onUpdate={(newProfile) => setProfileUser(prev => ({ ...prev, name: newProfile.full_name, bio: newProfile.bio, avatar: newProfile.avatar_url }))}
            />
        </PageTransition>
    );
}
