-- Task 25 — Migration 07/11: academy_courses table.
-- Canonical spec: DATABASE_SCHEMA.md §6. Optional instructor link (ON DELETE SET NULL).
-- Depends on: 03 (artists). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS academy_courses;

CREATE TABLE IF NOT EXISTS academy_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  track_category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  instructor_name VARCHAR(150) NULL,
  instructor_id UUID NULL REFERENCES artists(id) ON DELETE SET NULL,
  image_url VARCHAR(500) NULL,
  display_order INTEGER NOT NULL DEFAULT 1 CHECK (display_order BETWEEN 1 AND 10),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_academy_courses_order ON academy_courses (display_order ASC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_academy_courses_instructor ON academy_courses (instructor_id);
