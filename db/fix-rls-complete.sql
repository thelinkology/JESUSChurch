-- ============================================================
-- JESUS CHURCH — COMPLETE RLS FIX
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
-- This makes all public content readable by anyone (anon role),
-- while keeping write access restricted to authenticated leaders/admins.
-- ============================================================


-- ─────────────────────────────────────────────────────
-- SERMONS  (public read)
-- ─────────────────────────────────────────────────────
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read sermons" ON sermons;
CREATE POLICY "Public can read sermons"
  ON sermons FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can manage sermons" ON sermons;
CREATE POLICY "Leaders can manage sermons"
  ON sermons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- ─────────────────────────────────────────────────────
-- EVENTS  (public read)
-- ─────────────────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read events" ON events;
CREATE POLICY "Public can read events"
  ON events FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can manage events" ON events;
CREATE POLICY "Leaders can manage events"
  ON events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- ─────────────────────────────────────────────────────
-- GROUPS  (public read)
-- ─────────────────────────────────────────────────────
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read groups" ON groups;
CREATE POLICY "Public can read groups"
  ON groups FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can manage groups" ON groups;
CREATE POLICY "Leaders can manage groups"
  ON groups FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));

-- group_members: members can join/leave, anon can see counts
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read group members" ON group_members;
CREATE POLICY "Public can read group members"
  ON group_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────
-- MINISTRIES  (public read)
-- ─────────────────────────────────────────────────────
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read ministries" ON ministries;
CREATE POLICY "Public can read ministries"
  ON ministries FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can manage ministries" ON ministries;
CREATE POLICY "Leaders can manage ministries"
  ON ministries FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));

-- ministry_members
ALTER TABLE ministry_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read ministry members" ON ministry_members;
CREATE POLICY "Public can read ministry members"
  ON ministry_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users can join ministries" ON ministry_members;
CREATE POLICY "Users can join ministries"
  ON ministry_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave ministries" ON ministry_members;
CREATE POLICY "Users can leave ministries"
  ON ministry_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Leaders can manage ministry members" ON ministry_members;
CREATE POLICY "Leaders can manage ministry members"
  ON ministry_members FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- ─────────────────────────────────────────────────────
-- CHURCH LOCATIONS  (public read)
-- ─────────────────────────────────────────────────────
ALTER TABLE church_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read locations" ON church_locations;
CREATE POLICY "Public can read locations"
  ON church_locations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can manage locations" ON church_locations;
CREATE POLICY "Leaders can manage locations"
  ON church_locations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- ─────────────────────────────────────────────────────
-- CHURCH SETTINGS  (public read)
-- ─────────────────────────────────────────────────────
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read settings" ON church_settings;
CREATE POLICY "Public can read settings"
  ON church_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can manage settings" ON church_settings;
CREATE POLICY "Leaders can manage settings"
  ON church_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- ─────────────────────────────────────────────────────
-- LEADERSHIP TEAM  (public read)
-- ─────────────────────────────────────────────────────
ALTER TABLE leadership_team ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read leadership" ON leadership_team;
CREATE POLICY "Public can read leadership"
  ON leadership_team FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can manage leadership" ON leadership_team;
CREATE POLICY "Leaders can manage leadership"
  ON leadership_team FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- ─────────────────────────────────────────────────────
-- VOLUNTEER ROLES  (public read — so anyone can see openings)
-- ─────────────────────────────────────────────────────
ALTER TABLE volunteer_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read volunteer roles" ON volunteer_roles;
CREATE POLICY "Public can read volunteer roles"
  ON volunteer_roles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can manage volunteer roles" ON volunteer_roles;
CREATE POLICY "Leaders can manage volunteer roles"
  ON volunteer_roles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));

-- volunteer_applications: private (authenticated only)
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own applications" ON volunteer_applications;
CREATE POLICY "Users can read own applications"
  ON volunteer_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can apply" ON volunteer_applications;
CREATE POLICY "Users can apply"
  ON volunteer_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Leaders can manage applications" ON volunteer_applications;
CREATE POLICY "Leaders can manage applications"
  ON volunteer_applications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- ─────────────────────────────────────────────────────
-- PRAYERS  (only approved/public visible to anon)
-- ─────────────────────────────────────────────────────
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read approved prayers" ON prayers;
CREATE POLICY "Public can read approved prayers"
  ON prayers FOR SELECT TO anon
  USING (is_public = true AND status IN ('approved', 'answered'));
DROP POLICY IF EXISTS "Authenticated can read all prayers" ON prayers;
CREATE POLICY "Authenticated can read all prayers"
  ON prayers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Members can submit prayers" ON prayers;
CREATE POLICY "Members can submit prayers"
  ON prayers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Leaders can manage prayers" ON prayers;
CREATE POLICY "Leaders can manage prayers"
  ON prayers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- ─────────────────────────────────────────────────────
-- PROFILES  (public names needed for ministry pages)
-- ─────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public can read profiles"
  ON profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────────────
-- EVENT REGISTRATIONS  (public read + anyone can RSVP)
-- ─────────────────────────────────────────────────────
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read event registrations" ON event_registrations;
CREATE POLICY "Public can read event registrations"
  ON event_registrations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Anyone can RSVP to events" ON event_registrations;
CREATE POLICY "Anyone can RSVP to events"
  ON event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);


-- ─────────────────────────────────────────────────────
-- GIVING  (private — users see only their own)
-- ─────────────────────────────────────────────────────
ALTER TABLE giving ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own giving" ON giving;
CREATE POLICY "Users can read own giving"
  ON giving FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "Anyone can submit giving" ON giving;
CREATE POLICY "Anyone can submit giving"
  ON giving FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Leaders can read all giving" ON giving;
CREATE POLICY "Leaders can read all giving"
  ON giving FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin','Leader')));


-- Done. All public tables are now readable without sign-in.
-- Re-run any time after schema changes.
