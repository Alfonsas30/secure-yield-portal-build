-- Complete database setup for new Supabase project

-- Create profiles table with auto account number generation
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  account_number TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  mfa_enabled BOOLEAN NOT NULL DEFAULT true,
  mfa_verified BOOLEAN NOT NULL DEFAULT false,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  totp_secret TEXT,
  binance_api_key TEXT,
  binance_api_secret TEXT,
  binance_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create account_balances table
CREATE TABLE public.account_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_number TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'LT',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  recipient_account TEXT,
  recipient_name TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  currency TEXT NOT NULL DEFAULT 'LT',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messenger_2fa table
CREATE TABLE public.messenger_2fa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  messenger_type TEXT NOT NULL,
  messenger_id TEXT NOT NULL,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verification_code TEXT,
  code_expires_at TIMESTAMP WITH TIME ZONE,
  code_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verification_codes table
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create backup_codes table
CREATE TABLE public.backup_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create term_deposits table
CREATE TABLE public.term_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  term_months INTEGER NOT NULL,
  maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  contract_signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transfer_requests table
CREATE TABLE public.transfer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  to_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'LT',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create other business tables
CREATE TABLE public.account_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  account_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  discount_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  loan_amount NUMERIC NOT NULL,
  loan_term_months INTEGER NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_payment NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL DEFAULT 14.0,
  loan_purpose TEXT,
  employment_info TEXT,
  monthly_income NUMERIC,
  payment_amount INTEGER DEFAULT 1000,
  payment_status TEXT DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  email TEXT NOT NULL,
  discount_percent INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.discount_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  account_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.board_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  experience TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribe_token TEXT NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.newsletter_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create utility functions
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    account_num TEXT;
    numbers TEXT;
    is_unique BOOLEAN := FALSE;
BEGIN
    WHILE NOT is_unique LOOP
        -- Generate 12 random digits
        numbers := '';
        FOR i IN 1..12 LOOP
            numbers := numbers || floor(random() * 10)::text;
        END LOOP;
        
        -- Combine: LT + 12 digits
        account_num := 'LT' || numbers;
        
        -- Check if unique
        SELECT NOT EXISTS(SELECT 1 FROM public.profiles WHERE account_number = account_num) INTO is_unique;
    END LOOP;
    
    RETURN account_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_backup_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  code := '';
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$;

-- Create atomic balance update function
CREATE OR REPLACE FUNCTION public.atomic_balance_update(
  p_user_id UUID,
  p_amount NUMERIC,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_recipient_account TEXT DEFAULT NULL,
  p_recipient_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  account_num TEXT;
  transaction_id UUID;
  result JSON;
BEGIN
  -- Get current balance and account number with row lock
  SELECT balance, account_number INTO current_balance, account_num
  FROM public.account_balances 
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if account exists
  IF current_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Account not found');
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + p_amount;
  
  -- Check for sufficient funds (only for negative amounts)
  IF p_amount < 0 AND new_balance < 0 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;
  
  -- Update balance atomically
  UPDATE public.account_balances 
  SET balance = new_balance, updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.transactions (
    user_id, 
    account_number, 
    amount, 
    transaction_type, 
    description,
    recipient_account,
    recipient_name,
    status,
    currency
  ) VALUES (
    p_user_id,
    account_num,
    p_amount,
    p_transaction_type,
    p_description,
    p_recipient_account,
    p_recipient_name,
    'completed',
    'LT'
  ) RETURNING id INTO transaction_id;
  
  -- Return success with new balance
  RETURN json_build_object(
    'success', true, 
    'new_balance', new_balance,
    'transaction_id', transaction_id
  );
END;
$$;

-- Create daily interest calculation function
CREATE OR REPLACE FUNCTION public.calculate_daily_interest()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_record RECORD;
  daily_rate NUMERIC := 0.02 / 365; -- 2% annual rate divided by 365 days
  interest_amount NUMERIC;
  total_processed INTEGER := 0;
  total_interest NUMERIC := 0;
  result JSON;
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

-- Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, account_number, email, display_name)
    VALUES (
        NEW.id, 
        public.generate_account_number(),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

-- Create balance initialization function
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.account_balances (user_id, account_number, balance, currency)
    VALUES (NEW.user_id, NEW.account_number, 0.00, 'LT');
    RETURN NEW;
END;
$$;

-- Create HTML sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_html_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potentially dangerous HTML tags and scripts
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi'),
        '<[^>]*>', '', 'g'
      ),
      '&[a-zA-Z0-9#]+;', '', 'g'
    ),
    '[<>"\''&]', '', 'g'
  );
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER initialize_balance_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_balance();

-- Enable RLS on all user-specific tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messenger_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on business tables (public access)
ALTER TABLE public.account_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific tables
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own balance" ON public.account_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own balance" ON public.account_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own balance" ON public.account_balances FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own messenger 2FA settings" ON public.messenger_2fa FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messenger 2FA settings" ON public.messenger_2fa FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own messenger 2FA settings" ON public.messenger_2fa FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messenger 2FA settings" ON public.messenger_2fa FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view verification codes for their email" ON public.verification_codes FOR SELECT USING (true);
CREATE POLICY "Users can insert verification codes for their email" ON public.verification_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update verification codes for their email" ON public.verification_codes FOR UPDATE USING (true);

CREATE POLICY "Users can view their own backup codes" ON public.backup_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own backup codes" ON public.backup_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own backup codes" ON public.backup_codes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own term deposits" ON public.term_deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own term deposits" ON public.term_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own term deposits" ON public.term_deposits FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transfer requests" ON public.transfer_requests FOR SELECT USING (auth.uid() = from_user_id);
CREATE POLICY "Users can create their own transfer requests" ON public.transfer_requests FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update their own transfer requests" ON public.transfer_requests FOR UPDATE USING (auth.uid() = from_user_id);

-- Create RLS policies for business tables (public access)
CREATE POLICY "Allow select for account registrations" ON public.account_registrations FOR SELECT USING (true);
CREATE POLICY "Allow insert for account registrations" ON public.account_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for account registrations" ON public.account_registrations FOR UPDATE USING (true);

CREATE POLICY "Anyone can view loan applications" ON public.loan_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can submit loan applications" ON public.loan_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update loan applications" ON public.loan_applications FOR UPDATE USING (true);

CREATE POLICY "Allow select for discount codes" ON public.discount_codes FOR SELECT USING (true);
CREATE POLICY "Allow insert for discount codes" ON public.discount_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for discount codes" ON public.discount_codes FOR UPDATE USING (true);

CREATE POLICY "Allow select for discount requests" ON public.discount_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert for discount requests" ON public.discount_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for discount requests" ON public.discount_requests FOR UPDATE USING (true);

CREATE POLICY "Anyone can view board applications" ON public.board_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can submit board applications" ON public.board_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update board applications" ON public.board_applications FOR UPDATE USING (true);

CREATE POLICY "Subscribers can view their own subscription" ON public.newsletter_subscribers FOR SELECT USING (true);
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can unsubscribe" ON public.newsletter_subscribers FOR UPDATE USING (true);

CREATE POLICY "Anyone can view campaigns" ON public.newsletter_campaigns FOR SELECT USING (true);
CREATE POLICY "Anyone can create campaigns" ON public.newsletter_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update campaigns" ON public.newsletter_campaigns FOR UPDATE USING (true);