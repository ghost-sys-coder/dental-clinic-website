-- ─────────────────────────────────────────────────────────────────────────────
-- RLS + Storage policies
-- Run once in the Supabase SQL Editor after any schema push that drops enums.
-- Safe to re-run: all DROP IF EXISTS guards are in place.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Enable RLS on every table ─────────────────────────────────────────────

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members  ENABLE ROW LEVEL SECURITY;

-- ── 2. profiles ───────────────────────────────────────────────────────────────
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

-- ── 3. submissions ────────────────────────────────────────────────────────────
-- Only authenticated staff can read or write patient submissions.

DROP POLICY IF EXISTS "submissions_all" ON submissions;

CREATE POLICY "submissions_all" ON submissions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 4. notes ─────────────────────────────────────────────────────────────────
-- Authenticated staff only.

DROP POLICY IF EXISTS "notes_all" ON notes;

CREATE POLICY "notes_all" ON notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 5. audit_logs ─────────────────────────────────────────────────────────────
-- Staff can read the full audit trail; they can insert but never update/delete.

DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

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
-- Authenticated staff can manage assignments; no public access.

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_all" ON assignments;

CREATE POLICY "assignments_all" ON assignments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 8. Storage — team-profile bucket ─────────────────────────────────────────
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
