-- ─────────────────────────────────────────────────────────────────────────────
-- Role enum migration: ADMIN + STAFF  →  ADMIN + EDITOR + VIEWER
--
-- Run this in the Supabase SQL Editor BEFORE running `drizzle-kit push`.
-- It recreates the enum type in-place so Drizzle sees no drift.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Create the replacement enum
CREATE TYPE role_new AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- 2. Drop the existing default so Postgres can change the column type
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- 3. Swap the column type, mapping STAFF → EDITOR
ALTER TABLE profiles
  ALTER COLUMN role TYPE role_new
  USING (
    CASE role::text
      WHEN 'ADMIN'  THEN 'ADMIN'::role_new
      WHEN 'STAFF'  THEN 'EDITOR'::role_new
      ELSE               'VIEWER'::role_new
    END
  );

-- 4. Drop the old enum and rename the new one
DROP TYPE role;
ALTER TYPE role_new RENAME TO role;

-- 5. Restore the default using the renamed type
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'VIEWER';

COMMIT;
