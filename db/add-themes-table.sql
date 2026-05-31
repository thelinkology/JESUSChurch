-- ============================================================
-- Migration: Add themes table for custom church themes
-- Run this in your Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS themes (
  id          text        PRIMARY KEY,
  name        text        NOT NULL,
  colors      jsonb       NOT NULL DEFAULT '{}',
  fonts       jsonb       NOT NULL DEFAULT '{}',
  styles      jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Themes are publicly readable" ON themes;
CREATE POLICY "Themes are publicly readable"
  ON themes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and leaders can manage themes" ON themes;
CREATE POLICY "Admins and leaders can manage themes"
  ON themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('Admin', 'Leader')
    )
  );
