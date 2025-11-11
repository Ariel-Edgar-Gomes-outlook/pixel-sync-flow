-- Make contracts bucket public so signatures can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'contracts';

-- Create policy for public read access to contracts bucket
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Anyone can view contracts bucket'
    ) THEN
        CREATE POLICY "Anyone can view contracts bucket"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'contracts');
    END IF;
END $$;