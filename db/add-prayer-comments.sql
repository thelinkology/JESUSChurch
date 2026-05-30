-- ============================================================
-- JESUS CHURCH — PRAYER COMMENTS TABLE
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
-- Creates the prayer_comments table and its RLS policies.
-- ============================================================

-- Create prayer_comments table
CREATE TABLE IF NOT EXISTS public.prayer_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_id UUID NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments (anon + authenticated)
DROP POLICY IF EXISTS "Public can read prayer comments" ON public.prayer_comments;
CREATE POLICY "Public can read prayer comments"
  ON public.prayer_comments FOR SELECT TO anon, authenticated
  USING (true);

-- Authenticated users can add comments
DROP POLICY IF EXISTS "Authenticated can add comments" ON public.prayer_comments;
CREATE POLICY "Authenticated can add comments"
  ON public.prayer_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own comments; admins/leaders can delete any
DROP POLICY IF EXISTS "Delete own or admin comments" ON public.prayer_comments;
CREATE POLICY "Delete own or admin comments"
  ON public.prayer_comments FOR DELETE TO authenticated
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('Admin', 'Leader')
    )
  );
