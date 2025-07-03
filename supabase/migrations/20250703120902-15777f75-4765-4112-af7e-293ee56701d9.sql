-- Add Binance API credentials to profiles table
ALTER TABLE public.profiles 
ADD COLUMN binance_api_key TEXT,
ADD COLUMN binance_api_secret TEXT,
ADD COLUMN binance_connected_at TIMESTAMP WITH TIME ZONE;