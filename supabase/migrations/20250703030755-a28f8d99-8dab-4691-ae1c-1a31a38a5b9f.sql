-- Clean up partial TOTP setups - remove secrets where TOTP is not enabled
UPDATE public.profiles 
SET totp_secret = NULL, updated_at = now()
WHERE totp_enabled = false AND totp_secret IS NOT NULL;