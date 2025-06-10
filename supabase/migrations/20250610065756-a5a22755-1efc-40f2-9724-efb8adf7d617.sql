
-- Create approval_tokens table to store email approval tokens
CREATE TABLE public.approval_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  approve_token uuid NOT NULL,
  reject_token uuid NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approval_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Only system can manage approval tokens" 
ON public.approval_tokens 
FOR ALL
USING (false);

-- Create indexes for better performance
CREATE INDEX idx_approval_tokens_user_id ON public.approval_tokens(user_id);
CREATE INDEX idx_approval_tokens_approve ON public.approval_tokens(approve_token);
CREATE INDEX idx_approval_tokens_reject ON public.approval_tokens(reject_token);
CREATE INDEX idx_approval_tokens_expires ON public.approval_tokens(expires_at);
