-- ============================================
-- CORREÇÃO DE POLÍTICAS RLS CONFLITANTES
-- ============================================

-- 1. REMOVER POLÍTICAS PÚBLICAS CONFLITANTES EM client_galleries
DROP POLICY IF EXISTS "Public can view galleries by token" ON public.client_galleries;

-- 2. CRIAR POLÍTICA PÚBLICA ESPECÍFICA PARA VISITANTES NÃO AUTENTICADOS
CREATE POLICY "Unauthenticated can view galleries by token"
ON public.client_galleries FOR SELECT
TO anon
USING (true);

-- 3. REMOVER POLÍTICAS PÚBLICAS CONFLITANTES EM gallery_photos
DROP POLICY IF EXISTS "Public can view gallery photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Public can update photo selection" ON public.gallery_photos;

-- 4. CRIAR POLÍTICAS ESPECÍFICAS PARA VISITANTES NÃO AUTENTICADOS
CREATE POLICY "Unauthenticated can view gallery photos"
ON public.gallery_photos FOR SELECT
TO anon
USING (true);

CREATE POLICY "Unauthenticated can update photo selection"
ON public.gallery_photos FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);