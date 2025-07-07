-- Create a manual data creation function for emergency use
CREATE OR REPLACE FUNCTION public.create_missing_user_data(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  profile_exists BOOLEAN := FALSE;
  balance_exists BOOLEAN := FALSE;
  new_account_number TEXT;
  result JSON;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = target_user_id) INTO profile_exists;
  
  -- Check if balance exists  
  SELECT EXISTS(SELECT 1 FROM public.account_balances WHERE user_id = target_user_id) INTO balance_exists;
  
  -- Create profile if missing
  IF NOT profile_exists THEN
    new_account_number := public.generate_account_number();
    
    INSERT INTO public.profiles (user_id, account_number, email, display_name)
    SELECT 
      target_user_id,
      new_account_number,
      u.email,
      COALESCE(u.raw_user_meta_data ->> 'display_name', u.email)
    FROM auth.users u 
    WHERE u.id = target_user_id;
    
    RAISE NOTICE 'Profile created manually for user: %', target_user_id;
  ELSE
    -- Get existing account number
    SELECT account_number INTO new_account_number 
    FROM public.profiles 
    WHERE user_id = target_user_id;
  END IF;
  
  -- Create balance if missing
  IF NOT balance_exists THEN
    INSERT INTO public.account_balances (user_id, account_number, balance, currency)
    VALUES (target_user_id, new_account_number, 0.00, 'LT');
    
    RAISE NOTICE 'Balance created manually for user: %', target_user_id;
  END IF;
  
  -- Return status
  RETURN json_build_object(
    'success', true,
    'profile_created', NOT profile_exists,
    'balance_created', NOT balance_exists,
    'account_number', new_account_number
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_missing_user_data: % %', SQLSTATE, SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;