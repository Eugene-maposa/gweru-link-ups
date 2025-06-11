
-- Drop and recreate the foreign key constraint for approval_tokens to fix the reference
ALTER TABLE public.approval_tokens DROP CONSTRAINT IF EXISTS approval_tokens_user_id_fkey;
ALTER TABLE public.approval_tokens ADD CONSTRAINT approval_tokens_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add RLS policies for jobs table (skip if already exists)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'jobs' 
        AND policyname = 'Anyone can view jobs'
    ) THEN
        CREATE POLICY "Anyone can view jobs" 
        ON public.jobs 
        FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'jobs' 
        AND policyname = 'Job owners can update jobs'
    ) THEN
        CREATE POLICY "Job owners can update jobs" 
        ON public.jobs 
        FOR UPDATE 
        USING (true);
    END IF;
END $$;

-- Add RLS policies for job_applications table
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'job_applications' 
        AND policyname = 'Anyone can view job applications'
    ) THEN
        CREATE POLICY "Anyone can view job applications" 
        ON public.job_applications 
        FOR SELECT 
        USING (true);
    END IF;
END $$;

-- Add RLS policies for worker_profiles table
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'worker_profiles' 
        AND policyname = 'Anyone can view worker profiles'
    ) THEN
        CREATE POLICY "Anyone can view worker profiles" 
        ON public.worker_profiles 
        FOR SELECT 
        USING (true);
    END IF;
END $$;

-- Add missing foreign key constraints (skip if already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'jobs_employer_id_fkey'
    ) THEN
        ALTER TABLE public.jobs ADD CONSTRAINT jobs_employer_id_fkey 
        FOREIGN KEY (employer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'job_applications_worker_id_fkey'
    ) THEN
        ALTER TABLE public.job_applications ADD CONSTRAINT job_applications_worker_id_fkey 
        FOREIGN KEY (worker_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'job_applications_job_id_fkey'
    ) THEN
        ALTER TABLE public.job_applications ADD CONSTRAINT job_applications_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'worker_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE public.worker_profiles ADD CONSTRAINT worker_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
