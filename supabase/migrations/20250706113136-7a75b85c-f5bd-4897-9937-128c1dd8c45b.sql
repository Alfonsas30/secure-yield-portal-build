-- Temporarily disable MFA for the user who can't login
UPDATE profiles 
SET mfa_enabled = false 
WHERE email = 'gmbhinvest333@gmail.com';

-- Also ensure TOTP is properly set up for future use
UPDATE profiles 
SET totp_enabled = false 
WHERE email = 'gmbhinvest333@gmail.com' AND totp_enabled IS NULL;