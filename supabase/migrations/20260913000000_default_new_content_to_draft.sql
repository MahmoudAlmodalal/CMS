-- New admin-created catalog rows must remain drafts until explicitly published.
-- Existing rows are untouched; this only changes future INSERT defaults.
ALTER TABLE public.artists ALTER COLUMN is_published SET DEFAULT false;
ALTER TABLE public.academy_courses ALTER COLUMN is_published SET DEFAULT false;
ALTER TABLE public.articles ALTER COLUMN is_published SET DEFAULT false;
