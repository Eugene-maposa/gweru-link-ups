-- Add missing foreign key constraints for better data integrity
ALTER TABLE public.approval_tokens 
ADD CONSTRAINT approval_tokens_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.job_applications 
ADD CONSTRAINT job_applications_job_id_fkey 
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE public.job_applications 
ADD CONSTRAINT job_applications_worker_id_fkey 
FOREIGN KEY (worker_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_employer_id_fkey 
FOREIGN KEY (employer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.worker_profiles 
ADD CONSTRAINT worker_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

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
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_worker_profiles_updated_at
  BEFORE UPDATE ON public.worker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();