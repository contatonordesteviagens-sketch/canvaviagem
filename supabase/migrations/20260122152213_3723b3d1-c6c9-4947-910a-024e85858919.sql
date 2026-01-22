-- Force RLS on profiles table to prevent bypass
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Force RLS on subscriptions table to prevent bypass
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;