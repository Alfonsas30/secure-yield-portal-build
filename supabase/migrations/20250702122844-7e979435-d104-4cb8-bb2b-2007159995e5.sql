-- Remove all discount request triggers and functions
DROP TRIGGER IF EXISTS trigger_discount_request_notification ON public.discount_requests;
DROP FUNCTION IF EXISTS public.notify_discount_request();