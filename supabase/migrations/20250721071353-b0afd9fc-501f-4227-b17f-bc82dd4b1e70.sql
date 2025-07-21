-- Fix the trigger dependency issue and profile creation
-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now drop the function
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;

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

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Fix RLS policies to allow login without email confirmation
-- Make profile reading more permissive for authenticated users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Ensure admins can see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);