
-- Delete all non-admin users' related data
-- First, delete from worker_profiles
DELETE FROM public.worker_profiles 
WHERE user_id IN (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
  WHERE ur.role IS NULL
);

-- Delete from job_applications
DELETE FROM public.job_applications 
WHERE worker_id IN (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
  WHERE ur.role IS NULL
);

-- Delete from conversations
DELETE FROM public.conversations 
WHERE worker_id IN (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
  WHERE ur.role IS NULL
)
OR employer_id IN (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
  WHERE ur.role IS NULL
);

-- Delete from messages (for conversations that will be deleted)
DELETE FROM public.messages 
WHERE sender_id IN (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
  WHERE ur.role IS NULL
);

-- Delete from approval_tokens
DELETE FROM public.approval_tokens 
WHERE user_id IN (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
  WHERE ur.role IS NULL
);

-- Delete from user_roles (non-admin roles)
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
  WHERE ur.role IS NULL
);

-- Finally, delete the profiles
DELETE FROM public.profiles 
WHERE id IN (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
  WHERE ur.role IS NULL
);
