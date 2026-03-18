import { supabase } from '../lib/supabase';

export async function fetchPostsPage(start, end, filter = null) {
    let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end);

    if (filter?.user_id) {
        query = query.eq('user_id', filter.user_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function enrichWithCommentCounts(posts) {
    if (!posts.length) return posts;

    const postIds = posts.map(p => p.id);
    const { data: commentRows } = await supabase
        .from('comments')
        .select('post_id')
        .is('parent_id', null)
        .in('post_id', postIds);

    const countMap = {};
    (commentRows || []).forEach(c => {
        countMap[c.post_id] = (countMap[c.post_id] || 0) + 1;
    });

    posts.forEach(p => { p.comment_count = countMap[p.id] || 0; });
    return posts;
}

export async function enrichWithUserLikes(posts, userId) {
    if (!posts.length || !userId) return posts;

    const postIds = posts.map(p => p.id);
    const { data: userLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);

    const likedSet = new Set((userLikes || []).map(l => l.post_id));
    posts.forEach(p => { p.user_liked = likedSet.has(p.id); });
    return posts;
}

export async function likePost(userId, postId, currentCount) {
    await supabase.from('likes').insert({ user_id: userId, post_id: postId });
    await supabase.from('posts').update({ likes_count: currentCount + 1 }).eq('id', postId);
}

export async function unlikePost(userId, postId, currentCount) {
    await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId);
    await supabase.from('posts').update({ likes_count: Math.max(0, currentCount - 1) }).eq('id', postId);
}

export async function deletePost(postId) {
    await supabase.from('likes').delete().eq('post_id', postId);
    await supabase.from('posts').delete().eq('id', postId);
}
