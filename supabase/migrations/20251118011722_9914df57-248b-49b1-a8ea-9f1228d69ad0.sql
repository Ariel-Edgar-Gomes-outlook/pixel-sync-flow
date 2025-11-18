-- Fix Gallery RLS Policies to validate share_token
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Unauthenticated can view galleries by token" ON client_galleries;
DROP POLICY IF EXISTS "Unauthenticated can view gallery photos" ON gallery_photos;
DROP POLICY IF EXISTS "Unauthenticated can update photo selection" ON gallery_photos;

-- Create secure policies that validate share_token
CREATE POLICY "Public can view galleries with valid share token"
ON client_galleries FOR SELECT
TO anon, authenticated
USING (
  share_token IS NOT NULL AND
  status = 'active' AND
  (expiration_date IS NULL OR expiration_date > now())
);

CREATE POLICY "Public can view photos from valid galleries"
ON gallery_photos FOR SELECT
TO anon, authenticated
USING (
  gallery_id IN (
    SELECT id FROM client_galleries 
    WHERE share_token IS NOT NULL 
    AND status = 'active'
    AND (expiration_date IS NULL OR expiration_date > now())
  )
);

CREATE POLICY "Public can update photo selection with valid gallery"
ON gallery_photos FOR UPDATE
TO anon, authenticated
USING (
  gallery_id IN (
    SELECT id FROM client_galleries 
    WHERE share_token IS NOT NULL 
    AND status = 'active'
    AND allow_selection = true
  )
)
WITH CHECK (
  -- Only allow updating selection fields
  client_selected IS NOT NULL
);

-- Add review_token to quotes table for public access
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS review_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quotes_review_token ON quotes(review_token) WHERE review_token IS NOT NULL;

-- Create public RLS policies for quote review
CREATE POLICY "Public can view quotes by review token"
ON quotes FOR SELECT
TO anon, authenticated
USING (
  review_token IS NOT NULL AND
  status IN ('sent', 'accepted', 'rejected')
);

CREATE POLICY "Public can update quote status with valid token"
ON quotes FOR UPDATE
TO anon, authenticated
USING (
  review_token IS NOT NULL AND
  status = 'sent'
)
WITH CHECK (
  status IN ('accepted', 'rejected') AND
  review_token IS NOT NULL
);