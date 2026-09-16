#!/usr/bin/env bash
#
# Applies supabase/migrations/*.sql to the database in SUPABASE_DB_URL, once
# each, in filename order.
#
# Why this and not `supabase db push`: the CLI keys its history by the version
# prefix alone, and this repo carries two pairs of files that share one
# (20260913000000 and 20260914000100). Pushing would either collide or silently
# skip a file. This runner keys on the whole filename instead, so the pairs are
# two distinct migrations and nothing has to be renamed.
#
# Safety properties this relies on, all of which the migrations already hold:
#   - Every file is idempotent (IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS /
#     ON CONFLICT), and every seed backfills blank cells only. So a first run
#     against a database that was migrated by hand re-runs everything harmlessly
#     rather than overwriting live content.
#   - No file contains CONCURRENTLY, ALTER TYPE ... ADD VALUE or VACUUM, so each
#     can run inside one transaction.
#
# Each file and its bookkeeping row commit together: a file that fails rolls
# back whole and is not recorded, so the next run retries it from a clean state.
# The first failure stops the script, which fails the job and blocks the deploy.
#
# The ledger lives in the supabase_migrations schema, which PostgREST does not
# expose, so it never becomes a public API table.

set -euo pipefail

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL is not set." >&2
  exit 1
fi

MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/supabase/migrations"

psql_do() {
  psql "$SUPABASE_DB_URL" --no-psqlrc --quiet -v ON_ERROR_STOP=1 "$@"
}

psql_do <<'SQL'
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.applied_files (
  filename   text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

applied="$(psql_do --tuples-only --no-align -c 'SELECT filename FROM supabase_migrations.applied_files')"

pending=0
skipped=0
for file in $(LC_ALL=C ls "$MIGRATIONS_DIR"/*.sql); do
  name="$(basename "$file")"

  if grep -qxF "$name" <<<"$applied"; then
    printf '  skip   %s\n' "$name"
    skipped=$((skipped + 1))
    continue
  fi

  printf '  apply  %s\n' "$name"
  # The file and its ledger row go in as one transaction, so the ledger can
  # never claim a migration that did not fully commit.
  {
    cat "$file"
    printf "\nINSERT INTO supabase_migrations.applied_files (filename) VALUES (%s);\n" \
      "$(printf "'%s'" "${name//\'/\'\'}")"
  } | psql_do --single-transaction -f -

  pending=$((pending + 1))
done

printf '\n%s migration(s) applied, %s already present.\n' "$pending" "$skipped"
