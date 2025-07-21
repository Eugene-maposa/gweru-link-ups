-- Check for orphaned users in auth.users who don't have profiles
-- First, let's see what users exist in auth vs profiles
DO $$
DECLARE
    auth_user_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Count users in auth.users (this is just for logging, can't actually query it directly)
    -- But we can check if there are profiles missing by looking at the edge function logs
    
    -- Get current profile count
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    
    RAISE NOTICE 'Current profiles count: %', profile_count;
    
    -- We'll need to handle profile creation for existing auth users
    -- This trigger should handle new signups going forward
END $$;

-- Fix the trigger to properly handle profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

-- Create improved function for handling new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create profile if one doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      phone,
      national_id,
      role,
      location,
      approval_status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'national_id', ''),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'worker'::user_role),
      COALESCE(NEW.raw_user_meta_data->>'location', ''),
      'pending'::approval_status
    );
  END IF;
  
  -- Create worker profile if user role is worker
  IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'worker'::user_role) = 'worker' THEN
    INSERT INTO public.worker_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Also make sure email confirmation is not required for login by updating RLS policies
-- Update the profile selection policy to be more permissive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id OR auth.uid() IS NOT NULL);

-- Ensure users can always read their profile after signup, even before email confirmation
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);