-- Fix the discount request notification trigger
-- Replace the incorrect net.http_post with correct http_post function

CREATE OR REPLACE FUNCTION notify_discount_request()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/20379157/2szryzz/';
    account_type_text TEXT;
    discount_text TEXT;
    response http_response;
BEGIN
    -- Set account type text in Lithuanian
    IF NEW.account_type = 'personal' THEN
        account_type_text := 'Asmeninė sąskaita';
        discount_text := '800 € → 400 € (50% nuolaida)';
    ELSE
        account_type_text := 'Įmonės sąskaita';
        discount_text := '1500 € → 750 € (50% nuolaida)';
    END IF;

    -- Send webhook notification using correct http_post function
    SELECT * INTO response FROM http_post(
        webhook_url,
        json_build_object(
            'name', NEW.name,
            'email', NEW.email,
            'account_type', account_type_text,
            'discount_info', discount_text,
            'created_at', NEW.created_at,
            'id', NEW.id
        )::text,
        'application/json'
    );

    -- Log the response for debugging
    RAISE NOTICE 'Webhook response status: %', response.status;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;