/*
  # Fix Users RLS Policies for Custom Authentication

  This migration fixes the RLS policies to work with custom authentication
  instead of Supabase Auth (auth.uid()).

  1. Changes
    - Drop all existing policies that use auth.uid()
    - Create new policies that allow operations for custom auth system
    - INSERT: Allow anyone to create accounts (signup)
    - SELECT: Allow anyone to read for login verification
    - UPDATE: Allow anyone (application controls access)
    - DELETE: Allow anyone (application controls access)

  2. Important Notes
    - We're using a custom users table, not Supabase Auth
    - Application layer handles authentication and authorization
    - RLS is kept permissive to allow custom auth flows
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can create account" ON users;
DROP POLICY IF EXISTS "Users can delete own account" ON users;
DROP POLICY IF EXISTS "Allow public signup" ON users;
DROP POLICY IF EXISTS "Allow read for authentication" ON users;
DROP POLICY IF EXISTS "Allow updates" ON users;
DROP POLICY IF EXISTS "Allow deletes" ON users;

-- Allow public signup (insert)
CREATE POLICY "Enable insert for anon and authenticated"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading user data for authentication
CREATE POLICY "Enable select for anon and authenticated"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow updates
CREATE POLICY "Enable update for anon and authenticated"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow deletes
CREATE POLICY "Enable delete for anon and authenticated"
  ON users FOR DELETE
  TO anon, authenticated
  USING (true);
