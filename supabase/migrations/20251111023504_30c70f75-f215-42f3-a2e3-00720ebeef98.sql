-- Drop existing delete policy for checklists
DROP POLICY IF EXISTS "Owners and admins can delete checklists" ON public.checklists;

-- Create new delete policy that allows users to delete their own checklists
CREATE POLICY "Users can delete own checklists"
ON public.checklists
FOR DELETE
USING (
  job_id IN (
    SELECT id FROM public.jobs
    WHERE created_by = auth.uid()
  )
);