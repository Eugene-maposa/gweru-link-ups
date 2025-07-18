-- Fix RLS policy for profile creation during signup
-- Users should be able to create their own profile during signup even before email confirmation

-- Drop existing restrictive policy and create a more permissive one for INSERT
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new policy that allows users to insert their own profile during signup
CREATE POLICY "Users can create their own profile during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Also ensure users can read their own profile after creation
-- (This policy likely already exists but let's make sure)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Enable email confirmation in auth settings by ensuring proper configuration
-- Note: This may require manual configuration in Supabase dashboard as well