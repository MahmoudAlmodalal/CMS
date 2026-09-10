-- Task 25 — Migration 11/11: newsletter_subscribers table (private, write-only public).
-- Canonical spec: DATABASE_SCHEMA.md §10.
-- Privacy: never publicly readable; enforced in Task 26 (RLS).
-- Depends on: 01 (pgcrypto). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS newsletter_subscribers;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  status VARCHAR(50) NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_status_created ON newsletter_subscribers (status, created_at DESC);
