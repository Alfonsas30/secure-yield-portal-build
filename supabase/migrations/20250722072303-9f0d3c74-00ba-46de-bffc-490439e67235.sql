-- Update current account balances with the missing interest for 2025-07-20 and 2025-07-21
-- This ensures the balances are correct after adding the transactions

UPDATE public.account_balances 
SET balance = balance + (
  SELECT COALESCE(SUM(amount), 0) 
  FROM public.transactions 
  WHERE transactions.user_id = account_balances.user_id 
    AND transaction_type = 'daily_interest'
    AND created_at::date IN ('2025-07-20', '2025-07-21')
    AND created_at > account_balances.updated_at
),
updated_at = now()
WHERE user_id IN (
  SELECT DISTINCT user_id 
  FROM public.transactions 
  WHERE transaction_type = 'daily_interest'
    AND created_at::date IN ('2025-07-20', '2025-07-21')
);

-- Set up improved cron job with retry logic and monitoring
SELECT cron.unschedule('daily-interest-calculation-v2');

-- Create new cron job that runs at 00:01 and includes monitoring
SELECT cron.schedule(
  'daily-interest-calculation-v3',
  '1 0 * * *', -- Run at 00:01 every day
  $$
  SELECT net.http_post(
    url := 'https://khcelroaozkzpyxayvpj.supabase.co/functions/v1/calculate-daily-interest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY2Vscm9hb3prenB5eGF5dnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTEzODQsImV4cCI6MjA2NzEyNzM4NH0.vL2P2P6xuWR-n-dZGg7kcg8l5y1nOn2N_XznyqYL97c"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Add monitoring job that runs every morning at 08:00 to check if interest was calculated
SELECT cron.schedule(
  'daily-interest-monitor',
  '0 8 * * *', -- Run at 08:00 every day
  $$
  SELECT net.http_post(
    url := 'https://khcelroaozkzpyxayvpj.supabase.co/functions/v1/daily-interest-monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY2Vscm9hb3prenB5eGF5dnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTEzODQsImV4cCI6MjA2NzEyNzM4NH0.vL2P2P6xuWR-n-dZGg7kcg8l5y1nOn2N_XznyqYL97c"}'::jsonb,
    body := '{"monitor": true}'::jsonb
  ) as request_id;
  $$
);