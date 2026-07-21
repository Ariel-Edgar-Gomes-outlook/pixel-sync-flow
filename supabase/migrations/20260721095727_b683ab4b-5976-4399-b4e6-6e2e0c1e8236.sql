
-- 1) Prevent first-admin privilege escalation
DROP POLICY IF EXISTS "Allow first admin creation" ON public.admin_users;

-- 2) client_galleries: remove broad public SELECT; add safe RPC
DROP POLICY IF EXISTS "Public can view galleries with valid share token" ON public.client_galleries;

CREATE OR REPLACE FUNCTION public.get_public_gallery(_token text)
RETURNS TABLE (
  id uuid,
  name text,
  password_protected boolean,
  status text,
  gallery_links jsonb,
  access_instructions text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.name, g.password_protected, g.status, g.gallery_links, g.access_instructions
  FROM public.client_galleries g
  WHERE g.share_token = _token
    AND g.status = 'active'
    AND (g.expiration_date IS NULL OR g.expiration_date > now())
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_gallery(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_gallery(text) TO anon, authenticated;

-- 3) payment_plans: allow access via job ownership as well
DROP POLICY IF EXISTS "Users can view own payment plans" ON public.payment_plans;
DROP POLICY IF EXISTS "Users can update own payment plans" ON public.payment_plans;
DROP POLICY IF EXISTS "Users can insert payment plans for own quotes" ON public.payment_plans;

CREATE POLICY "Users can view own payment plans"
ON public.payment_plans FOR SELECT TO authenticated
USING (
  quote_id IN (SELECT id FROM public.quotes WHERE created_by = auth.uid())
  OR job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())
);

CREATE POLICY "Users can update own payment plans"
ON public.payment_plans FOR UPDATE TO authenticated
USING (
  quote_id IN (SELECT id FROM public.quotes WHERE created_by = auth.uid())
  OR job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())
)
WITH CHECK (
  quote_id IN (SELECT id FROM public.quotes WHERE created_by = auth.uid())
  OR job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())
);

CREATE POLICY "Users can insert payment plans for own quotes or jobs"
ON public.payment_plans FOR INSERT TO authenticated
WITH CHECK (
  quote_id IN (SELECT id FROM public.quotes WHERE created_by = auth.uid())
  OR job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())
);

-- 4) Protect OAuth tokens: only service_role can read the token columns
REVOKE SELECT (access_token, refresh_token) ON public.calendar_integrations FROM anon, authenticated, PUBLIC;

-- 5) Restrict EXECUTE on SECURITY DEFINER helpers from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_resource_availability() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_default_notification_settings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_notifications_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_notification_email_trigger() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_payment_to_invoice_and_quote() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_system_notification(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;

-- Keep is_admin, has_role, user_has_active_subscription callable by authenticated (used in RLS)
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_has_active_subscription(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_active_subscription(uuid) TO authenticated;
