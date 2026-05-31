-- ============================================================
-- Migration: Add devotionals, completions, and extended profile fields
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Extended profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthdate        date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender           text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS civil_status     text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address          text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name  text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation       text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS workplace        text;

-- 2. Devotionals table
CREATE TABLE IF NOT EXISTS devotionals (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  scripture_reference text     NOT NULL DEFAULT '',
  content          text        NOT NULL,
  devotional_date  date        NOT NULL UNIQUE,
  created_at       timestamptz DEFAULT now()
);

-- RLS for devotionals (public read, authenticated leader/admin write)
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Devotionals are publicly readable" ON devotionals;
CREATE POLICY "Devotionals are publicly readable"
  ON devotionals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leaders can manage devotionals" ON devotionals;
CREATE POLICY "Leaders can manage devotionals"
  ON devotionals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('Admin', 'Leader')
    )
  );

-- 3. Devotional completions table
CREATE TABLE IF NOT EXISTS devotional_completions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id  uuid        NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at   timestamptz DEFAULT now(),
  UNIQUE(devotional_id, user_id)
);

-- RLS for completions
ALTER TABLE devotional_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own completions" ON devotional_completions;
CREATE POLICY "Users can read their own completions"
  ON devotional_completions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own completions" ON devotional_completions;
CREATE POLICY "Users can insert their own completions"
  ON devotional_completions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Leaders can read all completions" ON devotional_completions;
CREATE POLICY "Leaders can read all completions"
  ON devotional_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('Admin', 'Leader')
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_devotional_completions_user ON devotional_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_devotional_completions_devotional ON devotional_completions(devotional_id);
CREATE INDEX IF NOT EXISTS idx_devotionals_date ON devotionals(devotional_date);
