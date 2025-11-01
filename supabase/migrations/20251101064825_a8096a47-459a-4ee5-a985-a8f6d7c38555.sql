-- Adicionar campos de controle de assinatura à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN subscription_start_date timestamp with time zone DEFAULT now(),
ADD COLUMN subscription_end_date timestamp with time zone DEFAULT (now() + interval '3 days');

-- Atualizar perfis existentes para terem as datas de assinatura
UPDATE public.profiles
SET 
  subscription_start_date = created_at,
  subscription_end_date = created_at + interval '3 days'
WHERE subscription_start_date IS NULL;

-- Atualizar função de criação de usuário para incluir datas de assinatura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (
        user_id, 
        name, 
        email,
        subscription_start_date,
        subscription_end_date
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        now(),
        now() + interval '3 days'
    );
    RETURN NEW;
END;
$function$;

-- Criar função para verificar se o usuário tem acesso completo
CREATE OR REPLACE FUNCTION public.user_has_active_subscription(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN subscription_end_date IS NULL THEN true
    WHEN now() <= subscription_end_date THEN true
    ELSE false
  END
  FROM public.profiles
  WHERE profiles.user_id = $1
  LIMIT 1;
$function$;