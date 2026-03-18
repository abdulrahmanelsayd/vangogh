import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimePosts(channelName, setPosts) {
    useEffect(() => {
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts' },
                (payload) => {
                    const newPost = { ...payload.new, comment_count: 0, user_liked: false };
                    setPosts(prev => {
                        if (prev.some(p => p.id === newPost.id)) return prev;
                        return [newPost, ...prev];
                    });
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'posts' },
                (payload) => {
                    setPosts(prev => prev.filter(p => p.id !== payload.old.id));
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'posts' },
                (payload) => {
                    setPosts(prev => prev.map(p =>
                        p.id === payload.new.id
                            ? { ...p, likes_count: payload.new.likes_count, caption: payload.new.caption }
                            : p
                    ));
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [channelName, setPosts]);
}
