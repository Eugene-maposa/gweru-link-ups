-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('national-ids', 'national-ids', false),
  ('profile-pictures', 'profile-pictures', true);

-- Create storage policies for national IDs (private)
CREATE POLICY "Users can upload their own national ID" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'national-ids' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own national ID" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'national-ids' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all national IDs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'national-ids' AND get_user_role(auth.uid()) = 'admin'::user_role);

-- Create storage policies for profile pictures (public)
CREATE POLICY "Anyone can view profile pictures" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile picture" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile picture" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add file upload columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN national_id_file_url TEXT,
ADD COLUMN profile_picture_url TEXT;