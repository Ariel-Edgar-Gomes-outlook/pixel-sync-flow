-- Drop the restrictive DELETE policy for quotes
DROP POLICY IF EXISTS "Owners and admins can delete quotes" ON public.quotes;

-- Create new DELETE policy allowing users to delete their own quotes
CREATE POLICY "Users can delete own quotes"
ON public.quotes
FOR DELETE
USING (created_by = auth.uid());