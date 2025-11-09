-- Garantir que o bucket business-signatures existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-signatures', 'business-signatures', true)
ON CONFLICT (id) 
DO UPDATE SET public = true;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Public signature access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own signatures" ON storage.objects;

-- Políticas RLS para business-signatures
-- Permitir visualização pública
CREATE POLICY "Public signature access"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-signatures');

-- Permitir upload apenas ao próprio utilizador
CREATE POLICY "Users can upload own signatures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-signatures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir atualização apenas ao próprio utilizador
CREATE POLICY "Users can update own signatures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-signatures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir delete apenas ao próprio utilizador
CREATE POLICY "Users can delete own signatures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-signatures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);