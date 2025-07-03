-- Add stripe_session_id and payment_status to loan_applications table
ALTER TABLE public.loan_applications 
ADD COLUMN stripe_session_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_amount INTEGER DEFAULT 1000; -- 10 EUR in cents

-- Create index for faster stripe session lookups
CREATE INDEX idx_loan_applications_stripe_session ON public.loan_applications(stripe_session_id);