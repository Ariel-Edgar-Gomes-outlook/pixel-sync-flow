GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated, service_role;
GRANT SELECT ON public.audit_logs TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_settings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_integrations TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_templates TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklists TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_galleries TO authenticated, service_role;
GRANT SELECT ON public.client_galleries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated, service_role;
GRANT SELECT ON public.clients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_templates TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated, service_role;
GRANT SELECT, UPDATE ON public.contracts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverables TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated, service_role;
GRANT SELECT, UPDATE ON public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.improvement_suggestions TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_resources TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_team_members TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated, service_role;
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_settings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_plans TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_reminders TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_templates TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated, service_role;
GRANT SELECT, UPDATE ON public.quotes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated, service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE TO authenticated
USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Public can upload client signatures" ON storage.objects;
CREATE POLICY "Public can upload client signatures"
ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'client-signatures'
  AND (storage.foldername(name))[1] = 'signatures'
);

DROP POLICY IF EXISTS "Public can update client signatures" ON storage.objects;
CREATE POLICY "Public can update client signatures"
ON storage.objects
FOR UPDATE TO anon, authenticated
USING (
  bucket_id = 'client-signatures'
  AND (storage.foldername(name))[1] = 'signatures'
)
WITH CHECK (
  bucket_id = 'client-signatures'
  AND (storage.foldername(name))[1] = 'signatures'
);