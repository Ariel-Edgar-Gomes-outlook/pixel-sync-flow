-- Drop the restrictive DELETE policy
DROP POLICY IF EXISTS "Owners and admins can delete contracts" ON public.contracts;

-- Create new DELETE policy allowing users to delete contracts for their own clients
CREATE POLICY "Users can delete contracts for own clients"
ON public.contracts
FOR DELETE
USING (
  client_id IN (
    SELECT id 
    FROM public.clients 
    WHERE created_by = auth.uid()
  )
);