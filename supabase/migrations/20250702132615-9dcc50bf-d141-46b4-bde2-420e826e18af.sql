-- Update specific user's account number to new format
UPDATE public.profiles 
SET account_number = public.generate_account_number(),
    updated_at = now()
WHERE user_id = 'c92016b3-ad18-46c4-b582-e8981f8db90f';