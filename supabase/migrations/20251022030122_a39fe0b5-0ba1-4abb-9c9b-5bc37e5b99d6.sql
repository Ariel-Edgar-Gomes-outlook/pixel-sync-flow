-- Create invoices table for professional invoicing system
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- Automatic numbering
  invoice_number text UNIQUE NOT NULL,
  is_proforma boolean DEFAULT false,
  
  -- Relations
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Dates
  issue_date date DEFAULT CURRENT_DATE NOT NULL,
  due_date date,
  paid_date date,
  
  -- Items (same structure as quotes)
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Financial values
  subtotal numeric NOT NULL,
  tax_rate numeric DEFAULT 14,
  tax_amount numeric,
  discount_amount numeric DEFAULT 0,
  total numeric NOT NULL,
  currency text DEFAULT 'AOA',
  
  -- Status
  status text DEFAULT 'issued' CHECK (status IN ('issued', 'paid', 'overdue', 'cancelled', 'partial')),
  amount_paid numeric DEFAULT 0,
  
  -- PDFs and documents
  pdf_url text,
  
  -- Notes and instructions
  notes text,
  payment_instructions text,
  
  -- Metadata
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view invoices"
  ON public.invoices FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
  ON public.invoices FOR UPDATE
  USING (true);

CREATE POLICY "Owners and admins can delete invoices"
  ON public.invoices FOR DELETE
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit logging
CREATE TRIGGER log_invoice_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit();