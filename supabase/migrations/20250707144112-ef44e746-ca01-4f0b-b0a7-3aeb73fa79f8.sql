-- Step 1: Fix RLS policies on account_balances to allow trigger operations
-- Remove the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own balance" ON public.account_balances;

-- Create a new policy that allows both user insertions AND system/trigger insertions
CREATE POLICY "Users and system can insert balance records" 
ON public.account_balances 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR  -- User can insert their own
  (auth.uid() IS NULL)       -- System/triggers can insert (no auth context)
);

-- Step 2: Make triggers SECURITY DEFINER for better privilege handling
-- Update the handle_new_user function to be SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS
SET search_path = ''
AS $$
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'handle_new_user trigger started for user: %', NEW.id;
    
    INSERT INTO public.profiles (user_id, account_number, email, display_name)
    VALUES (
        NEW.id, 
        public.generate_account_number(),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
    );
    
    RAISE NOTICE 'Profile created successfully for user: %', NEW.id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in handle_new_user: % %', SQLSTATE, SQLERRM;
        RAISE;
END;
$$;

-- Update the initialize_user_balance function to be SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS
SET search_path = ''
AS $$
BEGIN
    -- Insert balance record for new profile
    INSERT INTO public.account_balances (user_id, account_number, balance, currency)
    VALUES (NEW.user_id, NEW.account_number, 0.00, 'LT');
    
    RAISE NOTICE 'Balance created successfully for user: %', NEW.user_id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in initialize_user_balance: % %', SQLSTATE, SQLERRM;
        RAISE;
END;
$$;