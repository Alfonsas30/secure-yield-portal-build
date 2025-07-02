-- Create account_balances table for storing account balances
CREATE TABLE public.account_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_number TEXT NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for all banking operations
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_number TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'transfer_out', 'transfer_in', 'deposit', 'withdrawal'
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  recipient_account TEXT,
  recipient_name TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transfer_requests table for managing transfer requests
CREATE TABLE public.transfer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  to_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for account_balances
CREATE POLICY "Users can view their own balance" 
ON public.account_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance" 
ON public.account_balances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance" 
ON public.account_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for transfer_requests
CREATE POLICY "Users can view their own transfer requests" 
ON public.transfer_requests 
FOR SELECT 
USING (auth.uid() = from_user_id);

CREATE POLICY "Users can create their own transfer requests" 
ON public.transfer_requests 
FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own transfer requests" 
ON public.transfer_requests 
FOR UPDATE 
USING (auth.uid() = from_user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_account_balances_updated_at
BEFORE UPDATE ON public.account_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transfer_requests_updated_at
BEFORE UPDATE ON public.transfer_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize user balance
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.account_balances (user_id, account_number, balance)
    VALUES (NEW.user_id, NEW.account_number, 1000.00); -- Starting balance of 1000 EUR
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize balance when profile is created
CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.initialize_user_balance();

-- Create indexes for better performance
CREATE INDEX idx_account_balances_user_id ON public.account_balances(user_id);
CREATE INDEX idx_account_balances_account_number ON public.account_balances(account_number);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_account_number ON public.transactions(account_number);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transfer_requests_from_user_id ON public.transfer_requests(from_user_id);
CREATE INDEX idx_transfer_requests_status ON public.transfer_requests(status);