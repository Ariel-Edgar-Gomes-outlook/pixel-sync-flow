-- Fix audit logs RLS policy - restrict to admin-only access
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_logs;

CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add search_path to existing security definer functions
CREATE OR REPLACE FUNCTION public.create_system_notification(_recipient_id uuid, _type text, _payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _notification_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _recipient_id) THEN
    RAISE EXCEPTION 'Invalid recipient_id';
  END IF;
  
  INSERT INTO public.notifications (recipient_id, type, payload, delivered, read)
  VALUES (_recipient_id, _type, _payload, false, false)
  RETURNING id INTO _notification_id;
  
  RETURN _notification_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_notification_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.notification_settings (
    user_id,
    job_reminders,
    lead_follow_up,
    payment_overdue,
    maintenance_reminder,
    new_lead,
    job_completed
  )
  VALUES (
    NEW.id,
    true,
    true,
    true,
    true,
    false,
    false
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_notifications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_id_val uuid;
BEGIN
  user_id_val := auth.uid();
  
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, previous_data)
    VALUES (user_id_val, TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, previous_data, new_data)
    VALUES (user_id_val, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, new_data)
    VALUES (user_id_val, TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_payment_to_invoice_and_quote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_invoice_total numeric;
  v_total_paid numeric;
  v_invoice_id uuid;
  v_quote_id uuid;
BEGIN
  v_invoice_id := NEW.invoice_id;
  v_quote_id := NEW.quote_id;
  
  IF v_invoice_id IS NULL AND v_quote_id IS NOT NULL THEN
    SELECT id INTO v_invoice_id 
    FROM invoices 
    WHERE quote_id = v_quote_id 
    LIMIT 1;
  END IF;
  
  IF v_invoice_id IS NOT NULL THEN
    SELECT 
      COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM payments
    WHERE invoice_id = v_invoice_id 
      AND status = 'paid';
    
    SELECT total INTO v_invoice_total
    FROM invoices
    WHERE id = v_invoice_id;
    
    IF v_total_paid >= v_invoice_total THEN
      UPDATE invoices
      SET 
        amount_paid = v_total_paid,
        status = 'paid',
        paid_date = NOW(),
        updated_at = NOW()
      WHERE id = v_invoice_id;
    ELSIF v_total_paid > 0 THEN
      UPDATE invoices
      SET 
        amount_paid = v_total_paid,
        status = 'partial',
        updated_at = NOW()
      WHERE id = v_invoice_id;
    ELSE
      UPDATE invoices
      SET 
        amount_paid = 0,
        status = 'issued',
        paid_date = NULL,
        updated_at = NOW()
      WHERE id = v_invoice_id;
    END IF;
  END IF;
  
  IF v_quote_id IS NOT NULL THEN
    DECLARE
      v_quote_total numeric;
      v_quote_paid numeric;
    BEGIN
      SELECT 
        COALESCE(SUM(amount), 0) INTO v_quote_paid
      FROM payments
      WHERE quote_id = v_quote_id 
        AND status = 'paid';
      
      SELECT total INTO v_quote_total
      FROM quotes
      WHERE id = v_quote_id;
      
      IF v_quote_paid >= v_quote_total THEN
        UPDATE quotes
        SET 
          status = 'accepted',
          accepted_at = NOW(),
          updated_at = NOW()
        WHERE id = v_quote_id
          AND status != 'accepted';
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.profiles (
        user_id, 
        name, 
        email,
        subscription_start_date,
        subscription_end_date
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        now(),
        now() + interval '3 days'
    );
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_resource_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.job_resources
        WHERE resource_id = NEW.resource_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (
            (NEW.reserved_from, NEW.reserved_until) OVERLAPS (reserved_from, reserved_until)
        )
    ) THEN
        RAISE EXCEPTION 'Resource is already booked for the selected time period';
    END IF;
    RETURN NEW;
END;
$function$;

-- Add database constraint for map embed URLs (drop first if exists)
DO $$ 
BEGIN
  ALTER TABLE jobs DROP CONSTRAINT IF EXISTS valid_map_embed;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE jobs 
ADD CONSTRAINT valid_map_embed 
CHECK (
  location_map_embed IS NULL OR
  location_map_embed LIKE 'https://maps.google.com%' OR
  location_map_embed LIKE 'https://www.google.com/maps%' OR
  location_map_embed LIKE 'https://maps.googleapis.com%'
);