-- Laikinai išjungti 2FA visiems vartotojams
UPDATE public.profiles 
SET mfa_enabled = false, mfa_verified = false, updated_at = now();