-- Fix RLS policy for deleting job team members
-- The current policy only allows owners/admins to delete, but users should be able to delete members from their own jobs

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Owners and admins can delete job team members" ON public.job_team_members;

-- Create a new policy that allows users to delete members from their own jobs
CREATE POLICY "Users can delete job team members from own jobs"
ON public.job_team_members
FOR DELETE
USING (
  job_id IN (
    SELECT id FROM public.jobs 
    WHERE created_by = auth.uid()
  )
);