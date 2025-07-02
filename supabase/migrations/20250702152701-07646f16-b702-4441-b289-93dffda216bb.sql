-- Create term_deposits table for storing term deposit contracts
CREATE TABLE public.term_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  term_months INTEGER NOT NULL,
  interest_rate NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  contract_signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.term_deposits ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own term deposits" 
ON public.term_deposits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own term deposits" 
ON public.term_deposits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own term deposits" 
ON public.term_deposits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_term_deposits_updated_at
BEFORE UPDATE ON public.term_deposits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();