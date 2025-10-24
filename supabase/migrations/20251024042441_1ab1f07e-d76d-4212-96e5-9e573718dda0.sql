-- ============================================
-- CORREÇÃO DE POLÍTICAS RLS CONFLITANTES (v2)
-- ============================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES PARA RECRIAR CORRETAMENTE
DROP POLICY IF EXISTS "Public can view galleries by token" ON public.client_galleries;
DROP POLICY IF EXISTS "Unauthenticated can view galleries by token" ON public.client_galleries;

DROP POLICY IF EXISTS "Public can view gallery photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Unauthenticated can view gallery photos" ON public.gallery_photos;

DROP POLICY IF EXISTS "Public can update photo selection" ON public.gallery_photos;
DROP POLICY IF EXISTS "Unauthenticated can update photo selection" ON public.gallery_photos;

-- 2. CRIAR POLÍTICA PÚBLICA ESPECÍFICA PARA VISITANTES NÃO AUTENTICADOS em client_galleries
CREATE POLICY "Unauthenticated can view galleries by token"
ON public.client_galleries FOR SELECT
TO anon
USING (true);

-- 3. CRIAR POLÍTICAS ESPECÍFICAS PARA VISITANTES NÃO AUTENTICADOS em gallery_photos
CREATE POLICY "Unauthenticated can view gallery photos"
ON public.gallery_photos FOR SELECT
TO anon
USING (true);

CREATE POLICY "Unauthenticated can update photo selection"
ON public.gallery_photos FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);