-- ============ TYPES ============
CREATE TYPE public.app_role AS ENUM ('owner','admin','photographer','editor','assistant');
CREATE TYPE public.contract_status AS ENUM ('draft','sent','signed','cancelled');
CREATE TYPE public.job_status AS ENUM ('scheduled','confirmed','in_production','delivery_pending','completed','cancelled');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','proposal_sent','won','lost');
CREATE TYPE public.notification_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.notification_type AS ENUM ('job_reminder','job_completed','lead_follow_up','lead_new','payment_reminder','payment_overdue','maintenance_reminder','contract_signed','contract_pending','quote_sent','invoice_overdue','delivery_ready');
CREATE TYPE public.payment_status AS ENUM ('pending','partial','paid','refunded');
CREATE TYPE public.quote_status AS ENUM ('draft','sent','accepted','rejected');

-- ============ TABLES ============
CREATE TABLE public.admin_users (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, email text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
CREATE TABLE public.audit_logs (id uuid DEFAULT gen_random_uuid() NOT NULL, entity_type text NOT NULL, entity_id uuid NOT NULL, action text NOT NULL, user_id uuid, previous_data jsonb, new_data jsonb, created_at timestamptz DEFAULT now() NOT NULL);
CREATE TABLE public.business_settings (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, business_name text NOT NULL, trade_name text, nif text, email text NOT NULL, phone text, whatsapp text, website text, address_line1 text, address_line2 text, city text DEFAULT 'Luanda', province text DEFAULT 'Luanda', country text DEFAULT 'Angola', postal_code text, bank_name text, iban text, account_holder text, logo_url text, primary_color text DEFAULT '#3B82F6', secondary_color text DEFAULT '#1E40AF', signature_url text, legal_representative_name text, legal_representative_title text, invoice_prefix text DEFAULT 'FT', next_invoice_number integer DEFAULT 1, proforma_prefix text DEFAULT 'PF', next_proforma_number integer DEFAULT 1, terms_footer text DEFAULT 'Este documento é regido pelas leis de Angola.', payment_terms text DEFAULT 'Pagamento em 30 dias após emissão.', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE public.calendar_integrations (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, provider text DEFAULT 'google' NOT NULL, access_token text, refresh_token text, token_expires_at timestamptz, calendar_id text, is_active boolean DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE public.checklist_templates (id uuid DEFAULT gen_random_uuid() NOT NULL, name text NOT NULL, job_type text NOT NULL, items jsonb DEFAULT '[]'::jsonb NOT NULL, estimated_time integer, created_by uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE public.checklists (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid NOT NULL, type text NOT NULL, items jsonb DEFAULT '[]'::jsonb NOT NULL, estimated_time integer, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL);
CREATE TABLE public.client_galleries (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid NOT NULL, name text NOT NULL, password_protected boolean DEFAULT false, password_hash text, expiration_date timestamptz, download_limit integer, allow_selection boolean DEFAULT true, status text DEFAULT 'active', share_token text DEFAULT encode(extensions.gen_random_bytes(32),'hex'), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), gallery_links jsonb DEFAULT '[]'::jsonb, access_instructions text, sent_to_client_at timestamptz, CONSTRAINT client_galleries_status_check CHECK ((status = ANY (ARRAY['active','expired','closed']))));
CREATE TABLE public.clients (id uuid DEFAULT gen_random_uuid() NOT NULL, name text NOT NULL, email text, phone text, address text, type text DEFAULT 'person', notes text, preferences jsonb DEFAULT '{}'::jsonb, external_folder_link text, tags text[] DEFAULT ARRAY[]::text[], created_at timestamptz DEFAULT now() NOT NULL, created_by uuid NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL);
CREATE TABLE public.contract_templates (id uuid DEFAULT gen_random_uuid() NOT NULL, name text NOT NULL, terms_text text NOT NULL, clauses jsonb DEFAULT '{}'::jsonb, cancellation_fee numeric, created_by uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE public.contracts (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid, client_id uuid NOT NULL, terms_text text, attachments_links jsonb DEFAULT '[]'::jsonb, status public.contract_status DEFAULT 'draft' NOT NULL, issued_at timestamptz DEFAULT now(), signed_at timestamptz, cancellation_fee numeric(10,2), clauses jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, usage_rights_text text, cancellation_policy_text text, late_delivery_clause text, copyright_notice text, reschedule_policy text, revision_policy text, signature_url text, signature_token text DEFAULT encode(extensions.gen_random_bytes(32),'hex'), signature_type text DEFAULT 'digital', pdf_url text, CONSTRAINT contracts_signature_type_check CHECK ((signature_type = ANY (ARRAY['digital','manual']))));
CREATE TABLE public.deliverables (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid NOT NULL, type text NOT NULL, file_url text, file_name text NOT NULL, file_size integer, uploaded_at timestamptz DEFAULT now(), sent_to_client_at timestamptz, downloaded_at timestamptz, created_by uuid, external_platform text, access_instructions text, version text DEFAULT 'v1');
CREATE TABLE public.gallery_photos (id uuid DEFAULT gen_random_uuid() NOT NULL, gallery_id uuid NOT NULL, file_url text, thumbnail_url text, file_name text NOT NULL, file_size integer, display_order integer DEFAULT 0, client_selected boolean DEFAULT false, client_downloaded_at timestamptz, created_at timestamptz DEFAULT now(), item_id text, external_url text);
CREATE TABLE public.improvement_suggestions (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, system_area varchar(100) NOT NULL, title varchar(200) NOT NULL, description text NOT NULL, priority varchar(20) DEFAULT 'medium', status varchar(20) DEFAULT 'pending', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE public.invoices (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, invoice_number text NOT NULL, is_proforma boolean DEFAULT false, client_id uuid NOT NULL, quote_id uuid, job_id uuid, issue_date date DEFAULT CURRENT_DATE NOT NULL, due_date date, paid_date date, items jsonb DEFAULT '[]'::jsonb NOT NULL, subtotal numeric NOT NULL, tax_rate numeric DEFAULT 14, tax_amount numeric, discount_amount numeric DEFAULT 0, total numeric NOT NULL, currency text DEFAULT 'AOA', status text DEFAULT 'issued', amount_paid numeric DEFAULT 0, notes text, payment_instructions text, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, last_payment_date timestamptz, CONSTRAINT invoices_status_check CHECK ((status = ANY (ARRAY['issued','paid','overdue','cancelled','partial']))));
CREATE TABLE public.job_resources (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid NOT NULL, resource_id uuid NOT NULL, reserved_from timestamptz NOT NULL, reserved_until timestamptz NOT NULL, notes text, created_at timestamptz DEFAULT now() NOT NULL);
CREATE TABLE public.job_team_members (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid NOT NULL, user_id uuid, role text, assigned_at timestamptz DEFAULT now() NOT NULL, team_member_id uuid, CONSTRAINT job_team_members_member_check CHECK (((user_id IS NOT NULL) OR (team_member_id IS NOT NULL))));
CREATE TABLE public.jobs (id uuid DEFAULT gen_random_uuid() NOT NULL, title text NOT NULL, client_id uuid, type text NOT NULL, description text, start_datetime timestamptz NOT NULL, end_datetime timestamptz, location text, location_map_embed text, status public.job_status DEFAULT 'scheduled' NOT NULL, external_assets_links jsonb DEFAULT '[]'::jsonb, external_gallery_link text, tags text[] DEFAULT ARRAY[]::text[], estimated_hours numeric(10,2), time_spent numeric(10,2), estimated_cost numeric(10,2), estimated_revenue numeric(10,2), created_by uuid NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, google_calendar_event_id text, CONSTRAINT valid_map_embed CHECK (((location_map_embed IS NULL) OR (location_map_embed LIKE 'https://maps.google.com%') OR (location_map_embed LIKE 'https://www.google.com/maps%') OR (location_map_embed LIKE 'https://maps.googleapis.com%'))));
CREATE TABLE public.leads (id uuid DEFAULT gen_random_uuid() NOT NULL, client_id uuid, source text, status public.lead_status DEFAULT 'new' NOT NULL, probability integer DEFAULT 50, notes text, responsible_id uuid, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL);
CREATE TABLE public.notification_settings (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, job_reminders boolean DEFAULT true, lead_follow_up boolean DEFAULT true, payment_overdue boolean DEFAULT true, maintenance_reminder boolean DEFAULT true, new_lead boolean DEFAULT false, job_completed boolean DEFAULT false, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE public.notifications (id uuid DEFAULT gen_random_uuid() NOT NULL, type text NOT NULL, recipient_id uuid NOT NULL, payload jsonb DEFAULT '{}'::jsonb, sent_at timestamptz DEFAULT now() NOT NULL, delivered boolean DEFAULT false, read boolean DEFAULT false, created_at timestamptz DEFAULT now() NOT NULL, priority public.notification_priority DEFAULT 'medium', updated_at timestamptz DEFAULT now());
ALTER TABLE ONLY public.notifications REPLICA IDENTITY FULL;
CREATE TABLE public.payment_plans (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid, quote_id uuid, total_amount numeric NOT NULL, installments jsonb DEFAULT '[]'::jsonb NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), CONSTRAINT payment_plan_reference CHECK ((((job_id IS NOT NULL) AND (quote_id IS NULL)) OR ((job_id IS NULL) AND (quote_id IS NOT NULL)))));
CREATE TABLE public.payment_reminders (id uuid DEFAULT gen_random_uuid() NOT NULL, payment_id uuid NOT NULL, type text NOT NULL, sent_at timestamptz DEFAULT now(), email_sent boolean DEFAULT false, notification_sent boolean DEFAULT false);
CREATE TABLE public.payments (id uuid DEFAULT gen_random_uuid() NOT NULL, quote_id uuid, client_id uuid NOT NULL, type text NOT NULL, amount numeric(10,2) NOT NULL, currency text DEFAULT 'AOA', method text, status public.payment_status DEFAULT 'pending' NOT NULL, paid_at timestamptz, notes text, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, due_date date, payment_plan_id uuid, invoice_id uuid, receipt_sent_at timestamptz, created_by uuid NOT NULL);
CREATE TABLE public.profiles (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, name text NOT NULL, email text NOT NULL, phone text, avatar_url text, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, type text DEFAULT 'client', subscription_start_date timestamptz DEFAULT now(), subscription_end_date timestamptz DEFAULT (now() + '3 days'::interval), is_suspended boolean DEFAULT false, suspension_reason text, admin_notes text);
CREATE TABLE public.quote_templates (id uuid DEFAULT gen_random_uuid() NOT NULL, name text NOT NULL, job_type text NOT NULL, items jsonb DEFAULT '[]'::jsonb NOT NULL, tax numeric DEFAULT 0, discount numeric DEFAULT 0, notes text, currency text DEFAULT 'AOA', created_by uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE public.quotes (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid, client_id uuid NOT NULL, items jsonb DEFAULT '[]'::jsonb NOT NULL, tax numeric(10,2) DEFAULT 0, discount numeric(10,2) DEFAULT 0, total numeric(10,2) NOT NULL, currency text DEFAULT 'AOA', validity_date date, status public.quote_status DEFAULT 'draft' NOT NULL, accepted_at timestamptz, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, converted_to_job_at timestamptz, created_by uuid NOT NULL, review_token text DEFAULT encode(extensions.gen_random_bytes(32),'hex'));
CREATE TABLE public.resources (id uuid DEFAULT gen_random_uuid() NOT NULL, name text NOT NULL, type text NOT NULL, status text DEFAULT 'available', location text, manual_link text, next_maintenance_date date, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, created_by uuid NOT NULL);
CREATE TABLE public.team_members (id uuid DEFAULT gen_random_uuid() NOT NULL, name text NOT NULL, email text NOT NULL, phone text, type text NOT NULL, notes text, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, created_by uuid, archived boolean DEFAULT false);
CREATE TABLE public.time_entries (id uuid DEFAULT gen_random_uuid() NOT NULL, job_id uuid NOT NULL, user_id uuid NOT NULL, description text, hours numeric NOT NULL, entry_date date NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE public.user_preferences (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, currency varchar(3) DEFAULT 'AOA', timezone varchar(50) DEFAULT 'Africa/Luanda', language varchar(10) DEFAULT 'pt-PT', date_format varchar(20) DEFAULT 'DD/MM/YYYY', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), has_seen_onboarding boolean DEFAULT false, custom_currencies jsonb DEFAULT '[]'::jsonb);
CREATE TABLE public.user_roles (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, role public.app_role NOT NULL);

-- ============ GRANTS ============
GRANT ALL ON TABLE public.admin_users, public.audit_logs, public.business_settings, public.calendar_integrations, public.checklist_templates, public.checklists, public.client_galleries, public.clients, public.contract_templates, public.contracts, public.deliverables, public.gallery_photos, public.improvement_suggestions, public.invoices, public.job_resources, public.job_team_members, public.jobs, public.leads, public.notification_settings, public.notifications, public.payment_plans, public.payment_reminders, public.payments, public.profiles, public.quote_templates, public.quotes, public.resources, public.team_members, public.time_entries, public.user_preferences, public.user_roles TO anon, authenticated, service_role;

-- ============ FUNCTIONS (now that tables exist) ============
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE FUNCTION public.is_admin(check_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = check_user_id);
$$;

CREATE FUNCTION public.user_has_active_subscription(p_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE WHEN subscription_end_date IS NULL THEN true WHEN now() <= subscription_end_date THEN true ELSE false END
  FROM public.profiles WHERE user_id = p_user_id LIMIT 1;
$$;

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;$$;

CREATE FUNCTION public.handle_notifications_updated_at() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;$$;

CREATE FUNCTION public.check_resource_availability() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.job_resources WHERE resource_id = NEW.resource_id AND id != COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid) AND ((NEW.reserved_from, NEW.reserved_until) OVERLAPS (reserved_from, reserved_until))) THEN
    RAISE EXCEPTION 'Resource is already booked for the selected time period';
  END IF;
  RETURN NEW;
END;$$;

CREATE FUNCTION public.create_default_notification_settings() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id, job_reminders, lead_follow_up, payment_overdue, maintenance_reminder, new_lead, job_completed)
  VALUES (NEW.id, true, true, true, true, false, false);
  RETURN NEW;
END;$$;

CREATE FUNCTION public.create_system_notification(_recipient_id uuid, _type text, _payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _notification_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _recipient_id) THEN RAISE EXCEPTION 'Invalid recipient_id'; END IF;
  INSERT INTO public.notifications (recipient_id, type, payload, delivered, read) VALUES (_recipient_id, _type, _payload, false, false) RETURNING id INTO _notification_id;
  RETURN _notification_id;
END;$$;

CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, subscription_start_date, subscription_end_date)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email, now(), now() + interval '3 days');
  RETURN NEW;
END;$$;

CREATE FUNCTION public.log_audit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE user_id_val uuid;
BEGIN
  user_id_val := auth.uid();
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, previous_data) VALUES (user_id_val, TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, previous_data, new_data) VALUES (user_id_val, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, new_data) VALUES (user_id_val, TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;$$;

CREATE FUNCTION public.send_notification_email_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','extensions' AS $$
DECLARE
  v_profile RECORD;
  v_service_role_key text;
  v_supabase_url text;
  v_request_id bigint;
BEGIN
  SELECT email, name INTO v_profile FROM public.profiles WHERE user_id = NEW.recipient_id;
  IF v_profile.email IS NOT NULL THEN
    v_supabase_url := 'https://jspsuwpboewyffxrnzpj.supabase.co';
    v_service_role_key := current_setting('app.settings.service_role_key', true);
    IF v_service_role_key IS NULL OR v_service_role_key = '' THEN v_service_role_key := 'placeholder'; END IF;
    SELECT extensions.http_post(
      url := v_supabase_url || '/functions/v1/send-notification-email',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_service_role_key),
      body := jsonb_build_object('recipientEmail',v_profile.email,'recipientName',v_profile.name,'notificationType',NEW.type,'payload',NEW.payload)
    ) INTO v_request_id;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to queue email notification: %', SQLERRM;
  RETURN NEW;
END;$$;

CREATE FUNCTION public.sync_payment_to_invoice_and_quote() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_invoice_total numeric; v_total_paid numeric; v_invoice_id uuid; v_quote_id uuid;
BEGIN
  v_invoice_id := NEW.invoice_id; v_quote_id := NEW.quote_id;
  IF v_invoice_id IS NULL AND v_quote_id IS NOT NULL THEN
    SELECT id INTO v_invoice_id FROM public.invoices WHERE quote_id = v_quote_id LIMIT 1;
  END IF;
  IF v_invoice_id IS NOT NULL THEN
    SELECT COALESCE(SUM(amount),0) INTO v_total_paid FROM public.payments WHERE invoice_id = v_invoice_id AND status = 'paid';
    SELECT total INTO v_invoice_total FROM public.invoices WHERE id = v_invoice_id;
    IF v_total_paid >= v_invoice_total THEN
      UPDATE public.invoices SET amount_paid = v_total_paid, status = 'paid', paid_date = NOW(), updated_at = NOW() WHERE id = v_invoice_id;
    ELSIF v_total_paid > 0 THEN
      UPDATE public.invoices SET amount_paid = v_total_paid, status = 'partial', updated_at = NOW() WHERE id = v_invoice_id;
    ELSE
      UPDATE public.invoices SET amount_paid = 0, status = 'issued', paid_date = NULL, updated_at = NOW() WHERE id = v_invoice_id;
    END IF;
  END IF;
  IF v_quote_id IS NOT NULL THEN
    DECLARE v_quote_total numeric; v_quote_paid numeric;
    BEGIN
      SELECT COALESCE(SUM(amount),0) INTO v_quote_paid FROM public.payments WHERE quote_id = v_quote_id AND status = 'paid';
      SELECT total INTO v_quote_total FROM public.quotes WHERE id = v_quote_id;
      IF v_quote_paid >= v_quote_total THEN
        UPDATE public.quotes SET status = 'accepted', accepted_at = NOW(), updated_at = NOW() WHERE id = v_quote_id AND status != 'accepted';
      END IF;
    END;
  END IF;
  RETURN NEW;
END;$$;

-- ============ ENABLE RLS ============
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ PKs / UNIQUE ============
ALTER TABLE ONLY public.admin_users ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.admin_users ADD CONSTRAINT admin_users_email_key UNIQUE (email);
ALTER TABLE ONLY public.admin_users ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.business_settings ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.business_settings ADD CONSTRAINT business_settings_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.calendar_integrations ADD CONSTRAINT calendar_integrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.checklist_templates ADD CONSTRAINT checklist_templates_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.checklists ADD CONSTRAINT checklists_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.client_galleries ADD CONSTRAINT client_galleries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.client_galleries ADD CONSTRAINT client_galleries_share_token_key UNIQUE (share_token);
ALTER TABLE ONLY public.clients ADD CONSTRAINT clients_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.contract_templates ADD CONSTRAINT contract_templates_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.contracts ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.contracts ADD CONSTRAINT contracts_signature_token_key UNIQUE (signature_token);
ALTER TABLE ONLY public.deliverables ADD CONSTRAINT deliverables_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.gallery_photos ADD CONSTRAINT gallery_photos_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.improvement_suggestions ADD CONSTRAINT improvement_suggestions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.invoices ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.invoices ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);
ALTER TABLE ONLY public.job_resources ADD CONSTRAINT job_resources_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.job_resources ADD CONSTRAINT job_resources_job_id_resource_id_key UNIQUE (job_id, resource_id);
ALTER TABLE ONLY public.job_team_members ADD CONSTRAINT job_team_members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.job_team_members ADD CONSTRAINT job_team_members_job_id_user_id_key UNIQUE (job_id, user_id);
ALTER TABLE ONLY public.jobs ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.leads ADD CONSTRAINT leads_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notification_settings ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notification_settings ADD CONSTRAINT notification_settings_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payment_plans ADD CONSTRAINT payment_plans_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payment_reminders ADD CONSTRAINT payment_reminders_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.quote_templates ADD CONSTRAINT quote_templates_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.quotes ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.quotes ADD CONSTRAINT quotes_review_token_key UNIQUE (review_token);
ALTER TABLE ONLY public.resources ADD CONSTRAINT resources_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.team_members ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.time_entries ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_preferences ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

-- ============ FKs ============
ALTER TABLE ONLY public.admin_users ADD CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE ONLY public.calendar_integrations ADD CONSTRAINT calendar_integrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.checklist_templates ADD CONSTRAINT checklist_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.checklists ADD CONSTRAINT checklists_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.client_galleries ADD CONSTRAINT client_galleries_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.clients ADD CONSTRAINT clients_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.contract_templates ADD CONSTRAINT contract_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.contracts ADD CONSTRAINT contracts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.contracts ADD CONSTRAINT contracts_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.deliverables ADD CONSTRAINT deliverables_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.deliverables ADD CONSTRAINT deliverables_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.gallery_photos ADD CONSTRAINT gallery_photos_gallery_id_fkey FOREIGN KEY (gallery_id) REFERENCES public.client_galleries(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.improvement_suggestions ADD CONSTRAINT improvement_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.invoices ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.invoices ADD CONSTRAINT invoices_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.invoices ADD CONSTRAINT invoices_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.job_resources ADD CONSTRAINT job_resources_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.job_resources ADD CONSTRAINT job_resources_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.job_team_members ADD CONSTRAINT job_team_members_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.job_team_members ADD CONSTRAINT job_team_members_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.jobs ADD CONSTRAINT jobs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.jobs ADD CONSTRAINT jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.leads ADD CONSTRAINT leads_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.leads ADD CONSTRAINT leads_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES auth.users(id);
ALTER TABLE ONLY public.notification_settings ADD CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payment_plans ADD CONSTRAINT payment_plans_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payment_plans ADD CONSTRAINT payment_plans_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payment_reminders ADD CONSTRAINT payment_reminders_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_payment_plan_id_fkey FOREIGN KEY (payment_plan_id) REFERENCES public.payment_plans(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.quote_templates ADD CONSTRAINT quote_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.quotes ADD CONSTRAINT quotes_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.quotes ADD CONSTRAINT quotes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.quotes ADD CONSTRAINT quotes_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.resources ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.team_members ADD CONSTRAINT team_members_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.time_entries ADD CONSTRAINT time_entries_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.time_entries ADD CONSTRAINT time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE ONLY public.user_preferences ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============ INDEXES ============
CREATE INDEX idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX idx_client_galleries_gallery_links ON public.client_galleries USING gin (gallery_links);
CREATE INDEX idx_client_galleries_job_id ON public.client_galleries (job_id);
CREATE INDEX idx_client_galleries_share_token ON public.client_galleries (share_token);
CREATE INDEX idx_clients_email ON public.clients (email);
CREATE INDEX idx_clients_tags ON public.clients USING gin (tags);
CREATE INDEX idx_contracts_signature_token ON public.contracts (signature_token);
CREATE INDEX idx_contracts_signature_type ON public.contracts (signature_type);
CREATE INDEX idx_deliverables_external_platform ON public.deliverables (external_platform);
CREATE INDEX idx_deliverables_version ON public.deliverables (version);
CREATE INDEX idx_gallery_photos_gallery_id ON public.gallery_photos (gallery_id);
CREATE INDEX idx_improvement_suggestions_created_at ON public.improvement_suggestions (created_at DESC);
CREATE INDEX idx_improvement_suggestions_status ON public.improvement_suggestions (status);
CREATE INDEX idx_improvement_suggestions_user_id ON public.improvement_suggestions (user_id);
CREATE INDEX idx_invoices_client_id ON public.invoices (client_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices (invoice_number);
CREATE INDEX idx_invoices_issue_date ON public.invoices (issue_date);
CREATE INDEX idx_invoices_status ON public.invoices (status);
CREATE INDEX idx_invoices_user_id ON public.invoices (user_id);
CREATE INDEX idx_job_resources_job ON public.job_resources (job_id);
CREATE INDEX idx_job_resources_resource ON public.job_resources (resource_id);
CREATE INDEX idx_job_team_members_job ON public.job_team_members (job_id);
CREATE INDEX idx_job_team_members_team_member_id ON public.job_team_members (team_member_id);
CREATE INDEX idx_job_team_members_user ON public.job_team_members (user_id);
CREATE INDEX idx_jobs_client_id ON public.jobs (client_id);
CREATE INDEX idx_jobs_start_datetime ON public.jobs (start_datetime);
CREATE INDEX idx_jobs_status ON public.jobs (status);
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_notifications_duplicate_check ON public.notifications (recipient_id, type, read, created_at) WHERE (read = false);
CREATE INDEX idx_notifications_priority ON public.notifications (priority, created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications (read);
CREATE INDEX idx_notifications_recipient ON public.notifications (recipient_id);
CREATE INDEX idx_notifications_recipient_created ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX idx_notifications_recipient_read ON public.notifications (recipient_id, read);
CREATE INDEX idx_notifications_type ON public.notifications (type);
CREATE INDEX idx_payment_plans_job_id ON public.payment_plans (job_id);
CREATE INDEX idx_payment_plans_quote_id ON public.payment_plans (quote_id);
CREATE INDEX idx_payments_client_id ON public.payments (client_id);
CREATE INDEX idx_payments_invoice_id ON public.payments (invoice_id);
CREATE INDEX idx_payments_payment_plan_id ON public.payments (payment_plan_id);
CREATE INDEX idx_profiles_created_at ON public.profiles (created_at);
CREATE INDEX idx_profiles_is_suspended ON public.profiles (is_suspended);
CREATE INDEX idx_profiles_subscription_end_date ON public.profiles (subscription_end_date);
CREATE INDEX idx_profiles_subscription_start_date ON public.profiles (subscription_start_date);
CREATE INDEX idx_quotes_client_id ON public.quotes (client_id);
CREATE INDEX idx_quotes_review_token ON public.quotes (review_token) WHERE (review_token IS NOT NULL);
CREATE INDEX idx_team_members_archived ON public.team_members (archived);
CREATE INDEX idx_team_members_type ON public.team_members (type);
CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);

-- ============ TRIGGERS ============
CREATE TRIGGER audit_clients AFTER INSERT OR DELETE OR UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.log_audit();
CREATE TRIGGER audit_contracts AFTER INSERT OR DELETE OR UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.log_audit();
CREATE TRIGGER audit_jobs AFTER INSERT OR DELETE OR UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.log_audit();
CREATE TRIGGER audit_leads AFTER INSERT OR DELETE OR UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.log_audit();
CREATE TRIGGER audit_payments AFTER INSERT OR DELETE OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.log_audit();
CREATE TRIGGER audit_quotes AFTER INSERT OR DELETE OR UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.log_audit();
CREATE TRIGGER audit_resources AFTER INSERT OR DELETE OR UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.log_audit();
CREATE TRIGGER check_resource_booking_conflict BEFORE INSERT OR UPDATE ON public.job_resources FOR EACH ROW EXECUTE FUNCTION public.check_resource_availability();
CREATE TRIGGER log_invoice_changes AFTER INSERT OR DELETE OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.log_audit();
CREATE TRIGGER set_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.handle_notifications_updated_at();
CREATE TRIGGER trigger_send_notification_email AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.send_notification_email_trigger();
CREATE TRIGGER trigger_sync_payment_to_invoice_and_quote AFTER INSERT OR UPDATE OF amount, status, invoice_id, quote_id ON public.payments FOR EACH ROW EXECUTE FUNCTION public.sync_payment_to_invoice_and_quote();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON public.calendar_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON public.checklist_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_galleries_updated_at BEFORE UPDATE ON public.client_galleries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON public.contract_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_improvement_suggestions_updated_at BEFORE UPDATE ON public.improvement_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_plans_updated_at BEFORE UPDATE ON public.payment_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quote_templates_updated_at BEFORE UPDATE ON public.quote_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ POLICIES ============
CREATE POLICY "Admins can add new admins" ON public.admin_users FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow first admin creation" ON public.admin_users FOR INSERT TO authenticated WITH CHECK (NOT EXISTS (SELECT 1 FROM public.admin_users a));
CREATE POLICY "Only admins can view admin users" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Users can view their own business settings" ON public.business_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own business settings" ON public.business_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business settings" ON public.business_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners and admins can delete business settings" ON public.business_settings FOR DELETE USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Users can view their own calendar integrations" ON public.calendar_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calendar integrations" ON public.calendar_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar integrations" ON public.calendar_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar integrations" ON public.calendar_integrations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own checklist templates" ON public.checklist_templates FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own checklist templates" ON public.checklist_templates FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own checklist templates" ON public.checklist_templates FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own checklist templates" ON public.checklist_templates FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Admins can view all checklist templates" ON public.checklist_templates FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own checklists" ON public.checklists FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert checklists for own jobs" ON public.checklists FOR INSERT TO authenticated WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can update own checklists" ON public.checklists FOR UPDATE TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())) WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can delete own checklists" ON public.checklists FOR DELETE USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can view own galleries" ON public.client_galleries FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert galleries for own jobs" ON public.client_galleries FOR INSERT TO authenticated WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can update own galleries" ON public.client_galleries FOR UPDATE TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())) WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Owners and admins can delete galleries" ON public.client_galleries FOR DELETE USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Public can view galleries with valid share token" ON public.client_galleries FOR SELECT TO authenticated, anon USING (share_token IS NOT NULL AND status = 'active' AND (expiration_date IS NULL OR expiration_date > now()));
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Admins can view all clients" ON public.clients FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own contract templates" ON public.contract_templates FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own contract templates" ON public.contract_templates FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own contract templates" ON public.contract_templates FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own contract templates" ON public.contract_templates FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Admins can view all contract templates" ON public.contract_templates FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own contracts" ON public.contracts FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert contracts for own clients" ON public.contracts FOR INSERT TO authenticated WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));
CREATE POLICY "Users can update own contracts" ON public.contracts FOR UPDATE TO authenticated USING (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid())) WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));
CREATE POLICY "Users can delete contracts for own clients" ON public.contracts FOR DELETE USING (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));
CREATE POLICY "Admins can view all contracts" ON public.contracts FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Public can view contracts by signature token" ON public.contracts FOR SELECT TO anon USING (signature_token IS NOT NULL AND status IN ('draft','sent') AND length(signature_token) = 64);
CREATE POLICY "Public can sign contracts by signature token" ON public.contracts FOR UPDATE TO anon USING (signature_token IS NOT NULL AND status IN ('draft','sent')) WITH CHECK (status = 'signed' AND signature_url IS NOT NULL AND signed_at IS NOT NULL);
CREATE POLICY "Users can view own deliverables" ON public.deliverables FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert deliverables for own jobs" ON public.deliverables FOR INSERT TO authenticated WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can update own deliverables" ON public.deliverables FOR UPDATE TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())) WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Owners and admins can delete deliverables" ON public.deliverables FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Users can view own gallery photos" ON public.gallery_photos FOR SELECT TO authenticated USING (gallery_id IN (SELECT id FROM public.client_galleries WHERE job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())));
CREATE POLICY "Users can insert gallery photos for own galleries" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (gallery_id IN (SELECT id FROM public.client_galleries WHERE job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())));
CREATE POLICY "Users can update own gallery photos" ON public.gallery_photos FOR UPDATE TO authenticated USING (gallery_id IN (SELECT id FROM public.client_galleries WHERE job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()))) WITH CHECK (gallery_id IN (SELECT id FROM public.client_galleries WHERE job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())));
CREATE POLICY "Owners and admins can delete gallery photos" ON public.gallery_photos FOR DELETE USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Public can view photos from valid galleries" ON public.gallery_photos FOR SELECT TO authenticated, anon USING (gallery_id IN (SELECT id FROM public.client_galleries WHERE share_token IS NOT NULL AND status = 'active' AND (expiration_date IS NULL OR expiration_date > now())));
CREATE POLICY "Public can update photo selection with valid gallery" ON public.gallery_photos FOR UPDATE TO authenticated, anon USING (gallery_id IN (SELECT id FROM public.client_galleries WHERE share_token IS NOT NULL AND status = 'active' AND allow_selection = true)) WITH CHECK (client_selected IS NOT NULL);
CREATE POLICY "Users can create their own suggestions" ON public.improvement_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suggestions" ON public.improvement_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all suggestions" ON public.improvement_suggestions FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update any suggestion" ON public.improvement_suggestions FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete any suggestion" ON public.improvement_suggestions FOR DELETE USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Owners and admins can delete invoices" ON public.invoices FOR DELETE USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Admins can view all invoices" ON public.invoices FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own job resources" ON public.job_resources FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert job resources for own jobs" ON public.job_resources FOR INSERT TO authenticated WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can update own job resources" ON public.job_resources FOR UPDATE TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())) WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Owners and admins can delete job resources" ON public.job_resources FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Users can view own job team members" ON public.job_team_members FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert job team members for own jobs" ON public.job_team_members FOR INSERT TO authenticated WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can update own job team members" ON public.job_team_members FOR UPDATE TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid())) WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can delete job team members from own jobs" ON public.job_team_members FOR DELETE USING (job_id IN (SELECT id FROM public.jobs WHERE created_by = auth.uid()));
CREATE POLICY "Users can view own jobs" ON public.jobs FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own jobs" ON public.jobs FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own jobs" ON public.jobs FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Admins can view all jobs" ON public.jobs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert leads for own clients" ON public.leads FOR INSERT TO authenticated WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE TO authenticated USING (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid())) WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));
CREATE POLICY "Owners and admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view their own notification settings" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification settings" ON public.notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification settings" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can insert notifications for themselves" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = recipient_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Users can view own payment plans" ON public.payment_plans FOR SELECT TO authenticated USING (quote_id IN (SELECT id FROM public.quotes WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert payment plans for own quotes" ON public.payment_plans FOR INSERT TO authenticated WITH CHECK (quote_id IN (SELECT id FROM public.quotes WHERE created_by = auth.uid()));
CREATE POLICY "Users can update own payment plans" ON public.payment_plans FOR UPDATE TO authenticated USING (quote_id IN (SELECT id FROM public.quotes WHERE created_by = auth.uid())) WITH CHECK (quote_id IN (SELECT id FROM public.quotes WHERE created_by = auth.uid()));
CREATE POLICY "Owners and admins can delete payment plans" ON public.payment_plans FOR DELETE USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Users can view own payment reminders" ON public.payment_reminders FOR SELECT TO authenticated USING (payment_id IN (SELECT id FROM public.payments WHERE created_by = auth.uid()));
CREATE POLICY "Users can insert payment reminders for own payments" ON public.payment_reminders FOR INSERT TO authenticated WITH CHECK (payment_id IN (SELECT id FROM public.payments WHERE created_by = auth.uid()));
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own payments" ON public.payments FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own payments" ON public.payments FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own quote templates" ON public.quote_templates FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own quote templates" ON public.quote_templates FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own quote templates" ON public.quote_templates FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own quote templates" ON public.quote_templates FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Admins can view all quote templates" ON public.quote_templates FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own quotes" ON public.quotes FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own quotes" ON public.quotes FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own quotes" ON public.quotes FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own quotes" ON public.quotes FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Admins can view all quotes" ON public.quotes FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Public can view quotes by review token" ON public.quotes FOR SELECT TO authenticated, anon USING (review_token IS NOT NULL AND status IN ('sent','accepted','rejected'));
CREATE POLICY "Public can update quote status with valid token" ON public.quotes FOR UPDATE TO authenticated, anon USING (review_token IS NOT NULL AND status = 'sent') WITH CHECK (status IN ('accepted','rejected') AND review_token IS NOT NULL);
CREATE POLICY "Users can view own resources" ON public.resources FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own resources" ON public.resources FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Owners and admins can delete resources" ON public.resources FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Admins can view all resources" ON public.resources FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own team members" ON public.team_members FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can insert own team members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own team members" ON public.team_members FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own team members" ON public.team_members FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Admins can view all team members" ON public.team_members FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own time entries" ON public.time_entries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own time entries" ON public.time_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own time entries" ON public.time_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners and admins can delete time entries" ON public.time_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'owner'::public.app_role) OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(),'owner'::public.app_role));