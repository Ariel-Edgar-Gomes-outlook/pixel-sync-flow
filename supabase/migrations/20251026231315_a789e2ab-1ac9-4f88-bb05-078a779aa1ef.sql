-- Adicionar coluna para rastrear se o usuário já viu o onboarding
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS has_seen_onboarding boolean DEFAULT false;

-- Atualizar usuários existentes que já tenham a flag no localStorage (assumir que já viram)
-- Isso evita que apareça o tutorial novamente para usuários antigos
UPDATE public.user_preferences 
SET has_seen_onboarding = true 
WHERE created_at < NOW() - INTERVAL '1 day';