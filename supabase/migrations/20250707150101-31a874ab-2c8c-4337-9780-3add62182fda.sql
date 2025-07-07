-- Grant admin role to the current user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('5247619b-1901-4b9f-abfe-5b7d7c4ba468', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;