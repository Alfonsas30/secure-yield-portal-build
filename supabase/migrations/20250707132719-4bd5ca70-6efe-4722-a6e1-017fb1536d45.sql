-- Enable pg_cron extension for automatic daily interest calculation
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily interest calculation at 00:01 every day
SELECT cron.schedule(
  'daily-interest-calculation-v2',
  '1 0 * * *', -- Run at 00:01 every day
  $$
  SELECT net.http_post(
    url := 'https://khcelroaozkzpyxayvpj.supabase.co/functions/v1/calculate-daily-interest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY2Vscm9hb3prenB5eGF5dnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTEzODQsImV4cCI6MjA2NzEyNzM4NH0.vL2P2P6xuWR-n-dZGg7kcg8l5y1nOn2N_XznyqYL97c"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);