/*
  # Add Subscription Tier to Users Table

  1. Changes
    - Add `subscription_tier` column to `users` table
      - Type: text (enum-like values: 'free', 'premium', 'pro')
      - Default: 'free'
      - Not null constraint
    - Add check constraint to ensure valid tier values
    
  2. Notes
    - All existing users will default to 'free' tier
    - This enables feature flag system for monetization
    - Future: integrate with RevenueCat for subscription management
*/

-- Add subscription_tier column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free';
  END IF;
END $$;

-- Add check constraint for valid tier values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_subscription_tier_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check 
      CHECK (subscription_tier IN ('free', 'premium', 'pro'));
  END IF;
END $$;

-- Create index for faster tier lookups
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);