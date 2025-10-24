-- Remove campos obsoletos de PDF/receipts que agora são gerados dinamicamente
-- Os PDFs agora são gerados localmente sob demanda, não há necessidade de armazenar URLs

-- Remove pdf_url da tabela contracts
ALTER TABLE public.contracts DROP COLUMN IF EXISTS pdf_url;

-- Remove pdf_url da tabela quotes  
ALTER TABLE public.quotes DROP COLUMN IF EXISTS pdf_url;

-- Remove pdf_url da tabela invoices
ALTER TABLE public.invoices DROP COLUMN IF EXISTS pdf_url;

-- Remove receipt_url e receipt_link da tabela payments
ALTER TABLE public.payments DROP COLUMN IF EXISTS receipt_url;
ALTER TABLE public.payments DROP COLUMN IF EXISTS receipt_link;

-- Remove colunas relacionadas a geração de recibos que não são mais necessárias
ALTER TABLE public.payments DROP COLUMN IF EXISTS receipt_generated_at;
ALTER TABLE public.payments DROP COLUMN IF EXISTS receipt_downloads;