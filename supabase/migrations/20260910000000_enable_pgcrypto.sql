-- Task 25 — Migration 01/11: pgcrypto extension.
-- Provides gen_random_uuid() used as PK default by all UUID tables.
-- Idempotent: IF NOT EXISTS guard; safe to re-run.
-- Rollback: DROP EXTENSION IF EXISTS pgcrypto; (only when no dependents remain).

CREATE EXTENSION IF NOT EXISTS pgcrypto;
