-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to automatically send email notification
CREATE OR REPLACE FUNCTION public.send_notification_email_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    -- Get Supabase URL and service role key from environment
    v_supabase_url := 'https://vcrsuvzsqivcamzlvluz.supabase.co';
    v_service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- If service role key is not set, use a placeholder (edge function will handle auth)
    IF v_service_role_key IS NULL OR v_service_role_key = '' THEN
      v_service_role_key := 'placeholder';
    END IF;
    
    -- Make async HTTP request to send-notification-email edge function
    -- Using pg_net for async execution (won't block the notification insert)
    SELECT net.http_post(
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
    
    -- Log the request (optional, for debugging)
    RAISE NOTICE 'Email notification queued for user % (request_id: %)', NEW.recipient_id, v_request_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the notification insert
    RAISE WARNING 'Failed to queue email notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on notifications table
DROP TRIGGER IF EXISTS trigger_send_notification_email ON public.notifications;

CREATE TRIGGER trigger_send_notification_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_notification_email_trigger();

-- Comment explaining the trigger
COMMENT ON TRIGGER trigger_send_notification_email ON public.notifications IS 
  'Automatically sends email notification when a new notification is created';

COMMENT ON FUNCTION public.send_notification_email_trigger() IS 
  'Trigger function that queues an async HTTP request to send notification emails via edge function';