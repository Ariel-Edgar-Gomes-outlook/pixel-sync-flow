
-- Storage RLS policies: each user manages files under their own <user_id>/... folder in every bucket
DO $$
DECLARE b text;
BEGIN
  FOR b IN SELECT unnest(ARRAY['business-logos','business-signatures','client-signatures','receipts','contracts','deliverables','pdfs']) LOOP
    EXECUTE format($p$DROP POLICY IF EXISTS "own_read_%1$s" ON storage.objects$p$, b);
    EXECUTE format($p$DROP POLICY IF EXISTS "own_insert_%1$s" ON storage.objects$p$, b);
    EXECUTE format($p$DROP POLICY IF EXISTS "own_update_%1$s" ON storage.objects$p$, b);
    EXECUTE format($p$DROP POLICY IF EXISTS "own_delete_%1$s" ON storage.objects$p$, b);

    EXECUTE format($p$CREATE POLICY "own_read_%1$s" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1])$p$, b, b);
    EXECUTE format($p$CREATE POLICY "own_insert_%1$s" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1])$p$, b, b);
    EXECUTE format($p$CREATE POLICY "own_update_%1$s" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1])$p$, b, b);
    EXECUTE format($p$CREATE POLICY "own_delete_%1$s" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1])$p$, b, b);
  END LOOP;

  -- Allow anonymous public reads on branding buckets (logos/signatures) since workspace blocks public buckets
  FOR b IN SELECT unnest(ARRAY['business-logos','business-signatures','client-signatures']) LOOP
    EXECUTE format($p$DROP POLICY IF EXISTS "public_read_%1$s" ON storage.objects$p$, b);
    EXECUTE format($p$CREATE POLICY "public_read_%1$s" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = %2$L)$p$, b, b);
  END LOOP;
END $$;
