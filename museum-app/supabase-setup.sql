-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Community Posts table
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL DEFAULT 'Visitor',
    user_avatar TEXT,
    image_url TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Likes table (prevents double-liking)
CREATE TABLE public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, post_id)
);

-- 3. Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Posts
-- Anyone can read posts
CREATE POLICY "Posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

-- 5. RLS Policies for Likes
-- Anyone can read likes
CREATE POLICY "Likes are viewable by everyone"
    ON public.likes FOR SELECT
    USING (true);

-- Authenticated users can like
CREATE POLICY "Authenticated users can like"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can unlike (delete their own like)
CREATE POLICY "Users can unlike"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policy for updating likes_count
CREATE POLICY "Anyone can update likes_count"
    ON public.posts FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 7. Create storage bucket for community photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-photos', 'community-photos', true);

-- 8. Storage policies
CREATE POLICY "Anyone can view community photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-photos');

CREATE POLICY "Authenticated users can upload photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'community-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own photos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'community-photos' AND auth.uid() = owner);
