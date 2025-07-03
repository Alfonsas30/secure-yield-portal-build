-- Add TOTP support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN totp_secret TEXT,
ADD COLUMN totp_enabled BOOLEAN NOT NULL DEFAULT false;

-- Create backup codes table
CREATE TABLE public.backup_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on backup codes
ALTER TABLE public.backup_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for backup codes
CREATE POLICY "Users can view their own backup codes" 
ON public.backup_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backup codes" 
ON public.backup_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup codes" 
ON public.backup_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to generate random backup code
CREATE OR REPLACE FUNCTION public.generate_backup_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  code := '';
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;