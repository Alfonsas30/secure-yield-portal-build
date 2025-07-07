-- Fix the problematic large balance that's causing security issues
-- First, let's check for abnormally large balances
DO $$ 
DECLARE
    large_balance_record RECORD;
BEGIN
    -- Check for balances over 1 million (likely error)
    FOR large_balance_record IN 
        SELECT user_id, account_number, balance 
        FROM public.account_balances 
        WHERE balance > 1000000
    LOOP
        RAISE NOTICE 'Found large balance: % for account % (user %)', 
            large_balance_record.balance, 
            large_balance_record.account_number, 
            large_balance_record.user_id;
            
        -- Reset suspicious large balances to 0 for security
        UPDATE public.account_balances 
        SET balance = 0.00, 
            updated_at = now()
        WHERE user_id = large_balance_record.user_id;
        
        -- Add audit transaction
        INSERT INTO public.transactions (
            user_id, 
            account_number, 
            amount, 
            transaction_type, 
            description,
            status,
            currency
        ) VALUES (
            large_balance_record.user_id,
            large_balance_record.account_number,
            -large_balance_record.balance,
            'security_adjustment',
            'Suspicious large balance reset for security - Admin review required',
            'completed',
            'LT'
        );
        
        RAISE NOTICE 'Reset balance for account % to 0.00', large_balance_record.account_number;
    END LOOP;
END $$;