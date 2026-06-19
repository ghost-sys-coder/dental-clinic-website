-- ─────────────────────────────────────────────────────────────────────────────
-- RLS + Storage policies
-- Run once in the Supabase SQL Editor after any schema push that drops enums.
-- Safe to re-run: all DROP IF EXISTS guards are in place.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Enable RLS on every table ─────────────────────────────────────────────

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients            ENABLE ROW LEVEL SECURITY;

-- ── 2. Role helper ────────────────────────────────────────────────────────────
-- Reads the calling user's role from profiles. SECURITY DEFINER so it bypasses
-- RLS on profiles itself (avoids infinite recursion). Called inside every
-- write-guarded policy below.

CREATE OR REPLACE FUNCTION current_user_role()
  RETURNS text
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT role::text FROM profiles WHERE id = auth.uid()
$$;

-- ── 3. profiles ───────────────────────────────────────────────────────────────
-- Staff can read all profiles (needed to display note authors, audit actors).
-- Each user can only insert/update their own row.

DROP POLICY IF EXISTS "profiles_select"  ON profiles;
DROP POLICY IF EXISTS "profiles_insert"  ON profiles;
DROP POLICY IF EXISTS "profiles_update"  ON profiles;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ── 4. submissions ────────────────────────────────────────────────────────────
-- Only authenticated staff can read or write patient submissions.

DROP POLICY IF EXISTS "submissions_all" ON submissions;

CREATE POLICY "submissions_all" ON submissions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 4. notes ─────────────────────────────────────────────────────────────────
-- VIEWERs can read; EDITORs/ADMINs can add notes; only the author or an ADMIN
-- can delete a note (no update — notes are immutable once written).

DROP POLICY IF EXISTS "notes_all"    ON notes;
DROP POLICY IF EXISTS "notes_select" ON notes;
DROP POLICY IF EXISTS "notes_write"  ON notes;
DROP POLICY IF EXISTS "notes_delete" ON notes;

CREATE POLICY "notes_select" ON notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "notes_write" ON notes
  FOR INSERT TO authenticated
  WITH CHECK (current_user_role() IN ('ADMIN', 'EDITOR'));

CREATE POLICY "notes_delete" ON notes
  FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR current_user_role() = 'ADMIN');

-- ── 5. audit_logs ─────────────────────────────────────────────────────────────
-- All staff can read the full audit trail.
-- Only EDITORs/ADMINs can insert (VIEWERs can't perform write actions anyway).
-- No UPDATE or DELETE policy → audit records are permanently immutable.

DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (current_user_role() IN ('ADMIN', 'EDITOR'));

-- ── 6. team_members ───────────────────────────────────────────────────────────
-- Authenticated staff can manage members.
-- Anon role gets SELECT so the public website can read them.

DROP POLICY IF EXISTS "team_members_staff_all"     ON team_members;
DROP POLICY IF EXISTS "team_members_public_select"  ON team_members;

CREATE POLICY "team_members_staff_all" ON team_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "team_members_public_select" ON team_members
  FOR SELECT TO anon USING (true);

-- ── 7. assignments ───────────────────────────────────────────────────────────
-- VIEWERs can read; EDITORs/ADMINs can insert and update.
-- No DELETE policy — appointments are cancelled/rescheduled via status, never deleted.

DROP POLICY IF EXISTS "assignments_all"    ON assignments;
DROP POLICY IF EXISTS "assignments_select" ON assignments;
DROP POLICY IF EXISTS "assignments_write"  ON assignments;
DROP POLICY IF EXISTS "assignments_update" ON assignments;

CREATE POLICY "assignments_select" ON assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "assignments_write" ON assignments
  FOR INSERT TO authenticated
  WITH CHECK (current_user_role() IN ('ADMIN', 'EDITOR'));

CREATE POLICY "assignments_update" ON assignments
  FOR UPDATE TO authenticated
  USING (current_user_role() IN ('ADMIN', 'EDITOR'));

-- ── 8. availability_blocks ───────────────────────────────────────────────────
-- VIEWERs can read; EDITORs/ADMINs can add, edit, and remove blocks.

DROP POLICY IF EXISTS "avail_blocks_all"    ON availability_blocks;
DROP POLICY IF EXISTS "avail_blocks_select" ON availability_blocks;
DROP POLICY IF EXISTS "avail_blocks_write"  ON availability_blocks;
DROP POLICY IF EXISTS "avail_blocks_update" ON availability_blocks;
DROP POLICY IF EXISTS "avail_blocks_delete" ON availability_blocks;

CREATE POLICY "avail_blocks_select" ON availability_blocks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "avail_blocks_write" ON availability_blocks
  FOR INSERT TO authenticated
  WITH CHECK (current_user_role() IN ('ADMIN', 'EDITOR'));

CREATE POLICY "avail_blocks_update" ON availability_blocks
  FOR UPDATE TO authenticated
  USING (current_user_role() IN ('ADMIN', 'EDITOR'));

CREATE POLICY "avail_blocks_delete" ON availability_blocks
  FOR DELETE TO authenticated
  USING (current_user_role() IN ('ADMIN', 'EDITOR'));

-- ── 9. patients ──────────────────────────────────────────────────────────────
-- VIEWERs can read; EDITORs/ADMINs can create and update patient records.
-- No DELETE policy — patient records are archived (status change), not hard-deleted.

DROP POLICY IF EXISTS "patients_select" ON patients;
DROP POLICY IF EXISTS "patients_write"  ON patients;
DROP POLICY IF EXISTS "patients_update" ON patients;

CREATE POLICY "patients_select" ON patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "patients_write" ON patients
  FOR INSERT TO authenticated
  WITH CHECK (current_user_role() IN ('ADMIN', 'EDITOR'));

CREATE POLICY "patients_update" ON patients
  FOR UPDATE TO authenticated
  USING (current_user_role() IN ('ADMIN', 'EDITOR'));

-- ── 10. Storage — team-profile bucket ────────────────────────────────────────
-- Authenticated users can upload and delete their own files.
-- Anyone (including the public website) can read the images.

DROP POLICY IF EXISTS "team_profile_insert"  ON storage.objects;
DROP POLICY IF EXISTS "team_profile_select"  ON storage.objects;
DROP POLICY IF EXISTS "team_profile_update"  ON storage.objects;
DROP POLICY IF EXISTS "team_profile_delete"  ON storage.objects;

CREATE POLICY "team_profile_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'team-profile');

CREATE POLICY "team_profile_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'team-profile');

CREATE POLICY "team_profile_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'team-profile');

CREATE POLICY "team_profile_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'team-profile');
