-- FASE 1: FUNCIONALIDADES CRÍTICAS

-- 1.1 - SISTEMA DE GALERIA DE CLIENTE
CREATE TABLE IF NOT EXISTS public.client_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  expiration_date TIMESTAMP WITH TIME ZONE,
  download_limit INTEGER,
  allow_selection BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'closed')),
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.client_galleries(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  display_order INTEGER DEFAULT 0,
  client_selected BOOLEAN DEFAULT false,
  client_downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.2 - CONTRATOS PROFISSIONAIS COMPLETOS
ALTER TABLE public.contracts 
  ADD COLUMN IF NOT EXISTS usage_rights_text TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_policy_text TEXT,
  ADD COLUMN IF NOT EXISTS late_delivery_clause TEXT,
  ADD COLUMN IF NOT EXISTS copyright_notice TEXT,
  ADD COLUMN IF NOT EXISTS reschedule_policy TEXT,
  ADD COLUMN IF NOT EXISTS revision_policy TEXT,
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS signature_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');

-- 1.3 - PLANOS DE PAGAMENTO FRACIONADOS
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  installments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT payment_plan_reference CHECK (
    (job_id IS NOT NULL AND quote_id IS NULL) OR 
    (job_id IS NULL AND quote_id IS NOT NULL)
  )
);

-- Adicionar campos em payments
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE SET NULL;

-- 1.4 - Melhorar tracking de conversão de orçamento para job
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS converted_to_job_at TIMESTAMP WITH TIME ZONE;

-- RLS POLICIES

-- client_galleries
ALTER TABLE public.client_galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view galleries"
  ON public.client_galleries FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert galleries"
  ON public.client_galleries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update galleries"
  ON public.client_galleries FOR UPDATE
  USING (true);

CREATE POLICY "Owners and admins can delete galleries"
  ON public.client_galleries FOR DELETE
  USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- gallery_photos
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view gallery photos"
  ON public.gallery_photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert gallery photos"
  ON public.gallery_photos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery photos"
  ON public.gallery_photos FOR UPDATE
  USING (true);

CREATE POLICY "Owners and admins can delete gallery photos"
  ON public.gallery_photos FOR DELETE
  USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- payment_plans
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payment plans"
  ON public.payment_plans FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert payment plans"
  ON public.payment_plans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payment plans"
  ON public.payment_plans FOR UPDATE
  USING (true);

CREATE POLICY "Owners and admins can delete payment plans"
  ON public.payment_plans FOR DELETE
  USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_client_galleries_updated_at
  BEFORE UPDATE ON public.client_galleries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_client_galleries_job_id ON public.client_galleries(job_id);
CREATE INDEX IF NOT EXISTS idx_client_galleries_share_token ON public.client_galleries(share_token);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_gallery_id ON public.gallery_photos(gallery_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_job_id ON public.payment_plans(job_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_quote_id ON public.payment_plans(quote_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_plan_id ON public.payments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_contracts_signature_token ON public.contracts(signature_token);