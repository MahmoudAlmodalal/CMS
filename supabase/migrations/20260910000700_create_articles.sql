-- Task 25 — Migration 08/11: articles table.
-- Canonical spec: DATABASE_SCHEMA.md §7. Optional featured-artist link (ON DELETE SET NULL).
-- Depends on: 03 (artists). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS articles;

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(250) NOT NULL,
  slug VARCHAR(250) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  category VARCHAR(100) NOT NULL CHECK (category IN ('culture', 'artists', 'academy', 'events')),
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL,
  author_name VARCHAR(150) NOT NULL,
  featured_artist_id UUID NULL REFERENCES artists(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_feed ON articles (published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category, published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles (is_featured, published_at DESC) WHERE is_featured = true AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_articles_artist ON articles (featured_artist_id);
