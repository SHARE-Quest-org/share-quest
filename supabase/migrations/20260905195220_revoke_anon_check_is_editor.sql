REVOKE EXECUTE ON FUNCTION public.check_is_editor() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_is_editor() TO authenticated;
