-- Corrigir política RLS para permitir que usuários eliminem seus próprios clientes
DROP POLICY IF EXISTS "Owners and admins can delete clients" ON public.clients;

CREATE POLICY "Users can delete own clients"
ON public.clients
FOR DELETE
USING (created_by = auth.uid());