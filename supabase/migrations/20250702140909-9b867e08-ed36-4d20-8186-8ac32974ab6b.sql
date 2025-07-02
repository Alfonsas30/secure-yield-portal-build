-- Update currency from EUR to LT across all tables and functions

-- Update default currency in account_balances table
ALTER TABLE public.account_balances 
ALTER COLUMN currency SET DEFAULT 'LT';

-- Update default currency in transactions table  
ALTER TABLE public.transactions
ALTER COLUMN currency SET DEFAULT 'LT';

-- Update default currency in transfer_requests table
ALTER TABLE public.transfer_requests
ALTER COLUMN currency SET DEFAULT 'LT';

-- Update existing data to use LT currency
UPDATE public.account_balances 
SET currency = 'LT', updated_at = now() 
WHERE currency = 'EUR';

UPDATE public.transactions 
SET currency = 'LT', updated_at = now() 
WHERE currency = 'EUR';

UPDATE public.transfer_requests 
SET currency = 'LT', updated_at = now() 
WHERE currency = 'EUR';

-- Update the initialize_user_balance function to use LT currency
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.account_balances (user_id, account_number, balance, currency)
    VALUES (NEW.user_id, NEW.account_number, 0.00, 'LT');
    RETURN NEW;
END;
$function$;