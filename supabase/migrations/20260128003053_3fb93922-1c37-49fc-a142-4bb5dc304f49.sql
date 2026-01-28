-- Enable realtime for profiles table to allow live name updates in header
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;