import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/timeAgo';

/* ─── Comment Item (internal) ─── */
function CommentItem({ comment, user, isReply, commentLikes, onLike, onReply, onDelete }) {
    const size = isReply ? '18px' : '20px';
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', paddingLeft: isReply ? '1.5rem' : 0 }}
        >
            {comment.user_avatar ? (
                <img src={comment.user_avatar} alt="" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, marginTop: '2px' }} />
            ) : (
                <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)' }}>
                    {comment.user_name.charAt(0).toUpperCase()}
                </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="sans" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{comment.user_name}</span>
                    <span className="sans" style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)' }}>{timeAgo(comment.created_at)}</span>
                </div>
                <p className="sans" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: '0.15rem 0 0.3rem 0', fontWeight: 300, wordBreak: 'break-word' }}>{comment.content}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    {/* Like */}
                    <button onClick={() => onLike(comment.id)}
                        style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill={commentLikes[comment.id] ? '#ef4444' : 'none'} stroke={commentLikes[comment.id] ? '#ef4444' : 'rgba(255,255,255,0.2)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {(comment.likes_count || 0) > 0 && <span className="sans" style={{ fontSize: '0.58rem', color: commentLikes[comment.id] ? '#ef4444' : 'rgba(255,255,255,0.2)', fontWeight: 500 }}>{comment.likes_count}</span>}
                    </button>

                    {/* Reply */}
                    {user && !isReply && (
                        <button onClick={() => onReply(comment)} className="sans"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', padding: 0, letterSpacing: '0.5px', transition: 'color 0.2s ease' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                        >Reply</button>
                    )}

                    {/* Delete */}
                    {user && user.id === comment.user_id && (
                        <button onClick={() => onDelete(comment.id)} aria-label="Delete comment"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.1)', fontSize: '0.55rem', padding: 0, transition: 'color 0.2s ease' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,100,100,0.5)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.1)'}
                        >×</button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Post Card ─── */
export default function PostCard({ post, user, onLike, onDelete }) {
    const [liked, setLiked] = useState(post.user_liked);
    const [count, setCount] = useState(post.likes_count);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentLikes, setCommentLikes] = useState({});
    const [commentCount, setCommentCount] = useState(post.comment_count || 0);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const commentInputRef = useRef(null);

    /* ── Post Like ── */
    const handleLike = async () => {
        if (!user) return;
        const next = !liked;
        setLiked(next);
        setCount(c => c + (next ? 1 : -1));
        await onLike(post.id, next);
    };

    /* ── Comments CRUD ── */
    const fetchComments = async () => {
        setLoadingComments(true);
        const { data } = await supabase
            .from('comments').select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });
        setComments(data || []);

        if (user && data?.length) {
            const { data: myLikes } = await supabase
                .from('comment_likes').select('comment_id')
                .eq('user_id', user.id);
            const map = {};
            (myLikes || []).forEach(l => { map[l.comment_id] = true; });
            setCommentLikes(map);
        }
        setLoadingComments(false);
    };

    const toggleComments = () => {
        const next = !showComments;
        setShowComments(next);
        if (next && !comments.length) fetchComments();
        if (next) setTimeout(() => commentInputRef.current?.focus(), 200);
    };

    const submitComment = async () => {
        if (!user || !newComment.trim() || submitting) return;
        setSubmitting(true);
        const payload = {
            post_id: post.id, user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Visitor',
            user_avatar: user.user_metadata?.avatar_url || null,
            content: newComment.trim(), parent_id: replyTo || null
        };
        const { data, error } = await supabase.from('comments').insert(payload).select().single();
        if (!error && data) {
            setComments(prev => [...prev, data]);
            if (!replyTo) setCommentCount(c => c + 1);
            setNewComment('');
            setReplyTo(null);
        }
        setSubmitting(false);
    };

    const likeComment = async (id) => {
        if (!user) return;
        const wasLiked = commentLikes[id];
        setCommentLikes(prev => ({ ...prev, [id]: !wasLiked }));
        setComments(prev => prev.map(c => c.id === id ? { ...c, likes_count: (c.likes_count || 0) + (wasLiked ? -1 : 1) } : c));
        if (wasLiked) {
            await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', id);
            await supabase.from('comments').update({ likes_count: Math.max(0, (comments.find(c => c.id === id)?.likes_count || 1) - 1) }).eq('id', id);
        } else {
            await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: id });
            await supabase.from('comments').update({ likes_count: (comments.find(c => c.id === id)?.likes_count || 0) + 1 }).eq('id', id);
        }
    };

    const deleteComment = async (id) => {
        const target = comments.find(c => c.id === id);
        const isTopLevel = !target?.parent_id;
        const repliesCount = isTopLevel ? comments.filter(c => c.parent_id === id).length : 0;
        await supabase.from('comments').delete().eq('id', id);
        setComments(prev => prev.filter(c => c.id !== id && c.parent_id !== id));
        if (isTopLevel) setCommentCount(c => Math.max(0, c - 1));
    };

    const startReply = (comment) => {
        setReplyTo(comment.id);
        setNewComment(`@${comment.user_name} `);
        setTimeout(() => commentInputRef.current?.focus(), 100);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }
        if (e.key === 'Escape') { setReplyTo(null); setNewComment(''); }
    };

    /* ── Threading ── */
    const topLevel = comments.filter(c => !c.parent_id);
    const getReplies = (pid) => comments.filter(c => c.parent_id === pid);

    /* ── Realtime: live comments ── */
    useEffect(() => {
        const channel = supabase
            .channel(`comments-${post.id}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'comments',
                filter: `post_id=eq.${post.id}`
            }, (payload) => {
                setComments(prev => {
                    if (prev.some(c => c.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
                if (!payload.new.parent_id) setCommentCount(c => c + 1);
            })
            .on('postgres_changes', {
                event: 'DELETE', schema: 'public', table: 'comments',
                filter: `post_id=eq.${post.id}`
            }, (payload) => {
                const deleted = payload.old;
                if (deleted?.id) {
                    setComments(prev => prev.filter(c => c.id !== deleted.id && c.parent_id !== deleted.id));
                    if (!deleted.parent_id) setCommentCount(c => Math.max(0, c - 1));
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: 'comments',
                filter: `post_id=eq.${post.id}`
            }, (payload) => {
                setComments(prev => prev.map(c =>
                    c.id === payload.new.id ? { ...c, likes_count: payload.new.likes_count } : c
                ));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [post.id]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.4s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
        >
            {/* Media */}
            <div style={{ position: 'relative', backgroundColor: 'rgba(255,255,255,0.03)', minHeight: '200px' }}>
                {post.media_type === 'video' ? (
                    <video
                        src={post.image_url}
                        controls
                        playsInline
                        loop
                        preload="metadata"
                        style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover' }}
                        onLoadedData={() => setImgLoaded(true)}
                    />
                ) : (
                    <img src={post.image_url} alt={post.caption || 'Community photo'} loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        style={{ width: '100%', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }} />
                )}
            </div>

            <div style={{ padding: 'clamp(0.8rem, 2vw, 1.2rem)' }}>
                {/* User row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isProfileView) window.location.href = `/profile/${post.user_id}`;
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            cursor: isProfileView ? 'default' : 'pointer',
                            opacity: 1, transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={e => !isProfileView && (e.currentTarget.style.opacity = 0.8)}
                        onMouseLeave={e => !isProfileView && (e.currentTarget.style.opacity = 1)}
                    >
                        {post.user_avatar
                            ? <img src={post.user_avatar} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                            : <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{post.user_name.charAt(0).toUpperCase()}</div>
                        }
                        <span className="sans" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, letterSpacing: '0.5px' }}>{post.user_name}</span>
                    </div>
                    <span className="sans" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                </div>

                {post.caption && <p className="sans" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 0.8rem 0', fontWeight: 300 }}>{post.caption}</p>}

                {/* Actions row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={handleLike} aria-label={liked ? 'Unlike' : 'Like'}
                        style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '4px 0', transition: 'transform 0.2s ease' }}
                        onMouseDown={e => { if (user) e.currentTarget.style.transform = 'scale(0.9)'; }}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="sans" style={{ fontSize: '0.7rem', color: liked ? '#ef4444' : 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{count}</span>
                    </button>

                    <button onClick={toggleComments} aria-label="Comments"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '4px 0', color: showComments ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', transition: 'color 0.3s ease' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="sans" style={{ fontSize: '0.7rem', fontWeight: 500 }}>{commentCount}</span>
                    </button>

                    {user && user.id === post.user_id && (
                        <button onClick={() => onDelete(post.id)} aria-label="Delete post"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', padding: '4px', color: 'rgba(255,255,255,0.15)', transition: 'color 0.3s ease' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,100,100,0.6)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ── Comments Section ── */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.8rem', paddingTop: '0.8rem' }}>
                                {loadingComments ? (
                                    <p className="sans" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '0.5rem 0' }}>Loading...</p>
                                ) : !comments.length ? (
                                    <p className="sans" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '0.5rem 0' }}>No comments yet</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', marginBottom: '0.6rem' }}>
                                        {topLevel.map(c => (
                                            <React.Fragment key={c.id}>
                                                <CommentItem comment={c} user={user} isReply={false} commentLikes={commentLikes} onLike={likeComment} onReply={startReply} onDelete={deleteComment} />
                                                {getReplies(c.id).map(r => (
                                                    <CommentItem key={r.id} comment={r} user={user} isReply={true} commentLikes={commentLikes} onLike={likeComment} onReply={startReply} onDelete={deleteComment} />
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}

                                {replyTo && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                        <span className="sans" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>
                                            Replying to {comments.find(c => c.id === replyTo)?.user_name || '...'}
                                        </span>
                                        <button onClick={() => { setReplyTo(null); setNewComment(''); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', padding: '0 2px' }}>×</button>
                                    </div>
                                )}

                                {user ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input ref={commentInputRef} type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={onKeyDown}
                                            placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'} maxLength={500} className="sans"
                                            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${replyTo ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', padding: '0.5rem 0.7rem', color: '#fff', fontSize: '0.72rem', outline: 'none', fontFamily: 'inherit', letterSpacing: '0.2px', transition: 'border-color 0.3s ease' }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                            onBlur={e => e.target.style.borderColor = replyTo ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'} />
                                        <button onClick={submitComment} disabled={!newComment.trim() || submitting} className="sans"
                                            style={{ background: newComment.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.06)', color: newComment.trim() ? '#000' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '0.5rem 0.8rem', cursor: newComment.trim() ? 'pointer' : 'default', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, transition: 'all 0.3s ease', flexShrink: 0 }}>
                                            {submitting ? '...' : replyTo ? 'Reply' : 'Post'}
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
