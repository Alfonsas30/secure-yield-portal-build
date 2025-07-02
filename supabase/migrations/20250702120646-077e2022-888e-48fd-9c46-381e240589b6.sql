-- Create a function to send email notifications for discount requests
CREATE OR REPLACE FUNCTION notify_discount_request()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/20379157/2szryzz/';
    account_type_text TEXT;
    discount_text TEXT;
BEGIN
    -- Set account type text in Lithuanian
    IF NEW.account_type = 'personal' THEN
        account_type_text := 'Asmeninė sąskaita';
        discount_text := '800 € → 400 € (50% nuolaida)';
    ELSE
        account_type_text := 'Įmonės sąskaita';
        discount_text := '1500 € → 750 € (50% nuolaida)';
    END IF;

    -- Send webhook notification (works with Zapier, Make.com, etc.)
    PERFORM
        net.http_post(
            url := webhook_url,
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := json_build_object(
                'name', NEW.name,
                'email', NEW.email,
                'account_type', account_type_text,
                'discount_info', discount_text,
                'created_at', NEW.created_at,
                'id', NEW.id
            )::jsonb
        );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically notify when new discount request is inserted
CREATE OR REPLACE TRIGGER trigger_discount_request_notification
    AFTER INSERT ON public.discount_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_discount_request();

-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;