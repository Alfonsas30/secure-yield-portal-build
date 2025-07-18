
-- Clean up invalid TOTP secrets that are not proper base32 format
-- Base32 should only contain A-Z and 2-7, no other characters
UPDATE public.profiles 
SET 
  totp_secret = NULL,
  totp_enabled = false,
  updated_at = now()
WHERE 
  totp_secret IS NOT NULL 
  AND (
    -- Check for invalid characters (anything other than A-Z, 2-7)
    totp_secret ~ '[^A-Z2-7]'
    OR
    -- Check for improper length (should be multiple of 8 for base32)
    length(totp_secret) % 8 != 0
    OR
    -- Check for mixed case (should be uppercase only)
    totp_secret != upper(totp_secret)
  );

-- Add a comment to track this cleanup
COMMENT ON TABLE public.profiles IS 'User profiles with cleaned TOTP secrets on 2025-07-18';
