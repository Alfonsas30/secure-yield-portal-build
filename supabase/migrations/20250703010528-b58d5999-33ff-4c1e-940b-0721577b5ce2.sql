-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to calculate daily interest for all accounts
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
  result json;
BEGIN
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
  
  -- Return summary
  RETURN json_build_object(
    'success', true,
    'accounts_processed', total_processed,
    'total_interest_paid', total_interest,
    'processed_at', now()
  );
END;
$$;

-- Schedule daily interest calculation at 00:01 every day
SELECT cron.schedule(
  'daily-interest-calculation',
  '1 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://latwptcvghypdopbpxfr.supabase.co/functions/v1/calculate-daily-interest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHdwdGN2Z2h5cGRvcGJweGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjU0NTMsImV4cCI6MjA2NjYwMTQ1M30.O6TbhAN5nWrEl89gdiCWkIiVPmptpJo10QSTpOL9ciE"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);