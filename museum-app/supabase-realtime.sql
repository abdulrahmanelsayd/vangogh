-- ============================================
-- Enable Supabase Realtime on community tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Add tables to the supabase_realtime publication
-- This enables Postgres Changes for live subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_likes;

-- Enable replica identity FULL on posts and comments
-- so we receive old + new records on UPDATE/DELETE
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
