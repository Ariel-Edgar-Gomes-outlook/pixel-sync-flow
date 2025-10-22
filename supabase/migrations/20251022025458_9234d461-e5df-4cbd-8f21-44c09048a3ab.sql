-- Create business_settings table
CREATE TABLE public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  
  -- Dados Básicos
  business_name text NOT NULL,
  trade_name text,
  nif text,
  
  -- Contacto
  email text NOT NULL,
  phone text,
  whatsapp text,
  website text,
  
  -- Endereço
  address_line1 text,
  address_line2 text,
  city text DEFAULT 'Luanda',
  province text DEFAULT 'Luanda',
  country text DEFAULT 'Angola',
  postal_code text,
  
  -- Dados Bancários
  bank_name text,
  iban text,
  account_holder text,
  
  -- Branding
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  secondary_color text DEFAULT '#1E40AF',
  
  -- Assinatura Digital
  signature_url text,
  legal_representative_name text,
  legal_representative_title text,
  
  -- Configurações de Faturação
  invoice_prefix text DEFAULT 'FT',
  next_invoice_number integer DEFAULT 1,
  proforma_prefix text DEFAULT 'PF',
  next_proforma_number integer DEFAULT 1,
  
  -- Textos Legais
  terms_footer text DEFAULT 'Este documento é regido pelas leis de Angola.',
  payment_terms text DEFAULT 'Pagamento em 30 dias após emissão.',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own business settings"
  ON public.business_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business settings"
  ON public.business_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business settings"
  ON public.business_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners and admins can delete business settings"
  ON public.business_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('business-logos', 'business-logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('business-signatures', 'business-signatures', false, 1048576, ARRAY['image/png']);

-- RLS Policies for business-logos bucket
CREATE POLICY "Users can upload their own business logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'business-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own business logos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'business-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own business logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'business-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own business logos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'business-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for business-signatures bucket
CREATE POLICY "Users can upload their own business signatures"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'business-signatures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own business signatures"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'business-signatures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own business signatures"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'business-signatures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own business signatures"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'business-signatures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );