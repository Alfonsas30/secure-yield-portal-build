-- Update the initialize_user_balance function to set default balance to 0.00 EUR instead of 1000.00 EUR
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.account_balances (user_id, account_number, balance)
    VALUES (NEW.user_id, NEW.account_number, 0.00); -- Changed from 1000.00 to 0.00 EUR
    RETURN NEW;
END;
$function$;