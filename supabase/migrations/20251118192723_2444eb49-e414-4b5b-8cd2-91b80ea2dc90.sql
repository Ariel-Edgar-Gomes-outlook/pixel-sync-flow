-- Add public RLS policies for contract signing via signature_token

-- Allow public viewing of contracts via valid signature_token
CREATE POLICY "Public can view contracts by signature token"
ON public.contracts
FOR SELECT
TO anon
USING (
  signature_token IS NOT NULL AND
  status IN ('draft', 'sent') AND
  LENGTH(signature_token) = 64
);

-- Allow public signing of contracts via valid signature_token
CREATE POLICY "Public can sign contracts by signature token"
ON public.contracts
FOR UPDATE
TO anon
USING (
  signature_token IS NOT NULL AND
  status IN ('draft', 'sent')
)
WITH CHECK (
  status = 'signed' AND
  signature_url IS NOT NULL AND
  signed_at IS NOT NULL
);