-- Task 25 — Migration 06/11: events table.
-- Canonical spec: DATABASE_SCHEMA.md §5. Optional artist link (ON DELETE SET NULL).
-- No /events/[slug] detail route (roadmap Task 4); slug retained for admin identity only.
-- Depends on: 03 (artists). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS events; (after dropping dependent 10 booking_requests first).

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  category VARCHAR(50) NOT NULL CHECK (category IN ('concert', 'festival', 'evening', 'workshop')),
  event_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  performer_name VARCHAR(150) NOT NULL,
  artist_id UUID NULL REFERENCES artists(id) ON DELETE SET NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NOT NULL,
  ticket_url VARCHAR(500) NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date ASC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_events_category_date ON events (category, event_date ASC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_events_featured ON events (is_featured) WHERE is_featured = true AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_events_artist_id ON events (artist_id);
