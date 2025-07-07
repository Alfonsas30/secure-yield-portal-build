-- Step 1: Remove ALL triggers from profiles table to eliminate conflicts
-- This includes the problematic initialize_balance_trigger that wasn't removed before
DROP TRIGGER IF EXISTS trigger_create_profile_balance ON public.profiles;
DROP TRIGGER IF EXISTS initialize_balance_on_profile_insert ON public.profiles;
DROP TRIGGER IF EXISTS initialize_balance_trigger ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Also check for any other potential trigger names
DROP TRIGGER IF EXISTS create_profile_balance ON public.profiles;
DROP TRIGGER IF EXISTS profile_balance_trigger ON public.profiles;

-- Drop all related trigger functions to start completely clean
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.initialize_user_balance();
DROP FUNCTION IF EXISTS public.create_profile_balance();

-- Step 2: Clean up duplicate balance entries
-- Delete duplicate balances, keeping only the newest for each user
DELETE FROM public.account_balances 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM public.account_balances 
  ORDER BY user_id, created_at DESC
);

-- Step 3: Add unique constraint to prevent duplicate balances (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_balance'
    ) THEN
        ALTER TABLE public.account_balances 
        ADD CONSTRAINT unique_user_balance UNIQUE (user_id);
    END IF;
END $$;

-- Step 4: Fix RLS policy to allow triggers to work properly
-- Drop existing problematic policy
DROP POLICY IF EXISTS "Users can insert their own balance" ON public.account_balances;

-- Create new policy that allows both authenticated users and trigger functions
CREATE POLICY "Users can insert their own balance" ON public.account_balances
FOR INSERT WITH CHECK (
  -- Allow if user is authenticated and inserting their own balance
  (auth.uid() = user_id) OR 
  -- Allow if this is being called from a trigger function (auth.uid() is NULL)
  (auth.uid() IS NULL)
);

-- Step 5: Create a single, working trigger system
-- Create the profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- Create the balance initialization trigger function
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- Step 6: Create the triggers - only ONE of each type
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER initialize_balance_on_profile_insert
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_balance();