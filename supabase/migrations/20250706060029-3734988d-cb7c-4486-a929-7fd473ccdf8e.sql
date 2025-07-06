-- Enable pg_net extension for cron job HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing cron job if it exists
SELECT cron.unschedule('daily-interest-calculation');

-- Create improved cron job that directly calls the database function
-- This is more reliable than HTTP requests
SELECT cron.schedule(
  'daily-interest-calculation-direct',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT public.calculate_daily_interest();
  $$
);