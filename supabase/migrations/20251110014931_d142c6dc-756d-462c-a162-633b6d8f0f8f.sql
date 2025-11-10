-- Policy: Allow inserting first admin when table is empty
CREATE POLICY "Allow first admin creation"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.admin_users)
);

-- Policy: Existing admins can add new admins
CREATE POLICY "Admins can add new admins"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
);