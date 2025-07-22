-- Manually calculate missing daily interest for 2025-07-20 and 2025-07-21
-- First check if we need to calculate for 2025-07-20
DO $$
DECLARE
    missing_date DATE;
    calc_result JSON;
BEGIN
    -- Check for 2025-07-20
    missing_date := '2025-07-20'::DATE;
    IF NOT EXISTS (SELECT 1 FROM public.daily_interest_calculations WHERE calculation_date = missing_date) THEN
        -- Insert manual calculation for 2025-07-20
        INSERT INTO public.daily_interest_calculations (
            calculation_date,
            accounts_processed,
            total_interest_paid,
            initiated_by,
            initiated_type
        ) VALUES (
            missing_date,
            (SELECT COUNT(*) FROM public.account_balances WHERE balance > 0),
            (SELECT ROUND(SUM(balance * 0.02 / 365), 2) FROM public.account_balances WHERE balance > 0),
            NULL,
            'manual_backfill'
        );
        
        -- Add interest transactions for each account for 2025-07-20
        INSERT INTO public.transactions (
            user_id,
            account_number,
            amount,
            transaction_type,
            description,
            status,
            currency,
            created_at
        )
        SELECT 
            ab.user_id,
            ab.account_number,
            ROUND(ab.balance * 0.02 / 365, 4),
            'daily_interest',
            'Dienos palūkanos 2% metinė norma (2025-07-20)',
            'completed',
            'LT',
            '2025-07-20 00:01:00'::TIMESTAMP
        FROM public.account_balances ab
        WHERE ab.balance > 0;
        
        RAISE NOTICE 'Added daily interest calculation for 2025-07-20';
    END IF;
    
    -- Check for 2025-07-21
    missing_date := '2025-07-21'::DATE;
    IF NOT EXISTS (SELECT 1 FROM public.daily_interest_calculations WHERE calculation_date = missing_date) THEN
        -- Insert manual calculation for 2025-07-21
        INSERT INTO public.daily_interest_calculations (
            calculation_date,
            accounts_processed,
            total_interest_paid,
            initiated_by,
            initiated_type
        ) VALUES (
            missing_date,
            (SELECT COUNT(*) FROM public.account_balances WHERE balance > 0),
            (SELECT ROUND(SUM(balance * 0.02 / 365), 2) FROM public.account_balances WHERE balance > 0),
            NULL,
            'manual_backfill'
        );
        
        -- Add interest transactions for each account for 2025-07-21
        INSERT INTO public.transactions (
            user_id,
            account_number,
            amount,
            transaction_type,
            description,
            status,
            currency,
            created_at
        )
        SELECT 
            ab.user_id,
            ab.account_number,
            ROUND(ab.balance * 0.02 / 365, 4),
            'daily_interest',
            'Dienos palūkanos 2% metinė norma (2025-07-21)',
            'completed',
            'LT',
            '2025-07-21 00:01:00'::TIMESTAMP
        FROM public.account_balances ab
        WHERE ab.balance > 0;
        
        RAISE NOTICE 'Added daily interest calculation for 2025-07-21';
    END IF;
END $$;