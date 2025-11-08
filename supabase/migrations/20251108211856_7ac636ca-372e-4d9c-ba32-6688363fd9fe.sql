-- FASE 1: Criar configurações padrão e triggers
-- 1.1 Criar trigger para notification_settings quando usuário é criado
CREATE OR REPLACE FUNCTION public.create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (
    user_id,
    job_reminders,
    lead_follow_up,
    payment_overdue,
    maintenance_reminder,
    new_lead,
    job_completed
  )
  VALUES (
    NEW.id,
    true,
    true,
    true,
    true,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER create_notification_settings_on_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_settings();

-- 1.2 Criar configurações para usuários existentes que não têm
INSERT INTO public.notification_settings (
  user_id,
  job_reminders,
  lead_follow_up,
  payment_overdue,
  maintenance_reminder,
  new_lead,
  job_completed
)
SELECT 
  u.id,
  true,
  true,
  true,
  true,
  false,
  false
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.notification_settings ns WHERE ns.user_id = u.id
);

-- 1.3 Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read 
  ON public.notifications(recipient_id, read);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created 
  ON public.notifications(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
  ON public.notifications(type);

-- FASE 2: Padronizar tipos de notificação
-- 2.1 Criar ENUM para notification_type
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'job_reminder',
    'job_completed',
    'lead_follow_up',
    'lead_new',
    'payment_reminder',
    'payment_overdue',
    'maintenance_reminder',
    'contract_signed',
    'contract_pending',
    'quote_sent',
    'invoice_overdue',
    'delivery_ready'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- FASE 6: Adicionar sistema de priorização
-- 6.1 Criar ENUM para priority
DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 6.2 Adicionar coluna priority à tabela notifications
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS priority notification_priority DEFAULT 'medium';

-- Criar índice para priority
CREATE INDEX IF NOT EXISTS idx_notifications_priority 
  ON public.notifications(priority, created_at DESC);