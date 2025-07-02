-- Create missing account balance records for existing users
INSERT INTO public.account_balances (user_id, account_number, balance, currency)
SELECT p.user_id, p.account_number, 1000.00, 'EUR'
FROM public.profiles p
LEFT JOIN public.account_balances ab ON p.user_id = ab.user_id
WHERE ab.user_id IS NULL;