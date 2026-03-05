import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

/* ─── Upload Modal ─── */
function UploadModal({ onClose, onUploaded }) {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);

    const handleFile = (f) => {
        if (!f || !f.type.startsWith('image/')) return;
        if (f.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
        setFile(f);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(f);
    };

    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

    const handleSubmit = async () => {
        if (!file || !user) return;
        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage.from('community-photos').upload(fileName, file);
            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabase.storage.from('community-photos').getPublicUrl(fileName);

            const { error: insertErr } = await supabase.from('posts').insert({
                user_id: user.id,
                user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Visitor',
                user_avatar: user.user_metadata?.avatar_url || null,
                image_url: publicUrl,
                caption: caption.trim()
            });
            if (insertErr) throw insertErr;

            onUploaded();
            onClose();
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '520px',
                    background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', padding: 'clamp(1.5rem, 4vw, 2.5rem)', overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="serif" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 300, color: '#ffffff', margin: 0, letterSpacing: '0.5px' }}>Share Your Moment</h3>
                    <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem' }}>×</button>
                </div>

                {/* Drop zone */}
                {!preview ? (
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        style={{
                            border: `2px dashed ${dragOver ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '14px', padding: 'clamp(2rem, 6vw, 3rem)',
                            textAlign: 'center', cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: dragOver ? 'rgba(255,255,255,0.03)' : 'transparent'
                        }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="sans" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0, letterSpacing: '1px' }}>
                            Drop an image or <span style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>browse</span>
                        </p>
                        <p className="sans" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', margin: '0.5rem 0 0 0' }}>Max 5MB • JPG, PNG, WebP</p>
                        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                    </div>
                ) : (
                    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
                        <button
                            onClick={() => { setFile(null); setPreview(null); }}
                            style={{
                                position: 'absolute', top: '0.75rem', right: '0.75rem',
                                background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff',
                                width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
                            }}
                        >×</button>
                    </div>
                )}

                {/* Caption */}
                <textarea
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    maxLength={280}
                    className="sans"
                    style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                        padding: '0.85rem', color: '#ffffff', fontSize: '0.85rem',
                        resize: 'none', height: '80px', outline: 'none',
                        marginTop: '1rem', fontFamily: 'inherit', letterSpacing: '0.3px',
                        boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <div className="sans" style={{ textAlign: 'right', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', marginTop: '0.3rem' }}>{caption.length}/280</div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!file || uploading}
                    className="sans"
                    style={{
                        width: '100%', marginTop: '1rem',
                        padding: '14px', borderRadius: '50px',
                        border: 'none', cursor: file && !uploading ? 'pointer' : 'default',
                        background: file ? '#ffffff' : 'rgba(255,255,255,0.08)',
                        color: file ? '#000000' : 'rgba(255,255,255,0.3)',
                        fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '3px',
                        fontWeight: 500, transition: 'all 0.4s ease'
                    }}
                >
                    {uploading ? 'Uploading...' : 'Share'}
                </button>
            </motion.div>
        </motion.div>
    );
}

/* ─── Post Card ─── */
function PostCard({ post, user, onLike, onDelete }) {
    const [liked, setLiked] = useState(post.user_liked);
    const [count, setCount] = useState(post.likes_count);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(post.comment_count || 0);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const commentInputRef = useRef(null);

    const handleLike = async () => {
        if (!user) return;
        const newLiked = !liked;
        setLiked(newLiked);
        setCount(c => c + (newLiked ? 1 : -1));
        await onLike(post.id, newLiked);
    };

    const fetchComments = async () => {
        setLoadingComments(true);
        const { data } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });
        setComments(data || []);
        setLoadingComments(false);
    };

    const toggleComments = () => {
        const next = !showComments;
        setShowComments(next);
        if (next && comments.length === 0) fetchComments();
        if (next) setTimeout(() => commentInputRef.current?.focus(), 200);
    };

    const handleSubmitComment = async () => {
        if (!user || !newComment.trim() || submitting) return;
        setSubmitting(true);
        const commentData = {
            post_id: post.id,
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Visitor',
            user_avatar: user.user_metadata?.avatar_url || null,
            content: newComment.trim()
        };
        const { data, error } = await supabase.from('comments').insert(commentData).select().single();
        if (!error && data) {
            setComments(prev => [...prev, data]);
            setCommentCount(c => c + 1);
            setNewComment('');
        }
        setSubmitting(false);
    };

    const handleDeleteComment = async (commentId) => {
        await supabase.from('comments').delete().eq('id', commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentCount(c => Math.max(0, c - 1));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); }
    };

    const timeAgo = (date) => {
        const diff = (Date.now() - new Date(date).getTime()) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', overflow: 'hidden',
                transition: 'border-color 0.4s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
        >
            {/* Image */}
            <div style={{ position: 'relative', backgroundColor: 'rgba(255,255,255,0.03)', minHeight: '200px' }}>
                <img
                    src={post.image_url}
                    alt={post.caption || 'Community photo'}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    style={{
                        width: '100%', display: 'block',
                        opacity: imgLoaded ? 1 : 0,
                        transition: 'opacity 0.5s ease'
                    }}
                />
            </div>

            {/* Content */}
            <div style={{ padding: 'clamp(0.8rem, 2vw, 1.2rem)' }}>
                {/* User row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    {post.user_avatar ? (
                        <img src={post.user_avatar} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                            {post.user_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="sans" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, letterSpacing: '0.5px' }}>{post.user_name}</span>
                    <span className="sans" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                </div>

                {/* Caption */}
                {post.caption && (
                    <p className="sans" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 0.8rem 0', fontWeight: 300 }}>
                        {post.caption}
                    </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Like */}
                    <button
                        onClick={handleLike}
                        aria-label={liked ? 'Unlike' : 'Like'}
                        style={{
                            background: 'none', border: 'none', cursor: user ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '4px 0',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseDown={e => { if (user) e.currentTarget.style.transform = 'scale(0.9)'; }}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="sans" style={{ fontSize: '0.7rem', color: liked ? '#ef4444' : 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{count}</span>
                    </button>

                    {/* Comment toggle */}
                    <button
                        onClick={toggleComments}
                        aria-label="Comments"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '4px 0',
                            color: showComments ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
                            transition: 'color 0.3s ease'
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="sans" style={{ fontSize: '0.7rem', fontWeight: 500 }}>{commentCount}</span>
                    </button>

                    {/* Delete post */}
                    {user && user.id === post.user_id && (
                        <button
                            onClick={() => onDelete(post.id)}
                            aria-label="Delete post"
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                marginLeft: 'auto', padding: '4px',
                                color: 'rgba(255,255,255,0.15)', transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,100,100,0.6)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ─── Comments Section ─── */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.8rem', paddingTop: '0.8rem' }}>
                                {/* Comment list */}
                                {loadingComments ? (
                                    <p className="sans" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '0.5rem 0' }}>Loading...</p>
                                ) : comments.length === 0 ? (
                                    <p className="sans" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '0.5rem 0' }}>No comments yet</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '0.6rem' }}>
                                        {comments.map(c => (
                                            <motion.div
                                                key={c.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', group: 'comment' }}
                                            >
                                                {c.user_avatar ? (
                                                    <img src={c.user_avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, marginTop: '2px' }} />
                                                ) : (
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)' }}>
                                                        {c.user_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                                        <span className="sans" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{c.user_name}</span>
                                                        <span className="sans" style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.15)' }}>{timeAgo(c.created_at)}</span>
                                                        {user && user.id === c.user_id && (
                                                            <button
                                                                onClick={() => handleDeleteComment(c.id)}
                                                                aria-label="Delete comment"
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.1)', fontSize: '0.6rem', padding: '0 2px', marginLeft: 'auto', transition: 'color 0.2s ease' }}
                                                                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,100,100,0.5)'}
                                                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.1)'}
                                                            >×</button>
                                                        )}
                                                    </div>
                                                    <p className="sans" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: '0.15rem 0 0 0', fontWeight: 300, wordBreak: 'break-word' }}>{c.content}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Comment input */}
                                {user ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            ref={commentInputRef}
                                            type="text"
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Add a comment..."
                                            maxLength={500}
                                            className="sans"
                                            style={{
                                                flex: 1, background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                                                padding: '0.5rem 0.7rem', color: '#ffffff', fontSize: '0.72rem',
                                                outline: 'none', fontFamily: 'inherit', letterSpacing: '0.2px',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                                        />
                                        <button
                                            onClick={handleSubmitComment}
                                            disabled={!newComment.trim() || submitting}
                                            className="sans"
                                            style={{
                                                background: newComment.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.06)',
                                                color: newComment.trim() ? '#000' : 'rgba(255,255,255,0.2)',
                                                border: 'none', borderRadius: '8px',
                                                padding: '0.5rem 0.8rem', cursor: newComment.trim() ? 'pointer' : 'default',
                                                fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1.5px',
                                                fontWeight: 600, transition: 'all 0.3s ease', flexShrink: 0
                                            }}
                                        >
                                            {submitting ? '...' : 'Post'}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="sans" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '0.3rem 0 0 0' }}>Sign in to comment</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ─── Main Community Page ─── */
export default function Community() {
    const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) { console.error('Fetch error:', error); setLoading(false); return; }

        if (data && data.length > 0) {
            // Get comment counts
            const { data: commentCounts } = await supabase
                .from('comments')
                .select('post_id');

            const countMap = {};
            (commentCounts || []).forEach(c => { countMap[c.post_id] = (countMap[c.post_id] || 0) + 1; });
            data.forEach(p => p.comment_count = countMap[p.id] || 0);

            // Check which posts the user has liked
            if (user) {
                const { data: userLikes } = await supabase
                    .from('likes')
                    .select('post_id')
                    .eq('user_id', user.id);

                const likedSet = new Set((userLikes || []).map(l => l.post_id));
                data.forEach(p => p.user_liked = likedSet.has(p.id));
            }
        }

        setPosts(data || []);
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

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
                {/* ─── Header ─── */}
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="sans"
                        style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)', letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '1.2rem' }}
                    >
                        From Our Visitors
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="serif"
                        style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: 300, letterSpacing: '1.5px', margin: '0 0 1.5rem 0' }}
                    >
                        Community
                    </motion.h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '60px' }}
                        transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: '2rem' }}
                    />

                    {/* ─── Auth + Upload Row ─── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
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
                                    <button
                                        onClick={() => setShowUpload(true)}
                                        className="sans"
                                        style={{
                                            background: '#ffffff', color: '#000000',
                                            border: 'none', borderRadius: '50px',
                                            padding: '10px 24px', cursor: 'pointer',
                                            fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '3px',
                                            fontWeight: 500, transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        + Share
                                    </button>
                                    <button
                                        onClick={signOut}
                                        className="sans"
                                        style={{
                                            background: 'transparent', color: 'rgba(255,255,255,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px',
                                            padding: '10px 18px', cursor: 'pointer',
                                            fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={signInWithGoogle}
                                    className="sans"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        background: 'transparent', color: '#ffffff',
                                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px',
                                        padding: '12px 24px', cursor: 'pointer',
                                        fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '3px',
                                        transition: 'all 0.4s ease'
                                    }}
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
                            <motion.p
                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="sans"
                                style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', letterSpacing: '2px' }}
                            >
                                Loading moments...
                            </motion.p>
                        </div>
                    ) : posts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            style={{ textAlign: 'center', padding: 'clamp(3rem, 10vw, 6rem) 0' }}
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                            <h3 className="serif" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 300, color: 'rgba(255,255,255,0.3)', margin: '0 0 0.8rem 0' }}>No moments yet</h3>
                            <p className="sans" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>Be the first to share your experience.</p>
                        </motion.div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                            gap: 'clamp(1rem, 3vw, 1.5rem)'
                        }}>
                            <AnimatePresence mode="popLayout">
                                {posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        user={user}
                                        onLike={handleLike}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* ─── Upload Modal ─── */}
                <AnimatePresence>
                    {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={fetchPosts} />}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
