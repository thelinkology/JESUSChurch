-- ============================================================
-- JESUS CHURCH — FIX PRAYERS RLS
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
-- 
-- Problem: The original schema had "Public prayers are viewable by everyone"
-- which allows is_public = true with NO status filter, so pending prayers
-- appear on the wall. This script removes it and replaces with correct policies.
-- ============================================================

-- Drop the original overly-permissive policy (no status filter)
DROP POLICY IF EXISTS "Public prayers are viewable by everyone" ON public.prayers;

-- Anon (not logged in): only public + approved/answered prayers
DROP POLICY IF EXISTS "Public can read approved prayers" ON public.prayers;
CREATE POLICY "Public can read approved prayers"
  ON public.prayers FOR SELECT TO anon
  USING (is_public = true AND status IN ('approved', 'answered'));

-- Authenticated (regular members): see public+approved OR their own prayers
-- Admin / Leader: see everything
DROP POLICY IF EXISTS "Authenticated can read all prayers" ON public.prayers;
DROP POLICY IF EXISTS "Authenticated can read prayers" ON public.prayers;
CREATE POLICY "Authenticated can read prayers"
  ON public.prayers FOR SELECT TO authenticated
  USING (
    -- Own prayers (submitter sees their own regardless of status/visibility)
    author_id = auth.uid()
    -- Public + approved (community wall)
    OR (is_public = true AND status IN ('approved', 'answered'))
    -- Admins and Leaders see everything
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('Admin', 'Leader')
    )
  );

-- Insert: anyone authenticated can submit
DROP POLICY IF EXISTS "Members can submit prayers" ON public.prayers;
CREATE POLICY "Members can submit prayers"
  ON public.prayers FOR INSERT TO authenticated
  WITH CHECK (true);

-- Update/delete: only admins/leaders (for moderation)
DROP POLICY IF EXISTS "Leaders can manage prayers" ON public.prayers;
CREATE POLICY "Leaders can manage prayers"
  ON public.prayers FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
  );

-- Ensure anon can still insert (for unauthenticated prayer submissions)
DROP POLICY IF EXISTS "Anyone can insert prayers." ON public.prayers;
CREATE POLICY "Anyone can submit prayers"
  ON public.prayers FOR INSERT TO anon
  WITH CHECK (true);

-- Anon prayer count increment (for the Pray button)
DROP POLICY IF EXISTS "Anyone can update prayer_count." ON public.prayers;
CREATE POLICY "Anyone can update prayer count"
  ON public.prayers FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
