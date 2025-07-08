-- Add foreign key constraint between account_balances and profiles
ALTER TABLE public.account_balances 
ADD CONSTRAINT fk_account_balances_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;