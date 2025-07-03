-- Create verification_codes table for 2FA
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for verification codes
CREATE POLICY "Users can insert verification codes for their email" 
ON public.verification_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view verification codes for their email" 
ON public.verification_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update verification codes for their email" 
ON public.verification_codes 
FOR UPDATE 
USING (true);

-- Add 2FA fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN mfa_verified BOOLEAN NOT NULL DEFAULT false;

-- Add trigger for automatic timestamp updates on verification_codes
CREATE TRIGGER update_verification_codes_updated_at
BEFORE UPDATE ON public.verification_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_verification_codes_email_expires ON public.verification_codes(email, expires_at);
CREATE INDEX idx_verification_codes_code ON public.verification_codes(code) WHERE used = false;

-- Create function to cleanup expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;