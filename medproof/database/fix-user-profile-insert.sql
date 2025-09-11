-- Fix for user profile creation issue
-- Add missing INSERT policy for user_profiles table

-- Allow users to insert their own profile (during registration)
CREATE POLICY "Users can create their own profile" ON user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Refresh policies
SELECT 1;