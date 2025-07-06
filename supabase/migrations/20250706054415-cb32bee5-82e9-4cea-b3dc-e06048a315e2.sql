-- Update messenger_2fa table to allow 'email' as a messenger type
ALTER TABLE public.messenger_2fa 
DROP CONSTRAINT messenger_2fa_messenger_type_check;

ALTER TABLE public.messenger_2fa 
ADD CONSTRAINT messenger_2fa_messenger_type_check 
CHECK (messenger_type IN ('telegram', 'whatsapp', 'signal', 'viber', 'email'));