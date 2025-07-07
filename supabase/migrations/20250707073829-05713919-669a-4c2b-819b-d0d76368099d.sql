-- Fix verification_codes table to allow nullable user_id
-- This is needed because verification codes can be sent to users during login (before they're authenticated)
ALTER TABLE public.verification_codes 
ALTER COLUMN user_id DROP NOT NULL;