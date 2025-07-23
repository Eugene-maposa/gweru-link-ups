-- Fix the national_id unique constraint issue by allowing NULL values
-- and making the constraint only apply to non-empty values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_national_id_key;

-- Create a new unique constraint that allows multiple empty strings but prevents duplicate non-empty national IDs
CREATE UNIQUE INDEX profiles_national_id_unique_idx 
ON public.profiles (national_id) 
WHERE national_id IS NOT NULL AND national_id != '';

-- Update existing user to be approved so they can log in
UPDATE public.profiles 
SET approval_status = 'approved'
WHERE email = 'mapseujers@gmail.com';