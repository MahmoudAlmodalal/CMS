# CMS

## Database migrations

`supabase/migrations/*.sql` is applied automatically. The `migrate` job in
`.github/workflows/ci-cd.yml` runs on every push to `main` (and on manual
`workflow_dispatch`), **before** the Vercel deploy, so new code never reaches a
database that is missing the columns it reads. A failed migration fails the job
and blocks the deploy.

### Setup — one secret

Add a repository secret named **`SUPABASE_DB_URL`**:

> Supabase dashboard → Project Settings → Database → Connection string → **URI**,
> using the **session** pooler (port `5432`, not the transaction pooler on
> `6543`, which does not support all DDL). Replace `[YOUR-PASSWORD]` with the
> database password.

Until that secret exists the job prints `Migrations skipped: …` and passes, so
the pipeline keeps working on a fork or before the secret is configured.

### How it works

`scripts/apply-migrations.sh` applies each file once, in filename order, and
records it in `supabase_migrations.applied_files` — a ledger in a schema
PostgREST does not expose, so it never becomes a public API table.

Each file and its ledger row commit in **one transaction**: a file that fails
rolls back whole and is not recorded, so the next run retries it from a clean
state and resumes where it stopped.

This runner exists instead of `supabase db push` because the CLI keys its
history on the version prefix alone, and this repo carries two pairs of files
that share one (`20260913000000` and `20260914000100`). Keying on the whole
filename keeps both pairs as distinct migrations and means nothing has to be
renamed.

**The first run against the existing production database re-applies every file,
because the ledger starts empty.** That is safe by construction and was verified
against a populated Postgres: every migration is idempotent (`IF NOT EXISTS`,
`OR REPLACE`, `DROP … IF EXISTS`, `ON CONFLICT`) and every seed fills blank cells
only, never overwriting content written in the admin panel.

### Writing a migration

Keep the existing conventions — the runner depends on them:

- Name it `YYYYMMDDHHMMSS_snake_case_description.sql`.
- Open with a header comment: what it does, `Depends on:`, `Idempotent:`,
  `Rollback:`.
- Make it re-runnable, and make any seed fill blanks only
  (`COALESCE(NULLIF(btrim(existing), ''), incoming)`).
- Do not use `CONCURRENTLY`, `ALTER TYPE … ADD VALUE` or `VACUUM`: each file runs
  inside a single transaction.

### Running it by hand

```bash
SUPABASE_DB_URL='postgresql://…' ./scripts/apply-migrations.sh
```

## Checks

```bash
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # node:test suite
npm run build      # production build
npm run e2e        # playwright
```
