-- Add signature_type field to contracts table to distinguish between digital and manual signatures
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS signature_type text DEFAULT 'digital' CHECK (signature_type IN ('digital', 'manual'));

COMMENT ON COLUMN public.contracts.signature_type IS 'Type of signature: digital (via platform) or manual (physical/scanned)';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_contracts_signature_type ON public.contracts(signature_type);

-- Update existing signed contracts to have signature_type based on whether they have signature_url
UPDATE public.contracts 
SET signature_type = CASE 
  WHEN signature_url IS NOT NULL THEN 'digital'
  ELSE 'manual'
END
WHERE status = 'signed' AND signature_type IS NULL;