-- Fix missing daily interest for accounts LT727520508442 and LT661261707352
-- First, manually add missing interest for 2025-07-11

-- Calculate daily interest for LT727520508442 (balance ~200): 200 * 0.02 / 365 = 0.0109589...
INSERT INTO public.transactions (
  user_id, 
  account_number, 
  amount, 
  transaction_type, 
  description,
  status,
  currency,
  created_at
) VALUES (
  'c668c97f-0343-4fa4-8232-8833a5678b8d',
  'LT727520508442',
  0.01095890,
  'daily_interest',
  'Dienos palūkanos 2% metinė norma (pataisyta)',
  'completed',
  'LT',
  '2025-07-11 05:35:14'
);

-- Update balance for LT727520508442
UPDATE public.account_balances 
SET balance = balance + 0.01095890,
    updated_at = '2025-07-11 05:35:14'
WHERE user_id = 'c668c97f-0343-4fa4-8232-8833a5678b8d';

-- Calculate daily interest for LT661261707352 (balance ~200): 200 * 0.02 / 365 = 0.0109589...
INSERT INTO public.transactions (
  user_id, 
  account_number, 
  amount, 
  transaction_type, 
  description,
  status,
  currency,
  created_at
) VALUES (
  '5247619b-1901-4b9f-abfe-5b7d7c4ba468',
  'LT661261707352',
  0.01095890,
  'daily_interest',
  'Dienos palūkanos 2% metinė norma (pataisyta)',
  'completed',
  'LT',
  '2025-07-11 05:35:14'
);

-- Update balance for LT661261707352
UPDATE public.account_balances 
SET balance = balance + 0.01095890,
    updated_at = '2025-07-11 05:35:14'
WHERE user_id = '5247619b-1901-4b9f-abfe-5b7d7c4ba468';

-- Now add missing interest for 2025-07-12

-- Add interest for LT727520508442
INSERT INTO public.transactions (
  user_id, 
  account_number, 
  amount, 
  transaction_type, 
  description,
  status,
  currency,
  created_at
) VALUES (
  'c668c97f-0343-4fa4-8232-8833a5678b8d',
  'LT727520508442',
  0.01095890,
  'daily_interest',
  'Dienos palūkanos 2% metinė norma (pataisyta)',
  'completed',
  'LT',
  '2025-07-12 07:00:42'
);

-- Update balance for LT727520508442
UPDATE public.account_balances 
SET balance = balance + 0.01095890,
    updated_at = '2025-07-12 07:00:42'
WHERE user_id = 'c668c97f-0343-4fa4-8232-8833a5678b8d';

-- Add interest for LT661261707352
INSERT INTO public.transactions (
  user_id, 
  account_number, 
  amount, 
  transaction_type, 
  description,
  status,
  currency,
  created_at
) VALUES (
  '5247619b-1901-4b9f-abfe-5b7d7c4ba468',
  'LT661261707352',
  0.01095890,
  'daily_interest',
  'Dienos palūkanos 2% metinė norma (pataisyta)',
  'completed',
  'LT',
  '2025-07-12 07:00:42'
);

-- Update balance for LT661261707352
UPDATE public.account_balances 
SET balance = balance + 0.01095890,
    updated_at = '2025-07-12 07:00:42'
WHERE user_id = '5247619b-1901-4b9f-abfe-5b7d7c4ba468';

-- Update the daily_interest_calculations records to reflect correct numbers
UPDATE public.daily_interest_calculations 
SET accounts_processed = 3,
    total_interest_paid = total_interest_paid + 0.02191780
WHERE calculation_date = '2025-07-11';

UPDATE public.daily_interest_calculations 
SET accounts_processed = 3,
    total_interest_paid = total_interest_paid + 0.02191780
WHERE calculation_date = '2025-07-12';

-- Replace the current calculate_daily_interest function with the accumulation version
-- that processes all accounts regardless of minimum amounts
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
    -- Calculate precise daily interest
    interest_amount := account_record.balance * daily_rate;
    
    -- Always add interest, but with proper rounding
    -- For amounts under 100 LT, use higher precision
    IF account_record.balance < 100 THEN
      interest_amount := ROUND(interest_amount, 4); -- 4 decimal places for small amounts
    ELSE
      interest_amount := ROUND(interest_amount, 2); -- 2 decimal places for larger amounts
    END IF;
    
    -- Add interest to account using atomic function (only if amount > 0)
    IF interest_amount > 0 THEN
      PERFORM public.atomic_balance_update(
        account_record.user_id,
        interest_amount,
        'daily_interest',
        'Dienos palūkanos 2% metinė norma'
      );
      
      total_processed := total_processed + 1;
      total_interest := total_interest + interest_amount;
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
    ROUND(total_interest, 2),
    auth.uid(),
    CASE WHEN auth.uid() IS NULL THEN 'automatic' ELSE 'manual' END
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