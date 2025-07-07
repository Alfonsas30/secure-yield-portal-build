-- Add detailed logging to trigger functions for debugging
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

-- Update initialize_user_balance with logging
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'initialize_user_balance trigger started for user: %, account: %', NEW.user_id, NEW.account_number;
    
    -- Insert with explicit values from the NEW record
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

-- Ensure triggers exist and are properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS initialize_balance_on_profile_insert ON public.profiles;
CREATE TRIGGER initialize_balance_on_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_balance();