-- ============================================
-- Add video support to community posts
-- Run this in Supabase SQL Editor
-- ============================================

-- Add media_type column to distinguish images from videos
-- Default 'image' for backward compatibility with existing posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';

-- Update the column comment for documentation
COMMENT ON COLUMN public.posts.media_type IS 'Type of media: image or video';
