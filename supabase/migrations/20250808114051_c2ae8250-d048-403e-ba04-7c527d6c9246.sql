-- First, let's create the missing profile for the user who doesn't have one
INSERT INTO public.profiles (
  id, 
  email, 
  full_name, 
  phone, 
  national_id, 
  role, 
  location, 
  approval_status
) 
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'User'),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  COALESCE(au.raw_user_meta_data->>'national_id', ''),
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'worker'::user_role),
  COALESCE(au.raw_user_meta_data->>'location', ''),
  'pending'::approval_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Ensure the trigger exists and is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();