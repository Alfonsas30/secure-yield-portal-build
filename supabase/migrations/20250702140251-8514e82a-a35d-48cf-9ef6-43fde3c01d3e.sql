-- Update user's account balance to 2 million EUR
UPDATE public.account_balances 
SET balance = 2000000.00, updated_at = now() 
WHERE user_id = 'c92016b3-ad18-46c4-b582-e8981f8db90f';