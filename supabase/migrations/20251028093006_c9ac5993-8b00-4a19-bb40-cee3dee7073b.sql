-- Step 1: Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'employer', 'worker');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: Create helper function to get user roles (returns array)
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Step 6: Update RLS policies on profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 7: Update RLS policies on jobs table
DROP POLICY IF EXISTS "Approved employers can create jobs" ON public.jobs;

CREATE POLICY "Approved employers can create jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_user_approved(auth.uid()) AND 
  (public.has_role(auth.uid(), 'employer') OR public.has_role(auth.uid(), 'admin'))
);

-- Step 8: Update RLS policies on job_applications table
DROP POLICY IF EXISTS "Approved workers can apply for jobs" ON public.job_applications;

CREATE POLICY "Approved workers can apply for jobs"
ON public.job_applications
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_user_approved(auth.uid()) AND 
  public.has_role(auth.uid(), 'worker') AND 
  auth.uid() = worker_id
);

-- Step 9: Fix worker_profiles public access - require authentication
DROP POLICY IF EXISTS "Anyone can view worker profiles" ON public.worker_profiles;

CREATE POLICY "Authenticated users can view approved worker profiles"
ON public.worker_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = worker_profiles.user_id
    AND profiles.approval_status = 'approved'
  )
);

-- Step 10: Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 11: Update handle_new_user_profile trigger function to NOT set role in profiles
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create profile if one doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      phone,
      national_id,
      location,
      approval_status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'national_id', ''),
      COALESCE(NEW.raw_user_meta_data->>'location', ''),
      'pending'::approval_status
    );
    
    -- Insert role into user_roles table instead
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'worker'::app_role)
    )
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Create worker profile if user role is worker
  IF COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'worker'::app_role) = 'worker' THEN
    INSERT INTO public.worker_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user_profile: %', SQLERRM;
    RETURN NEW;
END;
$function$;