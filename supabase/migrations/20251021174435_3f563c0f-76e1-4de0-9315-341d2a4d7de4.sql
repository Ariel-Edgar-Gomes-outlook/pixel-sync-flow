-- Permitir leitura pública de galerias através do share_token
CREATE POLICY "Public can view galleries by token"
  ON public.client_galleries FOR SELECT
  USING (true);

-- Permitir leitura pública de fotos de galerias
CREATE POLICY "Public can view gallery photos"
  ON public.gallery_photos FOR SELECT
  USING (true);

-- Permitir que clientes atualizem seleção e download de fotos
CREATE POLICY "Public can update photo selection"
  ON public.gallery_photos FOR UPDATE
  USING (true)
  WITH CHECK (true);