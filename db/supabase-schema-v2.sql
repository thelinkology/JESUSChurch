-- ============================================================
-- JESUS CHURCH — SUPABASE SCHEMA v2
-- Run this in: Supabase Dashboard → SQL Editor
-- Project: bfhspthdhlgnvkrnatie
-- Gmail OAuth is already enabled in Supabase Auth settings.
-- ============================================================


-- ─────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─────────────────────────────────────────────────────
-- 1. PROFILES  (linked to auth.users)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,                          -- populated from Google OAuth
  phone         TEXT,
  role          TEXT DEFAULT 'Visitor'         -- Visitor | Member | Leader | Admin
                  CHECK (role IN ('Visitor','Member','Leader','Admin')),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Auto-create profile on OAuth / email sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────
-- 2. SERMONS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sermons (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  youtube_link  TEXT,
  speaker       TEXT,
  series        TEXT,
  date          DATE,
  thumbnail_url TEXT,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sermons_select_all"      ON public.sermons FOR SELECT USING (true);
CREATE POLICY "sermons_insert_leaders"  ON public.sermons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "sermons_update_leaders"  ON public.sermons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "sermons_delete_leaders"  ON public.sermons FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);

CREATE TRIGGER set_sermons_updated_at
  BEFORE UPDATE ON public.sermons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────
-- 3. EVENTS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,
  date          DATE NOT NULL,
  time          TEXT,
  location      TEXT,
  description   TEXT,
  category      TEXT DEFAULT 'General',
  image_url     TEXT,
  max_attendees INTEGER,                        -- NULL = unlimited
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_all"     ON public.events FOR SELECT USING (true);
CREATE POLICY "events_insert_leaders" ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "events_update_leaders" ON public.events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "events_delete_leaders" ON public.events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────
-- 4. EVENT REGISTRATIONS  (replaces event_attendees)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (event_id, email)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_reg_insert_anyone"  ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "event_reg_select_own"     ON public.event_registrations FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "event_reg_delete_leaders" ON public.event_registrations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);


-- ─────────────────────────────────────────────────────
-- 5. PRAYERS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prayers (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name   TEXT NOT NULL,
  content       TEXT NOT NULL,
  is_public     BOOLEAN DEFAULT true,
  status        TEXT DEFAULT 'pending'          -- pending | approved | answered | rejected
                  CHECK (status IN ('pending','approved','answered','rejected')),
  prayer_count  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prayers_select_public"   ON public.prayers FOR SELECT USING (
  (is_public = true AND status = 'approved') OR
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "prayers_insert_anyone"   ON public.prayers FOR INSERT WITH CHECK (true);
-- Only increment prayer_count, nothing else (admins/leaders can do full update)
CREATE POLICY "prayers_update_count"    ON public.prayers FOR UPDATE USING (true)
  WITH CHECK (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
  );
CREATE POLICY "prayers_delete_leaders"  ON public.prayers FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);

-- Increment prayer_count safely via function (avoids full-row updates)
CREATE OR REPLACE FUNCTION public.increment_prayer_count(prayer_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.prayers SET prayer_count = prayer_count + 1 WHERE id = prayer_id;
$$;


-- ─────────────────────────────────────────────────────
-- 6. SMALL GROUPS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT DEFAULT 'General',
  leader        TEXT,
  leader_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  schedule      TEXT,
  location      TEXT,
  max_members   INTEGER,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_select_all"     ON public.groups FOR SELECT USING (true);
CREATE POLICY "groups_insert_leaders" ON public.groups FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "groups_update_leaders" ON public.groups FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "groups_delete_leaders" ON public.groups FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);

CREATE TRIGGER set_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────
-- 7. GROUP MEMBERS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_members (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id   UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_members_select_all"    ON public.group_members FOR SELECT USING (true);
CREATE POLICY "group_members_insert_self"   ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "group_members_delete_self"   ON public.group_members FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);


-- ─────────────────────────────────────────────────────
-- 8. VOLUNTEER ROLES
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.volunteer_roles (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title       TEXT NOT NULL,
  department  TEXT NOT NULL,
  description TEXT,
  schedule    TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.volunteer_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vol_roles_select_all"     ON public.volunteer_roles FOR SELECT USING (true);
CREATE POLICY "vol_roles_insert_leaders" ON public.volunteer_roles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "vol_roles_update_leaders" ON public.volunteer_roles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "vol_roles_delete_leaders" ON public.volunteer_roles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);

CREATE TRIGGER set_vol_roles_updated_at
  BEFORE UPDATE ON public.volunteer_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────
-- 9. VOLUNTEER APPLICATIONS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_id    UUID REFERENCES public.volunteer_roles(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  notes      TEXT,
  status     TEXT DEFAULT 'pending'             -- pending | approved | declined
               CHECK (status IN ('pending','approved','declined')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vol_apps_insert_anyone"   ON public.volunteer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "vol_apps_select_own"      ON public.volunteer_applications FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "vol_apps_update_leaders"  ON public.volunteer_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);
CREATE POLICY "vol_apps_delete_leaders"  ON public.volunteer_applications FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin','Leader'))
);


-- ─────────────────────────────────────────────────────
-- 10. GIVING / DONATIONS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.giving (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  donor_name       TEXT NOT NULL,
  donor_email      TEXT,
  amount           NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  fund             TEXT NOT NULL                -- Tithes | Offering | Missions
                     CHECK (fund IN ('Tithes','Offering','Missions')),
  payment_method   TEXT NOT NULL               -- GCash | PayPal | Cash/Check
                     CHECK (payment_method IN ('GCash','PayPal','Cash/Check')),
  status           TEXT DEFAULT 'pending'
                     CHECK (status IN ('pending','completed','failed')),
  reference_number TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.giving ENABLE ROW LEVEL SECURITY;

CREATE POLICY "giving_insert_anyone"  ON public.giving FOR INSERT WITH CHECK (true);
CREATE POLICY "giving_select_own"     ON public.giving FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "giving_update_admin"   ON public.giving FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);


-- ─────────────────────────────────────────────────────
-- 11. THEMES (UI customization)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.themes (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT NOT NULL,
  colors              JSONB NOT NULL,
  typography          JSONB NOT NULL,
  spacing             JSONB,
  border_radius       TEXT,
  animation_duration  TEXT,
  background_image    TEXT,
  button_shadow       TEXT,
  is_active           BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "themes_select_all"    ON public.themes FOR SELECT USING (true);
CREATE POLICY "themes_manage_admin"  ON public.themes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

CREATE TRIGGER set_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────
-- INDEXES (for performance)
-- ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sermons_date         ON public.sermons(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_date          ON public.events(date ASC);
CREATE INDEX IF NOT EXISTS idx_prayers_status       ON public.prayers(status, is_public);
CREATE INDEX IF NOT EXISTS idx_giving_user          ON public.giving(user_id);
CREATE INDEX IF NOT EXISTS idx_giving_created       ON public.giving(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group  ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_vol_apps_status      ON public.volunteer_applications(status);
