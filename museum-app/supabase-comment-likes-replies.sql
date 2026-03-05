-- Run this in the Supabase SQL Editor to add comment likes + replies

-- 1. Add parent_id for threaded replies
ALTER TABLE public.comments
ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;

-- 2. Add likes_count to comments
ALTER TABLE public.comments
ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

-- 3. Comment likes table
CREATE TABLE public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, comment_id)
);

-- 4. Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Comment likes are viewable by everyone"
    ON public.comment_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like comments"
    ON public.comment_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
    ON public.comment_likes FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Allow updating likes_count on comments
CREATE POLICY "Anyone can update comment likes_count"
    ON public.comments FOR UPDATE
    USING (true)
    WITH CHECK (true);
