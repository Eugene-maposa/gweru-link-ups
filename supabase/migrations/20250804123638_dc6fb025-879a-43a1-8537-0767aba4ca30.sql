-- First, let's drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

-- Create the updated function with proper search path security
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user_profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Update other functions to have proper search path
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT approval_status = 'approved' FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;