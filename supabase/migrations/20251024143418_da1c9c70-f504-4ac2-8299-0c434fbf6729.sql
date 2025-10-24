-- ============================================
-- FASE 1: CORREÇÃO DE POLÍTICAS RLS - NOTIFICAÇÕES
-- ============================================

-- Remover política permissiva atual
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- Criar política restritiva: utilizadores só podem criar notificações para si próprios
CREATE POLICY "Users can insert notifications for themselves"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = recipient_id);

-- Criar função SECURITY DEFINER para notificações do sistema (automações)
CREATE OR REPLACE FUNCTION public.create_system_notification(
  _recipient_id uuid,
  _type text,
  _payload jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_id uuid;
BEGIN
  -- Validar que o recipient existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _recipient_id) THEN
    RAISE EXCEPTION 'Invalid recipient_id';
  END IF;
  
  INSERT INTO public.notifications (recipient_id, type, payload, delivered, read)
  VALUES (_recipient_id, _type, _payload, false, false)
  RETURNING id INTO _notification_id;
  
  RETURN _notification_id;
END;
$$;