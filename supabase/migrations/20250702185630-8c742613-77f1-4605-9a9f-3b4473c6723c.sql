-- Create atomic balance update function to prevent race conditions
CREATE OR REPLACE FUNCTION public.atomic_balance_update(
  p_user_id uuid,
  p_amount numeric,
  p_transaction_type text,
  p_description text DEFAULT NULL,
  p_recipient_account text DEFAULT NULL,
  p_recipient_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance numeric;
  new_balance numeric;
  account_num text;
  transaction_id uuid;
  result json;
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

-- Add balance constraint to prevent negative balances
ALTER TABLE public.account_balances 
ADD CONSTRAINT check_positive_balance CHECK (balance >= 0);

-- Create input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_html_input(input_text text)
RETURNS text
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