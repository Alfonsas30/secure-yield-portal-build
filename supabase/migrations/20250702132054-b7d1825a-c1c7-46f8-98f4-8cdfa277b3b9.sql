-- Update account number generation function to use LT + 12 digits format
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;