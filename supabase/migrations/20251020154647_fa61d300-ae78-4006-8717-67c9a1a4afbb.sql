-- Create time_entries table for job time tracking
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  description TEXT,
  hours DECIMAL NOT NULL,
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
CREATE POLICY "Authenticated users can view time entries"
ON public.time_entries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert time entries"
ON public.time_entries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update time entries"
ON public.time_entries FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Owners and admins can delete time entries"
ON public.time_entries FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create quote_templates table
CREATE TABLE public.quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  notes TEXT,
  currency TEXT DEFAULT 'AOA',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quote_templates
CREATE POLICY "Authenticated users can view quote templates"
ON public.quote_templates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert quote templates"
ON public.quote_templates FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update quote templates"
ON public.quote_templates FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Owners and admins can delete quote templates"
ON public.quote_templates FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create checklist_templates table
CREATE TABLE public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_time INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checklist_templates
CREATE POLICY "Authenticated users can view checklist templates"
ON public.checklist_templates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert checklist templates"
ON public.checklist_templates FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update checklist templates"
ON public.checklist_templates FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Owners and admins can delete checklist templates"
ON public.checklist_templates FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create contract_templates table
CREATE TABLE public.contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  terms_text TEXT NOT NULL,
  clauses JSONB DEFAULT '{}'::jsonb,
  cancellation_fee NUMERIC,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract_templates
CREATE POLICY "Authenticated users can view contract templates"
ON public.contract_templates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert contract templates"
ON public.contract_templates FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update contract templates"
ON public.contract_templates FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Owners and admins can delete contract templates"
ON public.contract_templates FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create deliverables table
CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  sent_to_client_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deliverables
CREATE POLICY "Authenticated users can view deliverables"
ON public.deliverables FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert deliverables"
ON public.deliverables FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update deliverables"
ON public.deliverables FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Owners and admins can delete deliverables"
ON public.deliverables FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create payment_reminders table
CREATE TABLE public.payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  notification_sent BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_reminders
CREATE POLICY "Authenticated users can view payment reminders"
ON public.payment_reminders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert payment reminders"
ON public.payment_reminders FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger for updating updated_at
CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quote_templates_updated_at
BEFORE UPDATE ON public.quote_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_templates_updated_at
BEFORE UPDATE ON public.checklist_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at
BEFORE UPDATE ON public.contract_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('deliverables', 'deliverables', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);

-- Storage policies for receipts bucket
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can update receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'receipts');

CREATE POLICY "Owners and admins can delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'receipts' AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- Storage policies for contracts bucket
CREATE POLICY "Authenticated users can view contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can update contracts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'contracts');

CREATE POLICY "Owners and admins can delete contracts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contracts' AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- Storage policies for deliverables bucket
CREATE POLICY "Authenticated users can view deliverables"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'deliverables');

CREATE POLICY "Authenticated users can upload deliverables"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deliverables');

CREATE POLICY "Authenticated users can update deliverables"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'deliverables');

CREATE POLICY "Owners and admins can delete deliverables"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'deliverables' AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- Storage policies for pdfs bucket
CREATE POLICY "Authenticated users can view pdfs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pdfs');

CREATE POLICY "Authenticated users can upload pdfs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdfs');

CREATE POLICY "Authenticated users can update pdfs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pdfs');

CREATE POLICY "Owners and admins can delete pdfs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pdfs' AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));