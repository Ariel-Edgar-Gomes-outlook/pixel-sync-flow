
-- Adicionar coluna updated_at na tabela notifications
ALTER TABLE public.notifications 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Atualizar registros existentes
UPDATE public.notifications 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Criar trigger para atualizar automaticamente updated_at
CREATE OR REPLACE FUNCTION public.handle_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger na tabela notifications
DROP TRIGGER IF EXISTS set_notifications_updated_at ON public.notifications;
CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notifications_updated_at();
