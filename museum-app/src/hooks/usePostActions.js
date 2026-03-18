import { useCallback } from 'react';
import { likePost, unlikePost, deletePost } from '../services/postService';

export function usePostActions(user, setPosts) {
    const handleLike = useCallback(async (postId, liked) => {
        if (!user) return;

        // Read current count from state to avoid stale closures
        let currentCount = 0;
        setPosts(prev => {
            const target = prev.find(p => p.id === postId);
            if (target) currentCount = target.likes_count;
            return prev;
        });

        try {
            if (liked) {
                await likePost(user.id, postId, currentCount);
            } else {
                await unlikePost(user.id, postId, currentCount);
            }
        } catch (error) {
            console.error('Like action failed:', error);
        }
    }, [user, setPosts]);

    const handleDelete = useCallback(async (postId) => {
        if (!confirm('Delete this post?')) return;

        try {
            await deletePost(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    }, [setPosts]);

    return { handleLike, handleDelete };
}
