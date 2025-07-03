-- Create trigger to automatically create worker profiles for workers
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  -- Create worker profile if user role is worker
  IF NEW.role = 'worker' THEN
    INSERT INTO public.worker_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new profiles
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Update profiles timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_worker_profiles_updated_at ON public.worker_profiles;
CREATE TRIGGER update_worker_profiles_updated_at
  BEFORE UPDATE ON public.worker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON public.worker_profiles(user_id);