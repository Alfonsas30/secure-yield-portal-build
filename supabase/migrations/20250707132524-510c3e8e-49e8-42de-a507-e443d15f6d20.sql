-- Create audit table for daily interest calculations
CREATE TABLE public.daily_interest_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  accounts_processed INTEGER NOT NULL DEFAULT 0,
  total_interest_paid NUMERIC NOT NULL DEFAULT 0,
  initiated_by UUID REFERENCES auth.users(id),
  initiated_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' or 'automatic'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_interest_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all calculations" 
ON public.daily_interest_calculations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert calculations" 
ON public.daily_interest_calculations 
FOR INSERT 
WITH CHECK (true);

-- Add unique constraint to prevent multiple calculations per day
CREATE UNIQUE INDEX idx_daily_interest_calculations_date 
ON public.daily_interest_calculations (calculation_date);

-- Update the calculate_daily_interest function to prevent multiple daily calculations
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
    -- Calculate daily interest
    interest_amount := account_record.balance * daily_rate;
    
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

-- Create function to check if interest was calculated today
CREATE OR REPLACE FUNCTION public.check_daily_interest_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  calculation_record RECORD;
  result JSON;
BEGIN
  SELECT * INTO calculation_record 
  FROM public.daily_interest_calculations 
  WHERE calculation_date = today_date;
  
  IF FOUND THEN
    RETURN json_build_object(
      'calculated_today', true,
      'calculation_date', calculation_record.calculation_date,
      'accounts_processed', calculation_record.accounts_processed,
      'total_interest_paid', calculation_record.total_interest_paid,
      'calculated_at', calculation_record.created_at,
      'initiated_type', calculation_record.initiated_type
    );
  ELSE
    RETURN json_build_object(
      'calculated_today', false,
      'calculation_date', today_date
    );
  END IF;
END;
$$;