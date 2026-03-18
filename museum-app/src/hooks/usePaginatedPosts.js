import { useState, useRef, useCallback, useEffect } from 'react';
import {
    fetchPostsPage,
    enrichWithCommentCounts,
    enrichWithUserLikes
} from '../services/postService';

export function usePaginatedPosts({ user, pageSize = 10, filter = null }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const pageRef = useRef(0);
    const hasMoreRef = useRef(true);
    const loadingMoreRef = useRef(false);
    const observerTarget = useRef(null);

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

        try {
            setError(null);
            const start = currentPage * pageSize;
            const end = start + pageSize - 1;

            const data = await fetchPostsPage(start, end, filter);

            if (data.length) {
                await enrichWithCommentCounts(data);
                if (user) {
                    await enrichWithUserLikes(data, user.id);
                }
            }

            hasMoreRef.current = data.length === pageSize;

            setPosts(prev => {
                if (reset) return data;
                const existingIds = new Set(prev.map(p => p.id));
                const newPosts = data.filter(p => !existingIds.has(p.id));
                return [...prev, ...newPosts];
            });

            pageRef.current = currentPage + 1;
        } catch (error) {
            console.error('Fetch posts error:', error);
            setError(error.message || 'Failed to load posts');
        } finally {
            setLoading(false);
            loadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    }, [user, pageSize, filter]);

    useEffect(() => {
        fetchPosts(true);
    }, [fetchPosts]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    fetchPosts(false);
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [fetchPosts]);

    return {
        posts,
        setPosts,
        loading,
        isLoadingMore,
        error,
        observerTarget,
        refetch: () => fetchPosts(true),
        hasMore: hasMoreRef,
    };
}
