-- Run this SQL in your Supabase SQL Editor to set up the necessary tables for authentication and content management.

-- 1. Profiles Table (Authentication & Roles)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'Visitor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles." ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Note: In a real production app, you might want to create a trigger to automatically create a profile when a new user signs up in auth.users. 
-- However, our frontend authStore.ts logic handles inserting the profile right after signup manually.

-- 2. Sermons Table
CREATE TABLE public.sermons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "youtubeLink" TEXT,
  speaker TEXT,
  series TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for sermons
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sermons are viewable by everyone." ON public.sermons FOR SELECT USING (true);
CREATE POLICY "Leaders/Admins can insert sermons." ON public.sermons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);
CREATE POLICY "Leaders/Admins can delete sermons." ON public.sermons FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);
CREATE POLICY "Leaders/Admins can update sermons." ON public.sermons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);


-- 3. Events Table
CREATE TABLE public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE,
  time TEXT,
  location TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone." ON public.events FOR SELECT USING (true);
CREATE POLICY "Leaders/Admins can insert events." ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);
CREATE POLICY "Leaders/Admins can delete events." ON public.events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);


-- 4. Event Attendees Table
CREATE TABLE public.event_attendees (
  id SERIAL PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event attendees viewable by Leaders/Admins." ON public.event_attendees FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);
CREATE POLICY "Anyone can insert event attendees." ON public.event_attendees FOR INSERT WITH CHECK (true);


-- 5. Prayers Table
CREATE TABLE public.prayers (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  prayer_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, answered
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public prayers are viewable by everyone" ON public.prayers FOR SELECT USING (is_public = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader')));
CREATE POLICY "Anyone can insert prayers." ON public.prayers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update prayer_count." ON public.prayers FOR UPDATE USING (true); -- Usually you'd restrict this to just the count field


-- 6. Themes Table
CREATE TABLE public.themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  colors JSONB NOT NULL,
  typography JSONB NOT NULL,
  spacing JSONB NOT NULL,
  borderRadius TEXT NOT NULL,
  animationDuration TEXT NOT NULL,
  backgroundImage TEXT,
  buttonShadow TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Themes
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Themes are viewable by everyone." ON public.themes FOR SELECT USING (true);
CREATE POLICY "Admins can insert/update themes." ON public.themes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);


-- 7. Giving Table (Transactions History)
CREATE TABLE public.giving (
  id TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  fund TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Giving
ALTER TABLE public.giving ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view giving." ON public.giving FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Anyone can insert giving." ON public.giving FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update giving." ON public.giving FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);
