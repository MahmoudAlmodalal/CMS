-- Task 25 — Migration 09/11: testimonials table.
-- Canonical spec: DATABASE_SCHEMA.md §8. No foreign keys.
-- Depends on: 01 (pgcrypto). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS testimonials;

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author_name VARCHAR(150) NOT NULL,
  author_role VARCHAR(150) NOT NULL,
  avatar_image_url VARCHAR(500) NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials (display_order ASC) WHERE is_published = true;
