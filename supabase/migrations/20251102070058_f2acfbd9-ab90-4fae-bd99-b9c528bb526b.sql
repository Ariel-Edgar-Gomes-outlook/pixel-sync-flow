-- Remover função antiga e recriar com search_path correto
DROP FUNCTION IF EXISTS public.user_has_active_subscription(uuid);

-- Recriar função com search_path imutável
CREATE OR REPLACE FUNCTION public.user_has_active_subscription(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT CASE
    WHEN subscription_end_date IS NULL THEN true
    WHEN now() <= subscription_end_date THEN true
    ELSE false
  END
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;
$function$;