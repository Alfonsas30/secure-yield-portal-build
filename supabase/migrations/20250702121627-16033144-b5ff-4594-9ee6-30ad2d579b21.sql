-- Clean up and fix the discount request notification trigger
-- Step 1: Remove existing trigger and function to start fresh
DROP TRIGGER IF EXISTS trigger_discount_request_notification ON public.discount_requests;
DROP FUNCTION IF EXISTS public.notify_discount_request();

-- Step 2: Ensure HTTP extension is enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Step 3: Create the corrected function with proper http_post usage
CREATE OR REPLACE FUNCTION public.notify_discount_request()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/20379157/2szryzz/';
    account_type_text TEXT;
    discount_text TEXT;
    response http_response;
    payload TEXT;
BEGIN
    -- Set account type text in Lithuanian
    IF NEW.account_type = 'personal' THEN
        account_type_text := 'Asmeninė sąskaita';
        discount_text := '800 € → 400 € (50% nuolaida)';
    ELSE
        account_type_text := 'Įmonės sąskaita';
        discount_text := '1500 € → 750 € (50% nuolaida)';
    END IF;

    -- Build JSON payload
    payload := json_build_object(
        'name', NEW.name,
        'email', NEW.email,
        'account_type', account_type_text,
        'discount_info', discount_text,
        'created_at', NEW.created_at,
        'id', NEW.id
    )::text;

    -- Send webhook notification using correct http_post function
    BEGIN
        SELECT * INTO response FROM http_post(
            webhook_url,
            payload,
            'application/json'
        );
        
        -- Log the response for debugging
        RAISE NOTICE 'Webhook response status: %, content: %', response.status, response.content;
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the insert
        RAISE NOTICE 'Webhook failed: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger
CREATE TRIGGER trigger_discount_request_notification
    AFTER INSERT ON public.discount_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_discount_request();