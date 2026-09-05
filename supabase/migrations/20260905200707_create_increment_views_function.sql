CREATE OR REPLACE FUNCTION public.increment_views(p_article_id text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  UPDATE public.articles SET views = views + 1 WHERE id = p_article_id;
$function$;

GRANT EXECUTE ON FUNCTION public.increment_views(p_article_id text) TO anon, authenticated;
