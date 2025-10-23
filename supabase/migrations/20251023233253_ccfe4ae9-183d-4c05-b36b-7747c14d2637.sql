-- Add receipt tracking columns to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS receipt_generated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS receipt_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS receipt_downloads integer DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_receipt_generated ON public.payments(receipt_generated_at);

-- Update existing payments with receipt_link to set receipt_generated_at
UPDATE public.payments
SET receipt_generated_at = created_at
WHERE receipt_link IS NOT NULL AND receipt_generated_at IS NULL;