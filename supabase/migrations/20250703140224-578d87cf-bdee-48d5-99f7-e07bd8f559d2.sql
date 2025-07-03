-- Create messenger 2FA table
CREATE TABLE public.messenger_2fa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  messenger_type TEXT NOT NULL CHECK (messenger_type IN ('telegram', 'whatsapp', 'signal', 'viber')),
  messenger_id TEXT NOT NULL, -- Telegram chat ID, WhatsApp number, etc.
  display_name TEXT, -- User-friendly name for the messenger account
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  verification_code TEXT,
  code_expires_at TIMESTAMP WITH TIME ZONE,
  code_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, messenger_type, messenger_id)
);

-- Enable RLS
ALTER TABLE public.messenger_2fa ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own messenger 2FA settings" 
ON public.messenger_2fa 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messenger 2FA settings" 
ON public.messenger_2fa 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messenger 2FA settings" 
ON public.messenger_2fa 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messenger 2FA settings" 
ON public.messenger_2fa 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_messenger_2fa_updated_at
BEFORE UPDATE ON public.messenger_2fa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_messenger_2fa_user_id ON public.messenger_2fa(user_id);
CREATE INDEX idx_messenger_2fa_type ON public.messenger_2fa(messenger_type);
CREATE INDEX idx_messenger_2fa_verification ON public.messenger_2fa(verification_code) WHERE verification_code IS NOT NULL;