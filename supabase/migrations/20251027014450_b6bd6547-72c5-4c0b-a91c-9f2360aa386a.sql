-- Drop the existing restrictive delete policy for payments
DROP POLICY IF EXISTS "Owners and admins can delete payments" ON public.payments;

-- Create a new policy that allows users to delete their own payments
CREATE POLICY "Users can delete own payments"
ON public.payments
FOR DELETE
USING (created_by = auth.uid());