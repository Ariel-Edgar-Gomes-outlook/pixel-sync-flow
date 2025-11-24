-- Remove existing policies for improvement_suggestions
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.improvement_suggestions;

-- Create new policy for admins to view all suggestions
CREATE POLICY "Admins can view all suggestions"
  ON public.improvement_suggestions
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Create policy for admins to update any suggestion
CREATE POLICY "Admins can update any suggestion"
  ON public.improvement_suggestions
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Create policy for admins to delete any suggestion
CREATE POLICY "Admins can delete any suggestion"
  ON public.improvement_suggestions
  FOR DELETE
  USING (is_admin(auth.uid()));