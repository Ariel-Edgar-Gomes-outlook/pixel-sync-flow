-- Fix: Install pg_net extension in the extensions schema instead of public
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Recreate the trigger function (it was dropped by CASCADE)
CREATE OR REPLACE FUNCTION public.send_notification_email_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_profile RECORD;
  v_service_role_key text;
  v_supabase_url text;
  v_request_id bigint;
BEGIN
  -- Get user profile (email and name)
  SELECT email, name INTO v_profile
  FROM public.profiles
  WHERE user_id = NEW.recipient_id;
  
  -- Only proceed if profile exists and has email
  IF v_profile.email IS NOT NULL THEN
    -- Get Supabase URL
    v_supabase_url := 'https://vcrsuvzsqivcamzlvluz.supabase.co';
    v_service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- If service role key is not set, use a placeholder
    IF v_service_role_key IS NULL OR v_service_role_key = '' THEN
      v_service_role_key := 'placeholder';
    END IF;
    
    -- Make async HTTP request to send-notification-email edge function
    SELECT extensions.http_post(
      url := v_supabase_url || '/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'recipientEmail', v_profile.email,
        'recipientName', v_profile.name,
        'notificationType', NEW.type,
        'payload', NEW.payload
      )
    ) INTO v_request_id;
    
    RAISE NOTICE 'Email notification queued for user % (request_id: %)', NEW.recipient_id, v_request_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to queue email notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS trigger_send_notification_email ON public.notifications;

CREATE TRIGGER trigger_send_notification_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_notification_email_trigger();

COMMENT ON TRIGGER trigger_send_notification_email ON public.notifications IS 
  'Automatically sends email notification when a new notification is created';

COMMENT ON FUNCTION public.send_notification_email_trigger() IS 
  'Trigger function that queues an async HTTP request to send notification emails via edge function';