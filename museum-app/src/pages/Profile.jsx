import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/community/PostCard';
import EditProfileModal from '../components/community/EditProfileModal';
import { usePaginatedPosts } from '../hooks/usePaginatedPosts';
import { usePostActions } from '../hooks/usePostActions';
import { fetchProfile } from '../services/profileService';
import { PROFILE_PAGE_SIZE } from '../constants';

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const filter = useMemo(() => ({ user_id: id }), [id]);

    const {
        posts, setPosts, loading, isLoadingMore, observerTarget, hasMore
    } = usePaginatedPosts({ user, pageSize: PROFILE_PAGE_SIZE, filter });

    const { handleLike, handleDelete } = usePostActions(user, setPosts);

    useEffect(() => {
        fetchProfile(id, user, posts).then(profile => {
            if (profile) setProfileUser(profile);
        });
    }, [id, user, posts.length]);

    return (
        <PageTransition>
            <div style={{
                backgroundColor: '#000000', color: '#ffffff',
                minHeight: '100vh', position: 'relative',
                paddingTop: 'clamp(6rem, 12vw, 10rem)',
                paddingBottom: '6rem'
            }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>

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

                    {loading && !posts.length ? (
                        <div style={{ height: '120px' }}></div>
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
                                    {posts.length === 0 ? 'No posts yet' : `${posts.length > 0 && !hasMore.current ? posts.length : posts.length + '+'} Posts Shared`}
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
