/*
  # Fix RLS Policies for Custom Authentication

  This migration updates the RLS policies to work with our custom authentication
  system instead of Supabase Auth.

  Since we're managing our own users table without Supabase Auth integration,
  we need to adjust the policies:
  - Allow anyone to insert (signup)
  - Allow anyone to select by email for login verification
  - Keep update/delete restricted to the application layer
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can create account" ON users;
DROP POLICY IF EXISTS "Users can delete own account" ON users;

-- Allow public signup (insert)
-- No restrictions on insert since we validate in the application layer
CREATE POLICY "Allow public signup"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading user data for authentication
-- This allows the login flow to verify credentials
CREATE POLICY "Allow read for authentication"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow updates (will be controlled by application logic)
CREATE POLICY "Allow updates"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow deletes (will be controlled by application logic)
CREATE POLICY "Allow deletes"
  ON users FOR DELETE
  TO anon, authenticated
  USING (true);
