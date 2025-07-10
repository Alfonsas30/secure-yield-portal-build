-- Improve the daily interest calculation function with better precision and rounding
CREATE OR REPLACE FUNCTION public.calculate_daily_interest()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  account_record RECORD;
  daily_rate NUMERIC := 0.02 / 365; -- 2% annual rate divided by 365 days
  interest_amount NUMERIC;
  total_processed INTEGER := 0;
  total_interest NUMERIC := 0;
  today_date DATE := CURRENT_DATE;
  existing_calculation RECORD;
  result JSON;
BEGIN
  -- Check if interest was already calculated today
  SELECT * INTO existing_calculation 
  FROM public.daily_interest_calculations 
  WHERE calculation_date = today_date;
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Daily interest already calculated for today',
      'calculation_date', existing_calculation.calculation_date,
      'accounts_processed', existing_calculation.accounts_processed,
      'total_interest_paid', existing_calculation.total_interest_paid,
      'calculated_at', existing_calculation.created_at
    );
  END IF;
  
  -- Loop through all accounts with positive balance
  FOR account_record IN 
    SELECT user_id, account_number, balance 
    FROM public.account_balances 
    WHERE balance > 0
  LOOP
    -- Calculate daily interest with better precision
    -- Round to 6 decimal places for calculation, then to 2 for display
    interest_amount := ROUND(account_record.balance * daily_rate, 6);
    
    -- Only process if interest amount is at least 0.01 LT
    IF interest_amount >= 0.01 THEN
      -- Add interest to account using atomic function
      PERFORM public.atomic_balance_update(
        account_record.user_id,
        ROUND(interest_amount, 2), -- Round to 2 decimal places for actual balance
        'daily_interest',
        'Dienos palūkanos 2% metinė norma'
      );
      
      total_processed := total_processed + 1;
      total_interest := total_interest + ROUND(interest_amount, 2);
    ELSE
      -- For very small amounts, accumulate daily until reaching 0.01 LT minimum
      -- This could be implemented later if needed
      NULL;
    END IF;
  END LOOP;
  
  -- Record the calculation in audit table
  INSERT INTO public.daily_interest_calculations (
    calculation_date,
    accounts_processed,
    total_interest_paid,
    initiated_by,
    initiated_type
  ) VALUES (
    today_date,
    total_processed,
    total_interest,
    auth.uid(),
    CASE WHEN auth.uid() IS NULL THEN 'automatic' ELSE 'manual' END
  );
  
  -- Return summary
  RETURN json_build_object(
    'success', true,
    'accounts_processed', total_processed,
    'total_interest_paid', total_interest,
    'calculation_date', today_date,
    'processed_at', now()
  );
END;
$$;

-- Create an improved interest calculation function for small balances
CREATE OR REPLACE FUNCTION public.calculate_daily_interest_with_accumulation()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  account_record RECORD;
  daily_rate NUMERIC := 0.02 / 365; -- 2% annual rate divided by 365 days
  interest_amount NUMERIC;
  accumulated_interest NUMERIC;
  total_processed INTEGER := 0;
  total_interest NUMERIC := 0;
  today_date DATE := CURRENT_DATE;
  existing_calculation RECORD;
  result JSON;
BEGIN
  -- Check if interest was already calculated today
  SELECT * INTO existing_calculation 
  FROM public.daily_interest_calculations 
  WHERE calculation_date = today_date;
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Daily interest already calculated for today',
      'calculation_date', existing_calculation.calculation_date,
      'accounts_processed', existing_calculation.accounts_processed,
      'total_interest_paid', existing_calculation.total_interest_paid,
      'calculated_at', existing_calculation.created_at
    );
  END IF;
  
  -- Loop through all accounts with positive balance
  FOR account_record IN 
    SELECT user_id, account_number, balance 
    FROM public.account_balances 
    WHERE balance > 0
  LOOP
    -- Calculate precise daily interest
    interest_amount := account_record.balance * daily_rate;
    
    -- Always add interest, but with proper rounding
    -- For amounts under 100 LT, use higher precision
    IF account_record.balance < 100 THEN
      interest_amount := ROUND(interest_amount, 4); -- 4 decimal places for small amounts
    ELSE
      interest_amount := ROUND(interest_amount, 2); -- 2 decimal places for larger amounts
    END IF;
    
    -- Add interest to account using atomic function
    PERFORM public.atomic_balance_update(
      account_record.user_id,
      interest_amount,
      'daily_interest',
      'Dienos palūkanos 2% metinė norma'
    );
    
    total_processed := total_processed + 1;
    total_interest := total_interest + interest_amount;
  END LOOP;
  
  -- Record the calculation in audit table
  INSERT INTO public.daily_interest_calculations (
    calculation_date,
    accounts_processed,
    total_interest_paid,
    initiated_by,
    initiated_type
  ) VALUES (
    today_date,
    total_processed,
    ROUND(total_interest, 2),
    auth.uid(),
    CASE WHEN auth.uid() IS NULL THEN 'automatic' END
  );
  
  -- Return summary
  RETURN json_build_object(
    'success', true,
    'accounts_processed', total_processed,
    'total_interest_paid', ROUND(total_interest, 2),
    'calculation_date', today_date,
    'processed_at', now()
  );
END;
$$;

-- Create a function to check and display precise interest calculations
CREATE OR REPLACE FUNCTION public.get_daily_interest_preview(target_balance NUMERIC DEFAULT NULL)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  daily_rate NUMERIC := 0.02 / 365;
  balance_to_check NUMERIC;
  daily_interest NUMERIC;
  monthly_interest NUMERIC;
  yearly_interest NUMERIC;
  result JSON;
BEGIN
  -- Use provided balance or get user's current balance
  IF target_balance IS NOT NULL THEN
    balance_to_check := target_balance;
  ELSE
    SELECT balance INTO balance_to_check 
    FROM public.account_balances 
    WHERE user_id = auth.uid();
    
    IF balance_to_check IS NULL THEN
      balance_to_check := 0;
    END IF;
  END IF;
  
  -- Calculate interest amounts
  daily_interest := ROUND(balance_to_check * daily_rate, 6);
  monthly_interest := ROUND(daily_interest * 30, 2);
  yearly_interest := ROUND(balance_to_check * 0.02, 2);
  
  RETURN json_build_object(
    'balance', balance_to_check,
    'daily_rate_percent', ROUND(daily_rate * 100, 8),
    'daily_interest', daily_interest,
    'monthly_interest', monthly_interest,
    'yearly_interest', yearly_interest,
    'daily_interest_rounded', ROUND(daily_interest, 2)
  );
END;
$$;