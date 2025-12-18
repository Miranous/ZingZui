/*
  # Fix RLS Performance and Security Issues

  This migration addresses multiple security and performance issues identified by Supabase:

  ## Changes Made

  1. **RLS Performance Optimization**
     - Updated all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents the function from being re-evaluated for each row, significantly improving query performance at scale

  2. **Remove Duplicate Permissive Policies**
     - Removed overly permissive policies that allowed all anon/authenticated users access
     - These conflicted with proper ownership-based policies
     - Affected policies:
       - users: Enable insert/select/update/delete for anon and authenticated
       - notes: Enable insert/select/update/delete for anon and authenticated

  3. **Unused Index Cleanup**
     - Dropped `idx_notes_updated_at` (unused, covered by idx_notes_owner_updated)
     - Dropped `idx_tasks_note_id` (unused, covered by idx_tasks_position)

  4. **Function Security Fixes**
     - Recreated `update_updated_at_column` with immutable search_path
     - Recreated `handle_new_user` with immutable search_path
     - This prevents potential SQL injection through search_path manipulation

  ## Security Impact

  - RLS policies are now properly enforced with better performance
  - No more conflicting permissive policies
  - Functions are protected against search_path attacks
*/

-- ============================================================================
-- PART 1: Drop old permissive policies that are too broad
-- ============================================================================

-- Drop overly permissive users policies
DROP POLICY IF EXISTS "Enable insert for anon and authenticated" ON users;
DROP POLICY IF EXISTS "Enable select for anon and authenticated" ON users;
DROP POLICY IF EXISTS "Enable update for anon and authenticated" ON users;
DROP POLICY IF EXISTS "Enable delete for anon and authenticated" ON users;

-- Drop overly permissive notes policies
DROP POLICY IF EXISTS "Enable insert for anon and authenticated" ON notes;
DROP POLICY IF EXISTS "Enable select for anon and authenticated" ON notes;
DROP POLICY IF EXISTS "Enable update for anon and authenticated" ON notes;
DROP POLICY IF EXISTS "Enable delete for anon and authenticated" ON notes;

-- ============================================================================
-- PART 2: Recreate optimized RLS policies with (select auth.uid())
-- ============================================================================

-- Drop existing policies to recreate them with optimized syntax
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can read own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

DROP POLICY IF EXISTS "Users can read own note tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks for own notes" ON tasks;
DROP POLICY IF EXISTS "Users can update own note tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own note tasks" ON tasks;

-- Users table policies with optimized auth.uid() calls
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = auth_user_id)
  WITH CHECK ((select auth.uid()) = auth_user_id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = auth_user_id);

-- Notes table policies with optimized auth.uid() calls
CREATE POLICY "Users can read own notes"
  ON notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = owner_id);

-- Tasks table policies with optimized auth.uid() calls
CREATE POLICY "Users can read own note tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = tasks.note_id
      AND notes.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create tasks for own notes"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = tasks.note_id
      AND notes.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own note tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = tasks.note_id
      AND notes.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = tasks.note_id
      AND notes.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own note tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = tasks.note_id
      AND notes.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 3: Drop unused indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_notes_updated_at;
DROP INDEX IF EXISTS idx_tasks_note_id;

-- ============================================================================
-- PART 4: Fix function security (immutable search_path)
-- ============================================================================

-- Recreate update_updated_at_column with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate handle_new_user with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;
