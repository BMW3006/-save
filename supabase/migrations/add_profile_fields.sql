-- Add profile fields to auth.users table
-- This migration adds avatar_url, display_name, and profile_updated_at fields for user profiles

-- Add columns to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT NULL;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_users_display_name ON auth.users(display_name);

-- Create profiles view for easier querying
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'username' as username,
  display_name,
  avatar_url,
  reference_code,
  referral_tokens,
  profile_updated_at,
  created_at
FROM auth.users
WHERE deleted_at IS NULL;

-- Grant permissions
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- RLS Policy: Users can read their own profile
CREATE POLICY "Users can view their own profile" ON auth.users
FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON auth.users
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Function to update profile_updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profile_updated_at
DROP TRIGGER IF EXISTS trigger_update_profile_timestamp ON auth.users;
CREATE TRIGGER trigger_update_profile_timestamp
BEFORE UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION update_profile_timestamp();
