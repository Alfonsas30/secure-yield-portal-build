-- Create loan applications table
CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  monthly_income NUMERIC,
  employment_info TEXT,
  loan_purpose TEXT,
  loan_amount NUMERIC NOT NULL,
  loan_term_months INTEGER NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_payment NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL DEFAULT 14.0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for loan applications
CREATE POLICY "Anyone can submit loan applications" 
ON public.loan_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view loan applications" 
ON public.loan_applications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update loan applications" 
ON public.loan_applications 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_loan_applications_updated_at
BEFORE UPDATE ON public.loan_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();