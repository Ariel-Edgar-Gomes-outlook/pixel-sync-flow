-- Adicionar campos de controle de assinatura à tabela profiles (somente se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'subscription_start_date') THEN
        ALTER TABLE public.profiles
        ADD COLUMN subscription_start_date timestamp with time zone DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'subscription_end_date') THEN
        ALTER TABLE public.profiles
        ADD COLUMN subscription_end_date timestamp with time zone DEFAULT (now() + interval '3 days');
    END IF;
END $$;

-- Atualizar perfis existentes que ainda não têm datas de assinatura
UPDATE public.profiles
SET 
  subscription_start_date = COALESCE(subscription_start_date, created_at),
  subscription_end_date = COALESCE(subscription_end_date, created_at + interval '3 days')
WHERE subscription_start_date IS NULL OR subscription_end_date IS NULL;

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

-- Criar função para verificar se o usuário tem acesso completo (assinatura ativa)
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