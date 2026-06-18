-- ─────────────────────────────────────────────────────────────────────────────
-- Status migration — run once in Supabase SQL Editor BEFORE drizzle-kit push.
-- Safe to inspect first; each block is idempotent where possible.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Lead (submission) statuses — add new values ───────────────────────────
-- ADD VALUE cannot run inside a transaction; Supabase runs each statement
-- automatically in its own implicit transaction, so this is fine.

ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'WAITING_FOR_RESPONSE';
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'ATTENDED';
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'TREATMENT_PLANNED';
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'CONVERTED';
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'LOST';

-- ── 2. Appointment statuses — rename existing values ─────────────────────────
-- RENAME VALUE requires Postgres 10+; Supabase uses Postgres 13+, so this works.
-- These are no-ops if already renamed (run with IF EXISTS guard via DO block).

DO $$
BEGIN
  -- SCHEDULED → REQUESTED
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'appointment_status' AND e.enumlabel = 'SCHEDULED'
  ) THEN
    ALTER TYPE appointment_status RENAME VALUE 'SCHEDULED' TO 'REQUESTED';
  END IF;

  -- IN_PROGRESS → IN_TREATMENT
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'appointment_status' AND e.enumlabel = 'IN_PROGRESS'
  ) THEN
    ALTER TYPE appointment_status RENAME VALUE 'IN_PROGRESS' TO 'IN_TREATMENT';
  END IF;
END $$;

-- ── 3. Appointment statuses — add CHECKED_IN ─────────────────────────────────

ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'CHECKED_IN';

-- ── 4. Drop UNIQUE constraint on assignments.submission_id ───────────────────
-- A lead can now have multiple appointments over time.
-- The constraint name varies by migration tool; we try both common forms.

DO $$
DECLARE
  cname TEXT;
BEGIN
  SELECT tc.constraint_name INTO cname
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema    = kcu.table_schema
  WHERE tc.table_schema   = 'public'
    AND tc.table_name     = 'assignments'
    AND tc.constraint_type = 'UNIQUE'
    AND kcu.column_name    = 'submission_id'
  LIMIT 1;

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE assignments DROP CONSTRAINT %I', cname);
  END IF;
END $$;

-- ── 5. Update column default ─────────────────────────────────────────────────

ALTER TABLE assignments
  ALTER COLUMN appt_status SET DEFAULT 'REQUESTED';

-- ── 6. Add index on submission_id (replaces the uniqueness index) ─────────────

CREATE INDEX IF NOT EXISTS assignments_submission_idx ON assignments (submission_id);
