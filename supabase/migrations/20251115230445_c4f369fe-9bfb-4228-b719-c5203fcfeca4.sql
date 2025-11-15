-- Corrigir política RLS para permitir que usuários eliminem seus próprios trabalhos
DROP POLICY IF EXISTS "Owners and admins can delete jobs" ON public.jobs;

CREATE POLICY "Users can delete own jobs"
ON public.jobs
FOR DELETE
USING (created_by = auth.uid());