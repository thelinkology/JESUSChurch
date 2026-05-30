-- ============================================================
-- Ministries Feature Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Allow public read on event_registrations (attendee list visible to everyone)
ALTER TABLE IF EXISTS event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read event registrations" ON event_registrations;
CREATE POLICY "Public can read event registrations" ON event_registrations
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Anyone can RSVP to events" ON event_registrations;
CREATE POLICY "Anyone can RSVP to events" ON event_registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 2. Make profiles publicly readable (needed for ministry member names on public pages)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Public can read profiles" ON profiles;
CREATE POLICY "Public can read profiles" ON profiles
  FOR SELECT TO anon, authenticated USING (true);

-- 3. Ministries table
CREATE TABLE IF NOT EXISTS public.ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  age_group TEXT DEFAULT 'All Ages',
  image_url TEXT,
  goals TEXT DEFAULT '[]',      -- JSON array of goal strings
  schedule TEXT,
  location TEXT,
  leader_name TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read ministries" ON ministries;
CREATE POLICY "Public can read ministries" ON ministries
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Leaders can manage ministries" ON ministries;
CREATE POLICY "Leaders can manage ministries" ON ministries
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));

-- 4. Ministry members (users who join a ministry)
CREATE TABLE IF NOT EXISTS public.ministry_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ministry_id, user_id)
);

ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read ministry members" ON ministry_members;
CREATE POLICY "Public can read ministry members" ON ministry_members
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users can join ministries" ON ministry_members;
CREATE POLICY "Users can join ministries" ON ministry_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave ministries" ON ministry_members;
CREATE POLICY "Users can leave ministries" ON ministry_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Leaders can manage ministry members" ON ministry_members;
CREATE POLICY "Leaders can manage ministry members" ON ministry_members
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));

-- 5. Seed default ministries (skips if rows already exist)
INSERT INTO public.ministries (title, description, age_group, image_url, goals, leader_name, sort_order)
VALUES
  (
    'Kids Ministry',
    'We provide a safe, fun, and engaging environment where children can learn about God''s love through age-appropriate lessons, worship, and activities.',
    'Infants - 5th Grade',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop',
    '["Create a safe and fun learning environment","Teach biblical foundations to every child","Partner with parents in their child''s faith development"]',
    'TBA',
    0
  ),
  (
    'Youth Ministry',
    'Our youth group is a place for students to connect with peers, ask tough questions, and develop a faith of their own that will last a lifetime.',
    'Middle & High School',
    'https://images.unsplash.com/photo-1529156069898-49953eb1f5bc?q=80&w=800&auto=format&fit=crop',
    '["Build authentic peer relationships","Develop a lifelong personal faith","Engage tough questions with grace and truth"]',
    'TBA',
    1
  ),
  (
    'Small Groups',
    'Life is better together. Small groups are the heartbeat of our church—a place to build authentic relationships, study the Bible, and pray for one another.',
    'Adults',
    'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop',
    '["Deepen biblical understanding together","Foster authentic community and accountability","Practice mutual prayer and support"]',
    'TBA',
    2
  ),
  (
    'Worship Team',
    'Using our musical and technical gifts to lead the congregation in authentic, Spirit-led worship each week.',
    'All Ages',
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop',
    '["Lead Spirit-filled worship every Sunday","Develop musical and technical talents","Serve the congregation faithfully with excellence"]',
    'TBA',
    3
  )
ON CONFLICT DO NOTHING;
