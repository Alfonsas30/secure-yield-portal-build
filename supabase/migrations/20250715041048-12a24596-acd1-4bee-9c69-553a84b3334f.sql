-- Add missing columns to account_registrations table
ALTER TABLE public.account_registrations 
ADD COLUMN IF NOT EXISTS original_price INTEGER,
ADD COLUMN IF NOT EXISTS final_price INTEGER,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';