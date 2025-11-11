-- Create public bucket for client signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-signatures', 'client-signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for client-signatures bucket
CREATE POLICY "Anyone can view client signatures"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-signatures');

CREATE POLICY "Authenticated users can upload client signatures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'client-signatures' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own client signatures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'client-signatures' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own client signatures"
ON storage.objects FOR DELETE
USING (bucket_id = 'client-signatures' AND auth.role() = 'authenticated');