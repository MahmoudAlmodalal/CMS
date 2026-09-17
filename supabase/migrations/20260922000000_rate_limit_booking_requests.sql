-- Rate-limits public booking submissions at the database.
--
-- Depends on: 20260910000900_create_booking_requests.sql, 20260910001100_enable_rls.sql
-- Idempotent: CREATE OR REPLACE FUNCTION, DROP TRIGGER IF EXISTS, CREATE INDEX IF NOT EXISTS
-- Rollback: DROP TRIGGER booking_requests_rate_limit ON booking_requests;
--           DROP FUNCTION public.enforce_booking_rate_limit();
--
-- Why in the database and not in the Server Action: the `anon` role cannot read
-- this table at all ("booking_requests_select_anon_block" is USING (false)), so
-- the public submit path has no way to count what it has already accepted. The
-- alternative — handing the public endpoint a service-role client so it can
-- count — would put an RLS-bypassing key behind an unauthenticated form, which
-- is a far larger surface than the problem it solves.
--
-- A BEFORE INSERT trigger also holds for every writer, including a future
-- endpoint or an import script that forgets the check, and unlike an in-process
-- counter it is not defeated by serverless instances each keeping their own
-- memory.

-- Supports the window lookup below. Without it the trigger degrades into a
-- sequential scan once the table grows.
CREATE INDEX IF NOT EXISTS booking_requests_email_created_at_idx
  ON booking_requests (lower(email), created_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_booking_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER so the count runs past the anon SELECT block. It reads only
-- its own table and returns a count, never a row.
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Roughly "a person filling in the form again after a mistake is fine;
  -- a script is not".
  window_interval CONSTANT INTERVAL := INTERVAL '10 minutes';
  max_in_window   CONSTANT INTEGER  := 3;
  recent_count    INTEGER;
BEGIN
  -- Admins create bookings on a caller's behalf through
  -- createPrivilegedBookingAction; that path is already authenticated, so the
  -- limit meant for anonymous visitors must not apply to it.
  --
  -- Both branches are needed. is_admin() reads app_metadata.role from the JWT,
  -- which covers an admin's own session — but createPrivilegedBookingAction
  -- uses the service-role client, whose token carries role=service_role at the
  -- top level and no app_metadata at all, so is_admin() is false for it. Tested
  -- against a real Postgres: without the second branch an admin entering a
  -- fourth booking for the same caller is rejected as spam.
  IF public.is_admin()
     OR current_user = 'service_role'
     OR (auth.jwt() ->> 'role') = 'service_role'
  THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO recent_count
  FROM booking_requests
  WHERE lower(email) = lower(NEW.email)
    AND created_at > (NOW() - window_interval);

  IF recent_count >= max_in_window THEN
    -- 429-ish: a distinct SQLSTATE so the action can tell this apart from a
    -- genuine failure and answer "you have sent several requests already"
    -- rather than "something went wrong".
    RAISE EXCEPTION 'booking rate limit exceeded for this email'
      USING ERRCODE = 'P0001',
            HINT = 'BOOKING_RATE_LIMIT';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_requests_rate_limit ON booking_requests;
CREATE TRIGGER booking_requests_rate_limit
  BEFORE INSERT ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_booking_rate_limit();
