-- Criar políticas RLS para admins gerenciarem todos os perfis
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (is_admin(auth.uid()));

-- Criar índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date ON public.profiles(subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_start_date ON public.profiles(subscription_start_date);