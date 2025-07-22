
-- Check what daily interest calculations exist
SELECT calculation_date, accounts_processed, total_interest_paid, initiated_type, created_at 
FROM public.daily_interest_calculations 
ORDER BY calculation_date DESC;

-- Check current account balances to see what should be calculated
SELECT user_id, account_number, balance, updated_at 
FROM public.account_balances 
WHERE balance > 0 
ORDER BY balance DESC;
