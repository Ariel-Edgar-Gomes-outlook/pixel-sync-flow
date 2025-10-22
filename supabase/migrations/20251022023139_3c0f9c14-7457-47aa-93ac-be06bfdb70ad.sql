-- ============================================
-- MIGRAÇÃO: Sistema de Links para Galerias e Entregáveis
-- ============================================

-- 1. Adicionar campos de links para client_galleries
ALTER TABLE public.client_galleries
ADD COLUMN IF NOT EXISTS gallery_links jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS access_instructions text;

COMMENT ON COLUMN public.client_galleries.gallery_links IS 'Array de links externos para galerias hospedadas em Google Drive, Dropbox, etc.';
COMMENT ON COLUMN public.client_galleries.access_instructions IS 'Instruções gerais de acesso para o cliente';

-- 2. Modificar deliverables para sistema de links
ALTER TABLE public.deliverables
ADD COLUMN IF NOT EXISTS external_platform text,
ADD COLUMN IF NOT EXISTS access_instructions text,
ADD COLUMN IF NOT EXISTS version text DEFAULT 'v1',
ALTER COLUMN file_url DROP NOT NULL;

COMMENT ON COLUMN public.deliverables.external_platform IS 'Plataforma onde o arquivo está hospedado: gdrive, dropbox, wetransfer, etc.';
COMMENT ON COLUMN public.deliverables.access_instructions IS 'Instruções específicas de acesso ao arquivo';
COMMENT ON COLUMN public.deliverables.version IS 'Versão do arquivo: v1, v2, final, etc.';

-- 3. Atualizar gallery_photos para ser opcional (pode conter apenas referências)
ALTER TABLE public.gallery_photos
ALTER COLUMN file_url DROP NOT NULL,
ADD COLUMN IF NOT EXISTS item_id text,
ADD COLUMN IF NOT EXISTS external_url text;

COMMENT ON COLUMN public.gallery_photos.item_id IS 'ID/código da foto para referência (sem necessidade de upload)';
COMMENT ON COLUMN public.gallery_photos.external_url IS 'Link direto para a foto individual (opcional)';

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_client_galleries_gallery_links ON public.client_galleries USING gin(gallery_links);
CREATE INDEX IF NOT EXISTS idx_deliverables_external_platform ON public.deliverables(external_platform);
CREATE INDEX IF NOT EXISTS idx_deliverables_version ON public.deliverables(version);