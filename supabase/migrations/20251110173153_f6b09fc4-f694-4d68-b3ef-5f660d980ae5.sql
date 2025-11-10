-- Allow users to delete their own invoices
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;

CREATE POLICY "Users can delete own invoices" 
ON public.invoices 
FOR DELETE 
USING (user_id = auth.uid());