-- Task 25 — Migration 10/11: booking_requests table (CRM leads, private).
-- Canonical spec: DATABASE_SCHEMA.md §9. Optional artist/event links (ON DELETE SET NULL).
-- Privacy: never publicly readable; enforced in Task 26 (RLS).
-- Depends on: 03 (artists), 06 (events). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS booking_requests;

CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(50) NULL,
  budget_range VARCHAR(100) NULL,
  event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('private_concert', 'wedding', 'festival', 'hotel', 'other')),
  event_date DATE NOT NULL,
  preferred_artist VARCHAR(150) NULL,
  artist_id UUID NULL REFERENCES artists(id) ON DELETE SET NULL,
  event_id UUID NULL REFERENCES events(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'archived')),
  admin_notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_status_created ON booking_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_requests_artist ON booking_requests (artist_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_event ON booking_requests (event_id);
