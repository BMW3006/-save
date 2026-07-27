-- Referral System Schema
-- Add reference_code and referrer_id to existing auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS reference_code VARCHAR(12) UNIQUE NOT NULL DEFAULT '';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS referral_tokens INTEGER DEFAULT 0;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, expired
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  tokens_awarded INTEGER DEFAULT 0,
  
  UNIQUE(referrer_id, referred_user_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'expired'))
);

-- Create referral_tokens table for token tracking
CREATE TABLE IF NOT EXISTS referral_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  source VARCHAR(50) DEFAULT 'referral', -- referral, bonus, etc
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_tokens_user ON referral_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_users_reference_code ON auth.users(reference_code);
CREATE INDEX IF NOT EXISTS idx_auth_users_referrer ON auth.users(referrer_id);

-- RLS Policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own referrals
CREATE POLICY "Users can view their referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Allow users to view their tokens
CREATE POLICY "Users can view their tokens" ON referral_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Function to generate unique reference code
CREATE OR REPLACE FUNCTION generate_reference_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  code VARCHAR(12);
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 8));
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE reference_code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;
