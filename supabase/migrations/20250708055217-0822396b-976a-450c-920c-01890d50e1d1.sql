-- Fix failed transfer - add money to recipient and create missing transaction
-- Step 1: Add 100 LT to recipient LT661261707352
SELECT atomic_balance_update(
  (SELECT user_id FROM public.profiles WHERE account_number = 'LT661261707352'),
  100.00,
  'transfer_correction',
  'Pervedimo pataisymas - trūkstamų pinigų pridėjimas už nepavykusį pervedimą iš LT068073532464'
);

-- Step 2: Create missing transfer_in transaction for recipient
INSERT INTO public.transactions (
  user_id, 
  account_number, 
  amount, 
  transaction_type,
  description, 
  recipient_account, 
  recipient_name,
  status, 
  currency,
  created_at
) 
SELECT 
  p.user_id,
  p.account_number,
  100.00,
  'transfer_in',
  'Gauti pinigai iš LT068073532464',
  'LT068073532464',
  sender_profile.display_name,
  'completed',
  'LT',
  (SELECT created_at FROM public.transactions 
   WHERE transaction_type = 'transfer_out' 
   AND amount = -100.00 
   AND recipient_account = 'LT661261707352'
   ORDER BY created_at DESC LIMIT 1)
FROM public.profiles p
CROSS JOIN (
  SELECT display_name 
  FROM public.profiles 
  WHERE account_number = 'LT068073532464'
) sender_profile
WHERE p.account_number = 'LT661261707352';