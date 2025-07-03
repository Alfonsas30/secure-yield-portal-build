-- Išjungti TOTP saugumą visiems vartotojams
UPDATE public.profiles 
SET totp_enabled = false, totp_secret = null, updated_at = now();

-- Atnaujinti profilių lentą, kad TOTP būtų pagal nutylėjimą išjungtas
ALTER TABLE public.profiles 
ALTER COLUMN totp_enabled SET DEFAULT false;