-- Fix the account_balances RLS policies to allow trigger functions to work
-- The initialize_user_balance trigger fails because auth.uid() is NULL in trigger context

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own balance" ON public.account_balances;

-- Create new policy that allows both authenticated users and trigger functions
CREATE POLICY "Users can insert their own balance" ON public.account_balances
FOR INSERT WITH CHECK (
  -- Allow if user is authenticated and inserting their own balance
  (auth.uid() = user_id) OR 
  -- Allow if this is being called from a trigger function (auth.uid() is NULL)
  (auth.uid() IS NULL)
);

-- Also ensure the initialize_user_balance function works correctly
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Insert with explicit values from the NEW record
    INSERT INTO public.account_balances (user_id, account_number, balance, currency)
    VALUES (NEW.user_id, NEW.account_number, 0.00, 'LT');
    RETURN NEW;
END;
$function$;