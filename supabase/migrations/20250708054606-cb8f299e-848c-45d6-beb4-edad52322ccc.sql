-- Create a complete transfer function that handles both sender and recipient
CREATE OR REPLACE FUNCTION public.process_internal_transfer(
  p_from_user_id uuid,
  p_to_account_number text,
  p_amount numeric,
  p_description text DEFAULT NULL,
  p_recipient_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  from_balance NUMERIC;
  to_user_id UUID;
  to_balance NUMERIC;
  from_account_number TEXT;
  to_account_full TEXT;
  transfer_id UUID;
  from_transaction_id UUID;
  to_transaction_id UUID;
  result JSON;
BEGIN
  -- Generate transfer ID
  transfer_id := gen_random_uuid();
  
  -- Get sender's balance and account info with lock
  SELECT balance, account_number INTO from_balance, from_account_number
  FROM public.account_balances 
  WHERE user_id = p_from_user_id
  FOR UPDATE;
  
  -- Check if sender account exists
  IF from_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Sender account not found');
  END IF;
  
  -- Check sufficient funds
  IF from_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;
  
  -- Find recipient account and user
  SELECT user_id, account_number INTO to_user_id, to_account_full
  FROM public.profiles 
  WHERE account_number = p_to_account_number;
  
  -- Check if recipient exists
  IF to_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Recipient account not found');
  END IF;
  
  -- Prevent self-transfers
  IF p_from_user_id = to_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot transfer to your own account');
  END IF;
  
  -- Get recipient's balance with lock
  SELECT balance INTO to_balance
  FROM public.account_balances 
  WHERE user_id = to_user_id
  FOR UPDATE;
  
  -- Update sender's balance
  UPDATE public.account_balances 
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = p_from_user_id;
  
  -- Update recipient's balance
  UPDATE public.account_balances 
  SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = to_user_id;
  
  -- Create outgoing transaction for sender
  INSERT INTO public.transactions (
    user_id, account_number, amount, transaction_type, 
    description, recipient_account, recipient_name, 
    status, currency
  ) VALUES (
    p_from_user_id, from_account_number, -p_amount, 'transfer_out',
    p_description, p_to_account_number, p_recipient_name,
    'completed', 'LT'
  ) RETURNING id INTO from_transaction_id;
  
  -- Create incoming transaction for recipient  
  INSERT INTO public.transactions (
    user_id, account_number, amount, transaction_type,
    description, recipient_account, recipient_name,
    status, currency
  ) VALUES (
    to_user_id, to_account_full, p_amount, 'transfer_in',
    COALESCE(p_description, 'Gauti pinigai iš ' || from_account_number), 
    from_account_number, 
    (SELECT display_name FROM public.profiles WHERE user_id = p_from_user_id),
    'completed', 'LT'
  ) RETURNING id INTO to_transaction_id;
  
  -- Create transfer request record
  INSERT INTO public.transfer_requests (
    from_user_id, from_account, to_account, to_name,
    amount, description, status, currency
  ) VALUES (
    p_from_user_id, from_account_number, p_to_account_number, p_recipient_name,
    p_amount, p_description, 'completed', 'LT'
  );
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'transfer_id', transfer_id,
    'from_transaction_id', from_transaction_id,
    'to_transaction_id', to_transaction_id,
    'from_new_balance', from_balance - p_amount,
    'to_new_balance', to_balance + p_amount
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create function to validate account number format
CREATE OR REPLACE FUNCTION public.validate_account_number(account_number text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check if account number matches LT + 12 digits format
  RETURN account_number ~ '^LT[0-9]{12}$';
END;
$$;