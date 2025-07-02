-- Create discount_requests table for storing discount requests
CREATE TABLE public.discount_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('personal', 'company')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discount_codes table for storing generated discount codes
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create account_registrations table for tracking registrations
CREATE TABLE public.account_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('personal', 'company')),
  stripe_session_id TEXT UNIQUE,
  discount_code TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.discount_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for discount_requests
CREATE POLICY "Allow insert for discount requests" ON public.discount_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for discount requests" ON public.discount_requests
  FOR SELECT USING (true);

CREATE POLICY "Allow update for discount requests" ON public.discount_requests
  FOR UPDATE USING (true);

-- Create policies for discount_codes
CREATE POLICY "Allow insert for discount codes" ON public.discount_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for discount codes" ON public.discount_codes
  FOR SELECT USING (true);

CREATE POLICY "Allow update for discount codes" ON public.discount_codes
  FOR UPDATE USING (true);

-- Create policies for account_registrations
CREATE POLICY "Allow insert for account registrations" ON public.account_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for account registrations" ON public.account_registrations
  FOR SELECT USING (true);

CREATE POLICY "Allow update for account registrations" ON public.account_registrations
  FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_discount_requests_updated_at
  BEFORE UPDATE ON public.discount_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_registrations_updated_at
  BEFORE UPDATE ON public.account_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();