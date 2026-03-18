import { supabase } from '../lib/supabase';

export async function fetchComments(postId) {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function fetchCommentLikes(userId, commentIds) {
    if (!userId || !commentIds.length) return {};

    const { data } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId);

    const map = {};
    (data || []).forEach(l => { map[l.comment_id] = true; });
    return map;
}

export async function submitComment(payload) {
    const { data, error } = await supabase
        .from('comments')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function toggleCommentLike(userId, commentId, currentlyLiked, currentCount) {
    if (currentlyLiked) {
        await supabase.from('comment_likes').delete().eq('user_id', userId).eq('comment_id', commentId);
        await supabase.from('comments').update({ likes_count: Math.max(0, currentCount - 1) }).eq('id', commentId);
    } else {
        await supabase.from('comment_likes').insert({ user_id: userId, comment_id: commentId });
        await supabase.from('comments').update({ likes_count: currentCount + 1 }).eq('id', commentId);
    }
}

export async function deleteComment(commentId) {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) throw error;
}
