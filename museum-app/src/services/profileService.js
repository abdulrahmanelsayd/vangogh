import { supabase } from '../lib/supabase';

export async function fetchProfile(id, authUser = null, posts = []) {
    const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (profileRow) {
        return {
            id: profileRow.id,
            name: profileRow.full_name,
            avatar: profileRow.avatar_url,
            bio: profileRow.bio
        };
    }

    // Fallback: auth context for own profile
    if (id === authUser?.id) {
        return {
            id: authUser.id,
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Visitor',
            avatar: authUser.user_metadata?.avatar_url,
            bio: ''
        };
    }

    // Fallback: post metadata
    if (posts.length > 0) {
        return {
            id: posts[0].user_id,
            name: posts[0].user_name,
            avatar: posts[0].user_avatar,
            bio: ''
        };
    }

    return null;
}

export async function updateProfile(id, updates) {
    const { error } = await supabase
        .from('profiles')
        .upsert({ id, ...updates }, { onConflict: 'id' });

    if (error) throw error;
}
